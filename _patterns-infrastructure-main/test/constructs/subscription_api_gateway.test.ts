import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { SubscriptionApiGateway, SubscriptionApiGatewayRoleEnum } from '../../lib/constructs/api_gateway/subscription_api_gateway';
import { ConstructIdsEnum } from '../../lib/enums/construct_ids.enum';
import { EventBusNamesEnum } from '../../lib/enums/event_bus_names.enum';
import { ResourceNamesEnum } from '../../lib/enums/resource_names.enum';
import { RulesEnum } from '../../lib/enums/rules.enum';

function setUp(stack: cdk.Stack) {
    const _subscriptionApiGateway = new SubscriptionApiGateway(stack, ConstructIdsEnum.SUBSCRIPTION_API_GATEWAY);
    return _subscriptionApiGateway
}


// Example test case for SubscriptionApiGateway construct
test('Subscription Api gateway Created', () => {
    const stack = new cdk.Stack();
    //Create the construct
    const subscriptionApiGateway: SubscriptionApiGateway = setUp(stack);
    
    //check the construct
    expect(subscriptionApiGateway !== null);
    
    //Check resources are created in CFT output
    const template = Template.fromStack(stack);    
    template.hasResource("AWS::ApiGateway::RestApi", { "Properties": { "Name" : ResourceNamesEnum.SUBSCRIPTION_REST_API }});
    template.hasResource("AWS::IAM::Role", { "Properties": { "RoleName" : SubscriptionApiGatewayRoleEnum.ROLE }});
});
