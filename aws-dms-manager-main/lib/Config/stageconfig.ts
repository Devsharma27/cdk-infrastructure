import * as stageTable from './stagetableMappings.json';

export {stageConfig,};

const stagetableMappings = JSON.stringify(stageTable)


const stageConfig = {

    vpccidrBlock: '10.50.0.0/16',
    publicSubnet1: '10.50.1.0/24',
    publicSubnet2: '10.50.2.0/24',
    SourceEndpoint: 'aurora',
    SourceEndpointserverName : process.env.SOURCE_ENDPOINT_SERVERNAME ,
    SourceEndpointusername : process.env.SOURCE_ENDPOINT_USERNAME,
    SourceEndpointpassword : process.env.SOURCE_ENDPOINT_PASSWORD,
    TargetEndpoint: 'dynamodb',
    tableMappings: stagetableMappings

};

