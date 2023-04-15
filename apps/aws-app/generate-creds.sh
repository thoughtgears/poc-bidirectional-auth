#!/usr/bin/env bash

set -e

export PROJECT_ID=`gcloud config get-value core/project`
export PROJECT_NUMBER=`gcloud projects describe $PROJECT_ID --format='value(projectNumber)'`

gcloud beta iam workload-identity-pools create-cred-config \
    projects/$PROJECT_NUMBER/locations/global/workloadIdentityPools/aws-to-gcp/providers/staging-pool \
    --service-account=aws-federated@$PROJECT_ID.iam.gserviceaccount.com \
    --output-file=sts-creds.json \
    --aws