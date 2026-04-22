(function  (pkg) {
    // Acquire the external DataStreamProcessor component.
    var DataStreamProcessor = obtainModule("./LogReader");

    /**
     * Constructor for the StreamAggregator.
     * This class is responsible for managing various data streams and their processing handlers.
     */
    function StreamAggregator() {
        // A collection of active stream processing handlers, keyed by their unique identifiers.
        this.processHandlers = {};
        // A repository of registered data entries, holding metadata about each stream.
        this.dataEntries     = {};
    }

    /**
     * Registers a new data entry into the aggregator.
     * Each entry requires a unique identifier and its source path.
     *
     * @param {string} entryIdentifier    A distinct label for the data entry.
     * @param {string} sourcePath         The physical or logical path to the data source.
     * @param {Function} completionNotifier A callback function invoked upon completion or error.
     * @returns {void}
     */
    StreamAggregator.prototype.registerDataEntry = function (entryIdentifier, sourcePath, completionNotifier) {
        // Check for existing entries to prevent duplicates.
        if (this.dataEntries[entryIdentifier]) {
            return completionNotifier(new Error("Data entry '" + entryIdentifier + "' is already registered with location '" + sourcePath + "'"));
        }

        // Store the new data entry's details.
        this.dataEntries[entryIdentifier] = {
            sourcePath: sourcePath
        };

        // Signal successful registration via the callback.
        completionNotifier();
    };


    /**
     * Assigns a specific category or classification to an already registered data entry.
     *
     * @param {string} entryIdentifier The unique identifier of the data entry to modify.
     * @param {string} entryCategory   The category string to be assigned to the entry.
     * @returns {void}
     */
    StreamAggregator.prototype.assignEntryCategory = function (entryIdentifier, entryCategory) {
        // Only update if the data entry exists.
        if (this.dataEntries[entryIdentifier]) {
            this.dataEntries[entryIdentifier].entryCategory = entryCategory;
        }
    };

    /**
     * Retrieves an existing DataStreamProcessor or creates a new one for a specified data entry.
     *
     * @param {string} entryIdentifier The identifier of the data entry for which to get the processor.
     * @param {Function} completionNotifier The callback to receive the processor instance or an error.
     * @returns {void}
     */
    StreamAggregator.prototype.retrieveStreamProcessor = function (entryIdentifier, completionNotifier) {
        // If no processor is currently associated with this entry identifier.
        if (!this.processHandlers[entryIdentifier]) {
            // Verify that the data entry itself has been defined.
            if (!this.dataEntries[entryIdentifier]) {
                return completionNotifier(new Error("No data entry defined with identifier '" + entryIdentifier + "'"));
            }

            // Instantiate a new DataStreamProcessor using the entry's source path.
            this.processHandlers[entryIdentifier] = new DataStreamProcessor(this.dataEntries[entryIdentifier].sourcePath);
        }

        // Return the (newly created or existing) processor. Using null for no error.
        completionNotifier(null, this.processHandlers[entryIdentifier]);
    };

    /**
     * Lists all currently registered data entries along with their metadata.
     *
     * @returns {Array<Object>} An array of objects, each representing a data entry's summary.
     */
    StreamAggregator.prototype.listDataEntries = function () {
        // Preserve the 'this' context for use within the mapping function.
        var contextInstance = this;

        // Iterate over the keys of registered data entries and transform them into a standardized format.
        return Object.keys(contextInstance.dataEntries).map(function (currentIdentifier) {
            return {
                identifier: currentIdentifier,                                     // The unique identifier for the entry.
                category: contextInstance.dataEntries[currentIdentifier].entryCategory // The assigned category of the entry.
            };
        });
    };

    // Export the StreamAggregator constructor as the primary export of this module.
    pkg.exports = StreamAggregator;
})(module);