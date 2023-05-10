const auth = require('./lib/auth');

const roleArn = 'arn:aws:iam::858545927766:role/gcp-to-aws-2';

auth.getStsCredentials('sts-trust',roleArn)
.catch(err => {
  console.log(err)
})