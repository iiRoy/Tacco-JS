sensorInputBridge.registerPluginHandler({
    // Internal state management for the plugin host
    _pluginHostRef: null,
    _activeStatus: false, // Indicates if the plugin host is currently active

    // Configuration constants
    pluginHostIdentifier: "tuio_connector_host_element",
    pluginLoadFailureMessage: "Failed to load the interactive sensor plugin.",
    pluginMimeType: "application/x-tuio",

    /**
     * Attempts to create or locate the necessary DOM element for the TUIO plugin.
     * Ensures the element is hidden and ready for plugin interaction.
     * @returns {HTMLElement|null} The plugin host element, or null if creation failed.
     */
    _preparePluginHostElement: function() {
        let hostElement = document.getElementById(this.pluginHostIdentifier);

        if (!hostElement) {
            console.info(`[SensorBridge] Creating new plugin host element: ${this.pluginHostIdentifier}`);
            try {
                hostElement = document.createElement('object');
                hostElement.setAttribute('id', this.pluginHostIdentifier);
                hostElement.setAttribute('type', this.pluginMimeType);
                hostElement.setAttribute('data', 'about:blank'); // Prevent immediate content load if possible

                // Apply initial hiding styles
                hostElement.style.cssText = 'display: none !important; width: 0px; height: 0px; overflow: hidden; position: absolute; left: -9999px; top: -9999px;';

                // Provide a fallback message for browsers that don't support the object type
                const fallbackText = document.createTextNode(this.pluginLoadFailureMessage);
                hostElement.appendChild(fallbackText);

                // Append to a specific container if available, otherwise directly to body
                const container = document.querySelector('#sensor-plugin-container') || document.body;
                container.appendChild(hostElement);

                console.log(`[SensorBridge] Plugin host element "${this.pluginHostIdentifier}" created and appended.`);
            } catch (err) {
                console.error(`[SensorBridge] Error creating plugin host element: ${err.message}`);
                return null;
            }
        } else {
            console.info(`[SensorBridge] Plugin host element "${this.pluginHostIdentifier}" already exists.`);
            // Ensure existing element is hidden if it wasn't already
            hostElement.style.cssText = 'display: none !important; width: 0px; height: 0px; overflow: hidden; position: absolute; left: -9999px; top: -9999px;';
        }
        return hostElement;
    },

    /**
     * Initializes the TUIO plugin host.
     * This method ensures the DOM element for the plugin is present and hidden.
     * It prevents multiple initializations.
     */
    initialize: function() {
        if (this._activeStatus && this._pluginHostRef) {
            console.warn("[SensorBridge] Plugin host already initialized. Skipping.");
            return;
        }

        const hostElement = this._preparePluginHostElement();

        if (hostElement) {
            this._pluginHostRef = hostElement;
            this._activeStatus = true;
            console.log("[SensorBridge] TUIO plugin host successfully initialized.");
        } else {
            this._activeStatus = false;
            this._pluginHostRef = null;
            console.error("[SensorBridge] Failed to initialize TUIO plugin host.");
        }
    },

    /**
     * Terminates the TUIO plugin host.
     * This removes the plugin's DOM element from the document.
     */
    terminate: function() {
        if (!this._activeStatus || !this._pluginHostRef) {
            console.info("[SensorBridge] Plugin host not active or already terminated. No action needed.");
            return;
        }

        try {
            const parentNode = this._pluginHostRef.parentNode;
            if (parentNode) {
                parentNode.removeChild(this._pluginHostRef);
                console.log(`[SensorBridge] Plugin host element "${this.pluginHostIdentifier}" removed from DOM.`);
            } else {
                console.warn(`[SensorBridge] Plugin host element "${this.pluginHostIdentifier}" has no parent to remove from.`);
            }
        } catch (err) {
            console.error(`[SensorBridge] Error removing plugin host element: ${err.message}`);
        } finally {
            this._pluginHostRef = null;
            this._activeStatus = false;
            console.log("[SensorBridge] TUIO plugin host terminated.");
        }
    },

    /**
     * Placeholder for processing sensor events received from the plugin.
     * In a real scenario, this would dispatch custom events or update internal state.
     */
    processSensorEvent: function(eventType, sessionIdentifier, objectIdentifier, xCoordinate, yCoordinate, rotationAngle) {
        // Basic validation for incoming data
        if (typeof eventType !== 'string' || typeof sessionIdentifier !== 'number' || isNaN(xCoordinate) || isNaN(yCoordinate)) {
            console.error("[SensorBridge] Received invalid sensor event data. Skipping processing.");
            return;
        }

        // For Type III, we can add a log or a simple dispatch mechanism.
        // sensorInputBridge.dispatchEvent(new CustomEvent('sensorInput', {
        //     detail: { eventType, sessionIdentifier, objectIdentifier, xCoordinate, yCoordinate, rotationAngle }
        // }));
        console.debug(`[SensorBridge] Processing event: ${eventType}, SID:${sessionIdentifier}, FID:${objectIdentifier}, Pos:(${xCoordinate},${yCoordinate}), Angle:${rotationAngle}`);

        // Original functionality: calling a generic callback.
        // Assuming sensorInputBridge.inputCallback is the equivalent of tuio.callback
        if (typeof sensorInputBridge.inputCallback === 'function') {
            sensorInputBridge.inputCallback(eventType, sessionIdentifier, objectIdentifier, xCoordinate, yCoordinate, rotationAngle);
        } else {
            console.warn("[SensorBridge] No inputCallback function registered to handle sensor events.");
        }
    }
});

/**
 * Global callback function for TUIO events.
 * This function serves as an entry point from the native TUIO plugin (e.g., via browser's global scope).
 * It delegates the actual processing to the sensorInputBridge's internal handler.
 * @param {string} evtType - The type of TUIO event (e.g., 'add', 'update', 'remove').
 * @param {number} sessionID - The session ID of the TUIO object.
 * @param {number} objectID - The ID of the specific TUIO object (finger/blob).
 * @param {number} posX - The X-coordinate of the TUIO object (normalized 0-1).
 * @param {number} posY - The Y-coordinate of the TUIO object (normalized 0-1).
 * @param {number} rotationRad - The rotation angle in radians (for 'update' events).
 */
function globalSensorInputHandler(evtType, sessionID, objectID, posX, posY, rotationRad) {
    // Adding a simple guard to ensure the bridge is ready before processing.
    if (!sensorInputBridge || typeof sensorInputBridge.processSensorEvent !== 'function') {
        console.error("[SensorBridge] Global handler called, but sensorInputBridge is not ready or missing 'processSensorEvent'.");
        return;
    }

    // Delegate to the encapsulated processing logic within the bridge.
    sensorInputBridge.processSensorEvent(evtType, sessionID, objectID, posX, posY, rotationRad);
}