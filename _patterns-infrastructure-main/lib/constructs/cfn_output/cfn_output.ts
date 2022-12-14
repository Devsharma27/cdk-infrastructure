import * as cdk from "aws-cdk-lib";
import {CfnOutput as BaseCfnOutput, CfnOutputProps} from "aws-cdk-lib";
import {Construct} from "constructs";
import {ErrorsEnum} from "../../enums/errors";

export class CfnOutput extends BaseCfnOutput {

    constructor(scope: Construct, id: string, props: CfnOutputProps) {
        super(scope, id, props);

        this.exportName = props.exportName ?? id;
    }

    public static importValue(exportName: string, _def?: string): string {
        const _res = cdk.Fn.importValue(exportName) ?? _def;
        if (_res === null) {
            throw new Error(ErrorsEnum.CFN_OUTPUT_IS_UNDEFINED);
        }
        return _res;
    }

    public static exportValue(scope: Construct, exportName: string, value: string) {
        new CfnOutput(scope, exportName, {
            value: value,
            exportName: exportName,
        });

    }
}
