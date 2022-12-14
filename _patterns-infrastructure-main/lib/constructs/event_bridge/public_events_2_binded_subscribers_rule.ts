import {IEventBus, Rule, RuleTargetConfig} from "aws-cdk-lib/aws-events";
import {Construct} from "constructs";
import {RuleProps} from "aws-cdk-lib/aws-config";
import * as logs from "aws-cdk-lib/aws-logs";
import {CloudWatchLogGroup} from "aws-cdk-lib/aws-events-targets";
import {RemovalPolicy} from "aws-cdk-lib";
import {Effect, IRole, Policy, PolicyStatement} from "aws-cdk-lib/aws-iam";
import {IEventBridgeBinding} from "@exporo/specifications-events/dist/interfaces/configs";
import {ErrorsEnum} from "../../enums/errors";
import {PublicEventBridge} from "./public_event_bridge";
import { IPublisherSpecifications } from "../../interfaces/event_bridge_connector_input";

export enum PublicEvents2BindedSubscribersRuleEnum {
    POLICY_CONSTRUCT_ID = "allowSendingPublicEvents2BindedSubscriber",
    LOG_GROUP_CONSTRUCT_ID = "send_public_events_for_binded_subscribers_to_log_group",
    RULE_NAME = "public-event-bridge-publishing",
    DESCRIPTION = "this simple rule takes any public event of our AppDomain and distribute it to the subscribers of the binded AppDomains"
}

export interface IPublicEvents2BindedSubscribersRuleProps extends RuleProps {
    eventBus: IEventBus,
    specifications: IPublisherSpecifications
}

/**
 * publishing the public events to the binded Subscriber
 * Publisher -> Binded subscriber = outgoing
 */

//todo:question here?
export class PublicEvents2BindedSubscribersRule extends Rule {

    private _role: IRole;

    constructor(scope: Construct, id: string, props: IPublicEvents2BindedSubscribersRuleProps) {
        super(scope, id, {
            eventPattern: {
                source: props.specifications.sources
            },
            ruleName: PublicEvents2BindedSubscribersRuleEnum.RULE_NAME,
            description: PublicEvents2BindedSubscribersRuleEnum.DESCRIPTION,
            eventBus: props.eventBus,
            enabled: true
        });

        this._role = PublicEventBridge.getRoleFromArn(this);
        this._allowSendingPublicEvents2BindedSubscriber(this._role, props.specifications.serverBindings);
        this._addBindedSubscriberEventBusesToTargets(this._role, props.specifications.serverBindings);
        this._addAnyEventLogToTarget();
    }

    private _addBindedSubscriberEventBusesToTargets(role: IRole,
        serverBindings: IEventBridgeBinding[]): void {
        //@TODO check that
        if (serverBindings.length > 5) {
            throw new Error(ErrorsEnum.MAX_RULES);
        }

        //@TODO is a role needed?
        serverBindings.forEach((serverBinding) => {
            this.addTarget({
                bind(): RuleTargetConfig {
                    return {
                        arn: serverBinding.arn,
                        role: role
                    };
                }
            });
        });
    }

    private _allowSendingPublicEvents2BindedSubscriber(role: IRole, serverBindings: IEventBridgeBinding[]): void {
        const _resources: string[] = serverBindings
            .map((binding) => binding.arn);

        const _policy = new Policy(this, PublicEvents2BindedSubscribersRuleEnum.POLICY_CONSTRUCT_ID, {
                statements: [
                    new PolicyStatement({
                        resources: _resources,
                        effect: Effect.ALLOW,
                        actions: [
                            "events:PutEvents"
                        ]
                    })
                ]
            });
        role.attachInlinePolicy(_policy);
    }

    private _addAnyEventLogToTarget(): void {
        const _logGroup = new logs.LogGroup(this,
            PublicEvents2BindedSubscribersRuleEnum.LOG_GROUP_CONSTRUCT_ID,
            {
                logGroupName:
                PublicEvents2BindedSubscribersRuleEnum.LOG_GROUP_CONSTRUCT_ID,
                removalPolicy: RemovalPolicy.DESTROY
            });
        this.addTarget(new CloudWatchLogGroup(_logGroup));
    }
}
