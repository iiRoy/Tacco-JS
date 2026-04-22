const _clientParameters = new WeakMap();
const _pipelineTransmissions = new WeakMap();
const _dataSchemaDefinitions = new WeakMap();

const _logServiceActivity = (instance, message) => {
    const parameters = _clientParameters.get(instance);
    if (parameters && parameters.debug) {
        console.info(`[PipelineService] ${message}`);
    }
};

const _IntegratedDataFramework = (function() {
    let _activeFrameworkReference = null;

    class DataRecord {
        constructor(attributes = {}) {
            this._rawAttributes = { ...attributes
            };
            Object.defineProperty(this, 'recordId', {
                get() {
                    return this._rawAttributes.recordId;
                },
                set(value) {
                    this._rawAttributes.recordId = value;
                },
                enumerable: true,
                configurable: true
            });
        }
        retrieveJsonData() {
            return { ...this._rawAttributes
            };
        }
    }

    class DataRecordSet extends Array {
        constructor(initialRecords = []) {
            super(...initialRecords);
            this._recordType = null;
            this._setLabel = null;
            this.recordConstructor = DataRecord;
        }

        updateRecords(records, options) {
            this.splice(0, this.length, ...records.map(rec => new this.recordConstructor(rec)));
        }
    }

    const _orchestrateDataSynchronization = async (operationType, dataObject, options, serviceInstance) => {
        const schemaConfig = _dataSchemaDefinitions.get(serviceInstance)[dataObject._recordType];
        if (!schemaConfig) {
            _logServiceActivity(serviceInstance, `Error: No schema configuration found for record type ${dataObject._recordType}`);
            options.error && options.error(new Error(`No schema configuration found for record type ${dataObject._recordType}`));
            return;
        }

        let apiCallMethod;
        let requestBody = {};
        let urlPathPlaceholders = {};

        if (dataObject instanceof DataRecordSet) {
            const collectionConfig = schemaConfig.collections.find(c => c.name === dataObject._setLabel);
            if (!collectionConfig || !collectionConfig.read) {
                _logServiceActivity(serviceInstance, `Error: Data record set ${dataObject._setLabel} has no read method defined.`);
                options.error && options.error(new Error(`Data record set ${dataObject._setLabel} has no read method defined.`));
                return;
            }
            apiCallMethod = serviceInstance.pipeline[collectionConfig.read];
            urlPathPlaceholders = options.data || {};
        } else if (dataObject instanceof DataRecord) {
            if (operationType === "update" && schemaConfig.update) {
                apiCallMethod = serviceInstance.pipeline[schemaConfig.update];
                requestBody = {
                    body: dataObject.retrieveJsonData()
                };
                urlPathPlaceholders[schemaConfig.id] = dataObject.recordId;
            } else if (operationType === "create" && schemaConfig.create) {
                apiCallMethod = serviceInstance.pipeline[schemaConfig.create];
                requestBody = {
                    body: dataObject.retrieveJsonData()
                };
            } else if (operationType === "delete" && schemaConfig.delete) {
                apiCallMethod = serviceInstance.pipeline[schemaConfig.delete];
                urlPathPlaceholders[schemaConfig.id] = dataObject.recordId;
                requestBody = {
                    body: dataObject.retrieveJsonData()
                };
            } else {
                _logServiceActivity(serviceInstance, `Error: No handler for operation type ${operationType} on record ${dataObject._recordType}`);
                options.error && options.error(new Error(`No handler for operation type ${operationType} on record ${dataObject._recordType}`));
                return;
            }
        } else {
            options.error && options.error(new Error("Unsupported data object type for synchronization."));
            return;
        }

        try {
            const responseData = await new Promise((resolve, reject) => {
                apiCallMethod({ ...urlPathPlaceholders,
                    ...requestBody
                }, resolve, reject);
            });

            if (options.success) {
                if (dataObject instanceof DataRecordSet) {
                    const collectionConfig = schemaConfig.collections.find(c => c.name === dataObject._setLabel);
                    const actualContent = collectionConfig.content ? responseData[collectionConfig.content] : responseData;

                    if (Array.isArray(actualContent)) {
                        actualContent.forEach(item => {
                            if (schemaConfig.id && item[schemaConfig.id]) {
                                item.recordId = item[schemaConfig.id];
                            }
                        });
                        options.success(actualContent);
                    } else if (actualContent !== undefined) {
                        const processedItem = { ...actualContent
                        };
                        if (schemaConfig.id && processedItem[schemaConfig.id]) {
                            processedItem.recordId = processedItem[schemaConfig.id];
                        }
                        options.success([processedItem]);
                    } else {
                        options.success([]);
                    }
                } else if (dataObject instanceof DataRecord) {
                    if (operationType === "create" || operationType === "update" || operationType === "delete") {
                        if (schemaConfig.id && responseData[schemaConfig.id]) {
                            responseData.recordId = responseData[schemaConfig.id];
                        }
                        options.success(responseData);
                    } else {
                        options.success(responseData);
                    }
                }
            }
        } catch (error) {
            _logServiceActivity(serviceInstance, `Data synchronization error for ${dataObject._recordType}: ${error.message}`);
            options.error && options.error(error);
        }
    };

    const GlobalDataRecordSets = {};

    const _createRecordInstance = (kindName, attributes) => {
        return new DataRecord(attributes);
    };

    const initializeFramework = (serviceInstance) => {
        _activeFrameworkReference = serviceInstance;

        const FrameworkShim = {
            createRecord: _createRecordInstance,
            Collections: GlobalDataRecordSets,
            _syncProcessor: (method, dataObject, options) => _orchestrateDataSynchronization(method, dataObject, options, serviceInstance),
            DataRecord: DataRecord,
            DataRecordSet: DataRecordSet
        };
        return FrameworkShim;
    };

    return {
        initializeFramework,
        GlobalDataRecordSets,
        DataRecord,
        DataRecordSet
    };
})();

class PipelineService {
    constructor() {
        _clientParameters.set(this, {});
        _pipelineTransmissions.set(this, []);
        _dataSchemaDefinitions.set(this, {});

        this.pipeline = {};
        this.dataAccess = {};

        this._internalDataFramework = null;
    }

    configureService(initializationParams) {
        const currentParams = _clientParameters.get(this);
        _clientParameters.set(this, { ...currentParams,
            ...initializationParams
        });

        this.setNetworkTransmissions(initializationParams.requestHeaders);

        if (initializationParams.methods) {
            initializationParams.methods.forEach(methodConfig => {
                this.registerApiOperation(methodConfig);
            });
        }

        if (initializationParams.models) {
            this._setupInternalDataFramework();
            initializationParams.models.forEach(modelConfig => {
                this.defineDataSchema(modelConfig);
            });
        }
    }

    setNetworkTransmissions(headerConfigurations) {
        const transmissions = [];
        for (const key in headerConfigurations) {
            if (Object.prototype.hasOwnProperty.call(headerConfigurations, key)) {
                transmissions.push({
                    name: key,
                    value: headerConfigurations[key]
                });
            }
        }
        _pipelineTransmissions.set(this, transmissions);
    }

    registerApiOperation(operationDefinition) {
        _logServiceActivity(this, `Registering API operation: ${operationDefinition.name}`);

        this.pipeline[operationDefinition.name] = (requestPayload, successCallback, failureCallback) => {
            let requestBodyContent,
                httpVerb = "GET",
                targetEndpointPath,
                finalFailureHandler = failureCallback;

            if (operationDefinition.post) httpVerb = "POST";
            if (operationDefinition.get) httpVerb = "GET";
            if (operationDefinition.put) httpVerb = "PUT";
            if (operationDefinition.delete) httpVerb = "DELETE";

            targetEndpointPath = operationDefinition[httpVerb.toLowerCase()] || operationDefinition.get;

            let resolvedPayload = {};
            let urlPathWithPlaceholders = targetEndpointPath;

            if (typeof requestPayload === "function" && !successCallback) {
                successCallback = requestPayload;
                requestPayload = {};
            } else if (requestPayload) {
                for (const key in requestPayload) {
                    if (Object.prototype.hasOwnProperty.call(requestPayload, key)) {
                        if (key === "body") {
                            requestBodyContent = requestPayload[key];
                        } else {
                            const placeholder = `<${key}>`;
                            while (urlPathWithPlaceholders.includes(placeholder)) {
                                const replacementValue = typeof requestPayload[key] === "object" ?
                                    JSON.stringify(requestPayload[key]) :
                                    String(requestPayload[key]);
                                urlPathWithPlaceholders = urlPathWithPlaceholders.replace(placeholder, replacementValue);
                            }
                            resolvedPayload[key] = requestPayload[key];
                        }
                    }
                }
            }

            if (operationDefinition.onLoad) {
                const originalSuccess = successCallback;
                successCallback = (data) => operationDefinition.onLoad(data, originalSuccess);
            }

            if (operationDefinition.onError) {
                finalFailureHandler = (error) => operationDefinition.onError(error, successCallback);
            }

            if (operationDefinition.expects) {
                const actualParameters = (httpVerb === "POST" && requestBodyContent) ? requestBodyContent : resolvedPayload;
                operationDefinition.expects.forEach(expectedParam => {
                    if (!Object.prototype.hasOwnProperty.call(actualParameters, expectedParam)) {
                        throw new Error(`PipelineService :: Missing parameter "${expectedParam}" for operation "${operationDefinition.name}"`);
                    }
                });
            } else {
                const currentParams = _clientParameters.get(this);
                if (currentParams.autoValidateParams) {
                    const missing = [];
                    const paramRegex = /<(\w+)>/g;
                    let match;
                    while ((match = paramRegex.exec(urlPathWithPlaceholders)) !== null) {
                        if (!Object.prototype.hasOwnProperty.call(resolvedPayload, match[1])) {
                            missing.push(match[0]);
                        }
                    }
                    if (missing.length > 0) {
                        throw new Error(`PipelineService :: Missing parameters ${missing.join(', ')} for operation "${operationDefinition.name}"`);
                    }
                }
            }

            this._initiateNetworkRequest({
                targetUrl: urlPathWithPlaceholders,
                method: httpVerb,
                dataPayload: requestBodyContent,
                requestTransmissions: operationDefinition.requestHeaders || operationDefinition.headers,
            }, successCallback, finalFailureHandler);
        };
    }

    _initiateNetworkRequest(requestDetails, completionHandler, exceptionHandler) {
        const currentParams = _clientParameters.get(this);
        const globalTransmissions = _pipelineTransmissions.get(this);

        const safelyParseJson = (text) => {
            try {
                return JSON.parse(text);
            } catch (e) {
                return text;
            }
        };

        _logServiceActivity(this, `::PipelineService:: ${currentParams.url ? currentParams.url + requestDetails.targetUrl : requestDetails.targetUrl}`);
        if (requestDetails.dataPayload) {
            _logServiceActivity(this, `::PipelineService:: ${JSON.stringify(requestDetails.dataPayload)}`);
        }

        const fullRequestUrl = (currentParams.url || '') + requestDetails.targetUrl;
        const fetchConfiguration = {
            method: requestDetails.method,
            headers: {}
        };

        let isFormUrlEncoded = false;

        globalTransmissions.forEach(header => {
            if (header.name === "Content-Type" && header.value === "application/x-www-form-urlencoded") {
                isFormUrlEncoded = true;
            }
            fetchConfiguration.headers[header.name] = typeof header.value === "function" ? header.value() : header.value;
        });

        if (requestDetails.requestTransmissions) {
            for (const headerName in requestDetails.requestTransmissions) {
                if (Object.prototype.hasOwnProperty.call(requestDetails.requestTransmissions, headerName)) {
                    if (headerName === "Content-Type" && requestDetails.requestTransmissions[headerName] === "application/x-www-form-urlencoded") {
                        isFormUrlEncoded = true;
                    }
                    fetchConfiguration.headers[headerName] = typeof requestDetails.requestTransmissions[headerName] === "function" ?
                        requestDetails.requestTransmissions[headerName]() :
                        requestDetails.requestTransmissions[headerName];
                }
            }
        }

        const dispatchRequest = (finalBodyData) => {
            if (finalBodyData && (requestDetails.method === "POST" || requestDetails.method === "PUT")) {
                if (isFormUrlEncoded) {
                    const formData = new URLSearchParams();
                    for (const key in finalBodyData) {
                        if (Object.prototype.hasOwnProperty.call(finalBodyData, key)) {
                            formData.append(key, finalBodyData[key]);
                        }
                    }
                    fetchConfiguration.body = formData.toString();
                    if (!fetchConfiguration.headers['Content-Type']) {
                         fetchConfiguration.headers['Content-Type'] = 'application/x-www-form-urlencoded';
                    }
                } else {
                    fetchConfiguration.body = JSON.stringify(finalBodyData);
                    if (!fetchConfiguration.headers['Content-Type']) {
                         fetchConfiguration.headers['Content-Type'] = 'application/json';
                    }
                }
            }

            const controller = new AbortController();
            const timeoutDuration = currentParams.timeout || 10000;
            const timeoutHandle = setTimeout(() => controller.abort(), timeoutDuration);
            fetchConfiguration.signal = controller.signal;

            fetch(fullRequestUrl, fetchConfiguration)
                .then(response => {
                    clearTimeout(timeoutHandle);
                    if (!response.ok) {
                        return response.text().then(text => {
                            const error = new Error(`HTTP network error! Status: ${response.status}`);
                            error.responseContent = safelyParseJson(text);
                            error.statusCode = response.status;
                            throw error;
                        });
                    }
                    return response.text().then(text => safelyParseJson(text));
                })
                .then(parsedResponse => {
                    if (currentParams.onLoad) {
                        currentParams.onLoad(parsedResponse, completionHandler);
                    } else if (completionHandler) {
                        completionHandler(parsedResponse);
                    }
                })
                .catch(error => {
                    clearTimeout(timeoutHandle);
                    const errorPayload = error.responseContent || safelyParseJson(error.message);
                    error.requestedUrl = requestDetails.targetUrl;

                    if (exceptionHandler) {
                        exceptionHandler(errorPayload);
                    } else if (currentParams.onError) {
                        currentParams.onError(errorPayload);
                    } else if (completionHandler) {
                        completionHandler(errorPayload);
                    } else {
                        throw new Error(`PipelineService :: No error handler or callback specified for: ${requestDetails.targetUrl}. Exception: ${error.message}`);
                    }
                });
        };

        if (requestDetails.method === "POST" && currentParams.beforePost) {
            const initialParams = requestDetails.dataPayload || {};
            currentParams.beforePost(initialParams, (modifiedParams) => {
                dispatchRequest(modifiedParams);
            });
        } else {
            dispatchRequest(requestDetails.dataPayload);
        }
    }

    _setupInternalDataFramework() {
        if (this._internalDataFramework) return;

        this._internalDataFramework = _IntegratedDataFramework.initializeFramework(this);

        this.dataAccess.createDataRecord = (kind, attributes) => {
            return new _IntegratedDataFramework.DataRecord(attributes);
        };

        this.dataAccess.synchronizeData = (method, dataObject, options) => {
            return this._internalDataFramework._syncProcessor(method, dataObject, options);
        };

        this.dataAccess.DataRecord = _IntegratedDataFramework.DataRecord;
        this.dataAccess.DataRecordSet = _IntegratedDataFramework.DataRecordSet;
        this.dataAccess.globalDataRecordSets = _IntegratedDataFramework.GlobalDataRecordSets;
    }

    defineDataSchema(schemaConfiguration) {
        const definitions = _dataSchemaDefinitions.get(this);
        definitions[schemaConfiguration.name] = schemaConfiguration;
        _dataSchemaDefinitions.set(this, definitions);

        const SpecificDataRecord = class extends _IntegratedDataFramework.DataRecord {
            constructor(attributes = {}) {
                super(attributes);
                this._recordType = schemaConfiguration.name;
                this._method = schemaConfiguration.name;
            }
        };

        if (schemaConfiguration.collections) {
            schemaConfiguration.collections.forEach(collection => {
                _IntegratedDataFramework.GlobalDataRecordSets[collection.name] = _IntegratedDataFramework.GlobalDataRecordSets[collection.name] || new _IntegratedDataFramework.DataRecordSet();
                _IntegratedDataFramework.GlobalDataRecordSets[collection.name]._recordType = schemaConfiguration.name;
                _IntegratedDataFramework.GlobalDataRecordSets[collection.name]._setLabel = collection.name;
                _IntegratedDataFramework.GlobalDataRecordSets[collection.name].recordConstructor = SpecificDataRecord;
            });
        }
    }
}

const createServiceInstance = () => new PipelineService();