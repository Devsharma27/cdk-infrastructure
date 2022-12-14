import {IEventBus} from "aws-cdk-lib/aws-events";
import {NestedStack} from "aws-cdk-lib";
import {Construct} from "constructs";
import {ConstructIdsEnum} from "../enums/construct_ids.enum";
import {PublicSubscriberTopicRules} from "../constructs/event_bridge/public_subscriber_topic_rules";
import {IRestApi} from "aws-cdk-lib/aws-apigateway";
import {IRole} from "aws-cdk-lib/aws-iam";
import { ISubscriberSpecifications } from "../interfaces/event_bridge_connector_input";

export interface ISubscriberEventBridgeRulesNestedStack {
    nestedStackName: string,
    specifications: ISubscriberSpecifications,
    subscriptionRestApi: IRestApi,
    eventBus: IEventBus,
    role: IRole
}

//TODO:can we use construct instead of a nested stack
export class PublicSubscriberTopicRulesNestedStack extends NestedStack {

    constructor(scope: Construct, props: ISubscriberEventBridgeRulesNestedStack) {
        super(scope, props.nestedStackName);
        new PublicSubscriberTopicRules(this, ConstructIdsEnum.PUBLIC_SUBSCRIBER_TOPIC_RULES, {
            eventBus: props.eventBus,
            subscriptionRestApi: props.subscriptionRestApi,
            subscribers: props.specifications.events,
            role: props.role
        });
    }
}
