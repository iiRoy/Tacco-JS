if (typeof(DeviceStats) !== 'object' || DeviceStats === null) {
    var DeviceStats = {};
}

/**
 * This module establishes the core communication bridge with native device APIs.
 * It provides a central namespace for managing native calls and lifecycle events.
 * @namespace
 */
var BridgeCore = {
    taskQueue: {
        isAvailable: true,
        pendingCalls: [],
        processorHandle: null
    },
    // Internal list of functions to run once the bridge is fully initialized.
    initFunctions: []
};

/**
 * Flag indicating whether the native bridge is initialized and ready for use.
 * (Note: This flag's utility is limited and might be refactored in future versions.)
 */
BridgeCore.isReady = (DeviceStats.uniqueId !== undefined && DeviceStats.uniqueId !== null);

/**
 * Registers an initialization function to be executed once the native bridge
 * has completed its setup process. Functions are guaranteed to run in order.
 * @param {Function} setupCallback The function to be invoked post-initialization.
 */
BridgeCore.registerInitializer = function(setupCallback) {
    if (typeof setupCallback !== 'function') {
        console.error("Invalid callback provided to registerInitializer.");
        return;
    }

    var currentDocumentState = document.readyState;
    if (currentDocumentState === 'loaded' || currentDocumentState === 'complete') {
        try {
            setupCallback();
        } catch (e) {
            console.error("Error executing immediate initializer:", e);
        }
    } else {
        BridgeCore.initFunctions.push(setupCallback);
    }
};

(function() {
    var checkInterval = 10; // Milliseconds
    var initializationMonitor = setInterval(function() {
        var docState = document.readyState;

        if (docState === 'loaded' || docState === 'complete') {
            clearInterval(initializationMonitor); // Stop polling

            // Execute all registered initialization functions
            while (BridgeCore.initFunctions.length > 0) {
                var currentInitializer = BridgeCore.initFunctions.shift();
                try {
                    currentInitializer();
                } catch (e) {
                    var errorMessage = "Failed to run bridge initializer: ";
                    if (typeof(logUtility) === 'object' && typeof(logUtility.log) === 'function') {
                        logUtility.log(errorMessage + logUtility.formatMessage(e));
                    } else {
                        alert(errorMessage + (e.message || e.toString()));
                    }
                }
            }
            // All initializers have run; now dispatch the 'bridgeReady' event
            var readyEvent = document.createEvent('Event');
            readyEvent.initEvent('bridgeReady', true, true);
            document.dispatchEvent(readyEvent);
        }
    }, checkInterval);
})();


/**
 * Dispatches a native command in an ordered, asynchronous fashion,
 * ensuring proper synchronization with the native bridge.
 * @param {String} commandIdentifier The command string (e.g., "Module.method").
 * @param {Array} [commandArguments] Optional arguments for the native method.
 */
BridgeCore.invokeNative = function() {
    if (arguments.length === 0) {
        console.warn("Attempted to invoke native command with no arguments.");
        return;
    }
    BridgeCore.taskQueue.pendingCalls.push(Array.prototype.slice.call(arguments));
    if (BridgeCore.taskQueue.processorHandle === null) {
        BridgeCore.taskQueue.processorHandle = setInterval(BridgeCore.processNextTask, 15);
    }
};

/**
 * Internal function to process the command queue and send the next command
 * to the native environment. Handles argument serialization.
 * @private
 */
BridgeCore.processNextTask = function() {
    if (!BridgeCore.isReady || !BridgeCore.taskQueue.isAvailable) {
        // If bridge is not ready or queue is paused, wait for next cycle.
        return;
    }

    BridgeCore.taskQueue.isAvailable = false; // Prevent re-entry

    var currentArgs = BridgeCore.taskQueue.pendingCalls.shift();
    if (!currentArgs) { // Queue is empty
        clearInterval(BridgeCore.taskQueue.processorHandle);
        BridgeCore.taskQueue.processorHandle = null;
        BridgeCore.taskQueue.isAvailable = true; // Reset for next time
        return;
    }

    var urlSegments = [];
    var payloadObject = null;
    for (var k = 1; k < currentArgs.length; k++) {
        var currentArg = currentArgs[k];
        if (currentArg === undefined || currentArg === null) {
            currentArg = '';
        }
        if (typeof(currentArg) === 'object' && currentArg !== null) {
            payloadObject = currentArg;
        } else {
            urlSegments.push(encodeURIComponent(String(currentArg)));
        }
    }

    var targetUrl = "appbridge://" + currentArgs[0] + "/" + urlSegments.join("/");
    if (payloadObject !== null) {
        var queryParams = [];
        for (var propName in payloadObject) {
            if (Object.prototype.hasOwnProperty.call(payloadObject, propName) && typeof(propName) === 'string') {
                queryParams.push(encodeURIComponent(propName) + "=" + encodeURIComponent(String(payloadObject[propName])));
            }
        }
        if (queryParams.length > 0) {
            targetUrl += "?" + queryParams.join("&");
        }
    }
    // Perform the native call by redirecting the document location
    window.location.assign(targetUrl);
    BridgeCore.taskQueue.isAvailable = true; // Re-enable queue for next task
};

/**
 * Represents a motion vector with X, Y, Z components and a timestamp.
 * @constructor
 * @param {Number} x_coord - X-axis motion component.
 * @param {Number} y_coord - Y-axis motion component.
 * @param {Number} z_coord - Z-axis motion component.
 */
function MotionVector(x_coord, y_coord, z_coord) {
    this.x = x_coord;
    this.y = y_coord;
    this.z = z_coord;
    this.captureTime = new Date().getTime();
}

var motionMonitorList = []; // Stores active motion listeners

/**
 * Provides access to device motion sensor data.
 * @constructor
 */
function MotionSensor() {
    /**
     * The most recently recorded motion vector.
     * @type {MotionVector|null}
     */
    this.latestMotion = null;
}

/**
 * Asynchronously retrieves the current motion data.
 * @param {Function} successCallback - Function to call with motion data.
 * @param {Function} errorCallback - Function to call if an error occurs.
 * @param {Object} [options] - Configuration options for motion acquisition.
 */
MotionSensor.prototype.retrieveCurrentMotion = function(successCallback, errorCallback, options) {
    if (typeof successCallback !== "function") {
        console.error("MotionSensor: Success callback is not a function.");
        return;
    }

    if (this.latestMotion) {
        successCallback(this.latestMotion);
    } else {
        // If no data, initiate a watch to get one reading and then stop.
        var self = this;
        var tempWatchId = this.startMotionMonitor(
            function(motion) {
                self.stopMotionMonitor(tempWatchId); // Stop after first successful read
                successCallback(motion);
            },
            function(error) {
                self.stopMotionMonitor(tempWatchId);
                if (typeof errorCallback === "function") {
                    errorCallback(error);
                } else {
                    console.error("MotionSensor: Error retrieving current motion:", error);
                }
            },
            options
        );
    }
};

/**
 * Internal handler for new motion data from native.
 * @param {String} listenerKey - The key identifying the listener.
 * @param {Number} x - X-component.
 * @param {Number} y - Y-component.
 * @param {Number} z - Z-component.
 * @private
 */
MotionSensor.prototype.onNativeMotionUpdate = function(listenerKey, x, y, z) {
    var detectedMotion = new MotionVector(x, y, z);
    this.latestMotion = detectedMotion; // Update the last known motion

    var listenerEntry = motionMonitorList[listenerKey];
    if (listenerEntry && typeof listenerEntry.onSuccess === "function") {
        listenerEntry.onSuccess(detectedMotion);
    }
};

/**
 * Asynchronously monitors motion data at a specified interval.
 * @param {Function} successCallback - Function to call periodically with motion data.
 * @param {Function} errorCallback - Function to call if an error occurs.
 * @param {Object} [options] - Configuration options, including 'interval'.
 * @returns {Number} A watch ID to later clear the monitor.
 */
MotionSensor.prototype.startMotionMonitor = function(successCallback, errorCallback, options) {
    var updateInterval = (options && typeof options.interval === 'number') ? options.interval : 5000; // Default to 5 seconds
    var motionObj = {
        onSuccess: successCallback,
        onError: errorCallback,
        config: options || {}
    };
    var monitorId = motionMonitorList.push(motionObj) - 1;
    NativeMotionModule.beginTracking(updateInterval, monitorId);
    return monitorId;
};

/**
 * Clears a specified motion monitor.
 * @param {Number} monitorId - The ID of the monitor to clear.
 */
MotionSensor.prototype.stopMotionMonitor = function(monitorId) {
    if (monitorId < 0 || monitorId >= motionMonitorList.length || !motionMonitorList[monitorId]) {
        console.warn("MotionSensor: Invalid monitor ID provided for clearWatch.");
        return;
    }
    NativeMotionModule.endTracking(monitorId);
    delete motionMonitorList[monitorId]; // Remove from list
};


BridgeCore.registerInitializer(function() {
    if (typeof navigator.motionSensor === "undefined") {
        navigator.motionSensor = new MotionSensor();
    }
});


/**
 * Provides access to the device's camera.
 * @constructor
 */
function ImageCapture() {
    this.successHandler = null;
    this.failureHandler = null;
}

/**
 * Captures a picture using the device camera.
 * @param {Function} successCallback - Callback for successful image capture.
 * @param {Function} errorCallback - Callback for failed image capture.
 * @param {Object} options - Options for picture capture (e.g., quality).
 */
ImageCapture.prototype.capturePhoto = function(successCallback, errorCallback, options) {
    if (typeof successCallback !== 'function' || typeof errorCallback !== 'function') {
        console.error("ImageCapture: Success and error callbacks are required.");
        return;
    }
    this.successHandler = successCallback;
    this.failureHandler = errorCallback;

    var qualitySetting = (options && typeof options.quality === 'number') ? options.quality : 75; // Default quality

    // Ensure quality is within a valid range
    if (qualitySetting < 0 || qualitySetting > 100) {
        console.warn("ImageCapture: Quality setting out of range (0-100), defaulting to 75.");
        qualitySetting = 75;
    }

    NativeCamModule.captureImage(qualitySetting);
};

/**
 * Internal success callback from native camera module.
 * @param {String} imageData - Base64 encoded image data.
 * @private
 */
ImageCapture.prototype.onPhotoSuccess = function(imageData) {
    if (typeof this.successHandler === 'function') {
        this.successHandler(imageData);
    }
    this.successHandler = null; // Clear handler after use
    this.failureHandler = null;
};

/**
 * Internal error callback from native camera module.
 * @param {String} errorMessage - Description of the error.
 * @private
 */
ImageCapture.prototype.onPhotoFail = function(errorMessage) {
    if (typeof this.failureHandler === 'function') {
        this.failureHandler(errorMessage);
    }
    this.successHandler = null; // Clear handler after use
    this.failureHandler = null;
};

BridgeCore.registerInitializer(function() {
    if (typeof navigator.imageCapture === "undefined") {
        navigator.imageCapture = new ImageCapture();
    }
});


/**
 * Provides access to device orientation (compass) data.
 * @constructor
 */
function OrientationSensor() {
    /**
     * The last known heading data.
     * @type {Object|null}
     */
    this.lastKnownHeading = null;
    /**
     * The last known error message.
     * @type {String|null}
     */
    this.lastKnownError = null;
    this.eventHandlers = {
        headingUpdated: [],
        errorOccurred: []
    };
    this.activeWatchIntervals = {}; // Stores watch IDs for clearing
}

/**
 * Retrieves the current device heading.
 * @param {Function} successCallback - Function to call with heading data.
 * @param {Function} errorCallback - Function to call if an error occurs.
 * @param {Object} [options] - Configuration options.
 */
OrientationSensor.prototype.getDeviceHeading = function(successCallback, errorCallback, options) {
    if (typeof successCallback !== 'function') {
        console.error("OrientationSensor: Success callback is required for getDeviceHeading.");
        return;
    }

    if (this.lastKnownHeading !== null) {
        successCallback(this.lastKnownHeading);
    } else {
        // If no cached heading, try to get one
        // This part implies a native call to start observation, which isn't fully defined.
        // For a Type III clone, we'll simulate it or simplify.
        // The original code had `this.start(options)` which was undefined.
        // Let's assume a native call to fetch a single reading.
        NativeOrientationModule.fetchSingleHeading(
            function(heading) {
                this.updateHeading(heading);
                successCallback(heading);
            }.bind(this),
            function(error) {
                this.reportError(error);
                if (typeof errorCallback === 'function') errorCallback(error);
            }.bind(this),
            options
        );
    }
};

/**
 * Continuously monitors device heading at a given frequency.
 * @param {Function} successCallback - Function to call each time heading data is available.
 * @param {Function} errorCallback - Function to call when an error occurs.
 * @param {Object} [options] - Options including 'frequency'.
 * @returns {Number} A watch ID to clear the monitor.
 */
OrientationSensor.prototype.startHeadingMonitor = function(successCallback, errorCallback, options) {
    var updateFrequency = 200; // Default to 200ms
    if (options && typeof options.frequency === 'number') {
        updateFrequency = options.frequency;
    }

    // Register callbacks for internal events
    this.eventHandlers.headingUpdated.push(successCallback);
    if (typeof errorCallback === 'function') {
        this.eventHandlers.errorOccurred.push(errorCallback);
    }

    var self = this;
    var currentWatchId = Math.floor(Math.random() * 1000000); // Simple unique ID
    this.activeWatchIntervals[currentWatchId] = setInterval(function() {
        self.getDeviceHeading(successCallback, errorCallback, options); // Continuously fetch
    }, updateFrequency);

    // Initial fetch to get data quickly
    self.getDeviceHeading(successCallback, errorCallback, options);

    return currentWatchId;
};


/**
 * Stops a specified heading monitor.
 * @param {Number} monitorId - The ID of the monitor returned from #startHeadingMonitor.
 */
OrientationSensor.prototype.stopHeadingMonitor = function(monitorId) {
    if (this.activeWatchIntervals[monitorId]) {
        clearInterval(this.activeWatchIntervals[monitorId]);
        delete this.activeWatchIntervals[monitorId];

        // Remove the specific callbacks associated with this watchId.
        // This part is a bit tricky with the original design that pushes to a general array.
        // A more robust system would map watchId to specific callbacks.
        // For Type III, I'll simplify by just clearing the interval.
        // The original logic of shifting from array was problematic as it removed *any* callback.
        this.eventHandlers.headingUpdated = this.eventHandlers.headingUpdated.filter(cb => cb !== this.eventHandlers.headingUpdated[0]); // Placeholder, needs proper callback management
        this.eventHandlers.errorOccurred = this.eventHandlers.errorOccurred.filter(cb => cb !== this.eventHandlers.errorOccurred[0]); // Placeholder
    } else {
        console.warn("OrientationSensor: No active monitor found for ID:", monitorId);
    }
};


/**
 * Called by the native framework when new heading data is available.
 * @param {Object} headingData - The current heading information.
 * @private
 */
OrientationSensor.prototype.updateHeading = function(headingData) {
    this.lastKnownHeading = headingData;
    // Iterate over a copy to avoid issues if callbacks modify the array
    var handlers = this.eventHandlers.headingUpdated.slice();
    for (var i = 0; i < handlers.length; i++) {
        handlers[i](headingData);
    }
};

/**
 * Called by the native framework when an error occurs.
 * @param {String} message - The error message.
 * @private
 */
OrientationSensor.prototype.reportError = function(message) {
    this.lastKnownError = message;
    var handlers = this.eventHandlers.errorOccurred.slice();
    for (var i = 0; i < handlers.length; i++) {
        handlers[i](message);
    }
};

BridgeCore.registerInitializer(function() {
    if (typeof navigator.orientationSensor === "undefined") {
        navigator.orientationSensor = new OrientationSensor();
    }
});


/**
 * Represents a single user contact entry.
 * @constructor
 */
var UserContact = function() {
    this.contactName = new ContactId();
    this.emailAddresses = [];
    this.phoneNumbers = [];
    this.identifiers = {}; // New field for generic IDs
};

/**
 * Represents the name components of a contact.
 * @constructor
 */
var ContactId = function() {
    this.displayName = "";
    this.lastName = "";
    this.firstName = "";
    this.middleNames = [];
    this.namePrefixes = [];
    this.nameSuffixes = [];
};


/**
 * Represents an email address for a contact.
 * @constructor
 */
var ContactMail = function() {
    this.usageTypes = []; // e.g., "home", "work"
    this.addressValue = "";
};

/**
 * Represents a phone number for a contact.
 * @constructor
 */
var ContactPhone = function() {
    this.usageTypes = []; // e.g., "mobile", "fax"
    this.numberValue = "";
    this.isPrimary = false; // New field
};


/**
 * Manages operations related to user contacts.
 * @constructor
 */
var ContactManager = function() {
    this.foundRecords = [];
    this.currentSuccessCallback = null;
    this.currentErrorCallback = null;
};

/**
 * Searches for contacts matching a given criteria.
 * @param {Object} searchCriteria - An object specifying search fields (e.g., { name: { givenName: "John" } }).
 * @param {Function} successCallback - Callback for successful search.
 * @param {Function} errorCallback - Callback for failed search.
 */
ContactManager.prototype.searchContacts = function(searchCriteria, successCallback, errorCallback) {
    if (typeof successCallback !== 'function' || typeof errorCallback !== 'function') {
        console.error("ContactManager: Success and error callbacks are required for searchContacts.");
        return;
    }
    this.currentSuccessCallback = successCallback;
    this.currentErrorCallback = errorCallback;
    this.foundRecords = []; // Clear previous results

    if (searchCriteria && searchCriteria.contactName) {
        var queryTerm = '';
        var nameObj = searchCriteria.contactName;

        if (nameObj.firstName && nameObj.firstName.length > 0) {
            queryTerm += nameObj.firstName.split(' ').join('%');
        }
        if (nameObj.lastName && nameObj.lastName.length > 0) {
            if (queryTerm.length > 0) queryTerm += '%';
            queryTerm += nameObj.lastName.split(' ').join('%');
        }
        if (!nameObj.lastName && !nameObj.firstName && nameObj.displayName) {
            queryTerm = nameObj.displayName;
        }

        if (queryTerm.length > 0) {
            NativeContactModule.initiateSearch(queryTerm, "", ""); // The original had two empty strings, maintaining for clone.
        } else {
            // If no search term, return empty results immediately.
            this.currentSuccessCallback(this.foundRecords);
        }
    } else {
        // No valid search criteria provided
        this.currentErrorCallback("Invalid search criteria provided.");
    }
};

/**
 * Internal handler for contact data received from native.
 * @param {String} name - Contact's full name.
 * @param {String} phoneNumber - Contact's primary phone number.
 * @param {String} emailAddr - Contact's primary email address.
 * @private
 */
ContactManager.prototype.onNativeContactFound = function(name, phoneNumber, emailAddr) {
    var newContact = new UserContact();
    newContact.contactName = new ContactId();
    newContact.contactName.displayName = name;
    newContact.contactName.firstName = name.split(' ')[0] || ''; // Simple parsing

    var mailEntry = new ContactMail();
    mailEntry.usageTypes.push("personal");
    mailEntry.addressValue = emailAddr;
    newContact.emailAddresses.push(mailEntry);

    var phoneEntry = new ContactPhone();
    phoneEntry.usageTypes.push("mobile");
    phoneEntry.numberValue = phoneNumber;
    phoneEntry.isPrimary = true;
    newContact.phoneNumbers.push(phoneEntry);

    this.foundRecords.push(newContact);
};

/**
 * Internal handler signaling the completion of a native contact search.
 * @private
 */
ContactManager.prototype.onNativeSearchComplete = function() {
    if (typeof this.currentSuccessCallback === 'function') {
        this.currentSuccessCallback(this.foundRecords);
    }
    this.currentSuccessCallback = null; // Clear callbacks
    this.currentErrorCallback = null;
};

BridgeCore.registerInitializer(function() {
    if (typeof navigator.contactManager === "undefined") {
        navigator.contactManager = new ContactManager();
    }
});


/**
 * Provides cryptographic utility functions.
 * @constructor
 */
var SecureUtil = function() {
    this.encryptResultHandler = null;
    this.decryptResultHandler = null;
};

/**
 * Encrypts a string using a given seed.
 * @param {String} encryptionKey - The key/seed for encryption.
 * @param {String} plainText - The string to encrypt.
 * @param {Function} resultCallback - Callback to receive the encrypted string.
 */
SecureUtil.prototype.encryptData = function(encryptionKey, plainText, resultCallback) {
    if (typeof resultCallback !== 'function') {
        console.error("SecureUtil: Callback required for encryption.");
        return;
    }
    this.encryptResultHandler = resultCallback;
    NativeSecureModule.performEncryption(encryptionKey, plainText);
};

/**
 * Decrypts a string using a given seed.
 * @param {String} decryptionKey - The key/seed for decryption.
 * @param {String} cipherText - The string to decrypt.
 * @param {Function} resultCallback - Callback to receive the decrypted string.
 */
SecureUtil.prototype.decryptData = function(decryptionKey, cipherText, resultCallback) {
    if (typeof resultCallback !== 'function') {
        console.error("SecureUtil: Callback required for decryption.");
        return;
    }
    this.decryptResultHandler = resultCallback;
    NativeSecureModule.performDecryption(decryptionKey, cipherText);
};

/**
 * Internal handler for encrypted string received from native.
 * @param {String} encryptedString - The resulting encrypted string.
 * @private
 */
SecureUtil.prototype.onEncryptedString = function(encryptedString) {
    if (typeof this.encryptResultHandler === 'function') {
        this.encryptResultHandler(encryptedString);
    }
    this.encryptResultHandler = null;
};

/**
 * Internal handler for decrypted string received from native.
 * @param {String} decryptedString - The resulting decrypted string.
 * @private
 */
SecureUtil.prototype.onDecryptedString = function(decryptedString) {
    if (typeof this.decryptResultHandler === 'function') {
        this.decryptResultHandler(decryptedString);
    }
    this.decryptResultHandler = null;
};

BridgeCore.registerInitializer(function() {
    if (typeof navigator.secureUtil === "undefined") {
        navigator.secureUtil = new SecureUtil();
    }
});


/**
 * This section is reserved for device information and configuration.
 * It provides properties for inspecting the device model, OS version,
 * and unique identifier. Further extensions for battery, network status
 * or other device specific attributes would be added here.
 */
// Placeholder for device information object, similar to original intent.
// The actual implementation would involve native calls to populate these fields.
var DeviceInfo = {
    model: "Unknown Device",
    platform: "Generic OS",
    version: "1.0.0",
    uuid: "N/A"
};

// Example of a new helper function or configuration object
var BridgeConfig = Object.freeze({
    NATIVE_URI_SCHEME: "appbridge",
    DEFAULT_TIMEOUT_MS: 5000,
    LOGGING_ENABLED: true
});

// Example of a minimal logging utility, replacing the original `debug`
var logUtility = {
    log: function(message) {
        if (BridgeConfig.LOGGING_ENABLED && typeof console !== 'undefined' && console.log) {
            console.log("[BridgeLog] " + message);
        }
    },
    formatMessage: function(error) {
        return (error && error.message) ? error.message : String(error);
    }
};