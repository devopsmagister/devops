import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';

class MyAlbStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Specify subnet IDs where you want to deploy the ALB
    const subnetIds = ['subnet-xxxxxxxxxxxxxxxxx', 'subnet-yyyyyyyyyyyyyyyyy'];

    // Create the ALB
    const alb = new elbv2.ApplicationLoadBalancer(this, 'MyAlb', {
      internetFacing: true, // Set to true for a publicly accessible ALB
      vpcSubnets: { subnetIds }, // Pass the specified subnet IDs
    });

    // Output the DNS name of the ALB
    new cdk.CfnOutput(this, 'AlbDnsName', {
      value: alb.loadBalancerDnsName,
      description: 'The DNS name of the ALB',
    });
  }
}

const app = new cdk.App();
new MyAlbStack(app, 'MyAlbStack');
