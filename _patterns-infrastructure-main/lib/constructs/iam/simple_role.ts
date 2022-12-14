import {Construct} from "constructs";
import {PolicyStatementProps} from "aws-cdk-lib/aws-iam/lib/policy-statement";
import {PolicyStatement, Role, ServicePrincipal} from "aws-cdk-lib/aws-iam";

export interface SimpleRoleProps {
    roleName: string;
    description: string;
    resourceId: string;
    assumedBy: string;
    policies?: PolicyStatementProps[];
}

export class SimpleRole extends Role {

    constructor(scope: Construct, id: string, props: SimpleRoleProps) {
        super(scope, id, {
            assumedBy: new ServicePrincipal(props.assumedBy),
            roleName: props.roleName,
            description: props.description || ""
        });

        props.policies?.forEach(policy => this.addToPolicy(new PolicyStatement(policy)));
    }
}
