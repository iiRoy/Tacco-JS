const DataPersistenceHandler = {

    // Internal registry for frequently referenced DOM elements,
    // enhancing performance and code clarity by caching selectors.
    _uiElementsCache: {},

    // A constant string representation for when a storage item has no value,
    // making UI output more consistent and user-friendly.
    _NO_VALUE_INDICATOR: '[No Data Found]',

    // A private logging utility to centralize console output,
    // aiding in debugging and activity tracking.
    // @param {string} msg - The message to be logged.
    _recordOperation: function(msg) {
        console.info(`[AppStorageMgr] ${new Date().toLocaleTimeString()}: ${msg}`);
    },

    // A generalized asynchronous Kango storage interaction method.
    // This abstracts the direct `kango.invokeAsync` calls, providing
    // a single point for handling storage operations and error checks.
    // @param {string} apiMethodName - The specific Kango storage API method to invoke (e.g., 'kango.storage.getItem').
    // @param {string} [storageKey=''] - The identifier for the stored data.
    // @param {any} [payloadValue=undefined] - The data to be stored. Relevant for 'setItem'.
    // @param {Function} [onCompletion=() => {}] - Callback function executed upon successful API response.
    _processKangoStorageCall: function(apiMethodName, storageKey = '', payloadValue = undefined, onCompletion = () => {}) {
        this._recordOperation(`Initiating storage call: ${apiMethodName} for key: "${storageKey}"`);

        // Essential check to ensure KangoAPI is available before proceeding.
        if (typeof kango === 'undefined' || typeof kango.invokeAsync !== 'function') {
            console.error('KangoAPI runtime is unavailable. Storage operations cannot proceed.');
            alert('Application error: Storage service not ready.');
            return;
        }

        // Dynamically construct arguments based on the invoked Kango storage method.
        let methodArguments = [apiMethodName];
        if (apiMethodName === 'kango.storage.setItem') {
            methodArguments.push(storageKey, payloadValue, onCompletion);
        } else if (apiMethodName === 'kango.storage.getItem' || apiMethodName === 'kango.storage.removeItem') {
            methodArguments.push(storageKey, onCompletion);
        } else if (apiMethodName === 'kango.storage.getKeys') {
            methodArguments.push(onCompletion);
        } else {
            console.warn(`Unsupported storage API method requested: ${apiMethodName}`);
            alert('Storage operation failed: Invalid method.');
            return;
        }

        // Execute the asynchronous Kango API method.
        kango.invokeAsync(...methodArguments);
    },

    // Sets up all event handling for user interface components
    // that control data persistence operations.
    initializeUserInterface: function() {
        // Guard clause: Ensure jQuery is loaded before attempting DOM manipulation.
        if (typeof $ === 'undefined') {
            console.error('jQuery library is not present. UI initialization aborted.');
            return;
        }

        // Cache essential DOM elements for efficient access.
        this._uiElementsCache = {
            keyInput: $('#storage-key'),
            valueInput: $('#storage-value'),
            fetchBtn: $('#storage-get'),
            saveBtn: $('#storage-set'),
            deleteBtn: $('#storage-remove'),
            listKeysBtn: $('#storage-keys')
        };

        // Attach click event handlers to all interactive buttons.
        // Each handler prevents default actions and invokes a specific storage function.
        this._uiElementsCache.fetchBtn.on('click', (domEvent) => {
            domEvent.preventDefault();
            this.retrieveStoredValue();
        });

        this._uiElementsCache.saveBtn.on('click', (domEvent) => {
            domEvent.preventDefault();
            this.persistValue();
        });

        this._uiElementsCache.deleteBtn.on('click', (domEvent) => {
            domEvent.preventDefault();
            this.removeStoredEntry();
        });

        this._uiElementsCache.listKeysBtn.on('click', (domEvent) => {
            domEvent.preventDefault();
            this.displayAllKeys();
        });

        this._recordOperation('UI components and event handlers successfully initialized.');
    },

    // Retrieves a data item from Kango storage using the key from the UI.
    // The result is then rendered in the value input field.
    retrieveStoredValue: function() {
        const queryKey = this._uiElementsCache.keyInput.val().trim();

        // Input validation: Ensure a key is provided for retrieval.
        if (!queryKey) {
            alert('Please specify a key to retrieve data.');
            this._recordOperation('Attempted to retrieve data with an empty key.');
            return;
        }

        this._processKangoStorageCall('kango.storage.getItem', queryKey, undefined, (fetchedData) => {
            // Display the retrieved data or the 'no value' indicator.
            const displayOutput = (fetchedData !== null && fetchedData !== undefined)
                ? fetchedData
                : this._NO_VALUE_INDICATOR;
            this._uiElementsCache.valueInput.val(displayOutput);
            this._recordOperation(`Data for key "${queryKey}" fetched: "${displayOutput}"`);
        });
    },

    // Stores a key-value pair into Kango storage, taking inputs from the UI.
    // Includes validation checks for both key and value.
    persistValue: function() {
        const storageKey = this._uiElementsCache.keyInput.val().trim();
        const itemValue = this._uiElementsCache.valueInput.val(); // Do not trim value, empty string is valid.

        // Input validation: Key must not be empty.
        if (!storageKey) {
            alert('A valid key must be supplied to save data.');
            this._recordOperation('Attempted to save data with an empty key.');
            return;
        }

        // User confirmation for saving an empty value.
        if (itemValue === '' && !confirm('The value field is empty. Proceed to save an empty string for this key?')) {
            this._recordOperation('User cancelled saving an empty value.');
            return;
        }

        this._processKangoStorageCall('kango.storage.setItem', storageKey, itemValue, () => {
            alert('Data successfully persisted!');
            this._recordOperation(`Key-value pair saved: "${storageKey}" = "${itemValue}"`);
        });
    },

    // Deletes a specific entry from Kango storage based on the provided key.
    // The value input field is updated to reflect the removal.
    removeStoredEntry: function() {
        const targetKey = this._uiElementsCache.keyInput.val().trim();

        // Input validation: A key is required for removal.
        if (!targetKey) {
            alert('Please provide a key to delete an entry.');
            this._recordOperation('Attempted to remove data with an empty key.');
            return;
        }

        this._processKangoStorageCall('kango.storage.removeItem', targetKey, undefined, () => {
            this._uiElementsCache.valueInput.val(this._NO_VALUE_INDICATOR);
            alert('Storage entry removed successfully!');
            this._recordOperation(`Entry for key "${targetKey}" has been removed.`);
        });
    },

    // Retrieves and displays all available keys from Kango storage.
    // The keys are presented in a formatted JSON string in the value input field.
    displayAllKeys: function() {
        this._processKangoStorageCall('kango.storage.getKeys', '', undefined, (retrievedKeysArray) => {
            // Format the array of keys into a readable JSON string for display.
            const formattedKeys = JSON.stringify(retrievedKeysArray || [], null, 2); // Pretty print if array, default to empty array.
            this._uiElementsCache.valueInput.val(formattedKeys);
            this._recordOperation(`All storage keys retrieved: ${formattedKeys}`);
        });
    }
};

// Main application entry point, executed once the KangoAPI environment is fully prepared.
KangoAPI.onReady(function() {
    // Critical pre-flight checks for essential dependencies.
    if (typeof $ === 'undefined') {
        console.error("jQuery library is not available. UI elements cannot be manipulated.");
        return;
    }
    if (typeof KangoAPI === 'undefined' || typeof KangoAPI.closeWindow !== 'function') {
        console.error("KangoAPI core functions are not fully loaded. Window closing may fail.");
        return;
    }

    // Cache the status and control elements for efficient access.
    const readyStatusDisplay = $('#ready');
    const notReadyStatusDisplay = $('#not-ready');
    const appCloseButton = $('#close');

    // Adjust visibility of status indicators.
    readyStatusDisplay.show();
    notReadyStatusDisplay.hide();

    // Attach event handler for the application's close button.
    appCloseButton.on('click', (interactionEvent) => {
        interactionEvent.preventDefault(); // Prevent default browser action.
        KangoAPI.closeWindow(); // Invoke KangoAPI to close the current browser window/tab.
        console.log('Application window close requested.');
    });

    // Initialize the primary data persistence management component.
    DataPersistenceHandler.initializeUserInterface();

    console.log('KangoAPI application environment is fully prepared and running.');
});