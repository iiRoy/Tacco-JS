(function(globalContext) {
  "use strict";

  // Core utility library and framework access
  const utilityTools = globalContext._;
  const Synthcore = globalContext.Backbone;

  /**
   * Synthcore CloudStore Adapter.
   * Manages persistence for Synthcore models and collections using a CloudStore (Firebase) reference.
   */
  Synthcore.CloudStore = function(dataReference) {
    // Validate the initial reference
    if (!dataReference) {
      throw new Error("Synthcore.CloudStore: A valid data reference must be provided.");
    }

    // Internal CloudStore reference (formerly Firebase reference)
    this._cloudRef = null;
    // Local cache for entities managed by this adapter
    this._cachedEntities = [];
    // Flag to ensure event handlers are bound only once
    this._handlersBound = false;

    // Initialize the CloudStore reference
    if (typeof dataReference === "string" || dataReference instanceof String) {
      this._cloudRef = new Firebase(dataReference); // Assuming global 'Firebase' is available
    } else if (typeof dataReference === "object" && dataReference !== null) {
      this._cloudRef = dataReference;
    } else {
      throw new TypeError("Synthcore.CloudStore: Invalid data reference type. Must be string or Firebase object.");
    }

    // Bind all necessary event handlers to the instance context
    this._establishEventBindings();

    // Subscribe to CloudStore events
    this._cloudRef.on("child_added", this._onItemAdded);
    this._cloudRef.on("child_moved", this._onItemMoved);
    this._cloudRef.on("child_changed", this._onItemUpdated);
    this._cloudRef.on("child_removed", this._onItemDeleted);
  };

  // Extend the prototype of Synthcore.CloudStore with persistence methods
  utilityTools.extend(Synthcore.CloudStore.prototype, {

    // Internal method to bind event handlers
    _establishEventBindings: function() {
      if (this._handlersBound) {
        return; // Already bound
      }
      // Explicitly bind the context for each handler
      this._onItemAdded = this._onItemAdded.bind(this);
      this._onItemMoved = this._onItemMoved.bind(this);
      this._onItemUpdated = this._onItemUpdated.bind(this);
      this._onItemDeleted = this._onItemDeleted.bind(this);
      this._handlersBound = true;
    },

    /**
     * Handles a new child entity being added to the CloudStore.
     * @param {Object} dataSnapshot - The CloudStore data snapshot for the added child.
     * @param {string} priorKey - The key of the child immediately preceding the added one.
     */
    _onItemAdded: function(dataSnapshot, priorKey) {
      const newEntity = dataSnapshot.val();
      newEntity.id = dataSnapshot.key(); // Use .key() for Firebase 2.x compatibility

      if (priorKey) {
        let insertIndex = -1;
        for (let i = 0; i < this._cachedEntities.length; i++) {
          if (this._cachedEntities[i].id === priorKey) {
            insertIndex = i + 1;
            break;
          }
        }
        if (insertIndex !== -1) {
          this._cachedEntities.splice(insertIndex, 0, newEntity);
        } else {
          // If priorKey not found, append to end or unshift if it's the first
          this._cachedEntities.push(newEntity);
        }
      } else {
        this._cachedEntities.unshift(newEntity);
      }
    },

    /**
     * Handles a child entity changing its position in the CloudStore.
     * @param {Object} dataSnapshot - The CloudStore data snapshot for the moved child.
     * @param {string} priorKey - The key of the child immediately preceding the moved one.
     */
    _onItemMoved: function(dataSnapshot, priorKey) {
      const movedEntity = dataSnapshot.val();
      const movedEntityId = dataSnapshot.key();

      // Remove the entity from its current position
      this._cachedEntities = this._cachedEntities.filter(cachedItem => cachedItem.id !== movedEntityId);

      // Re-add it at the new logical position
      this._onItemAdded(dataSnapshot, priorKey);
    },

    /**
     * Handles an existing child entity being updated in the CloudStore.
     * @param {Object} dataSnapshot - The CloudStore data snapshot for the changed child.
     */
    _onItemUpdated: function(dataSnapshot) {
      const updatedEntity = dataSnapshot.val();
      updatedEntity.id = dataSnapshot.key();
      let targetIndex = -1;

      for (let i = 0; i < this._cachedEntities.length; i++) {
        if (this._cachedEntities[i].id === updatedEntity.id) {
          targetIndex = i;
          break;
        }
      }

      if (targetIndex !== -1) {
        this._cachedEntities[targetIndex] = updatedEntity;
      } else {
        // If for some reason the item wasn't in cache, add it.
        // This might indicate an out-of-sync state or a race condition.
        this._cachedEntities.push(updatedEntity);
      }
    },

    /**
     * Handles a child entity being removed from the CloudStore.
     * @param {Object} oldDataSnapshot - The CloudStore data snapshot for the removed child.
     */
    _onItemDeleted: function(oldDataSnapshot) {
      const removedEntityId = oldDataSnapshot.key();
      this._cachedEntities = this._cachedEntities.filter(cachedItem => cachedItem.id !== removedEntityId);
    },

    /**
     * Persists a new entity instance to the CloudStore.
     * @param {Synthcore.Model} entityInstance - The Synthcore model to create.
     * @param {Function} completionHandler - Callback function (error, dataResult).
     */
    produce: function(entityInstance, completionHandler) {
      if (!entityInstance.id) {
        // Generate a unique ID for the new entity if not provided
        entityInstance.id = this._cloudRef.push().key();
      }

      const entityPayload = entityInstance.toJSON();
      this._cloudRef.child(entityInstance.id).set(entityPayload, (issue) => {
        if (!issue) {
          completionHandler(null, entityPayload);
        } else {
          completionHandler(`Could not establish new entity: ${entityInstance.id}. Issue: ${issue.message || issue}`);
        }
      });
    },

    /**
     * Retrieves a single entity from the local cache based on its ID.
     * @param {Synthcore.Model} entityInstance - The Synthcore model with the ID to fetch.
     * @param {Function} completionHandler - Callback function (error, dataResult).
     */
    fetchOne: function(entityInstance, completionHandler) {
      if (!entityInstance || !entityInstance.id) {
        setTimeout(() => completionHandler("Invalid entity ID provided for retrieval."), 0);
        return;
      }

      let foundEntry = null;
      for (let i = 0; i < this._cachedEntities.length; i++) {
        if (this._cachedEntities[i].id === entityInstance.id) {
          foundEntry = this._cachedEntities[i];
          break;
        }
      }

      setTimeout(() => {
        if (foundEntry) {
          completionHandler(null, foundEntry);
        } else {
          completionHandler(`Entity with ID ${entityInstance.id} not found.`);
        }
      }, 0);
    },

    /**
     * Retrieves all entities currently in the local cache.
     * @param {Synthcore.Model} entityInstance - Ignored, present for API consistency.
     * @param {Function} completionHandler - Callback function (error, dataResult).
     */
    fetchAll: function(entityInstance, completionHandler) {
      setTimeout(() => completionHandler(null, [...this._cachedEntities]), 0); // Return a copy
    },

    /**
     * Updates an existing entity in the CloudStore.
     * @param {Synthcore.Model} entityInstance - The Synthcore model with updated attributes.
     * @param {Function} completionHandler - Callback function (error, dataResult).
     */
    modify: function(entityInstance, completionHandler) {
      if (!entityInstance || !entityInstance.id) {
        setTimeout(() => completionHandler("Invalid entity provided for modification."), 0);
        return;
      }

      const updatedPayload = entityInstance.toJSON();
      this._cloudRef.child(entityInstance.id).update(updatedPayload, (issue) => {
        if (!issue) {
          completionHandler(null, updatedPayload);
        } else {
          completionHandler(`Could not modify entity: ${entityInstance.id}. Issue: ${issue.message || issue}`);
        }
      });
    },

    /**
     * Removes an entity from the CloudStore.
     * @param {Synthcore.Model} entityInstance - The Synthcore model to remove.
     * @param {Function} completionHandler - Callback function (error, dataResult).
     */
    erase: function(entityInstance, completionHandler) {
      if (!entityInstance || !entityInstance.id) {
        setTimeout(() => completionHandler("Invalid entity provided for removal."), 0);
        return;
      }

      this._cloudRef.child(entityInstance.id).remove((issue) => {
        if (!issue) {
          completionHandler(null, entityInstance);
        } else {
          completionHandler(`Could not erase entity: ${entityInstance.id}. Issue: ${issue.message || issue}`);
        }
      });
    }
  });


  /**
   * Synchronizes Synthcore models with the CloudStore.
   * This function acts as the primary interface for persistence operations.
   * @param {string} operationType - The type of operation ("create", "read", "update", "delete").
   * @param {Synthcore.Model|Synthcore.Collection} entity - The model or collection to synchronize.
   * @param {Object} syncOptions - Options for the sync operation, including success/error callbacks.
   * @param {Function} [errorCallback] - Deprecated error callback (for older Backbone versions).
   */
  Synthcore.CloudStore.persistenceSync = function(operationType, entity, syncOptions, errorCallback) {
    const storageInstance = entity.cloudStore || (entity.collection && entity.collection.cloudStore);

    // Adapt to older Synthcore (Backbone) sync signature
    if (typeof syncOptions === 'function') {
      syncOptions = {
        success: syncOptions,
        error: errorCallback
      };
    }
    // Ensure success/error callbacks are defined
    syncOptions = syncOptions || {};
    syncOptions.success = syncOptions.success || utilityTools.noop;
    syncOptions.error = syncOptions.error || utilityTools.noop;

    // Handle 'read' for collections or when no ID is present (implies fetchAll)
    let actualOperation = operationType;
    if (operationType === "read" && !entity.id) {
      actualOperation = "fetchAll";
    }

    // Map operationType to CloudStore adapter methods
    const adapterMethodMap = {
      "create": "produce",
      "read": "fetchOne",
      "update": "modify",
      "delete": "erase",
      "fetchAll": "fetchAll"
    };

    const targetMethod = adapterMethodMap[actualOperation];

    if (!storageInstance || typeof storageInstance[targetMethod] !== 'function') {
      const errorMessage = `CloudStore adapter or method '${targetMethod}' not found for operation '${actualOperation}'.`;
      return syncOptions.error(entity, new Error(errorMessage), syncOptions);
    }

    // Execute the CloudStore adapter method
    storageInstance[targetMethod].call(storageInstance, entity, (issue, dataResult) => {
      if (issue) {
        syncOptions.error(entity, new Error(issue), syncOptions);
      } else {
        syncOptions.success(entity, dataResult, syncOptions);
      }
    });
  };

  // Store the original Synthcore.sync method for later use
  Synthcore.originalSync = Synthcore.sync;

  /**
   * Override the default Synthcore.sync to use the CloudStore adapter
   * if a 'cloudStore' property is defined on the model or its collection.
   */
  Synthcore.sync = function(operationType, entity, syncOptions, errorCallback) {
    let activeStrategy = Synthcore.originalSync;
    const hasCloudStoreRef = entity.cloudStore || (entity.collection && entity.collection.cloudStore);

    if (hasCloudStoreRef) {
      activeStrategy = Synthcore.CloudStore.persistenceSync;
    }
    return activeStrategy.call(this, operationType, entity, syncOptions, errorCallback);
  };


  /**
   * Custom Synthcore Collection for CloudStore integration.
   * Handles synchronization and events for a group of entities.
   */
  Synthcore.CloudStore.EntityGroup = Synthcore.Collection.extend({

    // Override default sync and fetch as CloudStore collections manage their own state
    dataSync: function() {
      this._trace("DataSync called on a CloudStore EntityGroup, operations are handled internally.");
      return this; // Return self for chaining
    },

    retrieve: function() {
      this._trace("Retrieve (fetch) called on a CloudStore EntityGroup, operations are handled internally.");
      return this; // Return self for chaining
    },

    /**
     * Constructor for the EntityGroup.
     * @param {Array} initialItems - Initial array of models.
     * @param {Object} groupConfig - Configuration options, including 'cloudStore' reference.
     */
    constructor: function(initialItems, groupConfig) {
      // Call parent constructor first
      Synthcore.Collection.apply(this, arguments);

      // Initialize the CloudStore connector
      this.cloudStore = null;
      if (groupConfig && groupConfig.cloudStore) {
        this.cloudStore = groupConfig.cloudStore;
      } else if (this.cloudStore) { // If cloudStore is defined as a prototype property
        // Use existing cloudStore property
      } else {
        throw new Error("CloudStore.EntityGroup: A 'cloudStore' reference must be provided in config or as a property.");
      }

      // Resolve the CloudStore reference type
      const connectorType = typeof this.cloudStore;
      if (connectorType === "string") {
        this.cloudStore = new Firebase(this.cloudStore);
      } else if (connectorType === "function") {
        this.cloudStore = this.cloudStore();
      } else if (connectorType !== "object" || this.cloudStore === null) {
        throw new Error("CloudStore.EntityGroup: Invalid 'cloudStore' reference type. Must be string, function, or Firebase object.");
      }

      // Set up listeners for remote CloudStore events
      this.cloudStore.on("child_added", this._onChildEntityAdded.bind(this));
      this.cloudStore.on("child_moved", this._onChildEntityMoved.bind(this));
      this.cloudStore.on("child_changed", this._onChildEntityUpdated.bind(this));
      this.cloudStore.on("child_removed", this._onChildEntityRemoved.bind(this));

      // Internal helper for propagating model changes to CloudStore
      const propagateModelChange = (changedModel) => {
        if (changedModel && changedModel.id) {
          this.cloudStore.child(changedModel.id).update(changedModel.toJSON());
        }
      };

      // Internal helper for removing change listeners when a model is removed from collection
      const ceaseModelChangePropagation = (removedModel) => {
        removedModel.off("change", propagateModelChange);
      };

      // Attach listeners to existing models in the collection
      this.models.forEach(modelInstance => {
        modelInstance.on("change", propagateModelChange);
        modelInstance.once("remove", ceaseModelChangePropagation);
      });

      // Attach listeners to models added to the collection in the future
      this.on("add", modelInstance => {
        modelInstance.on("change", propagateModelChange);
        modelInstance.once("remove", ceaseModelChangePropagation);
      });
    },

    // Default comparator for sorting by ID
    comparator: function(entityRecord) {
      return entityRecord.id;
    },

    /**
     * Adds one or more entities to the collection and persists them to CloudStore.
     * @param {Synthcore.Model|Array<Synthcore.Model>} entitiesToAdd - Entities to add.
     * @param {Object} [addOptions] - Options for the add operation.
     */
    add: function(entitiesToAdd, addOptions) {
      const normalizedEntities = this._normalizeEntityPayloads(entitiesToAdd);
      normalizedEntities.forEach(entityPayload => {
        this.cloudStore.child(entityPayload.id).set(entityPayload);
      });
      // Call original Backbone.Collection.add to update local collection state
      Synthcore.Collection.prototype.add.call(this, normalizedEntities, addOptions);
    },

    /**
     * Removes one or more entities from the collection and the CloudStore.
     * @param {Synthcore.Model|Array<Synthcore.Model>} entitiesToRemove - Entities to remove.
     * @param {Object} [removeOptions] - Options for the remove operation.
     */
    remove: function(entitiesToRemove, removeOptions) {
      const normalizedEntities = this._normalizeEntityPayloads(entitiesToRemove);
      normalizedEntities.forEach(entityPayload => {
        this.cloudStore.child(entityPayload.id).remove(); // Set to null to remove from Firebase
      });
      // Call original Backbone.Collection.remove to update local collection state
      Synthcore.Collection.prototype.remove.call(this, normalizedEntities, removeOptions);
    },

    /**
     * Creates a new model, adds it to the collection, and persists it to CloudStore.
     * Alias for 'add' with some Backbone-specific model preparation.
     * @param {Object|Synthcore.Model} entityData - Data for the new entity.
     * @param {Object} [createOptions] - Options for the create operation.
     * @returns {Synthcore.Model|boolean} The created model, or false if preparation failed.
     */
    create: function(entityData, createOptions) {
      this._trace("Create method invoked, aliasing to 'add'. Consider using Collection.add directly for CloudStore collections.");
      const currentOptions = createOptions ? utilityTools.clone(createOptions) : {};

      if (currentOptions.wait) {
        this._trace("The 'wait' option is provided but ignored for CloudStore collection 'create'.");
      }

      // Prepare the model using Backbone's internal method
      const newModel = Synthcore.Collection.prototype._prepareModel.call(this, entityData, currentOptions);
      if (!newModel) {
        return false;
      }
      this.add([newModel], currentOptions);
      return newModel;
    },

    /**
     * Utility for logging messages within the adapter.
     * @param {string} message - The message to log.
     */
    _trace: function(message) {
      if (typeof console !== "undefined" && console.log) {
        console.log(`CloudStore.EntityGroup: ${message}`);
      }
    },

    /**
     * Normalizes an input of models/objects into an array of plain data payloads
     * with IDs suitable for CloudStore operations.
     * @param {Synthcore.Model|Object|Array} inputEntities - One or more entities to normalize.
     * @returns {Array<Object>} An array of normalized entity payloads.
     */
    _normalizeEntityPayloads: function(inputEntities) {
      const processedPayloads = [];
      const entityArray = Array.isArray(inputEntities) ? inputEntities.slice() : [inputEntities];

      entityArray.forEach(item => {
        let currentPayload = item;
        if (item && item.toJSON && typeof item.toJSON === "function") {
          currentPayload = item.toJSON();
        }

        // Ensure each payload has an ID, generating one if missing
        if (!currentPayload.id) {
          currentPayload.id = this.cloudStore.push().key();
        }
        processedPayloads.push(currentPayload);
      });
      return processedPayloads;
    },

    /**
     * Handles 'child_added' event from CloudStore, adding the entity to the local collection.
     * @param {Object} snapshot - The CloudStore data snapshot.
     */
    _onChildEntityAdded: function(snapshot) {
      const entityData = snapshot.val();
      // Ensure the ID is set for the Backbone model
      if (entityData && !entityData.id) {
        entityData.id = snapshot.key();
      }
      Synthcore.Collection.prototype.add.call(this, entityData, {
        merge: true
      }); // Use merge to prevent duplicates if already present
    },

    /**
     * Handles 'child_moved' event from CloudStore.
     * Currently, this adapter simply logs the event. More complex reordering logic might be needed.
     * @param {Object} snapshot - The CloudStore data snapshot.
     */
    _onChildEntityMoved: function(snapshot) {
      this._trace(`_onChildEntityMoved called for entity with key: ${snapshot.key()}`);
      // Re-trigger add/remove to handle reordering if necessary, or update comparator
      // For now, Backbone collections handle reordering via comparator on add/reset.
    },

    /**
     * Handles 'child_changed' event from CloudStore, updating the corresponding model.
     * @param {Object} snapshot - The CloudStore data snapshot.
     */
    _onChildEntityUpdated: function(snapshot) {
      const updatedData = snapshot.val();
      const entityKey = snapshot.key();
      if (!updatedData || !entityKey) {
        this._trace("Received invalid update snapshot.");
        return;
      }

      let targetModel = null;
      for (let i = 0; i < this.models.length; i++) {
        if (this.models[i].id === entityKey) {
          targetModel = this.models[i];
          break;
        }
      }

      if (targetModel) {
        // Update the model attributes
        targetModel.set(updatedData, {
          silent: false
        }); // Trigger change events
      } else {
        this._trace(`Warning: Could not find local model with ID ${entityKey} for update. Adding it.`);
        // If model not found, add it as a new model
        this.add(updatedData);
      }
    },

    /**
     * Handles 'child_removed' event from CloudStore, removing the entity from the local collection.
     * @param {Object} snapshot - The CloudStore data snapshot.
     */
    _onChildEntityRemoved: function(snapshot) {
      const removedKey = snapshot.key();
      if (!removedKey) {
        this._trace("Received invalid removal snapshot.");
        return;
      }
      Synthcore.Collection.prototype.remove.call(this, removedKey);
    }
  });


  /**
   * Custom Synthcore Model for CloudStore integration.
   * Handles synchronization and events for a single entity.
   */
  Synthcore.CloudStore.ItemUnit = Synthcore.Model.extend({

    // Override default save as CloudStore models manage their own state
    persist: function() {
      this._trace("Persist (save) called on a CloudStore ItemUnit, operations are handled internally.");
      return this; // Return self for chaining
    },

    /**
     * Destroys the model, removing it from the CloudStore and triggering events.
     * @param {Object} [destroyOptions] - Options for the destroy operation.
     */
    destroy: function(destroyOptions) {
      const currentOptions = destroyOptions || {};
      const selfRef = this;

      if (!this.cloudStore) {
        this._trace("Cannot destroy: CloudStore reference is missing.");
        if (currentOptions.error) {
          currentOptions.error(this, new Error("CloudStore reference missing."));
        }
        return false;
      }

      this.cloudStore.remove((issue) => {
        if (issue) {
          selfRef._trace(`Failed to remove item from CloudStore: ${issue.message || issue}`);
          if (currentOptions.error) {
            currentOptions.error(selfRef, issue, currentOptions);
          }
        } else {
          selfRef._trace(`Item with ID ${selfRef.id} successfully removed from CloudStore.`);
          selfRef.trigger('destroy', selfRef, selfRef.collection, currentOptions);
          if (currentOptions.success) {
            currentOptions.success(selfRef, null, currentOptions);
          }
        }
      });
      return true;
    },

    /**
     * Constructor for the ItemUnit.
     * @param {Object} initialData - Initial data for the model.
     * @param {Object} modelConfig - Configuration options, including 'cloudStore' reference.
     */
    constructor: function(initialData, modelConfig) {
      // Call parent constructor first
      Synthcore.Model.apply(this, arguments);

      // Initialize the CloudStore connector
      this.cloudStore = null;
      if (modelConfig && modelConfig.cloudStore) {
        this.cloudStore = modelConfig.cloudStore;
      } else if (this.cloudStore) { // If cloudStore is defined as a prototype property
        // Use existing cloudStore property
      } else {
        throw new Error("CloudStore.ItemUnit: A 'cloudStore' reference must be provided in config or as a property.");
      }

      // Resolve the CloudStore reference type
      const connectorType = typeof this.cloudStore;
      if (connectorType === "string") {
        this.cloudStore = new Firebase(this.cloudStore);
      } else if (connectorType === "function") {
        this.cloudStore = this.cloudStore();
      } else if (connectorType !== "object" || this.cloudStore === null) {
        throw new Error("CloudStore.ItemUnit: Invalid 'cloudStore' reference type. Must be string, function, or Firebase object.");
      }

      // Set up listener for remote CloudStore value changes
      this.cloudStore.on("value", this._receiveRemoteUpdate.bind(this));

      // Set up listener for local model changes to propagate to CloudStore
      this.on("change", this._propagateLocalChange, this);
    },

    /**
     * Propagates local model changes to the CloudStore.
     * Handles setting `null` for deleted attributes to ensure proper removal in CloudStore.
     * @param {Synthcore.Model} dataRecord - The model instance that changed.
     */
    _propagateLocalChange: function(dataRecord) {
      if (!dataRecord || !this.cloudStore) {
        return;
      }

      const recordPayload = dataRecord.toJSON();
      const changedAttributes = dataRecord.changedAttributes();

      // For attributes that were set to undefined or null, explicitly set them to null in payload
      // so CloudStore removes them.
      for (const key in changedAttributes) {
        if (changedAttributes.hasOwnProperty(key)) {
          const value = changedAttributes[key];
          if (value === undefined || value === null) {
            recordPayload[key] = null;
          }
        }
      }
      this.cloudStore.update(recordPayload, (issue) => {
        if (issue) {
          this._trace(`Error propagating local change for ${this.id}: ${issue.message || issue}`);
        }
      });
    },

    /**
     * Receives and applies updates from the CloudStore to the local model.
     * Handles unsetting attributes that have been removed remotely.
     * @param {Object} snapshot - The CloudStore data snapshot.
     */
    _receiveRemoteUpdate: function(snapshot) {
      const updatedPayload = snapshot.val();
      const selfRef = this;

      if (typeof updatedPayload !== "object" || updatedPayload === null) {
        // If the entire node was removed or set to a non-object value, clear attributes.
        Object.keys(this.attributes).forEach(attrKey => {
          selfRef.unset(attrKey, {
            silent: true
          });
        });
        this.set(this.defaults || {}); // Reset to defaults or empty
        this.trigger('sync', this, null, null);
        return;
      }

      // Determine attributes that exist locally but not in the new remote payload
      const localAttributes = Object.keys(this.attributes);
      const remoteAttributes = Object.keys(updatedPayload);
      const attributesToRemove = localAttributes.filter(attr => !remoteAttributes.includes(attr));

      // Unset attributes that are no longer present in the remote data
      attributesToRemove.forEach(attributeName => {
        selfRef.unset(attributeName, {
          silent: true
        });
      });

      // Update the model with the new remote data
      this.set(updatedPayload);
      this.trigger('sync', this, null, null); // Signal that the model has been synchronized
    },

    /**
     * Utility for logging messages within the adapter.
     * @param {string} [message] - The message to log. If undefined/null, nothing is logged.
     */
    _trace: function(message) {
      if (message !== undefined && message !== null && typeof console !== "undefined" && console.log) {
        console.log(`CloudStore.ItemUnit (${this.id || 'new'}): ${message}`);
      }
    }
  });

})(this);