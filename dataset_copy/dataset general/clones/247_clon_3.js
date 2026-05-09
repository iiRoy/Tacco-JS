(function (jq) {
    // Ensure jQuery is available before proceeding.
    if (!jq) {
        console.error("jQuery (jq) is not defined. The RecurringFetcher service cannot initialize.");
        return;
    }

    /**
     * RecurringFetcher - A jQuery-based service for periodic, adaptive AJAX requests.
     *
     * This module provides a flexible mechanism to repeatedly fetch data from a server,
     * with features like adaptive polling intervals, content-based auto-halting,
     * and a robust control interface.
     *
     * Inspired by:
     * - http://www.360innovate.co.uk/blog/2009/03/periodicalupdater-for-jquery/
     * - http://enfranchisedmind.com/blog/posts/jquery-periodicalupdater-ajax-polling/
     *
     * Original Authors (2009-2012): Frank White, Robert Fischer, 360innovate.
     * License: Dual-licensed under MIT and GPL.
     *
     * @param {string} endpointUri The URL for the AJAX request.
     * @param {object} serviceOptions Configuration object for the fetching service.
     * @param {function} [completionCallback] An optional function to execute upon successful data reception.
     * @returns {object} An interface for controlling the recurring fetch operation.
     */
    jq.RecurringFetcher = function(endpointUri, serviceOptions, completionCallback){
        // Pre-check for essential parameters.
        if (!endpointUri || typeof endpointUri !== 'string') {
            console.error("RecurringFetcher: An 'endpointUri' (string) is required.");
            return;
        }
        if (!serviceOptions || typeof serviceOptions !== 'object') {
            serviceOptions = {}; // Ensure options is an object.
        }

        // Establish default configuration and merge with provided options.
        // Using Object.assign for a shallow merge then deep extend for nested objects if needed.
        const defaultConfiguration = {
            resourceUri: endpointUri,           // Target URL for data requests.
            enableCaching: false,               // Prevents browser caching of responses.
            httpMethod: 'GET',                  // HTTP verb: 'GET' or 'POST'.
            payload: null,                      // Data to send with the request (object or function returning object).
            initialDelayMs: 2000,               // Starting delay in milliseconds between requests.
            maximumDelayMs: 96000,              // Upper bound for the polling interval.
            delayFactor: 1.5,                   // Factor by which the delay increases if content is stable.
            iterationLimit: 0,                  // Maximum number of fetches. 0 means no limit.
            onIterationLimitReached: null,      // Callback when iterationLimit is met.
            autoHaltThreshold: 0,               // Number of identical responses before halting. 0 disables.
            onAutoHalt: null,                   // Callback when auto-halt condition is met.
            persistence: false,                 // Configuration for cookie-based state persistence.
            executeImmediately: false,          // If true, the first fetch occurs without initial delay.
            logLevel: 0,                        // Verbosity of logging: 0=none, 1=info, 2=debug.
            onSuccessHandler: null,             // Custom success handler from options.
            onErrorHandler: null,               // Custom error handler from options.
            onCompletionHandler: null           // Custom complete handler from options.
        };

        // Deep merge user options with defaults.
        const config = jq.extend(true, {}, defaultConfiguration, serviceOptions);

        // Internal logging mechanism.
        const traceActivity = function (message, level = 1) {
            if (config.logLevel >= level) {
                try {
                    // Prepend service name for clarity in console.
                    console.log(`[RecurringFetcher - L${level}] ${message}`);
                } catch (err) {
                    // Fail silently if console is unavailable.
                }
            }
        };

        // Core state variables for the service instance.
        let scheduledTaskHandle = null;     // Handle for the setTimeout.
        let fetchedPayload = null;          // Stores the most recently received data object.
        let lastKnownContent = null;        // Stores the raw text of the previous successful response.
        let currentDelayMs = config.initialDelayMs; // Current delay between requests.
        let iterationCount = 0;             // Number of completed data fetches.
        let stableContentCount = 0;         // Consecutive fetches with identical content.
        let isServiceActive = true;         // Flag indicating if the service is running.
        let isServicePaused = false;        // Flag indicating if the service is temporarily paused.

        // Helper to manage persistent state via cookies.
        const managePersistence = {
            persistDelay: function(delayVal) {
                if (config.persistence && jq.cookie) {
                    jq.cookie(config.persistence.name, delayVal, config.persistence);
                    traceActivity(`Polling delay ${delayVal}ms persisted to cookie: ${config.persistence.name}`, 2);
                }
            },
            retrieveDelay: function() {
                if (config.persistence && jq.cookie) {
                    const storedDelay = jq.cookie(config.persistence.name);
                    if (storedDelay) {
                        const parsedDelay = parseInt(storedDelay, 10);
                        if (!isNaN(parsedDelay) && parsedDelay > 0) {
                            traceActivity(`Retrieved persisted delay of ${parsedDelay}ms from cookie: ${config.persistence.name}`, 2);
                            return parsedDelay;
                        }
                    }
                }
                return null;
            },
            clearPersistence: function() {
                if (config.persistence && jq.cookie) {
                    jq.cookie(config.persistence.name, null, config.persistence);
                    traceActivity(`Cleared persisted state for cookie: ${config.persistence.name}`, 2);
                }
            }
        };

        // Function to schedule the next data retrieval.
        const adjustPollingInterval = function (intervalOverride) {
            // Stop if service is inactive or paused.
            if (!isServiceActive || isServicePaused) {
                traceActivity("Polling service is inactive or paused, skipping interval adjustment.", 2);
                return;
            }

            // Clear any existing scheduled task.
            if (scheduledTaskHandle !== null) {
                clearTimeout(scheduledTaskHandle);
                scheduledTaskHandle = null;
            }

            // Use override if provided, otherwise the current calculated delay.
            const nextInterval = intervalOverride || currentDelayMs;
            currentDelayMs = nextInterval; // Update current delay.

            traceActivity(`Scheduling next retrieval in ${currentDelayMs}ms.`, 2);
            managePersistence.persistDelay(currentDelayMs); // Persist current delay.

            scheduledTaskHandle = setTimeout(initiateDataRetrieval, currentDelayMs);
        };

        // Function to increase the polling delay due to stable content.
        const escalatePollingDelay = function () {
            if (config.delayFactor > 1) {
                const previousDelay = currentDelayMs;
                currentDelayMs = Math.min(config.maximumDelayMs, currentDelayMs * config.delayFactor);
                traceActivity(`Escalating polling delay from ${previousDelay}ms to ${currentDelayMs}ms.`, 2);
            }
            adjustPollingInterval(); // Reschedule with potentially new delay.
        };

        // Initialize cookie configuration if specified.
        if (config.persistence) {
            if (typeof config.persistence === 'boolean') {
                config.persistence = { name: endpointUri };
            } else if (typeof config.persistence !== 'object') {
                config.persistence = { name: config.persistence.toString() };
            }
            // Ensure a name exists for the cookie.
            config.persistence.name = config.persistence.name || endpointUri;

            // Check for jQuery cookie plugin and retrieve state.
            if (!jq.cookie) {
                traceActivity("jQuery Cookie plugin not found. Persistence disabled.", 1);
                config.persistence = false; // Disable persistence if plugin is missing.
            } else {
                const storedInterval = managePersistence.retrieveDelay();
                if (storedInterval) {
                    currentDelayMs = storedInterval;
                }
            }
        }

        // Configure AJAX request options.
        const requestOptions = jq.extend(true, {}, config); // Deep clone configuration.
        requestOptions.url = config.resourceUri;
        requestOptions.cache = config.enableCaching;
        requestOptions.type = config.httpMethod; // jQuery uses 'type' for HTTP method.
        // If data is a function, it will be evaluated just before the AJAX call.
        // Otherwise, use the provided payload.
        requestOptions.data = (typeof config.payload === 'function') ? config.payload() : config.payload;
        requestOptions.ifModified = true; // Use server-side caching headers.

        // Main function to initiate an AJAX data retrieval.
        const initiateDataRetrieval = function(isForcedRequest = false) {
            if (!isServiceActive) {
                traceActivity("Service is inactive, skipping data retrieval.", 1);
                return;
            }
            if (isServicePaused && !isForcedRequest) {
                traceActivity("Service is paused, skipping data retrieval.", 1);
                return;
            }

            // Guard against iteration limit if not a forced request.
            if (!isForcedRequest && config.iterationLimit > 0 && iterationCount >= config.iterationLimit) {
                traceActivity(`Iteration limit (${config.iterationLimit}) reached. Halting service.`, 1);
                serviceControl.terminateService(); // Use the public method to ensure cleanup.
                config.onIterationLimitReached && config.onIterationLimitReached();
                return;
            }

            traceActivity(`Initiating data fetch (iteration: ${iterationCount + 1}).`, 2);
            iterationCount++; // Increment iteration count before sending request.

            // Execute the actual AJAX request.
            jq.ajax(requestOptions);
        };

        // Define the public interface for controlling the service.
        const serviceControl = {
            /**
             * Accelerates the polling interval by a given factor.
             * @param {number} factor The multiplier for the current interval.
             */
            acceleratePolling: function(factor) {
                if (!isServiceActive) {
                    traceActivity("Cannot accelerate polling, service is inactive.", 1);
                    return;
                }
                if (typeof factor === 'number' && factor > 0 && factor !== 1) {
                    traceActivity(`Accelerating polling by factor: ${factor}.`, 1);
                    currentDelayMs = currentDelayMs / factor; // Reduce delay by factor.
                    // Ensure it doesn't go below minimum.
                    currentDelayMs = Math.max(config.initialDelayMs, currentDelayMs);
                    adjustPollingInterval();
                } else {
                    traceActivity(`Invalid acceleration factor provided: ${factor}.`, 1);
                }
            },

            /**
             * Recommences the service with optionally a new interval.
             * Resets iteration counts and content stability.
             * @param {number} [newIntervalMs] An optional new interval for the first fetch.
             */
            recommenceService: function (newIntervalMs) {
                traceActivity("Recommencing service.", 1);
                isServiceActive = true;
                isServicePaused = false;
                iterationCount = 0;
                stableContentCount = 0;
                currentDelayMs = newIntervalMs || config.initialDelayMs; // Reset or use new interval.
                adjustPollingInterval(currentDelayMs); // Schedule the first fetch.
            },

            /**
             * Triggers an immediate data fetch, bypassing the current delay and iteration limits.
             */
            triggerImmediateFetch: function() {
                if (!isServiceActive) {
                    traceActivity("Service is inactive, cannot trigger immediate fetch.", 1);
                    return;
                }
                traceActivity("Triggering immediate data fetch.", 1);
                initiateDataRetrieval(true); // Force the fetch.
            },

            /**
             * Terminates the service, clearing any scheduled tasks and persistence.
             */
            terminateService: function () {
                if (!isServiceActive) {
                    traceActivity("Service is already terminated.", 1);
                    return;
                }
                traceActivity("Terminating service.", 1);
                isServiceActive = false;
                isServicePaused = false;
                if (scheduledTaskHandle !== null) {
                    clearTimeout(scheduledTaskHandle);
                    scheduledTaskHandle = null;
                }
                managePersistence.clearPersistence();
            },

            /**
             * Pauses the service temporarily without losing its state.
             * Can be resumed with `resumeService`.
             */
            pauseService: function() {
                if (!isServiceActive || isServicePaused) {
                    traceActivity("Service is already paused or inactive.", 1);
                    return;
                }
                traceActivity("Pausing service.", 1);
                isServicePaused = true;
                if (scheduledTaskHandle !== null) {
                    clearTimeout(scheduledTaskHandle);
                    scheduledTaskHandle = null;
                }
            },

            /**
             * Resumes a paused service.
             * If not paused, it will simply continue as normal.
             */
            resumeService: function() {
                if (!isServiceActive) {
                    traceActivity("Cannot resume, service is inactive.", 1);
                    return;
                }
                if (!isServicePaused) {
                    traceActivity("Service is not paused, no action needed for resume.", 1);
                    return;
                }
                traceActivity("Resuming service.", 1);
                isServicePaused = false;
                adjustPollingInterval(); // Schedule the next fetch.
            },

            /**
             * Returns the current status of the fetching service.
             * @returns {object} An object containing status information.
             */
            getStatus: function() {
                return {
                    isActive: isServiceActive,
                    isPaused: isServicePaused,
                    currentInterval: currentDelayMs,
                    iterationsCompleted: iterationCount,
                    consecutiveStableContent: stableContentCount,
                    nextFetchScheduled: scheduledTaskHandle !== null
                };
            }
        };

        // --- AJAX Callback Implementations ---

        // Custom success handler for the AJAX request.
        requestOptions.success = function (data) {
            traceActivity("Data fetch reported success.", 2);
            fetchedPayload = data; // Store the parsed data.
        };

        // Custom complete handler for the AJAX request.
        requestOptions.complete = function (xhr, statusText) {
            traceActivity(`AJAX request completed with status: ${statusText}.`, 2);

            if (!isServiceActive) {
                traceActivity("Service became inactive during fetch completion, skipping further processing.", 1);
                return;
            }

            if (statusText === "success" || statusText === "notmodified") {
                const rawResponseContent = (xhr.responseText || '').trim();

                if (lastKnownContent === rawResponseContent) {
                    stableContentCount++;
                    traceActivity(`Content unchanged. Stable count: ${stableContentCount}.`, 2);

                    if (config.autoHaltThreshold > 0 && stableContentCount >= config.autoHaltThreshold) {
                        traceActivity(`Auto-halt threshold (${config.autoHaltThreshold}) reached. Halting service.`, 1);
                        serviceControl.terminateService();
                        config.onAutoHalt && config.onAutoHalt(stableContentCount);
                        return; // Stop processing and don't reschedule.
                    }
                    escalatePollingDelay(); // Increase delay due to stable content.
                } else {
                    // Content has changed. Reset stability counter and interval.
                    stableContentCount = 0;
                    adjustPollingInterval(config.initialDelayMs); // Reset to minimum delay.
                    lastKnownContent = rawResponseContent;
                    managePersistence.persistDelay(config.initialDelayMs); // Persist reset delay.

                    // Ensure fetchedPayload is set for callbacks.
                    if (fetchedPayload === null) {
                        fetchedPayload = rawResponseContent;
                    }

                    // Attempt to parse JSON if dataType is specified and payload is string.
                    if (requestOptions.dataType === 'json' && typeof fetchedPayload === 'string' && statusText === "success") {
                        try {
                            fetchedPayload = JSON.parse(fetchedPayload);
                            traceActivity("Parsed JSON data successfully.", 2);
                        } catch (e) {
                            traceActivity(`Failed to parse JSON response: ${e.message}. Using raw string.`, 1);
                        }
                    }

                    // Invoke user-defined success callbacks.
                    config.onSuccessHandler && config.onSuccessHandler(fetchedPayload, statusText, xhr, serviceControl);
                    completionCallback && completionCallback(fetchedPayload, statusText, xhr, serviceControl);
                }
            } else {
                // If the AJAX call itself failed (not just content unchanged).
                traceActivity(`AJAX request failed or was not successful (status: ${statusText}).`, 1);
                // Reset content tracking on error, as data state is uncertain.
                lastKnownContent = null;
                stableContentCount = 0; // Reset stability counter on error.
                adjustPollingInterval(config.initialDelayMs); // Reset to minimum delay on error.
            }

            // Always call the user's complete handler if provided.
            config.onCompletionHandler && config.onCompletionHandler(xhr, statusText);
            fetchedPayload = null; // Clear fetched payload for next cycle.
        };

        // Custom error handler for the AJAX request.
        requestOptions.error = function (xhr, textStatus, errorThrown) {
            traceActivity(`AJAX request encountered an error: ${textStatus} - ${errorThrown}.`, 1);

            if (!isServiceActive) {
                traceActivity("Service became inactive during error handling, skipping further processing.", 1);
                return;
            }

            // Only reset state if it's a real error, not just 'notmodified'.
            if (textStatus !== "notmodified") {
                lastKnownContent = null;
                stableContentCount = 0;
                managePersistence.clearPersistence(); // Clear persistence on error.
                adjustPollingInterval(config.initialDelayMs); // Reset interval to initial on error.
            }
            config.onErrorHandler && config.onErrorHandler(xhr, textStatus, errorThrown);
        };

        // --- Initial Service Kick-off Logic ---
        if (config.executeImmediately) {
            traceActivity("Executing initial fetch immediately as requested.", 1);
            initiateDataRetrieval(true); // Force the first fetch.
        } else {
            traceActivity(`Scheduling first fetch after ${currentDelayMs}ms.`, 1);
            adjustPollingInterval(); // Schedule the first fetch after initial delay.
        }

        return serviceControl; // Return the public interface.
    };

    /**
     * jQuery plugin wrapper for RecurringFetcher.
     * Allows calling RecurringFetcher on a jQuery selection.
     * @param {string} endpointUri
     * @param {object} serviceOptions
     * @param {function} [completionCallback]
     * @returns {object} The service control interface.
     */
    jq.fn.RecurringFetcher = function(endpointUri, serviceOptions, completionCallback) {
        // 'this' refers to the jQuery object the plugin was called on.
        // We'll pass it to the callback as context, similar to original.
        const contextElement = this;
        return jq.RecurringFetcher(endpointUri, serviceOptions, function() {
            // Apply the callback with the original jQuery context.
            return completionCallback.apply(contextElement, arguments);
        });
    };

})(jQuery);