import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';
import * as iam from 'aws-cdk-lib/aws-iam';
import { ISecurityGroup } from 'aws-cdk-lib/aws-ec2';
import { CustomVPC } from './vpc-public';

interface VpcPerivateProps {
  // prifix: string
  cidr: string
}
export class CustomVPCs  extends Construct {
  public readonly vpc: ec2.IVpc;
  static vpc: string;
  securityGroup: ISecurityGroup | undefined;
  constructor(scope: Construct, id: string, props: VpcPerivateProps) {
    super(scope, id);
    // Insert the AWS components you wish to integrate

    const Cvpc = CustomVPC.props

    const vpc = new ec2.Vpc(scope, "CustomVPC", {
      cidr: props.cidr, // the ip address block of the vpc e.g. '172.22.0.0/16'
      enableDnsHostnames: true,
      enableDnsSupport: true,
      subnetConfiguration: [
        {
          name: 'private-subnet-1',
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
          cidrMask: 24,
        }
      ],
    });
    // lets create a security group for the wordpress instance
  const securityGroup = new ec2.SecurityGroup(scope,'sg',{
      vpc: vpc,
      allowAllOutbound: true,
      securityGroupName: 'sg',
  })
  securityGroup.addIngressRule(
      ec2.Peer.ipv4(vpc.vpcCidrBlock),
      ec2.Port.tcp(3306),
      // ec2.Port.tcp(3306),
    )
  }
}