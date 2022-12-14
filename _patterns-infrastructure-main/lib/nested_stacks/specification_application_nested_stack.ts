import { NestedStack, NestedStackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { PublicEvents2BindedSubscribersRule } from "../constructs/event_bridge/public_events_2_binded_subscribers_rule";
import { PublicEventBridge } from "../constructs/event_bridge/public_event_bridge";
import { PublicSubscriberTopicRulesNestedStack } from "./public_subscriber_topic_rules_nested_stack";
import { SubscriptionApiGateway } from "../constructs/api_gateway/subscription_api_gateway";
import { CfnEventBusPolicy, IEventBus } from "aws-cdk-lib/aws-events";
import { IEventBridgeBinding } from "@exporo/specifications-events/dist/interfaces/configs";
import { IPublisherSpecifications, ISubscriberSpecifications } from "../interfaces/event_bridge_connector_input";

export enum PolicyStatementIdsEnum {
  PUBLIC_SUBSCRIBER_ALLOW_RECEIVING_EVENTS = "public_subscriber_allow_receiving_events",
}

export enum EventBridgeActionEnum {
  PUT_EVENTS = "events:PutEvents"
}

export enum SpecificationApplicationNestedStackEnum {
  CONSTRUCT_ID = "specification_application_nested_stack",
  SUBSCRIBER_NESTED_STACK_NAME = "SubscriberAccountsEventBridgeRulesNestedStack",
  PUBLIC_EVENTS_2_BINDED_SUBSCRIBERS_RULE_CONSTRUCT_ID = "PublicEvents2BindedSubscribersRule",
  PUBLIC_EVENTS_FROM_BINDED_PUBLISHERS_RULE_CONSTRUCT_ID = "PublicEventsFromBindedPublishersRule",
}

export interface SpecificationApplicationNestedStackProps extends NestedStackProps {
  specifications: {
    publishers: IPublisherSpecifications,
    subscribers: ISubscriberSpecifications
  },
  eventBus: {
    publisher: IEventBus,
    subscriber: IEventBus
  }

}

export class SpecificationApplicationNestedStack extends NestedStack {
  constructor(scope: Construct, id: string, props: SpecificationApplicationNestedStackProps) {
    super(scope, id, props);

    //Rule targeting the subscriber eventbus in another account
    new PublicEvents2BindedSubscribersRule(this,
      SpecificationApplicationNestedStackEnum.PUBLIC_EVENTS_2_BINDED_SUBSCRIBERS_RULE_CONSTRUCT_ID, {
        specifications: props.specifications.publishers,
        eventBus: props.eventBus.publisher
      });

    //This line is commented out as PublicEventBridgeRole is not relevant for API gateway  
    //const _role = PublicEventBridge.roleFromArn(this); 

    //This line creates/retrieves an API Gateway role
    const _role = SubscriptionApiGateway.getRoleFromArn(this);

    this._allowSendingPublicEventsFromBindedPublisher(props.specifications.subscribers.serverBindings);

    //@TODO fix limit exceed so Construct can be used, not a nested stack
    new PublicSubscriberTopicRulesNestedStack(this, {
      eventBus: props.eventBus.subscriber,
      subscriptionRestApi: SubscriptionApiGateway.restApiFromArn(this),
      role: _role,
      nestedStackName: SpecificationApplicationNestedStackEnum.SUBSCRIBER_NESTED_STACK_NAME,
      specifications: props.specifications.subscribers
    });
  }

  private _allowSendingPublicEventsFromBindedPublisher(serverBindings: IEventBridgeBinding[]): void {
    const _accountIds: string[] = serverBindings
      .map((binding) => binding.accountId);

    _accountIds.map((_accountId: string, _index) => {
      new CfnEventBusPolicy(this, `${PolicyStatementIdsEnum.PUBLIC_SUBSCRIBER_ALLOW_RECEIVING_EVENTS}-${_index}`, {
          statementId: `${PolicyStatementIdsEnum.PUBLIC_SUBSCRIBER_ALLOW_RECEIVING_EVENTS}-${_index}`,
          action: EventBridgeActionEnum.PUT_EVENTS,
          eventBusName: "PublicSubscriberEventBus",
          principal: _accountId
        });

    });
  }


}
