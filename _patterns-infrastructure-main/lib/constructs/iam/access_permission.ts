import * as iam from 'aws-cdk-lib/aws-iam'
import { XprAccessPermissionTypeEnum } from "../../enums/access_permission_type.enum";



export interface XprAccessPermission {
    description: string;
    policy: XprAccessPolicy;
    permissions?: XprAccessPermissionTypeEnum[];
    principals?: XprAccessPrincipal;
}

export interface XprAccessPolicy {
    resources?: string[];
    actions: string[];
    effect: iam.Effect;
}

export interface XprAccessPrincipal {
    servicePrincipals?: string[];  
    accountPrincipals?: string[];
    federatedPrincipals?: string[];
    organisationPrincipals?: string[];
    arnPrincipals?: string[];
}
