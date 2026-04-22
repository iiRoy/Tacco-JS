((modModule) => {
    // Import the dependency, giving it a new, distinct name.
    const DataJournalHandler = require("./DataJournalHandler");

    // Internal utility for logging, to replace direct console calls.
    const _consoleLogger = {
        info: (...args) => console.info(`[AuditTrailSystem] INFO:`, ...args),
        warn: (...args) => console.warn(`[AuditTrailSystem] WARN:`, ...args),
        error: (...args) => console.error(`[AuditTrailSystem] ERROR:`, ...args),
        debug: (...args) => process.env.NODE_ENV === 'development' && console.debug(`[AuditTrailSystem] DEBUG:`, ...args)
    };

    /**
     * Validates if a given string key is suitable for use as an identifier.
     * @param {string} inputKey - The string to validate.
     * @returns {boolean} True if the key is valid, false otherwise.
     */
    const _isValidIdentifier = (inputKey) => {
        return typeof inputKey === 'string' && inputKey.trim().length > 0;
    };

    /**
     * @class AuditTrailSystem
     * @description Core service for managing and interacting with various audit data sources.
     *              It handles record registration, categorization, and provides access to processing units.
     * @param {object} [configuration={}] - Configuration options for the service.
     * @param {string} [configuration.defaultCategory='general'] - Default category for new records.
     * @param {number} [configuration.maxRecordCapacity=1000] - Maximum number of records allowed.
     */
    function AuditTrailSystem(configuration = {}) {
        // Storage for active DataJournalHandler instances, keyed by record ID.
        this._activeProcessors = {};
        // Comprehensive registry for all defined audit record configurations.
        this._recordDefinitions = {};

        // Apply configuration with sensible defaults.
        this._defaultCategory = configuration.defaultCategory || 'general';
        this._maxRecordCapacity = configuration.maxRecordCapacity || 1000;

        _consoleLogger.info(`System initialized with default category: '${this._defaultCategory}' and capacity: ${this._maxRecordCapacity}.`);
    }

    /**
     * Registers a new audit record, associating an identifier with its physical source path.
     * This method prevents duplicate registrations and enforces capacity limits.
     * @param {string} recordID - A unique identifier for the audit record.
     * @param {string} sourcePath - The file path or URI where the audit data resides.
     * @param {function} completionCb - Callback function invoked upon completion: `(err, result)`.
     * @returns {void}
     */
    AuditTrailSystem.prototype.registerAuditRecord = function(recordID, sourcePath, completionCb) {
        // Pre-validation of input parameters.
        if (!_isValidIdentifier(recordID)) {
            _consoleLogger.error(`Attempted to register record with invalid ID: '${recordID}'.`);
            return completionCb(new Error("Record registration failed: Identifier must be a non-empty string."));
        }
        if (!_isValidIdentifier(sourcePath)) {
            _consoleLogger.error(`Attempted to register record '${recordID}' with invalid source path: '${sourcePath}'.`);
            return completionCb(new Error(`Record registration for '${recordID}' failed: Source path is invalid.`));
        }

        // Check if the record already exists in the registry.
        if (this._recordDefinitions[recordID]) {
            const existingPath = this._recordDefinitions[recordID].sourcePath;
            _consoleLogger.warn(`Record '${recordID}' already registered at '${existingPath}'.`);
            return completionCb(new Error(`Record '${recordID}' is already registered with path '${existingPath}'.`));
        }

        // Enforce maximum capacity.
        if (Object.keys(this._recordDefinitions).length >= this._maxRecordCapacity) {
            _consoleLogger.error(`Registration failed: Maximum record capacity (${this._maxRecordCapacity}) reached.`);
            return completionCb(new Error(`System capacity limit reached. Cannot register new record '${recordID}'.`));
        }

        // Store comprehensive details about the new record.
        const newRecordDetails = {
            sourcePath: sourcePath,
            recordCategory: this._defaultCategory, // Assign the system's default category.
            creationTimestamp: new Date().toISOString(),
            modificationTimestamp: new Date().toISOString(),
            isActive: true // Flag to indicate if the record is currently active.
        };
        this._recordDefinitions[recordID] = newRecordDetails;

        _consoleLogger.info(`Successfully registered new record '${recordID}' from '${sourcePath}'.`);
        // Indicate success by passing null for the error and the new record details as result.
        completionCb(null, { recordID, ...newRecordDetails });
    };

    /**
     * Updates the category for an existing audit record.
     * @param {string} recordID - The identifier of the record to update.
     * @param {string} newCategory - The new category to assign.
     * @returns {object} An object indicating success and providing details: `{ updated: boolean, oldCategory?: string, newCategory?: string }`.
     */
    AuditTrailSystem.prototype.updateRecordCategory = function(recordID, newCategory) {
        // Validate inputs for update operation.
        if (!_isValidIdentifier(recordID) || !_isValidIdentifier(newCategory)) {
            _consoleLogger.warn(`Invalid input for category update: ID='${recordID}', Category='${newCategory}'.`);
            return { updated: false };
        }

        const recordEntry = this._recordDefinitions[recordID];
        if (!recordEntry) {
            _consoleLogger.warn(`Attempted to update category for non-existent record: '${recordID}'.`);
            return { updated: false };
        }

        const oldCategory = recordEntry.recordCategory;
        if (oldCategory === newCategory) {
            _consoleLogger.debug(`Category for '${recordID}' is already '${newCategory}'. No change needed.`);
            return { updated: false, oldCategory, newCategory };
        }

        recordEntry.recordCategory = newCategory;
        recordEntry.modificationTimestamp = new Date().toISOString(); // Update modification timestamp.
        _consoleLogger.info(`Category for record '${recordID}' changed from '${oldCategory}' to '${newCategory}'.`);
        return { updated: true, oldCategory, newCategory };
    };

    /**
     * Retrieves or initializes a DataJournalHandler instance for a specified record.
     * This method ensures only one processor instance exists per record and handles errors during instantiation.
     * @param {string} recordID - The identifier of the record.
     * @param {function} responseHandler - Callback function: `(error, processorInstance)`.
     * @returns {void}
     */
    AuditTrailSystem.prototype.fetchProcessorInstance = function(recordID, responseHandler) {
        // Immediate validation for the record identifier.
        if (!_isValidIdentifier(recordID)) {
            _consoleLogger.error(`Attempted to fetch processor with invalid record ID: '${recordID}'.`);
            return responseHandler(new Error("Processor retrieval failed: Identifier is invalid."));
        }

        // Return existing processor instance if already cached, simulating an async call.
        if (this._activeProcessors[recordID]) {
            _consoleLogger.debug(`Returning cached processor for '${recordID}'.`);
            setImmediate(() => responseHandler(null, this._activeProcessors[recordID]));
            return;
        }

        const recordConfig = this._recordDefinitions[recordID];
        if (!recordConfig) {
            _consoleLogger.error(`No configuration found for record ID: '${recordID}'.`);
            return responseHandler(new Error(`Processor creation failed: No record defined for '${recordID}'.`));
        }

        // Prevent processor creation if the record is marked as inactive.
        if (!recordConfig.isActive) {
            _consoleLogger.warn(`Processor creation blocked: Record '${recordID}' is currently inactive.`);
            return responseHandler(new Error(`Cannot create processor for inactive record '${recordID}'.`));
        }

        // Validate the source path before attempting to instantiate the handler.
        if (!_isValidIdentifier(recordConfig.sourcePath)) {
            _consoleLogger.error(`Invalid source path '${recordConfig.sourcePath}' for record '${recordID}'.`);
            return responseHandler(new Error(`Processor creation failed: Invalid source path for record '${recordID}'.`));
        }

        try {
            // Create a new DataJournalHandler instance.
            const newProcessor = new DataJournalHandler(recordConfig.sourcePath);
            this._activeProcessors[recordID] = newProcessor; // Cache the new instance.
            recordConfig.modificationTimestamp = new Date().toISOString(); // Update timestamp.
            _consoleLogger.info(`Successfully instantiated new DataJournalHandler for '${recordID}'.`);
            responseHandler(null, newProcessor);
        } catch (instantiationError) {
            _consoleLogger.error(`Failed to instantiate processor for '${recordID}':`, instantiationError.message);
            responseHandler(new Error(`Failed to create processor for '${recordID}': ${instantiationError.message}`));
        }
    };

    /**
     * Provides a summarized list of all registered audit records, with optional filtering.
     * @param {object} [filterOptions={}] - Options to filter the list.
     * @param {boolean} [filterOptions.includeInactive=false] - If true, inactive records are included.
     * @param {string} [filterOptions.category] - Filters records by a specific category.
     * @returns {object} An object containing the list of records and total count: `{ records: Array<Object>, totalCount: number }`.
     */
    AuditTrailSystem.prototype.retrieveRecordSummaries = function(filterOptions = {}) {
        const currentInstance = this;
        let filteredRecords = Object.keys(currentInstance._recordDefinitions)
            .map(recordKey => {
                const definition = currentInstance._recordDefinitions[recordKey];
                // Create a shallow copy to avoid external modification of internal state.
                return {
                    recordID: recordKey,
                    sourcePath: definition.sourcePath,
                    category: definition.recordCategory,
                    status: definition.isActive ? 'active' : 'inactive',
                    registeredAt: definition.creationTimestamp,
                    lastModified: definition.modificationTimestamp
                };
            })
            // Apply filtering logic.
            .filter(record => {
                let match = true;
                if (!filterOptions.includeInactive && record.status === 'inactive') {
                    match = false;
                }
                if (filterOptions.category && record.category !== filterOptions.category) {
                    match = false;
                }
                return match;
            });

        // Sort the resulting records by their identifier for consistent output.
        filteredRecords.sort((a, b) => a.recordID.localeCompare(b.recordID));

        _consoleLogger.debug(`Retrieved ${filteredRecords.length} record summaries.`);
        return {
            records: filteredRecords,
            totalCount: filteredRecords.length
        };
    };

    // Export the primary service class from this module.
    modModule.exports = AuditTrailSystem;
})(module);