// This module provides a client for interacting with API schemas.
(function() {
  var SchemaClient, ServiceModule, SchemaDefinition, TypeAttribute, EndpointAction, RequestExecutor,
    _boundMethod = function(methodFn, contextObj){ return function(){ return methodFn.apply(contextObj, arguments); }; };

  // A utility for making AJAX requests, simulating jQuery.
  // In a real-world scenario, this might be a custom wrapper or a different library.
  var ajaxUtility = window.jQuery; // Assuming jQuery is available globally

  // Simple logging utility for internal use
  var logger = {
      isVerbose: false,
      log: function(msg) {
          if (this.isVerbose) {
              console.log("[SchemaClient DEBUG] " + msg);
          }
      },
      error: function(msg) {
          console.error("[SchemaClient ERROR] " + msg);
      }
  };

  // Main client for API schema exploration
  SchemaClient = (function() {

    // Default configuration values
    SchemaClient.prototype.schemaSourceUrl = "http://api.wordnik.com/v4/resources.json";
    SchemaClient.prototype.isVerbose = false;
    SchemaClient.prototype.authKey = null;
    SchemaClient.prototype.serviceBaseUrl = null;
    SchemaClient.prototype.defaultBooleanStrings = ['true', 'false']; // Changed data type from new Array()
    SchemaClient.prototype.authKeyName = 'api_key'; // Default key name
    SchemaClient.prototype.supportsHeaderAuth = false;
    SchemaClient.prototype.allowedRequestMethods = ['get'];
    SchemaClient.prototype.customHeaders = {};

    function SchemaClient(clientOptions) {
      if (clientOptions == null) {
        clientOptions = {};
      }

      // Configure logger verbosity based on client options
      logger.isVerbose = clientOptions.debug || clientOptions.isVerbose || this.isVerbose;

      // Apply configuration options to instance, preferring clientOptions
      this.schemaSourceUrl = clientOptions.schemaSourceUrl || this.schemaSourceUrl;
      this.authKeyName = clientOptions.authKeyName || this.authKeyName;
      this.authKey = clientOptions.authKey || clientOptions.apiKey || this.authKey; // Renamed and combined key options
      this.supportsHeaderAuth = clientOptions.supportsHeaderAuth || this.supportsHeaderAuth;
      this.allowedRequestMethods = clientOptions.allowedRequestMethods || this.allowedRequestMethods;
      this.onClientSuccess = clientOptions.onClientSuccess || null; // Renamed success callback
      this.onClientFailure = clientOptions.onClientFailure || function(msg) { logger.error(msg); }; // Renamed failure callback
      this.onClientProgress = clientOptions.onClientProgress || function(msg) { logger.log(msg); }; // Renamed progress callback
      this.customHeaders = clientOptions.customHeaders || this.customHeaders;
      this.booleanValueRepresentations = clientOptions.booleanValueRepresentations || this.defaultBooleanStrings; // Renamed property

      // Ensure the schema URL includes the API key if present
      this.schemaSourceUrl = this.appendAuthParam(this.schemaSourceUrl);

      // Trigger initial schema loading if a success callback is provided, or if no specific success handler is given
      if (this.onClientSuccess != null) {
        this.loadSchema();
      }
    }

    SchemaClient.prototype.loadSchema = function() {
      var selfRef = this; // Renamed _this for clarity in closures
      this.onClientProgress('Fetching API resource list from: ' + this.schemaSourceUrl);

      return ajaxUtility.getJSON(this.schemaSourceUrl, function(responseData) { // Changed jQuery.getJSON to ajaxUtility.getJSON
        var moduleEntry, moduleConfig, moduleIndex, moduleCount; // Renamed res, resource, _i, _j, _len, _len1, _ref, _ref1

        // Determine base path for API calls, prioritizing explicit definition
        if (responseData.basePath != null && ajaxUtility.trim(responseData.basePath).length > 0) {
          selfRef.serviceBaseUrl = responseData.basePath;
          if (!selfRef.serviceBaseUrl.match(/^https?:\/\//i)) { // Added negation and improved regex for URL check
            selfRef.reportFailure("Schema source basePath must be a valid HTTP/HTTPS URL.");
          }
          selfRef.serviceBaseUrl = selfRef.serviceBaseUrl.replace(/\/$/, ''); // Remove trailing slash if present
        } else {
          // Derive base path from discovery URL if not explicitly provided
          var lastSlash = selfRef.schemaSourceUrl.lastIndexOf('/');
          selfRef.serviceBaseUrl = selfRef.schemaSourceUrl.substring(0, lastSlash);
          logger.log('Derived service base URL from schema source as ' + selfRef.serviceBaseUrl);
        }

        selfRef.serviceModules = {}; // Renamed resources - stores modules by name
        selfRef.moduleList = []; // Renamed resourcesArray - stores modules in an array

        if (responseData.resourcePath != null) { // Handling single resource definition format
          selfRef.primaryResourcePath = responseData.resourcePath; // Renamed resourcePath
          moduleEntry = null;
          var apiDefinitions = responseData.apis || []; // Added null check and default empty array for safety
          for (moduleIndex = 0, moduleCount = apiDefinitions.length; moduleIndex < moduleCount; moduleIndex++) {
            moduleConfig = apiDefinitions[moduleIndex];
            if (moduleEntry === null) {
              moduleEntry = new ServiceModule(moduleConfig, selfRef);
            } else {
              moduleEntry.registerActions(moduleConfig.path, moduleConfig.operations); // Renamed addOperations
            }
          }
          if (moduleEntry != null) {
            selfRef.serviceModules[moduleEntry.moduleName] = moduleEntry;
            selfRef.moduleList.push(moduleEntry);
            moduleEntry.isReady = true; // Renamed ready
            selfRef.reflectSchemaStatus(); // Renamed selfReflect
          }
        } else { // Handling multiple resource definitions format
          var moduleDefinitions = responseData.apis || []; // Added null check and default empty array
          for (moduleIndex = 0, moduleCount = moduleDefinitions.length; moduleIndex < moduleCount; moduleIndex++) {
            moduleConfig = moduleDefinitions[moduleIndex];
            moduleEntry = new ServiceModule(moduleConfig, selfRef);
            selfRef.serviceModules[moduleEntry.moduleName] = moduleEntry;
            selfRef.moduleList.push(moduleEntry);
          }
        }
        return selfRef; // Explicit return for chainability or debugging
      }).fail(function(jqXHR, textStatus, errorThrown) { // Renamed .error to .fail for jQuery's error callback
        selfRef.reportFailure(jqXHR.status + ' : ' + textStatus + ' - ' + selfRef.schemaSourceUrl + ' (' + errorThrown + ')'); // Enhanced error message
      });
    };

    SchemaClient.prototype.reflectSchemaStatus = function() { // Renamed selfReflect - checks if all modules are ready
      var moduleItem, moduleName; // Renamed resource, resource_name

      if (this.serviceModules == null || Object.keys(this.serviceModules).length === 0) { // Added explicit check for empty object
        logger.log("No service modules found to reflect status.");
        return false;
      }

      for (moduleName in this.serviceModules) {
        if (Object.prototype.hasOwnProperty.call(this.serviceModules, moduleName)) { // Added hasOwnProperty check for robustness
          moduleItem = this.serviceModules[moduleName];
          if (moduleItem.isReady == null || !moduleItem.isReady) { // Checked for explicit false or null
            logger.log("Module '" + moduleName + "' is not yet ready. Waiting for all modules to load.");
            return false; // Not all modules are ready
          }
        }
      }

      this.consolidateDefinitions(); // Renamed setConsolidatedModels - aggregate all data models
      this.isClientReady = true; // Renamed ready - mark the entire client as ready
      if (this.onClientSuccess != null) {
        return this.onClientSuccess(); // Invoke success callback
      }
      return true; // All modules ready, no success callback
    };

    SchemaClient.prototype.reportFailure = function(errorMessage) { // Renamed fail - central error reporting
      this.onClientFailure(errorMessage);
      throw new Error(errorMessage); // Changed to throw an Error object for better stack traces
    };

    SchemaClient.prototype.consolidateDefinitions = function() { // Renamed setConsolidatedModels - combines all schema definitions
      var definitionEntry, definitionIdentifier, serviceModuleEntry, moduleNameKey; // Renamed model, modelName, resource, resource_name
      this.definitionList = []; // Renamed modelsArray - stores all unique definitions in an array
      this.allDefinitions = {}; // Renamed models - stores all unique definitions by identifier

      for (moduleNameKey in this.serviceModules) {
        if (Object.prototype.hasOwnProperty.call(this.serviceModules, moduleNameKey)) {
          serviceModuleEntry = this.serviceModules[moduleNameKey];
          for (definitionIdentifier in serviceModuleEntry.definitions) {
            if (Object.prototype.hasOwnProperty.call(serviceModuleEntry.definitions, definitionIdentifier)) {
              if (!(this.allDefinitions[definitionIdentifier] != null)) { // Check if definition already exists to avoid duplicates
                this.allDefinitions[definitionIdentifier] = serviceModuleEntry.definitions[definitionIdentifier];
                this.definitionList.push(serviceModuleEntry.definitions[definitionIdentifier]);
              }
            }
          }
        }
      }

      // Resolve references for all collected definitions after all are loaded
      this.definitionList.forEach(function(def) { // Changed traditional for loop to forEach for modern JS
        def.resolveReferences(this.allDefinitions); // Renamed setReferencedModels
      }, this); // Pass 'this' as context for forEach callback

      return this.definitionList.length; // Return number of consolidated definitions for convenience
    };

    SchemaClient.prototype.appendAuthParam = function(targetUrl) { // Renamed suffixApiKey - adds API key to URL
      if ((this.authKey != null) && ajaxUtility.trim(this.authKey).length > 0 && (targetUrl != null)) {
        var paramSeparator = targetUrl.indexOf('?') > -1 ? '&' : '?'; // Renamed sep, changed > 0 to > -1 for robustness
        return targetUrl + paramSeparator + this.authKeyName + '=' + this.authKey;
      } else {
        return targetUrl;
      }
    };

    SchemaClient.prototype.displayApiOverview = function() { // Renamed help - provides a structured overview
      logger.log("--- API Overview ---");
      var serviceModuleEntry, moduleNameKey, endpointAction, actionNameKey, paramInfo; // Renamed resource, resource_name, operation, operation_name, parameter

      for (moduleNameKey in this.serviceModules) {
        if (Object.prototype.hasOwnProperty.call(this.serviceModules, moduleNameKey)) {
          serviceModuleEntry = this.serviceModules[moduleNameKey];
          logger.log("Module: " + moduleNameKey + (serviceModuleEntry.moduleDescription ? " (" + serviceModuleEntry.moduleDescription + ")" : "")); // Added description for richer output
          for (actionNameKey in serviceModuleEntry.actionsMap) {
            if (Object.prototype.hasOwnProperty.call(serviceModuleEntry.actionsMap, actionNameKey)) {
              endpointAction = serviceModuleEntry.actionsMap[actionNameKey];
              logger.log("  Action: " + endpointAction.actionId + " (" + endpointAction.requestMethod.toUpperCase() + " " + endpointAction.endpointPath + ")"); // Added method and path
              if (endpointAction.actionParams && endpointAction.actionParams.length > 0) { // Added null/empty check
                logger.log("    Parameters:");
                endpointAction.actionParams.forEach(function(param) { // Changed for loop to forEach
                  paramInfo = "      - " + param.attributeName + (param.isRequired ? ' (REQUIRED)' : '') + " [" + param.valueType + "]"; // Renamed and reformatted
                  if (param.description) {
                    paramInfo += " - " + param.description;
                  }
                  logger.log(paramInfo);
                });
              }
            }
          }
        }
      }
      logger.log("--------------------");
      return this;
    };

    return SchemaClient;

  })();

  // Represents a collection of related API endpoints (e.g., "User" module, "Product" module)
  ServiceModule = (function() {

    function ServiceModule(moduleDescriptor, clientInstance) { // Renamed resourceObj, api
      var pathSegments; // Renamed parts
      this.clientInstance = clientInstance;
      this.modulePath = this.clientInstance.primaryResourcePath != null ? this.clientInstance.primaryResourcePath : moduleDescriptor.path;
      this.moduleDescription = moduleDescriptor.description; // Added description property
      pathSegments = this.modulePath.split("/");
      this.moduleName = pathSegments[pathSegments.length - 1].replace('.{format}', ''); // Extracts name from path
      this.moduleBaseUrl = this.clientInstance.serviceBaseUrl;
      this.actionsMap = {}; // Renamed operations - stores actions by ID
      this.actionList = []; // Renamed operationsArray - stores actions in an array
      this.definitionList = []; // Renamed modelsArray - stores definitions in an array
      this.definitions = {}; // Renamed models - stores definitions by name
      this.isReady = false; // Added explicit initialization

      if (moduleDescriptor.operations != null && this.clientInstance.primaryResourcePath != null) {
        // This path is for when resource definitions are embedded directly in the initial schema
        this.clientInstance.onClientProgress('Processing module ' + this.moduleName + ' definitions and actions');
        this.registerDefinitions(moduleDescriptor.models); // Renamed addModels
        this.registerActions(moduleDescriptor.path, moduleDescriptor.operations); // Renamed addOperations
        this.clientInstance[this.moduleName] = this; // Attach module to client instance for direct access
        this.isReady = true; // Mark as ready immediately as all data is local
      } else {
        // This path is for fetching resource definitions from a separate URL
        if (this.modulePath == null) {
          this.clientInstance.reportFailure("Service modules must have a defined path.");
        }
        var fullModuleUrl = this.clientInstance.appendAuthParam(this.clientInstance.serviceBaseUrl + this.modulePath.replace('{format}', 'json')); // Renamed url
        this.clientInstance.onClientProgress('Fetching module ' + this.moduleName + ' details from: ' + fullModuleUrl);

        var currentModule = this; // Renamed _this for closure context
        ajaxUtility.getJSON(fullModuleUrl, function(responsePayload) { // Changed jQuery.getJSON to ajaxUtility.getJSON, response to responsePayload
          // Update module base URL if provided in the response
          if (responsePayload.basePath != null && ajaxUtility.trim(responsePayload.basePath).length > 0) {
            currentModule.moduleBaseUrl = responsePayload.basePath.replace(/\/$/, ''); // Remove trailing slash
          }
          currentModule.registerDefinitions(responsePayload.models); // Renamed addModels
          if (responsePayload.apis) {
            responsePayload.apis.forEach(function(endpointConfig) { // Changed for loop to forEach for modern iteration
              currentModule.registerActions(endpointConfig.path, endpointConfig.operations); // Renamed addOperations
            });
          }
          currentModule.clientInstance[currentModule.moduleName] = currentModule;
          currentModule.isReady = true;
          return currentModule.clientInstance.reflectSchemaStatus(); // Renamed selfReflect - check overall client readiness
        }).fail(function(jqXHR, textStatus, errorThrown) { // Renamed .error to .fail for jQuery
          currentModule.clientInstance.reportFailure(jqXHR.status + ' : ' + textStatus + ' - ' + fullModuleUrl + ' (' + errorThrown + ')');
        });
      }
    }

    ServiceModule.prototype.registerDefinitions = function(definitionsConfig) { // Renamed addModels - processes and stores schema definitions
      var schemaObj, schemaName, existingDefinition; // Renamed model, modelName, swaggerModel
      if (definitionsConfig != null) {
        for (schemaName in definitionsConfig) {
          if (Object.prototype.hasOwnProperty.call(definitionsConfig, schemaName)) { // Ensure direct properties are processed
            existingDefinition = this.definitions[schemaName]; // Check for existing definition to avoid re-creation
            if (!existingDefinition) {
              schemaObj = new SchemaDefinition(schemaName, definitionsConfig[schemaName]);
              this.definitionList.push(schemaObj);
              this.definitions[schemaName] = schemaObj;
            } else {
              logger.log("Warning: Duplicate definition for schema '" + schemaName + "' found in module '" + this.moduleName + "'. Skipping addition.");
            }
          }
        }
        this.definitionList.forEach(function(def) { // Changed for loop to forEach
          def.resolveReferences(this.definitions); // Renamed setReferencedModels - resolve inter-model references
        }, this); // Pass 'this' as context
      }
    };

    ServiceModule.prototype.registerActions = function(basePathForActions, actionDescriptors) { // Renamed addOperations - processes and stores API actions
      var descriptor, actionInstance; // Renamed o, op
      if (actionDescriptors) {
        actionDescriptors.forEach(function(descriptorEntry) { // Changed for loop to forEach
          actionInstance = new EndpointAction(
            descriptorEntry.nickname,
            basePathForActions,
            descriptorEntry.httpMethod,
            descriptorEntry.parameters,
            descriptorEntry.summary,
            descriptorEntry.notes,
            descriptorEntry.responseClass,
            this // Pass current module as context for the action
          );
          this.actionsMap[actionInstance.actionId] = actionInstance;
          this.actionList.push(actionInstance);
        }, this); // Pass 'this' context
      }
    };

    ServiceModule.prototype.listActions = function() { // Renamed help - displays available actions for this module
      logger.log("--- Actions for Module: " + this.moduleName + " ---");
      var endpointAction, actionNameKey; // Renamed operation, operation_name

      for (actionNameKey in this.actionsMap) {
        if (Object.prototype.hasOwnProperty.call(this.actionsMap, actionNameKey)) {
          endpointAction = this.actionsMap[actionNameKey];
          logger.log("  " + endpointAction.actionId + " [" + endpointAction.requestMethod.toUpperCase() + "]");
          if (endpointAction.actionParams && endpointAction.actionParams.length > 0) { // Added length check
            logger.log("    Parameters:");
            endpointAction.actionParams.forEach(function(param) { // Changed for loop to forEach
              logger.log("      - " + param.attributeName + (param.isRequired ? ' (required)' : '') + " - " + (param.description || 'No description provided')); // Added default description
            });
          }
        }
      }
      logger.log("---------------------------------");
      return this;
    };

    return ServiceModule;

  })();

  // Defines the structure of a data type (model/schema)
  SchemaDefinition = (function() {

    function SchemaDefinition(defIdentifier, schemaData) { // Renamed modelName, obj
      var attributeName;
      this.identifier = schemaData.id != null ? schemaData.id : defIdentifier;
      this.attributes = []; // Renamed properties
      for (attributeName in schemaData.properties) {
        if (Object.prototype.hasOwnProperty.call(schemaData.properties, attributeName)) { // Ensure direct properties are processed
          this.attributes.push(new TypeAttribute(attributeName, schemaData.properties[attributeName]));
        }
      }
    }

    SchemaDefinition.prototype.resolveReferences = function(globalDefinitions) { // Renamed setReferencedModels - links attributes to other definitions
      var attributeEntry; // Renamed prop
      this.attributes.forEach(function(attributeEntry) { // Changed for loop to forEach
        // Check if the attribute's valueType directly refers to another model
        if (globalDefinitions[attributeEntry.valueType] != null) {
          attributeEntry.referencedDefinition = globalDefinitions[attributeEntry.valueType]; // Renamed refModel
        }
        // Check if it's an array type with a referenced item type
        else if ((attributeEntry.itemValueType != null) && (globalDefinitions[attributeEntry.itemValueType] != null)) {
          attributeEntry.referencedDefinition = globalDefinitions[attributeEntry.itemValueType];
        }
        // No explicit 'else { void 0 }' needed, property remains undefined if no reference
      });
      return this.attributes.length; // Return number of attributes processed
    };

    SchemaDefinition.prototype.generateSampleStructure = function(outputPrefix, excludeDefinition) { // Renamed getMockSignature - creates a human-readable structure
      var attributeStrings = []; // Renamed propertiesStr
      this.attributes.forEach(function(attr) { // Changed for loop to forEach
        attributeStrings.push(attr.attributeName + ': <type>' + attr.valueType + '</type>');
      });

      var styleBold = '<span style="font-weight: bold; color: #333;">'; // Slightly different style
      var styleClose = '</span>';
      var structureOpen = styleBold + (outputPrefix != null ? outputPrefix : this.identifier) + ' { ' + styleClose; // Changed classOpen
      var structureClose = styleBold + ' }' + styleClose; // Changed classClose

      var generatedOutput = structureOpen + '<span>' + attributeStrings.join('</span>, <span>') + '</span>' + structureClose; // Renamed returnVal

      // Recursively generate structures for referenced definitions to show nested types
      this.attributes.forEach(function(attr) { // Changed for loop to forEach
        if (attr.referencedDefinition != null && attr.referencedDefinition !== excludeDefinition) {
          generatedOutput += ('<br>' + attr.referencedDefinition.generateSampleStructure(undefined, this)); // Renamed getMockSignature, passed 'this' for recursion
        }
      }, this); // Pass 'this' as context to ensure correct `this` for recursion
      return generatedOutput;
    };

    return SchemaDefinition;

  })();

  // Describes an attribute or property within a SchemaDefinition
  TypeAttribute = (function() {

    function TypeAttribute(attributeName, attributeData) { // Renamed name, obj
      this.attributeName = attributeName;
      this.valueType = attributeData.type; // Renamed dataType
      this.isCollection = this.valueType.toLowerCase() === 'array'; // Renamed isArray
      this.description = attributeData.description; // Renamed descr

      if (attributeData.items != null) {
        this.itemValueType = attributeData.items.type || attributeData.items.$ref; // Combined checks for refDataType
      }
      this.fullTypeSignature = this.itemValueType != null ? this.valueType + '[' + this.itemValueType + ']' : this.valueType; // Renamed dataTypeWithRef

      if (attributeData.allowableValues != null) {
        this.constraintType = attributeData.allowableValues.valueType; // Renamed valueType
        this.allowedValues = attributeData.allowableValues.values; // Renamed values
        if (this.allowedValues != null && this.allowedValues.length > 0) { // Added length check for robustness
          this.allowedValuesString = "'" + this.allowedValues.join("' or '") + "'";
        }
      }
    }

    TypeAttribute.prototype.describeAttribute = function() { // Renamed toString - provides a summary string
      var descriptionString = this.attributeName + ': ' + this.fullTypeSignature;
      if (this.allowedValuesString != null) { // Changed from this.values
        descriptionString += " = [" + this.allowedValuesString + "]"; // Removed single quotes around the entire string for clarity
      }
      if (this.description != null) {
        descriptionString += ' {' + this.description + '}';
      }
      return descriptionString;
    };

    return TypeAttribute;

  })();

  // Defines a specific API endpoint operation
  EndpointAction = (function() {

    function EndpointAction(actionId, endpointPath, requestMethod, actionParams, briefSummary, detailedNotes, returnSchemaIdentifier, parentModule) { // Renamed nickname, path, httpMethod, parameters, summary, notes, responseClass, resource
      var paramVal, paramIdx; // Renamed parameter, v, _i, _j, _len, _len1, _ref, _ref1
      this.actionId = actionId;
      this.endpointPath = endpointPath;
      this.requestMethod = requestMethod;
      this.actionParams = actionParams || []; // Renamed parameters, added default empty array for safety
      this.briefSummary = briefSummary;
      this.detailedNotes = detailedNotes;
      this.returnSchemaIdentifier = returnSchemaIdentifier;
      this.parentModule = parentModule;
      this.executeAction = _boundMethod(this.executeAction, this); // Renamed do, __bind - ensures `this` context in callback

      // Basic validation for critical properties (Type III: added more robust checks)
      if (!this.actionId || typeof this.actionId !== 'string') {
        this.parentModule.clientInstance.reportFailure("Endpoint actions must have a valid string identifier (nickname).");
      }
      if (!this.endpointPath || typeof this.endpointPath !== 'string') {
        this.parentModule.clientInstance.reportFailure("Endpoint action '" + actionId + "' is missing or has an invalid path.");
      }
      if (!this.requestMethod || typeof this.requestMethod !== 'string') {
        this.parentModule.clientInstance.reportFailure("Endpoint action '" + actionId + "' is missing or has an invalid HTTP method.");
      }

      this.endpointPath = this.endpointPath.replace('{format}', 'json'); // Standardize path format
      this.requestMethod = this.requestMethod.toLowerCase(); // Standardize method case
      this.isReadOnly = this.requestMethod === "get"; // Renamed isGetMethod for semantic clarity

      // Handle 'void' return types by setting to undefined
      if (this.returnSchemaIdentifier && this.returnSchemaIdentifier.toLowerCase() === 'void') {
        this.returnSchemaIdentifier = undefined; // Changed to undefined for consistency
      }

      // Generate signature for the response type if defined
      if (this.returnSchemaIdentifier != null) {
        this.returnTypeSignature = this.resolveTypeSignature(this.returnSchemaIdentifier, this.parentModule.definitions); // Renamed responseClassSignature, getSignature
      }

      // Process each parameter to enrich its definition
      for (paramIdx = 0; paramIdx < this.actionParams.length; paramIdx++) {
        paramVal = this.actionParams[paramIdx];
        paramVal.attributeName = paramVal.name || paramVal.dataType || `param${paramIdx}`; // Renamed parameter.name to attributeName, added fallback name
        paramVal.isRequired = paramVal.required || false; // Added explicit required property for clarity

        if (paramVal.dataType && paramVal.dataType.toLowerCase() === 'boolean') { // Changed dataType to valueType
          paramVal.paramConstraints = {};
          paramVal.paramConstraints.values = this.parentModule.clientInstance.booleanValueRepresentations; // Renamed allowableValues
        }
        paramVal.paramSignature = this.resolveTypeSignature(paramVal.dataType, this.parentModule.definitions); // Renamed signature, getSignature

        if (paramVal.paramConstraints != null) {
          if (paramVal.paramConstraints.valueType === "RANGE") {
            paramVal.isRangeConstrained = true; // Renamed isRange
          } else {
            paramVal.isListConstrained = true; // Renamed isList
          }
          if (paramVal.paramConstraints.values != null && paramVal.paramConstraints.values.length > 0) { // Added length check
            paramVal.paramOptions = []; // Renamed allowableValues.descriptiveValues
            paramVal.paramConstraints.values.forEach(function(optionValue) { // Changed for loop to forEach
              paramVal.paramOptions.push({
                value: optionValue,
                isDefault: (paramVal.defaultValue != null && paramVal.defaultValue === optionValue)
              });
            });
          }
        }
      }

      // Attach this action to the parent module's namespace for direct invocation
      var actionRef = this; // Helper variable for closure context
      this.parentModule[this.actionId] = function(invocationArgs, onSuccess, onFailure) { // Renamed args, callback, error
        return actionRef.executeAction(invocationArgs, onSuccess, onFailure); // Ensure context is preserved for executeAction
      };
    }

    EndpointAction.prototype.extractCollectionType = function(typeIdentifier) { // Renamed isListType - extracts item type from array definition
      if (typeIdentifier && typeIdentifier.includes('[') && typeIdentifier.includes(']')) { // Using includes for string search
        var startIndex = typeIdentifier.indexOf('[') + 1;
        var endIndex = typeIdentifier.indexOf(']');
        return typeIdentifier.substring(startIndex, endIndex);
      } else {
        return undefined; // Changed void 0 to undefined for consistency
      }
    };

    EndpointAction.prototype.resolveTypeSignature = function(typeIdentifier, schemaDefinitions) { // Renamed getSignature - provides a descriptive type signature
      var isBasicType, collectionItemType; // Renamed isPrimitive, listType
      collectionItemType = this.extractCollectionType(typeIdentifier);
      isBasicType = ((collectionItemType == null) && schemaDefinitions[typeIdentifier] == null) || // True if neither collection item nor direct type is a schema
                    ((collectionItemType != null) && schemaDefinitions[collectionItemType] == null); // True if collection but item type is not a schema

      if (isBasicType) {
        return typeIdentifier;
      } else {
        var targetDefinition = schemaDefinitions[collectionItemType || typeIdentifier];
        if (targetDefinition) {
          return targetDefinition.generateSampleStructure(typeIdentifier); // Renamed getMockSignature
        } else {
          return "Unknown Schema: " + typeIdentifier; // Added a fallback for unknown schemas
        }
      }
    };

    EndpointAction.prototype.executeAction = function(invocationArgs, onSuccess, onFailure) { // Renamed do - performs the actual API call
      if (invocationArgs == null) {
        invocationArgs = {};
      }
      // Reordered parameter checks to ensure `onSuccess` and `onFailure` are functions
      if (typeof invocationArgs === "function") {
        onFailure = onSuccess; // Shift arguments if first argument is a function (callback)
        onSuccess = invocationArgs;
        invocationArgs = {};
      }
      if (onFailure == null) {
        onFailure = function(xhr, status, err) {
          logger.error("API Call Failed for " + this.actionId + ": " + status + " (" + err + ")"); // Use internal logger
        }.bind(this); // Bind 'this' to the error handler to access actionId
      }
      if (onSuccess == null) {
        onSuccess = function(data) {
          logger.log("API Call Succeeded for " + this.actionId + ": " + JSON.stringify(data).substring(0, 100) + "..."); // Use internal logger, truncate output
        }.bind(this); // Bind 'this' to the success handler
      }

      var requestHeaders = invocationArgs.headers || {}; // Renamed headers
      delete invocationArgs.headers; // Remove from args after extracting

      var requestBody = invocationArgs.body; // Renamed body - for 'body' parameter type
      delete invocationArgs.body;

      var currentPath = this.endpointPath;
      var queryParams = {};
      var headerParams = {};
      var formParams = {};
      var pathParams = {}; // Explicitly track path parameters
      var finalRequestData = null; // For body parameters, renamed from requestData

      // Helper for parameter processing (Type III: moved logic into a helper function)
      var processParameter = function(paramDescriptor) {
          var paramValue = invocationArgs[paramDescriptor.attributeName]; // Use attributeName
          var isRequired = paramDescriptor.isRequired;

          // Perform validation for required parameters (Type III: more specific error message)
          if ((paramValue === null || paramValue === undefined) && isRequired) {
              this.parentModule.clientInstance.reportFailure("Missing required parameter '" + paramDescriptor.attributeName + "' for action '" + this.actionId + "'.");
          }

          if (paramValue !== null && paramValue !== undefined) { // Process only if value is provided
              switch (paramDescriptor.paramType) { // paramType from original definition
                  case 'query':
                      queryParams[paramDescriptor.attributeName] = paramValue;
                      break;
                  case 'header':
                      headerParams[paramDescriptor.attributeName] = paramValue;
                      break;
                  case 'form':
                      formParams[paramDescriptor.attributeName] = paramValue;
                      break;
                  case 'path':
                      // Replace path placeholder with actual value, ensuring it's URI encoded
                      currentPath = currentPath.replace('{' + paramDescriptor.attributeName + '}', encodeURIComponent(paramValue));
                      pathParams[paramDescriptor.attributeName] = paramValue; // Store for debugging/logging
                      break;
                  case 'body':
                      if (requestBody !== undefined) {
                          logger.log("Warning: Multiple body parameters detected. Only the last one will be used.");
                      }
                      requestBody = paramValue; // Only one body parameter allowed by Swagger spec
                      break;
                  default:
                      logger.log("Warning: Unknown parameter type '" + paramDescriptor.paramType + "' for parameter '" + paramDescriptor.attributeName + "'. Ignoring.");
              }
          }
      }.bind(this); // Bind 'this' to the helper function to access `this.parentModule` etc.

      // Process all defined parameters for the action
      this.actionParams.forEach(processParameter); // Use forEach for cleaner iteration

      // Add API key to headers if supported and not already present
      if (this.parentModule.clientInstance.supportsHeaderAuth && this.parentModule.clientInstance.authKey && !headerParams[this.parentModule.clientInstance.authKeyName]) {
          headerParams[this.parentModule.clientInstance.authKeyName] = this.parentModule.clientInstance.authKey;
      }

      // Merge custom headers from client instance, then action-specific headers
      Object.assign(requestHeaders, this.parentModule.clientInstance.customHeaders, headerParams); // Use Object.assign for merging headers

      // Construct the full request URL
      var fullRequestUrl = this.parentModule.moduleBaseUrl + currentPath;
      var queryString = ajaxUtility.param(queryParams); // Use jQuery.param for query string encoding
      if (queryString) {
          fullRequestUrl += '?' + queryString;
      }

      // Prepare data for request based on method and content type
      if (this.requestMethod === 'post' || this.requestMethod === 'put' || this.requestMethod === 'patch' || this.requestMethod === 'delete') { // Added delete for body support
          if (requestBody !== undefined && requestBody !== null) {
              finalRequestData = JSON.stringify(requestBody);
              requestHeaders['Content-Type'] = requestHeaders['Content-Type'] || 'application/json'; // Default to JSON
          } else if (Object.keys(formParams).length > 0) {
              finalRequestData = ajaxUtility.param(formParams);
              requestHeaders['Content-Type'] = requestHeaders['Content-Type'] || 'application/x-www-form-urlencoded';
          }
      }

      // Perform the AJAX request using ajaxUtility (jQuery)
      logger.log("Executing API call: " + this.requestMethod.toUpperCase() + " " + fullRequestUrl);
      logger.log("Request Data: " + (finalRequestData ? finalRequestData.substring(0, Math.min(finalRequestData.length, 200)) + (finalRequestData.length > 200 ? "..." : "") : "None")); // Truncate long data
      logger.log("Request Headers: " + JSON.stringify(requestHeaders));

      return ajaxUtility.ajax({
          url: fullRequestUrl,
          type: this.requestMethod,
          headers: requestHeaders,
          data: finalRequestData,
          dataType: 'json', // Expect JSON response by default
          success: function(data, textStatus, jqXHR) {
              onSuccess(data, jqXHR); // Pass jqXHR as well for more context
          },
          error: function(jqXHR, textStatus, errorThrown) {
              onFailure(jqXHR, textStatus, errorThrown);
          }
      });
    };

    return EndpointAction;

  })();

}).call(this);