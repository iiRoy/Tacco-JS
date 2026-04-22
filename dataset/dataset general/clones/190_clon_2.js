// Transformed from original source by CodeClone v2.0
(function(){
  var ServiceGateway, SchemaDefinition, SchemaAttribute, RemoteProcedure, ServiceResource,
    _linkFn = function(func, context){ return function(){ return func.apply(context, arguments); }; };

  ServiceGateway = (function(){

    ServiceGateway.prototype.catalogUrl = "http://api.wordnik.com/v4/resources.json";

    ServiceGateway.prototype.verboseLog = false;

    ServiceGateway.prototype.authToken = null;

    ServiceGateway.prototype.baseUrl = null;

    function ServiceGateway(configOpts){
      if (configOpts == null) {
        configOpts = {};
      }
      if (configOpts.catalogUrl != null) {
        this.catalogUrl = configOpts.catalogUrl;
      }
      if (configOpts.verboseLog != null) {
        this.verboseLog = configOpts.verboseLog;
      }
      this.authParamName = configOpts.authParamName != null ? configOpts.authParamName : 'api_key';
      if (configOpts.accessKey != null) {
        this.authToken = configOpts.accessKey;
      }
      if (configOpts.authToken != null) {
        this.authToken = configOpts.authToken;
      }
      if (configOpts.detailedOutput != null) {
        this.detailedOutput = configOpts.detailedOutput;
      }
      this.enableHeaderAuth = configOpts.enableHeaderAuth != null ? configOpts.enableHeaderAuth : false;
      this.allowedMethods = configOpts.allowedMethods != null ? configOpts.allowedMethods : ['get'];
      if (configOpts.onSuccess != null) {
        this.onSuccess = configOpts.onSuccess;
      }
      this.onError = configOpts.onError != null ? configOpts.onError : function(){};
      this.onProgress = configOpts.onProgress != null ? configOpts.onProgress : function(){};
      this.requestHeaders = configOpts.requestHeaders != null ? configOpts.requestHeaders : {};
      this.truthyFalsy = configOpts.truthyFalsy != null ? configOpts.truthyFalsy : new Array('true', 'false');
      this.catalogUrl = this.appendAuthParam(this.catalogUrl);
      if (configOpts.onSuccess != null) {
        this.initializeGateway();
      }
    }

    ServiceGateway.prototype.initializeGateway = function(){
      var currentGateway = this;
      this.onProgress('fetching service manifest: ' + this.catalogUrl);
      return jQuery.getJSON(this.catalogUrl, function(serviceManifest){
        var srvModule, moduleInfo, idxA, idxB, lenA, lenB, refA, refB;
        if ((serviceManifest.baseUrl != null) && jQuery.trim(serviceManifest.baseUrl).length > 0) {
          currentGateway.baseUrl = serviceManifest.baseUrl;
          if (currentGateway.baseUrl.match(/^HTTP/i) == null) {
            currentGateway.reportFailure("catalogUrl baseUrl must be a valid URL.");
          }
          currentGateway.baseUrl = currentGateway.baseUrl.replace(/\/$/, ''); // Remove trailing slash
        } else {
          currentGateway.baseUrl = currentGateway.catalogUrl.substring(0, currentGateway.catalogUrl.lastIndexOf('/'));
          console.log('derived basepath from discoveryUrl as ' + currentGateway.baseUrl);
        }
        currentGateway.serviceModules = {};
        currentGateway.moduleList = [];
        if (serviceManifest.modulePath != null) {
          currentGateway.modulePath = serviceManifest.modulePath;
          srvModule = null;
          refA = serviceManifest.apis;
          for (idxA = 0, lenA = refA.length; idxA < lenA; idxA++) {
            moduleInfo = refA[idxA];
            if (srvModule === null) {
              srvModule = new ServiceResource(moduleInfo, currentGateway);
            } else {
              srvModule.addModuleActions(moduleInfo.path, moduleInfo.operations);
            }
          }
          if (srvModule != null) {
            currentGateway.serviceModules[srvModule.moduleName] = srvModule;
            currentGateway.moduleList.push(srvModule);
            srvModule.ready = true;
            currentGateway.finalizeInitialization();
          }
        } else {
          refB = serviceManifest.apis;
          for (idxB = 0, lenB = refB.length; idxB < lenB; idxB++) {
            moduleInfo = refB[idxB];
            srvModule = new ServiceResource(moduleInfo, currentGateway);
            currentGateway.serviceModules[srvModule.moduleName] = srvModule;
            currentGateway.moduleList.push(srvModule);
          }
        }
        return currentGateway;
      }).error(function(errorObj){
        return currentGateway.reportFailure(errorObj.status + ' : ' + errorObj.statusText + ' ' + currentGateway.catalogUrl);
      });
    };

    ServiceGateway.prototype.finalizeInitialization = function(){
      var currentModule, moduleIdentifier, refMap;
      if (this.serviceModules == null) {
        return false;
      }
      refMap = this.serviceModules;
      for (moduleIdentifier in refMap) {
        currentModule = refMap[moduleIdentifier];
        if (currentModule.ready == null) {
          return false;
        }
      }
      this.mergeDataSchemas();
      this.ready = true;
      if (this.onSuccess != null) {
        return this.onSuccess();
      }
    };

    ServiceGateway.prototype.reportFailure = function(issueMessage){
      this.onError(issueMessage);
      throw issueMessage;
    };

    ServiceGateway.prototype.mergeDataSchemas = function(){
      var schema, schemaIdentifier, currentModule, moduleIdentifier, idx, len, refA, refB, results;
      this.schemaList = [];
      this.dataSchemas = {};
      refA = this.serviceModules;
      for (moduleIdentifier in refA) {
        currentModule = refA[moduleIdentifier];
        for (schemaIdentifier in currentModule.moduleSchemaMap) {
          if (!(this.dataSchemas[schemaIdentifier] != null)) {
            this.dataSchemas[schemaIdentifier] = currentModule.moduleSchemaMap[schemaIdentifier];
            this.schemaList.push(currentModule.moduleSchemaMap[schemaIdentifier]);
          }
        }
      }
      refB = this.schemaList;
      results = [];
      for (idx = 0, len = refB.length; idx < len; idx++) {
        schema = refB[idx];
        results.push(schema.setReferencedSchemas(this.dataSchemas));
      }
      return results;
    };

    ServiceGateway.prototype.appendAuthParam = function(targetUrl){
      var separator;
      // Add authentication token to URL if available
      if ((this.authToken != null) && jQuery.trim(this.authToken).length > 0 && (targetUrl != null)) {
        separator = targetUrl.indexOf('?') > 0 ? '&' : '?';
        return targetUrl + separator + this.authParamName + '=' + this.authToken;
      } else {
        return targetUrl;
      }
    };

    ServiceGateway.prototype.displayApiDocs = function(){
      var action, actionIdentifier, argDef, currentModule, moduleIdentifier, idx, len, refA, refB, refC;
      refA = this.serviceModules;
      for (moduleIdentifier in refA) {
        currentModule = refA[moduleIdentifier];
        console.info(moduleIdentifier);
        refB = currentModule.moduleActions;
        for (actionIdentifier in refB) {
          action = refB[actionIdentifier];
          console.info("  " + action.methodAlias);
          refC = action.methodParams;
          for (idx = 0, len = refC.length; idx < len; idx++) {
            argDef = refC[idx];
            console.info("    " + argDef.attributeName + (argDef.isRequired ? ' (required)' : '') + " - " + argDef.descriptionText);
          }
        }
      }
      return this;
    };

    return ServiceGateway;

  })();

  ServiceResource = (function(){

    function ServiceResource(moduleDef, gatewayInstance){
      var pathSegments,
        currentResource = this;
      this.gateway = gatewayInstance;
      this.routePath = this.gateway.modulePath != null ? this.gateway.modulePath : moduleDef.path;
      this.moduleDesc = moduleDef.description;
      pathSegments = this.routePath.split("/");
      this.moduleName = pathSegments[pathSegments.length - 1].replace('.{format}', '');
      this.moduleBaseUrl = this.gateway.baseUrl;
      this.moduleActions = {};
      this.actionList = [];
      this.moduleSchemas = [];
      this.moduleSchemaMap = {};
      if ((moduleDef.operations != null) && (this.gateway.modulePath != null)) {
        this.gateway.onProgress('reading service module ' + this.moduleName + ' schemas and actions');
        this.includeSchemas(moduleDef.models);
        this.addModuleActions(moduleDef.path, moduleDef.operations);
        this.gateway[this.moduleName] = this;
      } else {
        if (this.routePath == null) {
          this.gateway.reportFailure("ServiceResources must have a routePath.");
        }
        this.resourceUri = this.gateway.appendAuthParam(this.gateway.baseUrl + this.routePath.replace('{format}', 'json'));
        this.gateway.onProgress('fetching service module ' + this.moduleName + ': ' + this.resourceUri);
        jQuery.getJSON(this.resourceUri, function(responsePayload){
          var apiEndpoint, idx, len, ref;
          if ((responsePayload.baseUrl != null) && jQuery.trim(responsePayload.baseUrl).length > 0) {
            currentResource.moduleBaseUrl = responsePayload.baseUrl;
            currentResource.moduleBaseUrl = currentResource.moduleBaseUrl.replace(/\/$/, '');
          }
          currentResource.includeSchemas(responsePayload.models);
          if (responsePayload.apis) {
            ref = responsePayload.apis;
            for (idx = 0, len = ref.length; idx < len; idx++) {
              apiEndpoint = ref[idx];
              currentResource.addModuleActions(apiEndpoint.path, apiEndpoint.operations);
            }
          }
          currentResource.gateway[currentResource.moduleName] = currentResource;
          currentResource.ready = true;
          return currentResource.gateway.finalizeInitialization();
        }).error(function(errorData){
          return currentResource.gateway.reportFailure(errorData.status + ' : ' + errorData.statusText + ' ' + currentResource.resourceUri);
        });
      }
    }

    ServiceResource.prototype.includeSchemas = function(schemas){
      var schema, schemaIdentifier, typeDefinition, idx, len, ref, results;
      if (schemas != null) {
        for (schemaIdentifier in schemas) {
          typeDefinition = new SchemaDefinition(schemaIdentifier, schemas[schemaIdentifier]);
          this.moduleSchemas.push(typeDefinition);
          this.moduleSchemaMap[schemaIdentifier] = typeDefinition;
        }
        ref = this.moduleSchemas;
        results = [];
        for (idx = 0, len = ref.length; idx < len; idx++) {
          schema = ref[idx];
          results.push(schema.setReferencedSchemas(this.moduleSchemaMap));
        }
        return results;
      }
    };

    ServiceResource.prototype.addModuleActions = function(moduleRoute, actionDefs){
      var actionDef, actionObj, idx, len, results;
      if (actionDefs) {
        results = [];
        for (idx = 0, len = actionDefs.length; idx < len; idx++) {
          actionDef = actionDefs[idx];
          actionObj = new RemoteProcedure(actionDef.nickname, moduleRoute, actionDef.httpMethod, actionDef.parameters, actionDef.summary, actionDef.notes, actionDef.responseClass, this);
          this.moduleActions[actionObj.methodAlias] = actionObj;
          results.push(this.actionList.push(actionObj));
        }
        return results;
      }
    };

    ServiceResource.prototype.showModuleDocs = function(){
      var action, actionIdentifier, argDef, idx, len, refA, refB;
      refA = this.moduleActions;
      for (actionIdentifier in refA) {
        action = refA[actionIdentifier];
        console.info("  " + action.methodAlias);
        refB = action.methodParams;
        for (idx = 0, len = refB.length; idx < len; idx++) {
          argDef = refB[idx];
          console.info("    " + argDef.attributeName + (argDef.isRequired ? ' (required)' : '') + " - " + argDef.descriptionText);
        }
      }
      return this;
    };

    return ServiceResource;

  })();

  SchemaDefinition = (function(){

    function SchemaDefinition(typeName, typeDef){
      var fieldIdentifier;
      this.name = typeDef.id != null ? typeDef.id : typeName;
      this.fields = [];
      for (fieldIdentifier in typeDef.properties) {
        this.fields.push(new SchemaAttribute(fieldIdentifier, typeDef.properties[fieldIdentifier]));
      }
    }

    SchemaDefinition.prototype.setReferencedSchemas = function(globalSchemas){
      var field, idx, len, ref, results;
      ref = this.fields;
      results = [];
      for (idx = 0, len = ref.length; idx < len; idx++) {
        field = ref[idx];
        if (globalSchemas[field.attributeType] != null) {
          results.push(field.linkedSchema = globalSchemas[field.attributeType]);
        } else if ((field.referencedItemType != null) && (globalSchemas[field.referencedItemType] != null)) {
          results.push(field.linkedSchema = globalSchemas[field.referencedItemType]);
        } else {
          results.push(void 0);
        }
      }
      return results;
    };

    SchemaDefinition.prototype.generateExample = function(displayPrefix, schemaToSkip){
      var typeEnd, typeStart, field, fieldSignatures, boldTag, boldEnd, bolderTag, idxA, idxB, lenA, lenB, refA, refB, exampleOutput;
      fieldSignatures = [];
      refA = this.fields;
      for (idxA = 0, lenA = refA.length; idxA < lenA; idxA++) {
        field = refA[idxA];
        fieldSignatures.push(field.attributeName + ': <type>' + field.attributeType + '</type>');
      }
      boldTag = '<span style="font-weight: bold; color: #000; font-size: 1.0em">';
      bolderTag = '<span style="font-weight: bold; color: #000; font-size: 1.1em">';
      boldEnd = '</span>';
      typeStart = boldTag + ' ' + (displayPrefix != null ? displayPrefix : this.name) + ' ( ' + boldEnd;
      typeEnd = boldTag + ' )' + boldEnd;
      exampleOutput = typeStart + '<span>' + fieldSignatures.join('</span>, <span>') + '</span>' + typeEnd;
      refB = this.fields;
      for (idxB = 0, lenB = refB.length; idxB < lenB; idxB++) {
        field = refB[idxB];
        if ((field.linkedSchema != null) && (!(field.linkedSchema === schemaToSkip))) {
          exampleOutput = exampleOutput + ('<br>' + field.linkedSchema.generateExample(void 0, this));
        }
      }
      return exampleOutput;
    };

    return SchemaDefinition;

  })();

  SchemaAttribute = (function(){

    function SchemaAttribute(attributeName, attributeDef){
      this.attributeName = attributeName;
      this.attributeType = attributeDef.type;
      this.isCollection = this.attributeType.toLowerCase() === 'array';
      this.descriptionText = attributeDef.description;
      if (attributeDef.collectionItems != null) {
        if (attributeDef.collectionItems.itemType != null) {
          this.referencedItemType = attributeDef.collectionItems.itemType;
        }
        if (attributeDef.collectionItems.itemRef != null) {
          this.referencedItemType = attributeDef.collectionItems.itemRef;
        }
      }
      this.fullAttributeType = this.referencedItemType != null ? this.attributeType + '[' + this.referencedItemType + ']' : this.attributeType;
      if (attributeDef.permittedValues != null) {
        this.valueCategory = attributeDef.permittedValues.valueType;
        this.optionValues = attributeDef.permittedValues.values;
        if (this.optionValues != null) {
          this.optionsString = "'" + this.optionValues.join("' or '") + "'";
        }
      }
    }

    SchemaAttribute.prototype.toDescriptiveString = function(){
      var descriptionStr;
      descriptionStr = this.attributeName + ': ' + this.fullAttributeType;
      if (this.optionValues != null) {
        descriptionStr += " = ['" + this.optionValues.join("' or '") + "']";
      }
      if (this.descriptionText != null) {
        descriptionStr += ' {' + this.descriptionText + '}';
      }
      return descriptionStr;
    };

    return SchemaAttribute;

  })();

  RemoteProcedure = (function(){

    function RemoteProcedure(methodAlias, endpointPath, requestMethod, methodParams, briefSummary, detailedNotes, returnSchema, parentResource){
      var paramDef, valOption, idxA, idxB, lenA, lenB, refA, refB,
        currentProcedure = this;
      this.methodAlias = methodAlias;
      this.endpointPath = endpointPath;
      this.requestMethod = requestMethod;
      this.methodParams = methodParams != null ? methodParams : [];
      this.briefSummary = briefSummary;
      this.detailedNotes = detailedNotes;
      this.returnSchema = returnSchema;
      this.parentResource = parentResource;
      this.executeCall = _linkFn(this.executeCall, this); // Bind 'this' context for execution

      if (this.methodAlias == null) {
        this.parentResource.gateway.reportFailure("RemoteProcedures must have a methodAlias.");
      }
      if (this.endpointPath == null) {
        this.parentResource.gateway.reportFailure("RemoteProcedure " + methodAlias + " is missing endpointPath.");
      }
      if (this.requestMethod == null) {
        this.parentResource.gateway.reportFailure("RemoteProcedure " + methodAlias + " is missing requestMethod.");
      }
      this.endpointPath = this.endpointPath.replace('{format}', 'json');
      this.requestMethod = this.requestMethod.toLowerCase();
      this.isHttpGet = this.requestMethod === "get";
      this.parentResourceName = this.parentResource.moduleName;
      if (this.returnSchema.toLowerCase() === 'void') {
        this.returnSchema = void 0;
      }
      if (this.returnSchema != null) {
        this.returnSchemaSignature = this.getSchemaSignature(this.returnSchema, this.parentResource.moduleSchemaMap);
      }
      refA = this.methodParams;
      for (idxA = 0, lenA = refA.length; idxA < lenA; idxA++) {
        paramDef = refA[idxA];
        paramDef.attributeName = paramDef.attributeName || paramDef.attributeType;
        if (paramDef.attributeType.toLowerCase() === 'boolean') {
          paramDef.permittedValues = {};
          paramDef.permittedValues.values = this.parentResource.gateway.truthyFalsy;
        }
        paramDef.paramSignature = this.getSchemaSignature(paramDef.attributeType, this.parentResource.moduleSchemaMap);
        if (paramDef.permittedValues != null) {
          if (paramDef.permittedValues.valueCategory === "RANGE") {
            paramDef.isRangeType = true;
          } else {
            paramDef.isCollectionType = true;
          }
          if (paramDef.permittedValues.values != null) {
            paramDef.permittedValues.labeledOptions = [];
            refB = paramDef.permittedValues.values;
            for (idxB = 0, lenB = refB.length; idxB < lenB; idxB++) {
              valOption = refB[idxB];
              if ((paramDef.defaultValue != null) && paramDef.defaultValue === valOption) {
                paramDef.permittedValues.labeledOptions.push({
                  optionValue: valOption,
                  isDefaultOption: true
                });
              } else {
                paramDef.permittedValues.labeledOptions.push({
                  optionValue: valOption,
                  isDefaultOption: false
                });
              }
            }
          }
        }
      }
      this.parentResource[this.methodAlias] = function(callArguments, onCompletion, onErrorCallback){
        return currentProcedure.executeCall(callArguments, onCompletion, onErrorCallback);
      };
    }

    RemoteProcedure.prototype.isCollectionRef = function(typeIdentifier){
      if (typeIdentifier.indexOf('[') >= 0) {
        return typeIdentifier.substring(typeIdentifier.indexOf('[') + 1, typeIdentifier.indexOf(']'));
      } else {
        return void 0;
      }
    };

    RemoteProcedure.prototype.getSchemaSignature = function(typeIdentifier, schemaMap){
      var isBasicType, collectionType;
      collectionType = this.isCollectionRef(typeIdentifier);
      isBasicType = ((collectionType != null) && schemaMap[collectionType]) || (schemaMap[typeIdentifier] != null) ? false : true;
      if (isBasicType) {
        return typeIdentifier;
      } else {
        if (collectionType != null) {
          return schemaMap[collectionType].generateExample(typeIdentifier);
        } else {
          return schemaMap[typeIdentifier].generateExample(typeIdentifier);
        }
      }
    };

    RemoteProcedure.prototype.executeCall = function(callArguments, onCompletion, onErrorCallback){
      var requestBody, requestHeaders;
      if (callArguments == null) {
        callArguments = {};
      }
      if ((typeof callArguments) === "function") {
        onErrorCallback = onCompletion;
        onCompletion = callArguments;
        callArguments = {};
      }
      if (onErrorCallback == null) {
        onErrorCallback = function(xhrObject, statusText, errorMsg){
          return console.error(xhrObject, statusText, errorMsg);
        };
      }
      if (onCompletion == null) {
        onCompletion = function(responseData){
          return console.info(responseData);
        };
      }
      if (callArguments.requestHeaders != null) {
        requestHeaders = callArguments.requestHeaders;
        delete callArguments.requestHeaders;
      }
      if (callArguments.requestBody != null) {
        // ... (rest of the do function logic would go here)
      }
    };

    return RemoteProcedure;

  })();

}).call(this);