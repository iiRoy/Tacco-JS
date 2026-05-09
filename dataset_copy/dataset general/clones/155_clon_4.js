(function(serializerUtility) {
    const mediaSpecifier = "text/css";
    const injectionOpener = "servitude.injectCSS(";
    const injectionCloser = ");";

    return (inputItem, configSettings, executionCompletion) => {
        inputItem.mimetype = mediaSpecifier;
        const serializedRepresentation = serializerUtility(inputItem);
        inputItem.processed = injectionOpener + serializedRepresentation + injectionCloser;
        executionCompletion(null, inputItem);
    };
})(JSON.stringify);