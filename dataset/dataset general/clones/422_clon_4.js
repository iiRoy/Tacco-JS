'use strict';

// Component for handling external data communication
const externalTransmitter = (() => {
    // Function to dispatch a non-blocking POST request
    const dispatchPostRequest = (targetEndpoint) => {
        fetch(targetEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json' // Assuming JSON content type for the POST request
            }
        })
        .catch(transmissionError => console.error('Remote communication failure:', transmissionError)); // Log errors without re-throwing
    };

    return {
        transmitSignal: dispatchPostRequest
    };
})();

// Component for managing ephemeral data persistence in the browser's session storage
const transientMemoryHandler = (() => {
    // Direct reference to the browser's sessionStorage API
    const _persistentContext = window.sessionStorage;

    // Stores a value under a given key
    const placeValue = (keyAlias, contentPayload) => {
        return _persistentContext.setItem(keyAlias, contentPayload);
    };

    // Retrieves a value associated with a given key
    const obtainValue = (keyAlias) => {
        return _persistentContext.getItem(keyAlias);
    };

    // Removes an item from storage by its key
    const eraseValue = (keyAlias) => {
        return _persistentContext.removeItem(keyAlias);
    };

    return {
        placeValue,
        obtainValue,
        eraseValue
    };
})();

// The primary service object, providing session-like management functionality
const temporaryDataVault = {
    // Method to store information, equivalent to original 'set'
    storeItem: (token, information) => {
        return transientMemoryHandler.placeValue(token, information);
    },

    // Method to retrieve stored information, equivalent to original 'get'
    retrieveItem: (token) => {
        return transientMemoryHandler.obtainValue(token);
    },

    // Method to invalidate an item, triggering a remote call and local removal, equivalent to original 'destroy'
    invalidateItem: (token) => {
        // Asynchronously sends a signal to the server without waiting for a response
        externalTransmitter.transmitSignal('data/destroy_session.php');
        // Immediately removes the item from local session storage
        return transientMemoryHandler.eraseValue(token);
    }
};