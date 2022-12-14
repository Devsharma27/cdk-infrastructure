import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';

export interface XprNetworkProps {
  vpccidrBlock: string;
  publicSubnet1: string;
  publicSubnet2: string;
}
// export NetworkConstructProps;
export class XprNetwork extends Construct {
  
  public readonly vpc: ec2.IVpc;
  static publicSubnet1: string;
  static publicSubnet2: string;
  static SecurityGroup: string;
  XprNetwork: any;
  constructor(scope: Construct, id: string, props: XprNetworkProps) {
    super(scope, id);
    
    // Insert the AWS components you wish to integrate
    const env = this.node.tryGetContext('env')

    const vpc = new ec2.CfnVPC(this, 'DmsVpc', {
      cidrBlock: props.vpccidrBlock,
      tags: [{
        key: 'Name',
        value: 'EIE-Migration-'+env+'',
      }],      
    });

    const InternetGateway = new ec2.CfnInternetGateway(this, 'InternetGateway', {});

    const cfnVPCGatewayAttachment = new ec2.CfnVPCGatewayAttachment(this, 'GatewayAttachment', {
      vpcId: vpc.ref,
      internetGatewayId: InternetGateway.ref,
    });

    const publicSubnet1 = new ec2.CfnSubnet(this, 'PublicSubnet1', {
      availabilityZone: 'eu-central-1a',
      cidrBlock: props.publicSubnet1,
      vpcId: vpc.ref,
      mapPublicIpOnLaunch: false,
      tags: [{
        key: 'Name',
        value: 'EIE-publicSubnet1-'+env+'',
      }],  
    });

    const publicSubnet2 = new ec2.CfnSubnet(this, 'PublicSubnet2', {
      availabilityZone: 'eu-central-1b',
      cidrBlock: props.publicSubnet2,
      vpcId: vpc.ref,
      mapPublicIpOnLaunch: false,
      tags: [{
        key: 'Name',
        value: 'EIE-publicSubnet2-'+env+'',
      }], 
    });

    const RouteTable = new ec2.CfnRouteTable(this, 'RouteTable', {
      vpcId: vpc.ref,
      tags: [{
        key: 'Name',
        value: 'EIE-RT-'+env+'',
      }], 
    });

    const Route = new ec2.CfnRoute(this, 'Route', {
      routeTableId: RouteTable.ref,
      gatewayId: InternetGateway.ref,
      destinationCidrBlock: '0.0.0.0/0',

    });

    const SubnetRouteTableAssociation1 = new ec2.CfnSubnetRouteTableAssociation(this, 'SubnetRouteTableAssociation1', {
      routeTableId: RouteTable.ref,
      subnetId: publicSubnet1.ref,
    });

    const SubnetRouteTableAssociation2 = new ec2.CfnSubnetRouteTableAssociation(this, 'SubnetRouteTableAssociation2', {
      routeTableId: RouteTable.ref,
      subnetId: publicSubnet2.ref,
    });


    const SecurityGroup = new ec2.CfnSecurityGroup(this, 'DMSSecurityGroup', {
      groupDescription: 'EIE-SecurityGroup',
      securityGroupIngress: [{
        ipProtocol: 'TCP',
        cidrIp: '0.0.0.0/0',
        fromPort: 3306,
        toPort: 3306,
      }],
      vpcId: vpc.ref,
    });
  }
}