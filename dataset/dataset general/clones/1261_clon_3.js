(function () {
  // Reference to the original browser console object
  const originalConsoleReference = window.console;

  /**
   * Manages custom logging streams and their configurations.
   * @param {object} nativeConsole - The native browser console object.
   * @param {string} [streamIdentifier] - An optional name for this logging stream.
   * @param {object} [configurationOptions] - Configuration settings for the stream.
   * @constructor
   */
  function DebugStreamManager(nativeConsole, streamIdentifier, configurationOptions) {
    // Merge provided options with default settings
    const defaultSettings = {
      loggingEnabled: true,
      textStyle: '#bada55',
      backgroundStyle: '#111',
      enableStyling: true // New setting to control styling
    };
    const currentSettings = Object.assign({}, defaultSettings, configurationOptions);

    // Define log types that can be styled
    const stylableLogTypes = ['dir', 'dirxml', 'error', 'info', 'log', 'warn'];
    
    // Determine if the current browser environment supports console styling
    const browserSupportsColors = checkBrowserStylingCapability();

    // Storage for managed child streams and historical log entries
    const managedSubstreams = {};
    const recordedEntries = [];

    /**
     * Converts an arguments object or similar array-like structure into a true array.
     * @param {IArguments} inputArguments - The arguments object or similar.
     * @returns {Array} A new array containing the elements.
     */
    const getArgumentsAsList = (inputArguments) => {
      if (!inputArguments || typeof inputArguments.length !== 'number') {
        return []; // Guard against non-array-like inputs
      }
      return Array.from(inputArguments);
    };

    /**
     * Checks if the user agent indicates a browser known to support console styling.
     * This is a pragmatic check due to lack of standard feature detection.
     * @returns {boolean} True if styling is likely supported, false otherwise.
     */
    function checkBrowserStylingCapability() {
      if (typeof window === 'undefined' || !window.navigator || !window.console) {
        return false; // Not a browser environment or no console
      }
      const browserAgentString = window.navigator.userAgent.toLowerCase();
      // Modern browsers like Chrome and Firefox generally support console styling
      return browserAgentString.includes('firefox') || browserAgentString.includes('chrome');
    }

    /**
     * Processes and dispatches a log entry to the native console, and records it.
     * @param {IArguments} messageArguments - The arguments passed to the log method.
     * @param {string} entryKind - The type of log entry (e.g., 'log', 'error').
     */
    const dispatchAndRecord = (messageArguments, entryKind) => {
      // Ensure logging is currently active
      if (!currentSettings.loggingEnabled) {
        return;
      }

      let processedArgs = getArgumentsAsList(messageArguments);
      if (processedArgs.length === 0) {
        // If no arguments, log an empty message or skip. For now, just return.
        return;
      }

      let consoleMethod = nativeConsole[entryKind];
      // Fallback to 'log' if the specific method doesn't exist on the native console
      if (typeof consoleMethod !== 'function') {
        consoleMethod = nativeConsole.log;
        if (typeof consoleMethod !== 'function') {
          return; // Cannot log if no basic log method exists
        }
      }

      // Apply custom styling if supported and enabled
      const shouldApplyStyling = currentSettings.enableStyling &&
                                 browserSupportsColors &&
                                 streamIdentifier !== undefined &&
                                 stylableLogTypes.includes(entryKind);

      if (shouldApplyStyling) {
        const styleString = `color:${currentSettings.textStyle}; background:${currentSettings.backgroundStyle}; font-weight:bold; padding: 2px 5px; border-radius: 3px;`;
        const prefix = (entryKind !== 'dir' && entryKind !== 'dirxml') ? `%c[${streamIdentifier}] ` : `[${streamIdentifier}] `;
        processedArgs.unshift(styleString);
        processedArgs.unshift(prefix);
        
        // Execute the native console method with custom styling
        consoleMethod.apply(nativeConsole, processedArgs);
        
        // Remove styling arguments before recording the original content
        processedArgs.splice(0, 2); 
      } else {
        // Prepend stream identifier if no styling is applied but a name exists
        if (streamIdentifier !== undefined) {
          processedArgs.unshift(`[${streamIdentifier}]`);
        }
        // Execute the native console method without custom styling
        consoleMethod.apply(nativeConsole, processedArgs);
      }

      // Record the log entry with a timestamp
      const timestampedEntry = [...processedArgs, new Date().toISOString()];
      recordedEntries.push(timestampedEntry);
    };

    /**
     * Retrieves or creates a named logging substream.
     * @param {string} streamName - The unique identifier for the substream.
     * @param {object} [streamConfig] - Configuration options for the new substream.
     * @returns {DebugStreamManager} The requested logging substream instance.
     */
    this.obtainStream = function (streamName, streamConfig) {
      if (typeof streamName !== 'string' || streamName.trim() === '') {
        console.warn("Invalid stream name provided. Must be a non-empty string.");
        return this; // Return current instance or throw error
      }

      let currentSubstream = managedSubstreams[streamName];

      if (!currentSubstream) {
        // Create a new substream if it doesn't exist
        const mergedConfig = Object.assign({}, currentSettings, streamConfig); // Inherit parent settings
        currentSubstream = new DebugStreamManager(nativeConsole, streamName, mergedConfig);
        managedSubstreams[streamName] = currentSubstream;
      }

      return currentSubstream;
    };

    /**
     * Activates logging for this stream or a specific named substream.
     * @param {string} [targetName] - The identifier of a substream to activate. If omitted, activates this stream.
     */
    this.enableLogging = function (targetName) {
      if (typeof targetName === 'string' && managedSubstreams[targetName]) {
        managedSubstreams[targetName].enableLogging();
      } else {
        currentSettings.loggingEnabled = true;
      }
    };

    /**
     * Deactivates logging for this stream or a specific named substream.
     * @param {string} [targetName] - The identifier of a substream to deactivate. If omitted, deactivates this stream.
     */
    this.disableLogging = function (targetName) {
      if (typeof targetName === 'string' && managedSubstreams[targetName]) {
        managedSubstreams[targetName].disableLogging();
      } else {
        currentSettings.loggingEnabled = false;
      }
    };
    
    /**
     * Toggles the console styling for this stream.
     * @param {boolean} [shouldStyle] - Explicitly set styling on/off. If omitted, toggles current state.
     */
    this.toggleStyling = function(shouldStyle) {
      currentSettings.enableStyling = (typeof shouldStyle === 'boolean') ? shouldStyle : !currentSettings.enableStyling;
    };

    /**
     * Retrieves a copy of all recorded log entries for this stream.
     * @returns {Array<Array>} An array of log entry arrays.
     */
    this.retrieveEntries = function () {
      // Return a shallow copy to prevent external modification of the internal buffer
      return [...recordedEntries];
    };

    /**
     * Sets the foreground color for styled log messages.
     * @param {string} newColorValue - The CSS color value (e.g., '#FF0000', 'blue').
     */
    this.setTextStyle = function (newColorValue) {
      if (typeof newColorValue === 'string' && newColorValue.trim() !== '') {
        currentSettings.textStyle = newColorValue;
      } else {
        console.warn("Invalid color value provided for text style.");
      }
    };

    /**
     * Sets the background color for styled log messages.
     * @param {string} newBgValue - The CSS color value (e.g., '#000000', 'black').
     */
    this.setBackgroundStyle = function (newBgValue) {
      if (typeof newBgValue === 'string' && newBgValue.trim() !== '') {
        currentSettings.backgroundStyle = newBgValue;
      } else {
        console.warn("Invalid color value provided for background style.");
      }
    };
    
    // Expose common console methods, wrapping them with our custom dispatcher
    this.assertionFailed = function () { dispatchAndRecord(arguments, 'assert'); };
    this.clearConsole = function () { dispatchAndRecord(arguments, 'clear'); };
    this.countEvent = function () { dispatchAndRecord(arguments, 'count'); };
    this.debugMessage = function () { dispatchAndRecord(arguments, 'debug'); };
    this.directoryListing = function () { dispatchAndRecord(arguments, 'dir'); };
    this.xmlDirectoryListing = function () { dispatchAndRecord(arguments, 'dirxml'); };
    this.errorMessage = function () { dispatchAndRecord(arguments, 'error'); };
    this.groupStart = function () { dispatchAndRecord(arguments, 'group'); };
    this.groupStartCollapsed = function () { dispatchAndRecord(arguments, 'groupCollapsed'); };
    this.groupEnd = function () { dispatchAndRecord(arguments, 'groupEnd'); };
    this.informationalMessage = function () { dispatchAndRecord(arguments, 'info'); };
    this.logMessage = function () { dispatchAndRecord(arguments, 'log'); };
    this.timerStart = function () { dispatchAndRecord(arguments, 'time'); };
    this.timerEnd = function () { dispatchAndRecord(arguments, 'timeEnd'); };
    this.stackTrace = function () { dispatchAndRecord(arguments, 'trace'); };
    this.warningMessage = function () { dispatchAndRecord(arguments, 'warn'); };
  }

  // Attempt to replace the global console object with our custom manager
  try {
    if (window && typeof window.console !== 'undefined') {
      window.console = new DebugStreamManager(originalConsoleReference);
    } else {
      // Fallback if window.console doesn't exist (e.g., some non-browser environments)
      console.warn("window.console not found, custom logger will not be fully active.");
    }
  } catch (err) {
    console.error("Failed to override window.console:", err);
  }

})();