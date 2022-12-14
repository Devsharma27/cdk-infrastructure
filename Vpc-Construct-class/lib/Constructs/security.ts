// import * as ec2 from 'aws-cdk-lib/aws-ec2';
// import { Construct } from 'constructs';

// interface securityGroup {
//   vpc:ec2.IVpc;
//   // prifix: string
//   cidr: string
// }

// export class security  extends Construct {
//   constructor(scope: Construct, id: string, props: securityGroup) {
//     super(scope, id);
//     // Insert the AWS components you wish to integrate

//     // use the vpc we just created
//     const customVPC = props.vpc

//     // lets create a security group for the  instance
//     const securityGroup = new ec2.SecurityGroup(scope,'sg',{
//       vpc: customVPC,
//       allowAllOutbound: true,
//       securityGroupName: 'sg',
//   })
//   securityGroup.addIngressRule(
//       ec2.Peer.ipv4(customVPC.vpcCidrBlock),
//       ec2.Port.tcp(22),
//       // ec2.Port.tcp(3306),
//     )
//   }
// }