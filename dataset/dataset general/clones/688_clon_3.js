const ioProvider = require('fs');

// This self-executing anonymous function establishes a private scope
// to prevent global variable pollution and encapsulate the utility library.
(function () {

  // A direct reference to the global object, which can be `window` in a browser
  // environment or `global` in a Node.js runtime.
  const globalContext = this;

  // The primary container object for our date and time processing utilities.
  // It will be populated with functions designed to assist with temporal data.
  let TemporalHelpers = {};

  // This block handles the exposure of the `TemporalHelpers` object
  // to the appropriate environment.
  // In a Node.js context, it's assigned to `module.exports`.
  // In a browser or other environment, it's attached to the global object.
  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = TemporalHelpers;
  } else {
    globalContext.TemporalHelpers = TemporalHelpers;
  }

  /**
   * Configures and initializes an external timezone management library.
   * This involves setting up default behaviors, file paths, and the data retrieval mechanism.
   *
   * @param {object} tzEngine - The external timezone library instance (e.g., a timezoneJS object).
   * @param {object} setupConfig - An object containing user-defined configuration options.
   * @returns {object} The fully configured instance of the timezone engine.
   * @throws {Error} If the provided timezone engine is invalid or incomplete.
   */
  const initializeDateEngine = function (tzEngine, setupConfig) {
    // A robust check to ensure that a valid timezone engine object has been supplied.
    // Without a proper engine, configuration cannot proceed.
    if (!tzEngine || typeof tzEngine.timezone === 'undefined' || typeof tzEngine.timezone.init !== 'function') {
      throw new Error('Critical: An invalid or incomplete timezone engine was provided for initialization. Cannot proceed.');
    }

    // Establish a set of default operational parameters for the engine.
    const defaultSettings = {
      isAsynchronous: false, // Default to synchronous data loading to simplify initial setup.
      dataLoadStrategy: tzEngine.timezone.loadingSchemes.LAZY_LOAD // Load timezone data only when needed.
    };

    // Merge the default settings with any custom configurations provided by the user.
    // `Object.assign` creates a new object, ensuring defaults are not mutated and custom settings override them.
    const effectiveConfig = Object.assign({}, defaultSettings, setupConfig);

    // --- Resetting the internal state of the timezone engine ---
    // This crucial step ensures that any previous configurations or loaded data are cleared,
    // providing a clean slate for the current initialization.
    tzEngine.timezone.zones = {};           // Erase all previously defined timezone zones.
    tzEngine.timezone.rules = {};           // Clear out all associated timezone rules.
    tzEngine.timezone.loadedZones = {};     // Invalidate the cache of previously loaded zone data.

    // --- Applying core configuration settings to the timezone engine ---
    // Define the base directory from which timezone data files will be fetched.
    // This path is relative to where the application expects to find the data.
    tzEngine.timezone.dataDirectory = 'lib/tz'; // Example: 'lib/tz' for zone files.

    /**
     * Custom data transport function for the timezone engine.
     * This function is responsible for fetching timezone data files,
     * supporting both asynchronous and synchronous retrieval methods.
     *
     * @param {object} requestParams - Parameters for the data fetch operation.
     * @param {string} requestParams.fileUrl - The URL or path to the timezone data file.
     * @param {boolean} requestParams.isAsynchronous - Flag to perform an async fetch.
     * @param {function} [requestParams.onSuccess] - Callback for successful async data retrieval.
     * @param {function} [requestParams.onError] - Callback for errors during async data retrieval.
     * @returns {string|undefined} File contents for synchronous operations, or undefined for async.
     * @throws {Error} For critical synchronous file read failures.
     */
    tzEngine.timezone.dataFetcher = function (requestParams) {
      // Input validation: Ensure a file URL is specified before attempting any I/O.
      if (!requestParams || typeof requestParams.fileUrl !== 'string' || requestParams.fileUrl.trim() === '') {
        console.warn('Data fetcher invoked without a valid file URL. Operation aborted.');
        return; // Exit early if essential parameters are missing.
      }

      // The standard encoding format for all timezone data files.
      const dataFileEncoding = 'utf8';

      // Branch for asynchronous file reading operations.
      if (requestParams.isAsynchronous) {
        // Asynchronous operations critically depend on a success callback.
        if (typeof requestParams.onSuccess !== 'function') {
          console.error('Asynchronous data fetching requires a defined success callback function.');
          return; // Cannot complete async operation without a success handler.
        }
        // Establish an error handler; use a provided one or a default console error.
        const errorHandler = requestParams.onError || ((err) => console.error('Asynchronous data fetch encountered an error:', err));

        // Utilize Node.js `fs.readFile` for non-blocking file access.
        return ioProvider.readFile(requestParams.fileUrl, dataFileEncoding, (readError, fileContents) => {
          if (readError) {
            return errorHandler(readError); // Invoke error handler on failure.
          }
          return requestParams.onSuccess(fileContents); // Invoke success handler with retrieved data.
        });
      }

      // Branch for synchronous file reading operations.
      // This is typically used in environments where blocking I/O is acceptable or required.
      try {
        // Utilize Node.js `fs.readFileSync` for blocking file access.
        return ioProvider.readFileSync(requestParams.fileUrl, dataFileEncoding);
      } catch (syncReadError) {
        // Log and re-throw synchronous read errors as they are often critical and unrecoverable.
        console.error('Synchronous file read failed for URL:', requestParams.fileUrl, syncReadError);
        throw syncReadError; // Propagate the error up the call stack.
      }
    };

    // Apply the chosen data loading strategy (e.g., LAZY_LOAD, PRELOAD) to the engine.
    tzEngine.timezone.dataLoadStrategy = effectiveConfig.dataLoadStrategy;

    // Execute the core initialization routine of the timezone engine itself,
    // passing the finalized configuration.
    tzEngine.timezone.init(effectiveConfig);

    // Return the now fully configured and ready-to-use timezone engine instance.
    return tzEngine;
  };

  /**
   * Provides access to an initialized instance of the timezone engine.
   * This function serves as the public entry point for obtaining the configured date/time library.
   *
   * @param {object} customOptions - Optional configuration overrides for the engine's initialization.
   * @returns {object} The configured timezone engine.
   */
  TemporalHelpers.obtainTimezoneHandler = function (customOptions) {
    // Dynamically load the core date module from its expected relative path.
    // This assumes the module provides the base timezone engine object.
    const coreDateModule = require('../src/date');
    // Delegate to the internal initialization function with the loaded module and options.
    return initializeDateEngine(coreDateModule, customOptions);
  };

  /**
   * Converts an ISO 8601 formatted date/time string into a standard JavaScript Date object.
   * This function is designed to be robust, handling various optional components of the ISO 8601 standard,
   * including dates, times, milliseconds, and timezone offsets.
   *
   * @param {string} isoFormattedStr - The input string formatted according to ISO 8601.
   * @returns {Date|null} A `Date` object representing the parsed timestamp, or `null` if the input
   *                      string is invalid or cannot be parsed. Returns `new Date(NaN)` for malformed offsets.
   */
  TemporalHelpers.decodeIsoTimestamp = function (isoFormattedStr) {
    // Initial validation: Check if the input is a non-empty string.
    if (typeof isoFormattedStr !== 'string' || isoFormattedStr.trim() === '') {
      console.warn('Attempted to parse an invalid or empty ISO timestamp string. Returning null.');
      return null;
    }

    // A comprehensive regular expression pattern to capture all possible components
    // of an ISO 8601 date-time string. Each part (year, month, day, hour, minute,
    // second, millisecond, and timezone offset) is captured in a separate group.
    const isoParsingPattern = new RegExp(
      '^(?:([+-]?[0-9]{4,})(?:-([0-9]{2})(?:-([0-9]{2}))?)?)?' + // Group 1: Year (mandatory), Groups 2,3: Month, Day (optional)
      '(?:T(?:([0-9]{2})(?::([0-9]{2})(?::([0-9]{2})(?:\\.' +    // Group 4: Hour, Group 5: Minute, Group 6: Second (optional)
      '([0-9]{3}))?)?)?)?(Z|[-+][0-9]{2}:[0-9]{2})?)?$'           // Group 7: Milliseconds (optional), Group 8: Timezone (Z or offset, optional)
    );

    // Execute the regex against the input string.
    const parseOutcome = isoFormattedStr.match(isoParsingPattern);

    // If the regex does not find any matches, the string is not a valid ISO 8601 format.
    if (!parseOutcome) {
      return null;
    }

    /**
     * Helper function to safely extract and parse a numeric component from the regex match result.
     * It handles `undefined` capture groups by returning a specified default value.
     *
     * @param {number} groupIndex - The index of the capture group in the regex result array.
     * @param {number} defaultValue - The default numeric value to return if the group is not matched.
     * @returns {number} The parsed integer value or the default value.
     */
    const getNumericPart = (groupIndex, defaultValue) => {
      const capturedValue = parseOutcome[groupIndex];
      return capturedValue !== undefined ? parseInt(capturedValue, 10) : defaultValue;
    };

    // Extract all date and time components into a structured object using the helper function.
    // Default values are set for optional parts, ensuring `Date.UTC` receives valid numbers.
    const dateTimeComponents = {
      fullYear: getNumericPart(1, 0),        // Year (e.g., 2023).
      monthIndex: getNumericPart(2, 1),      // Month (1-12, will be adjusted to 0-11 for Date.UTC).
      dayOfMonth: getNumericPart(3, 1),      // Day (1-31).
      hourOfDay: getNumericPart(4, 0),       // Hour (0-23).
      minuteOfHour: getNumericPart(5, 0),    // Minute (0-59).
      secondOfMinute: getNumericPart(6, 0),  // Second (0-59).
      millisecondValue: getNumericPart(7, 0),// Millisecond (0-999).
      zoneOffsetString: parseOutcome[8] || "Z" // Timezone offset string (e.g., "Z", "+01:00").
    };

    // Construct a UTC timestamp from the extracted components.
    // Crucially, `Date.UTC` expects the month to be 0-indexed (0 for January, 11 for December),
    // so we subtract 1 from the parsed month value.
    let utcEpochTime = Date.UTC(
      dateTimeComponents.fullYear,
      dateTimeComponents.monthIndex - 1, // Adjust month to be 0-indexed.
      dateTimeComponents.dayOfMonth,
      dateTimeComponents.hourOfDay,
      dateTimeComponents.minuteOfHour,
      dateTimeComponents.secondOfMinute,
      dateTimeComponents.millisecondValue
    );

    // If a timezone offset other than "Z" (Zulu/UTC) is specified, apply the adjustment.
    if (dateTimeComponents.zoneOffsetString !== "Z") {
      // Regular expression to parse the timezone offset string (e.g., "+HH:MM" or "-HH").
      const offsetPattern = /([-+][0-9]{2})(?::([0-9]{2}))?/;
      const offsetMatch = dateTimeComponents.zoneOffsetString.match(offsetPattern);

      // If the offset string is present but malformed (doesn't match the expected pattern),
      // return an invalid date object (`new Date(NaN)`) to indicate a parsing failure.
      if (!offsetMatch) {
        return new Date(NaN);
      }

      // Extract the hours and minutes from the matched offset string.
      const offsetHours = parseInt(offsetMatch[1], 10);
      const offsetMinutes = parseInt(offsetMatch[2] || '0', 10); // Default to 0 if minutes are omitted.

      // Calculate the total offset in milliseconds.
      // 1 hour = 60 minutes * 60 seconds * 1000 milliseconds.
      // 1 minute = 60 seconds * 1000 milliseconds.
      const totalOffsetMillis = (offsetHours * 3600000) + (offsetMinutes * 60000);

      // Subtract the calculated offset from the UTC epoch time.
      // This effectively converts the local time (implied by the offset) to its UTC equivalent.
      utcEpochTime -= totalOffsetMillis;
    }

    // Create and return a new Date object based on the final UTC epoch time.
    return new Date(utcEpochTime);
  };

}).call(this);