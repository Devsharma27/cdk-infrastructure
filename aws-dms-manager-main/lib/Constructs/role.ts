import { Construct } from 'constructs';
import * as iam from 'aws-cdk-lib/aws-iam';

interface RoleConstructProps {}

export class iamRole  extends Construct {
    role: iam.IRole;
    static Role: string | undefined;

    constructor(scope: Construct, id: string, props: RoleConstructProps) {
        super(scope, id);

        const Role = new iam.Role(this, 'Role', {
        assumedBy: new iam.ServicePrincipal('dms.amazonaws.com'),
        description: 'Example role...',
        roleName: 'dms-role'
        });

        const managedPolicy = new iam.ManagedPolicy(this, 'managed-policy-id', {
            description: 'Allows ec2 describe action',
            statements: [
            new iam.PolicyStatement({
                effect: iam.Effect.ALLOW,
                actions: ['dynamodb:*'],
                resources: ['*'],
                }),
            ],
            roles: [Role],
        });
    }
}