import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { SubscriptionApiGateway, SubscriptionApiGatewayRoleEnum } from '../../lib/constructs/api_gateway/subscription_api_gateway';
import { PublicEventBridge, PublicEventBridgeRoleEnum } from '../../lib/constructs/event_bridge';
import * as spec_app_nested_stack from '../../lib/nested_stacks/specification_application_nested_stack';
import { ConstructIdsEnum } from '../../lib/enums/construct_ids.enum';
import { EventBusNamesEnum } from '../../lib/enums/event_bus_names.enum';
import { ResourceNamesEnum } from '../../lib/enums/resource_names.enum';
import { RulesEnum } from '../../lib/enums/rules.enum';
import * as DomainPublicApi from "@exporo/specifications-events/dist/app_domains/digital_depot";

export enum SpecificationAccountsDevOpsStackEnum {
    CONSTRUCT_ID = 'specification_application_nested_stack'
}

function setUpEventBridge(stack: cdk.Stack) {
}

function setUpApiGateway(stack: cdk.Stack) {
    const _subscriptionApiGateway = new SubscriptionApiGateway(stack, ConstructIdsEnum.SUBSCRIPTION_API_GATEWAY);
    return _subscriptionApiGateway
}

function setUp(stack: cdk.Stack) {
    const _publicEventBridge = new PublicEventBridge(stack, ConstructIdsEnum.PUBLIC_EVENT_BRIDGE);
    const publisherEventBus = _publicEventBridge.getPublicPublisherEventBus()
    const subscriberEventBus = _publicEventBridge.getPublicSubscriberEventBus()
    const specAppNestedStack = new spec_app_nested_stack.SpecificationApplicationNestedStack(stack,SpecificationAccountsDevOpsStackEnum.CONSTRUCT_ID, {
        eventBus: {
            publisher: publisherEventBus,
            subscriber: subscriberEventBus
        },
        specifications: {
            subscribers: {
                sources: [DomainPublicApi.Accounts.SOURCE],
                events: Object.values(DomainPublicApi.Accounts.subscribers),
                serverBindings: DomainPublicApi.CONFIG.SERVER_BINDINGS.getBinding().subscriber,
            },
            publishers: {
                sources: [DomainPublicApi.Accounts.SOURCE],
                events: Object.values(DomainPublicApi.Accounts.publishers),
                serverBindings: DomainPublicApi.CONFIG.SERVER_BINDINGS.getBinding().publisher,
            }
        }
    });
    return specAppNestedStack
}

// Example test case for specification app nested stack construct
test('Nested stack Created', () => {
    const stack = new cdk.Stack();
    //Create the construct
    const specAppNestedStack = setUp(stack)
    
    //check the construct
    expect(specAppNestedStack !== null);
    
    //Check resources are created in CFT output
    const template = Template.fromStack(stack);    
    template.hasResource("AWS::Events::EventBus", { "Properties": { "Name" : EventBusNamesEnum.PUBLIC_PUBLISHER }});
    template.hasResource("AWS::Events::EventBus", { "Properties": { "Name" : EventBusNamesEnum.PUBLIC_SUBSCRIBER }});
    template.hasResource("AWS::Events::Rule", { "Properties": { "Name" : RulesEnum.SEND_EVENTS_TO_CENTRAL_EVENT_STORE }});
    template.hasResource("AWS::IAM::Role", { "Properties": { "RoleName" : PublicEventBridgeRoleEnum.ROLE }});
    template.hasResource("AWS::ApiGateway::RestApi", { "Properties": { "Name" : ResourceNamesEnum.SUBSCRIPTION_REST_API }});
    template.hasResource("AWS::IAM::Role", { "Properties": { "RoleName" : SubscriptionApiGatewayRoleEnum.ROLE }});
    
});
