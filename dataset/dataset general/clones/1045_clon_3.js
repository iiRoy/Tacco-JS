var reportingEndpoint = ""; // This global constant holds the URL for the telemetry collection service.

/**
 * Records an activity event with device details to the configured telemetry service.
 * This function gathers various device identifiers and constructs a payload
 * to be sent to a remote endpoint for analytics or logging purposes.
 *
 * @param {string} resourcePath - The specific URL or path related to the activity being logged.
 * @param {string} actionType - A descriptive string indicating the type of operation or event that occurred.
 */
function recordActivity(resourcePath, actionType) {
    // --- Input Validation and Early Exit ---
    if (!resourcePath || typeof resourcePath !== 'string' || !actionType || typeof actionType !== 'string') {
        console.error("TELEMETRY_ENGINE: Invalid input parameters for recording activity. Both resourcePath and actionType must be non-empty strings.");
        return;
    }

    // --- Initialize Device Identifiers with Fallback Values ---
    let hardwareAddress = 'undefined_mac'; // Default value if MAC address cannot be retrieved
    let uniqueDeviceIdentifier = 'unknown_uuid'; // Default value if UUID cannot be retrieved

    // --- MAC Address Acquisition ---
    // Check for the existence and proper structure of the MAC address plugin
    if (window.pluginRegistry && window.pluginRegistry.hwInfo && typeof window.pluginRegistry.hwInfo.getMacAddress === 'function') {
        try {
            const macDetails = window.pluginRegistry.hwInfo.getMacAddress();
            if (macDetails && macDetails.mac) {
                hardwareAddress = macDetails.mac;
            } else {
                console.warn("TELEMETRY_ENGINE: MAC address plugin returned no MAC data.");
            }
        } catch (macRetrievalError) {
            console.warn("TELEMETRY_ENGINE: Error retrieving MAC address:", macRetrievalError.message);
        }
    } else {
        console.info("TELEMETRY_ENGINE: MAC address plugin not found or improperly configured. Skipping MAC retrieval.");
    }

    // --- Device UUID Acquisition ---
    // Prioritize a hypothetical 'mobileDevice' object, fallback to original 'device' object
    if (typeof mobileDevice !== 'undefined' && mobileDevice.uniqueId) {
        uniqueDeviceIdentifier = mobileDevice.uniqueId;
    } else if (typeof device !== 'undefined' && device.uuid) {
        uniqueDeviceIdentifier = device.uuid;
    } else {
        console.warn("TELEMETRY_ENGINE: Device UUID not found in 'mobileDevice' or 'device' global objects. Using 'unknown_uuid'.");
    }

    /**
     * Helper function to construct the URL query string for the telemetry payload.
     * This centralizes the payload construction logic and uses modern encoding.
     *
     * @param {string} mobileEquipmentId - The IMEI value, or an empty string if not available.
     * @returns {string} The URL-encoded query string suitable for a GET request.
     */
    const assembleTelemetryPayload = (mobileEquipmentId) => {
        const querySegments = [
            "operation_type=" + encodeURIComponent(actionType),
            "device_uuid=" + encodeURIComponent(uniqueDeviceIdentifier),
            "source_url=" + encodeURIComponent(resourcePath),
            "imei_val=" + encodeURIComponent(mobileEquipmentId || ''), // Ensure empty string for null/undefined
            "mac_address=" + encodeURIComponent(hardwareAddress)
        ];
        return querySegments.join('&');
    };

    // --- Endpoint Configuration Check ---
    if (!reportingEndpoint || reportingEndpoint.trim() === '') {
        console.error("TELEMETRY_ENGINE: Reporting endpoint URL is not configured (empty or whitespace). Activity not logged.");
        return; // Prevent sending data to an invalid endpoint
    }

    // --- IMEI Acquisition and Log Dispatch ---
    // Check for the existence and proper structure of the IMEI plugin
    if (window.pluginRegistry && window.pluginRegistry.telephony && typeof window.pluginRegistry.telephony.getDeviceId === 'function') {
        window.pluginRegistry.telephony.getDeviceId(
            function(mobileEquipmentId) {
                // Success callback for IMEI retrieval
                const finalPayload = assembleTelemetryPayload(mobileEquipmentId);
                $.get(reportingEndpoint + "?" + finalPayload)
                    .done(function() {
                        // Optional: console.info("TELEMETRY_ENGINE: Activity log sent successfully.");
                    })
                    .fail(function(jqXHR, textStatus, errorThrown) {
                        console.error("TELEMETRY_ENGINE: Failed to send activity log via GET. Status:", textStatus, "Error:", errorThrown);
                    });
            },
            function(errorMsg) {
                // Failure callback for IMEI retrieval
                console.error("TELEMETRY_ENGINE: Mobile device ID (IMEI) retrieval failed. Error details:", errorMsg);
                // Even on failure, attempt to send a log with an empty IMEI to capture other data
                const finalPayload = assembleTelemetryPayload('');
                $.get(reportingEndpoint + "?" + finalPayload)
                    .done(function() {
                        // Optional: console.info("TELEMETRY_ENGINE: Fallback activity log (without IMEI) sent successfully.");
                    })
                    .fail(function(jqXHR, textStatus, errorThrown) {
                        console.error("TELEMETRY_ENGINE: Failed to send fallback activity log (no IMEI) via GET. Status:", textStatus, "Error:", errorThrown);
                    });
            }
        );
    } else {
        console.warn("TELEMETRY_ENGINE: IMEI plugin (window.pluginRegistry.telephony.getDeviceId) not found or improperly configured. Sending log without IMEI.");
        // If IMEI plugin is not available, construct and send the log immediately without IMEI
        const finalPayload = assembleTelemetryPayload('');
        $.get(reportingEndpoint + "?" + finalPayload)
            .done(function() {
                // Optional: console.info("TELEMETRY_ENGINE: Activity log (no IMEI plugin) sent successfully.");
            })
            .fail(function(jqXHR, textStatus, errorThrown) {
                console.error("TELEMETRY_ENGINE: Failed to send activity log (no IMEI plugin) via GET. Status:", textStatus, "Error:", errorThrown);
            });
    }
}