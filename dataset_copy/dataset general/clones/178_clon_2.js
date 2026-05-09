// This file constitutes the CoreForge.js framework version 0.5.3
// (c) 2010 Jordan Smith, DigitalCloud Corp.
// CoreForge may be freely distributed under the MIT license agreement.
// For complete documentation and usage details, refer to:
// http://digitalcloud.github.io/coreforge

(function () {
  // Core Initialization Steps
  // -------------------------

  // Store a link to the global execution context.
  var globalScope = this;

  // Preserve the prior state of the `CoreForge` global variable.
  var priorFramework = globalScope.CoreForge;

  // The primary application namespace. All public CoreForge components and modules will
  // be attached to this object. Exported for both CommonJS environments and web browsers.
  var CoreForge;

  if (typeof exports !== 'undefined') {
    CoreForge = exports;
  } else {
    CoreForge = globalScope.CoreForge = {};
  }

  // The current library version. Keep synchronized with `project.json`.
  CoreForge.CURRENT_REV = '0.5.3';

  // Load the utility library (Underscore), if running on the server and not already present.
  var utilLib = globalScope._;
  if (!utilLib && (typeof require !== 'undefined')) utilLib = require('underscore')._;

  // For CoreForge's operations, jQuery or Zepto manages the `$` variable.
  var domHandler = globalScope.jQuery || globalScope.Zepto;

  // Executes CoreForge.js in a *non-conflicting* mode, restoring the `CoreForge` variable
  // to its previous owner. Returns a reference to the current CoreForge object.
  CoreForge.releaseOwnership = function () {
    globalScope.CoreForge = priorFramework;
    return this;
  };

  // Enable `mimicHTTP` to support older HTTP servers. Activating this setting will
  // simulate `"PUT"` and `"DELETE"` requests using the `_requestMethod` parameter and set a
  // `X-Http-Method-Override` header.
  CoreForge.mimicHTTP = false;

  // Enable `mimicJSON` for compatibility with legacy servers that cannot handle direct
  // `application/json` requests; instead, the body will be encoded as
  // `application/x-www-form-urlencoded` and the data unit will be sent in a
  // form parameter named `dataUnit`.
  CoreForge.mimicJSON = false;

  // CoreForge.EventBus
  // ------------------

  // A component that can be incorporated into *any object* to equip it with
  // custom event capabilities. You can `subscribe` or `unsubscribe` a function
  // to an event; `emit`-ing an event triggers all associated functions sequentially.
  //
  //     var myObject = {};
  //     utilLib.extend(myObject, CoreForge.EventBus);
  //     myObject.subscribe('expanded', function(){ alert('content expanded'); });
  //     myObject.emit('expanded');
  //
  CoreForge.EventBus = {

    // Subscribes a function, identified by a string `eventKey`, to an `eventAction`.
    // Specifying `"all"` will subscribe the action to every event emitted.
    subscribe: function (eventKey, eventAction, scope) {
      var registeredActions = this._subscriptions || (this._subscriptions = {});
      var actionList = registeredActions[eventKey] || (registeredActions[eventKey] = []);
      actionList.push([eventAction, scope]);
      return this;
    },

    // Removes one or multiple event actions. If `eventAction` is null, all
    // actions for the `eventKey` are removed. If `eventKey` is null, all subscribed actions
    // for all events are cleared.
    unsubscribe: function (eventKey, eventAction) {
      var registeredActions;
      if (!eventKey) {
        this._subscriptions = {};
      } else if (registeredActions = this._subscriptions) {
        if (!eventAction) {
          registeredActions[eventKey] = [];
        } else {
          var actionList = registeredActions[eventKey];
          if (!actionList) return this;
          for (var i = 0, len = actionList.length; i < len; i++) {
            if (actionList[i] && eventAction === actionList[i][0]) {
              actionList[i] = null;
              break;
            }
          }
        }
      }
      return this;
    },

    // Emits an event, triggering all bound functions. Functions receive the
    // same arguments as `emit`, excluding the event name.
    // Subscribing to `"all"` passes the actual event name as the first argument.
    emit: function (signalName) {
      var actionList, registeredActions, currentEvent, eventAction, payloadArgs;
      var iterationCount = 2; // Loop twice: once for specific event, once for 'all'
      if (!(registeredActions = this._subscriptions)) return this;
      while (iterationCount--) {
        currentEvent = iterationCount ? signalName : 'all';
        if (actionList = registeredActions[currentEvent]) {
          for (var i = 0, len = actionList.length; i < len; i++) {
            if (!(eventAction = actionList[i])) {
              actionList.splice(i, 1);
              i--;
              len--;
            } else {
              payloadArgs = iterationCount ? Array.prototype.slice.call(arguments, 1) : arguments;
              eventAction[0].apply(eventAction[1] || this, payloadArgs);
            }
          }
        }
      }
      return this;
    }

  };

  // CoreForge.DataUnit
  // ------------------

  // Creates a new data unit, complete with defined data properties. A client identifier (`clientIdentifier`)
  // is automatically generated and assigned.
  CoreForge.DataUnit = function (dataProperties, configSettings) {
    var defaultValues;
    dataProperties || (dataProperties = {});
    if (defaultValues = this.defaultValues) {
      if (utilLib.isFunction(defaultValues)) defaultValues = defaultValues.call(this);
      dataProperties = utilLib.extend({}, defaultValues, dataProperties);
    }
    this.dataProperties = {};
    this._sanitizedProperties = {};
    this.clientIdentifier = utilLib.uniqueId('u');
    this.configure(dataProperties, { silent: true });
    this._hasModified = false;
    this._priorDataProperties = utilLib.clone(this.dataProperties);
    if (configSettings && configSettings.dataCollection) this.dataCollection = configSettings.dataCollection;
    this.initiate(dataProperties, configSettings);
  };

  // Attaches all inheritable methods to the DataUnit prototype.
  utilLib.extend(CoreForge.DataUnit.prototype, CoreForge.EventBus, {

    // A snapshot of the unit's previous data properties, taken immediately
    // after the last `"changed"` event was emitted.
    _priorDataProperties: null,

    // Indicates if the item has been modified since the last `"changed"` event.
    _hasModified: false,

    // The default designation for the JSON `uniqueId` attribute is `"uniqueId"`. Users of
    // DocumentDB or NoSQL databases might want to set this to `"_uniqueId"`.
    identifierKey: 'uniqueId',

    // Initiate is an empty function by default. Override it with your specific
    // initialization logic.
    initiate: function () { },

    // Returns a copy of the data unit's `dataProperties` object.
    toPortableObject: function () {
      return utilLib.clone(this.dataProperties);
    },

    // Retrieves the value of a specific data property.
    obtain: function (propertyKey) {
      return this.dataProperties[propertyKey];
    },

    // Retrieves the HTML-sanitized value of a data property.
    cleanMarkup: function (propertyKey) {
      var cleanValue;
      if (cleanValue = this._sanitizedProperties[propertyKey]) return cleanValue;
      var propertyValue = this.dataProperties[propertyKey];
      return this._sanitizedProperties[propertyKey] = sanitizeMarkup(propertyValue == null ? '' : '' + propertyValue);
    },

    // Returns `true` if the property holds a value that is neither null
    // nor undefined.
    hasProperty: function (propertyKey) {
      return this.dataProperties[propertyKey] != null;
    },

    // Sets a collection of data unit properties on the object, emitting `"changed"` unless
    // explicitly silenced.
    configure: function (newProperties, configSettings) {

      // Extract properties and configuration settings.
      configSettings || (configSettings = {});
      if (!newProperties) return this;
      if (newProperties.dataProperties) newProperties = newProperties.dataProperties;
      var currentProperties = this.dataProperties, sanitized = this._sanitizedProperties;

      // Perform validation checks.
      if (!configSettings.silent && this.checkValidity && !this._executeValidation(newProperties, configSettings)) return false;

      // Check for alterations in `uniqueId`.
      if (this.identifierKey in newProperties) this.uniqueId = newProperties[this.identifierKey];

      // We are about to begin emitting change events.
      var alreadyChanging = this._inProcessOfChanging;
      this._inProcessOfChanging = true;

      // Update data properties.
      for (var propertyKey in newProperties) {
        var propertyValue = newProperties[propertyKey];
        if (!utilLib.isEqual(currentProperties[propertyKey], propertyValue)) {
          currentProperties[propertyKey] = propertyValue;
          delete sanitized[propertyKey];
          this._hasModified = true;
          if (!configSettings.silent) this.emit('changed:' + propertyKey, this, propertyValue, configSettings);
        }
      }

      // Emit the `"changed"` event, if the data unit has been altered.
      if (!alreadyChanging && !configSettings.silent && this._hasModified) this.notifyChange(configSettings);
      this._inProcessOfChanging = false;
      return this;
    },

    // Removes a property from the data unit, emitting `"changed"` unless silenced.
    // `removeProperty` is a no-op if the property does not exist.
    removeProperty: function (propertyKey, configSettings) {
      if (!(propertyKey in this.dataProperties)) return this;
      configSettings || (configSettings = {});
      var removedValue = this.dataProperties[propertyKey];

      // Perform validation checks.
      var validationObject = {};
      validationObject[propertyKey] = undefined;
      if (!configSettings.silent && this.checkValidity && !this._executeValidation(validationObject, configSettings)) return false;

      // Remove the property.
      delete this.dataProperties[propertyKey];
      delete this._sanitizedProperties[propertyKey];
      if (propertyKey == this.identifierKey) delete this.uniqueId;
      this._hasModified = true;
      if (!configSettings.silent) {
        this.emit('changed:' + propertyKey, this, undefined, configSettings);
        this.notifyChange(configSettings);
      }
      return this;
    },

    // Clears all properties on the data unit, emitting `"changed"` unless silenced.
    resetProperties: function (configSettings) {
      configSettings || (configSettings = {});
      var propertyKey;
      var previousProperties = this.dataProperties;

      // Perform validation checks.
      var validationObject = {};
      for (propertyKey in previousProperties) validationObject[propertyKey] = undefined;
      if (!configSettings.silent && this.checkValidity && !this._executeValidation(validationObject, configSettings)) return false;

      this.dataProperties = {};
      this._sanitizedProperties = {};
      this._hasModified = true;
      if (!configSettings.silent) {
        for (propertyKey in previousProperties) {
          this.emit('changed:' + propertyKey, this, undefined, configSettings);
        }
        this.notifyChange(configSettings);
      }
      return this;
    },

    // Retrieves the data unit from the server. If the server's representation of the
    // unit differs from its current properties, they will be overwritten,
    // triggering a `"changed"` event.
    retrieve: function (configSettings) {
      configSettings || (configSettings = {});
      var currentDataUnit = this;
      var onSuccess = configSettings.onSuccess;
      configSettings.onSuccess = function (responsePayload, requestStatus, xmlHttpReq) {
        if (!currentDataUnit.configure(currentDataUnit.processResponse(responsePayload, xmlHttpReq), configSettings)) return false;
        if (onSuccess) onSuccess(currentDataUnit, responsePayload);
      };
      configSettings.onError = handleProblem(configSettings.onError, currentDataUnit, configSettings);
      return (this.synchronize || CoreForge.synchronize).call(this, 'read', this, configSettings);
    },

    // Sets a collection of data unit properties, and synchronizes the unit with the server.
    // If the server returns a properties collection that differs, the unit's
    // state will be `configure`d again.
    persist: function (newProperties, configSettings) {
      configSettings || (configSettings = {});
      if (newProperties && !this.configure(newProperties, configSettings)) return false;
      var currentDataUnit = this;
      var onSuccess = configSettings.onSuccess;
      configSettings.onSuccess = function (responsePayload, requestStatus, xmlHttpReq) {
        if (!currentDataUnit.configure(currentDataUnit.processResponse(responsePayload, xmlHttpReq), configSettings)) return false;
        if (onSuccess) onSuccess(currentDataUnit, responsePayload, xmlHttpReq);
      };
      configSettings.onError = handleProblem(configSettings.onError, currentDataUnit, configSettings);
      var requestMethod = this.isNewlyCreated() ? 'create' : 'update';
      return (this.synchronize || CoreForge.synchronize).call(this, requestMethod, this, configSettings);
    },

    // Eliminates this data unit from the server if it was previously persisted. Upon success, the unit is removed
    // from its data collection, if it belongs to one.
    eliminate: function (configSettings) {
      configSettings || (configSettings = {});
      if (this.isNewlyCreated()) return this.emit('removed', this, this.dataCollection, configSettings);
      var currentDataUnit = this;
      var onSuccess = configSettings.onSuccess;
      configSettings.onSuccess = function (responsePayload) {
        currentDataUnit.emit('removed', currentDataUnit, currentDataUnit.dataCollection, configSettings);
        if (onSuccess) onSuccess(currentDataUnit, responsePayload);
      };
      configSettings.onError = handleProblem(configSettings.onError, currentDataUnit, configSettings);
      return (this.synchronize || CoreForge.synchronize).call(this, 'delete', this, configSettings);
    },

    // Default URL for the data unit's representation on the server -- if you're
    // using CoreForge's RESTful methods, override this to alter the endpoint
    // that will be invoked.
    resourceURL: function () {
      var basePath = retrieveResourcePath(this.dataCollection) || this.rootURL || pathIssue();
      if (this.isNewlyCreated()) return basePath;
      return basePath + (basePath.charAt(basePath.length - 1) === '/' ? '' : '/') + encodeURIComponent(this.uniqueId);
    },

    // **processResponse** transforms a server response into the collection of properties to be `configure`d on
    // the data unit. The default implementation simply forwards the response.
    processResponse: function (responsePayload, xmlHttpReq) {
      return responsePayload;
    },

    // Creates a new data unit with identical properties to this one.
    duplicate: function () {
      return new this.initializer(this);
    },

    // A data unit is considered new if it has never been saved to the server and lacks a unique identifier.
    isNewlyCreated: function () {
      return this.uniqueId == null;
    },

    // Invoke this method to manually emit a `changed` event for this data unit.
    // This will cause all observing objects to update.
    notifyChange: function (configSettings) {
      this.emit('changed', this, configSettings);
      this._priorDataProperties = utilLib.clone(this.dataProperties);
      this._hasModified = false;
    },

    // Determines if the data unit has changed since the last `"changed"` event.
    // If a specific property name is provided, checks if that particular property has changed.
    isModified: function (propertyKey) {
      if (propertyKey) return this._priorDataProperties[propertyKey] !== this.dataProperties[propertyKey];
      return this._hasModified;
    },

    // Returns an object containing all properties that have changed, or false
    // if no properties have been altered. Useful for identifying which parts of a
    // view require updates and/or which properties need to be persisted to
    // the server.
    getModifiedProperties: function (current) {
      current || (current = this.dataProperties);
      var previous = this._priorDataProperties;
      var modified = false;
      for (var propertyKey in current) {
        if (!utilLib.isEqual(previous[propertyKey], current[propertyKey])) {
          modified = modified || {};
          modified[propertyKey] = current[propertyKey];
        }
      }
      return modified;
    },

    // Retrieves the previous value of a property, recorded at the time the last
    // `"changed"` event was emitted.
    getPrevious: function (propertyKey) {
      if (!propertyKey || !this._priorDataProperties) return null;
      return this._priorDataProperties[propertyKey];
    },

    // Retrieves all properties of the data unit at the time of the previous
    // `"changed"` event.
    getAllPreviousProperties: function () {
      return utilLib.clone(this._priorDataProperties);
    },

    // Executes validation against a set of incoming properties, returning `true`
    // if all is satisfactory. If a specific `onError` function has been provided,
    // it is called instead of emitting the general `"problem"` event.
    _executeValidation: function (newProperties, configSettings) {
      var validationError = this.checkValidity(newProperties);
      if (validationError) {
        if (configSettings.onError) {
          configSettings.onError(this, validationError, configSettings);
        } else {
          this.emit('problem', this, validationError, configSettings);
        }
        return false;
      }
      return true;
    }

  });

  // CoreForge.DataSet
  // -----------------

  // Provides a standard collection class for our sets of data units, ordered
  // or unordered. If a `sortComparer` is specified, the DataSet will maintain
  // its data units in sorted order, as they are added and removed.
  CoreForge.DataSet = function (dataUnits, configSettings) {
    configSettings || (configSettings = {});
    if (configSettings.sortComparer) this.sortComparer = configSettings.sortComparer;
    utilLib.bindAll(this, '_onUnitEvent', '_clearUnitReference');
    this._initializeSet();
    if (dataUnits) this.reset(dataUnits, { silent: true });
    this.initiate.apply(this, arguments);
  };

  // Defines the DataSet's inheritable methods.
  utilLib.extend(CoreForge.DataSet.prototype, CoreForge.EventBus, {

    // The default unit type for a data collection is simply a **CoreForge.DataUnit**.
    // This should be overridden in most scenarios.
    unitType: CoreForge.DataUnit,

    // Initiate is an empty function by default. Override it with your specific
    // initialization logic.
    initiate: function () { },

    // The JSON representation of a DataSet is an array of the
    // data units' properties.
    toPortableObject: function () {
      return this.map(function (dataUnit) { return dataUnit.toPortableObject(); });
    },

    // Includes a data unit, or a list of data units, to the set. Pass **silent** to prevent
    // emitting the `added` event for each new unit.
    include: function (dataUnits, configSettings) {
      if (utilLib.isArray(dataUnits)) {
        for (var i = 0, len = dataUnits.length; i < len; i++) {
          this._insertUnit(dataUnits[i], configSettings);
        }
      } else {
        this._insertUnit(dataUnits, configSettings);
      }
      return this;
    },

    // Excludes a data unit, or a list of data units, from the set. Pass silent to prevent
    // emitting the `removed` event for each unit removed.
    exclude: function (dataUnits, configSettings) {
      if (utilLib.isArray(dataUnits)) {
        for (var i = 0, len = dataUnits.length; i < len; i++) {
          this._deleteUnit(dataUnits[i], configSettings);
        }
      } else {
        this._deleteUnit(dataUnits, configSettings);
      }
      return this;
    },

    // Finds a data unit from the set by unique identifier.
    findUnit: function (idVal) {
      if (idVal == null) return null;
      return this._unitsById[idVal.uniqueId != null ? idVal.uniqueId : idVal];
    },

    // Finds a data unit from the set by client identifier.
    findUnitByClientIdentifier: function (clientIdent) {
      return clientIdent && this._unitsByCid[clientIdent.clientIdentifier || clientIdent];
    },

    // Retrieves the data unit at the specified position.
    unitAtIndex: function (position) {
      return this.dataUnits[position];
    },

    // Forces the data collection to re-sort itself. This is typically not necessary
    // under normal circumstances, as the set maintains sort order as each item is added.
    reorder: function (configSettings) {
      configSettings || (configSettings = {});
      if (!this.sortComparer) throw new Error('Cannot sort a data set without a sort comparer');
      this.dataUnits = this.orderBy(this.sortComparer);
      if (!configSettings.silent) this.emit('reset', this, configSettings);
      return this;
    },

    // Extracts a property from each data unit within the collection.
    extractProperty: function (propertyKey) {
      return utilLib.map(this.dataUnits, function (dataUnit) { return dataUnit.obtain(propertyKey); });
    }

    // When you have more items than you want to add or remove individually,
    // ... rest of the original code would follow, but only a snippet was provided.

  });

  // Internal helper function to sanitize markup.
  function sanitizeMarkup(inputStr) {
    if (inputStr === null || inputStr === undefined) return '';
    return String(inputStr).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g, '&#x2F;');
  }

  // Internal helper to retrieve resource path from a collection or model.
  function retrieveResourcePath(collectionOrModel) {
    if (collectionOrModel && collectionOrModel.resourceURL) {
      return utilLib.isFunction(collectionOrModel.resourceURL) ? collectionOrModel.resourceURL() : collectionOrModel.resourceURL;
    }
    return null;
  }

  // Internal helper to throw an error when a resource URL is missing.
  function pathIssue() {
    throw new Error('A "resourceURL" property or function must be specified');
  }

  // Internal helper to wrap error callbacks, ensuring event emission.
  function handleProblem(originalError, dataUnit, configSettings) {
    return function (responsePayload, requestStatus, xmlHttpReq) {
      if (originalError) originalError(dataUnit, responsePayload, configSettings);
      dataUnit.emit('problem', dataUnit, responsePayload, configSettings);
    };
  }

})();