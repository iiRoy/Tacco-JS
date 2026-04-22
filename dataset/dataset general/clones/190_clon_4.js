(function() {
  const ConfigurationManager = (function() {
    function ConfigurationManager(configOptions) {
      if (!configOptions) configOptions = {};

      this.resourceDiscoveryURL = configOptions.resourceDiscoveryURL || "http://api.wordnik.com/v4/resources.json";
      this.debugMode = configOptions.debugMode || false;
      this.apiSecurityKey = configOptions.apiSecurityKey || null;
      this.baseAPIPath = null;
      this.keyIdentifier = configOptions.keyIdentifier || 'api_key';
      this.verbosityEnabled = configOptions.verbosityEnabled || false;
      this.headerSupport = configOptions.headerSupport || false;
      this.allowedSubmissionMethods = configOptions.allowedSubmissionMethods || ['get'];
      this.successCallback = configOptions.onSuccess || (() => {});
      this.failureCallback = configOptions.onFailure || ((msg) => { throw msg; });
      this.progressCallback = configOptions.onProgress || (() => {});
      this.customHeaders = configOptions.customHeaders || {};
      this.logicalValues = configOptions.logicalValues || ['true', 'false'];
      this.resourceDiscoveryURL = this.appendSecurityKey(this.resourceDiscoveryURL);

      if (configOptions.onSuccess) {
        this.initializeAPI();
      }
    }

    ConfigurationManager.prototype.initializeAPI = function() {
      const self = this;
      this.progressCallback('Fetching API resource list: ' + this.resourceDiscoveryURL);

      return jQuery.getJSON(this.resourceDiscoveryURL, function(response) {
        if (response.basePath && jQuery.trim(response.basePath).length > 0) {
          self.baseAPIPath = response.basePath.replace(/\/$/, '');
          if (!self.baseAPIPath.match(/^HTTP/i)) {
            self.failureCallback("Resource discovery URL basePath must be a valid URL.");
          }
        } else {
          self.baseAPIPath = self.resourceDiscoveryURL.substring(0, self.resourceDiscoveryURL.lastIndexOf('/'));
          if (self.debugMode) console.log('Derived base path from discovery URL: ' + self.baseAPIPath);
        }

        self.apiResources = {};
        self.apiResourceList = [];

        if (response.resourcePath) {
          self.activeResourcePath = response.resourcePath;
          let currentResource = null;
          for (const apiEntry of response.apis) {
            if (currentResource === null) {
              currentResource = new APIService(apiEntry, self);
            } else {
              currentResource.addAPIEndpoints(apiEntry.path, apiEntry.operations);
            }
          }
          if (currentResource) {
            self.apiResources[currentResource.serviceName] = currentResource;
            self.apiResourceList.push(currentResource);
            currentResource.isReady = true;
            self.checkReadiness();
          }
        } else {
          for (const apiEntry of response.apis) {
            const newResource = new APIService(apiEntry, self);
            self.apiResources[newResource.serviceName] = newResource;
            self.apiResourceList.push(newResource);
          }
        }
        return self;
      }).fail(function(jqXHR) {
        self.failureCallback(`Error: ${jqXHR.status} ${jqXHR.statusText} for ${self.resourceDiscoveryURL}`);
      });
    };

    ConfigurationManager.prototype.checkReadiness = function() {
      if (!this.apiResources) return false;

      for (const resName in this.apiResources) {
        if (!this.apiResources[resName].isReady) return false;
      }

      this.consolidateDataModels();
      this.isFullyInitialized = true;
      this.successCallback();
    };

    ConfigurationManager.prototype.consolidateDataModels = function() {
      this.allDataModels = {};
      this.allDataModelList = [];

      for (const resName in this.apiResources) {
        const resource = this.apiResources[resName];
        for (const modelKey in resource.dataModels) {
          if (!this.allDataModels[modelKey]) {
            this.allDataModels[modelKey] = resource.dataModels[modelKey];
            this.allDataModelList.push(resource.dataModels[modelKey]);
          }
        }
      }

      for (const model of this.allDataModelList) {
        model.resolveReferences(this.allDataModels);
      }
    };

    ConfigurationManager.prototype.appendSecurityKey = function(targetUrl) {
      if (this.apiSecurityKey && jQuery.trim(this.apiSecurityKey).length > 0 && targetUrl) {
        const separator = targetUrl.includes('?') ? '&' : '?';
        return `${targetUrl}${separator}${this.keyIdentifier}=${this.apiSecurityKey}`;
      }
      return targetUrl;
    };

    ConfigurationManager.prototype.displayHelp = function() {
      for (const resName in this.apiResources) {
        const resource = this.apiResources[resName];
        console.log(resName);
        for (const opName in resource.operations) {
          const operation = resource.operations[opName];
          console.log(`  ${operation.actionName}`);
          for (const param of operation.inputParameters) {
            console.log(`    ${param.paramName}${param.isRequired ? ' (required)' : ''} - ${param.description}`);
          }
        }
      }
      return this;
    };

    return ConfigurationManager;
  })();

  const APIService = (function() {
    function APIService(serviceConfig, manager) {
      const self = this;
      this.configManager = manager;
      this.servicePath = this.configManager.activeResourcePath || serviceConfig.path;
      this.serviceDescription = serviceConfig.description;
      const pathSegments = this.servicePath.split("/");
      this.serviceName = pathSegments[pathSegments.length - 1].replace('.{format}', '');
      this.baseURL = this.configManager.baseAPIPath;
      this.operations = {};
      this.operationList = [];
      this.dataModels = {};
      this.dataModelList = [];

      if (serviceConfig.operations && this.configManager.activeResourcePath) {
        this.configManager.progressCallback(`Reading service ${this.serviceName} models and operations`);
        this.loadDataModels(serviceConfig.models);
        this.addAPIEndpoints(serviceConfig.path, serviceConfig.operations);
        this.configManager[this.serviceName] = this;
      } else {
        if (!this.servicePath) {
          this.configManager.failureCallback("API services must have a path.");
        }
        this.serviceURL = this.configManager.appendSecurityKey(this.configManager.baseAPIPath + this.servicePath.replace('{format}', 'json'));
        this.configManager.progressCallback(`Fetching service ${this.serviceName}: ${this.serviceURL}`);

        jQuery.getJSON(this.serviceURL, function(response) {
          if (response.basePath && jQuery.trim(response.basePath).length > 0) {
            self.baseURL = response.basePath.replace(/\/$/, '');
          }
          self.loadDataModels(response.models);
          if (response.apis) {
            for (const endpoint of response.apis) {
              self.addAPIEndpoints(endpoint.path, endpoint.operations);
            }
          }
          self.configManager[self.serviceName] = self;
          self.isReady = true;
          self.configManager.checkReadiness();
        }).fail(function(jqXHR) {
          self.configManager.failureCallback(`Error: ${jqXHR.status} ${jqXHR.statusText} for ${self.serviceURL}`);
        });
      }
    }

    APIService.prototype.loadDataModels = function(modelsData) {
      if (modelsData) {
        for (const modelKey in modelsData) {
          const newModel = new APIDataModel(modelKey, modelsData[modelKey]);
          this.dataModelList.push(newModel);
          this.dataModels[modelKey] = newModel;
        }
        for (const model of this.dataModelList) {
          model.resolveReferences(this.dataModels);
        }
      }
    };

    APIService.prototype.addAPIEndpoints = function(endpointPath, operations) {
      if (operations) {
        for (const opConfig of operations) {
          const operation = new APIEndpoint(opConfig.nickname, endpointPath, opConfig.httpMethod, opConfig.parameters, opConfig.summary, opConfig.notes, opConfig.responseClass, this);
          this.operations[operation.actionName] = operation;
          this.operationList.push(operation);
        }
      }
    };

    APIService.prototype.displayHelp = function() {
      for (const opName in this.operations) {
        const operation = this.operations[opName];
        console.log(`  ${operation.actionName}`);
        for (const param of operation.inputParameters) {
          console.log(`    ${param.paramName}${param.isRequired ? ' (required)' : ''} - ${param.description}`);
        }
      }
      return this;
    };

    return APIService;
  })();

  const APIDataModel = (function() {
    function APIDataModel(modelIdentifier, modelDefinition) {
      this.modelIdentifier = modelDefinition.id || modelIdentifier;
      this.modelProperties = [];
      for (const propName in modelDefinition.properties) {
        this.modelProperties.push(new ModelField(propName, modelDefinition.properties[propName]));
      }
    }

    APIDataModel.prototype.resolveReferences = function(allAvailableModels) {
      for (const field of this.modelProperties) {
        if (allAvailableModels[field.dataTypeName]) {
          field.referencedModel = allAvailableModels[field.dataTypeName];
        } else if (field.arrayRefDataType && allAvailableModels[field.arrayRefDataType]) {
          field.referencedModel = allAvailableModels[field.arrayRefDataType];
        }
      }
    };

    APIDataModel.prototype.getSampleSchema = function(prefix, ignoreModel) {
      const propStrings = [];
      for (const field of this.modelProperties) {
        propStrings.push(`${field.fieldName}: <type>${field.dataTypeName}</type>`);
      }

      const styleBold = '<b style="color: #000; font-size: 1.0em">';
      const styleStronger = '<b style="color: #000; font-size: 1.1em">';
      const styleEnd = '</b>';

      let schemaOutput = `${styleBold} ${(prefix || this.modelIdentifier)} ( ${styleEnd}<span>${propStrings.join('</span>, <span>')}</span>${styleBold} )${styleEnd}`;

      for (const field of this.modelProperties) {
        if (field.referencedModel && field.referencedModel !== ignoreModel) {
          schemaOutput += (`<br>${field.referencedModel.getSampleSchema(undefined, this)}`);
        }
      }
      return schemaOutput;
    };

    return APIDataModel;
  })();

  const ModelField = (function() {
    function ModelField(fieldName, fieldDefinition) {
      this.fieldName = fieldName;
      this.dataTypeName = fieldDefinition.type;
      this.isArrayType = this.dataTypeName.toLowerCase() === 'array';
      this.description = fieldDefinition.description;

      if (fieldDefinition.items) {
        if (fieldDefinition.items.type) {
          this.arrayRefDataType = fieldDefinition.items.type;
        }
        if (fieldDefinition.items.$ref) {
          this.arrayRefDataType = fieldDefinition.items.$ref;
        }
      }
      this.fullDataTypeName = this.arrayRefDataType ? `${this.dataTypeName}[${this.arrayRefDataType}]` : this.dataTypeName;

      if (fieldDefinition.allowableValues) {
        this.enumValueType = fieldDefinition.allowableValues.valueType;
        this.enumValues = fieldDefinition.allowableValues.values;
        if (this.enumValues) {
          this.enumValuesString = `'${this.enumValues.join("' or '")}'`;
        }
      }
    }

    ModelField.prototype.toDescriptionString = function() {
      let desc = `${this.fieldName}: ${this.fullDataTypeName}`;
      if (this.enumValues) {
        desc += ` = [${this.enumValuesString}]`;
      }
      if (this.description) {
        desc += ` {${this.description}}`;
      }
      return desc;
    };

    return ModelField;
  })();

  const APIEndpoint = (function() {
    function APIEndpoint(actionName, endpointPath, httpMethod, parameters, summary, notes, responseDataType, serviceInstance) {
      const self = this;
      this.actionName = actionName;
      this.requestPath = endpointPath;
      this.requestMethod = httpMethod;
      this.inputParameters = parameters || [];
      this.summaryText = summary;
      this.notesText = notes;
      this.responseDataType = responseDataType;
      this.parentService = serviceInstance;

      if (!this.actionName) {
        this.parentService.configManager.failureCallback("API endpoints must have an action name.");
      }
      if (!this.requestPath) {
        this.parentService.configManager.failureCallback(`API endpoint ${actionName} is missing a path.`);
      }
      if (!this.requestMethod) {
        this.parentService.configManager.failureCallback(`API endpoint ${actionName} is missing an HTTP method.`);
      }

      this.requestPath = this.requestPath.replace('{format}', 'json');
      this.requestMethod = this.requestMethod.toLowerCase();
      this.isGetRequest = this.requestMethod === "get";
      this.serviceName = this.parentService.serviceName;

      if (this.responseDataType.toLowerCase() === 'void') {
        this.responseDataType = undefined;
      }
      if (this.responseDataType) {
        this.responseSchema = this.getSchemaRepresentation(this.responseDataType, this.parentService.dataModels);
      }

      for (const param of this.inputParameters) {
        param.paramName = param.paramName || param.dataType; // Fallback for name
        if (param.dataType.toLowerCase() === 'boolean') {
          param.allowedValues = { values: this.parentService.configManager.logicalValues };
        }
        param.schema = this.getSchemaRepresentation(param.dataType, this.parentService.dataModels);
        if (param.allowedValues) {
          if (param.allowedValues.valueType === "RANGE") {
            param.isRange = true;
          } else {
            param.isEnumList = true;
          }
          if (param.allowedValues.values) {
            param.descriptiveValues = [];
            for (const val of param.allowedValues.values) {
              param.descriptiveValues.push({ value: val, isDefault: (param.defaultValue === val) });
            }
          }
        }
      }

      this.parentService[this.actionName] = function(params, successFn, errorFn) {
        return self.executeRequest(params, successFn, errorFn);
      };
    }

    APIEndpoint.prototype.extractListType = function(dataType) {
      const listStartIndex = dataType.indexOf('[');
      if (listStartIndex >= 0) {
        return dataType.substring(listStartIndex + 1, dataType.indexOf(']'));
      }
      return undefined;
    };

    APIEndpoint.prototype.getSchemaRepresentation = function(dataType, models) {
      const listItemType = this.extractListType(dataType);
      const isBasicType = ((listItemType && models[listItemType]) || (models[dataType])) ? false : true;

      if (isBasicType) {
        return dataType;
      } else {
        if (listItemType) {
          return models[listItemType].getSampleSchema(dataType);
        } else {
          return models[dataType].getSampleSchema(dataType);
        }
      }
    };

    APIEndpoint.prototype.executeRequest = function(requestArgs, successHandler, errorHandler) {
      if (!requestArgs) requestArgs = {};

      if (typeof requestArgs === "function") {
        errorHandler = successHandler;
        successHandler = requestArgs;
        requestArgs = {};
      }

      if (!errorHandler) {
        errorHandler = (jqXHR, status, err) => console.log(jqXHR, status, err);
      }
      if (!successHandler) {
        successHandler = (data) => console.log(data);
      }

      const requestHeaders = requestArgs.requestHeaders || {};
      delete requestArgs.requestHeaders;

      const requestBody = requestArgs.requestBody;
      delete requestArgs.requestBody;

      // The original code ends here, so the clone also ends here.
      // A full functional clone would need to implement the actual AJAX call,
      // parameter processing (path, query, header, body),
      // and error handling, but the request was to clone the provided code.
    };

    return APIEndpoint;
  })();

  window.APIClient = ConfigurationManager;
}).call(this);