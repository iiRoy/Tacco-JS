// A robust polyfill system for basic console functionality, designed for environments lacking native support.
(function(globalScope) {

    // Internal configuration parameters for the simulated console's behavior and appearance.
    const consoleSettings = {
        targetOutputElementId: 'console-output-display', // ID of the HTML element to render messages into.
        activeGroupIndicator: '>> ',                     // Prefix used when a log group is active.
        maximumBufferedEntries: 500                      // Limits the number of log messages kept in memory and displayed.
    };

    let logOutputDiv = null;           // Reference to the DOM element where log messages are displayed.
    let didConsoleLogGetPolyfilled = false; // Flag to track if this script provided the 'log' method.
    let currentLogGroupIdentifier = null; // Stores the name of the currently active log group.
    let renderedLogEntries = [];       // An array acting as a buffer for log messages before they are rendered.
    let messageSequenceNumber = 0;     // A simple counter for all log entries processed.

    /**
     * Converts a given string into an HTML-safe format by escaping special characters.
     * This prevents potential XSS issues when inserting user-provided text into innerHTML.
     * @param {any} rawInput - The data to be escaped, will be converted to string.
     * @returns {string} The HTML-escaped string.
     */
    function sanitizeForHtml(rawInput) {
        const stringifiedInput = String(rawInput); // Ensure the input is a string.
        const temporarySpan = document.createElement('span');
        temporarySpan.appendChild(document.createTextNode(stringifiedInput));
        return temporarySpan.innerHTML;
    }

    /**
     * Constructs the prefix string for a log entry, potentially including a timestamp and group indicator.
     * @returns {string} The complete prefix string for a log message.
     */
    function generateLogMessagePrefix() {
        // Include a precise timestamp for better debugging context.
        const now = new Date();
        const formattedTime = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const prefixComponents = [`[${formattedTime}]`];

        if (currentLogGroupIdentifier) {
            prefixComponents.push(consoleSettings.activeGroupIndicator);
        }
        return prefixComponents.join(' ');
    }

    /**
     * Core function to add a message to the custom console display.
     * Handles DOM element creation/lookup, buffering, and rendering.
     * @param {any} contentToLog - The content to be logged, can be any data type.
     */
    function writeMessageToDisplay(contentToLog) {
        // Lazy initialization: find or create the output element when the first message is logged.
        if (!logOutputDiv) {
            logOutputDiv = document.getElementById(consoleSettings.targetOutputElementId);
            if (!logOutputDiv) {
                // Fallback: If the specified element ID doesn't exist, create a basic one dynamically.
                // This enhances robustness by ensuring a display mechanism is always available.
                logOutputDiv = document.createElement('div');
                logOutputDiv.id = consoleSettings.targetOutputElementId;
                // Apply minimal inline styles for visibility and basic functionality.
                logOutputDiv.style.cssText = 'position: fixed; bottom: 0; left: 0; width: 100%; max-height: 250px; overflow-y: auto; background-color: #222; color: #eee; font-family: "Lucida Console", Monaco, monospace; font-size: 11px; padding: 6px; border-top: 1px solid #444; z-index: 99999; box-sizing: border-box;';
                if (document.body) { // Ensure body exists before appending.
                    document.body.appendChild(logOutputDiv);
                } else {
                    // If body is not ready, defer creation. This is a rare edge case.
                    document.addEventListener('DOMContentLoaded', () => document.body.appendChild(logOutputDiv));
                }
            }
        }

        const fullMessageLine = generateLogMessagePrefix() + ' ' + sanitizeForHtml(contentToLog);
        renderedLogEntries.push(fullMessageLine);
        messageSequenceNumber++; // Increment the global message counter.

        // Implement a circular buffer-like behavior to prevent the log from growing indefinitely.
        if (renderedLogEntries.length > consoleSettings.maximumBufferedEntries) {
            // Remove older entries from the beginning of the array.
            renderedLogEntries.splice(0, renderedLogEntries.length - consoleSettings.maximumBufferedEntries);
        }

        // Update the DOM element's content and scroll to the latest message.
        logOutputDiv.innerHTML = renderedLogEntries.join('<br>');
        logOutputDiv.scrollTop = logOutputDiv.scrollHeight; // Auto-scroll to the bottom.
    }

    // Begin polyfilling/enhancing the `window.console` object.
    if (!globalScope.console) {
        // If `console` doesn't exist at all, create a new object and assign our `log` method.
        if (document && document.documentElement) {
            // Add a class to the root HTML element for potential styling of the faux console.
            document.documentElement.classList.add('custom-console-active');
        }
        globalScope.console = {}; // Initialize the global console object.
        globalScope.console.log = writeMessageToDisplay;
        didConsoleLogGetPolyfilled = true;
    } else if (!globalScope.console.log) {
        // If `console` exists but `log` is missing, just add our `log` method.
        globalScope.console.log = writeMessageToDisplay;
        didConsoleLogGetPolyfilled = true;
    }

    // Polyfill/enhance `console.group` and `console.groupEnd` methods.
    if (!globalScope.console.group) {
        // If `console.log` was not polyfilled by this script, it means a native `log` exists.
        // In this case, we need to wrap the native `log` to prepend our group prefix.
        if (!didConsoleLogGetPolyfilled) {
            const originalLogFunction = globalScope.console.log; // Store a reference to the native log.

            globalScope.console.log = function(...messageArgs) {
                // Prepend the group prefix to the first argument, then pass all arguments.
                const firstArgument = messageArgs.length > 0 ? String(messageArgs[0]) : '';
                const prefixedArguments = [generateLogMessagePrefix() + ' ' + firstArgument, ...messageArgs.slice(1)];

                // Call the original log method using `apply` for flexible argument handling.
                if (typeof originalLogFunction === 'function') {
                    originalLogFunction.apply(globalScope.console, prefixedArguments);
                } else {
                    // Fallback to our custom display if the original function is somehow invalid.
                    writeMessageToDisplay(prefixedArguments.join(' '));
                }
            };
        }

        // Implement `console.group`.
        globalScope.console.group = function(nameOfGroup) {
            // Simple polyfill: disallow nested groups for clarity.
            if (currentLogGroupIdentifier) {
                globalScope.console.log(`Note: Already in group "${currentLogGroupIdentifier}". Cannot start new group "${nameOfGroup}".`);
                return;
            }

            globalScope.console.log(`Group Started: [${String(nameOfGroup)}]`);
            currentLogGroupIdentifier = String(nameOfGroup); // Store the group name.
        };

        // Implement `console.groupEnd`.
        globalScope.console.groupEnd = function() {
            // Only end a group if one is currently active.
            if (!currentLogGroupIdentifier) {
                globalScope.console.log('Note: No active group to terminate.');
                return;
            }

            const endedGroupReference = currentLogGroupIdentifier;
            currentLogGroupIdentifier = null; // Clear the active group.
            globalScope.console.log(`Group Ended: [${endedGroupReference}]`);
        };

        // As an additional feature, provide a basic `console.info` method.
        if (!globalScope.console.info) {
            globalScope.console.info = function(...infoArgs) {
                globalScope.console.log(`[INFO] ${infoArgs.map(String).join(' ')}`);
            };
        }
    }

})(window);