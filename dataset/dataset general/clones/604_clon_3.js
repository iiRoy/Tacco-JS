/*
* BinaryDataTransmitter - A specialized MooTools Request extension for uploading binary payloads.
* This module facilitates the transmission of Blob or File objects to a server endpoint.
*
* Licensed under a permissive open-source license.
*
* Authors:
*  Arian Stolwijk
*  Djamil Legato
*  Juan Lago
*  Mateusz Cyrankiewicz
*  [Additional contributor for Type III refactoring]
*
* Dependencies:
*  - MooTools Core (specifically Request class)
*
* Original inspiration/credits: https://gist.github.com/a77b537e729aff97429c
*/
(function(){

    // Determine if the browser's XMLHttpRequest object supports upload progress events.
    // This check ensures we only attach handlers if the feature is available.
    const canTrackUploadProgress = ('onprogress' in new Browser.Request());

    // Define the BinaryDataTransmitter class, extending the base MooTools Request class.
    Request.BinaryDataTransmitter = new Class({

        Extends: Request,

        // Default configuration options for the binary data transfer.
        transferSettings: {
            // By default, do not URL-encode data as we are sending binary content.
            urlEncoded: false,
            // Prevent caching of the request to ensure fresh data.
            noCache: true,
            // Disable emulation of HTTP methods for standard binary uploads.
            emulation: false,
            // Default HTTP method for the request.
            method: 'post',
            // Default timeout for the request in milliseconds.
            timeoutDuration: 0 // No timeout by default, will wait indefinitely.
        },
        
        /**
         * Initiates the binary data transfer to the specified target endpoint.
         * @param {Blob|File} dataChunk - The binary data (Blob or File object) to be uploaded.
         * @param {Object} [additionalConfig] - Optional settings to override default transferSettings.
         * @returns {BinaryDataTransmitter} The current instance for method chaining.
         */
        initiateTransfer: function (dataChunk, additionalConfig) {
            // Use a self-reference for consistent context within callbacks.
            const selfReference = this;

            // Pre-flight check: ensure the payload is a valid binary type.
            if (!(dataChunk instanceof Blob || dataChunk instanceof File)) {
                console.error('BinaryDataTransmitter: Invalid payload type. Expected Blob or File.');
                selfReference.fireEvent('error', ['InvalidPayload', 'The provided data is not a Blob or File object.']);
                return this; // Exit early if data is invalid.
            }

            // Merge additional configuration with the default transfer settings.
            Object.merge(selfReference.transferSettings, additionalConfig);

            // Validate that the request can proceed based on internal checks.
            if (!selfReference.check(selfReference.transferSettings)) {
                console.warn('BinaryDataTransmitter: Request check failed, transfer aborted.');
                return this;
            }
            
            // Ensure the success evaluation function is properly set.
            selfReference.transferSettings.isSuccess = selfReference.transferSettings.isSuccess ?? selfReference.isSuccess;
            selfReference.isCurrentlyRunning = true; // Mark the transfer as active.

            // Retrieve and sanitize the target URL and HTTP method.
            let targetEndpoint = String(selfReference.transferSettings.url || document.location.pathname);
            const httpMethod = String(selfReference.transferSettings.method).toUpperCase();

            // Strip any hash fragments from the URL to ensure a clean endpoint.
            const hashFragmentStart = targetEndpoint.indexOf('#');
            if (hashFragmentStart > -1) {
                targetEndpoint = targetEndpoint.substring(0, hashFragmentStart);
            }

            // Append a unique identifier to prevent caching if 'noCache' is true.
            if (selfReference.transferSettings.noCache) {
                targetEndpoint += (targetEndpoint.includes('?') ? '&' : '?') + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
            }

            // Obtain the XMLHttpRequest object for the transfer.
            const internalXHR = selfReference.xhr;
            if (!internalXHR) {
                console.error('BinaryDataTransmitter: XMLHttpRequest object not available.');
                selfReference.fireEvent('error', ['XHRNotAvailable', 'Failed to obtain XMLHttpRequest object.']);
                selfReference.isCurrentlyRunning = false;
                return this;
            }

            // Attach progress event listeners if supported by the browser.
            if (canTrackUploadProgress) {
                internalXHR.onloadstart = () => selfReference.loadstart(); // Using MooTools' internal loadstart
                internalXHR.onprogress = (event) => selfReference.progress(event); // Using MooTools' internal progress
                internalXHR.upload.onprogress = (event) => selfReference.progress(event); // Upload specific progress
            }
            
            // Open the HTTP connection.
            internalXHR.open(
                httpMethod,
                targetEndpoint,
                selfReference.transferSettings.async,
                selfReference.transferSettings.user,
                selfReference.transferSettings.password
            );

            // Set credentials flag if user authentication is provided.
            if (selfReference.transferSettings.user && 'withCredentials' in internalXHR) {
                internalXHR.withCredentials = true;
            }

            // Assign the state change handler.
            internalXHR.onreadystatechange = () => selfReference.onStateChange();

            // Apply custom HTTP headers from the instance's customHeaders property.
            for (const headerName in selfReference.headers) { // Using 'headers' as it's the property name on the base Request class
                if (Object.prototype.hasOwnProperty.call(selfReference.headers, headerName)) {
                    const headerValue = selfReference.headers[headerName];
                    try {
                        internalXHR.setRequestHeader(headerName, headerValue);
                    } catch (headerError) {
                        console.warn(`BinaryDataTransmitter: Failed to set header "${headerName}":`, headerError.message);
                        selfReference.fireEvent('exception', [headerName, headerValue, headerError]);
                    }
                }
            }

            // Announce that the request is about to be sent.
            selfReference.fireEvent('request');
            console.log(`BinaryDataTransmitter: Sending payload to ${targetEndpoint} via ${httpMethod}.`);

            // Send the binary data payload.
            internalXHR.send(dataChunk);

            // Set a timeout for the request if a duration is specified.
            if (selfReference.transferSettings.timeoutDuration > 0) {
                selfReference.timeoutID = setTimeout(() => {
                    selfReference.fireEvent('timeout');
                    internalXHR.abort(); // Abort the request on timeout.
                    selfReference.isCurrentlyRunning = false;
                    console.error(`BinaryDataTransmitter: Transfer timed out after ${selfReference.transferSettings.timeoutDuration}ms.`);
                }, selfReference.transferSettings.timeoutDuration);
            }
            
            // If asynchronous mode is disabled, manually trigger the state change.
            // This is generally discouraged for UI responsiveness but supported by XHR.
            // Note: The original code had `if (!this.options.async) this.onStateChange();`
            // We've moved it to after setting timeout, and made it explicit.
            if (!selfReference.transferSettings.async) {
                selfReference.onStateChange();
            }

            return this; // Return the instance for chaining.
        }

    });

})();