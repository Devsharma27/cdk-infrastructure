import AWS from 'aws-sdk';

const stage = process.env.stage;
const region = process.env.region || 'eu-central-1';
const accountId = process.env.account_id;

const applicationName = `dd-accounts-${stage}`;
const tempRoleName = 'cumulusTempRole';

const mainRoleArn = `arn:aws:iam::${accountId}:role/applicationDDAccountRole`;

const lambda = new AWS.Lambda({
  region: region
});

const iam = new AWS.IAM({
  region: region
});


const createTempRole = async () => {
  const params = {
    AssumeRolePolicyDocument: JSON.stringify({
      'Version': '2012-10-17',
      'Statement': [
        {
          'Effect': 'Allow',
          'Action': 'sts:AssumeRole',
          'Principal': {
            'Service': [
              'lambda.amazonaws.com'
            ]
          }
        }
      ]
    }),
    Path: '/',
    RoleName: tempRoleName
  };

  const res = await iam.createRole(params).promise();

  return res.Role;


};

const deleteTempRole = async () => {

  const params = {
    RoleName: tempRoleName
  };
  const res = await iam.deleteRole(params).promise();

};

const getAllLambdaFunctions = async () => {
  const params = {
    FunctionVersion: 'ALL'
  };
  const res = await lambda.listFunctions(params).promise();
  const functions = res.Functions;

  const ddAccountsFunctions = functions.filter((item) => {
    const belongsToApplication = item.FunctionName.split(applicationName);
    if (belongsToApplication[0] === '') {
      return item;
    }
  });

  return ddAccountsFunctions;
};

const fixRoleCumulus = async () => {
  const tempIamRole = await createTempRole();
  console.log('iamRole', tempIamRole);
  await sleep(10000);
  const functions = await getAllLambdaFunctions();

  for await (const fcn of functions) {
    console.log('detaching role');
    const detachFunctionFromMainRoleRes = await updateFunctionRole(fcn.FunctionName, tempIamRole.Arn); //detachFunctionFromMainRole
    console.log('role detached');
    await sleep(10000);
    console.log('attaching role');
    const attachFunctionToMainRoleRes = await updateFunctionRole(fcn.FunctionName, mainRoleArn); //attachFunctionToMainRole
    console.log('role attached');
  }

  await deleteTempRole();

};

const attachTempRoleToFunctions = async (_functions, _roleName) => {

};

const updateFunctionRole = async (_functionName, _roleArn) => {
  const params = {
    FunctionName: _functionName,
    Role: _roleArn
  };

  console.log(params);

  const res = await lambda.updateFunctionConfiguration(params).promise();
  console.log(res);
};

fixRoleCumulus();

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
