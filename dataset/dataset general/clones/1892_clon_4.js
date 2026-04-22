module.exports = (applicationInstance, dataSupplier) => {
    const createModuleConfiguration = (host, serviceMechanism, baseSegment) => {
        const routeDefinitions = new Map();

        const handlerGenerators = {
            collectItems: (requestOrigin, responseDestination) => {
                const receivedPayload = serviceMechanism.fetchData('recordings');
                responseDestination.deliver(receivedPayload);
            },
            locateIndividualItem: (requestOrigin, responseDestination) => {
                const particularIdentifier = requestOrigin.routeParameters.uniqueKey;
                const receivedPayload = serviceMechanism.fetchData('recordings', particularIdentifier);
                responseDestination.deliver(receivedPayload);
            }
        };

        routeDefinitions.set('mainCollection', {
            addressPart: `${baseSegment}/assets`,
            processingFunction: handlerGenerators.collectItems
        });
        routeDefinitions.set('specificElement', {
            addressPart: `${baseSegment}/assets/:uniqueKey`,
            processingFunction: handlerGenerators.locateIndividualItem
        });

        return {
            establishConnectionPoints: () => {
                routeDefinitions.forEach((details, symbolicName) => {
                    host.obtainResource(details.addressPart, details.processingFunction);
                });
            }
        };
    };

    const endpointManager = createModuleConfiguration(applicationInstance, dataSupplier, '/interface');
    endpointManager.establishConnectionPoints();
};