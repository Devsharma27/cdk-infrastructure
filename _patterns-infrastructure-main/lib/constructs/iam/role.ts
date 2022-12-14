import { Construct } from "constructs";
import * as iam from 'aws-cdk-lib/aws-iam'
import { Role, IRole, AccountPrincipal, ArnPrincipal, CompositePrincipal, FederatedPrincipal, IPrincipal, OrganizationPrincipal, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { XprAccessPrincipal } from "./access_permission";
import { XprIamPolicy, XprPolicyProps } from "./policy";

export interface XprRoleProps {
    // Define construct properties here
    roleName: string;
    description: string;
    policy?: iam.Policy;
    principals?: XprAccessPrincipal;
}

enum PrincipalType {
    ACCOUNT = "Account",
    SERVICE = "Service",
    ORGANISATION = "Organisation",
    FEDERATED = "Federated",
    ARN = "Arn"
}

export class XprIamRole extends Construct {
    public readonly role: iam.IRole;

    constructor(scope: Construct, id: string, props: XprRoleProps) {
        super(scope, id);
        // Create role and attach the above policy
        const role = new iam.Role(this, id, {
            roleName: props.roleName,
            assumedBy: this.createCompositePrincipal(props.principals),
            description: 'IAM role for :' + props.description,
        });
        if (props.policy) {
            role.attachInlinePolicy(props.policy);
        }
        this.role = role;
    }

    public addToPolicy(policy: XprPolicyProps) {
        const xprIamPolicy = new XprIamPolicy(this, policy.resourceId, policy)
        this.role.attachInlinePolicy(xprIamPolicy.policy)
    }

    protected static fromRoleArn(scope: Construct, id: string, roleArn: string): IRole {
        return Role.fromRoleArn(scope, id, roleArn);
    }

    protected static fromRoleName(scope: Construct, id: string, roleName: string): IRole {
        return Role.fromRoleName(scope, id, roleName);
    }

    // creates a composite principal with all the principals
    private createCompositePrincipal(principals?: XprAccessPrincipal): IPrincipal {
        let accessPrincipals: IPrincipal[] = []
        if (principals) {
            if (principals?.accountPrincipals) {
                accessPrincipals = accessPrincipals.concat(this.createPrincipal(PrincipalType.ACCOUNT, principals.accountPrincipals));
            }
            if (principals?.arnPrincipals) {
                accessPrincipals = accessPrincipals.concat(this.createPrincipal(PrincipalType.ARN, principals.arnPrincipals));
            }
            if (principals?.federatedPrincipals) {
                accessPrincipals = accessPrincipals.concat(this.createPrincipal(PrincipalType.FEDERATED, principals.federatedPrincipals));
            }
            if (principals?.organisationPrincipals) {
                accessPrincipals = accessPrincipals.concat(this.createPrincipal(PrincipalType.ORGANISATION, principals.organisationPrincipals));
            }
            if (principals?.servicePrincipals) {
                accessPrincipals = accessPrincipals.concat(this.createPrincipal(PrincipalType.SERVICE, principals.servicePrincipals));
            }
        }
        const compositePrincipal = new CompositePrincipal(...accessPrincipals);
        return compositePrincipal;
    }

    // Creates and returns array of IPrincipal objects based on the principals passed as string arr
    private createPrincipal(type: string, principals: string[]): any {
        let tmpPrincipals: IPrincipal[] = [];
        for (var pind = 0; pind < principals.length; pind++) {
            switch (type) {
                case "Service":
                    tmpPrincipals.push(new ServicePrincipal(principals[pind]));
                    break;
                case "Account":
                    tmpPrincipals.push(new AccountPrincipal(principals[pind]));
                    break;
                case "Federated":
                    tmpPrincipals.push(new FederatedPrincipal(principals[pind], {}));
                    break;
                case "Organisation":
                    tmpPrincipals.push(new OrganizationPrincipal(principals[pind]));
                    break;
                case "Arn":
                    tmpPrincipals.push(new ArnPrincipal(principals[pind]));
                    break;
                default:
                    break;
            }
        }
        return tmpPrincipals;
    }
}

