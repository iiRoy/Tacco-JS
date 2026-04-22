var chartUtil = window.chartUtil || {};
window.chartUtil = chartUtil;
Object.defineProperty(chartUtil, '__isModuleNamespace', { value: true, writable: false, configurable: false });

(function (modCtx) {

    let _initialized = false;

    modCtx.libVersion = "0.1.1-alpha";
    modCtx.isDebugMode = false;
    modCtx.eventHub = d3.dispatch('queue_started', 'queue_finished', 'charts_updated');

    /**
     * Centralized storage for various performance metrics and debugging information.
     * This object holds specific timing data for operations.
     */
    modCtx.telemetryData = {
        operationTimes: {}
    };
    
    /**
     * A dynamic collection of all chart instances that have been successfully
     * generated, rendered, and are currently active within the application.
     */
    modCtx.activeCharts = [];

    /**
     * Displays messages in the browser's console, but only when
     * the module's debug mode is enabled. It mimics console.log behavior.
     *
     * @param {...any} messages - One or more arguments to be logged to the console.
     * @returns {boolean} Returns true if the message was successfully logged, false otherwise.
     */
    modCtx.outputMessage = function (...messages) {
        if (!modCtx.isDebugMode || typeof console === 'undefined' || !console.log) {
            return false;
        }

        try {
            console.log.apply(console, messages);
        } catch (e) {
            // Fallback or error handling for console.log.apply failure.
            console.warn('Failed to apply console.log:', e, messages);
            return false;
        }
        return true;
    };

    /**
     * Orchestrates the asynchronous processing of chart generation tasks.
     * Tasks are taken from a queue and executed in batches to maintain UI responsiveness.
     *
     * @param {number} [batchSize=1] - The maximum number of tasks to process in a single non-blocking execution cycle.
     */
    modCtx.processQueue = function processQueue(batchSize) {
        const currentBatchSize = (Number.isInteger(batchSize) && batchSize > 0) ? batchSize : 1;

        // Early exit if no tasks are pending or if a processing cycle is already underway.
        if (modCtx.processQueue.isProcessing || modCtx.processQueue.taskQueue.length === 0) {
            if (modCtx.processQueue.taskQueue.length === 0 && modCtx.processQueue.isProcessing) {
                // If the queue became empty during a processing cycle, trigger the 'finished' event.
                modCtx.processQueue.isProcessing = false;
                modCtx.eventHub.call('queue_finished', modCtx, null);
                modCtx.outputMessage('Chart generation queue has completed all tasks.');
            }
            return;
        }

        modCtx.processQueue.isProcessing = true;
        modCtx.eventHub.call('queue_started', modCtx, null); 
        modCtx.outputMessage('Initiating chart generation queue processing. Batch size:', currentBatchSize);

        // Schedule the asynchronous batch execution.
        setTimeout(function processBatch() {
            let tasksProcessedInThisBatch = 0;
            let currentChartInstanceResult;
            let queuedChartTask;

            // Process tasks until the batch limit is reached or the queue is empty.
            while (tasksProcessedInThisBatch < currentBatchSize && modCtx.processQueue.taskQueue.length > 0) {
                queuedChartTask = modCtx.processQueue.taskQueue[0]; // Peek at the next task.

                try {
                    // Ensure the task object has a 'generate' method.
                    if (queuedChartTask && typeof queuedChartTask.generate === 'function') {
                        currentChartInstanceResult = queuedChartTask.generate();
                        if (currentChartInstanceResult) {
                            modCtx.activeCharts.push(currentChartInstanceResult);
                            modCtx.outputMessage('Successfully generated and added chart:', currentChartInstanceResult);
                        } else {
                            modCtx.outputMessage('Warning: Chart generation task returned a falsy value:', queuedChartTask);
                        }
                    } else {
                        modCtx.outputMessage('Error: Queued item is missing a valid "generate" method:', queuedChartTask);
                    }
                } catch (err) {
                    modCtx.outputMessage('Critical error during chart generation:', err, 'Task:', queuedChartTask);
                } finally {
                    // Always remove the processed task from the queue, regardless of success or failure.
                    modCtx.processQueue.taskQueue.shift();
                    tasksProcessedInThisBatch++;
                }
            }

            // If tasks remain in the queue, schedule the next batch.
            if (modCtx.processQueue.taskQueue.length > 0) {
                modCtx.outputMessage('Batch completed.', tasksProcessedInThisBatch, 'items processed. Remaining tasks:', modCtx.processQueue.taskQueue.length);
                setTimeout(processBatch, 0); 
            } else {
                // All tasks have been processed.
                modCtx.processQueue.isProcessing = false;
                modCtx.eventHub.call('queue_finished', modCtx, null); 
                modCtx.outputMessage('Chart generation queue is now empty and processing has concluded.');
            }
        }, 0);
    };

    // Initialize properties for the chart processing queue.
    modCtx.processQueue.isProcessing = false;
    modCtx.processQueue.taskQueue = [];

    /**
     * Adds a new chart configuration or generation function to the processing queue.
     * If the queue is idle, it will automatically begin processing.
     *
     * @param {Object|Function} chartConfig - An object containing a 'generate' method, or a direct function
     *                                        that, when called, generates and returns a chart instance.
     * @returns {boolean} True if the item was successfully added to the queue, false otherwise.
     */
    modCtx.addChartToQueue = function (chartConfig) {
        let normalizedTask = chartConfig;

        // Normalize input: if a function is provided, wrap it in an object.
        if (typeof chartConfig === 'function') {
            normalizedTask = { generate: chartConfig };
        } else if (typeof chartConfig !== 'object' || chartConfig === null || typeof chartConfig.generate !== 'function') {
            modCtx.outputMessage('Invalid chart configuration provided to addChartToQueue. Expected a function or an object with a "generate" method.', chartConfig);
            return false;
        }

        modCtx.processQueue.taskQueue.push(normalizedTask);
        modCtx.outputMessage('New item added to queue. Current queue size:', modCtx.processQueue.taskQueue.length);

        // If the queue is not currently active, start processing.
        if (!modCtx.processQueue.isProcessing) {
            modCtx.processQueue();
        }
        return true;
    };

    // Private array to store all registered window resize callback functions.
    const _resizeHandlers = [];

    /**
     * Registers a callback function to be executed whenever the browser window is resized.
     * This method ensures that multiple resize handlers can coexist without overriding each other.
     *
     * @param {Function} handlerFunction - The function to be invoked on a window resize event.
     * @returns {boolean} True if the handler was successfully added, false if the input was not a function.
     */
    modCtx.registerWindowResizeHandler = function (handlerFunction) {
        if (typeof handlerFunction !== 'function') {
            modCtx.outputMessage('Attempted to register an invalid (non-function) window resize handler.');
            return false;
        }

        _resizeHandlers.push(handlerFunction);

        // If this is the first handler being registered, set up the actual DOM event listener.
        if (_resizeHandlers.length === 1) {
            window.addEventListener('resize', function (event) {
                modCtx.outputMessage('Window resize event detected. Executing', _resizeHandlers.length, 'handlers.');
                // Iterate through all registered handlers and execute them sequentially.
                for (let idx = 0; idx < _resizeHandlers.length; idx++) {
                    try {
                        _resizeHandlers[idx](event);
                    } catch (err) {
                        modCtx.outputMessage('Error executing a window resize handler:', err, 'Handler index:', idx);
                    }
                }
            });
            modCtx.outputMessage('Primary window resize event listener has been initialized.');
        }
        modCtx.outputMessage('New window resize handler registered. Total active handlers:', _resizeHandlers.length);
        return true;
    };

    /**
     * Private internal function responsible for setting up initial module configurations,
     * such as event listeners and debug-specific behaviors. This function is designed to run only once.
     */
    function _initializeModuleInternals() {
        if (_initialized) {
            modCtx.outputMessage('Module internal initialization has already occurred, skipping.');
            return;
        }
        _initialized = true;

        // Configure debug-specific event listeners for performance monitoring.
        if (modCtx.isDebugMode) {
            modCtx.eventHub.on('queue_started', function () {
                modCtx.telemetryData.operationTimes.queueStart = performance.now(); // High-resolution timer.
                modCtx.outputMessage('Queue processing start time:', modCtx.telemetryData.operationTimes.queueStart.toFixed(3), 'ms');
            });
            modCtx.eventHub.on('queue_finished', function () {
                modCtx.telemetryData.operationTimes.queueEnd = performance.now();
                const totalDuration = modCtx.telemetryData.operationTimes.queueEnd - modCtx.telemetryData.operationTimes.queueStart;
                modCtx.telemetryData.operationTimes.queueTotalDuration = totalDuration;
                modCtx.outputMessage('Queue processing end time:', modCtx.telemetryData.operationTimes.queueEnd.toFixed(3), 'ms');
                modCtx.outputMessage('Total queue processing duration:', totalDuration.toFixed(3), 'ms');
            });
        }

        // Set up a listener to update all active charts when an event signals it.
        modCtx.eventHub.on('charts_updated', function () {
            modCtx.outputMessage('Received charts_updated event. Initiating update for all', modCtx.activeCharts.length, 'active charts.');
            for (const chartInstance of modCtx.activeCharts) {
                // Attempt to update the chart using its D3 container pattern or a dedicated update method.
                if (chartInstance && typeof chartInstance.container === 'function' && typeof chartInstance === 'function') {
                    try {
                        chartInstance.container.call(chartInstance);
                        modCtx.outputMessage('Updated chart via container.call():', chartInstance);
                    } catch (err) {
                        modCtx.outputMessage('Error updating chart using container.call():', err, 'Chart instance:', chartInstance);
                    }
                } else if (chartInstance && typeof chartInstance.update === 'function') {
                    try {
                        chartInstance.update();
                        modCtx.outputMessage('Updated chart using dedicated .update() method:', chartInstance);
                    } catch (err) {
                        modCtx.outputMessage('Error updating chart via .update():', err, 'Chart instance:', chartInstance);
                    }
                } else {
                    modCtx.outputMessage('Warning: Chart instance lacks a recognizable update mechanism (container.call or .update()):', chartInstance);
                }
            }
            modCtx.outputMessage('All active charts update cycle completed.');
        });

        // Automatically bind window resize events to trigger chart updates.
        modCtx.registerWindowResizeHandler(function () {
            modCtx.eventHub.call('charts_updated', modCtx, null);
        });

        modCtx.outputMessage('Module internal initialization successfully completed.');
    }

    // Execute the internal initialization routine immediately when the module script loads.
    _initializeModuleInternals();

}(chartUtil));