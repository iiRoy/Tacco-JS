(function () {
  // CoreLib.js 0.5.3 - Reimagined
  // (c) 2023 Renamed Author, Fictional Corp.
  // This framework is freely usable under the MIT license.
  // For comprehensive details and documentation, visit:
  // http://fictionalcorp.github.io/corelib

  // Initial Framework Configuration
  // ------------------------------

  // Secure a reference to the global execution context.
  const globalScope = this;

  // Preserve any pre-existing definition of the `CoreLib` variable.
  const priorFrameworkRef = globalScope.CoreLib;

  // The primary application namespace. All public CoreLib components
  // and modules will be attached here. Designed for both CommonJS and browser environments.
  let CoreLib;
  if (typeof module !== 'undefined' && module.exports) {
    CoreLib = module.exports;
  } else {
    CoreLib = globalScope.CoreLib = {};
  }

  // The current software revision. Kept synchronized with `package.json`.
  CoreLib.REVISION = '0.5.3';

  // Obtain the functional utility library (e.g., Underscore.js).
  // If not globally present, attempt to load it via CommonJS `require`.
  let util = globalScope._;
  if (!util && typeof require !== 'undefined') {
    try {
      util = require('underscore');
      if (util && util._) util = util._; // Handle commonJS export styles
    } catch (e) {
      // Log or handle error if underscore isn't found
      console.warn("CoreLib: Underscore.js not found. Some functionality may be limited.");
      // Provide a minimal shim for _.extend and _.isFunction to prevent immediate errors
      util = {
        extend: function(obj) {
          Array.prototype.slice.call(arguments, 1).forEach(function(source) {
            for (let prop in source) {
              if (Object.prototype.hasOwnProperty.call(source, prop)) {
                obj[prop] = source[prop];
              }
            }
          });
          return obj;
        },
        isFunction: function(obj) { return typeof obj === 'function'; },
        isUndefined: function(obj) { return typeof obj === 'undefined'; },
        isArray: function(obj) { return Object.prototype.toString.call(obj) === '[object Array]'; },
        bindAll: function() {}, // Placeholder
        uniqueId: function(prefix) {
          const counter = (util.uniqueId.counter || 0) + 1;
          util.uniqueId.counter = counter;
          return prefix + counter;
        },
        isEqual: function(a, b) {
          // Basic equality for cloning
          if (a === b) return true;
          if (a && typeof a === 'object' && b && typeof b === 'object') {
            return JSON.stringify(a) === JSON.stringify(b); // Simplistic for clone
          }
          return false;
        },
        clone: function(obj) {
          if (obj === null || typeof obj !== 'object') return obj;
          if (util.isArray(obj)) return obj.slice();
          return util.extend({}, obj);
        },
        map: function(list, iterator) {
          const results = [];
          if (list == null) return results;
          for (let i = 0; i < list.length; i++) {
            results.push(iterator(list[i], i, list));
          }
          return results;
        }
      };
    }
  }

  // Determine the DOM manipulation library (jQuery or Zepto) if available.
  const domHandler = globalScope.jQuery || globalScope.Zepto;

  // Helper for HTML escaping, similar to Underscore's `escape`.
  const htmlSanitizer = function (inputStr) {
    if (inputStr == null) return '';
    return String(inputStr)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/`/g, '&#x60;');
  };

  // Restores the previous value of the `CoreLib` global variable
  // and returns a reference to the current `CoreLib` object.
  CoreLib.restorePreviousState = function () {
    globalScope.CoreLib = priorFrameworkRef;
    return this;
  };

  // Flag to enable compatibility for older HTTP servers. When true,
  // "PUT" and "DELETE" requests are simulated using the `_method` parameter
  // and an `X-Http-Method-Override` header.
  CoreLib.simulateLegacyHttp = false;

  // Flag to enable compatibility for older servers that cannot process
  // direct `application/json` requests. When true, the request body is
  // encoded as `application/x-www-form-urlencoded`, with the model's
  // data sent in a form parameter named `model`.
  CoreLib.simulateLegacyJson = false;

  // CoreLib.Notifier (formerly Backbone.Events)
  // ------------------------------------------

  // A mixin providing custom event capabilities to any object.
  // Allows `subscribe` to or `unsubscribe` from events, and `emit` events
  // to trigger all associated listeners.
  CoreLib.Notifier = {
    // Subscribes a `listenerFunction` to an `eventKey`.
    // The `executionContext` defines the `this` context for the listener.
    // Subscribing to `"all"` causes the listener to fire for every emitted event.
    subscribe: function (eventKey, listenerFunction, executionContext) {
      if (!listenerFunction) return this;
      const registry = this._eventRegistry || (this._eventRegistry = {});
      const listeners = registry[eventKey] || (registry[eventKey] = []);
      listeners.push([listenerFunction, executionContext]);
      return this;
    },

    // Removes one or more event subscriptions.
    // - If no `eventKey` is provided, all subscriptions for all events are removed.
    // - If `eventKey` is provided but no `listenerFunction`, all subscriptions for that event are removed.
    // - If both are provided, only the specific listener for that event is removed.
    unsubscribe: function (eventKey, listenerFunction) {
      const registry = this._eventRegistry;
      if (!registry) return this; // No registry, nothing to unsubscribe from

      if (!eventKey) {
        this._eventRegistry = {}; // Clear all
      } else {
        const listeners = registry[eventKey];
        if (!listeners) return this; // No listeners for this event

        if (!listenerFunction) {
          registry[eventKey] = []; // Clear all for this event
        } else {
          // Remove specific listener, compacting the array
          registry[eventKey] = listeners.filter(entry => entry[0] !== listenerFunction);
        }
      }
      return this;
    },

    // Emits an event, invoking all registered listeners.
    // Listeners receive the same arguments as `emit`, excluding the `eventKey`.
    // Listeners for `"all"` receive the actual `eventKey` as their first argument.
    emit: function (eventKey, ...args) {
      const registry = this._eventRegistry;
      if (!registry) return this;

      let currentEventKey;
      let iterations = 2; // Run once for eventKey, once for 'all'

      while (iterations--) {
        currentEventKey = iterations ? eventKey : 'all';
        const listenerList = registry[currentEventKey];

        if (listenerList && listenerList.length > 0) {
          // Create a copy to allow safe modification during iteration (e.g., unsubscribe self)
          const activeListeners = listenerList.slice();
          for (let i = 0; i < activeListeners.length; i++) {
            const [listenerFunc, context] = activeListeners[i];
            if (listenerFunc) {
              const actualArgs = iterations ? args : [eventKey, ...args];
              try {
                listenerFunc.apply(context || this, actualArgs);
              } catch (e) {
                console.error(`CoreLib.Notifier: Error in event listener for '${currentEventKey}':`, e);
              }
            }
          }
        }
      }
      return this;
    }
  };

  // CoreLib.Entity (formerly Backbone.Model)
  // ---------------------------------------

  // Creates a new entity instance with specified `initialData`.
  // A unique client identifier (`instanceId`) is automatically generated.
  CoreLib.Entity = function (initialData, options) {
    let defaultSettings;
    initialData = initialData || {};

    // Apply default attributes if defined.
    if (this.defaults) {
      defaultSettings = util.isFunction(this.defaults) ? this.defaults.call(this) : this.defaults;
      initialData = util.extend({}, defaultSettings, initialData);
    }

    this.dataFields = {};
    this._encodedFields = {};
    this.instanceId = util.uniqueId('c');
    this.updateFields(initialData, { silent: true });
    this._hasPendingChanges = false;
    this._snapshotFields = util.clone(this.dataFields);

    if (options && options.collection) this.collection = options.collection;
    this.setup(initialData, options);
  };

  // Attaches all inheritable methods to the Entity prototype, including Notifier events.
  util.extend(CoreLib.Entity.prototype, CoreLib.Notifier, {
    // A snapshot of the entity's data fields, captured after the last `"change"` event.
    _snapshotFields: null,

    // Indicates if the entity's data has changed since the last `"change"` event.
    _hasPendingChanges: false,

    // The name of the attribute used as the primary key for server synchronization.
    primaryKeyField: 'id',

    // Default initialization function. Override with custom setup logic.
    setup: function () { },

    // Returns a deep copy of the entity's `dataFields` for serialization.
    toSerializableObject: function () {
      return util.clone(this.dataFields);
    },

    // Retrieves the value of a specific data field.
    retrieveValue: function (fieldKey) {
      return this.dataFields[fieldKey];
    },

    // Retrieves the HTML-escaped value of a data field.
    sanitizeValue: function (fieldKey) {
      let cachedHtml;
      if (cachedHtml = this._encodedFields[fieldKey]) return cachedHtml;

      const rawValue = this.dataFields[fieldKey];
      const sanitized = htmlSanitizer(rawValue);
      return this._encodedFields[fieldKey] = sanitized;
    },

    // Checks if a data field contains a non-null and non-undefined value.
    hasValue: function (fieldKey) {
      return this.dataFields[fieldKey] != null;
    },

    // Updates a set of data fields on the entity.
    // Triggers `"change"` events unless `options.silent` is true.
    updateFields: function (fieldUpdates, options) {
      options = options || {};
      if (!fieldUpdates) {
        console.warn("CoreLib.Entity: Attempted to update fields with null/undefined data.");
        return this;
      }
      // If the input is another entity, extract its data fields.
      if (fieldUpdates.dataFields) fieldUpdates = fieldUpdates.dataFields;

      const currentFields = this.dataFields;
      const encodedCache = this._encodedFields;
      let validationPassed = true;

      // Execute validation if defined and not silent.
      if (!options.silent && util.isFunction(this.validate)) {
        validationPassed = this._executeValidation(fieldUpdates, options);
        if (!validationPassed) return false;
      }

      // Check for primary key change.
      if (this.primaryKeyField in fieldUpdates) {
        this.id = fieldUpdates[this.primaryKeyField];
      }

      const isAlreadyChanging = this._changing;
      this._changing = true; // Indicate that a change process is active

      // Apply updates and track changes.
      for (const key in fieldUpdates) {
        if (Object.prototype.hasOwnProperty.call(fieldUpdates, key)) {
          const newValue = fieldUpdates[key];
          if (!util.isEqual(currentFields[key], newValue)) {
            currentFields[key] = newValue;
            delete encodedCache[key]; // Invalidate escaped cache for this field
            this._hasPendingChanges = true;
            if (!options.silent) {
              this.emit('change:' + key, this, newValue, options);
            }
          }
        }
      }

      // If this is the outermost `updateFields` call and changes occurred, trigger a general `change` event.
      if (!isAlreadyChanging && !options.silent && this._hasPendingChanges) {
        this.signalUpdate(options);
      }
      this._changing = false;
      return this;
    },

    // Removes a data field from the entity.
    // Triggers `"change"` events unless `options.silent` is true.
    // No operation if the field does not exist.
    clearField: function (fieldKey, options) {
      options = options || {};
      if (!Object.prototype.hasOwnProperty.call(this.dataFields, fieldKey)) {
        return this; // Field doesn't exist, nothing to clear.
      }

      const currentVal = this.dataFields[fieldKey];
      let validationPassed = true;

      // Prepare for validation: attempting to set field to undefined.
      const validationPayload = {};
      validationPayload[fieldKey] = undefined;
      if (!options.silent && util.isFunction(this.validate)) {
        validationPassed = this._executeValidation(validationPayload, options);
        if (!validationPassed) return false;
      }

      // Perform removal.
      delete this.dataFields[fieldKey];
      delete this._encodedFields[fieldKey];
      if (fieldKey === this.primaryKeyField) delete this.id;
      this._hasPendingChanges = true;

      if (!options.silent) {
        this.emit('change:' + fieldKey, this, undefined, options);
        this.signalUpdate(options);
      }
      return this;
    },

    // Removes all data fields from the entity.
    // Triggers `"change"` events for each removed field and a general `"change"` event
    // unless `options.silent` is true.
    resetFields: function (options) {
      options = options || {};
      const oldFields = this.dataFields;
      let validationPassed = true;

      // Prepare validation payload for clearing all fields.
      const validationPayload = {};
      for (const field in oldFields) {
        if (Object.prototype.hasOwnProperty.call(oldFields, field)) {
          validationPayload[field] = undefined;
        }
      }
      if (!options.silent && util.isFunction(this.validate)) {
        validationPassed = this._executeValidation(validationPayload, options);
        if (!validationPassed) return false;
      }

      this.dataFields = {};
      this._encodedFields = {};
      this._hasPendingChanges = true;

      if (!options.silent) {
        for (const field in oldFields) {
          if (Object.prototype.hasOwnProperty.call(oldFields, field)) {
            this.emit('change:' + field, this, undefined, options);
          }
        }
        this.signalUpdate(options);
      }
      return this;
    },

    // Helper to abstract common sync success/error handling.
    _handleSyncResponse: function (response, status, xhr, operationOptions, model, successCallback) {
      const parsedData = model.processResponse(response, xhr);
      if (!model.updateFields(parsedData, operationOptions)) {
        // If set fails due to validation, it should return false.
        // The original Backbone returned false, but the `success` callback was still called.
        // Here, we'll prevent calling success if `set` explicitly returns false.
        console.warn("CoreLib.Entity: Sync response failed model update due to validation or other issue.");
        return false;
      }
      if (successCallback) successCallback(model, response, xhr);
      return true;
    },

    // Fetches the entity's data from the server.
    // If the server's representation differs, attributes are updated, triggering `"change"`.
    pullFromServer: function (options) {
      options = options || {};
      const entityInstance = this;
      const originalSuccess = options.success;

      options.success = function (resp, status, xhr) {
        entityInstance._handleSyncResponse(resp, status, xhr, options, entityInstance, originalSuccess);
      };
      options.error = this._wrapSyncError(options.error, entityInstance, options);
      return (this.sync || CoreLib.sync).call(this, 'read', this, options);
    },

    // Saves the entity's data to the server.
    // If `fieldUpdates` are provided, they are set first.
    // If the server returns new attributes, the model's state is `updateFields` again.
    pushToServer: function (fieldUpdates, options) {
      options = options || {};
      if (fieldUpdates && !this.updateFields(fieldUpdates, options)) {
        console.warn("CoreLib.Entity: Save aborted due to failed field updates.");
        return false;
      }
      const entityInstance = this;
      const originalSuccess = options.success;

      options.success = function (resp, status, xhr) {
        entityInstance._handleSyncResponse(resp, status, xhr, options, entityInstance, originalSuccess);
      };
      options.error = this._wrapSyncError(options.error, entityInstance, options);
      const method = this.isUnpersisted() ? 'create' : 'update';
      return (this.sync || CoreLib.sync).call(this, method, this, options);
    },

    // Deletes this entity from the server if it has been persisted.
    // On success, the entity is removed from its collection (if associated).
    removeFromServer: function (options) {
      options = options || {};
      if (this.isUnpersisted()) {
        // If not persisted, just trigger destroy locally.
        return this.emit('destroy', this, this.collection, options);
      }
      const entityInstance = this;
      const originalSuccess = options.success;

      options.success = function (resp, status, xhr) {
        entityInstance.emit('destroy', entityInstance, entityInstance.collection, options);
        if (originalSuccess) originalSuccess(entityInstance, resp, xhr);
      };
      options.error = this._wrapSyncError(options.error, entityInstance, options);
      return (this.sync || CoreLib.sync).call(this, 'delete', this, options);
    },

    // Determines the URL endpoint for the entity's server representation.
    // Override this to customize RESTful endpoints.
    resourceEndpoint: function () {
      const baseUrl = this._fetchResourcePath(this.collection) || this.urlRoot || this._throwMissingUrlError();
      if (this.isUnpersisted()) return baseUrl;
      const separator = baseUrl.endsWith('/') ? '' : '/';
      return `${baseUrl}${separator}${encodeURIComponent(this.id)}`;
    },

    // Transforms a server response into the hash of attributes to be `updateFields` on the entity.
    // The default implementation simply returns the response as is.
    processResponse: function (response) {
      return response;
    },

    // Creates a new entity instance with identical data fields.
    duplicate: function () {
      return new this.constructor(this.dataFields);
    },

    // Checks if the entity has not yet been saved to the server (lacks a primary key).
    isUnpersisted: function () {
      return this.id == null;
    },

    // Manually triggers a `change` event for this entity.
    // This causes all observing objects to update.
    signalUpdate: function (options) {
      this.emit('change', this, options);
      this._snapshotFields = util.clone(this.dataFields);
      this._hasPendingChanges = false;
    },

    // Determines if the entity has changed since the last `"change"` event.
    // If `fieldKey` is provided, checks if that specific field has changed.
    hasFieldChanged: function (fieldKey) {
      if (fieldKey) {
        return !util.isEqual(this._snapshotFields[fieldKey], this.dataFields[fieldKey]);
      }
      return this._hasPendingChanges;
    },

    // Returns an object containing all fields that have changed, or `false` if none.
    // Useful for partial updates to the server or view rendering.
    getModifiedFields: function (currentFields) {
      currentFields = currentFields || this.dataFields;
      const oldFields = this._snapshotFields;
      let modified = null;

      for (const key in currentFields) {
        if (Object.prototype.hasOwnProperty.call(currentFields, key)) {
          if (!util.isEqual(oldFields[key], currentFields[key])) {
            if (!modified) modified = {};
            modified[key] = currentFields[key];
          }
        }
      }
      // Also check for fields removed from currentFields that were in oldFields
      for (const key in oldFields) {
        if (Object.prototype.hasOwnProperty.call(oldFields, key)) {
          if (!Object.prototype.hasOwnProperty.call(currentFields, key)) {
            if (!modified) modified = {};
            modified[key] = undefined; // Indicate removal
          }
        }
      }
      return modified;
    },

    // Retrieves the value of a field as it was at the time of the previous `"change"` event.
    getPreviousValue: function (fieldKey) {
      return fieldKey && this._snapshotFields ? this._snapshotFields[fieldKey] : undefined;
    },

    // Returns a copy of all fields as they were at the time of the previous `"change"` event.
    getPreviousFields: function () {
      return util.clone(this._snapshotFields);
    },

    // Executes validation against a set of incoming attributes.
    // Returns `true` if valid, `false` otherwise. Calls `options.error` or emits `"error"`.
    _executeValidation: function (candidateAttrs, options) {
      let validationError;
      try {
        validationError = this.validate(candidateAttrs);
      } catch (e) {
        console.error("CoreLib.Entity: Error during validation execution:", e);
        validationError = "Validation function threw an error.";
      }

      if (validationError) {
        if (options.error) {
          options.error(this, validationError, options);
        } else {
          this.emit('error', this, validationError, options);
        }
        return false;
      }
      return true;
    },

    // Helper for wrapping sync error callbacks.
    _wrapSyncError: function (originalError, entity, options) {
      return function (xhr, statusText, errorThrown) {
        if (originalError) originalError(entity, xhr, options);
        entity.emit('error', entity, xhr, options);
      };
    },

    // Helper for resolving resource URL.
    _fetchResourcePath: function (collection) {
      if (collection && util.isFunction(collection.resourceEndpoint)) {
        return collection.resourceEndpoint();
      }
      return null;
    },

    // Throws an error if a URL is required but not found.
    _throwMissingUrlError: function () {
      throw new Error('A "url" property or function must be specified for the entity or its collection.');
    }
  });

  // CoreLib.Registry (formerly Backbone.Collection)
  // ---------------------------------------------

  // Provides a standard collection class for managing sets of entities.
  // If a `sorterFunction` is provided, the Registry maintains its entities
  // in sorted order upon addition or removal.
  CoreLib.Registry = function (initialEntities, options) {
    options = options || {};
    if (options.sorterFunction) this.sorterFunction = options.sorterFunction;

    util.bindAll(this, '_handleEntryEvent', '_dereferenceEntry');
    this._initializeRegistry(); // Setup internal storage
    if (initialEntities) this.reset(initialEntities, { silent: true });
    this.setup.apply(this, arguments);
  };

  // Defines the Registry's inheritable methods.
  util.extend(CoreLib.Registry.prototype, CoreLib.Notifier, {
    // The default entity type for this registry is a plain `CoreLib.Entity`.
    // This should typically be overridden with a more specific entity class.
    entryType: CoreLib.Entity,

    // Default initialization function. Override with custom setup logic.
    setup: function () { },

    // Returns a serialized array of each entity's attributes.
    toSerializableArray: function () {
      return util.map(this.entries, entity => entity.toSerializableObject());
    },

    // Adds one or more entities to the registry.
    // Pass `options.silent` to suppress `"add"` events for each new entity.
    addEntries: function (newEntities, options) {
      options = options || {};
      if (!newEntities) return this;

      if (!util.isArray(newEntities)) {
        newEntities = [newEntities]; // Ensure it's an array for consistent processing
      }

      for (const entity of newEntities) {
        this._addSingleEntry(entity, options);
      }
      return this;
    },

    // Removes one or more entities from the registry.
    // Pass `options.silent` to suppress `"remove"` events for each removed entity.
    removeEntries: function (entitiesToRemove, options) {
      options = options || {};
      if (!entitiesToRemove) return this;

      if (!util.isArray(entitiesToRemove)) {
        entitiesToRemove = [entitiesToRemove];
      }

      for (const entity of entitiesToRemove) {
        this._removeSingleEntry(entity, options);
      }
      return this;
    },

    // Retrieves an entity from the registry by its primary key ID.
    getById: function (entityId) {
      if (entityId == null) return null;
      // Handle cases where entityId might be an entity object itself
      const actualId = entityId.id != null ? entityId.id : entityId;
      return this._idMap[actualId];
    },

    // Retrieves an entity from the registry by its client-side instance ID (cid).
    getByInstanceId: function (clientId) {
      if (clientId == null) return null;
      const actualCid = clientId.instanceId || clientId;
      return this._instanceIdMap[actualCid];
    },

    // Retrieves the entity at a specific numerical `index`.
    getAtIndex: function (index) {
      return this.entries[index];
    },

    // Forces the registry to re-sort its entities.
    // This is generally not needed as the registry maintains sort order automatically
    // if a `sorterFunction` is defined.
    sortEntries: function (options) {
      options = options || {};
      if (!this.sorterFunction) {
        throw new Error('Cannot sort a registry without a "sorterFunction" defined.');
      }
      // Apply the sort directly to the `entries` array
      this.entries.sort((a, b) => this.sorterFunction(a, b));

      if (!options.silent) this.emit('reset', this, options);
      return this;
    },

    // Extracts a specific `fieldKey` from each entity in the registry.
    extractField: function (fieldKey) {
      return util.map(this.entries, entity => entity.retrieveValue(fieldKey));
    },

    // Resets the registry with a new set of entities.
    // Removes all existing entities and adds the new ones.
    reset: function (newEntities, options) {
      options = options || {};
      this._initializeRegistry(); // Clear all internal maps and arrays

      if (newEntities) {
        const entitiesToAdd = util.isArray(newEntities) ? newEntities : [newEntities];
        for (const entity of entitiesToAdd) {
          this._addSingleEntry(entity, { silent: true }); // Add silently during reset
        }
      }

      if (!options.silent) {
        this.emit('reset', this, options);
      }
      return this;
    },

    // Internal function to set up or clear the registry's internal storage.
    _initializeRegistry: function () {
      this.entries = []; // Main array of entities
      this._idMap = {}; // Map for lookup by primary key ID
      this._instanceIdMap = {}; // Map for lookup by client ID
    },

    // Internal function to add a single entity.
    _addSingleEntry: function (entity, options) {
      if (!(entity instanceof CoreLib.Entity)) {
        entity = new this.entryType(entity, { collection: this });
      }

      // Prevent adding duplicates by instanceId
      if (this._instanceIdMap[entity.instanceId]) {
        console.warn(`CoreLib.Registry: Entity with instanceId '${entity.instanceId}' already exists.`);
        return;
      }

      this.entries.push(entity);
      this._addReferences(entity); // Update internal maps
      entity.collection = this; // Ensure entity knows its collection
      entity.subscribe('all', this._handleEntryEvent, this);

      if (this.sorterFunction) {
        this.sortEntries({ silent: true }); // Re-sort silently on add
      }

      if (!options.silent) {
        this.emit('add', entity, this, options);
      }
    },

    // Internal function to remove a single entity.
    _removeSingleEntry: function (entity, options) {
      const existingEntity = this.getById(entity) || this.getByInstanceId(entity);
      if (!existingEntity) return;

      this.entries = this.entries.filter(e => e.instanceId !== existingEntity.instanceId);
      this._removeReferences(existingEntity); // Clean up internal maps
      existingEntity.unsubscribe('all', this._handleEntryEvent);
      delete existingEntity.collection; // Dereference collection from entity

      if (!options.silent) {
        this.emit('remove', existingEntity, this, options);
      }
    },

    // Updates internal maps (`_idMap`, `_instanceIdMap`) when an entity is added.
    _addReferences: function (entity) {
      this._instanceIdMap[entity.instanceId] = entity;
      if (entity.id != null) {
        this._idMap[entity.id] = entity;
      }
    },

    // Cleans up internal maps when an entity is removed.
    _dereferenceEntry: function (entity) {
      delete this._instanceIdMap[entity.instanceId];
      if (entity.id != null) {
        delete this._idMap[entity.id];
      }
    },

    // Handles events emitted by entities within the registry.
    // Re-emits the event from the collection, prepending the entity.
    _handleEntryEvent: function (eventName, entity, ...args) {
      if (eventName === 'change' || eventName.startsWith('change:')) {
        // If an entity's ID changes, update the _idMap
        const previousId = entity.getPreviousValue(entity.primaryKeyField);
        const currentId = entity.retrieveValue(entity.primaryKeyField);
        if (previousId !== currentId) {
          this._dereferenceEntry(entity); // Remove old reference
          this._addReferences(entity);    // Add new reference
        }
      }
      this.emit(eventName, entity, this, ...args);
    }
  });

  // CommonJS `require` / AMD `define` boilerplate.
  if (typeof define === 'function' && define.amd) {
    define('corelib', [], function () { return CoreLib; });
  }
})();