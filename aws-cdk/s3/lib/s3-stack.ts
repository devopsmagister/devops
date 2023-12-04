import * as iam from 'aws-cdk-lib/aws-iam';
import * as cdk from 'aws-cdk-lib'
import * as kms from 'aws-cdk-lib/aws-kms';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import * as ecr from 'aws-cdk-lib/aws-ecr';

// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class S3BucketStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const s3Bucket = new s3.Bucket(this, 'test-424217468030-exampleBucket', {
      bucketName: 'test-424217468030-example-bucket',
      objectOwnership: s3.ObjectOwnership.BUCKET_OWNER_ENFORCED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryptionKey: new kms.Key(this, 's3BucketKMSKey'),
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const repository = new ecr.Repository(this, 'Repository', {
      repositoryName: 'my-424217468030-ecr',
    });

    // s3Bucket.grantRead(new iam.AccountRootPrincipal());
  }
}