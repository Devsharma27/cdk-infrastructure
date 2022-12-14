import { Construct } from "constructs";
import { IRestApi, RestApi } from "aws-cdk-lib/aws-apigateway";
import { ConstructIdsEnum } from "../../enums/construct_ids.enum";
import { ResourceNamesEnum } from "../../enums/resource_names.enum";
import { ResourceDescriptionsEnum } from "../../enums/resource_descriptions.enum";
import { CfnOutput } from "../cfn_output/cfn_output";
import * as config from "../../functions/config";
import { CfnOutputNamesEnum } from '../../enums/cfn_output_names.enum';
import { XprIamRole, XprRoleProps } from "../iam/role";
import * as iam from "aws-cdk-lib/aws-iam"; 
import { IRole } from "aws-cdk-lib/aws-iam";
import { XprIamPolicy, XprPolicyProps } from "../iam/policy";

export enum SubscriptionApiGatewayRoleEnum {
  ROLE = "subApiGatewayRole",
  RESOURCE_ID = "sub_api_gateway_role",
  DESCRIPTION = "A role for the Subscription API gateway to receive events from EB",
  CFN_OUTPUT_ARN = "subApigatewayRoleArn",
  CONSTRUCT_ID = "subApiGatewayRole",
  POLICY_ID = "SubscriptionApiGatewayInvokePolicy"
}

export class SubscriptionApiGateway extends Construct {

  private _api: RestApi;
  private _role: IRole;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    this._api = new RestApi(this, ConstructIdsEnum.SUBSCRIPTION_API_GATEWAY, {
      restApiName: ResourceNamesEnum.SUBSCRIPTION_REST_API,
      description: ResourceDescriptionsEnum.SUBSCRIPTION_API_GATEWAY,
      deployOptions: {
        stageName: config.getStage()
      }
    });
    this._api.root.addMethod('ANY');
    this._role = new SubscriptionApiGatewayRole(scope, SubscriptionApiGatewayRoleEnum.CONSTRUCT_ID).role
    this.grantInvoke(this._role);
    CfnOutput.exportValue(scope, CfnOutputNamesEnum.SUBSCRIPTION_REST_API_ID, this._api.restApiId);
    CfnOutput.exportValue(scope, CfnOutputNamesEnum.SUBSCRIPTION_ROOT_RESOURCE_ID, this._api.restApiRootResourceId);

  }


  public static restApiFromArn(scope: Construct): IRestApi {

    const _apiId = CfnOutput.importValue(CfnOutputNamesEnum.SUBSCRIPTION_REST_API_ID);
    return RestApi.fromRestApiId(scope, ConstructIdsEnum.SUBSCRIPTION_API_GATEWAY, _apiId);
  }

  public static getRoleFromName(scope: Construct): IRole {
    let role = SubscriptionApiGatewayRole.fromRoleName(scope);
    if (role ==  null) {
      role = new SubscriptionApiGatewayRole(scope, SubscriptionApiGatewayRoleEnum.CONSTRUCT_ID).role
    }
    return role
  }

  public static getRoleFromArn(scope: Construct): IRole {
    let role = SubscriptionApiGatewayRole.fromRoleArn(scope);
    if (role ==  null) {
      role = new SubscriptionApiGatewayRole(scope, SubscriptionApiGatewayRoleEnum.CONSTRUCT_ID).role
    }
    return role
  }

  get api(): RestApi {
    return this._api;
  }

  public getRole(): IRole {
    return this._role;
  }

  public grant(policyProps: XprPolicyProps) {
    const subscriptionApiGatewayInvokePolicy = new XprIamPolicy(this, SubscriptionApiGatewayRoleEnum.POLICY_ID, policyProps).policy;
    this._role.attachInlinePolicy(subscriptionApiGatewayInvokePolicy)
  }

  public grantInvoke(role: IRole) {
    const policyProps: XprPolicyProps = {
      resourceId: SubscriptionApiGatewayRoleEnum.POLICY_ID,
      resources: ["*"],
      actions: ['execute-api:Invoke', 'execute-api:ManageConnections'],
      effect: iam.Effect.ALLOW,
    }
    const subscriptionApiGatewayInvokePolicy = new XprIamPolicy(this, SubscriptionApiGatewayRoleEnum.POLICY_ID, policyProps).policy;
    role.attachInlinePolicy(subscriptionApiGatewayInvokePolicy)
  }


}

export class SubscriptionApiGatewayRole extends XprIamRole {

  constructor(scope: Construct, id: string) {
    // Create a role and set the policy
    const roleProps: XprRoleProps = {
      roleName: SubscriptionApiGatewayRoleEnum.ROLE,
      description: SubscriptionApiGatewayRoleEnum.DESCRIPTION,
      principals: {
        servicePrincipals: ["events.amazonaws.com"]
      }
    }
    super(scope, SubscriptionApiGatewayRoleEnum.RESOURCE_ID, roleProps)
    new CfnOutput(scope, SubscriptionApiGatewayRoleEnum.CFN_OUTPUT_ARN, { value: this.role.roleArn });
  }

  static fromRoleName(scope: Construct): IRole {
    return super.fromRoleName(scope, SubscriptionApiGatewayRoleEnum.CONSTRUCT_ID, SubscriptionApiGatewayRoleEnum.ROLE);
  }

  static fromRoleArn(scope: Construct): IRole {
    const roleArn = CfnOutput.importValue(SubscriptionApiGatewayRoleEnum.CFN_OUTPUT_ARN);
    return super.fromRoleArn(scope, SubscriptionApiGatewayRoleEnum.CONSTRUCT_ID, roleArn);
  }

}
