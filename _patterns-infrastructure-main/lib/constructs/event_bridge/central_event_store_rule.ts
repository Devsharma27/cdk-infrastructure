import {Construct} from "constructs";
import {EventBus, IEventBus, Rule, RuleTargetConfig} from "aws-cdk-lib/aws-events";
import {RulesEnum} from "../../enums/rules.enum";
import {ResourceDescriptionsEnum} from "../../enums/resource_descriptions.enum";
import {IRole} from "aws-cdk-lib/aws-iam";
import * as config from "../../functions/config";
import { ConstructIdsEnum } from "../../enums/construct_ids.enum";

export interface CentralEventStoreRuleProps {
    eventBus: IEventBus
    account: string,
    role: IRole
}

export class CentralEventStoreRule extends Rule {

    constructor(scope: Construct, id: string, props: CentralEventStoreRuleProps) {
        super(scope, id, {
            eventPattern: {
                account: [props.account]
            },
            ruleName: RulesEnum.SEND_EVENTS_TO_CENTRAL_EVENT_STORE,
            description: ResourceDescriptionsEnum.CENTRAL_EVENT_BRIDGE_PUBLISHING,
            eventBus: props.eventBus,
            enabled: true
        });


        const _centralStoreAccountId = config.getCentralStoreAccountId();
        this.grantPutEventsToSendEventToCentralStore(scope, ConstructIdsEnum.CENTRAL_EVENT_BUS,props.role);
        this.addTarget({
            bind(): RuleTargetConfig {
                return {
                    arn: `arn:aws:events:eu-central-1:${_centralStoreAccountId}:event-bus/CentralEventBus`,
                    role: props.role
                };
            }
        });
    }

    private grantPutEventsToSendEventToCentralStore(scope: Construct, id: string, role: IRole): any{
        const centralEventBus = EventBus.fromEventBusArn(scope, id, `arn:aws:events:eu-central-1:${config.getCentralStoreAccountId()}:event-bus/CentralEventBus`);
        centralEventBus.grantPutEventsTo(role);
    }

}
