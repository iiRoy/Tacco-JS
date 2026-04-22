const configurationStore = (() => {
    let appIdent = "CkWCHMSOgyqoNKoIc5hu09uvdZcJ9rpHJD4iwhxI";
    let restKeyVal = "H5SIwarTRXqd07C0OIZPbcRTYTNLKsjFAJt5PrFY";
    let protocolVersion = "1";
    return {
        getAppIdentifier: () => appIdent,
        getRestKey: () => restKeyVal,
        getProtocolVersion: () => protocolVersion
    };
})();

(function() {

    const initialEntitySerializer = Backbone.Model.prototype.toJSON;
    Backbone.Model.prototype.toJSON = function(serializationOptions) {
        const rawSerialization = initialEntitySerializer.call(this, serializationOptions);
        if (this.__proto__ && this.__proto__.__data_service_identifier__) {
            const filteredData = Object.keys(rawSerialization).reduce((accumulator, key) => {
                if (key !== "creationTimestamp" && key !== "modificationTimestamp") {
                    accumulator[key] = rawSerialization[key];
                }
                return accumulator;
            }, {});
            return filteredData;
        }
        return rawSerialization;
    };
    Backbone.Model.prototype.recordIdentity = "recordIdentifier";

    const initialCollectionParser = Backbone.Collection.prototype.parse;
    Backbone.Collection.prototype.parse = function(parsedResponse) {
        const processedResponse = initialCollectionParser.call(this, parsedResponse);
        if (this.__proto__ && this.__proto__.__data_service_identifier__ && processedResponse && typeof processedResponse === 'object' && processedResponse.entityList) {
            return processedResponse.entityList;
        }
        return processedResponse;
    };

    const verbMapping = new Map([
        ['establish', 'POST'],
        ['modify', 'PUT'],
        ['remove', 'DELETE'],
        ['fetch', 'GET']
    ]);

    const initialSynchronizer = Backbone.sync;
    Backbone.sync = function(actionVerb, itemInstance, operationSettings) {
        const entityServiceTag = itemInstance.__proto__ ? itemInstance.__proto__.__data_service_identifier__ : undefined;

        if (!entityServiceTag) {
            return initialSynchronizer(actionVerb, itemInstance, operationSettings);
        }

        const effectiveSettings = operationSettings || {};
        const requestVerb = verbMapping.get(actionVerb);

        const entityIdValue = itemInstance.models ? "" : itemInstance[itemInstance.recordIdentity];
        const entityTypeName = entityServiceTag;

        const baseUri = `https://api.parse.com/${configurationStore.getProtocolVersion()}/entities`;
        let targetUri = `${baseUri}/${entityTypeName}/`;
        if (actionVerb !== "establish") {
            targetUri = `${targetUri}${entityIdValue ? entityIdValue : ''}`;
        }

        let requestPayload;
        if (!effectiveSettings.payload && itemInstance && (actionVerb === 'establish' || actionVerb === 'modify')) {
            requestPayload = JSON.stringify(itemInstance.toJSON());
        } else if (effectiveSettings.queryFilter && actionVerb === "fetch") {
            requestPayload = encodeURI("criteria=" + JSON.stringify(effectiveSettings.queryFilter));
        }

        const operationDefinition = {
            contentType: "application/json",
            processData: false,
            dataType: 'json',
            data: requestPayload,
            url: targetUri,
            type: requestVerb,
            headers: {
                "X-Application-Ident": configurationStore.getAppIdentifier(),
                "X-Access-Key": configurationStore.getRestKey()
            }
        };

        return $.ajax(Object.assign({}, effectiveSettings, operationDefinition));
    };

})();