const {GoogleAuth} = require('google-auth-library');
const {STSClient, AssumeRoleWithWebIdentityCommand} = require('@aws-sdk/client-sts');

const RoleSessionName = 'session1';

const stsClient = new STSClient({region: 'eu-west-1'})
const googleAuth = new GoogleAuth();
const gcpClient = await googleAuth.getClient();

exports.module = async function getStsCredentials(audience, roleArn) {
  await gcpClient.fetchIdToken(audience)
    .then(token => {
      const params = { // AssumeRoleWithWebIdentityRequest
        RoleArn: roleArn, // required
        RoleSessionName: RoleSessionName, // required
        WebIdentityToken: token, // required
        DurationSeconds: Number("900"),
      };
      const command = new AssumeRoleWithWebIdentityCommand(params);
      stsClient.send(command)
        .then(data => {
          console.log(data)
        })

    })
    .catch(err => {
      throw err
    })
}
