// This module is responsible for managing all interactions with the browser's persistent storage.
var PersistentDataHandler = {

    /**
     * Kicks off the module by attaching event listeners to various UI elements.
     * This method ensures that the application responds to user actions related to data operations.
     */
    initializeComponents: function() {
        // Bind a click event to the 'storage-get' button to initiate data retrieval.
        $('#storage-get').click(function(actionEvt) {
            PersistentDataHandler.retrieveDataItem(); // Call to fetch a specific item.
        });

        // Set up a click handler for the 'storage-set' button to save or update an item.
        $('#storage-set').click(function(actionEvt) {
            PersistentDataHandler.storeDataItem(); // Execute the data storage routine.
        });

        // Attach an event listener to the 'storage-remove' button for deleting entries.
        $('#storage-remove').click(function(actionEvt) {
            PersistentDataHandler.deleteDataItem(); // Proceed with item removal.
        });

        // Configure the click event for 'storage-keys' to display all available keys.
        $('#storage-keys').click(function(actionEvt) {
            PersistentDataHandler.listAllKeys(); // Retrieve and show all keys.
        });
    },

    /**
     * Asynchronously retrieves a single data item from the storage based on its key.
     * The result is then displayed in the corresponding input field.
     */
    retrieveDataItem: function() {
        // Invokes the platform's API to get an item, passing the key from the UI.
        platformBridge.invokeAsync('kango.storage.getItem', $('#storage-key').val(), function(itemVal) {
            // Update the 'storage-value' input with the fetched content or 'null' if not found.
            $('#storage-value').val(itemVal || 'null');
        });
    },

    /**
     * Stores or updates a data item in the persistent storage.
     * Both the key and the value are sourced from the user interface inputs.
     */
    storeDataItem: function() {
        // Makes an asynchronous call to the storage API to set an item.
        platformBridge.invokeAsync('kango.storage.setItem', $('#storage-key').val(), $('#storage-value').val());
    },

    /**
     * Removes a specified data item from the storage.
     * After successful removal, the display value is reset to indicate emptiness.
     */
    deleteDataItem: function() {
        // Uses the asynchronous API to remove an item identified by the current key.
        platformBridge.invokeAsync('kango.storage.removeItem', $('#storage-key').val(), function() {
            // Clears the displayed value in the UI to reflect the item's removal.
            $('#storage-value').val('null');
        });
    },

    /**
     * Fetches all keys currently stored in the persistent storage.
     * The array of keys is then converted to a string and presented to the user.
     */
    listAllKeys: function() {
        // Asynchronously requests a list of all storage keys.
        platformBridge.invokeAsync('kango.storage.getKeys', function(identifierList) {
            // Displays the string representation of the key array in the value input.
            $('#storage-value').val(identifierList.toString());
        });
    }
};

// Attaching a callback to the application's ready event to perform initial setup tasks.
AppEnvironment.onEnvironmentLoaded(function() {
    // Reveal the 'ready' status indicator, confirming the application is fully loaded.
    $('#ready').show();

    // Conceal the 'not-ready' status as the environment is now operational.
    $('#not-ready').hide();

    // Configure a click event handler for the 'close' button to dismiss the current window.
    $('#close').click(function(actionEvt) {
        AppEnvironment.closeCurrentView(); // Invoke the function to close the active interface.
    });

    // Begin the initialization process for the persistent data handling module.
    PersistentDataHandler.initializeComponents();
});