import {Construct} from "constructs";

import {CfnOutput} from "../cfn_output/cfn_output";
import {EventBus} from "aws-cdk-lib/aws-events";
import {IRole} from "aws-cdk-lib/aws-iam";
import { EventBusNamesEnum } from "../../enums/event_bus_names.enum";
import { CfnOutputNamesEnum } from "../../enums/cfn_output_names.enum";


export class PrivateEventBridge extends Construct {

    private _privateEventBus: EventBus;

    constructor(scope: Construct, id: string) {
        super(scope, id);

        this._privateEventBus = new EventBus(this, EventBusNamesEnum.PRIVATE, {
            eventBusName: EventBusNamesEnum.PRIVATE
        });
        new CfnOutput(scope, CfnOutputNamesEnum.PRIVATE_EVENT_BUS, {value: this._privateEventBus.eventBusArn});
    }

    public attachPermissions2ApplicationRole(applicationRole: IRole) {
        this._privateEventBus.grantPutEventsTo(applicationRole);
    }
}
