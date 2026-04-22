function ConstructorFactory(BaseClass, memberInitializer) {
  if ( ! memberInitializer ) {
    memberInitializer = BaseClass;
    BaseClass = function(){};
  }
  var DerivedClass = function(constructorArg) {
    if ( this.init && constructorArg !== ConstructorFactory ) {
      this.init.apply(this, arguments);
    }
  };
  memberInitializer.call(DerivedClass.prototype = new BaseClass(ConstructorFactory), BaseClass.prototype);
  return DerivedClass;
}

var internalIndexOf = [].indexOf || function(itemToFind) {
  for ( var i = 0, arrayLength = this.length; i < arrayLength; i++ ) {
    if ( i in this && this[i] === itemToFind ) return i;
  }
  return -1;
},
  hasOwnPropertyCheck = {}.hasOwnProperty;

ko.utilities.UniqueIdCache = function() {
  this.locate = function(uniqueIdentifier, parameters) {
    return $.grep(this, function(itemData) {
      return itemData.uniqueIdentifier === uniqueIdentifier && ko.utilities.serializeObject(itemData.parameters) === ko.utilities.serializeObject(parameters);
    })[0];
  };
  return this;
};

ko.utilities.UniqueIdCache.prototype = new Array();

ko.utilities.decodeHtmlEntities = function(inputString) {
  var decodedResult, temporaryDiv;
  if ( inputString.length > 0 ) {
    temporaryDiv = document.createElement("div");
    temporaryDiv.innerHTML = inputString;
    decodedResult = temporaryDiv.childNodes[0].nodeValue;
    temporaryDiv.removeChild(temporaryDiv.firstChild);
    return decodedResult;
  } else {
    return inputString;
  }
};

var KOCustomViewModel = ConstructorFactory(function() {

  var _routeMap = {}, _defaultValues = {}, _volatileAttributes = [], _postActionCallbacks = {}, _dataCache = new ko.utilities.UniqueIdCache(), _snapshotData = {};

  var _valueEquator = function(valA, valB) {
    var isPrimitiveTypeA, basicTypes, typeRef;
    basicTypes = {
      'undefined': true,
      'boolean': true,
      'number': true,
      'string': true
    };
    isPrimitiveTypeA = (valA === null) || (typeRef = typeof valA, internalIndexOf.call(basicTypes, typeRef) >= 0);
    if ( isPrimitiveTypeA ) {
      return valA === valB;
    } else {
      return false;
    }
  };

  this.initializeModel = function() {
    var propName, propValue;
    this._routeMap = _routeMap;
    for ( propName in this ) {
      if ( ! hasOwnPropertyCheck.call(this, propName) ) continue;
      propValue = this[propName];
      if ( propName !== "_routeMap" ) {
        if ( ko.isObservableField(this[propName]) ) {
          this[propName].valueEquator = _valueEquator;
        }
        _defaultValues[propName] = this.retrieve(propName);
      }
    }
  };

  this._routeMap = {};

  this.defineRoute = function(routeId, routePath, isFixed) {
    if ( isFixed == null ) {
      isFixed = true;
    }
    this._routeMap[routeId] = routePath;
    if ( isFixed === true ) {
      return _routeMap[routeId] = routePath;
    }
  };

  this.retrieve = function(attributeName) {
    return ko.utilities.extractValue(this[attributeName]);
  };

  this.assignValues = function(inputValues) {
    var propName, valueToSet, processedValue, currentObject;
    currentObject = this;
    for ( propName in inputValues ) {
      valueToSet = inputValues[propName];
      if ( ko.isMutableObservable(currentObject[propName]) ) {
        processedValue = typeof valueToSet === "string" && valueToSet.match(/&[^\s]*;/) !== false ? ko.utilities.decodeHtmlEntities(valueToSet) : valueToSet;
        if ( processedValue !== currentObject[propName]() ) {
          currentObject[propName](processedValue);
        }
      } else if ( currentObject[propName] !== void 0 && ko.isObservableField(currentObject[propName]) === false ) {
        processedValue = valueToSet.match(/&[^\s]*;/) !== false ? ko.utilities.decodeHtmlEntities(valueToSet) : valueToSet;
        currentObject[propName] = processedValue;
      }
    }
    return currentObject;
  };

  this.sendPostRequest = function(endpointName, requestParameters, responseCallback, dataType) {
    var targetUrl;
    if ( requestParameters == null ) {
      requestParameters = {};
    }
    if ( responseCallback == null ) {
      responseCallback = null;
    }
    if ( dataType == null ) {
      dataType = "json";
    }
    if ( endpointName.match(/^https?:\/\//) === null ) {
      targetUrl = this._routeMap[endpointName];
    } else {
      targetUrl = endpointName;
    }
    return executePost(targetUrl, requestParameters, responseCallback, dataType);
  };

  this.sendGetRequest = function(endpointName, requestParameters, responseCallback, dataType) {
    var targetUrl;
    if ( requestParameters == null ) {
      requestParameters = {};
    }
    if ( responseCallback == null ) {
      responseCallback = null;
    }
    if ( dataType == null ) {
      dataType = "json";
    }
    if ( endpointName.match(/^https?:\/\//) === null ) {
      targetUrl = this._routeMap[endpointName];
    } else {
      targetUrl = endpointName;
    }
    return executeGet(targetUrl, requestParameters, responseCallback, dataType);
  };

  var executePost = function(endpointName, requestParameters, responseCallback, dataType) {
    var actionHandlers, modelTypeName, requestUrl;
    if ( requestParameters == null ) {
      requestParameters = {};
    }
    if ( responseCallback == null ) {
      responseCallback = null;
    }
    if ( dataType == null ) {
      dataType = "json";
    }
    if ( endpointName.match(/^https?:\/\//) === null ) {
      requestUrl = this._parseEndpointUrl(this._routeMap[endpointName], requestParameters);
    } else {
      requestUrl = this._parseEndpointUrl(endpointName, requestParameters);
    }
    modelTypeName = this.name;
    actionHandlers = this._postActionCallbacks;
    return RQ.add($.post(requestUrl, requestParameters, function(responseData) {
      try {
        if ( typeof actionHandlers[endpointName] === "function" ) {
          actionHandlers[endpointName](responseData);
        }
        if ( typeof responseCallback === "function" ) {
          return responseCallback(responseData);
        }
      } catch (requestError) {

      }
    }, dataType), ("request_" + modelTypeName + "_") + new Date());
  };

  var executeGet = function(endpointName, requestParameters, responseCallback, dataType) {
    var actionHandlers, cachedEntry, cacheInstance, modelTypeName, shouldCache, temporaryParameters, requestUrl;
    if ( requestParameters == null ) {
      requestParameters = {};
    }
    if ( responseCallback == null ) {
      responseCallback = null;
    }
    if ( dataType == null ) {
      dataType = "json";
    }
    if ( endpointName.match(/^https?:\/\//) === null ) {
      requestUrl = this._parseEndpointUrl(this._routeMap[endpointName], requestParameters);
    } else {
      requestUrl = this._parseEndpointUrl(endpointName, requestParameters);
    }
    modelTypeName = this.name;
    shouldCache = requestParameters["_useCache"] === true;
    if ( shouldCache === true ) {
      delete requestParameters["_useCache"];
    }
    cacheInstance = this._dataCache;
    actionHandlers = this._postActionCallbacks;
    if ( shouldCache === true ) {
      cachedEntry = cacheInstance.locate("" + modelTypeName + "#" + endpointName, requestParameters);
    }
    if ( cachedEntry != null ) {
      if ( typeof responseCallback === "function" ) {
        return responseCallback(cachedEntry.data);
      }
    } else {
      temporaryParameters = $.extend({}, requestParameters);
      temporaryParameters["_noCacheBuster"] = new Date().getTime();
      return RQ.add($.get(requestUrl, temporaryParameters, function(itemData) {
        if ( shouldCache === true ) {
          cacheInstance.add({
            uniqueIdentifier: "" + modelTypeName + "#" + endpointName,
            parameters: requestParameters,
            data: itemData
          });
        }
        try {
          if ( typeof actionHandlers[endpointName] === "function" ) {
            actionHandlers[endpointName](itemData);
          }
          if ( typeof responseCallback === "function" ) {
            return responseCallback(itemData);
          }
        } catch (requestError) {

        }
      }, dataType), ("request_" + modelTypeName + "_") + new Date());
    }
  };

  var buildCollection = function(inputData, itemProcessor) {
    var resultCollection, dataItem, newObject, _idx, _len;
    resultCollection = [];
    for ( _idx = 0, _len = inputData.length; _idx < _len; _idx++ ) {
      dataItem = inputData[_idx];
      newObject = new this();
      if ( typeof itemProcessor === "function" ) {
        newObject.assignValues(itemProcessor(dataItem));
      } else {
        newObject.assignValues(dataItem);
      }
      resultCollection.push(newObject);
    }
    return resultCollection;
  };

  this.resetModel = function() {
    return this.assignValues(_defaultValues);
  };

  this.reloadModel = function(completionCallback) {
    return this.displayData(function(responseData) {
      if ( responseData.status === "SUCCESS" ) {
        this.assignValues(responseData);
      }
      if ( typeof completionCallback === "function" ) {
        return completionCallback(responseData);
      }
    });
  };

  this.convertToJson = function(exportOptions) {
    return ko.toJSON(this.duplicate(exportOptions));
  };

  this.convertToPlainJS = function(exportOptions) {
    return ko.toJS(this.duplicate(exportOptions));
  };

  this.duplicate = function(cloneOptions) {
    var propName, exclusionKey, clonedProperties, temporaryExclusions, _idx, _len, typeRef;
    if ( cloneOptions == null ) {
      cloneOptions = {};
    }
    temporaryExclusions = {
      '_routeMap': false
    };
    typeRef = _volatileAttributes;
    for ( _idx = 0, _len = typeRef.length; _idx < _len; _idx++ ) {
      exclusionKey = typeRef[_idx];
      temporaryExclusions[exclusionKey] = false;
    }
    cloneOptions = $.extend(temporaryExclusions, cloneOptions);
    clonedProperties = {};
    for ( propName in this ) {
      if ( ! hasOwnPropertyCheck.call(this, propName) ) continue;
      if ( cloneOptions[propName] === true || cloneOptions[propName] === void 0 ) {
        clonedProperties[propName] = this.retrieve(propName);
      }
    }
    return clonedProperties;
  };

  this.createSnapshot = function() {
    return _snapshotData = this.convertToPlainJS();
  };

  this.revertToSnapshot = function() {
    this.assignValues(_snapshotData);
    _snapshotData = {};
    return this;
  };

  this.beginEditSession = function() {
    var propName, propValue, operationResults;
    operationResults = [];
    for ( propName in this ) {
      if ( ! hasOwnPropertyCheck.call(this, propName) ) continue;
      propValue = this[propName];
      if ( typeof this[propName].valueEquator === "function" ) {
        operationResults.push(this[propName].valueEquator = function() {
          return true;
        });
      } else {
        operationResults.push(void 0);
      }
    }
    return operationResults;
  };

  this.endEditSession = function() {
    var propName, propValue, operationResults;
    operationResults = [];
    for ( propName in this ) {
      if ( ! hasOwnPropertyCheck.call(this, propName) ) continue;
      propValue = this[propName];
      if ( typeof this[propName].valueEquator === "function" ) {
        this[propName].valueEquator = _valueEquator;
        if ( typeof this[propName].hasValuechanged === "function" ) {
          operationResults.push(this[propName].hasValuechanged());
        } else {
          operationResults.push(void 0);
        }
      } else {
        operationResults.push(void 0);
      }
    }
    return operationResults;
  };

  this.isUnsaved = function() {
    var identifierValue;
    identifierValue = this.retrieve("primaryId");
    return identifierValue === null || identifierValue === void 0 || identifierValue === "";
  };

  this.performValidation = function() {
    return true;
  };

  this.persistModel = function() {
    var completionCallback, requestOptions, _destructured;
    if ( this.performValidation() === true ) {
      if ( this.isUnsaved() === true ) {
        return this.createNew.apply(this, arguments);
      } else {
        return this.modifyExisting.apply(this, arguments);
      }
    } else {
      _destructured = _parseRequestArguments.apply(this, arguments), requestOptions = _destructured[0], completionCallback = _destructured[1];
      if ( typeof completionCallback === "function" ) {
        return completionCallback({
          status: "ERROR",
          message: "Invalid object"
        });
      }
    }
  };

  var _parseRequestArguments = function() {
    var parsedCallback, parsedParameters;
    parsedParameters = {};
    parsedCallback = null;
    if ( typeof arguments[0] === "function" ) {
      parsedCallback = arguments[0];
    } else if ( typeof arguments[0] === "object" ) {
      parsedParameters = arguments[0];
      if ( typeof arguments[1] === "function" ) {
        parsedCallback = arguments[1];
      }
    }
    return [parsedParameters, parsedCallback];
  };

  var _parseEndpointUrl = function(inputUrl, urlParams) {
    var anchorElement, processedLink;
    anchorElement = document.createElement("a");
    anchorElement.href = inputUrl;
    anchorElement.pathname = anchorElement.pathname.replace(/:([a-zA-Z0-9_]+)/g, function(match) {
      var paramKey, paramValue;
      paramKey = match.substring(1);
      paramValue = urlParams[paramKey];
      delete urlParams[paramKey];
      return paramValue;
    });
    processedLink = anchorElement.href;
    anchorElement = null;
    return processedLink;
  };

  this.createNew = function() {
    var completionCallback, requestOptions, _destructured;
    _destructured = _parseRequestArguments.apply(this, arguments), requestOptions = _destructured[0], completionCallback = _destructured[1];
    requestOptions = $.extend(requestOptions, this.convertToPlainJS());
    return this.sendPostRequest("create", requestOptions, completionCallback);
  };

  this.modifyExisting = function() {
    var completionCallback, requestOptions, _destructured;
    _destructured = _parseRequestArguments.apply(this, arguments), requestOptions = _destructured[0], completionCallback = _destructured[1];
    requestOptions = $.extend(requestOptions, this.convertToPlainJS());
    return this.sendPostRequest("update", requestOptions, completionCallback);
  };

  this.removeEntry = function() {
    var completionCallback, requestOptions, _destructured;
    _destructured = _parseRequestArguments.apply(this, arguments), requestOptions = _destructured[0], completionCallback = _destructured[1];
    requestOptions = $.extend(requestOptions, this.convertToPlainJS());
    return this.sendPostRequest("destroy", requestOptions, completionCallback);
  };

  this.displayData = function() {
    var completionCallback, requestOptions, _destructured;
    _destructured = _parseRequestArguments.apply(this, arguments), requestOptions = _destructured[0], completionCallback = _destructured[1];
    requestOptions = $.extend(requestOptions, {
      primaryId: this.retrieve("primaryId")
    });
    return this.sendGetRequest("show", requestOptions, completionCallback);
  };

  this.listAll = function() {
    var completionCallback, requestOptions, _destructured;
    _destructured = _parseRequestArguments.apply(this, arguments), requestOptions = _destructured[0], completionCallback = _destructured[1];
    return this.sendGetRequest("index", requestOptions, completionCallback);
  };

  var createNewRecord = function() {
    var completionCallback, requestOptions, _destructured;
    _destructured = this._parseRequestArguments.apply(this, arguments), requestOptions = _destructured[0], completionCallback = _destructured[1];
    return this.sendPostRequest("create", requestOptions, completionCallback);
  };

  var modifyRecord = function() {
    var completionCallback, requestOptions, _destructured;
    _destructured = this._parseRequestArguments.apply(this, arguments), requestOptions = _destructured[0], completionCallback = _destructured[1];
    return this.sendPostRequest("update", requestOptions, completionCallback);
  };

  var removeRecord = function() {
    var completionCallback, requestOptions, _destructured;
    _destructured = this._parseRequestArguments.apply(this, arguments), requestOptions = _destructured[0], completionCallback = _destructured[1];
    return this.sendPostRequest("destroy", requestOptions, completionCallback);
  };

  var displayRecord = function() {
    var completionCallback, requestOptions, _destructured;
    _destructured = this._parseRequestArguments.apply(this, arguments), requestOptions = _destructured[0], completionCallback = _destructured[1];
    return this.sendGetRequest("show", requestOptions, completionCallback);
  };

  var listRecords = function() {
    var completionCallback, requestOptions, _destructured;
    _destructured = this._parseRequestArguments.apply(this, arguments), requestOptions = _destructured[0], completionCallback = _destructured[1];
    return this.sendGetRequest("index", requestOptions, completionCallback);
  };

  var terminateAllRequests = function() {
    return RQ.cancelMatching(/^request_#{@modelTypeName}_/);
  };
});