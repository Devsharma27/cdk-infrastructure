import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dms from 'aws-cdk-lib/aws-dms';
import { XprNetwork } from './Constructs/network';
import {iamRole} from './Constructs/role'


export interface StacksetProps extends cdk.StackProps {
  SourceEndpoint: string;
  SourceEndpointserverName :any;
  SourceEndpointusername :any;
  SourceEndpointpassword :any;
  TargetEndpoint: string;
  tableMappings: string;
  replicationTaskSettings: string;
  vpccidrBlock: string
  publicSubnet1: string
  publicSubnet2: string
}

export class DmsStack extends cdk.Stack {
  
  constructor(scope: Construct, id: string, props: StacksetProps) {
    super(scope, id, props);

    const env = this.node.tryGetContext('env')

    const Xpr = new XprNetwork(this, 'newconstruct', {
      vpccidrBlock: "vpccidrBlock",
      publicSubnet1: "publicSubnet1",
      publicSubnet2: "publicSubnet2",
    });
    new iamRole(this, 'newconstructrole', {});

    const ReplicationSubnetGroup = new dms.CfnReplicationSubnetGroup(this, 'ReplicationSubnetGroup', {
      replicationSubnetGroupDescription: 'To create replicationSubnetGroup',
      subnetIds: [XprNetwork.publicSubnet1, XprNetwork.publicSubnet2 ],
      replicationSubnetGroupIdentifier: 'replicationSubnetGroupIdentifier',
    });
    // ReplicationSubnetGroup.addDependsOn(XprsNetwork.publicSubnet1)

    const ReplicationInstance = new dms.CfnReplicationInstance(this, 'ReplicationInstance', {
      replicationInstanceIdentifier: 'EIE-Migration-'+env+'',
      replicationInstanceClass: 'dms.t3.medium',
      engineVersion: '3.4.7',
      replicationSubnetGroupIdentifier: ReplicationSubnetGroup.replicationSubnetGroupIdentifier,
      vpcSecurityGroupIds: [XprNetwork.SecurityGroup],
    });
    ReplicationInstance.addDependsOn(ReplicationSubnetGroup)

    const SourceEndpoint = new dms.CfnEndpoint(this, 'SourceEndpoint', {
      endpointIdentifier: 'exporo-de-investment-aggregation-'+env+'',
      endpointType: 'source',
      engineName: props.SourceEndpoint,
      serverName: props.SourceEndpointserverName,
      port: 3306,
      username: props.SourceEndpointusername,
      password: props.SourceEndpointpassword,
    });

    const TargetEndpoint = new dms.CfnEndpoint(this, 'TargetEndpoint', {
      endpointIdentifier: 'EIE-PubSub-'+env+'-Investments',
      endpointType: 'target',
      engineName: props.TargetEndpoint,
      dynamoDbSettings: {
        serviceAccessRoleArn: iamRole.Role,
      },
    });

    const ReplicationTask = new dms.CfnReplicationTask(this, 'ReplicationTask', {
      migrationType: 'full-load-and-cdc',
      replicationTaskIdentifier: 'investment-aggregation-'+env+'',
      replicationInstanceArn: ReplicationInstance.ref,
      sourceEndpointArn: SourceEndpoint.ref,
      targetEndpointArn: TargetEndpoint.ref,
      replicationTaskSettings: props.replicationTaskSettings,
      tableMappings: props.tableMappings,
    });
  }
}
