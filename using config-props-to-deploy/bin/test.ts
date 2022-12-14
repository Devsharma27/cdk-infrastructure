#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { TestStack, StacksetProps } from '../lib/test-stack';
import { devConfig } from '../lib/Config/devconfig';


const app = new cdk.App();

const props: StacksetProps = {

  cidr: devConfig.cidr,

}
new TestStack(app, 'TestStack', props );