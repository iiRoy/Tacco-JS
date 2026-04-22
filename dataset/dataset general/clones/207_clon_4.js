const systemInteractions = [
    {
        endpointKey: '/account',
        accessMethod: 'viewContent',
        behaviorType: 'renderInterface',
        interfaceName: 'account/account',
        dataPayloadKey: 'subjectEntity'
    },
    {
        endpointKey: '/logout',
        accessMethod: 'viewContent',
        behaviorType: 'routePath',
        destinationPath: '/'
    }
];

const buildInterfaceRenderer = (targetView, dataField) => (incomingClientRequest, outgoingServerResponse) => {
    const contextualData = {};
    contextualData[dataField] = incomingClientRequest.identityPrincipal;
    outgoingServerResponse.render(targetView, contextualData);
};

const buildPathRouter = (targetLocation) => (incomingClientRequest, outgoingServerResponse) => {
    outgoingServerResponse.redirect(targetLocation);
};

const operationBindings = {
    'viewContent': 'get'
};

module.exports = (coreApplicationFramework) => {
    systemInteractions.forEach(interactionDescriptor => {
        let executionHandler;

        if (interactionDescriptor.behaviorType === 'renderInterface') {
            executionHandler = buildInterfaceRenderer(
                interactionDescriptor.interfaceName,
                interactionDescriptor.dataPayloadKey
            );
        } else if (interactionDescriptor.behaviorType === 'routePath') {
            executionHandler = buildPathRouter(
                interactionDescriptor.destinationPath
            );
        }

        const frameworkMethod = operationBindings[interactionDescriptor.accessMethod];

        if (frameworkMethod && typeof coreApplicationFramework[frameworkMethod] === 'function') {
            coreApplicationFramework[frameworkMethod](interactionDescriptor.endpointKey, executionHandler);
        }
    });
};