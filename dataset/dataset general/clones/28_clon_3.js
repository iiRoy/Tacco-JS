(function (packageExportBuilder) {

  // CommonJS environment detection
  if (typeof exports === "object" && typeof module !== "undefined") {
    module.exports = packageExportBuilder(module.exports,
                                          require("underscore"),
                                          require("backbone"));
  }
  // Browser environment detection
  else packageExportBuilder(this, this._, this.Backbone);
}(function (globalScope, utilLib, ModelFramework) {

  "use strict";
/*
  data-grid-core
  http://github.com/yourusername/data-grid-core

  Copyright (c) 2024 Your Name and contributors
  Licensed under the MIT license.
*/

// Polyfill for String.prototype.trim, adapted from ES5 shim
// Based on: https://github.com/kriskowal/es5-shim
// ES5 15.5.4.20: http://es5.github.com/#x15.5.4.20
var potentialTrimChars = "\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u180E\u2000\u2001\u2002\u2003" +
  "\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028" +
  "\u2029\uFEFF";
if (!String.prototype.trim || potentialTrimChars.trim()) {
  // Utilizing a faster trim algorithm, see references for details:
  // http://blog.stevenlevithan.com/archives/faster-trim-javascript
  // http://perfectionkills.com/whitespace-deviations/
  var trimRegexStr = "[" + potentialTrimChars + "]";
  var leadingTrimPattern = new RegExp("^" + trimRegexStr + trimRegexStr + "*");
  var trailingTrimPattern = new RegExp(trimRegexStr + trimRegexStr + "*$");
  String.prototype.trim = function performTrim() {
    if (this == null) { // Using == null to catch both undefined and null
      throw new TypeError("Cannot convert " + this + " to a string object for trimming.");
    }
    const targetString = String(this);
    return targetString
      .replace(leadingTrimPattern, "")
      .replace(trailingTrimPattern, "");
  };
}

// Helper function to left-pad a string with a specified character up to a given length.
function padStringLeft(inputString, desiredLength, padChar) {
  let currentString = String(inputString);
  let currentLength = currentString.length;
  let charsToPad = desiredLength - currentLength;

  // Ensure we don't pad negatively
  if (charsToPad <= 0) {
    return currentString;
  }

  let paddingAccumulator = '';
  for (let i = 0; i < charsToPad; i++) {
    paddingAccumulator += padChar;
  }
  return paddingAccumulator + currentString;
}

// Alias for Backbone's jQuery reference
var $ = ModelFramework.$;

// Core namespace for the data grid library
var DataGrid = globalScope.DataGrid = {

  VERSION_TAG: "0.3.0-alpha", // Semantic versioning

  Extensions: {}, // Namespace for additional components

  // Resolves a string name to a registered class within DataGrid or its Extensions.
  // Throws an error if the class is not found.
  lookupComponentClass: function (componentName, componentTypeSuffix) {
    if (!utilLib.isString(componentName)) {
      return componentName; // Assume it's already a class or object
    }

    const normalizedName = utilLib.map(componentName.split('-'), function (part) {
      return part.charAt(0).toUpperCase() + part.slice(1);
    }).join('') + componentTypeSuffix;

    let foundClass = DataGrid[normalizedName] || DataGrid.Extensions[normalizedName];

    if (utilLib.isUndefined(foundClass)) {
      throw new ReferenceError(`Component class '${normalizedName}' could not be located.`);
    }
    return foundClass;
  },

  // Executes a function if the first argument is a function, otherwise returns the argument itself.
  // Passes subsequent arguments to the function, if it's called.
  evaluateIfFunction: function () {
    const callableCandidate = arguments[0];
    if (!utilLib.isFunction(callableCandidate)) return callableCandidate;

    const executionContext = arguments[1];
    const functionArguments = Array.prototype.slice.call(arguments, 2);

    // Only pass arguments if the array is not empty
    return callableCandidate.apply(executionContext, functionArguments.length > 0 ? functionArguments : undefined);
  }

};
utilLib.extend(DataGrid, ModelFramework.Events); // Augment DataGrid with Backbone's event system

/**
   InputInterpreter translates DOM keyboard events into high-level commands
   that the data grid can understand and respond to.
   It provides a standardized interface for handling keyboard navigation and actions.

   Consumers can extend or override methods in its prototype to customize
   keyboard shortcuts globally.

   @class DataGrid.InputInterpreter
   @constructor
   @param {Event} domEvent The original DOM keyboard event.
 */
var InputInterpreter = DataGrid.InputInterpreter = function (domEvent) {
  if (!domEvent) {
    console.warn("InputInterpreter initialized without a DOM event.");
    domEvent = {}; // Provide a default empty object to avoid errors
  }
  utilLib.extend(this, {
    isAltKeyPressed: Boolean(domEvent.altKey),
    character: domEvent.char,
    char_Code: domEvent.charCode,
    isCtrlKeyPressed: Boolean(domEvent.ctrlKey),
    key_Value: domEvent.key,
    key_Code: domEvent.keyCode,
    keyboardLocale: domEvent.locale,
    eventLocation: domEvent.location,
    isMetaKeyPressed: Boolean(domEvent.metaKey),
    isRepeatedEvent: Boolean(domEvent.repeat),
    isShiftKeyPressed: Boolean(domEvent.shiftKey),
    which_Code: domEvent.which
  });
};
utilLib.extend(InputInterpreter.prototype, {
  /**
     Checks if the command corresponds to moving the selection up (Up Arrow).
     @member DataGrid.InputInterpreter
     @returns {boolean}
   */
  shouldMoveUp: function () { return this.key_Code === 38; },
  /**
     Checks if the command corresponds to moving the selection down (Down Arrow).
     @member DataGrid.InputInterpreter
     @returns {boolean}
   */
  shouldMoveDown: function () { return this.key_Code === 40; },
  /**
     Checks if the command corresponds to moving the selection left (Shift + Tab).
     @member DataGrid.InputInterpreter
     @returns {boolean}
   */
  shouldMoveLeft: function () { return this.isShiftKeyPressed && this.key_Code === 9; },
  /**
     Checks if the command corresponds to moving the selection right (Tab).
     @member DataGrid.InputInterpreter
     @returns {boolean}
   */
  shouldMoveRight: function () { return !this.isShiftKeyPressed && this.key_Code === 9; },
  /**
     Checks if the command corresponds to saving the current edit (Enter).
     @member DataGrid.InputInterpreter
     @returns {boolean}
   */
  shouldConfirmEdit: function () { return this.key_Code === 13; },
  /**
     Checks if the command corresponds to canceling the current edit (Escape).
     @member DataGrid.InputInterpreter
     @returns {boolean}
   */
  shouldCancelEdit: function () { return this.key_Code === 27; },
  /**
     Checks if none of the specific grid commands are triggered, allowing the
     event to pass through to default browser behavior or other handlers.
     @member DataGrid.InputInterpreter
     @returns {boolean}
   */
  shouldPassThrough: function () {
    const isGridAction = this.shouldMoveUp() || this.shouldMoveDown() || this.shouldMoveLeft() ||
                         this.shouldMoveRight() || this.shouldConfirmEdit() || this.shouldCancelEdit();
    return !isGridAction;
  }
});


/*
  data-grid-core
  http://github.com/yourusername/data-grid-core

  Copyright (c) 2024 Your Name and contributors
  Licensed under the MIT license.
*/

/**
   Base class for all cell formatters. It defines the interface for
   converting raw model data to displayable strings and vice versa.

   Subclasses must implement `formatValue` and `parseValue`.

   @abstract
   @class DataGrid.ValueFormatter
   @constructor
*/
var ValueFormatter = DataGrid.ValueFormatter = function () {
  // Constructor for base formatter. No specific initialization needed for now.
};
utilLib.extend(ValueFormatter.prototype, {

  /**
     Converts a raw value from a data model into a formatted string suitable for display.
     The default implementation returns the value as is.

     @member DataGrid.ValueFormatter
     @param {*} rawInput The raw data value from the model.
     @param {ModelFramework.Model} dataModel The Backbone model instance.
     @returns {*} The formatted value (typically a string, but can be any type).
  */
  formatValue: function (rawInput, dataModel) {
    return rawInput;
  },

  /**
     Converts a formatted string (typically from user input) back into a
     properly typed raw value for persistence in the data model.

     If the input cannot be converted, this method should return `undefined`.

     @member DataGrid.ValueFormatter
     @param {string} formattedInput The formatted string from the user interface.
     @param {ModelFramework.Model} dataModel The Backbone model instance.
     @returns {*|undefined} The raw value, or `undefined` if parsing fails.
  */
  parseValue: function (formattedInput, dataModel) {
    return formattedInput;
  }

});

/**
   A formatter specifically designed for handling floating-point numbers.
   It provides options for decimal places, decimal separators, and thousands separators.

   @class DataGrid.NumericFormatter
   @extends DataGrid.ValueFormatter
   @constructor
   @param {object} [config] Configuration options for the formatter.
   @throws {RangeError} If `decimals` is outside the valid range [0, 20].
*/
var NumericFormatter = DataGrid.NumericFormatter = function (config) {
  // Merge default options with provided configuration
  utilLib.extend(this, this.defaultSettings, config || {});

  // Validate the number of decimal places
  if (this.decimalPlaces < 0 || this.decimalPlaces > 20) {
    throw new RangeError("The 'decimalPlaces' option must be an integer between 0 and 20.");
  }
};
NumericFormatter.prototype = Object.create(ValueFormatter.prototype); // Inherit from ValueFormatter
NumericFormatter.prototype.constructor = NumericFormatter; // Correct constructor reference
utilLib.extend(NumericFormatter.prototype, {

  /**
     @member DataGrid.NumericFormatter
     @cfg {object} defaultSettings

     @cfg {number} [defaultSettings.decimalPlaces=2] Number of decimal digits to display.
     Must be an integer.

     @cfg {string} [defaultSettings.decimalDelimiter='.'] The character used
     to separate the integer and fractional parts of a number.

     @cfg {string} [defaultSettings.groupDelimiter=','] The character used
     to separate thousands groups. Can be an empty string.
   */
  defaultSettings: {
    decimalPlaces: 2,
    decimalDelimiter: '.',
    groupDelimiter: ','
  },

  // Regular expression to insert group delimiters for thousands.
  THOUSANDS_REGEX: /(\d)(?=(\d{3})+$)/g,

  /**
     Converts a numeric value to a formatted string, applying decimal places,
     decimal and group separators. Numbers are rounded to the specified precision.

     @member DataGrid.NumericFormatter
     @param {number} rawNumber The number to format.
     @param {ModelFramework.Model} dataModel The Backbone model.
     @returns {string} The formatted number string.
  */
  formatValue: function (rawNumber, dataModel) {
    if (rawNumber == null || isNaN(rawNumber)) { // Check for null, undefined, or NaN
      return '';
    }

    // Round the number to the specified decimal places
    const fixedNumberString = Number(rawNumber).toFixed(this.decimalPlaces);

    const parts = fixedNumberString.split('.');
    let integerPart = parts[0];
    const fractionalPart = parts[1];

    // Apply thousands grouping to the integer part
    integerPart = integerPart.replace(this.THOUSANDS_REGEX, '$1' + this.groupDelimiter);

    // Combine integer and fractional parts with the correct decimal delimiter
    const formattedResult = fractionalPart ?
      `${integerPart}${this.decimalDelimiter}${fractionalPart}` :
      integerPart;

    return formattedResult;
  },

  /**
     Converts a formatted number string (potentially with group and decimal delimiters)
     back into a raw JavaScript number.

     @member DataGrid.NumericFormatter
     @param {string} formattedString The formatted string input.
     @param {ModelFramework.Model} dataModel The Backbone model.
     @returns {number|undefined} The parsed number, or `undefined` if conversion fails.
  */
  parseValue: function (formattedString, dataModel) {
    const trimmedInput = String(formattedString || '').trim();

    if (trimmedInput === '') return null; // Return null for empty string input

    let cleanedString = '';
    // Remove all group delimiters
    cleanedString = trimmedInput.split(this.groupDelimiter).join('');

    // Replace the custom decimal delimiter with a standard dot for Number conversion
    if (this.decimalDelimiter !== '.') {
      cleanedString = cleanedString.replace(this.decimalDelimiter, '.');
    }

    const parsedValue = parseFloat(cleanedString); // Use parseFloat for robust conversion

    // Validate the result: must be a finite number
    if (utilLib.isNumber(parsedValue) && isFinite(parsedValue)) {
      // Optionally re-apply fixed decimal places for consistency
      return Number(parsedValue.toFixed(this.decimalPlaces));
    }

    return undefined; // Indicate failure to parse
  }

});

/**
   A numeric formatter that converts a floating-point number into a percentage string
   and vice versa. It can apply a multiplier and append a percentage symbol.

   @class DataGrid.PercentageFormatter
   @extends DataGrid.NumericFormatter
   @constructor
   @param {object} [config] Configuration options.
   @throws {RangeError} If `decimalPlaces` < 0 or > 20.
 */
var PercentageFormatter = DataGrid.PercentageFormatter = function (config) {
  DataGrid.NumericFormatter.call(this, config); // Call parent constructor
};

PercentageFormatter.prototype = Object.create(DataGrid.NumericFormatter.prototype); // Inherit
PercentageFormatter.prototype.constructor = PercentageFormatter; // Correct constructor
utilLib.extend(PercentageFormatter.prototype, {

  /**
     @member DataGrid.PercentageFormatter
     @cfg {object} defaultSettings

     @cfg {number} [defaultSettings.conversionFactor=1] The number used to multiply
     the raw model value for display (e.g., 100 for true percentages).

     @cfg {string} [defaultSettings.percentageSymbol='%'] The symbol to append
     to the formatted percentage string.
   */
  defaultSettings: utilLib.extend({}, NumericFormatter.prototype.defaultSettings, {
    conversionFactor: 1,
    percentageSymbol: "%"
  }),

  /**
     Formats a raw number into a percentage string. The number is first multiplied
     by `conversionFactor`, then formatted using `NumericFormatter#formatValue`,
     and finally `percentageSymbol` is appended.

     @member DataGrid.PercentageFormatter
     @param {number} rawValue The raw numeric value.
     @param {ModelFramework.Model} dataModel The Backbone model.
     @returns {string} The formatted percentage string.
  */
  formatValue: function (rawValue, dataModel) {
    if (rawValue == null || isNaN(rawValue)) {
      return '0' + this.percentageSymbol; // Default for null/undefined/NaN
    }
    const multipliedValue = rawValue * this.conversionFactor;
    const numericFormatted = DataGrid.NumericFormatter.prototype.formatValue.call(this, multipliedValue, dataModel);
    return numericFormatted + this.percentageSymbol;
  },

  /**
     Parses a percentage string back into a raw number for the model. It removes
     the `percentageSymbol`, then uses `NumericFormatter#parseValue` to get a
     number, and finally divides by `conversionFactor`.

     @member DataGrid.PercentageFormatter
     @param {string} formattedInput The formatted percentage string.
     @param {ModelFramework.Model} dataModel The Backbone model.
     @returns {number|undefined} The raw number, or `undefined` if parsing fails.
  */
  parseValue: function (formattedInput, dataModel) {
    const inputWithoutSymbol = String(formattedInput || '').split(this.percentageSymbol).shift().trim(); // Get part before symbol
    const parsedNumeric = DataGrid.NumericFormatter.prototype.parseValue.call(this, inputWithoutSymbol, dataModel);

    if (utilLib.isNumber(parsedNumeric) && isFinite(parsedNumeric)) {
      // Handle division by zero for conversionFactor
      if (this.conversionFactor === 0) {
        console.warn("PercentageFormatter: conversionFactor is zero, cannot divide parsed value.");
        return parsedNumeric; // Or throw an error, depending on desired behavior
      }
      return parsedNumeric / this.conversionFactor;
    }
    return undefined; // Parsing failed or resulted in non-finite number
  }

});

/**
   Formatter for converting between various datetime string formats and UNIX timestamps.

   This implementation primarily handles ISO-8601 formatted strings and UNIX millisecond offsets.
   For more complex datetime formatting, consider `DataGrid.Extensions.MomentJSFormatter`.

   @class DataGrid.DateTimeStringFormatter
   @extends DataGrid.ValueFormatter
   @constructor
   @param {object} [config] Configuration options.
   @throws {Error} If both `includeDatePart` and `includeTimePart` are false.
*/
var DateTimeStringFormatter = DataGrid.DateTimeStringFormatter = function (config) {
  utilLib.extend(this, this.defaultSettings, config || {});

  if (!this.includeDatePart && !this.includeTimePart) {
    throw new Error("DateTimeStringFormatter: At least one of 'includeDatePart' or 'includeTimePart' must be true.");
  }
};
DateTimeStringFormatter.prototype = Object.create(ValueFormatter.prototype); // Inherit
DateTimeStringFormatter.prototype.constructor = DateTimeStringFormatter; // Correct constructor
utilLib.extend(DateTimeStringFormatter.prototype, {

  /**
     @member DataGrid.DateTimeStringFormatter

     @cfg {object} defaultSettings

     @cfg {boolean} [defaultSettings.includeDatePart=true] Whether the formatted output
     should include the date component (YYYY-MM-DD).

     @cfg {boolean} [defaultSettings.includeTimePart=true] Whether the formatted output
     should include the time component (HH:MM:SS).

     @cfg {boolean} [defaultSettings.includeMilliseconds=false] If `includeTimePart` is true,
     whether to include the millisecond part (.SSS) if available.
   */
  defaultSettings: {
    includeDatePart: true,
    includeTimePart: true,
    includeMilliseconds: false
  },

  // Regular expressions for parsing date and time components
  DATE_PATTERN: /^([+\-]?\d{4})-(\d{2})-(\d{2})$/,
  TIME_PATTERN: /^(\d{2}):(\d{2}):(\d{2})(?:\.(\d{3}))?$/, // Non-capturing group for milliseconds
  ISO_SPLIT_PATTERN: /T|Z| +/, // Splits ISO-like strings by 'T', 'Z', or space

  /**
     Internal helper to convert various date inputs to a standardized ISO-like string.
     Handles numbers (UNIX epoch ms) and strings. Performs optional validation.
     @private
     @param {*} inputData The raw data (number or string).
     @param {boolean} performValidation If true, invalid components will cause `undefined` return.
     @returns {string|null|undefined} ISO-like string, null for empty, undefined for invalid.
   */
  _processDateTimeInput: function (inputData, performValidation) {
    const inputStr = String(inputData || '').trim();
    if (inputStr === '') return null;

    let dateComponent = null;
    let timeComponent = null;
    let dateObj;

    if (utilLib.isNumber(inputData)) {
      // If number, treat as UNIX timestamp (milliseconds)
      dateObj = new Date(inputData);
    } else {
      // Attempt to parse string
      const stringParts = inputStr.split(this.ISO_SPLIT_PATTERN);
      const firstPart = stringParts[0];
      const secondPart = stringParts[1];

      // Determine if date and/or time components are present
      const isDateOnly = this.DATE_PATTERN.test(firstPart);
      const isTimeOnly = this.TIME_PATTERN.test(firstPart);
      const isDateTimeSplit = isDateOnly && secondPart;

      if (isDateTimeSplit) {
        dateComponent = firstPart;
        timeComponent = secondPart;
      } else if (isDateOnly) {
        dateComponent = firstPart;
      } else if (isTimeOnly) {
        timeComponent = firstPart;
      } else {
        // Fallback for unparseable strings, try creating a Date object directly
        dateObj = new Date(inputStr);
        if (isNaN(dateObj.getTime())) {
          return performValidation ? undefined : null; // Completely unparseable
        }
      }
    }

    if (dateObj && !isNaN(dateObj.getTime())) {
      // If we have a valid Date object, extract components
      dateComponent = `${padStringLeft(dateObj.getUTCFullYear(), 4, '0')}-${padStringLeft(dateObj.getUTCMonth() + 1, 2, '0')}-${padStringLeft(dateObj.getUTCDate(), 2, '0')}`;
      timeComponent = `${padStringLeft(dateObj.getUTCHours(), 2, '0')}:${padStringLeft(dateObj.getUTCMinutes(), 2, '0')}:${padStringLeft(dateObj.getUTCSeconds(), 2, '0')}`;
      if (this.includeMilliseconds) {
        timeComponent += `.${padStringLeft(dateObj.getUTCMilliseconds(), 3, '0')}`;
      }
    }

    const dateMatch = dateComponent ? this.DATE_PATTERN.exec(dateComponent) : null;
    const timeMatch = timeComponent ? this.TIME_PATTERN.exec(timeComponent) : null;

    // Validation checks based on formatter configuration
    if (performValidation) {
      if (this.includeDatePart && !dateMatch) return undefined;
      if (this.includeTimePart && !timeMatch) return undefined;
      if (!this.includeDatePart && dateMatch) return undefined; // Date present but not configured
      if (!this.includeTimePart && timeMatch && !this.includeDatePart) return undefined; // Time present but not configured for time-only
    }

    // Construct a UTC Date object from parsed components or existing dateObj
    const year = dateMatch ? parseInt(dateMatch[1], 10) : (dateObj ? dateObj.getUTCFullYear() : 0);
    const month = dateMatch ? parseInt(dateMatch[2], 10) - 1 : (dateObj ? dateObj.getUTCMonth() : 0);
    const day = dateMatch ? parseInt(dateMatch[3], 10) : (dateObj ? dateObj.getUTCDate() : 0);

    const hours = timeMatch ? parseInt(timeMatch[1], 10) : (dateObj ? dateObj.getUTCHours() : 0);
    const minutes = timeMatch ? parseInt(timeMatch[2], 10) : (dateObj ? dateObj.getUTCMinutes() : 0);
    const seconds = timeMatch ? parseInt(timeMatch[3], 10) : (dateObj ? dateObj.getUTCSeconds() : 0);
    const milliseconds = timeMatch && timeMatch[4] ? parseInt(timeMatch[4], 10) : (dateObj ? dateObj.getUTCMilliseconds() : 0);

    // Create a new Date object using UTC components
    const finalDate = new Date(Date.UTC(year, month, day, hours, minutes, seconds, milliseconds));

    if (isNaN(finalDate.getTime())) {
      return performValidation ? undefined : null; // If the constructed date is invalid
    }

    let finalFormattedString = '';

    if (this.includeDatePart) {
      finalFormattedString += `${padStringLeft(finalDate.getUTCFullYear(), 4, '0')}-${padStringLeft(finalDate.getUTCMonth() + 1, 2, '0')}-${padStringLeft(finalDate.getUTCDate(), 2, '0')}`;
    }

    if (this.includeTimePart) {
      const timePart = `${padStringLeft(finalDate.getUTCHours(), 2, '0')}:${padStringLeft(finalDate.getUTCMinutes(), 2, '0')}:${padStringLeft(finalDate.getUTCSeconds(), 2, '0')}`;
      const milliPart = this.includeMilliseconds ? `.${padStringLeft(finalDate.getUTCMilliseconds(), 3, '0')}` : '';

      finalFormattedString += (this.includeDatePart ? 'T' : '') + timePart + milliPart;
    }

    // Append 'Z' for UTC if both date and time are included, following ISO 8601
    if (this.includeDatePart && this.includeTimePart) {
      finalFormattedString += "Z";
    }

    return finalFormattedString;
  },

  /**
     Converts a raw datetime value (UNIX timestamp or ISO string) into a formatted
     string based on the formatter's configuration.

     @member DataGrid.DateTimeStringFormatter
     @param {*} rawValue The raw datetime value.
     @param {ModelFramework.Model} dataModel The Backbone model.
     @returns {string} The formatted datetime string.
  */
  formatValue: function (rawValue, dataModel) {
    const processed = this._processDateTimeInput(rawValue, false); // No strict validation for display
    return processed === null ? '' : processed;
  },

  /**
     Parses a formatted datetime string back into a raw ISO-8601 string or UNIX timestamp
     suitable for the model.

     @member DataGrid.DateTimeStringFormatter
     @param {string} formattedInput The formatted datetime string.
     @param {ModelFramework.Model} dataModel The Backbone model.
     @returns {string|number|null|undefined} The raw value (ISO string or timestamp),
     or `undefined` if parsing fails, `null` for empty input.
  */
  parseValue: function (formattedInput, dataModel) {
    const processed = this._processDateTimeInput(formattedInput, true); // Strict validation for parsing
    if (processed === undefined) {
      return undefined; // Parsing failed due to invalid format/config mismatch
    }
    // If the original input was a number, return a number (UNIX timestamp)
    if (utilLib.isNumber(formattedInput) && processed !== null) {
      const dateObj = new Date(processed);
      return dateObj.getTime(); // Return milliseconds since epoch
    }
    return processed; // Return ISO string or null
  }

});
}))