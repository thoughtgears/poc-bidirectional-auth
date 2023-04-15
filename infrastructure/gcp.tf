locals {
  base_apis = [
    "serviceusage.googleapis.com",
    "cloudresourcemanager.googleapis.com",
    "cloudbilling.googleapis.com",
    "monitoring.googleapis.com",
    "logging.googleapis.com",
    "cloudresourcemanager.googleapis.com",
    "iam.googleapis.com",
    "iamcredentials.googleapis.com",
    "sts.googleapis.com",
    "firestore.googleapis.com"
  ]

  environment = "poc"
  billing_account_id = "01C69B-097628-B53C0B"
  organization_id    = "organizations/535868630468"
  temp_project_id    = "auth-poc-${random_integer.project_id.result}"

  aws_account_id = "496942164652"
  aws_role_arn = "arn:aws:iam::496942164652:role/auth-poc"

  pool_id = "aws-poc"
}

/*******************************************
 Project Creation
 *******************************************/
data "google_active_folder" "this" {
  display_name = local.environment
  parent       = local.organization_id
}

resource "random_integer" "project_id" {
  min = 10000
  max = 50000
}

resource "google_project" "this" {
  name                = local.temp_project_id
  project_id          = local.temp_project_id
  folder_id           = data.google_active_folder.this.id
  billing_account     = local.billing_account_id
  auto_create_network = false
}

resource "google_project_service" "this" {
  for_each = toset(local.base_apis)

  project = google_project.this.id
  service = each.value
}

/*******************************************
  Workload Identity Federation for AWS
 *******************************************/
resource "google_iam_workload_identity_pool" "this" {
  project                   = google_project.this.project_id
  workload_identity_pool_id = local.pool_id
  disabled                  = false

  depends_on = [google_project_service.this]
}

// TODO: Fix aws stuff later on
resource "google_iam_workload_identity_pool_provider" "aws-poc" {
  project                            = google_project.this.project_id
  workload_identity_pool_id          = google_iam_workload_identity_pool.this.workload_identity_pool_id
  workload_identity_pool_provider_id = "${local.pool_id}-provider"
  attribute_mapping                  = {
    "google.subject"        = "assertion.arn"
    "attribute.aws_account" = "assertion.account"
  }

  aws {
    account_id = local.aws_account_id
  }

  depends_on = [google_project_service.this]
}

/*******************************************
  Service account for workload identity
 *******************************************/
resource "google_service_account" "this" {
  project    = google_project.this.project_id
  account_id = "aws-workload-identity"
}

resource "google_service_account_iam_binding" "this" {
  members            = ["principalSet://iam.googleapis.com/${google_iam_workload_identity_pool.this.name}/attribute.aws_role/${local.aws_role_arn}}"]
  role               = "roles/iam.workloadIdentityUser"
  service_account_id = google_service_account.this.id
}

resource "google_project_iam_binding" "this" {
  members = ["serviceAccount:${google_service_account.this.email}"]
  project = google_project.this.project_id
  role    = "roles/datastore.user"
}

/*******************************************
  Create firestore database
 *******************************************/
resource "google_firestore_database" "database" {
  project                     = google_project.this.project_id
  name                        = "(default)"
  location_id                 = "eur3"
  type                        = "FIRESTORE_NATIVE"
  concurrency_mode            = "OPTIMISTIC"
  app_engine_integration_mode = "DISABLED"

  depends_on = [google_project_service.this]
}

resource "google_firestore_document" "doc1" {
  project     = google_project.this.project_id
  collection  = "data-collection"
  document_id = "my-doc-1"
  fields      = "{\"something\":{\"mapValue\":{\"fields\":{\"akey\":{\"stringValue\":\"avalue\"}}}}}"
}