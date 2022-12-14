import { Construct } from "constructs";
import * as iam from 'aws-cdk-lib/aws-iam'
import { XprAccessPolicy } from "./access_permission";

export interface XprPolicyProps extends XprAccessPolicy {
    resourceId: string
}

export class XprIamPolicy extends Construct {
    public readonly policy: iam.Policy; 

    constructor(scope: Construct, id: string, props: XprPolicyProps) {
        super(scope, id);

        // Create a Policy Document to setup access permissions to dynamodb table
        const policy = new iam.Policy(this, id, {
            statements: [
                new iam.PolicyStatement({
                    resources: props.resources,
                    actions: props.actions,
                    effect: props.effect,
                }),
            ],
        });

        this.policy = policy;
    }
}