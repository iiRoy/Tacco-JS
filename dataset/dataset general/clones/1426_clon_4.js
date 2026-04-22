const reportLog = (...data) => {
    if (typeof console !== 'undefined' && console.log) {
        console.log(...data);
    }
};

const performRequest = async (urlPath, requestConfig = {}) => {
    try {
        const responseData = await fetch(urlPath, requestConfig);
        if (!responseData.ok) {
            const errorText = await responseData.text();
            throw new Error(`HTTP error! Status: ${responseData.status}, URL: ${urlPath}, Response: ${errorText}`);
        }
        return await responseData.json();
    } catch (issue) {
        throw issue;
    }
};

const createSchemaField = (fieldIdentifier, fieldDefinition) => {
    const instance = {};
    instance.fieldIdentifier = fieldIdentifier;
    instance.fieldType = fieldDefinition.type;
    instance.isArrayOrList = instance.fieldType && (['array', 'list', 'set'].includes(instance.fieldType.toLowerCase()));
    instance.fieldDescription = fieldDefinition.description;
    instance.isRequired = fieldDefinition.required;

    if (fieldDefinition.items) {
        if (fieldDefinition.items.type) {
            instance.referencedFieldType = fieldDefinition.items.type;
        }
        if (fieldDefinition.items.$ref) {
            instance.referencedFieldType = fieldDefinition.items.$ref;
        }
    }
    instance.fullFieldType = instance.referencedFieldType ? `${instance.fieldType}[${instance.referencedFieldType}]` : instance.fieldType;

    if (fieldDefinition.allowableValues) {
        instance.permittedValuesType = fieldDefinition.allowableValues.valueType;
        instance.valueOptions = fieldDefinition.allowableValues.values;
        if (instance.valueOptions) {
            instance.valueOptionsString = `'${instance.valueOptions.join("' or '")}'`;
        }
    }

    instance.obtainSampleValue = (ignoredSchemas) => {
        let sampleResult;
        if (instance.referencedSchema && (!ignoredSchemas || !ignoredSchemas.includes(instance.referencedSchema.schemaIdentifier))) {
            sampleResult = instance.referencedSchema.produceSampleData(ignoredSchemas ? [...ignoredSchemas, instance.referencedSchema.schemaIdentifier] : [instance.referencedSchema.schemaIdentifier]);
        } else {
            switch (instance.fieldType ? instance.fieldType.toLowerCase() : '') {
                case 'integer':
                case 'number':
                    sampleResult = 0;
                    break;
                case 'boolean':
                    sampleResult = true;
                    break;
                case 'string':
                    sampleResult = 'string';
                    break;
                default:
                    sampleResult = instance.fieldType || 'object';
            }
        }
        return instance.isArrayOrList ? [sampleResult] : sampleResult;
    };

    instance.formatFieldRepresentation = () => {
        let fieldStatus = instance.isRequired ? 'property-mandatory' : 'property-optional';
        let representation = `<span class="property-name ${fieldStatus}">${instance.fieldIdentifier}</span> (<span class="property-type">${instance.fullFieldType}</span>`;
        if (!instance.isRequired) {
            representation += ', <span class="property-meta">optional</span>';
        }
        representation += ')';
        if (instance.valueOptions) {
            representation += ` = <span class='property-values'>[${instance.valueOptionsString}]</span>`;
        }
        if (instance.fieldDescription) {
            representation += `: <span class="property-description">${instance.fieldDescription}</span>`;
        }
        return representation;
    };

    return instance;
};

const createDataSchema = (schemaIdentifier, schemaDefinition) => {
    const instance = {};
    instance.schemaIdentifier = schemaDefinition.id || schemaIdentifier;
    instance.schemaFields = [];

    for (const propName in schemaDefinition.properties) {
        instance.schemaFields.push(createSchemaField(propName, schemaDefinition.properties[propName]));
    }

    instance.resolveSchemaReferences = (allSchemas) => {
        for (const field of instance.schemaFields) {
            if (allSchemas[field.fieldType]) {
                field.referencedSchema = allSchemas[field.fieldType];
            } else if (field.referencedFieldType && allSchemas[field.referencedFieldType]) {
                field.referencedSchema = allSchemas[field.referencedFieldType];
            }
        }
    };

    instance.generateSchemaLayout = (ignoredSchemas = []) => {
        const fieldStrings = instance.schemaFields.map(field => field.formatFieldRepresentation());
        const strongStyle = '<span class="strong-label">';
        const strongEnd = '</span>';

        let layout = `${strongStyle}${instance.schemaIdentifier} {${strongEnd}<div>${fieldStrings.join(',</div><div>')}</div>${strongStyle}}${strongEnd}`;

        const currentIgnored = [...ignoredSchemas, instance];

        for (const field of instance.schemaFields) {
            if (field.referencedSchema && !currentIgnored.includes(field.referencedSchema)) {
                layout += `<br>${field.referencedSchema.generateSchemaLayout(currentIgnored)}`;
            }
        }
        return layout;
    };

    instance.produceSampleData = (ignoredSchemas = []) => {
        const sampleObject = {};
        const currentIgnored = [...ignoredSchemas, instance.schemaIdentifier];

        for (const field of instance.schemaFields) {
            sampleObject[field.fieldIdentifier] = field.obtainSampleValue(currentIgnored);
        }
        return sampleObject;
    };

    return instance;
};

const createActionItem = (actionName, pathSegment, verb, params, summaryText, notesText, returnSchemaIdentifier, failureResponses, parentResource, requestConsumes, responseProduces) => {
    const instance = {};
    instance.actionName = actionName;
    instance.pathSegment = pathSegment;
    instance.verb = verb ? verb.toLowerCase() : 'get';
    instance.actionParameters = params || [];
    instance.summaryText = summaryText;
    instance.notesText = notesText;
    instance.returnSchemaIdentifier = returnSchemaIdentifier;
    instance.failureResponses = failureResponses || [];
    instance.parentResource = parentResource;
    instance.requestConsumes = requestConsumes;
    instance.responseProduces = responseProduces;

    if (!instance.actionName) {
        parentResource.registry.signalFailureAndTerminate("ActionItem must have an action name.");
    }
    if (!instance.pathSegment) {
        parentResource.registry.signalFailureAndTerminate(`ActionItem ${actionName} is missing path segment.`);
    }
    if (!instance.verb) {
        parentResource.registry.signalFailureAndTerminate(`ActionItem ${actionName} is missing verb.`);
    }

    instance.pathSegment = instance.pathSegment.replace('{format}', 'json');
    instance.isFetchVerb = instance.verb === 'get';

    if (instance.returnSchemaIdentifier && instance.returnSchemaIdentifier.toLowerCase() === 'void') {
        instance.returnSchemaIdentifier = undefined;
    }

    const getFieldSignature = (dataType, schemas) => {
        const schema = schemas[dataType];
        if (schema) {
            return schema.generateSchemaLayout();
        }
        return dataType;
    };

    const getFieldSample = (dataType, schemas) => {
        const schema = schemas[dataType];
        if (schema) {
            return schema.produceSampleData();
        }
        return dataType;
    };

    if (instance.returnSchemaIdentifier) {
        instance.returnSchemaLayout = getFieldSignature(instance.returnSchemaIdentifier, parentResource.dataSchemas);
        instance.returnSampleData = getFieldSample(instance.returnSchemaIdentifier, parentResource.dataSchemas);
    }

    for (const param of instance.actionParameters) {
        param.identifier = param.name || param.dataType;
        if (param.dataType && param.dataType.toLowerCase() === 'boolean') {
            param.permittedValues = {
                values: parentResource.registry.truthyFalsyValues
            };
        }
        param.layout = getFieldSignature(param.dataType, parentResource.dataSchemas);
        param.sample = getFieldSample(param.dataType, parentResource.dataSchemas);

        if (param.permittedValues) {
            if (param.permittedValues.valueType === "RANGE") {
                param.isRangeLimited = true;
            } else {
                param.isSelectionList = true;
            }
            if (param.permittedValues.values) {
                param.permittedValues.descriptiveValues = param.permittedValues.values.map(val => ({
                    value: val,
                    isDefault: (param.defaultValue !== undefined && param.defaultValue === val)
                }));
            }
        }
    }

    instance.executeAction = function(parameters, auth, successCallback, errorCallback) {
        reportLog(`Executing action: ${this.actionName} with parameters:`, parameters);
        if (typeof successCallback === 'function') {
            successCallback({
                message: `Action ${this.actionName} executed.`
            });
        }
    }.bind(instance);

    return instance;
};

const createEndpointGroup = (endpointDefinition, registryInstance) => {
    const instance = {};
    instance.registry = registryInstance;
    instance.groupPath = registryInstance.resourcePath !== undefined ? registryInstance.resourcePath : endpointDefinition.path;
    instance.groupDescription = endpointDefinition.description;

    const pathSegments = instance.groupPath.split("/");
    instance.groupName = pathSegments[pathSegments.length - 1].replace('.{format}', '');
    instance.groupBasePath = registryInstance.rootResourcePath;
    instance.actionItems = {};
    instance.actionItemsList = [];
    instance.dataSchemasList = [];
    instance.dataSchemas = {};
    instance.isReady = false;

    instance.incorporateDataSchemas = (schemaPayload) => {
        if (!schemaPayload) return;
        for (const schemaName in schemaPayload) {
            if (!instance.dataSchemas[schemaName]) {
                const newSchema = createDataSchema(schemaName, schemaPayload[schemaName]);
                instance.dataSchemasList.push(newSchema);
                instance.dataSchemas[schemaName] = newSchema;
            }
        }
        for (const schema of instance.dataSchemasList) {
            schema.resolveSchemaReferences(instance.dataSchemas);
        }
    };

    instance.incorporateActionItems = (pathSegment, actionsPayload) => {
        if (!actionsPayload) return;
        for (const actionDefinition of actionsPayload) {
            const newAction = createActionItem(
                actionDefinition.nickname,
                pathSegment,
                actionDefinition.httpMethod,
                actionDefinition.parameters,
                actionDefinition.summary,
                actionDefinition.notes,
                actionDefinition.responseClass,
                actionDefinition.errorResponses,
                instance,
                actionDefinition.consumes || actionDefinition.supportedContentTypes,
                actionDefinition.produces
            );
            instance.actionItems[newAction.actionName] = newAction;
            instance.actionItemsList.push(newAction);
            instance[newAction.actionName] = newAction.executeAction;
        }
    };

    instance.displayGroupActions = () => {
        for (const actionIdentifier in instance.actionItems) {
            const currentAction = instance.actionItems[actionIdentifier];
            reportLog(`  ${currentAction.actionName}`);
            for (const param of currentAction.actionParameters) {
                reportLog(`    ${param.identifier}${param.isRequired ? ' (mandatory)' : ''} - ${param.fieldDescription}`);
            }
        }
        return instance;
    };

    if (endpointDefinition.operations && registryInstance.resourcePath) {
        registryInstance.statusUpdateCallback(`reading endpoint group ${instance.groupName} schemas and actions`);
        instance.incorporateDataSchemas(endpointDefinition.models);
        instance.incorporateActionItems(endpointDefinition.path, endpointDefinition.operations);
        registryInstance.endpointGroups[instance.groupName] = instance;
        registryInstance.endpointGroupList.push(instance);
        instance.isReady = true;
    } else {
        if (!instance.groupPath) {
            registryInstance.signalFailureAndTerminate("EndpointGroup must have a path.");
        }
        instance.url = registryInstance.appendCredentialToURL(registryInstance.rootResourcePath + instance.groupPath.replace('{format}', 'json'));
        registryInstance.statusUpdateCallback(`fetching endpoint group ${instance.groupName}: ${instance.url}`);

        performRequest(instance.url)
            .then(responsePayload => {
                if (responsePayload.basePath && responsePayload.basePath.trim().length > 0) {
                    instance.groupBasePath = responsePayload.basePath.replace(/\/$/, '');
                }
                instance.incorporateDataSchemas(responsePayload.models);
                if (responsePayload.apis) {
                    for (const apiEndpoint of responsePayload.apis) {
                        instance.incorporateActionItems(apiEndpoint.path, apiEndpoint.operations);
                    }
                }
                registryInstance.endpointGroups[instance.groupName] = instance;
                registryInstance.endpointGroupList.push(instance);
                instance.isReady = true;
                registryInstance.finalizeServiceDiscovery();
            })
            .catch(issue => {
                registryInstance.signalFailureAndTerminate(`Unable to read endpoint group '${instance.groupName}' from path ${instance.url} (server returned ${issue.message})`);
            });
    }

    return instance;
};

const createServiceRegistryManager = (configOptions = {}) => {
    const registry = {};

    registry.metadataSourcePath = "http://api.wordnik.com/v4/resources.json";
    registry.verboseLogging = false;
    registry.accessCredential = null;
    registry.rootResourcePath = null;
    registry.credentialIdentifier = 'api_key';
    registry.completionCallback = null;
    registry.errorCallback = () => {};
    registry.statusUpdateCallback = () => {};
    registry.requestHeaders = {};
    registry.truthyFalsyValues = ['true', 'false'];
    registry.apiVersion = null;
    registry.resourcePath = null;
    registry.endpointGroups = {};
    registry.endpointGroupList = [];
    registry.dataSchemas = {};
    registry.dataSchemasList = [];
    registry.isInitialized = false;

    if (configOptions.discoveryUrl) registry.metadataSourcePath = configOptions.discoveryUrl;
    if (configOptions.debug !== undefined) registry.verboseLogging = configOptions.debug;
    if (configOptions.apiKeyName) registry.credentialIdentifier = configOptions.apiKeyName;
    if (configOptions.apiKey) registry.accessCredential = configOptions.apiKey;
    if (configOptions.api_key) registry.accessCredential = configOptions.api_key;
    if (configOptions.verbose !== undefined) registry.verboseLogging = configOptions.verbose;
    registry.supportsHeaderParameters = configOptions.supportHeaderParams !== undefined ? configOptions.supportHeaderParams : false;
    registry.supportedVerbs = configOptions.supportedSubmitMethods || ['get'];
    if (configOptions.success) registry.completionCallback = configOptions.success;
    if (configOptions.failure) registry.errorCallback = configOptions.failure;
    if (configOptions.progress) registry.statusUpdateCallback = configOptions.progress;
    if (configOptions.headers) registry.requestHeaders = configOptions.headers;
    if (configOptions.booleanValues) registry.truthyFalsyValues = configOptions.booleanValues;

    registry.metadataSourcePath = registry.appendCredentialToURL(registry.metadataSourcePath);

    if (registry.completionCallback) {
        registry.establishServiceMetadata();
    }

    registry.establishServiceMetadata = async () => {
        registry.statusUpdateCallback(`fetching resource list: ${registry.metadataSourcePath}`);
        try {
            const discoveryResponse = await performRequest(registry.metadataSourcePath);

            if (discoveryResponse.apiVersion) {
                registry.apiVersion = discoveryResponse.apiVersion;
            }
            if (discoveryResponse.basePath && discoveryResponse.basePath.trim().length > 0) {
                registry.rootResourcePath = discoveryResponse.basePath;
                if (!registry.rootResourcePath.match(/^HTTP/i)) {
                    registry.signalFailureAndTerminate("metadataSourcePath basePath must be a URL.");
                }
                registry.rootResourcePath = registry.rootResourcePath.replace(/\/$/, '');
            } else {
                const lastSlashIndex = registry.metadataSourcePath.lastIndexOf('/');
                if (lastSlashIndex !== -1) {
                    registry.rootResourcePath = registry.metadataSourcePath.substring(0, lastSlashIndex);
                } else {
                    registry.rootResourcePath = ''; // Default to empty if no slash found
                }
                reportLog(`derived rootResourcePath from metadataSourcePath as ${registry.rootResourcePath}`);
            }

            if (discoveryResponse.resourcePath) {
                registry.resourcePath = discoveryResponse.resourcePath;
                let singleGroup = null;
                for (const resourceDef of discoveryResponse.apis) {
                    if (singleGroup === null) {
                        singleGroup = createEndpointGroup(resourceDef, registry);
                    } else {
                        singleGroup.incorporateActionItems(resourceDef.path, resourceDef.operations);
                    }
                }
                if (singleGroup) {
                    registry.endpointGroups[singleGroup.groupName] = singleGroup;
                    registry.endpointGroupList.push(singleGroup);
                    singleGroup.isReady = true;
                    registry.finalizeServiceDiscovery();
                }
            } else {
                for (const resourceDef of discoveryResponse.apis) {
                    const newGroup = createEndpointGroup(resourceDef, registry);
                    // EndpointGroup constructor handles adding itself to registry.endpointGroups and registry.endpointGroupList
                }
                const allImmediate = registry.endpointGroupList.every(g => g.isReady);
                if (allImmediate) {
                   registry.finalizeServiceDiscovery();
                }
            }
            return registry;

        } catch (issue) {
            if (registry.metadataSourcePath.substring(0, 4) !== 'http') {
                return registry.signalFailureAndTerminate('Please specify the protocol for ' + registry.metadataSourcePath);
            } else if (issue.message.includes('Status: 0')) {
                return registry.signalFailureAndTerminate('Cannot reach server. It may not have appropriate CORS settings.');
            } else if (issue.message.includes('Status: 404')) {
                return registry.signalFailureAndTerminate('Cannot read service metadata from ' + registry.metadataSourcePath);
            } else {
                return registry.signalFailureAndTerminate(`${issue.message} : ${registry.metadataSourcePath}`);
            }
        }
    };

    registry.finalizeServiceDiscovery = () => {
        if (!registry.endpointGroups) {
            return false;
        }
        for (const groupName in registry.endpointGroups) {
            if (!registry.endpointGroups[groupName].isReady) {
                return false;
            }
        }
        registry.collateDataSchemas();
        registry.isInitialized = true;
        if (registry.completionCallback) {
            return registry.completionCallback();
        }
    };

    registry.signalFailureAndTerminate = (message) => {
        registry.errorCallback(message);
        throw new Error(message);
    };

    registry.collateDataSchemas = () => {
        registry.dataSchemasList = [];
        registry.dataSchemas = {};
        for (const groupName in registry.endpointGroups) {
            const currentGroup = registry.endpointGroups[groupName];
            for (const schemaName in currentGroup.dataSchemas) {
                if (!registry.dataSchemas[schemaName]) {
                    registry.dataSchemas[schemaName] = currentGroup.dataSchemas[schemaName];
                    registry.dataSchemasList.push(currentGroup.dataSchemas[schemaName]);
                }
            }
        }
        for (const schema of registry.dataSchemasList) {
            schema.resolveSchemaReferences(registry.dataSchemas);
        }
    };

    registry.appendCredentialToURL = (targetURL) => {
        if (registry.accessCredential && registry.accessCredential.trim().length > 0 && targetURL) {
            const separator = targetURL.includes('?') ? '&' : '?';
            return `${targetURL}${separator}${registry.credentialIdentifier}=${registry.accessCredential}`;
        } else {
            return targetURL;
        }
    };

    registry.displayServiceOverview = () => {
        for (const groupName in registry.endpointGroups) {
            const group = registry.endpointGroups[groupName];
            reportLog(groupName);
            for (const actionName in group.actionItems) {
                const action = group.actionItems[actionName];
                reportLog(`  ${action.actionName}`);
                for (const param of action.actionParameters) {
                    reportLog(`    ${param.identifier}${param.isRequired ? ' (mandatory)' : ''} - ${param.fieldDescription}`);
                }
            }
        }
        return registry;
    };

    return registry;
};