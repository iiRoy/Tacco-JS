const applicationSettings = {
    rootEndpoint: 'https://secure.sakura.ad.jp/cloud/api/cloud/1.0/',
    moduleCoordinates: {
        utilityKit: './sacloud/util',
        commandCenter: './sacloud/command',
        serviceAccess: './sacloud/client'
    }
};

const supportTools = require(applicationSettings.moduleCoordinates.utilityKit);
const commandProcessor = require(applicationSettings.moduleCoordinates.commandCenter);
const accessHandler = require(applicationSettings.moduleCoordinates.serviceAccess);

const externalInterface = Object.freeze({
    primaryGateway: applicationSettings.rootEndpoint,
    helperFunctions: supportTools,
    operationController: commandProcessor,
    initiateOperation: (...params) => commandProcessor.create(...params),
    connectionManager: accessHandler,
    establishConnection: (...params) => accessHandler.create(...params)
});

module.exports = externalInterface;