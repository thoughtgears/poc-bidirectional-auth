// Load the AWS SDK for Node.js
const AWS = require('aws-sdk');
const {S3Client, ListBucketsCommand} = require("@aws-sdk/client-s3");
const {GoogleAuth} = require('google-auth-library');

AWS.config.update({region: 'eu-west-1'});

const url = 'aws-trust-1'


async function getIdTokenFromMetadataServer() {
  const googleAuth = new GoogleAuth();
  const client = await googleAuth.getClient();

  await client.fetchIdToken(url).then(
    (token) => {
      console.log("DATA: ", token);
      awssts(token);
    }
  )
}


getIdTokenFromMetadataServer()
  .catch(err => {
    console.error(err)
  })


// // Load STS and configure assume role with web identity

async function awssts(token) {
  const RoleArn = 'arn:aws:iam::858545927766:role/gcp-to-aws-2';
  const RoleSessionName = 'session1';
  const {STSClient, AssumeRoleWithWebIdentityCommand} = require("@aws-sdk/client-sts");
  const client = new STSClient({region: "eu-west-1"})
  const stsparams = { // AssumeRoleWithWebIdentityRequest
    RoleArn: RoleArn, // required
    RoleSessionName: RoleSessionName, // required
    WebIdentityToken: token, // required
    DurationSeconds: Number("900"),
  };

  const command = new AssumeRoleWithWebIdentityCommand(stsparams);

  client.send(command).then(
    (data) => {
      console.log("DATA: ", data)
      process.env.AWS_ACCESS_KEY_ID = data.Credentials.AccessKeyId;
      process.env.AWS_SECRET_ACCESS_KEY = data.Credentials.SecretAccessKey;
      process.env.AWS_SESSION_TOKEN = data.Credentials.SessionToken;
    },
    (error) => {
      console.log("ERROR: ", error)
    }
  ).then(
    () => {
      listS3buckets();
    }
  )

}


async function listS3buckets() {
  const s3client = new S3Client({region: 'eu-west-1'});
  const input = {};
  const command = new ListBucketsCommand(input);
  const s3data = await s3client.send(command)
  console.log("S3 Data: ", s3data);
}