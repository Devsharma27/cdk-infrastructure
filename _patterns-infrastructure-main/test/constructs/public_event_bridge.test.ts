import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { PublicEventBridge, PublicEventBridgeRoleEnum } from '../../lib/constructs/event_bridge';
import { ConstructIdsEnum } from '../../lib/enums/construct_ids.enum';
import { EventBusNamesEnum } from '../../lib/enums/event_bus_names.enum';
import { RulesEnum } from '../../lib/enums/rules.enum';

function setUp(stack: cdk.Stack) {
    const _publicEventBridge = new PublicEventBridge(stack, ConstructIdsEnum.PUBLIC_EVENT_BRIDGE);
    return _publicEventBridge
}


// Example test case for PublicEventBridge construct
test('Event Bus Created', () => {
    const stack = new cdk.Stack();
    //Create the construct
    const publicEventBridge: PublicEventBridge = setUp(stack);
    
    //check the construct
    expect(publicEventBridge !== null);
    
    //Check resources are created in CFT output
    const template = Template.fromStack(stack);    
    template.hasResource("AWS::Events::EventBus", { "Properties": { "Name" : EventBusNamesEnum.PUBLIC_PUBLISHER }});
    template.hasResource("AWS::Events::EventBus", { "Properties": { "Name" : EventBusNamesEnum.PUBLIC_SUBSCRIBER }});
    template.hasResource("AWS::Events::Rule", { "Properties": { "Name" : RulesEnum.SEND_EVENTS_TO_CENTRAL_EVENT_STORE }});
    template.hasResource("AWS::IAM::Role", { "Properties": { "RoleName" : PublicEventBridgeRoleEnum.ROLE }});
});