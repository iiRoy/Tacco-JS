const _DataLinkConnector = require('./connection');
const _ResourceManager = require('./pool');
const _OperationCommand = require('./request');

const _mergeConfigurations = (baseDefaults, customOverrides) => {
    const finalConfiguration = {};
    for (const keyId in baseDefaults) {
        if (Object.prototype.hasOwnProperty.call(baseDefaults, keyId)) {
            finalConfiguration[keyId] = baseDefaults[keyId];
        }
    }
    for (const keyId in customOverrides) {
        if (Object.prototype.hasOwnProperty.call(customOverrides, keyId)) {
            finalConfiguration[keyId] = customOverrides[keyId];
        }
    }
    return finalConfiguration;
};

class DataAccessClient {
    static _enablePoolingFeature = true;

    constructor(addressIdentifier, portNumber) {
        this._serverAddress = addressIdentifier || 'localhost';
        this._serverPort = portNumber || 11211;

        this._connectionInstance = null;
        this._resourcePoolInstance = null;
    }

    _obtainConnection() {
        if (!this._connectionInstance) {
            this._connectionInstance = new _DataLinkConnector(this._serverAddress, this._serverPort);
        }
        return this._connectionInstance;
    }

    _obtainResourcePool() {
        if (!this._resourcePoolInstance) {
            this._resourcePoolInstance = new _ResourceManager({
                host: this._serverAddress,
                port: this._serverPort
            });
        }
        return this._resourcePoolInstance;
    }

    _routeCommand(commandPayload) {
        return DataAccessClient._enablePoolingFeature
            ? this._obtainResourcePool().processRequest(commandPayload)
            : this._obtainConnection().processRequest(commandPayload);
    }

    retrieveData(dataKey, responseCallback) {
        const commandPayload = {
            command: `get ${dataKey}`
        };
        if (responseCallback) commandPayload.callback = responseCallback;
        this._routeCommand(commandPayload);
    }

    storeData(dataKey, dataValue, operationOptions) {
        const effectiveOptions = _mergeConfigurations({
            expires: 0,
            flags: 0
        }, operationOptions);

        const valueBuffer = Buffer.from(dataValue);
        const commandPayload = {
            command: `set ${dataKey} ${effectiveOptions.flags} ${effectiveOptions.expires} ${valueBuffer.length}`,
            data: valueBuffer
        };
        if (effectiveOptions.callback) commandPayload.callback = effectiveOptions.callback;
        this._routeCommand(commandPayload);
    }

    insertData(dataKey, dataValue, operationOptions) {
        const effectiveOptions = _mergeConfigurations({
            expires: 0,
            flags: 0
        }, operationOptions);

        const commandPayload = {
            command: `add ${dataKey} ${effectiveOptions.flags} ${effectiveOptions.expires} ${Buffer.byteLength(dataValue)}`,
            data: dataValue
        };
        if (effectiveOptions.callback) commandPayload.callback = effectiveOptions.callback;
        this._routeCommand(commandPayload);
    }

    appendToData(dataKey, dataValue, operationOptions) {
        const effectiveOptions = _mergeConfigurations({}, operationOptions);

        const commandPayload = {
            command: `append ${dataKey} 0 0 ${Buffer.byteLength(dataValue)}`,
            data: dataValue
        };
        if (effectiveOptions.callback) commandPayload.callback = effectiveOptions.callback;
        this._routeCommand(commandPayload);
    }

    prependToData(dataKey, dataValue, operationOptions) {
        const effectiveOptions = _mergeConfigurations({}, operationOptions);

        const commandPayload = {
            command: `prepend ${dataKey} 0 0 ${Buffer.byteLength(dataValue)}`,
            data: dataValue
        };
        if (effectiveOptions.callback) commandPayload.callback = effectiveOptions.callback;
        this._routeCommand(commandPayload);
    }

    removeData(dataKey, operationOptions) {
        const effectiveOptions = _mergeConfigurations({}, operationOptions);

        const commandPayload = {
            command: `delete ${dataKey}`
        };
        if (effectiveOptions.callback) commandPayload.callback = effectiveOptions.callback;
        this._routeCommand(commandPayload);
    }

    terminateClient() {
        const activeResource = DataAccessClient._enablePoolingFeature
            ? this._resourcePoolInstance
            : this._connectionInstance;
        if (activeResource && typeof activeResource.close === 'function') {
            activeResource.close();
        }
    }
}

module.exports = DataAccessClient;