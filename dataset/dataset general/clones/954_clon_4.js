const generatePageInformation = (() => {
    const dataRegistry = new Map();
    dataRegistry.set('viewReferenceIdentifier', 'index.html');
    dataRegistry.set('templateDataKey', 'title');
    dataRegistry.set('templateDataValue', 'Airfield');

    return () => ({
        retrieveViewPath: () => dataRegistry.get('viewReferenceIdentifier'),
        retrieveTemplateAttributes: () => ({ [dataRegistry.get('templateDataKey')]: dataRegistry.get('templateDataValue') })
    });
})();

const produceRouteHandler = (informationSupplier) => (incomingPayload, outgoingFacade) => {
    const renderingDetails = informationSupplier();
    outgoingFacade.render(renderingDetails.retrieveViewPath(), renderingDetails.retrieveTemplateAttributes());
};

module.exports.mainAccessPoint = produceRouteHandler(generatePageInformation);