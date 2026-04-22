class DataCustodian {
  constructor() {
    try {
      this.xmlProcessor = new XMLSerializer();
      this.htmlAndXmlParser = new DOMParser();
    } catch (e) {
      console.warn('DOM processing utilities not available:', e);
    }

    this.operationSequencer = new class TaskSequencer {
      constructor(descriptor) {
        this.taskQueue = [];
        this.processingActive = false;
        this.label = descriptor.moniker;
        this.initiateProcessing = this.initiateProcessing.bind(this);
      }

      queueOperation(actionFunction) {
        this.taskQueue.push(actionFunction);
        if (!this.processingActive) {
          this.activateProcessing();
        }
      }

      activateProcessing() {
        this.processingActive = true;
        this.initiateProcessing();
      }

      async initiateProcessing() {
        if (this.taskQueue.length === 0) {
          this.processingActive = false;
          return;
        }

        const currentAction = this.taskQueue.shift();
        try {
          await currentAction();
        } catch (err) {
          console.error(`Error in sequenced operation for ${this.label}:`, err);
        } finally {
          // Ensure next task is processed, regardless of success or failure
          this.initiateProcessing();
        }
      }

      resumeProcessing() { // Mimics original `queue.start()`
        this.activateProcessing();
      }
    }({ moniker: 'data-operations' });

    this.pendingActivityTracker = {};
    this.statusIndicators = {
      seedData: 'uninitialized',
      entityRecords: 'uninitialized',
      attributeSchemas: 'uninitialized',
      displayLayouts: 'uninitialized'
    };

    this.configurationSeedData = null;
    this.entityRecords = [];
    this.attributeSchemas = [];
    this.displayLayouts = [];

    this.dataRepositoryInstance = null;
    this.dataAccessBridge = null;
  }

  establishRepository(identifierString) {
    if (identifierString) {
      this.repositoryIdentifier = identifierString;
      this.dataRepositoryInstance = new PouchDB(this.repositoryIdentifier);
      this.dataAccessBridge = new class PouchBridge {
        constructor(dbInstance) {
          this.internalDB = dbInstance;
        }

        async retrieveSingle(key) {
          try {
            return await this.internalDB.get(key);
          } catch (err) {
            console.error('Data retrieval failure:', key, err);
            throw err;
          }
        }

        async storeSingle(record) {
          try {
            return await this.internalDB.put(record);
          } catch (err) {
            console.error('Data storage failure:', record._id || 'new', err);
            throw err;
          }
        }

        async eliminateRecord(recordDetails) {
          try {
            return await this.internalDB.remove(recordDetails);
          } catch (err) {
            console.error('Data elimination failure:', recordDetails._id, err);
            throw err;
          }
        }

        async retrieveBatch(querySpecs) {
          try {
            return await this.internalDB.allDocs(querySpecs);
          } catch (err) {
            console.error('Batch retrieval failure:', querySpecs, err);
            throw err;
          }
        }

        async storeBatch(records) {
          try {
            return await this.internalDB.bulkDocs(records);
          } catch (err) {
            console.error('Batch storage failure:', err);
            throw err;
          }
        }
      }(this.dataRepositoryInstance);
    } else {
      this.dataRepositoryInstance = null;
      this.dataAccessBridge = null;
    }
  }

  async fetchConfigurationSeed() {
    if (!this.dataAccessBridge) {
      console.error('Repository not established for fetching configuration seed.');
      return Promise.reject(new Error('Repository not established.'));
    }
    try {
      const retrievedSeed = await this.dataAccessBridge.retrieveSingle('seed');
      this.configurationSeedData = retrievedSeed;
      this.statusIndicators.seedData = 'loaded';
      return retrievedSeed;
    } catch (err) {
      console.warn('Configuration seed not found or error accessing:', err.message);
      this.statusIndicators.seedData = 'empty';
      throw err;
    }
  }

  async commitConfigurationSeed() {
    if (!this.dataAccessBridge) {
      console.error('Repository not established for committing configuration seed.');
      return Promise.reject(new Error('Repository not established.'));
    }
    if (!this.configurationSeedData) {
      console.error('No configuration seed data to commit.');
      return Promise.reject(new Error('No configuration seed data to commit.'));
    }
    this.configurationSeedData._id = 'seed';
    console.log('Attempting to commit configuration seed:', this.configurationSeedData);
    try {
      const response = await this.dataAccessBridge.storeSingle(this.configurationSeedData);
      this.configurationSeedData._rev = response.rev;
      this.statusIndicators.seedData = 'loaded';
      return response;
    } catch (err) {
      console.error('Error committing configuration seed:', err);
      this.statusIndicators.seedData = 'empty';
      throw err;
    }
  }

  async loadAllEntityRecords() {
    if (!this.dataAccessBridge) {
      console.error('Repository not established for loading entity records.');
      return Promise.reject(new Error('Repository not established.'));
    }
    try {
      const queryResult = await this.dataAccessBridge.retrieveBatch({
        startkey: 'entity_',
        endkey: 'entity_zzz',
        include_docs: true
      });

      this.entityRecords.length = 0;

      for (const recordRow of queryResult.rows) {
        if (recordRow.doc) {
          const processedRecord = this.convertStoredToLiveEntity(recordRow.doc, true);
          this.entityRecords.push(processedRecord);
          this.signalEvent('entity-record-acquired', processedRecord);
        }
      }
      console.log('Entity records loaded:', this.entityRecords.length);
      this.statusIndicators.entityRecords = 'loaded';
      return queryResult;
    } catch (err) {
      console.error('Error loading entity records:', err);
      this.statusIndicators.entityRecords = 'empty';
      throw err;
    }
  }

  async incorporateNewEntityRecords(incomingRecords) {
    if (!this.dataAccessBridge) {
      console.error('Repository not established for incorporating new entity records.');
      return Promise.reject(new Error('Repository not established.'));
    }

    const currentTimestamp = window.performance.now().toString();
    let recordCounter = 0;

    const recordsForStorage = incomingRecords.map(sourceRecord => {
      const newRecord = { ...sourceRecord };
      newRecord._id = `entity_${currentTimestamp}_${recordCounter++}`;
      return this.prepareLiveEntityForStorage(newRecord, true);
    });

    try {
      const bulkResponse = await this.dataAccessBridge.storeBatch(recordsForStorage);
      console.log('Incorporated entity records:', bulkResponse.length);

      incomingRecords.forEach((sourceRecord, index) => {
        sourceRecord._rev = bulkResponse[index].rev;
        sourceRecord._id = recordsForStorage[index]._id;
      });
      return bulkResponse;
    } catch (err) {
      console.error('Error incorporating entity records:', err);
      throw err;
    }
  }

  async deleteSelectedEntityRecords() {
    if (!this.dataAccessBridge) {
      console.error('Repository not established for deleting entity records.');
      return Promise.reject(new Error('Repository not established.'));
    }
    console.log('Initiating bulk entity record deletion.');

    const deletionRequests = this.entityRecords.map(record => ({
      _deleted: true,
      _id: record._id,
      _rev: record._rev
    }));

    console.log('Preparing to delete', deletionRequests.length, 'entity records.');

    try {
      const response = await this.dataAccessBridge.storeBatch(deletionRequests);
      console.log('All specified entity records have been removed.');
      this.entityRecords.length = 0;
      return response;
    } catch (err) {
      console.error('Error during bulk entity record deletion:', err);
      throw err;
    }
  }

  async modifySingleEntityRecord(recordToUpdate) {
    if (!this.dataAccessBridge) {
      console.error('Repository not established for modifying entity record:', recordToUpdate._id);
      return Promise.reject(new Error('Repository not established.'));
    }

    if (this.pendingActivityTracker[recordToUpdate._id]) {
      console.log('Entity record modification already pending or in progress:', recordToUpdate._id);
      return Promise.resolve();
    }

    this.pendingActivityTracker[recordToUpdate._id] = true;

    return new Promise((resolve, reject) => {
      this.operationSequencer.queueOperation(async () => {
        try {
          const preparedRecord = this.prepareLiveEntityForStorage(recordToUpdate, true);
          const response = await this.dataAccessBridge.storeSingle(preparedRecord);
          recordToUpdate._rev = response.rev;
          resolve(response);
        } catch (err) {
          console.error('Error during single entity record modification:', err, recordToUpdate);
          reject(err);
        } finally {
          delete this.pendingActivityTracker[recordToUpdate._id];
          this.operationSequencer.resumeProcessing(); // Ensure queue continues
        }
      });
    });
  }

  async retrieveAttributeSchemaDefinitions() {
    if (!this.dataAccessBridge) {
      console.error('Repository not established for fetching attribute schema definitions.');
      return Promise.reject(new Error('Repository not established.'));
    }
    console.log('Fetching attribute schema definitions.');

    this.attributeSchemas.length = 0;

    try {
      const queryResult = await this.dataAccessBridge.retrieveBatch({
        startkey: 'attributeSchema_',
        endkey: 'attributeSchema_zzz',
        include_docs: true
      });

      queryResult.rows.sort((a, b) => a.doc.index - b.doc.index);

      for (const recordRow of queryResult.rows) {
        if (recordRow.doc) {
          this.attributeSchemas.push(recordRow.doc);
        }
      }
      this.statusIndicators.attributeSchemas = 'loaded';
      console.log('Attribute schema definitions fetched:', this.attributeSchemas);
      return queryResult;
    } catch (err) {
      console.error('Error fetching attribute schema definitions:', err);
      throw err;
    }
  }

  async registerNewAttributeSchema(schemaDefinition) {
    if (!this.dataAccessBridge) {
      console.error('Repository not established for registering attribute schema.');
      return Promise.reject(new Error('Repository not established.'));
    }
    schemaDefinition._id = `attributeSchema_${schemaDefinition.name}`;
    try {
      const response = await this.dataAccessBridge.storeSingle(schemaDefinition);
      schemaDefinition._rev = response.rev;
      return response;
    } catch (err) {
      console.error('Error registering new attribute schema:', err);
      throw err;
    }
  }

  async updateAttributeSchemaDefinition(schemaDefinition) {
    if (!this.dataAccessBridge) {
      console.error('Repository not established for updating attribute schema.');
      return Promise.reject(new Error('Repository not established.'));
    }
    try {
      const response = await this.dataAccessBridge.storeSingle(schemaDefinition);
      schemaDefinition._rev = response.rev;
      return response;
    } catch (err) {
      console.error('Error updating attribute schema definition:', err);
      throw err;
    }
  }

  async retrieveDisplayLayoutConfigurations() {
    if (!this.dataAccessBridge) {
      console.error('Repository not established for loading display layout configurations.');
      return Promise.reject(new Error('Repository not established.'));
    }
    try {
      const queryResult = await this.dataAccessBridge.retrieveBatch({
        startkey: 'displayConfig_',
        endkey: 'displayConfig_zzz',
        include_docs: true
      });

      this.displayLayouts.length = 0;
      for (const recordRow of queryResult.rows) {
        if (recordRow.doc) {
          this.displayLayouts.push(recordRow.doc);
          this.signalEvent('display-layout-acquired', recordRow.doc);
        }
      }
      console.log('Display layout configurations loaded:', this.displayLayouts.length);
      this.statusIndicators.displayLayouts = 'loaded';
      return queryResult;
    } catch (err) {
      console.error('Error loading display layout configurations:', err);
      this.statusIndicators.displayLayouts = 'empty';
      throw err;
    }
  }

  async saveDisplayLayoutConfiguration(configDefinition) {
    if (!this.dataAccessBridge) {
      console.error('Repository not established for saving display layout configuration.');
      return Promise.reject(new Error('Repository not established.'));
    }
    if (!configDefinition._id) {
      const currentTimestamp = window.performance.now().toString();
      configDefinition._id = `displayConfig_${currentTimestamp}`;
    }

    try {
      const response = await this.dataAccessBridge.storeSingle(configDefinition);
      console.log('Display layout configuration saved:', configDefinition);
      configDefinition._rev = response.rev;
      return response;
    } catch (err) {
      console.error('Error saving display layout configuration:', err);
      throw err;
    }
  }

  // Dispatch maps for data transformation
  #storagePreparationDispatch = {
    'date': (value) => value ? value.toISOString() : null,
    'url': (value) => value ? value.href : null,
    'html': (value) => {
      try {
        return value ? this.xmlProcessor.serializeToString(value) : null;
      } catch (e) {
        console.error('HTML serialization error during storage preparation:', e);
        return null;
      }
    },
    'xml': (value) => {
      try {
        return value ? this.xmlProcessor.serializeToString(value) : null;
      } catch (e) {
        console.error('XML serialization error during storage preparation:', e);
        return null;
      }
    },
    'default': (value) => value
  };

  prepareLiveEntityForStorage(liveEntityInstance, includeMetadataFields) {
    const storageRepresentation = {};

    if (includeMetadataFields) {
      for (const key of ['_id', '_rev']) {
        if (liveEntityInstance[key] !== undefined) {
          storageRepresentation[key] = liveEntityInstance[key];
        }
      }
    }

    for (const key of ['index', 'seed']) {
      if (liveEntityInstance[key] !== undefined) {
        storageRepresentation[key] = liveEntityInstance[key];
      }
    }

    for (const schemaDescriptor of this.attributeSchemas) {
      const schemaKey = schemaDescriptor.name;
      const schemaValue = liveEntityInstance[schemaKey];
      const transformationHandler = this.#storagePreparationDispatch[schemaDescriptor.type] || this.#storagePreparationDispatch['default'];
      storageRepresentation[schemaKey] = transformationHandler(schemaValue);
    }

    return storageRepresentation;
  }

  #liveEntityTransformationDispatch = {
    'url': (storedValue) => storedValue ? new URL(storedValue) : null,
    'date': (storedValue) => storedValue ? new Date(storedValue) : null,
    'html': (storedValue) => storedValue ? this.htmlAndXmlParser.parseFromString(storedValue, 'text/html') : null,
    'xml': (storedValue) => storedValue ? this.htmlAndXmlParser.parseFromString(storedValue, 'application/xml') : null,
    'default': (storedValue) => storedValue
  };

  convertStoredToLiveEntity(storageInputData, includeMetadataFields) {
    const liveEntityInstance = {};

    if (includeMetadataFields) {
      for (const key of ['_id', '_rev']) {
        if (storageInputData[key] !== undefined) {
          liveEntityInstance[key] = storageInputData[key];
        }
      }
    }

    for (const key of ['index', 'seed']) {
      if (storageInputData[key] !== undefined) {
        liveEntityInstance[key] = storageInputData[key];
      }
    }

    for (const schemaDescriptor of this.attributeSchemas) {
      const schemaKey = schemaDescriptor.name;
      const storedValue = storageInputData[schemaKey];
      const transformationHandler = this.#liveEntityTransformationDispatch[schemaDescriptor.type] || this.#liveEntityTransformationDispatch['default'];
      liveEntityInstance[schemaKey] = transformationHandler(storedValue);
    }

    return liveEntityInstance;
  }

  signalEvent(eventName, eventPayload) {
    console.log(`[Notification] ${eventName}:`, eventPayload);
  }
}