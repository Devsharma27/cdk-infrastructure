import * as cdk from 'aws-cdk-lib';
import { Capture, Match, Template } from 'aws-cdk-lib/assertions';
import { XprIamRole, XprRoleProps } from '../../lib/constructs/iam/role';


// Example test case for Iam Role construct
test('Iam Role Created', () => {
    const stack = new cdk.Stack();
    //Create the construct
    // Create a role and set the policy
    const roleProps: XprRoleProps = {
        roleName: "TestRoleWithMultiplePrincipals",
        description: "This is a test role with multiple access principals",
        principals: {
            accountPrincipals: [ "123456789012" ],
            servicePrincipals: [ "events.amazonaws.com"]
        }
    }
    const role = new XprIamRole(stack, "TestRoleWithMultiplePrincipals", roleProps)
    
    //check the construct
    expect(role !== null);
    
    //Check resources are created in CFT output
    const template = Template.fromStack(stack);    
    //console.log(template.findResources("AWS::IAM::Role"))
    template.hasResource("AWS::IAM::Role", { "Properties": { "RoleName" : "TestRoleWithMultiplePrincipals" }});
    const svcPrincipalCapture = new Capture(Match.arrayWith([{"Action": "sts:AssumeRole","Effect": "Allow",
    "Principal": {
        "Service": "events.amazonaws.com"
      }}]));
    const acctPrincipalCapture = new Capture(Match.arrayWith([{"Action": "sts:AssumeRole","Effect": "Allow",
    "Principal": {
      "AWS": {
        "Fn::Join": [
          "",
          [
            "arn:",
            {
              "Ref": "AWS::Partition"
            },
            ":iam::123456789012:root"
          ]
        ]
      }}}]))  
    template.hasResourceProperties("AWS::IAM::Role", { "AssumeRolePolicyDocument" : { "Statement" : acctPrincipalCapture } });
    template.hasResourceProperties("AWS::IAM::Role", { "AssumeRolePolicyDocument" : { "Statement" : svcPrincipalCapture } });
    
});
function objectLike(arg0: { Principal: { Service: string; }; }): any {
    throw new Error('Function not implemented.');
}

function arrayWith(arg0: any) {
    throw new Error('Function not implemented.');
}

