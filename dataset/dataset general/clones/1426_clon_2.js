( function( ) {
  var ApiGateway, DataSchema, SchemaField, ApiEndpoint, EndpointRequest, ApiModule,
    _binder = function(fcn, ctx) { return function() { return fcn.apply(ctx, arguments); }; };

  ApiGateway = ( function( ) {

    ApiGateway.prototype.serviceDiscoveryUrl = "http://api.wordnik.com/v4/resources.json";

    ApiGateway.prototype.verboseLogging = false;

    ApiGateway.prototype.accessKey = null;

    ApiGateway.prototype.rootPath = null;

    function ApiGateway(config) {
      if ( config == null ) {
        config = { };
      }
      if ( config.discoveryUrl != null ) {
        this.serviceDiscoveryUrl = config.discoveryUrl;
      }
      if ( config.debug != null ) {
        this.verboseLogging = config.debug;
      }
      this.accessKeyParamName = config.apiKeyName != null ? config.apiKeyName : 'api_key';
      if ( config.apiKey != null ) {
        this.accessKey = config.apiKey;
      }
      if ( config.api_key != null ) {
        this.accessKey = config.api_key;
      }
      if ( config.verbose != null ) {
        this.detailedOutput = config.verbose;
      }
      this.enableHeaderAuth = config.supportHeaderParams != null ? config.supportHeaderParams : false;
      this.allowedHttpMethods = config.supportedSubmitMethods != null ? config.supportedSubmitMethods : ['get'];
      if ( config.success != null ) {
        this.onSuccess = config.success;
      }
      this.onError = config.failure != null ? config.failure : function() { };
      this.onProgress = config.progress != null ? config.progress : function() { };
      this.requestHeaders = config.headers != null ? config.headers : { };
      this.truthyFalsyTokens = config.booleanValues != null ? config.booleanValues : [ 'true', 'false' ];
      this.serviceDiscoveryUrl = this.appendAccessKey(this.serviceDiscoveryUrl);
      if ( config.success != null ) {
        this.initializeGateway( );
      }
    }

    ApiGateway.prototype.initializeGateway = function( ) {
      var selfRef = this;
      this.onProgress('fetching module list: ' + this.serviceDiscoveryUrl);
      return jQuery.getJSON(this.serviceDiscoveryUrl, function(serviceResponse) {
        var moduleInstance, moduleDef, _iteratorIdx, _iteratorLen, _refOne, _refTwo;
        if ( serviceResponse.apiVersion != null ) {
          selfRef.apiVersion = serviceResponse.apiVersion;
        }
        if ( (serviceResponse.basePath != null) && jQuery.trim(serviceResponse.basePath).length > 0 ) {
          selfRef.rootPath = serviceResponse.basePath;
          if ( selfRef.rootPath.match(/^HTTP/i) == null ) {
            selfRef.reportError("discoveryUrl rootPath must be a valid URL.");
          }
          selfRef.rootPath = selfRef.rootPath.replace(/\/$/, '');
        } else {
          selfRef.rootPath = selfRef.serviceDiscoveryUrl.substring(0, selfRef.serviceDiscoveryUrl.lastIndexOf('/'));
          console.info('derived rootPath from serviceDiscoveryUrl as ' + selfRef.rootPath);
        }
        selfRef.modules = { };
        selfRef.moduleList = [ ];
        if ( serviceResponse.resourcePath != null ) {
          selfRef.modulePath = serviceResponse.resourcePath;
          moduleInstance = null;
          _refOne = serviceResponse.apis;
          for ( _iteratorIdx = 0, _iteratorLen = _refOne.length; _iteratorIdx < _iteratorLen; _iteratorIdx++ ) {
            moduleDef = _refOne[_iteratorIdx];
            if ( moduleInstance === null ) {
              moduleInstance = new ApiModule(moduleDef, selfRef);
            } else {
              moduleInstance.registerEndpoints(moduleDef.path, moduleDef.operations);
            }
          }
          if ( moduleInstance != null ) {
            selfRef.modules[moduleInstance.entityName] = moduleInstance;
            selfRef.moduleList.push(moduleInstance);
            moduleInstance.ready = true;
            selfRef.processModules( );
          }
        } else {
          _refTwo = serviceResponse.apis;
          for ( _iteratorIdx = 0, _iteratorLen = _refTwo.length; _iteratorIdx < _iteratorLen; _iteratorIdx++ ) {
            moduleDef = _refTwo[_iteratorIdx];
            moduleInstance = new ApiModule(moduleDef, selfRef);
            selfRef.modules[moduleInstance.entityName] = moduleInstance;
            selfRef.moduleList.push(moduleInstance);
          }
        }
        return selfRef;
      }).error( function( err ) {
        if ( selfRef.serviceDiscoveryUrl.substring(0, 4) !== 'http' ) {
          return selfRef.reportError('Please specify the protocol for ' + selfRef.serviceDiscoveryUrl);
        } else if ( err.status === 0 ) {
          return selfRef.reportError('Cannot connect to server. It may not have the appropriate access-control-origin settings.');
        } else if ( err.status === 404 ) {
          return selfRef.reportError('Cannot retrieve API JSON from ' + selfRef.serviceDiscoveryUrl);
        } else {
          return selfRef.reportError(err.status + ' : ' + err.statusText + ' ' + selfRef.serviceDiscoveryUrl);
        }
      });
    };

    ApiGateway.prototype.processModules = function( ) {
      var moduleDef, moduleName, _moduleRef;
      if ( this.modules == null ) {
        return false;
      }
      _moduleRef = this.modules;
      for ( moduleName in _moduleRef ) {
        moduleDef = _moduleRef[moduleName];
        if ( moduleDef.ready == null ) {
          return false;
        }
      }
      this.setConsolidatedSchemas( );
      this.ready = true;
      if ( this.onSuccess != null ) {
        return this.onSuccess( );
      }
    };

    ApiGateway.prototype.reportError = function(issueMsg) {
      this.onError(issueMsg);
      throw issueMsg;
    };

    ApiGateway.prototype.setConsolidatedSchemas = function( ) {
      var schemaItem, schemaName, moduleDef, moduleName, _iteratorIdx, _iteratorLen, _refOne, _refTwo, _resultsArr;
      this.schemaList = [ ];
      this.schemas = { };
      _refOne = this.modules;
      for ( moduleName in _refOne ) {
        moduleDef = _refOne[moduleName];
        for ( schemaName in moduleDef.schemas ) {
          if ( !(this.schemas[schemaName] != null) ) {
            this.schemas[schemaName] = moduleDef.schemas[schemaName];
            this.schemaList.push(moduleDef.schemas[schemaName]);
          }
        }
      }
      _refTwo = this.schemaList;
      _resultsArr = [ ];
      for ( _iteratorIdx = 0, _iteratorLen = _refTwo.length; _iteratorIdx < _iteratorLen; _iteratorIdx++ ) {
        schemaItem = _refTwo[_iteratorIdx];
        _resultsArr.push(schemaItem.resolveSchemaReferences(this.schemas));
      }
      return _resultsArr;
    };

    ApiGateway.prototype.appendAccessKey = function(targetUrl) {
      var separatorChar;
      if ( (this.accessKey != null) && jQuery.trim(this.accessKey).length > 0 && (targetUrl != null) ) {
        separatorChar = targetUrl.indexOf('?') > 0 ? '&' : '?';
        return targetUrl + separatorChar + this.accessKeyParamName + '=' + this.accessKey;
      } else {
        return targetUrl;
      }
    };

    ApiGateway.prototype.displayDocumentation = function( ) {
      var apiCall, callName, inputParam, moduleDef, moduleName, _refOne, _refTwo, _refThree;
      _refOne = this.modules;
      for ( moduleName in _refOne ) {
        moduleDef = _refOne[moduleName];
        console.log(moduleName);
        _refTwo = moduleDef.endpoints;
        for ( callName in _refTwo ) {
          apiCall = _refTwo[callName];
          console.log("  " + apiCall.endpointId);
          _refThree = apiCall.inputParams;
          for ( var idx = 0, length = _refThree.length; idx < length; idx++ ) {
            inputParam = _refThree[idx];
            console.log("    " + inputParam.paramName + (inputParam.isRequired ? ' (required)' : '') + " - " + inputParam.descriptionText);
          }
        }
      }
      return this;
    };

    return ApiGateway;

  })();

  ApiModule = ( function( ) {

    function ApiModule(moduleDefinition, gatewayRef) {
      var pathSegments, selfRef = this;
      this.gatewayRef = gatewayRef;
      this.endpointPath = this.gatewayRef.modulePath != null ? this.gatewayRef.modulePath : moduleDefinition.path;
      this.descriptionText = moduleDefinition.description;
      pathSegments = this.endpointPath.split("/");
      this.entityName = pathSegments[pathSegments.length - 1].replace('.{format}', '');
      this.rootPath = this.gatewayRef.rootPath;
      this.endpoints = { };
      this.endpointList = [ ];
      this.schemaList = [ ];
      this.schemas = { };
      if ( (moduleDefinition.operations != null) && (this.gatewayRef.modulePath != null) ) {
        this.gatewayRef.onProgress('reading module ' + this.entityName + ' schemas and endpoints');
        this.registerSchemas(moduleDefinition.models);
        this.registerEndpoints(moduleDefinition.path, moduleDefinition.operations);
        this.gatewayRef[this.entityName] = this;
      } else {
        if ( this.endpointPath == null ) {
          this.gatewayRef.reportError("ApiModules must have a path.");
        }
        this.moduleUrl = this.gatewayRef.appendAccessKey(this.gatewayRef.rootPath + this.endpointPath.replace('{format}', 'json'));
        this.gatewayRef.onProgress('fetching module ' + this.entityName + ': ' + this.moduleUrl);
        jQuery.getJSON(this.moduleUrl, function(serviceResponse) {
          var apiEndpoint, _iteratorIdx, _iteratorLen, _refOne;
          if ( (serviceResponse.basePath != null) && jQuery.trim(serviceResponse.basePath).length > 0 ) {
            selfRef.rootPath = serviceResponse.basePath;
            selfRef.rootPath = selfRef.rootPath.replace(/\/$/, '');
          }
          selfRef.registerSchemas(serviceResponse.models);
          if ( serviceResponse.apis ) {
            _refOne = serviceResponse.apis;
            for ( _iteratorIdx = 0, _iteratorLen = _refOne.length; _iteratorIdx < _iteratorLen; _iteratorIdx++ ) {
              apiEndpoint = _refOne[_iteratorIdx];
              selfRef.registerEndpoints(apiEndpoint.path, apiEndpoint.operations);
            }
          }
          selfRef.gatewayRef[selfRef.entityName] = selfRef;
          selfRef.ready = true;
          return selfRef.gatewayRef.processModules( );
        }).error( function( err ) {
          return selfRef.gatewayRef.reportError("Unable to read module '" + selfRef.entityName + "' from path " + selfRef.moduleUrl + " (server returned " + err.statusText + ")");
        });
      }
    }

    ApiModule.prototype.registerSchemas = function(moduleSchemas) {
      var schemaItem, schemaIdentifier, newSchema, _idx, _len, _ref, _results;
      if ( moduleSchemas != null ) {
        for ( schemaIdentifier in moduleSchemas ) {
          if ( !(this.schemas[schemaIdentifier] != null) ) {
            newSchema = new DataSchema(schemaIdentifier, moduleSchemas[schemaIdentifier]);
            this.schemaList.push(newSchema);
            this.schemas[schemaIdentifier] = newSchema;
          }
        }
        _ref = this.schemaList;
        _results = [ ];
        for ( _idx = 0, _len = _ref.length; _idx < _len; _idx++ ) {
          schemaItem = _ref[_idx];
          _results.push(schemaItem.resolveSchemaReferences(this.schemas));
        }
        return _results;
      }
    };

    ApiModule.prototype.registerEndpoints = function(endpointPath, endpointDefs) {
      var requestContentTypes, endpointDef, newEndpoint, _idx, _len, _results;
      if ( endpointDefs ) {
        _results = [ ];
        for ( _idx = 0, _len = endpointDefs.length; _idx < _len; _idx++ ) {
          endpointDef = endpointDefs[_idx];
          requestContentTypes = endpointDef.consumes;
          if ( endpointDef.supportedContentTypes ) {
            requestContentTypes = endpointDef.supportedContentTypes;
          }
          newEndpoint = new ApiEndpoint(
            endpointDef.nickname,
            endpointPath,
            endpointDef.httpMethod,
            endpointDef.parameters,
            endpointDef.summary,
            endpointDef.notes,
            endpointDef.responseClass,
            endpointDef.errorResponses,
            this,
            endpointDef.consumes,
            endpointDef.produces
          );
          this.endpoints[newEndpoint.endpointId] = newEndpoint;
          _results.push(this.endpointList.push(newEndpoint));
        }
        return _results;
      }
    };

    ApiModule.prototype.displayDocumentation = function( ) {
      var apiCall, callName, inputParam, _idx, _len, _refOne, _refTwo;
      _refOne = this.endpoints;
      for ( callName in _refOne ) {
        apiCall = _refOne[callName];
        console.log("  " + apiCall.endpointId);
        _refTwo = apiCall.inputParams;
        for ( _idx = 0, _len = _refTwo.length; _idx < _len; _idx++ ) {
          inputParam = _refTwo[_idx];
          console.log("    " + inputParam.paramName + (inputParam.isRequired ? ' (required)' : '') + " - " + inputParam.descriptionText);
        }
      }
      return this;
    };

    return ApiModule;

  })();

  DataSchema = ( function( ) {

    function DataSchema(schemaName, schemaData) {
      var fieldKey;
      this.entityName = schemaData.id != null ? schemaData.id : schemaName;
      this.fields = [ ];
      for ( fieldKey in schemaData.properties ) {
        this.fields.push(new SchemaField(fieldKey, schemaData.properties[fieldKey]));
      }
    }

    DataSchema.prototype.resolveSchemaReferences = function(allSchemas) {
      var field, _idx, _len, _ref, _results;
      _ref = this.fields;
      _results = [ ];
      for ( _idx = 0, _len = _ref.length; _idx < _len; _idx++ ) {
        field = _ref[_idx];
        if ( allSchemas[field.fieldType] != null ) {
          _results.push(field.refModel = allSchemas[field.fieldType]);
        } else if ( (field.referencedFieldType != null) && (allSchemas[field.referencedFieldType] != null) ) {
          _results.push(field.refModel = allSchemas[field.referencedFieldType]);
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    DataSchema.prototype.generateMockSignature = function(ignoredSchemas) {
      var classEndTag, classStartTag, field, fieldSignatures, generatedSignature, strongTagOpen, strongTagClose, strongerTagOpen, _idx, _jdx, _len, _lenOne, _refOne, _refTwo;
      fieldSignatures = [ ];
      _refOne = this.fields;
      for ( _idx = 0, _len = _refOne.length; _idx < _len; _idx++ ) {
        field = _refOne[_idx];
        fieldSignatures.push(field.toDisplayString( ));
      }
      strongTagOpen = '<span class="strong">';
      strongerTagOpen = '<span class="stronger">';
      strongTagClose = '</span>';
      classStartTag = strongTagOpen + this.entityName + ' {' + strongTagClose;
      classEndTag = strongTagOpen + '}' + strongTagClose;
      generatedSignature = classStartTag + '<div>' + fieldSignatures.join(',</div><div>') + '</div>' + classEndTag;
      if ( !ignoredSchemas ) {
        ignoredSchemas = [ ];
      }
      ignoredSchemas.push(this);
      _refTwo = this.fields;
      for ( _jdx = 0, _lenOne = _refTwo.length; _jdx < _lenOne; _jdx++ ) {
        field = _refTwo[_jdx];
        if ( (field.refModel != null) && (ignoredSchemas.indexOf(field.refModel)) === -1 ) {
          generatedSignature = generatedSignature + ('<br>' + field.refModel.generateMockSignature(ignoredSchemas));
        }
      }
      return generatedSignature;
    };

    DataSchema.prototype.createSampleJson = function(ignoredSchemas) {
      var field, sampleObject, _idx, _len, _ref;
      sampleObject = { };
      ignoredSchemas = ignoredSchemas || [ ];
      ignoredSchemas.push(this.entityName);
      _ref = this.fields;
      for ( _idx = 0, _len = _ref.length; _idx < _len; _idx++ ) {
        field = _ref[_idx];
        sampleObject[field.paramName] = field.retrieveSampleValue(ignoredSchemas);
      }
      return sampleObject;
    };

    return DataSchema;

  })();

  SchemaField = ( function( ) {

    function SchemaField(paramName, fieldDefinition) {
      this.paramName = paramName;
      this.fieldType = fieldDefinition.type;
      this.isArrayOrList = this.fieldType && (this.fieldType.toLowerCase() === 'array' || this.fieldType.toLowerCase() === 'list' || this.fieldType.toLowerCase() === 'set');
      this.descriptionText = fieldDefinition.description;
      this.isRequired = fieldDefinition.required;
      if ( fieldDefinition.items != null ) {
        if ( fieldDefinition.items.type != null ) {
          this.referencedFieldType = fieldDefinition.items.type;
        }
        if ( fieldDefinition.items.$ref != null ) {
          this.referencedFieldType = fieldDefinition.items.$ref;
        }
      }
      this.fullFieldType = this.referencedFieldType != null ? this.fieldType + '[' + this.referencedFieldType + ']' : this.fieldType;
      if ( fieldDefinition.allowableValues != null ) {
        this.valueCategory = fieldDefinition.allowableValues.valueType;
        this.possibleValues = fieldDefinition.allowableValues.values;
        if ( this.possibleValues != null ) {
          this.possibleValuesString = "'" + this.possibleValues.join("' or '") + "'";
        }
      }
    }

    SchemaField.prototype.retrieveSampleValue = function(ignoredSchemas) {
      var sampleValue;
      if ( (this.refModel != null) && (ignoredSchemas.indexOf(this.refModel.entityName) === -1) ) {
        sampleValue = this.refModel.createSampleJson(ignoredSchemas);
      } else {
        if ( this.isArrayOrList ) {
          sampleValue = this.referencedFieldType;
        } else {
          sampleValue = this.fieldType;
        }
      }
      if ( this.isArrayOrList ) {
        return [sampleValue];
      } else {
        return sampleValue;
      }
    };

    SchemaField.prototype.toDisplayString = function( ) {
      var reqStatus, displayStr;
      reqStatus = this.isRequired ? 'propReq' : 'propOpt';
      displayStr = '<span class="propName ' + reqStatus + '">' + this.paramName + '</span> (<span class="propType">' + this.fullFieldType + '</span>';
      if ( !this.isRequired ) {
        displayStr += ', <span class="propOptKey">optional</span>';
      }
      displayStr += ')';
      if ( this.possibleValues != null ) {
        displayStr += " = <span class='propVals'>['" + this.possibleValues.join("' or '") + "']</span>";
      }
      if ( this.descriptionText != null ) {
        displayStr += ': <span class="propDesc">' + this.descriptionText + '</span>';
      }
      return displayStr;
    };

    return SchemaField;

  })();

  ApiEndpoint = ( function( ) {

    function ApiEndpoint(endpointId, endpointPath, httpVerb, inputParams, briefSummary, detailedNotes, outputSchemaName, errorSchemaList, moduleRef, requestContentTypes, responseContentTypes) {
      var paramDef, valOption, _idx, _jdx, _len, _lenOne, _refOne, _refTwo, _refThree,
        selfRef = this;
      this.endpointId = endpointId;
      this.endpointPath = endpointPath;
      this.httpVerb = httpVerb;
      this.inputParams = inputParams != null ? inputParams : [ ];
      this.briefSummary = briefSummary;
      this.detailedNotes = detailedNotes;
      this.outputSchemaName = outputSchemaName;
      this.errorSchemaList = errorSchemaList;
      this.moduleRef = moduleRef;
      this.requestContentTypes = requestContentTypes;
      this.responseContentTypes = responseContentTypes;
      this["invokeCall"] = _binder(this["invokeCall"], this);

      if ( this.endpointId == null ) {
        this.moduleRef.gatewayRef.reportError("ApiEndpoints must have an identifier.");
      }
      if ( this.endpointPath == null ) {
        this.moduleRef.gatewayRef.reportError("ApiEndpoint " + endpointId + " is missing path.");
      }
      if ( this.httpVerb == null ) {
        this.moduleRef.gatewayRef.reportError("ApiEndpoint " + endpointId + " is missing httpVerb.");
      }
      this.endpointPath = this.endpointPath.replace('{format}', 'json');
      this.httpVerb = this.httpVerb.toLowerCase();
      this.isHttpGet = this.httpVerb === "get";
      this.moduleIdentifier = this.moduleRef.entityName;
      if ( ((_refOne = this.outputSchemaName) != null ? _refOne.toLowerCase() : void 0) === 'void' ) {
        this.outputSchemaName = void 0;
      }
      if ( this.outputSchemaName != null ) {
        this.outputSchemaSignature = this.generateSchemaSignature(this.outputSchemaName, this.moduleRef.schemas);
        this.outputSampleJson = this.generateSampleJson(this.outputSchemaName, this.moduleRef.schemas);
      }
      this.errorSchemaList = this.errorSchemaList || [ ];
      _refTwo = this.inputParams;
      for ( _idx = 0, _len = _refTwo.length; _idx < _len; _idx++ ) {
        paramDef = _refTwo[_idx];
        paramDef.paramName = paramDef.paramName || paramDef.dataType;
        if ( paramDef.dataType.toLowerCase() === 'boolean' ) {
          paramDef.validValues = { };
          paramDef.validValues.values = this.moduleRef.gatewayRef.truthyFalsyTokens;
        }
        paramDef.signature = this.generateSchemaSignature(paramDef.dataType, this.moduleRef.schemas);
        paramDef.sampleJSON = this.generateSampleJson(paramDef.dataType, this.moduleRef.schemas);
        if ( paramDef.validValues != null ) {
          if ( paramDef.validValues.valueType === "RANGE" ) {
            paramDef.isRange = true;
          } else {
            paramDef.isEnumerated = true;
          }
          if ( paramDef.validValues.values != null ) {
            paramDef.validValues.labeledOptions = [ ];
            _refThree = paramDef.validValues.values;
            for ( _jdx = 0, _lenOne = _refThree.length; _jdx < _lenOne; _jdx++ ) {
              valOption = _refThree[_jdx];
              if ( (paramDef.defaultVal != null) && paramDef.defaultVal === valOption ) {
                paramDef.validValues.labeledOptions.push({
                  value: valOption,
                  isDefault: true
                });
              } else {
                paramDef.validValues.labeledOptions.push({
                  value: valOption,
                  isDefault: false
                });
              }
            }
          }
        }
      }
    }

    ApiEndpoint.prototype.invokeCall = function(paramValues, optionalCallback) {
      var allHeaders, dataPayload, header, headerValue, inputParam, isFile, is and, _idx, _len, _ref, _request;
      if ( optionalCallback == null ) {
        optionalCallback = null;
      }
      dataPayload = {
        mock: false,
        url: this.moduleRef.rootPath + this.endpointPath,
        method: this.httpVerb,
        body: null,
        headers: { },
        response: null,
        error: null
      };
      allHeaders = { };
      for ( header in this.moduleRef.gatewayRef.requestHeaders ) {
        headerValue = this.moduleRef.gatewayRef.requestHeaders[header];
        allHeaders[header] = headerValue;
      }
      _ref = this.inputParams;
      for ( _idx = 0, _len = _ref.length; _idx < _len; _idx++ ) {
        inputParam = _ref[_idx];
        if ( paramValues[inputParam.paramName] != null ) {
          if ( inputParam.paramType === 'query' ) {
            if ( dataPayload.url.indexOf('?') < 0 ) {
              dataPayload.url += '?' + inputParam.paramName + '=' + paramValues[inputParam.paramName];
            } else {
              dataPayload.url += '&' + inputParam.paramName + '=' + paramValues[inputParam.paramName];
            }
          }
          if ( inputParam.paramType === 'path' ) {
            dataPayload.url = dataPayload.url.replace('{' + inputParam.paramName + '}', paramValues[inputParam.paramName]);
          }
          if ( inputParam.paramType === 'header' ) {
            allHeaders[inputParam.paramName] = paramValues[inputParam.paramName];
          }
          if ( inputParam.paramType === 'body' ) {
            dataPayload.body = paramValues[inputParam.paramName];
          }
          if ( inputParam.paramType === 'form' ) {
            isFile = inputParam.dataType.toLowerCase() === 'file';
            dataPayload.body = dataPayload.body || {};
            dataPayload.body[inputParam.paramName] = paramValues[inputParam.paramName];
            if ( isFile ) {
              dataPayload.isFile = true;
            }
          }
        }
      }
      dataPayload.headers = allHeaders;
      _request = new EndpointRequest(dataPayload, this.outputSchemaName, optionalCallback, this.moduleRef.gatewayRef);
      return _request.send( );
    };

    ApiEndpoint.prototype.generateSchemaSignature = function(schemaName, schemas) {
      var typeSignature = schemas[schemaName];
      if ( typeSignature != null ) {
        return typeSignature.generateMockSignature( );
      } else {
        return schemaName;
      }
    };

    ApiEndpoint.prototype.generateSampleJson = function(schemaName, schemas) {
      var schemaInstance = schemas[schemaName];
      if ( schemaInstance != null ) {
        return schemaInstance.createSampleJson( );
      } else {
        return {};
      }
    };

    return ApiEndpoint;

  })();

  EndpointRequest = ( function( ) {

    function EndpointRequest(dataPayload, outputSchemaName, requestCallback, gatewayRef) {
      this.dataPayload = dataPayload;
      this.outputSchemaName = outputSchemaName;
      this.requestCallback = requestCallback;
      this.gatewayRef = gatewayRef;
      this.success = _binder(this.success, this);
      this.error = _binder(this.error, this);
      this.progress = _binder(this.progress, this);
    }

    EndpointRequest.prototype.send = function( ) {
      var _this = this;
      if ( this.dataPayload.body && this.dataPayload.method !== 'post' && this.dataPayload.method !== 'put' && this.dataPayload.method !== 'patch' ) {
        this.gatewayRef.reportError('Cannot set body for ' + this.dataPayload.method + ' method.');
      }
      if ( this.dataPayload.isFile ) {
        return jQuery.ajax({
          url: this.dataPayload.url,
          type: this.dataPayload.method,
          headers: this.dataPayload.headers,
          data: this.dataPayload.body,
          dataType: 'json',
          processData: false,
          contentType: false,
          success: function(data) {
            return _this.success(data);
          },
          error: function(jqXHR, textStatus, errorThrown) {
            return _this.error(jqXHR, textStatus, errorThrown);
          }
        });
      } else {
        return jQuery.ajax({
          url: this.dataPayload.url,
          type: this.dataPayload.method,
          headers: this.dataPayload.headers,
          data: JSON.stringify(this.dataPayload.body),
          dataType: 'json',
          contentType: 'application/json',
          success: function(data) {
            return _this.success(data);
          },
          error: function(jqXHR, textStatus, errorThrown) {
            return _this.error(jqXHR, textStatus, errorThrown);
          }
        });
      }
    };

    EndpointRequest.prototype.success = function(data) {
      var result = data;
      if ( this.outputSchemaName != null ) {
        result = this.moduleRef.schemas[this.outputSchemaName].createSampleJson( );
      }
      return this.requestCallback(result);
    };

    EndpointRequest.prototype.error = function(jqXHR, textStatus, errorThrown) {
      return this.requestCallback({
        error: jqXHR,
        textStatus: textStatus,
        errorThrown: errorThrown
      });
    };

    EndpointRequest.prototype.progress = function(msg) {
      return this.gatewayRef.onProgress(msg);
    };

    return EndpointRequest;

  })();

}).call(this);