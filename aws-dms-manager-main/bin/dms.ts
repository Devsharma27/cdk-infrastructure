#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { DmsStack,StacksetProps } from '../lib/dms-stack';
import { replicationTaskSettings } from '../lib/replication'
import {stageConfig} from '../lib/Config/stageconfig'
import { devConfig } from '../lib/Config/devconfig';
import { prodConfig } from '../lib/Config/prodconfig';

const app = new cdk.App();


const env = app.node.tryGetContext('env')

var config = devConfig;
if (env == 'dev') {
  config = devConfig
}else if (env == 'stage') {
  config = stageConfig
}
else if (env == 'prod') {
  config = prodConfig
}

const props: StacksetProps = {

  vpccidrBlock: config.vpccidrBlock,
  publicSubnet1: config.publicSubnet1,
  publicSubnet2: config.publicSubnet2,
  SourceEndpoint: config.SourceEndpoint,
  SourceEndpointserverName : config.SourceEndpointserverName ,
  SourceEndpointusername : config.SourceEndpointusername,
  SourceEndpointpassword : config.SourceEndpointpassword,
  TargetEndpoint: config.TargetEndpoint,
  tableMappings: config.tableMappings,
  replicationTaskSettings: replicationTaskSettings

}


new DmsStack(app, 'Dms-Stack-'+env+'', props);