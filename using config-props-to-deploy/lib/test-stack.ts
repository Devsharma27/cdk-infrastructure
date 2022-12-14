import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

export interface StacksetProps extends cdk.StackProps {
  cidr: any;
}

export class TestStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: StacksetProps) {
    super(scope, id, props);

    //  const vpc = new ec2.CfnVPC(this, 'test-vpc',{
      
    //  });

    let Cidrblock= props.cidr;
    for (let Cidr of Cidrblock) {
      new ec2.CfnVPC(this, `test-vpc-cidr-${Cidr}`, {
        cidrBlock: `${Cidr}`,
      });
    }
  }
}
