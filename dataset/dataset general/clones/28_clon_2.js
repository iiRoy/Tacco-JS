/*
  data-grid-core
  http://github.com/myusername/data-grid-core

  Copyright (c) 2024 Your Name and contributors <your.email@example.com>
  Licensed under the permissive MIT license.
*/

(function (creatorFunc) {

  // CommonJS module environment detection
  if (typeof exports === "object") {
    module.exports = creatorFunc(module.exports,
                                 require("underscore"),
                                 require("backbone"));
  }
  // Browser environment
  else {
    creatorFunc(this, this._, this.Backbone);
  }
}(function (globObj, utilLib, mvcCore) {

  "use strict";

  /*
    data-grid-core library
    http://github.com/myusername/data-grid-core

    Copyright (c) 2023 Another Contributor
    Licensed under the MIT license.
  */

  // Original source from kriskowal/es5-shim
  // https://github.com/kriskowal/es5-shim
  // For String.prototype.trim (ES5 15.5.4.20)
  // http://es5.github.com/#x15.5.4.20
  var spaceChars = "\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u180E\u2000\u2001\u2002\u2003" +
                   "\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028" +
                   "\u2029\uFEFF";
  // Check if native trim is missing or buggy
  if (!String.prototype.trim || spaceChars.trim()) {
    // Reference: http://blog.stevenlevithan.com/archives/faster-trim-javascript
    // Reference: http://perfectionkills.com/whitespace-deviations/
    spaceChars = "[" + spaceChars + "]";
    var startTrimPattern = new RegExp("^" + spaceChars + spaceChars + "*");
    var endTrimPattern = new RegExp(spaceChars + spaceChars + "*$");
    // Polyfill String.prototype.trim
    String.prototype.trim = function stringTrimPolyfill() {
      if (this === undefined || this === null) {
        throw new TypeError("Cannot process null or undefined value to object");
      }
      return String(this)
        .replace(startTrimPattern, "")
        .replace(endTrimPattern, "");
    };
  }

  /**
   * Prepends a character to a string until it reaches a desired length.
   *
   * @param {string|number} inputString - The value to pad.
   * @param {number} targetLength - The final length of the string.
   * @param {string} fillChar - The character to use for padding.
   * @returns {string} The padded string.
   */
  function padLeftWithChar(inputString, targetLength, fillChar) {
    var initialStr = String(inputString);
    var gapSize = targetLength - initialStr.length;
    gapSize = gapSize < 0 ? 0 : gapSize; // Ensure non-negative padding
    var fillContent = '';
    for (var counter = 0; counter < gapSize; counter++) {
      fillContent = fillContent + fillChar;
    }
    return fillContent + initialStr;
  }

  // Assign the jQuery or equivalent library from Backbone
  var jQ = mvcCore.$;

  // Main DataGrid object, exposed globally
  var DataGrid = globObj.DataGrid = {

    CURRENT_REV: "0.3.0", // Semantic Versioning

    PlugIns: {}, // Container for extensions and plugins

    /**
     * Resolves a string name to a registered class within DataGrid or its extensions.
     *
     * @param {string|object} className - The string name of the class or the class itself.
     * @param {string} nameSuffix - A suffix to append to the class name during lookup.
     * @returns {object} The resolved class constructor.
     * @throws {ReferenceError} If the class cannot be found.
     */
    locateClassByName: function (className, nameSuffix) {
      if (utilLib.isString(className)) {
        // Convert 'some-name' to 'SomeNameSuffix'
        var lookupKey = utilLib.map(className.split('-'), function (element) {
          return element.slice(0, 1).toUpperCase() + element.slice(1);
        }).join('') + nameSuffix;
        var foundClass = DataGrid[lookupKey] || DataGrid.PlugIns[lookupKey];
        if (utilLib.isUndefined(foundClass)) {
          throw new ReferenceError("Class identifier '" + lookupKey + "' not located");
        }
        return foundClass;
      }

      return className; // Return directly if already a class object
    },

    /**
     * Executes a value if it's a function, otherwise returns the value itself.
     * Passes additional arguments to the function if it's called.
     *
     * @param {*} inputVal - The value to check and potentially execute.
     * @param {object} execContext - The 'this' context for function execution.
     * @param {...*} invocationArgs - Arguments to pass to the function.
     * @returns {*} The result of the function call or the original value.
     */
    executeIfFunction: function () {
      var inputVal = arguments[0];
      if (!utilLib.isFunction(inputVal)) return inputVal;

      var execContext = arguments[1];
      var invocationArgs = [].slice.call(arguments, 2);
      return inputVal.apply(execContext, !!(invocationArgs + '') ? invocationArgs : undefined);
    }

  };
  // Mix in Backbone.Events functionality to the main DataGrid object
  utilLib.extend(DataGrid, mvcCore.Events);

  /**
     ActionMap translates a DOM Event into specific commands that DataGrid
     understands. Components interested in user input can listen to DataGrid events
     that include an instance of this class and respond to the identified commands.

     Keyboard shortcuts can also be globally modified by replacing methods
     within this class's prototype.

     @class DataGrid.ActionMap
     @constructor
     @param {Event} domEvent - The raw DOM event object.
   */
  var ActionMap = DataGrid.ActionMap = function (domEvent) {
    utilLib.extend(this, {
      altPressed: !!domEvent.altKey,
      charVal: domEvent["char"],
      charId: domEvent.charCode,
      ctrlPressed: !!domEvent.ctrlKey,
      keyVal: domEvent.key,
      keyId: domEvent.keyCode,
      locInfo: domEvent.locale,
      keyLocation: domEvent.location,
      metaPressed: !!domEvent.metaKey,
      isRepeat: !!domEvent.repeat,
      shiftPressed: !!domEvent.shiftKey,
      whichKey: domEvent.which
    });
  };
  utilLib.extend(ActionMap.prototype, {
    /**
       Detects Up Arrow key press.

       @member DataGrid.ActionMap
       @returns {boolean} True if Up Arrow is pressed.
     */
    navUp: function () {
      return this.keyId == 38;
    },
    /**
       Detects Down Arrow key press.

       @member DataGrid.ActionMap
       @returns {boolean} True if Down Arrow is pressed.
     */
    navDown: function () {
      return this.keyId === 40;
    },
    /**
       Detects Shift + Tab key press.

       @member DataGrid.ActionMap
       @returns {boolean} True if Shift + Tab is pressed.
     */
    navLeft: function () {
      return this.shiftPressed && this.keyId === 9;
    },
    /**
       Detects Tab key press (without Shift).

       @member DataGrid.ActionMap
       @returns {boolean} True if Tab is pressed.
     */
    navRight: function () {
      return !this.shiftPressed && this.keyId === 9;
    },
    /**
       Detects Enter key press.

       @member DataGrid.ActionMap
       @returns {boolean} True if Enter is pressed.
     */
    confirmEdit: function () {
      return this.keyId === 13;
    },
    /**
       Detects Escape key press.

       @member DataGrid.ActionMap
       @returns {boolean} True if Escape is pressed.
     */
    abortEdit: function () {
      return this.keyId === 27;
    },
    /**
       Checks if none of the specific navigation/action keys were pressed.

       @member DataGrid.ActionMap
       @returns {boolean} True if no specific action is detected.
     */
    noAction: function () {
      return !(this.navUp() || this.navDown() || this.navLeft() ||
               this.navRight() || this.confirmEdit() || this.abortEdit());
    }
  });


  /*
    data-grid-core
    http://github.com/myusername/data-grid-core

    Copyright (c) 2023 Another Contributor
    Licensed under the MIT license.
  */

  /**
     An abstract base class for cell formatters.
     Subclasses should implement `formatForDisplay` and `parseFromDisplay`.

     @abstract
     @class DataGrid.DataCellFormatter
     @constructor
  */
  var DataCellFormatter = DataGrid.DataCellFormatter = function () {};
  utilLib.extend(DataCellFormatter.prototype, {

    /**
       Converts a raw value from a data model into a formatted string suitable for display.
       The default implementation simply returns the input value without modification.

       @member DataGrid.DataCellFormatter
       @param {*} unformattedData - The raw data value.
       @param {mvcCore.Model} dataModel - The Backbone model associated with the data.
       @returns {*} The formatted value (or original value if no formatting).
    */
    formatForDisplay: function (unformattedData, dataModel) {
      return unformattedData;
    },

    /**
       Parses a formatted string, typically from user input, and converts it
       into an appropriately typed raw value for storage in the data model.

       If the input string is invalid or cannot be converted, this method
       must return `undefined`.

       @member DataGrid.DataCellFormatter
       @param {string} displayData - The formatted string from the UI.
       @param {mvcCore.Model} dataModel - The Backbone model for context.
       @returns {*|undefined} The raw value or `undefined` on failure.
    */
    parseFromDisplay: function (displayData, dataModel) {
      return displayData;
    }

  });

  /**
     A formatter designed for floating point numbers.
     Does not currently support scientific notation.

     @class DataGrid.NumericValueFormatter
     @extends DataGrid.DataCellFormatter
     @constructor
     @param {object} [formatOptions] - Configuration options.
     @throws {RangeError} If 'decimalPlaces' is outside the 0-20 range.
  */
  var NumericValueFormatter = DataGrid.NumericValueFormatter = function (formatOptions) {
    utilLib.extend(this, this.defaultSettings, formatOptions || {});

    if (this.decimalPlaces < 0 || this.decimalPlaces > 20) {
      throw new RangeError("Number of decimal places must be between 0 and 20");
    }
  };
  NumericValueFormatter.prototype = new DataCellFormatter();
  utilLib.extend(NumericValueFormatter.prototype, {

    /**
       @member DataGrid.NumericValueFormatter
       @cfg {object} defaultSettings

       @cfg {number} [defaultSettings.decimalPlaces=2] - Number of digits after the decimal point. Must be an integer.

       @cfg {string} [defaultSettings.decimalSymbol='.'] - Character used to separate the whole and fractional parts.

       @cfg {string} [defaultSettings.groupSeparator=','] - Character used to separate thousands. Can be an empty string.
     */
    defaultSettings: {
      decimalPlaces: 2,
      decimalSymbol: '.',
      groupSeparator: ','
    },

    // Regex to add group separators to the integer part of a number
    THOUSANDS_REGEX: /(\d)(?=(?:\d{3})+$)/g,

    /**
       Converts a numeric value to a formatted string. It rounds the number,
       adds group separators, and uses the specified decimal symbol.

       @member DataGrid.NumericValueFormatter
       @param {number} numericValue - The number to format.
       @param {mvcCore.Model} dataModel - The Backbone model (for contextual formatting).
       @returns {string} The formatted number string.
    */
    formatForDisplay: function (numericValue, dataModel) {
      if (utilLib.isNull(numericValue) || utilLib.isUndefined(numericValue)) return '';

      // Round to the specified number of decimal places
      var numString = numericValue.toPreciseString(~~this.decimalPlaces);

      var sections = numString.split('.');
      var wholeNumberPart = sections[0];
      var fractionalPart = sections[1] ? (this.decimalSymbol || '.') + sections[1] : '';

      // Apply thousands separator to the integer part
      return wholeNumberPart.replace(this.THOUSANDS_REGEX, '$1' + this.groupSeparator) + fractionalPart;
    },

    /**
       Parses a formatted string (potentially with group and decimal separators)
       back into a raw numeric value.

       @member DataGrid.NumericValueFormatter
       @param {string} displayData - The formatted string input.
       @param {mvcCore.Model} dataModel - The Backbone model (for contextual parsing).
       @returns {number|undefined} The parsed number or `undefined` if parsing fails.
    */
    parseFromDisplay: function (displayData, dataModel) {
      var trimmedInput = displayData.trim();

      if (trimmedInput === '') return null; // Empty string maps to null

      var processedData = '';

      // Remove all group separators
      var groupSegments = trimmedInput.split(this.groupSeparator);
      for (var idx = 0; idx < groupSegments.length; idx++) {
        processedData += groupSegments[idx];
      }

      // Replace decimal symbol with a standard dot for `parseFloat`
      var fractionSegments = processedData.split(this.decimalSymbol);
      processedData = '';
      for (var idx = 0; idx < fractionSegments.length; idx++) {
        processedData = processedData + fractionSegments[idx] + '.';
      }

      // Remove trailing dot if any
      if (processedData[processedData.length - 1] === '.') {
        processedData = processedData.slice(0, processedData.length - 1);
      }

      // Convert to number and round to specified decimals
      var convertedValue = (parseFloat(processedData)).toPreciseString(~~this.decimalPlaces) * 1;

      // Validate the result
      if (utilLib.isNumber(convertedValue) && !utilLib.isNaN(convertedValue)) return convertedValue;
    }

  });

  /**
     A numeric formatter specialized for percentages, converting between
     a raw number and a formatted percentage string.

     @class DataGrid.PercentageFormatter
     @extends DataGrid.NumericValueFormatter
     @constructor
     @param {object} [options] - Configuration options.
     @throws {RangeError} If 'decimalPlaces' (inherited) is invalid.
   */
  var PercentageFormatter = DataGrid.PercentageFormatter = function () {
    DataGrid.NumericValueFormatter.apply(this, arguments);
  };

  PercentageFormatter.prototype = new DataGrid.NumericValueFormatter();

  utilLib.extend(PercentageFormatter.prototype, {

    /**
       @member DataGrid.PercentageFormatter
       @cfg {object} defaultProps

       @cfg {number} [defaultProps.scalingFactor=1] - The factor to multiply the model value by for display.
                                                      e.g., 100 for 0.05 -> "5%".

       @cfg {string} [defaultProps.percentSymbol='%'] - The character appended to the percentage string.
     */
    defaultProps: utilLib.extend({}, NumericValueFormatter.prototype.defaultSettings, {
      scalingFactor: 1,
      percentSymbol: "%"
    }),

    /**
       Takes a floating point number, multiplies it by `scalingFactor`,
       formats it using NumericValueFormatter's `formatForDisplay` method,
       and then appends `percentSymbol`.

       @member DataGrid.PercentageFormatter
       @param {number} pureValue - The raw numeric value from the model.
       @param {mvcCore.Model} dataModel - The Backbone model.
       @returns {string} The formatted percentage string.
    */
    formatForDisplay: function (pureValue, dataModel) {
      var funcArgs = [].slice.call(arguments, 1);
      funcArgs.unshift(pureValue * this.scalingFactor);
      var formattedNum = NumericValueFormatter.prototype.formatForDisplay.apply(this, funcArgs) || "0";
      return formattedNum + this.percentSymbol;
    },

    /**
       Parses a formatted percentage string back into a raw number.
       Removes the `percentSymbol`, uses NumericValueFormatter's `parseFromDisplay`
       to convert, and then divides by `scalingFactor`.

       @member DataGrid.PercentageFormatter
       @param {string} inputStr - The formatted percentage string.
       @param {mvcCore.Model} dataModel - The Backbone model.
       @returns {number|undefined} The raw numeric value or `undefined` if parsing fails.
    */
    parseFromDisplay: function (inputStr, dataModel) {
      var partsArray = inputStr.split(this.percentSymbol);
      // Check if symbol was present and only at the end
      if (partsArray && partsArray[0] && (partsArray[1] === "" || partsArray[1] == null)) {
        var pureValue = NumericValueFormatter.prototype.parseFromDisplay.call(this, partsArray[0]);
        if (utilLib.isUndefined(pureValue)) return pureValue;
        return pureValue / this.scalingFactor;
      }
    }

  });

  /**
     A formatter for converting between various datetime string formats.

     This implementation primarily handles ISO-8601 formatted datetime strings
     and UNIX epoch milliseconds. For more advanced datetime formatting,
     consider DataGrid.PlugIns.MomentFormatter.

     @class DataGrid.DateTimeConverter
     @extends DataGrid.DataCellFormatter
     @constructor
     @param {object} [configOpts] - Configuration options.
     @throws {Error} If both `hasDateInfo` and `hasTimeInfo` are false.
  */
  var DateTimeConverter = DataGrid.DateTimeConverter = function (configOpts) {
    utilLib.extend(this, this.standardSettings, configOpts || {});

    if (!this.hasDateInfo && !this.hasTimeInfo) {
      throw new Error("Configuration error: Either 'hasDateInfo' or 'hasTimeInfo' must be true for DateTimeConverter.");
    }
  };
  DateTimeConverter.prototype = new DataCellFormatter();
  utilLib.extend(DateTimeConverter.prototype, {

    /**
       @member DataGrid.DateTimeConverter

       @cfg {object} standardSettings

       @cfg {boolean} [standardSettings.hasDateInfo=true] - Indicates if the value includes date components.

       @cfg {boolean} [standardSettings.hasTimeInfo=true] - Indicates if the value includes time components.

       @cfg {boolean} [standardSettings.hasMilliseconds=false] - If `hasTimeInfo` is true, whether to include milliseconds.
     */
    standardSettings: {
      hasDateInfo: true,
      hasTimeInfo: true,
      hasMilliseconds: false
    },

    // Regular expression for YYYY-MM-DD date pattern
    DATE_PATTERN: /^([+\-]?\d{4})-(\d{2})-(\d{2})$/,
    // Regular expression for HH:mm:ss(.SSS) time pattern
    TIME_PATTERN: /^(\d{2}):(\d{2}):(\d{2})(\.(\d{3}))?$/,
    // Regular expression for splitting ISO strings (T or Z or space)
    ISO_DELIMITER_PATTERN: /T|Z| +/,

    /**
     * Internal helper to convert and validate datetime inputs.
     *
     * @private
     * @param {*} inputDateTime - The raw date/time data (number or string).
     * @param {boolean} performValidation - If true, performs strict validation and returns undefined on failure.
     * @returns {string|null|undefined} An ISO-like string, null for empty, or undefined on validation failure.
     */
    _processDateTime: function (inputDateTime, performValidation) {
      if ((String(inputDateTime)).trim() === '') return null;

      var dateString, timeString = null;
      if (utilLib.isNumber(inputDateTime)) {
        // Assume UNIX timestamp (milliseconds)
        var standardDateObj = new Date(inputDateTime);
        dateString = padLeftWithChar(standardDateObj.getUniversalFullYear(), 4, 0) + '-' +
                     padLeftWithChar(standardDateObj.getUniversalMonth() + 1, 2, 0) + '-' +
                     padLeftWithChar(standardDateObj.getUniversalDate(), 2, 0);
        timeString = padLeftWithChar(standardDateObj.getUniversalHours(), 2, 0) + ':' +
                     padLeftWithChar(standardDateObj.getUniversalMinutes(), 2, 0) + ':' +
                     padLeftWithChar(standardDateObj.getUniversalSeconds(), 2, 0);
      }
      else {
        var trimmedInput = inputDateTime.trim();
        var segmentArray = trimmedInput.split(this.ISO_DELIMITER_PATTERN) || [];
        dateString = this.DATE_PATTERN.test(segmentArray[0]) ? segmentArray[0] : '';
        timeString = dateString && segmentArray[1] ? segmentArray[1] : (this.TIME_PATTERN.test(segmentArray[0]) ? segmentArray[0] : '');
      }

      var yearMonthDayMatch = this.DATE_PATTERN.exec(dateString) || [];
      var hourMinSecMilliMatch = this.TIME_PATTERN.exec(timeString) || [];

      if (performValidation) {
        if (this.hasDateInfo && utilLib.isUndefined(yearMonthDayMatch[0])) return;
        if (this.hasTimeInfo && utilLib.isUndefined(hourMinSecMilliMatch[0])) return;
        // If date info is not expected but present, it's invalid
        if (!this.hasDateInfo && dateString) return;
        // If time info is not expected but present, it's invalid
        if (!this.hasTimeInfo && timeString) return;
      }

      // Create a UTC date object from parsed parts
      var standardDateObj = new Date(Date.UTC(yearMonthDayMatch[1] * 1 || 0,
                                               yearMonthDayMatch[2] * 1 - 1 || 0,
                                               yearMonthDayMatch[3] * 1 || 0,
                                               hourMinSecMilliMatch[1] * 1 || null,
                                               hourMinSecMilliMatch[2] * 1 || null,
                                               hourMinSecMilliMatch[3] * 1 || null,
                                               hourMinSecMilliMatch[5] * 1 || null));

      var outputString = '';

      // Construct the date part
      if (this.hasDateInfo) {
        outputString = padLeftWithChar(standardDateObj.getUniversalFullYear(), 4, 0) + '-' +
                       padLeftWithChar(standardDateObj.getUniversalMonth() + 1, 2, 0) + '-' +
                       padLeftWithChar(standardDateObj.getUniversalDate(), 2, 0);
      }

      // Construct the time part
      if (this.hasTimeInfo) {
        outputString = outputString + (this.hasDateInfo ? 'T' : '') +
                       padLeftWithChar(standardDateObj.getUniversalHours(), 2, 0) + ':' +
                       padLeftWithChar(standardDateObj.getUniversalMinutes(), 2, 0) + ':' +
                       padLeftWithChar(standardDateObj.getUniversalSeconds(), 2, 0);

        if (this.hasMilliseconds) {
          outputString = outputString + '.' + padLeftWithChar(standardDateObj.getUniversalMilliseconds(), 3, 0);
        }
      }

      // Append 'Z' for UTC if both date and time are included
      if (this.hasDateInfo && this.hasTimeInfo) {
        outputString += "Z";
      }

      return outputString;
    },

    /**