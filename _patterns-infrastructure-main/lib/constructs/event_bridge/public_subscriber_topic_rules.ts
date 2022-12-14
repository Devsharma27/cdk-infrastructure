import { Construct } from "constructs";
import { SubscriberEvent } from "@exporo/specifications-events/dist/parser/shared/event_connectors";
import { IEventBus, Rule, RuleProps } from "aws-cdk-lib/aws-events";
import * as config from "../../functions/config";
import { IRestApi, RestApi } from "aws-cdk-lib/aws-apigateway";
import { IRole } from "aws-cdk-lib/aws-iam";
import { StagesEnum } from "@exporo/specifications-events/dist/enums/stages";
import { ApiGateway, CloudWatchLogGroup } from "aws-cdk-lib/aws-events-targets";
import { LogGroup } from "../cloud_watch/log_group";
import { ResourceNamesEnum } from "../../enums/resource_names.enum";
import { EventBusNamesEnum } from "../../enums/event_bus_names.enum";

interface PublicSubscriberTopicRuleProps extends RuleProps {
    subscriber: SubscriberEvent<any, any>,
    eventBus: IEventBus,
    eventBusName: string,
    subscriptionRestApi: IRestApi,
    stage: StagesEnum,
    role: IRole,
    fLogGroup?: boolean
}

class PublicSubscriberTopicRule extends Rule {

    constructor(scope: Construct, id: string, props: PublicSubscriberTopicRuleProps) {
        const _ruleName = `${props.eventBusName}_${props.subscriber.options.name}`;
        super(scope, _ruleName, {
            eventBus: props.eventBus,
            ruleName: _ruleName,
            eventPattern: {
                detail: {
                    "_topic": props.subscriber.options.rulePattern
                }
            },
            enabled: true
        });
        this.addTarget(new ApiGateway(props.subscriptionRestApi as RestApi, {
            path: `/${props.subscriber.options.name}`,
            method: "POST",
            eventRole: props.role,
            stage: props.stage
        }));

        this._addOptionalLogGroupToTarget(props.fLogGroup);
    }

    private _addOptionalLogGroupToTarget(fLogGroup?: boolean): void {
        if (fLogGroup) {
            this.addTarget(new CloudWatchLogGroup(new LogGroup(this, ResourceNamesEnum.PUBLIC_SUBSCRIBER_TOPIC_RULE_LOG_GROUP)));
        }
    }
}

export enum PublicSubscriberTopicRuleEnum {
    CONSTRUCT_ID = "PublicSubscriberTopicRule",
}

export enum PublicSubscriberTopicRulesEnum {
    ROLE_CONSTRUCT_ID = "public_subscriber_topic_rules",
    CONSTRUCT_ID = "PublicSubscriberTopicRules",
}

export interface PublicSubscriberTopicRulesProps {
    subscribers: SubscriberEvent<any, any>[],
    eventBus: IEventBus,
    subscriptionRestApi: IRestApi,
    role: IRole
}

export class PublicSubscriberTopicRules extends Construct {

    constructor(scope: Construct, id: string, props: PublicSubscriberTopicRulesProps) {
        super(scope, id);
        props.subscribers.forEach((subscriber) => {
            new PublicSubscriberTopicRule(this,
                `${PublicSubscriberTopicRuleEnum.CONSTRUCT_ID}-${subscriber.options.name}`, {
                subscriber: subscriber,
                eventBus: props.eventBus,
                eventBusName: EventBusNamesEnum.PUBLIC_PUBLISHER,
                subscriptionRestApi: props.subscriptionRestApi,
                role: props.role,
                stage: config.getStage()
            });
        });
    }
}
