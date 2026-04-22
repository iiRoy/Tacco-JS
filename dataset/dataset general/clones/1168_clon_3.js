'use strict';

// This module provides persistent data storage capabilities for a web component.
// It leverages PouchDB for local database interactions and handles data serialization/deserialization.
class DataRepositoryElement extends HTMLElement {
  // Component properties and their default values
  static get observedAttributes() {
    return ['data-source-identifier'];
  }

  constructor() {
    super();
    // Private fields for internal state management
    this._dataStoreInstance = null; // PouchDB instance
    this._operationQueue = null; // Queue for sequential operations
    this._activeOperationIds = new Map(); // Tracks items currently in update queue

    // Data collections managed by this component
    this.resourceCollection = []; // Array to hold main data items
    this.configFragments = []; // Array to hold configuration fragments (e.g., field definitions)
    this.uiLayouts = []; // Array to hold user interface view definitions

    // Component lifecycle status indicators
    this.loadingStatus = {
      initialConfig: 'pending',
      resourceItems: 'pending',
      configFragments: 'pending',
      uiLayouts: 'pending',
    };

    // DOM/XML processing utilities, initialized on readiness
    this.xmlContentEncoder = null;
    this.xmlContentDecoder = null;
  }

  // Invoked when the custom element is first connected to the document's DOM.
  connectedCallback() {
    this.initializeComponent();
  }

  // Handles attribute changes, specifically for the data source identifier.
  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'data-source-identifier' && oldValue !== newValue) {
      this.dataSourceIdentifier = newValue;
      this.onDataSourceIdentifierChange();
    }
  }

  // Initializes critical component services.
  initializeComponent() {
    try {
      // Attempt to initialize XML serialization/parsing tools.
      this.xmlContentEncoder = new XMLSerializer();
      this.xmlContentDecoder = new DOMParser();
    } catch (error) {
      console.error('DataRepositoryElement: Failed to initialize XML utilities:', error);
      // Fallback or error handling for environments without DOM/XML support
    }

    // Initialize the operation queue for managing asynchronous tasks.
    // Using a simple queue for sequential processing of certain operations.
    this._operationQueue = new Queue({ processName: 'dataPersistence' });
  }

  // Reacts to changes in the `dataSourceIdentifier` property.
  // This method is triggered when the data source (PouchDB database name) is updated.
  onDataSourceIdentifierChange() {
    if (!this.dataSourceIdentifier) {
      // If no identifier is provided, clear any existing database instance.
      this._dataStoreInstance = null;
      console.warn('DataRepositoryElement: No data source identifier provided. Database connection reset.');
      return;
    }

    // Initialize or re-initialize PouchDB with the new identifier.
    // This creates a new database connection or uses an existing one.
    this._dataStoreInstance = new PouchDB(this.dataSourceIdentifier);
    console.info(`DataRepositoryElement: Connected to data store: '${this.dataSourceIdentifier}'`);
  }

  /**
   * Fetches a document from the underlying data store by its key.
   * @param {string} documentKey The unique identifier of the document to retrieve.
   * @returns {Promise<object>} A promise that resolves with the retrieved document or rejects on error.
   */
  async retrieveEntry(documentKey) {
    if (!this._dataStoreInstance) {
      console.error('DataRepositoryElement: Data store not initialized. Cannot retrieve entry.');
      throw new Error('Data store not ready.');
    }

    try {
      const fetchedDocument = await this._dataStoreInstance.get(documentKey);
      // console.debug(`DataRepositoryElement: Successfully retrieved document: ${fetchedDocument.documentIdentifier}`);
      return fetchedDocument;
    } catch (retrievalError) {
      console.error(`DataRepositoryElement: Error retrieving document with key '${documentKey}':`, retrievalError);
      throw retrievalError; // Re-throw to allow further error handling upstream
    }
  }

  /**
   * Stores or updates a document in the data store.
   * @param {object} documentObject The document to be saved. Must include _id for updates.
   * @returns {Promise<object>} A promise that resolves with the result of the save operation.
   */
  async storeDocument(documentObject) {
    if (!this._dataStoreInstance) {
      console.error('DataRepositoryElement: Data store not initialized. Cannot store document.');
      throw new Error('Data store not ready.');
    }
    if (!documentObject || typeof documentObject !== 'object') {
      console.error('DataRepositoryElement: Invalid document object provided for storage.');
      throw new Error('Invalid document provided.');
    }

    try {
      const saveResult = await this._dataStoreInstance.put(documentObject);
      // console.debug(`DataRepositoryElement: Document '${documentObject._id || 'new'}' saved/updated. Revision: ${saveResult.rev}`);
      return saveResult;
    } catch (saveError) {
      console.error(`DataRepositoryElement: Error saving document '${documentObject._id || 'new'}':`, saveError);
      throw saveError;
    }
  }

  /**
   * Deletes a document from the data store.
   * @param {object} entryToDelete An object containing the _id and _rev of the document to delete.
   * @returns {Promise<object>} A promise that resolves with the result of the delete operation.
   */
  async purgeEntry(entryToDelete) {
    if (!this._dataStoreInstance) {
      console.error('DataRepositoryElement: Data store not initialized. Cannot delete entry.');
      throw new Error('Data store not ready.');
    }
    if (!entryToDelete || !entryToDelete._id || !entryToDelete._rev) {
      console.error('DataRepositoryElement: Invalid entry details for deletion (missing _id or _rev).');
      throw new Error('Invalid entry for deletion.');
    }

    try {
      const deleteResult = await this._dataStoreInstance.remove(entryToDelete);
      console.info(`DataRepositoryElement: Document '${entryToDelete._id}' successfully removed.`);
      return deleteResult;
    } catch (deleteError) {
      console.error(`DataRepositoryElement: Error removing document '${entryToDelete._id}':`, deleteError);
      throw deleteError;
    }
  }

  /**
   * Loads the initial configuration object from the data store.
   * The configuration is expected to have a specific key, 'initialConfig'.
   * @returns {Promise<object>} A promise that resolves with the initial configuration.
   */
  async loadInitialConfiguration() {
    this.loadingStatus.initialConfig = 'fetching';
    try {
      const configuration = await this.retrieveEntry('initialConfig');
      this.initialConfigObject = configuration;
      this.loadingStatus.initialConfig = 'loaded';
      console.info('DataRepositoryElement: Initial configuration loaded successfully.');
      return configuration;
    } catch (error) {
      if (error.status === 404) { // PouchDB returns 404 for 'not found'
        console.warn('DataRepositoryElement: Initial configuration not found. Starting with empty configuration.');
        this.loadingStatus.initialConfig = 'empty';
        this.initialConfigObject = { _id: 'initialConfig' }; // Initialize a basic config
        return this.initialConfigObject;
      }
      console.error('DataRepositoryElement: Error loading initial configuration:', error);
      this.loadingStatus.initialConfig = 'failed';
      throw error;
    }
  }

  /**
   * Persists the current initial configuration object to the data store.
   * Ensures the configuration has the correct _id for storage.
   * @returns {Promise<object>} A promise that resolves with the result of the save operation.
   */
  async persistInitialConfiguration() {
    if (!this.initialConfigObject) {
      console.warn('DataRepositoryElement: No initial configuration object to save.');
      return Promise.resolve(null);
    }

    this.initialConfigObject._id = 'initialConfig'; // Ensure correct ID for persistence
    this.loadingStatus.initialConfig = 'saving';

    try {
      const saveResult = await this.storeDocument(this.initialConfigObject);
      this.initialConfigObject._rev = saveResult.rev; // Update revision ID
      this.loadingStatus.initialConfig = 'loaded';
      console.info('DataRepositoryElement: Initial configuration saved successfully.');
      return saveResult;
    } catch (error) {
      console.error('DataRepositoryElement: Error saving initial configuration:', error);
      this.loadingStatus.initialConfig = 'failed';
      throw error;
    }
  }

  /**
   * Retrieves all resource items from the data store.
   * Items are identified by keys starting with 'resource_entry_'.
   * @returns {Promise<Array<object>>} A promise that resolves with an array of deserialized resource items.
   */
  async retrieveAllResourceItems() {
    this.loadingStatus.resourceItems = 'fetching';
    this.resourceCollection.length = 0; // Clear existing items

    if (!this._dataStoreInstance) {
      console.error('DataRepositoryElement: Data store not initialized. Cannot retrieve resource items.');
      this.loadingStatus.resourceItems = 'failed';
      throw new Error('Data store not ready.');
    }

    try {
      const queryResult = await this._dataStoreInstance.allDocs({
        startkey: 'resource_entry_',
        endkey: 'resource_entry_zzz', // Covers a wide range of suffixes
        include_docs: true,
      });

      if (!queryResult.rows || queryResult.rows.length === 0) {
        console.info('DataRepositoryElement: No resource items found.');
        this.loadingStatus.resourceItems = 'empty';
        return [];
      }

      for (const row of queryResult.rows) {
        const deserializedItem = this.deserializeResourceRecord(row.doc, true);
        this.resourceCollection.push(deserializedItem);
        // Dispatch a custom event for each item loaded, if needed by other components.
        this.dispatchEvent(new CustomEvent('resource-item-loaded', { detail: deserializedItem }));
      }

      console.info(`DataRepositoryElement: Loaded ${this.resourceCollection.length} resource items.`);
      this.loadingStatus.resourceItems = 'loaded';
      return this.resourceCollection;
    } catch (error) {
      console.error('DataRepositoryElement: Error retrieving resource items:', error);
      this.loadingStatus.resourceItems = 'failed';
      throw error;
    }
  }

  /**
   * Inserts multiple new resource items into the data store.
   * Each item is assigned a unique ID.
   * @param {Array<object>} newResourceEntries An array of resource item objects to add.
   * @returns {Promise<Array<object>>} A promise that resolves with the result of the bulk insertion.
   */
  async insertMultipleResourceItems(newResourceEntries) {
    if (!this._dataStoreInstance) {
      console.error('DataRepositoryElement: Data store not initialized. Cannot add resource items.');
      throw new Error('Data store not ready.');
    }
    if (!Array.isArray(newResourceEntries) || newResourceEntries.length === 0) {
      console.warn('DataRepositoryElement: No resource entries provided for insertion.');
      return Promise.resolve([]);
    }

    let indexCounter = 0;
    const timestampPrefix = Date.now().toString(); // More reliable than performance.now() for unique IDs across sessions

    // Assign unique IDs and prepare for serialization
    const itemsWithIds = newResourceEntries.map(currentEntry => {
      const entryCopy = { ...currentEntry }; // Work on a copy to avoid mutating input directly before serialization
      entryCopy._id = `resource_entry_${timestampPrefix}_${indexCounter++}`;
      return entryCopy;
    });

    const serializedEntries = itemsWithIds.map(entry => this.serializeResourceRecord(entry, true));

    try {
      const bulkInsertResult = await this._dataStoreInstance.bulkDocs(serializedEntries);
      console.info(`DataRepositoryElement: Bulk inserted ${bulkInsertResult.length} resource items.`);

      // Update _rev for each original item based on the bulk insert result
      newResourceEntries.forEach((originalEntry, index) => {
        if (bulkInsertResult[index] && bulkInsertResult[index].ok) {
          originalEntry._rev = bulkInsertResult[index].rev;
        } else {
          console.warn(`DataRepositoryElement: Failed to insert item at index ${index}:`, bulkInsertResult[index]);
        }
      });
      return bulkInsertResult;
    } catch (bulkError) {
      console.error('DataRepositoryElement: Error during bulk insertion of resource items:', bulkError);
      throw bulkError;
    }
  }

  /**
   * Deletes all resource items currently stored in the component's `resourceCollection`.
   * Performs a bulk deletion operation.
   * @returns {Promise<Array<object>>} A promise that resolves with the result of the bulk deletion.
   */
  async clearAllResourceRecords() {
    console.info('DataRepositoryElement: Initiating deletion of all resource records.');

    if (!this._dataStoreInstance) {
      console.error('DataRepositoryElement: Data store not initialized. Cannot delete all resource items.');
      throw new Error('Data store not ready.');
    }
    if (this.resourceCollection.length === 0) {
      console.warn('DataRepositoryElement: No resource records found to delete.');
      return Promise.resolve([]);
    }

    // Map existing items to deletion objects required by PouchDB bulkDocs
    const recordsForDeletion = this.resourceCollection.map(singleRecord => ({
      _deleted: true, // Mark for deletion
      _id: singleRecord._id,
      _rev: singleRecord._rev,
    }));

    console.debug(`DataRepositoryElement: Preparing to delete ${recordsForDeletion.length} items.`);

    try {
      const bulkDeleteResult = await this._dataStoreInstance.bulkDocs(recordsForDeletion);
      console.info('DataRepositoryElement: All resource records successfully deleted.');
      this.resourceCollection.length = 0; // Clear the local collection
      return bulkDeleteResult;
    } catch (deleteError) {
      console.error('DataRepositoryElement: Error during bulk deletion of resource records:', deleteError);
      throw deleteError;
    }
  }

  /**
   * Updates a single resource record in the data store, utilizing an operation queue
   * to prevent race conditions and ensure the latest version is saved.
   * @param {object} recordToUpdate The resource record object to update.
   * @returns {Promise<object>} A promise that resolves with the result of the update operation.
   */
  updateResourceRecord(recordToUpdate) {
    if (!this._dataStoreInstance) {
      console.error('DataRepositoryElement: Data store not initialized. Cannot update record.');
      return Promise.reject(new Error('Data store not ready.'));
    }
    if (!recordToUpdate || !recordToUpdate._id) {
      console.error('DataRepositoryElement: Invalid resource record provided for update (missing _id).');
      return Promise.reject(new Error('Invalid record provided.'));
    }

    // Prevent queuing the same item multiple times if it's already pending an update.
    if (this._activeOperationIds.has(recordToUpdate._id)) {
      console.debug(`DataRepositoryElement: Record '${recordToUpdate._id}' is already in the update queue. Skipping.`);
      // Return a promise that resolves when the existing queued operation completes
      // This requires a more complex queue that returns promises for individual tasks,
      // but for simplicity, we'll just reject or return an already resolved promise if we can't track it.
      // For now, simply reject to indicate it's not being processed *again*.
      return Promise.resolve({ status: 'queued', message: 'Update already pending.' });
    }

    this._activeOperationIds.set(recordToUpdate._id, true); // Mark as pending

    return new Promise((resolve, reject) => {
      this._operationQueue.add(async () => {
        try {
          const serializedRecord = this.serializeResourceRecord(recordToUpdate, true);
          const updateResult = await this.storeDocument(serializedRecord);

          recordToUpdate._rev = updateResult.rev; // Update local revision
          console.debug(`DataRepositoryElement: Record '${recordToUpdate._id}' updated successfully.`);
          resolve(updateResult);
        } catch (updateError) {
          console.error(`DataRepositoryElement: Error updating record '${recordToUpdate._id}':`, updateError);
          reject(updateError);
        } finally {
          this._activeOperationIds.delete(recordToUpdate._id); // Mark as completed
          this._operationQueue.start(); // Ensure the queue continues processing
        }
      });
    });
  }

  /**
   * Retrieves all configuration fragments from the data store.
   * Fragments are identified by keys starting with 'fragment_definition_'.
   * @returns {Promise<Array<object>>} A promise that resolves with an array of configuration fragments.
   */
  async retrieveConfigurationFragments() {
    console.info('DataRepositoryElement: Loading configuration fragments...');
    this.loadingStatus.configFragments = 'fetching';
    this.configFragments.length = 0; // Clear existing fragments

    if (!this._dataStoreInstance) {
      console.error('DataRepositoryElement: Data store not initialized. Cannot retrieve config fragments.');
      this.loadingStatus.configFragments = 'failed';
      throw new Error('Data store not ready.');
    }

    try {
      const queryResult = await this._dataStoreInstance.allDocs({
        startkey: 'fragment_definition_',
        endkey: 'fragment_definition_zzz',
        include_docs: true,
      });

      if (!queryResult.rows || queryResult.rows.length === 0) {
        console.info('DataRepositoryElement: No configuration fragments found.');
        this.loadingStatus.configFragments = 'empty';
        return [];
      }

      // Sort fragments by an 'index' property if available, for consistent ordering.
      const sortedRows = queryResult.rows.sort((a, b) => (a.doc.index || 0) - (b.doc.index || 0));

      for (const row of sortedRows) {
        this.configFragments.push(row.doc);
      }

      console.info(`DataRepositoryElement: Loaded ${this.configFragments.length} configuration fragments.`);
      this.loadingStatus.configFragments = 'loaded';
      return this.configFragments;
    } catch (error) {
      console.error('DataRepositoryElement: Error retrieving configuration fragments:', error);
      this.loadingStatus.configFragments = 'failed';
      throw error;
    }
  }

  /**
   * Adds a new configuration fragment to the data store.
   * Assigns a unique ID based on its name.
   * @param {object} newFragment The fragment object to add.
   * @returns {Promise<object>} A promise that resolves with the result of the add operation.
   */
  async addConfigurationFragment(newFragment) {
    if (!newFragment || !newFragment.name) {
      console.error('DataRepositoryElement: Invalid configuration fragment provided (missing name).');
      throw new Error('Invalid fragment for addition.');
    }

    newFragment._id = `fragment_definition_${newFragment.name}`; // Generate ID

    try {
      const addResult = await this.storeDocument(newFragment);
      newFragment._rev = addResult.rev; // Update revision
      console.info(`DataRepositoryElement: Configuration fragment '${newFragment.name}' added.`);
      return addResult;
    } catch (error) {
      console.error(`DataRepositoryElement: Error adding configuration fragment '${newFragment.name}':`, error);
      throw error;
    }
  }

  /**
   * Updates an existing configuration fragment in the data store.
   * @param {object} fragmentToUpdate The fragment object to update.
   * @returns {Promise<object>} A promise that resolves with the result of the update operation.
   */
  async modifyConfigurationFragment(fragmentToUpdate) {
    if (!fragmentToUpdate || !fragmentToUpdate._id) {
      console.error('DataRepositoryElement: Invalid configuration fragment provided for update (missing _id).');
      throw new Error('Invalid fragment for update.');
    }

    try {
      const updateResult = await this.storeDocument(fragmentToUpdate);
      fragmentToUpdate._rev = updateResult.rev; // Update revision
      console.info(`DataRepositoryElement: Configuration fragment '${fragmentToUpdate.name || fragmentToUpdate._id}' updated.`);
      return updateResult;
    } catch (error) {
      console.error(`DataRepositoryElement: Error updating configuration fragment '${fragmentToUpdate.name || fragmentToUpdate._id}':`, error);
      throw error;
    }
  }

  /**
   * Loads user interface view definitions from the data store.
   * Views are identified by keys starting with 'ui_layout_'.
   * @returns {Promise<Array<object>>} A promise that resolves with an array of UI layout objects.
   */
  async loadUserInterfaceViews() {
    this.loadingStatus.uiLayouts = 'fetching';
    this.uiLayouts.length = 0; // Clear existing layouts

    if (!this._dataStoreInstance) {
      console.error('DataRepositoryElement: Data store not initialized. Cannot load UI views.');
      this.loadingStatus.uiLayouts = 'failed';
      throw new Error('Data store not ready.');
    }

    try {
      const queryResult = await this._dataStoreInstance.allDocs({
        startkey: 'ui_layout_',
        endkey: 'ui_layout_zzz',
        include_docs: true,
      });

      if (!queryResult.rows || queryResult.rows.length === 0) {
        console.info('DataRepositoryElement: No UI layouts found.');
        this.loadingStatus.uiLayouts = 'empty';
        return [];
      }

      for (const row of queryResult.rows) {
        this.uiLayouts.push(row.doc);
        this.dispatchEvent(new CustomEvent('ui-layout-loaded', { detail: row.doc }));
      }

      console.info(`DataRepositoryElement: Loaded ${this.uiLayouts.length} UI layouts.`);
      this.loadingStatus.uiLayouts = 'loaded';
      return this.uiLayouts;
    } catch (error) {
      console.error('DataRepositoryElement: Error loading UI views:', error);
      this.loadingStatus.uiLayouts = 'failed';
      throw error;
    }
  }

  /**
   * Saves or updates a user interface view definition in the data store.
   * If the view has no _id, a new one is generated.
   * @param {object} layoutToSave The UI layout object to save.
   * @returns {Promise<object>} A promise that resolves with the result of the save operation.
   */
  async persistUserInterfaceView(layoutToSave) {
    if (!layoutToSave || typeof layoutToSave !== 'object') {
      console.error('DataRepositoryElement: Invalid UI layout object provided for saving.');
      throw new Error('Invalid UI layout provided.');
    }

    // Generate a new ID if it's a new view
    if (!layoutToSave._id) {
      const currentTimeIdentifier = Date.now().toString();
      layoutToSave._id = `ui_layout_${currentTimeIdentifier}`;
      console.debug(`DataRepositoryElement: Assigning new ID '${layoutToSave._id}' to UI layout.`);
    }

    try {
      const saveResult = await this.storeDocument(layoutToSave);
      layoutToSave._rev = saveResult.rev; // Update revision
      console.info(`DataRepositoryElement: UI layout '${layoutToSave._id}' saved successfully.`);
      return saveResult;
    } catch (error) {
      console.error(`DataRepositoryElement: Error saving UI layout '${layoutToSave._id}':`, error);
      throw error;
    }
  }

  /**
   * Serializes a resource record into a format suitable for database storage.
   * Handles special data types like Date, URL, HTML, and XML based on fragment definitions.
   * @param {object} sourceRecord The original resource record object.
   * @param {boolean} includeDbMetadata If true, includes _id and _rev properties.
   * @returns {object} The serialized object.
   */
  serializeResourceRecord(sourceRecord, includeDbMetadata) {
    const serializedData = {};

    // Helper to transfer common metadata properties
    const transferMetadata = (record, target) => {
      if (includeDbMetadata) {
        for (const key of ['_id', '_rev']) {
          if (record[key] !== undefined) {
            target[key] = record[key];
          }
        }
      }
      for (const key of ['index', 'initialConfig']) { // Renamed 'seed' to 'initialConfig'
        if (record[key] !== undefined) {
          target[key] = record[key];
        }
      }
    };

    transferMetadata(sourceRecord, serializedData);

    // Process properties based on configuration fragment definitions
    for (const fragmentDefinition of this.configFragments) {
      const propertyKey = fragmentDefinition.name;
      const propertyValue = sourceRecord[propertyKey];

      if (propertyValue === undefined) {
        serializedData[propertyKey] = null; // Ensure null for undefined values
        continue;
      }

      switch (fragmentDefinition.type) {
        case 'date':
          serializedData[propertyKey] = propertyValue instanceof Date && !isNaN(propertyValue) ? propertyValue.toISOString() : null;
          break;

        case 'url':
          serializedData[propertyKey] = propertyValue instanceof URL ? propertyValue.href : null;
          break;

        case 'html':
        case 'xml':
          try {
            if (propertyValue instanceof Node) { // Check if it's a DOM node
              serializedData[propertyKey] = this.xmlContentEncoder.serializeToString(propertyValue);
            } else {
              serializedData[propertyKey] = null;
            }
          } catch (encodingError) {
            console.error(`DataRepositoryElement: Error serializing ${propertyKey} as ${fragmentDefinition.type}:`, encodingError);
            serializedData[propertyKey] = null; // On error, store as null
          }
          break;

        default:
          serializedData[propertyKey] = propertyValue;
          break;
      }
    }

    return serializedData;
  }

  /**
   * Deserializes raw data from the database back into a resource record object.
   * Reconstructs special data types based on fragment definitions.
   * @param {object} rawData The raw data object from the database.
   * @param {boolean} includeDbMetadata If true, includes _id and _rev properties.
   * @returns {object} The deserialized resource record object.
   */
  deserializeResourceRecord(rawData, includeDbMetadata) {
    const deserializedRecord = {};

    // Helper to transfer common metadata properties
    const transferMetadata = (source, target) => {
      if (includeDbMetadata) {
        for (const key of ['_id', '_rev']) {
          if (source[key] !== undefined) {
            target[key] = source[key];
          }
        }
      }
      for (const key of ['index', 'initialConfig']) { // Renamed 'seed' to 'initialConfig'
        if (source[key] !== undefined) {
          target[key] = source[key];
        }
      }
    };

    transferMetadata(rawData, deserializedRecord);

    // Process properties based on configuration fragment definitions
    for (const fragmentDefinition of this.configFragments) {
      const fieldKey = fragmentDefinition.name;
      const fieldValue = rawData[fieldKey];

      if (fieldValue === null || fieldValue === undefined) {
        deserializedRecord[fieldKey] = null; // Explicitly set null for null/undefined values
        continue;
      }

      switch (fragmentDefinition.type) {
        case 'url':
          try {
            deserializedRecord[fieldKey] = typeof fieldValue === 'string' && fieldValue.trim() !== '' ? new URL(fieldValue) : null;
          } catch (urlError) {
            console.warn(`DataRepositoryElement: Invalid URL format for ${fieldKey}: ${fieldValue}. Setting to null.`, urlError);
            deserializedRecord[fieldKey] = null;
          }
          break;

        case 'date':
          const dateValue = new Date(fieldValue);
          deserializedRecord[fieldKey] = !isNaN(dateValue) ? dateValue : null;
          if (isNaN(dateValue) && fieldValue) {
            console.warn(`DataRepositoryElement: Invalid Date format for ${fieldKey}: ${fieldValue}. Setting to null.`);
          }
          break;

        case 'html':
          try {
            deserializedRecord[fieldKey] = typeof fieldValue === 'string' && fieldValue.trim() !== '' ? this.xmlContentDecoder.parseFromString(fieldValue, 'text/html').body.firstChild : null;
            // Often, we want the body's content, or the first child if it's a single element
          } catch (parsingError) {
            console.error(`DataRepositoryElement: Error parsing HTML for ${fieldKey}:`, parsingError);
            deserializedRecord[fieldKey] = null;
          }
          break;

        case 'xml':
          try {
            deserializedRecord[fieldKey] = typeof fieldValue === 'string' && fieldValue.trim() !== '' ? this.xmlContentDecoder.parseFromString(fieldValue, 'application/xml').documentElement : null;
            // Often, we want the document element for XML
          } catch (parsingError) {
            console.error(`DataRepositoryElement: Error parsing XML for ${fieldKey}:`, parsingError);
            deserializedRecord[fieldKey] = null;
          }
          break;

        default:
          deserializedRecord[fieldKey] = fieldValue;
          break;
      }
    }

    return deserializedRecord;
  }
}

// Custom Queue implementation (simplified for example, typically a more robust one would be used)
class Queue {
  constructor(options = {}) {
    this.tasks = [];
    this.isRunning = false;
    this.name = options.processName || 'defaultQueue';
  }

  add(task) {
    this.tasks.push(task);
    if (!this.isRunning) {
      this.start();
    }
  }

  async start() {
    if (this.isRunning || this.tasks.length === 0) {
      return;
    }

    this.isRunning = true;
    while (this.tasks.length > 0) {
      const currentTask = this.tasks.shift();
      try {
        await currentTask(); // Execute the task
      } catch (error) {
        console.error(`Queue '${this.name}': Error executing task:`, error);
      }
    }
    this.isRunning = false;
  }
}

// Register the custom element with the browser.
customElements.define('data-repository-element', DataRepositoryElement);