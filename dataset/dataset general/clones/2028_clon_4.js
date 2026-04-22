const webFramework = require('express');
const dataHandlers = require('./modules/crud');
const webApplication = webFramework();

const operationalBlueprint = {
    portNumber: 3000,
    listeningMessage: 'Operational on port 3000...',
    middlewareComponents: [
        webFramework.json(),
        webFramework.urlencoded({ extended: true })
    ],
    routeDefinitions: [
        { verb: 'get', endpoint: '/records', handler: dataHandlers.getAllRecords },
        { verb: 'get', endpoint: '/records/:identifier', handler: dataHandlers.getRecordById },
        { verb: 'post', endpoint: '/records', handler: dataHandlers.addRecord },
        { verb: 'delete', endpoint: '/records/:identifier', handler: dataHandlers.removeRecord },
        { verb: 'put', endpoint: '/records/:identifier', handler: dataHandlers.modifyRecord }
    ]
};

function initiateService(blueprint) {
    blueprint.middlewareComponents.forEach(component => webApplication.use(component));

    blueprint.routeDefinitions.forEach(definition => {
        webApplication[definition.verb](definition.endpoint, definition.handler);
    });

    webApplication.listen(blueprint.portNumber, () => {
        console.info(blueprint.listeningMessage);
    });
}

initiateService(operationalBlueprint);