Worked with compute engine -> s3 bucket.

It required the AZP property as a audience and that was the ID of the SA in GCP
`curl -H "Metadata-Flavor: Google" 'http://metadata/computeMetadata/v1/instance/service-accounts/default/identity?audience=aws-trust-1&format=full'`