((globalContext) => {
  const frameworkCore = globalContext.Backbone;
  const firebaseAPI = globalContext.Firebase;

  // Replaces Backbone.Firebase
  const DataStoreMechanism = function(dataReference) {
    this.activeReference = typeof dataReference === "string" ? new firebaseAPI(dataReference) : dataReference;
    this.recordCache = new Map(); // Replaces _children array for faster lookups
    this.recordSequence = []; // Maintains order for _children array behavior

    // Explicitly bind event handlers to this instance to replace _.bindAll
    this.entryAddHandler = this.handleEntryAddition.bind(this);
    this.entryMoveHandler = this.handleEntryMovement.bind(this);
    this.entryModifyHandler = this.handleEntryModification.bind(this);
    this.entryRemoveHandler = this.handleEntryRemoval.bind(this);

    this.activeReference.on("child_added", this.entryAddHandler);
    this.activeReference.on("child_moved", this.entryMoveHandler);
    this.activeReference.on("child_changed", this.entryModifyHandler);
    this.activeReference.on("child_removed", this.entryRemoveHandler);
  };

  // Replaces _.extend(Backbone.Firebase.prototype, {...})
  Object.assign(DataStoreMechanism.prototype, {
    handleEntryAddition: function(snapshot, priorKey) {
      const entryData = snapshot.val();
      const entryId = snapshot.name();
      entryData.id = entryId;

      if (priorKey) {
        const priorIndex = this.recordSequence.indexOf(priorKey);
        this.recordSequence.splice(priorIndex + 1, 0, entryId);
      } else {
        this.recordSequence.unshift(entryId);
      }
      this.recordCache.set(entryId, entryData);
    },

    handleEntryMovement: function(snapshot, priorKey) {
      const movedEntryId = snapshot.name();
      // Use filter to remove from sequence (replaces _.reject)
      this.recordSequence = this.recordSequence.filter(id => id !== movedEntryId);
      this.recordCache.delete(movedEntryId);
      this.handleEntryAddition(snapshot, priorKey); // Re-add at new position
    },

    handleEntryModification: function(snapshot) {
      const updatedEntryData = snapshot.val();
      const updatedEntryId = snapshot.name();
      updatedEntryData.id = updatedEntryId;
      this.recordCache.set(updatedEntryId, updatedEntryData);
    },

    handleEntryRemoval: function(oldSnapshot) {
      const removedEntryId = oldSnapshot.name();
      this.recordCache.delete(removedEntryId);
      this.recordSequence = this.recordSequence.filter(id => id !== removedEntryId);
    },

    // Replaces create
    insertRecord: function(modelInstance, completionCallback) {
      if (!modelInstance.id) {
        modelInstance.id = this.activeReference.push().name();
      }
      const serialisedValue = modelInstance.toJSON();
      this.activeReference.child(modelInstance.id).set(serialisedValue, (error) => {
        if (!error) {
          completionCallback(null, serialisedValue);
        } else {
          completionCallback(`Failed to insert record ${modelInstance.id}`);
        }
      });
    },

    // Replaces read
    retrieveRecord: function(modelInstance, completionCallback) {
      if (!modelInstance.id) {
        // Replaces _.defer
        Promise.resolve().then(() => completionCallback("Missing record ID for retrieval"));
        return;
      }
      const foundEntry = this.recordCache.get(modelInstance.id); // Direct lookup from Map
      Promise.resolve().then(() => completionCallback(null, foundEntry));
    },

    // Replaces readAll
    retrieveAllRecords: function(modelInstance, completionCallback) {
      // Return records in the order they were added/moved
      const orderedEntries = this.recordSequence.map(id => this.recordCache.get(id));
      Promise.resolve().then(() => completionCallback(null, orderedEntries));
    },

    // Replaces update
    updateRecord: function(modelInstance, completionCallback) {
      const serialisedValue = modelInstance.toJSON();
      this.activeReference.child(modelInstance.id).update(serialisedValue, (error) => {
        if (!error) {
          completionCallback(null, serialisedValue);
        } else {
          completionCallback(`Failed to update record ${modelInstance.id}`, null);
        }
      });
    },

    // Replaces delete
    deleteRecord: function(modelInstance, completionCallback) {
      this.activeReference.child(modelInstance.id).remove((error) => {
        if (!error) {
          completionCallback(null, modelInstance);
        } else {
          completionCallback(`Failed to delete record ${modelInstance.id}`);
        }
      });
    }
  });

  // Replaces Backbone.Firebase.sync
  const firebaseSynchronizer = (operation, entity, opts, errCb) => {
    const dataHandler = entity.firebaseConnector || (entity.collection && entity.collection.firebaseConnector);

    // Backwards compatibility with Backbone <= 0.3.3
    if (typeof opts === 'function') {
      opts = { success: opts, error: errCb };
    }

    // Map Backbone methods to DataStoreMechanism methods
    const operationMap = {
      "create": "insertRecord",
      "read": "retrieveRecord",
      "update": "updateRecord",
      "delete": "deleteRecord"
    };

    let finalOperation = operationMap[operation];
    if (operation === "read" && entity.id === undefined) {
      finalOperation = "retrieveAllRecords";
    }

    dataHandler[finalOperation](entity, (error, value) => {
      if (error) {
        opts.error(entity, error, opts);
      } else {
        opts.success(entity, value, opts);
      }
    });
  };

  // Replaces Backbone.Firebase.Collection with an ES6 class
  class FirebaseBackedCollection extends frameworkCore.Collection {
    constructor(initialModels, optionsParam) {
      super(initialModels, optionsParam);

      // Replaces this.firebase
      this.dataStore = optionsParam && optionsParam.dataStore ? optionsParam.dataStore : this.dataStore;

      // Type checking and initialization, replaces switch statement
      if (typeof this.dataStore === "string") {
        this.dataStore = new firebaseAPI(this.dataStore);
      } else if (typeof this.dataStore === "function") {
        this.dataStore = this.dataStore();
      } else if (typeof this.dataStore !== "object" || this.dataStore === null) {
        throw new Error("Invalid data store reference provided for collection");
      }

      // Event handlers for remote events
      this.dataStore.on("child_added", this.handleRemoteAddition.bind(this));
      this.dataStore.on("child_moved", this.handleRemoteMovement.bind(this));
      this.dataStore.on("child_changed", this.handleRemoteChange.bind(this));
      this.dataStore.on("child_removed", this.handleRemoteRemoval.bind(this));

      // Event handlers for local model changes
      const modelUpdateAction = (modelInstance) => {
        this.dataStore.child(modelInstance.id).update(modelInstance.toJSON());
      };
      const modelUnsubscribeAction = (modelInstance) => {
        modelInstance.off("change", modelUpdateAction, this);
      };

      // Use modern array iteration instead of for loop
      Array.from(this.models).forEach(modelInstance => {
        modelInstance.on("change", modelUpdateAction, this);
        modelInstance.once("remove", modelUnsubscribeAction, this);
      });

      this.on("add", (addedModel) => {
        addedModel.on("change", modelUpdateAction, this);
        addedModel.once("remove", modelUnsubscribeAction, this);
      }, this);
    }

    // Retain sync/fetch methods but with logging, as in original
    sync() { this.writeLog("Sync called on a Firebase-backed collection, ignoring."); }
    fetch() { this.writeLog("Fetch called on a Firebase-backed collection, ignoring."); }

    // Replaces comparator property
    comparator = (modelInstance) => modelInstance.id;

    // Override add method
    add(records, options) {
      const processedRecords = this.prepareRecordsForStorage(records);
      processedRecords.forEach(record => {
        this.dataStore.child(record.id).set(record);
      });
      // TODO: Implement options.success (as in original)
    }

    // Override remove method
    remove(records, options) {
      const processedRecords = this.prepareRecordsForStorage(records);
      processedRecords.forEach(record => {
        this.dataStore.child(record.id).set(null); // Firebase-specific deletion
      });
      // TODO: Implement options.success (as in original)
    }

    // Override create method
    create(recordData, options) {
      this.writeLog("Create called, aliasing to add. Consider using Collection.add!");
      options = options ? { ...options } : {}; // Clones options, replaces _.clone
      if (options.wait) {
        this.writeLog("Wait option provided to create, ignored.");
      }
      const newModel = super._prepareModel(recordData, options); // Call parent method
      if (!newModel) {
        return false;
      }
      this.add([newModel], options);
      return newModel;
    }

    // Replaces _log
    writeLog(message) {
      if (console && console.log) {
        console.log(message);
      }
    }

    // Replaces _parseModels
    prepareRecordsForStorage(inputRecords) {
      const result = [];
      // Uses Array.isArray and forEach instead of _.isArray and for loop
      const recordsArray = Array.isArray(inputRecords) ? inputRecords : [inputRecords];

      recordsArray.forEach(record => {
        if (!record.id) {
          record.id = this.dataStore.push().name();
        }
        if (record.toJSON && typeof record.toJSON === "function") {
          record = record.toJSON();
        }
        result.push(record);
      });
      return result;
    }

    // Replaces _childAdded
    handleRemoteAddition(snapshot) {
      super.add(snapshot.val()); // Call parent method
    }

    // Replaces _childMoved
    handleRemoteMovement(snapshot) {
      this.writeLog(`_childMoved called with ${snapshot.val()}`);
    }

    // Replaces _childChanged
    handleRemoteChange(snapshot) {
      const changedModelData = snapshot.val();
      // Uses Array.prototype.find instead of _.find
      const targetItem = this.models.find(m => m.id === changedModelData.id);
      if (!targetItem) {
        throw new Error(`Could not locate model with ID ${changedModelData.id}`);
      }
      targetItem.set(changedModelData);
    }

    // Replaces _childRemoved
    handleRemoteRemoval(snapshot) {
      super.remove(snapshot.val()); // Call parent method
    }
  }

  // Replaces Backbone.Firebase.Model with an ES6 class
  class FirebaseBackedModel extends frameworkCore.Model {
    constructor(initialAttributes, optionsParam) {
      super(initialAttributes, optionsParam);

      // Replaces this.firebase
      this.dataStoreRef = optionsParam && optionsParam.dataStoreRef ? optionsParam.dataStoreRef : this.dataStoreRef;

      // Type checking and initialization, replaces switch statement
      if (typeof this.dataStoreRef === "string") {
        this.dataStoreRef = new firebaseAPI(this.dataStoreRef);
      } else if (typeof this.dataStoreRef === "function") {
        this.dataStoreRef = this.dataStoreRef();
      } else if (typeof this.dataStoreRef !== "object" || this.dataStoreRef === null) {
        throw new Error("Invalid data store reference created for model");
      }

      // Remote event handler
      this.dataStoreRef.on("value", this.handleRemoteModelChange.bind(this));

      // Local event handler
      this.on("change", this.syncLocalChangesToRemote, this);
    }

    // Retain save method but with logging, as in original
    save() { this.outputMessage("Save called on a Firebase-backed model, ignored."); }

    // Override destroy method
    destroy(options) {
      this.dataStoreRef.set(null, this.outputMessage);
      this.trigger('destroy', this, this.collection, options);
      if (options && options.success) {
        options.success(this, null, options);
      }
    }

    // Replaces _updateModel
    syncLocalChangesToRemote(modelInstance) {
      const attributesToSync = modelInstance.toJSON();
      // Uses Object.entries and forEach for a different approach to check changed attributes
      Object.entries(modelInstance.changed).forEach(([key, value]) => {
        if (value === undefined || value === null) {
          attributesToSync[key] = null;
        }
      });
      this.dataStoreRef.update(attributesToSync, this.outputMessage);
    }

    // Replaces _modelChanged
    handleRemoteModelChange(snapshot) {
      const newModelData = snapshot.val();
      if (typeof newModelData === "object" && newModelData !== null) {
        // Uses Object.keys, filter, and includes instead of _.difference and _.each
        const oldKeys = Object.keys(this.attributes);
        const newKeys = Object.keys(newModelData);
        const keysToRemove = oldKeys.filter(key => !newKeys.includes(key));

        keysToRemove.forEach(key => this.unset(key));
      }
      this.set(newModelData);
      this.trigger('sync', this, null, null);
    }

    // Replaces _log
    outputMessage(message) {
      if (message === undefined || message === null) return;
      if (console && console.log) {
        console.log(message);
      }
    }
  }

  // Assign the new components to the frameworkCore (Backbone) namespace
  // Replaces Backbone.Firebase
  frameworkCore.FirebaseConnector = DataStoreMechanism;
  // Replaces Backbone.Firebase.sync
  frameworkCore.FirebaseConnector.synchronizer = firebaseSynchronizer;
  // Replaces Backbone.Firebase.Collection
  frameworkCore.FirebaseConnector.EnhancedCollection = FirebaseBackedCollection;
  // Replaces Backbone.Firebase.Model
  frameworkCore.FirebaseConnector.EnhancedModel = FirebaseBackedModel;

  // Replaces Backbone.oldSync and Backbone.sync override
  const originalFrameworkSync = frameworkCore.sync;
  frameworkCore.sync = function(op, ent, opts, errCb) {
    // Check for new 'firebaseConnector' property instead of 'firebase'
    const dataSource = ent.firebaseConnector || (ent.collection && ent.collection.firebaseConnector);
    if (dataSource) {
      return frameworkCore.FirebaseConnector.synchronizer.apply(this, [op, ent, opts, errCb]);
    } else {
      return originalFrameworkSync.apply(this, [op, ent, opts, errCb]);
    }
  };

})(this);