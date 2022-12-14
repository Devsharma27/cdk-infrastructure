import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';

interface StackProps {
  // prefix: string
  cidr: string
}

/**
 * Creates a new custom VPC
 *
 * @param  {cdk.Construct} scope stack application scope
 * @param  {StackProps} props props needed to create the resource
 *
 */
export class CustomVPC {
  static props: any;
  vpcCidrBlock(vpcCidrBlock: any): ec2.IPeer {
    throw new Error('Method not implemented.');
  }
  // we export the vpc we just created so other resources can use it
  public readonly vpc: ec2.IVpc

  constructor(scope: Construct, props: StackProps) {
    this.vpc = new ec2.Vpc(scope, 'vpc', {
      maxAzs: 2, // RDS requires at least 2 availability zones
      cidr: props.cidr, // the ip address block of the vpc e.g. '172.22.0.0/16'
      enableDnsHostnames: true,
      enableDnsSupport: true,
      // expensive -- we don't need that yet (we have no PRIVATE subnets)
      natGateways: 0, 
      subnetConfiguration: [
        {
          cidrMask: 22,
          name: 'public',
          subnetType: ec2.SubnetType.PUBLIC, // for WP instance
        }
      ],
    })
  }
}