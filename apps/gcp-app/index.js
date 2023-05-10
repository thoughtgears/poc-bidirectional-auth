const auth = require('./lib/auth');

const roleArn = process.env.ROLE_ARN;

auth.getStsCredentials('sts-trust',roleArn)
.catch(err => {
  console.log(err)
})