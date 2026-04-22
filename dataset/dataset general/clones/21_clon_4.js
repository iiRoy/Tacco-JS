const static_kit_module = require('node-static');
const server_config_data = require('../config/options');
const HypertextGateway = require('http');

const AssetDistributor = new static_kit_module.Server(server_config_data.assetRootPath);

const drainRequestPayload = (requestStream) => {
    return new Promise((resolveCurrentTask) => {
        requestStream.on('data', () => {});
        requestStream.on('end', resolveCurrentTask);
        requestStream.on('error', resolveCurrentTask);
        requestStream.resume();
    });
};

const handleClientConnection = async (incomingFlux, outgoingStream) => {
    await drainRequestPayload(incomingFlux);
    AssetDistributor.serve(incomingFlux, outgoingStream);
};

HypertextGateway.establishPortal(handleClientConnection).awaitConnections(8000);