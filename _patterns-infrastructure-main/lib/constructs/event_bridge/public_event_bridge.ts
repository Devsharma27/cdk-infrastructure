import { Construct } from "constructs";
import { RemovalPolicy } from "aws-cdk-lib";
import { EventBus, IEventBus, Rule } from "aws-cdk-lib/aws-events";
import { RulesEnum } from "../../enums/rules.enum";
import { CentralEventStoreRule } from "./central_event_store_rule";
import * as cdk from "aws-cdk-lib";
import * as logs from "aws-cdk-lib/aws-logs";
import { CloudWatchLogGroup } from "aws-cdk-lib/aws-events-targets";
import { CfnOutput } from "../cfn_output/cfn_output";
import { IRole, Role } from "aws-cdk-lib/aws-iam";
import { LogGroup } from "../cloud_watch/log_group";
import { XprIamRole, XprRoleProps } from "../iam/role"
import { CfnOutputNamesEnum } from "../../enums/cfn_output_names.enum";
import { EventBusNamesEnum } from "../../enums/event_bus_names.enum";

export enum PublicEventBridgeRoleEnum {
    ROLE = "publicEventBridgeRole",
    RESOURCE_ID = "public_eb_role",
    DESCRIPTION = "A role for the L3 Construct Public Event Bridge, which handles public events via EB",
    CFN_OUTPUT_ARN = "publicEBeRoleArn",
    CONSTRUCT_ID = "publicEBRole",
    RULE_INCOMING_EVENTS_CONSTRUCT_ID = "public_eb_incoming_events",
    RULE_INCOMING_EVENTS_DESCRIPTION = "all incoming events to the subscriber eb are logged",
    RULE_INCOMING_EVENTS_RULE_NAME = "public_eb_all_incoming_events",
    LOG_INCOMING_EVENTS_CONSTRUCT_ID = "public_eb_incoming_events_log_group",
    LOG_INCOMING_EVENTS_LOG_GROUP_NAME = "public_eb_incoming_events_log_group",
    LOG_OUTGOING_EVENTS_CONSTRUCT_ID = "public_eb_outgoing_events_log_group",
    LOG_OUTGOING_EVENTS_LOG_GROUP_NAME = "public_eb_outgoing_events_log_group",
}

class PublicEventBridgeRole extends XprIamRole {

    constructor(scope: Construct, id: string) {
        // Create a role and set the policy
        const roleProps: XprRoleProps = {
            roleName: PublicEventBridgeRoleEnum.ROLE,
            description: PublicEventBridgeRoleEnum.DESCRIPTION,
            principals: {
                servicePrincipals: [ "events.amazonaws.com"]
            }
        }
        super(scope, PublicEventBridgeRoleEnum.CONSTRUCT_ID, roleProps)
        new CfnOutput(scope, PublicEventBridgeRoleEnum.CFN_OUTPUT_ARN, {value: this.role.roleArn});
    }
}

interface LogIncomingEventsRuleProps {
    eventBus: IEventBus
}

/**
 * Any Event is logged
 */
class LogIncomingEventsRule extends Rule {

    constructor(scope: Construct, id: string, props: LogIncomingEventsRuleProps) {
        super(scope, id, {
            ruleName: PublicEventBridgeRoleEnum.RULE_INCOMING_EVENTS_RULE_NAME,
            description: PublicEventBridgeRoleEnum.RULE_INCOMING_EVENTS_DESCRIPTION,
            eventBus: props.eventBus,
            eventPattern: {
                //any event is by default 0. Also cdk just accepts string[] for none-detail-props.
                //So this should be a rule to match any event
                //@TODO best any pattern? Whats about any event from our organization
                //@TODO test no pattern for any events passed by rule
                version: ["0"]
            },
            enabled: true
        });

        const _logGroup = new LogGroup(this, PublicEventBridgeRoleEnum.LOG_INCOMING_EVENTS_CONSTRUCT_ID, {
            logGroupName: PublicEventBridgeRoleEnum.LOG_INCOMING_EVENTS_LOG_GROUP_NAME
        });

        this.addTarget(new CloudWatchLogGroup(_logGroup));
    }
}

export class PublicEventBridge extends Construct {

    private _publicPublisherEventBus: EventBus;
    private _publicSubscriberEventBus: EventBus;
    private _role: IRole;

    constructor(scope: Construct, id: string) {
        super(scope, id);

        this._publicPublisherEventBus = this._createPublicPublisherEventBus();
        this._publicSubscriberEventBus = this._createPublicSubscriberEventBus();
        this._role = new PublicEventBridgeRole(this, PublicEventBridgeRoleEnum.CONSTRUCT_ID).role;

        const _centralEventStoreRule = new CentralEventStoreRule(this, RulesEnum.CENTRAL_EVENT_BRIDGE_PUBLISHING, {
            eventBus: this._publicPublisherEventBus,
            account: cdk.Stack.of(this).account,
            role: this._role
        });
        this._createLogsForAnyOutgoingEvents(_centralEventStoreRule);
        this._createLogsForAnyIncomingEvents();
    }

    public getPublicPublisherEventBus(): EventBus {
        return this._publicPublisherEventBus;
    }

    public getPublicSubscriberEventBus(): EventBus {
        return this._publicSubscriberEventBus;
    }

    public static getRoleFromArn(scope: Construct): IRole {
        const _arn = CfnOutput.importValue(PublicEventBridgeRoleEnum.CFN_OUTPUT_ARN);
        return Role.fromRoleArn(scope, PublicEventBridgeRoleEnum.CONSTRUCT_ID, _arn);
    }

    public static publisherFromArn(scope: Construct): IEventBus {
        //@TODO map it as ARN , making the name as ARN
        const _eventBusArn = CfnOutput.importValue(CfnOutputNamesEnum.PUBLIC_PUBLISHER_EVENT_BUS);
        return EventBus.fromEventBusArn(scope, EventBusNamesEnum.PUBLIC_PUBLISHER, _eventBusArn);
    }

    public static subscriberFromArn(scope: Construct): IEventBus {
        //@TODO map it as ARN
        const _eventBusArn = CfnOutput.importValue(CfnOutputNamesEnum.PUBLIC_SUBSCRIBER_EVENT_BUS);
        return EventBus.fromEventBusArn(scope, EventBusNamesEnum.PUBLIC_SUBSCRIBER, _eventBusArn);
    }

    public attachPermissions2ApplicationRole(applicationRole: IRole) {
        this._publicPublisherEventBus.grantPutEventsTo(applicationRole);
    }

    public grantPutEventsTo(role: IRole) {
        this._publicPublisherEventBus.grantPutEventsTo(role)
    }

    private _createPublicSubscriberEventBus(): EventBus {
        const _eventBus = new EventBus(this, EventBusNamesEnum.PUBLIC_SUBSCRIBER, {
            eventBusName: EventBusNamesEnum.PUBLIC_SUBSCRIBER
        });
        new CfnOutput(this, CfnOutputNamesEnum.PUBLIC_SUBSCRIBER_EVENT_BUS, { value: _eventBus.eventBusArn });
        return _eventBus;
    }

    private _createPublicPublisherEventBus(): EventBus {
        const _eventBus = new EventBus(this, EventBusNamesEnum.PUBLIC_PUBLISHER, {
            eventBusName: EventBusNamesEnum.PUBLIC_PUBLISHER
        });
        new CfnOutput(this, CfnOutputNamesEnum.PUBLIC_PUBLISHER_EVENT_BUS, { value: _eventBus.eventBusArn });
        return _eventBus;
    }

    private _createLogsForAnyOutgoingEvents(rule: Rule): void {
        const _logGroup = new logs.LogGroup(this,
            PublicEventBridgeRoleEnum.LOG_OUTGOING_EVENTS_CONSTRUCT_ID,
            {
                logGroupName: PublicEventBridgeRoleEnum.LOG_OUTGOING_EVENTS_LOG_GROUP_NAME,
                removalPolicy: RemovalPolicy.DESTROY
            });
        rule.addTarget(new CloudWatchLogGroup(_logGroup));
    }

    private _createLogsForAnyIncomingEvents(): Rule {
        return new LogIncomingEventsRule(this, PublicEventBridgeRoleEnum.RULE_INCOMING_EVENTS_CONSTRUCT_ID, {
            eventBus: this._publicSubscriberEventBus
        });
    }
}
