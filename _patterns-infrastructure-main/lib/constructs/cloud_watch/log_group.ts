import {LogGroup as BaseLogGroup, LogGroupProps as BaseLogGroupProps} from "aws-cdk-lib/aws-logs";
import {Construct} from "constructs";
import {RemovalPolicy} from "aws-cdk-lib";

export type LogGroupProps = BaseLogGroupProps;

export class LogGroup extends BaseLogGroup {

    constructor(scope: Construct, id: string, props?: LogGroupProps) {
        super(scope, id, {
            ...{
                logGroupName: id,
                removalPolicy: RemovalPolicy.DESTROY
            }, ...props
        });
    }
}
