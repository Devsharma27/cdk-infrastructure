import {IEventBus, Rule} from "aws-cdk-lib/aws-events";
import {Construct} from "constructs";
import {RuleProps} from "aws-cdk-lib/aws-config";
import { ISubscriberSpecifications } from "../../interfaces/event_bridge_connector_input";
export enum PublicEventsFromBindedPublishersRuleEnum {
    RULE_NAME = "public-event-bridge-publishing",
    DESCRIPTION = "takes any public event of binded AppDomains and distribute it to the subscribers of the binded AppDomains",
}

export interface IPublicEventsFromBindedPublishersRuleProps extends RuleProps {
    eventBus: IEventBus,
    specifications: ISubscriberSpecifications
}

/**
 * Subscribing public events from binded publisher
 * Binded Publisher -> Subscriber = incoming
 */
export class PublicEventsFromBindedPublishersRule extends Rule {

    constructor(scope: Construct, id: string, props: IPublicEventsFromBindedPublishersRuleProps) {

        super(scope, id, {
            eventPattern: {
                source: props.specifications.sources
            },
            ruleName: props.configRuleName ?? PublicEventsFromBindedPublishersRuleEnum.RULE_NAME,
            description: props.description ?? PublicEventsFromBindedPublishersRuleEnum.DESCRIPTION,
            eventBus: props.eventBus,
            enabled: true
        });

    }
}
