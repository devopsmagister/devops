import * as iam from 'aws-cdk-lib/aws-iam';
import * as cdk from 'aws-cdk-lib'
import * as kms from 'aws-cdk-lib/aws-kms';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import {SubnetType} from 'aws-cdk-lib/aws-ec2';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';

// import * as sqs from 'aws-cdk-lib/aws-sqs';
declare const subnet: ec2.Subnet;
declare const subnetFilter: ec2.SubnetFilter;

export class S3BucketStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

   
    // const vpc = ec2.Vpc.fromLookup(this, 'vpc', {
    //   vpcId: 'vpc-0d83f1f286b466198',
    // });
    const vpc = ec2.Vpc.fromLookup(this, 'vpc', { isDefault: true });
    // const privatesubnetIds = ['subnet-056298440706a3ead', 'subnet-0689ab1ff8906f388'];
    // const publicsubnetIds = ['subnet-034d234144fcaf581', 'subnet-004b92d48f9e50ebc'];
    
    const kmskey = kms.Key.fromLookup(this, 's3BucketKMSKey', {
      aliasName: 'alias/own-key',
    })
    // const kmskey = new kms.Key(this, 's3BucketKMSKey', {
    //   removalPolicy: cdk.RemovalPolicy.DESTROY,
    //   alias: "app-kms-key",
    // })

    const s3Bucket = new s3.Bucket(this, 'test-424217468030-exampleBucket', {
      bucketName: 'test-424217468030-example-bucket',
      objectOwnership: s3.ObjectOwnership.BUCKET_OWNER_ENFORCED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryptionKey: kmskey,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const repository = new ecr.Repository(this, 'Repository', {
      repositoryName: 'my-424217468030-ecr',
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

  
    // const myKey = new kms.Key(this, 'MyKey');
    
    //
    const secret = secretsmanager.Secret.fromSecretCompleteArn(this, 'ImportedSecret', 'arn:aws:secretsmanager:us-east-1:946521477696:secret:own-secret-AOoG40');
    // credentials.grantRead(role)



    // const secretName = 'rds-db-secrets'; 
    // const dbSecret = new secretsmanager.Secret(this, 'DBSecret', {
    //   secretName,
    //   generateSecretString: {
    //       secretStringTemplate: JSON.stringify({username: 'postgresadmin'}),
    //       generateStringKey: 'password',
    //       excludePunctuation: true,
    //       excludeCharacters: '"!&*^#@()/',
    //   },
    // });
    // RDS 
    // https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_rds.DatabaseInstanceProps.html

    const rdsSecurityGroup = new ec2.SecurityGroup(this, 'rdsSecurityGroup', { 
      vpc,
      securityGroupName: 'rdsSecurityGroup',
      description: 'rds Security Group'
    });

    rdsSecurityGroup.addIngressRule(ec2.Peer.ipv4('10.0.0.0/8'), ec2.Port.tcp(3306), 'allow ssh access from the world');

    const subnetGroup = new rds.SubnetGroup(this, 'rdsSubnetGroup', {
      description: 'description',
      vpc: vpc,
    
      // the properties below are optional
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      subnetGroupName: 'rdsSubnetGroup',
      vpcSubnets: {
        // availabilityZones: ['availabilityZones'],
        // onePerAz: false,
        // // subnetFilters: [subnetFilter],
        // subnetGroupName: 'subnetGroupName',
        // subnets: [subnet],
        subnetType: ec2.SubnetType.PUBLIC, //https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_ec2.SubnetType.html
      },
    });  

    const engine = rds.DatabaseInstanceEngine.postgres({ version: rds.PostgresEngineVersion.VER_15_2 });

    const rdsParameterGroup = new rds.ParameterGroup(this, 'rdsparametergroup', {
      engine: engine,
      description: "prostgres parameter group",
      parameters: {
        'idle_session_timeout': '301',
      },
    })
    
    new rds.DatabaseInstance(this, 'InstanceWithCustomizedSecret', {
      engine,
      vpc,
      // credentials: rds.Credentials.fromSecret(dbSecret),
      credentials: rds.Credentials.fromSecret(secret),
      // credentials: { username: 'clusteradmin' },
      allocatedStorage: 30,
      maxAllocatedStorage: 100,
      storageEncrypted: true,
      storageEncryptionKey: kmskey,
      allowMajorVersionUpgrade: false,
      databaseName: 'testdb',
      instanceIdentifier: 'postgress-db1',
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MICRO),
      deletionProtection: false,
      securityGroups: [rdsSecurityGroup],
      subnetGroup: subnetGroup,
      parameterGroup: rdsParameterGroup,

    });


    // LoadBalancer

    const lbSecurityGroup = new ec2.SecurityGroup(this, 'lbSecurityGroup', { 
      vpc,
      securityGroupName: 'lbSecurityGroup1',
      description: 'rds Security Group'
    });

    lbSecurityGroup.addIngressRule(ec2.Peer.ipv4('10.0.0.0/8'), ec2.Port.tcp(80), 'all port');


    const lb = new elbv2.ApplicationLoadBalancer(this, 'LB', {
      vpc,
      internetFacing: true,
      deletionProtection: false,
      // idleTimeout: 60,
      loadBalancerName: 'app-lb',
      securityGroup: lbSecurityGroup,
      // vpcSubnets: { privatesubnetIds },

    });
    
    // Add a listener and open up the load balancer's security group
    // to the world.
    const listener = lb.addListener('Listener', {
      port: 80,  
    });
    
    // Create an AutoScaling group and add it as a load balancing
    // target to the listener.
    listener.addTargets('ApplicationFleet', {
      port: 8080,
      targetGroupName: 'app-lb-target',
    });    
  }
}