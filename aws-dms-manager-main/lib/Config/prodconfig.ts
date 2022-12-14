import * as prodTable from './prodtableMappings.json';


export {prodConfig,};

const prodtableMappings = JSON.stringify(prodTable)


const prodConfig = {

    vpccidrBlock: '10.20.0.0/16',
    publicSubnet1: '10.20.1.0/24',
    publicSubnet2: '10.20.2.0/24',
    SourceEndpoint: 'aurora',
    SourceEndpointserverName : process.env.SOURCE_ENDPOINT_SERVERNAME ,
    SourceEndpointusername : process.env.SOURCE_ENDPOINT_USERNAME,
    SourceEndpointpassword : process.env.SOURCE_ENDPOINT_PASSWORD,
    TargetEndpoint: 'dynamodb',
    tableMappings: prodtableMappings


};

