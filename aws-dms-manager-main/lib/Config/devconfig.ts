import * as devTable from './devtableMappings.json';



export {devConfig,};

const devtableMappings = JSON.stringify(devTable)


const devConfig = {

    vpccidrBlock: '10.30.0.0/16',
    publicSubnet1: '10.30.1.0/24',
    publicSubnet2: '10.30.2.0/24',
    SourceEndpoint: 'aurora',
    SourceEndpointserverName : process.env.SOURCE_ENDPOINT_SERVERNAME ,
    SourceEndpointusername : process.env.SOURCE_ENDPOINT_USERNAME,
    SourceEndpointpassword : process.env.SOURCE_ENDPOINT_PASSWORD,
    TargetEndpoint: 'dynamodb',
    tableMappings: devtableMappings
};

