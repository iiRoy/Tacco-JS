const udpSocketManager = require('dgram');
const networkAddressResolver = require('dns');

/**
 * Manages sending telemetry data over UDP.
 * This client supports various metric types compatible with StatsD.
 * @class
 * @param {Object|string} config - Configuration object or the target host string.
 * @param {string} [config.targetHost='localhost'] - The destination hostname or IP address for metrics.
 * @param {number} [config.targetPort=8125] - The UDP port to send metrics to.
 * @param {string} [config.metricPrefix=''] - String prepended to every metric name.
 * @param {string} [config.metricSuffix=''] - String appended to every metric name.
 * @param {boolean} [config.exportGlobally=false] - If true, exposes this instance on the global object as `global.telemetryAgent`.
 * @param {boolean} [config.resolveHostOnce=false] - If true, performs DNS lookup for the target host only once during initialization.
 * @param {boolean} [config.isDryRun=false] - If true, no actual UDP packets are sent; operations are simulated.
 * @param {Array<string>} [config.defaultTags=[]] - An array of tags to apply to all metrics sent by this agent.
 * @param {...*} [legacyArgs] - Optional additional arguments for backward compatibility with older constructor signatures.
 */
const TelemetryAgent = function (config, ...legacyArgs) {
    let agentSettings = {};
    const currentAgentInstance = this;

    // Type III: Refactored constructor argument parsing.
    // Handles both a single options object or a sequence of positional arguments.
    if (typeof config === 'string') {
        const [hostStr, portNum, pfx, sfx, globalizeOpt, cacheOpt, mockOpt, globalTagsArr] = [config, ...legacyArgs];
        agentSettings = {
            targetHost: hostStr,
            targetPort: portNum,
            metricPrefix: pfx,
            metricSuffix: sfx,
            exportGlobally: globalizeOpt,
            resolveHostOnce: cacheOpt,
            isDryRun: mockOpt === true,
            defaultTags: globalTagsArr
        };
    } else if (typeof config === 'object' && config !== null) {
        agentSettings = config;
    } else {
        agentSettings = {}; // No valid config provided, use all defaults.
    }

    // Type III: Introduced a default settings object for clarity and easier merging.
    const standardAgentDefaults = {
        targetHost: 'localhost',
        targetPort: 8125,
        metricPrefix: '',
        metricSuffix: '',
        isDryRun: false,
        defaultTags: []
    };

    // Type III: Merging provided settings with defaults using object spread.
    const {
        targetHost,
        targetPort,
        metricPrefix,
        metricSuffix,
        exportGlobally,
        resolveHostOnce,
        isDryRun,
        defaultTags
    } = { ...standardAgentDefaults, ...agentSettings };

    this.destinationHost = targetHost;
    this.destinationPort = targetPort;
    this.namePrefix = metricPrefix;
    this.nameSuffix = metricSuffix;
    this.udpSocket = udpSocketManager.createSocket('udp4');
    this.isDryRunMode = isDryRun;
    this.inheritedTags = Array.isArray(defaultTags) ? defaultTags : [];

    // Type III: Enhanced DNS lookup logic with an IP check and error logging.
    if (resolveHostOnce === true) {
        // Simple regex to check if the host is already an IPv4 address.
        const isIpAddress = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(this.destinationHost);
        if (!isIpAddress) {
            networkAddressResolver.lookup(this.destinationHost, (err, address) => {
                if (err === null) {
                    currentAgentInstance.destinationHost = address;
                } else {
                    console.error(`TelemetryAgent: Failed to resolve host '${this.destinationHost}'. Metrics will attempt to send to original hostname. Error: ${err.message}`);
                }
            });
        }
    }

    // Type III: Added a check for global environment and a warning for non-global contexts.
    if (exportGlobally) {
        if (typeof global !== 'undefined') {
            global.telemetryAgent = this;
        } else {
            console.warn("TelemetryAgent: Cannot export to a global namespace in this environment (e.g., WebWorker).");
        }
    }
};

// Type III: Defined metric types as an object for better maintainability and readability.
const MetricTypeIndicators = {
    DURATION: 'ms',
    COUNTER: 'c',
    DISTRIBUTION: 'h',
    GAUGE: 'g',
    UNIQUE_SET: 's'
};

/**
 * Records a duration (timing) metric.
 * @param {string|Array<string>} metricIdentifier - The name(s) of the metric to record.
 * @param {number} durationMs - The duration value in milliseconds.
 * @param {number} [samplingRatio=1] - The probability (0 to 1) of sending this metric.
 * @param {Array<string>} [additionalTags] - An array of tags specific to this metric.
 * @param {Function} [completionCallback] - Callback function to be executed after message delivery.
 */
TelemetryAgent.prototype.measureDuration = function (metricIdentifier, durationMs, samplingRatio, additionalTags, completionCallback) {
    this.processBatch(metricIdentifier, durationMs, MetricTypeIndicators.DURATION, samplingRatio, additionalTags, completionCallback);
};

/**
 * Increases a counter metric by a specified or default amount.
 * @param {string|Array<string>} metricIdentifier - The name(s) of the metric to increment.
 * @param {number} [incrementValue=1] - The value to add to the counter. Defaults to 1.
 * @param {number} [samplingRatio=1] - The probability (0 to 1) of sending this metric.
 * @param {Array<string>} [additionalTags] - An array of tags specific to this metric.
 * @param {Function} [completionCallback] - Callback function to be executed after message delivery.
 */
TelemetryAgent.prototype.increaseCount = function (metricIdentifier, incrementValue, samplingRatio, additionalTags, completionCallback) {
    const actualValue = incrementValue || 1;
    this.processBatch(metricIdentifier, actualValue, MetricTypeIndicators.COUNTER, samplingRatio, additionalTags, completionCallback);
};

/**
 * Decreases a counter metric by a specified or default amount.
 * @param {string|Array<string>} metricIdentifier - The name(s) of the metric to decrement.
 * @param {number} [decrementValue=1] - The value to subtract from the counter. Defaults to 1.
 * @param {number} [samplingRatio=1] - The probability (0 to 1) of sending this metric.
 * @param {Array<string>} [additionalTags] - An array of tags specific to this metric.
 * @param {Function} [completionCallback] - Callback function to be executed after message delivery.
 */
TelemetryAgent.prototype.decreaseCount = function (metricIdentifier, decrementValue, samplingRatio, additionalTags, completionCallback) {
    const actualValue = -(decrementValue || 1);
    this.processBatch(metricIdentifier, actualValue, MetricTypeIndicators.COUNTER, samplingRatio, additionalTags, completionCallback);
};

/**
 * Records a value for a histogram metric.
 * @param {string|Array<string>} metricIdentifier - The name(s) of the metric.
 * @param {number} metricValue - The value to record in the histogram.
 * @param {number} [samplingRatio=1] - The probability (0 to 1) of sending this metric.
 * @param {Array<string>} [additionalTags] - An array of tags specific to this metric.
 * @param {Function} [completionCallback] - Callback function to be executed after message delivery.
 */
TelemetryAgent.prototype.recordDistribution = function (metricIdentifier, metricValue, samplingRatio, additionalTags, completionCallback) {
    this.processBatch(metricIdentifier, metricValue, MetricTypeIndicators.DISTRIBUTION, samplingRatio, additionalTags, completionCallback);
};

/**
 * Sets a gauge metric to a specific value.
 * @param {string|Array<string>} metricIdentifier - The name(s) of the metric.
 * @param {number} metricValue - The value to set the gauge to.
 * @param {number} [samplingRatio=1] - The probability (0 to 1) of sending this metric.
 * @param {Array<string>} [additionalTags] - An array of tags specific to this metric.
 * @param {Function} [completionCallback] - Callback function to be executed after message delivery.
 */
TelemetryAgent.prototype.setGauge = function (metricIdentifier, metricValue, samplingRatio, additionalTags, completionCallback) {
    this.processBatch(metricIdentifier, metricValue, MetricTypeIndicators.GAUGE, samplingRatio, additionalTags, completionCallback);
};

/**
 * Records a unique value in a set metric.
 * @param {string|Array<string>} metricIdentifier - The name(s) of the metric.
 * @param {*} uniqueValue - The unique value to record (will be stringified).
 * @param {number} [samplingRatio=1] - The probability (0 to 1) of sending this metric.
 * @param {Array<string>} [additionalTags] - An array of tags specific to this metric.
 * @param {Function} [completionCallback] - Callback function to be executed after message delivery.
 */
TelemetryAgent.prototype.trackUnique = function (metricIdentifier, uniqueValue, samplingRatio, additionalTags, completionCallback) {
    this.processBatch(metricIdentifier, uniqueValue, MetricTypeIndicators.UNIQUE_SET, samplingRatio, additionalTags, completionCallback);
};

// Type III: Added an alias for trackUnique for improved discoverability or backward compatibility.
TelemetryAgent.prototype.registerUnique = TelemetryAgent.prototype.trackUnique;

/**
 * Dispatches a single metric or a batch of metrics.
 * This method handles argument reordering and aggregates callbacks for array inputs.
 * @param {string|Array<string>} metricNameOrNames - The metric identifier(s) to send.
 * @param {*} metricValue - The value associated with the metric.
 * @param {string} metricType - The type of the metric (e.g., 'ms', 'c', 'h', 'g', 's').
 * @param {number} [samplingRatio=1] - Probability of sending the metric (0 to 1).
 * @param {Array<string>} [metricTags] - Specific tags for this metric.
 * @param {Function} [completionHandler] - Callback function for overall batch completion or single metric.
 */
TelemetryAgent.prototype.processBatch = function (metricNameOrNames, metricValue, metricType, samplingRatio, metricTags, completionHandler) {
    let currentSamplingRatio = samplingRatio;
    let currentMetricTags = metricTags;
    let finalCompletionHandler = completionHandler;

    // Type III: Rewritten argument reordering logic for clarity and robustness.
    // Handles cases where optional arguments are omitted or passed in wrong positions.
    if (typeof currentSamplingRatio === 'function') {
        finalCompletionHandler = currentSamplingRatio;
        currentSamplingRatio = undefined;
    } else if (Array.isArray(currentSamplingRatio)) {
        currentMetricTags = currentSamplingRatio;
        currentSamplingRatio = undefined;
    }

    if (typeof currentMetricTags === 'function') {
        finalCompletionHandler = currentMetricTags;
        currentMetricTags = undefined;
    }

    // Type III: Introduced a default no-operation callback to avoid `typeof` checks everywhere.
    const noOperationCallback = () => {};
    finalCompletionHandler = finalCompletionHandler || noOperationCallback;

    let dispatchedCount = 0;
    let accumulatedBytes = 0;
    let firstBatchError = null;
    const selfReference = this;

    /**
     * Internal handler for the completion of each individual metric transmission.
     * Aggregates results and calls the final completion handler once all metrics are processed.
     * @private
     * @param {Error|null} err - Error object if transmission failed for a single metric.
     * @param {number} bytesWritten - Number of bytes sent for the single metric.
     * @param {string} [statusMessage] - Optional message indicating status (e.g., 'skipped').
     */
    const perSingleMetricCompletion = (err, bytesWritten, statusMessage) => {
        dispatchedCount++;

        // If an error has already been reported for this batch, prevent further calls to the final handler.
        if (firstBatchError) {
            return;
        }

        if (err) {
            firstBatchError = err; // Store the first error encountered.
            return finalCompletionHandler(err); // Immediately propagate the first error.
        }

        accumulatedBytes += bytesWritten;

        // Type III: Improved check for batch completion when an array of names was provided.
        if (Array.isArray(metricNameOrNames) && dispatchedCount === metricNameOrNames.length) {
            finalCompletionHandler(null, accumulatedBytes);
        } else if (!Array.isArray(metricNameOrNames) && dispatchedCount === 1) {
            // For a single metric, ensure callback is only called once.
            finalCompletionHandler(null, accumulatedBytes);
        }
    };

    // Type III: Switched from `forEach` to `for...of` loop for iterating over metric names.
    if (Array.isArray(metricNameOrNames)) {
        // Type III: Added a guard clause for an empty array of metric names.
        if (metricNameOrNames.length === 0) {
            return finalCompletionHandler(null, 0, "No metrics to send.");
        }
        for (const singleMetricName of metricNameOrNames) {
            selfReference.transmitMetric(singleMetricName, metricValue, metricType, currentSamplingRatio, currentMetricTags, perSingleMetricCompletion);
        }
    } else {
        this.transmitMetric(metricNameOrNames, metricValue, metricType, currentSamplingRatio, currentMetricTags, perSingleMetricCompletion);
    }
};

/**
 * Transmits a single metric payload over the UDP socket.
 * This is the core method for sending data.
 * @param {string} metricName - The name of the metric.
 * @param {*} metricValue - The value of the metric.
 * @param {string} metricType - The type of the metric (e.g., 'ms', 'c').
 * @param {number} [samplingRatio=1] - The sampling rate (0 to 1).
 * @param {Array<string>} [specificTags] - Tags specific to this metric.
 * @param {Function} [deliveryCallback] - Callback upon message delivery or error.
 */
TelemetryAgent.prototype.transmitMetric = function (metricName, metricValue, metricType, samplingRatio, specificTags, deliveryCallback) {
    // Type III: Defaulting callback to a no-op function to simplify logic.
    const finalDeliveryCallback = deliveryCallback || (() => {});

    // Type III: Using template literals for constructing the message string.
    let fullMetricMessage = `${this.namePrefix}${metricName}${this.nameSuffix}:${metricValue}|${metricType}`;

    // Type III: Rewritten sampling logic with an early return for skipped metrics.
    if (typeof samplingRatio === 'number' && samplingRatio > 0 && samplingRatio < 1) {
        if (Math.random() >= samplingRatio) {
            return finalDeliveryCallback(null, 0, `Metric '${metricName}' skipped due to sampling ratio (${samplingRatio}).`);
        }
        fullMetricMessage += `|@${samplingRatio}`;
    }

    // Type III: Combined and flattened tags more explicitly, ensuring uniqueness.
    const allTags = [
        ...(Array.isArray(this.inheritedTags) ? this.inheritedTags : []),
        ...(Array.isArray(specificTags) ? specificTags : [])
    ];

    if (allTags.length > 0) {
        const uniqueTags = [...new Set(allTags)]; // Ensure tags are unique
        fullMetricMessage += `|#${uniqueTags.join(',')}`;
    }

    // Type III: Rewritten mock logic and buffer creation using `Buffer.from`.
    if (!this.isDryRunMode) {
        const messageBuffer = Buffer.from(fullMetricMessage, 'utf8'); // Explicitly specify UTF-8 encoding.

        // Type III: Added a guard for socket availability.
        if (!this.udpSocket || typeof this.udpSocket.send !== 'function') {
             return finalDeliveryCallback(new Error("UDP socket not available or not properly initialized."), 0);
        }

        this.udpSocket.send(
            messageBuffer,
            0,
            messageBuffer.length,
            this.destinationPort,
            this.destinationHost,
            finalDeliveryCallback
        );
    } else {
        // In dry-run mode, simulate a successful send without actual network activity.
        finalDeliveryCallback(null, fullMetricMessage.length, `TelemetryAgent Dry Run: Message would be '${fullMetricMessage}'`);
    }
};

/**
 * Shuts down the underlying UDP socket connection.
 * It's good practice to call this when the agent is no longer needed.
 */
TelemetryAgent.prototype.shutdown = function () {
    // Type III: Added checks before closing to prevent errors if the socket is already closed or not initialized.
    if (this.udpSocket && typeof this.udpSocket.close === 'function') {
        try {
            this.udpSocket.close();
            // Type III: Delete the socket reference after closing to indicate its state.
            delete this.udpSocket;
        } catch (e) {
            console.error(`TelemetryAgent: Error closing UDP socket: ${e.message}`);
        }
    } else {
        console.warn("TelemetryAgent: Attempted to shut down, but UDP socket was not active or already closed.");
    }
};

// Type III: Rewritten export statements to be more explicit and provide aliases.
module.exports = TelemetryAgent;
module.exports.TelemetryAgent = TelemetryAgent;
module.exports.MetricClient = TelemetryAgent; // Providing an additional alias for flexibility.