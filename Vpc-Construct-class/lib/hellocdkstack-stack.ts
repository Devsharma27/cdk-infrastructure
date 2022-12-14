import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { CustomVPC } from './Constructs/vpc-public';
// import { security } from './Constructs/security';

export class HellocdkstackStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    
    const  customVPC  =  new  CustomVPC(this,  {
      cidr:  '172.22.0.0/16',
  })

    const webserverSG = new ec2.SecurityGroup(this, 'webserver-sg', {
    vpc: customVPC.vpc,
    allowAllOutbound: true,
    });

    webserverSG.addIngressRule(
    ec2.Peer.anyIpv4(),
    ec2.Port.tcp(22),
    'allow SSH access from anywhere',
    );
  
    const instance = new ec2.Instance(this, 'simple-instance-1', {
      vpc: customVPC.vpc,
      vpcSubnets:  {
        subnetType: ec2.SubnetType.PUBLIC,
      },
      securityGroup: webserverSG,
      instanceName: 'simple-instance-1',
      instanceType: ec2.InstanceType.of( // t2.micro has free tier usage in aws
        ec2.InstanceClass.T2,
        ec2.InstanceSize.MICRO
      ),
      machineImage: ec2.MachineImage.latestAmazonLinux({
        generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
      }),

      keyName: 'dev', // we will create this in the console before we deploy
    })
  }
}