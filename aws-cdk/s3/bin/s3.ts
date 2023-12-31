// #!/usr/bin/env node
// import 'source-map-support/register';
// import * as cdk from 'aws-cdk-lib';
// import * as S3 from 'aws-cdk-lib/aws_s3';
// import { S3Stack } from '../lib/s3-stack';

// const app = new cdk.App();

// const stack = new S3.Stack(this, 'chiranjit-demo-testS3Stack');
    
// new S3Stack(app, 'S3Stack', {
  
//   /* If you don't specify 'env', this stack will be environment-agnostic.
//    * Account/Region-dependent features and context lookups will not work,
//    * but a single synthesized template can be deployed anywhere. */

//   /* Uncomment the next line to specialize this stack for the AWS Account
//    * and Region that are implied by the current CLI configuration. */
//   // env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },

//   /* Uncomment the next line if you know exactly what Account and Region you
//    * want to deploy the stack to. */
//   // env: { account: '123456789012', region: 'us-east-1' },

//   /* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */
// });

import * as cdk from 'aws-cdk-lib';

import { S3BucketStack } from '../lib/s3-stack';
const envUS  = {account: '946521477696', region: 'us-east-1' };
const app = new cdk.App();
new S3BucketStack(app, 'S3BucketStack',  { env: envUS });
app.synth();