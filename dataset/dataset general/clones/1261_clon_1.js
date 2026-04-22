/*
 *  Lumberjack JS Utility - Version 0.3
 *
 *  A simple utility for enhanced console logging.
 *  Project Home: http://github.com/jbail/lumberjack
 *
 *  (C) Copyright 2013 Jeff Bail. All Rights Reserved.
 *
 *  Licensed under the MIT License.
 *  See: http://opensource.org/licenses/MIT for details.
 *
 *  Last Modified: November 24, 2013
 */

(function () {

  // The main Console constructor function.
  // Manages logging behavior, including color support and stream management.
  function Console(console, name, options) {

    options = options || {}; // Ensure options object exists

    // Internal configuration options for the console instance.
    var opts = {
          enabled: typeof options.enabled !== 'undefined' ? options.enabled : true, // Is logging enabled?
          color: typeof options.color !== 'undefined' ? options.color : '#bada55', // Default text color.
          background: typeof options.background !== 'undefined' ? options.background : '#111' // Default background color.
        },

        // String of console method names that support color styling.
        colorTypes = 'dir|dirxml|error|info|log|warn',

        // Flag indicating if the current browser's console supports color.
        colorSupported = isColorSupported(),

        // Stores named console streams (e.g., 'myModule' stream).
        streams = {},

        // Array to store all logged messages, including timestamps.
        logs = [];

    // --- Private Helper Functions ---

    /**
     * Core logging function, handles actual console output and log storage.
     * @param {IArguments} args - The arguments passed to the console method.
     * @param {string} type - The type of console method (e.g., 'log', 'error').
     */
    function log(args, type) {

      var color; // Variable to hold the color string for styling.

      args = argumentsToArray(args); // Convert arguments object to a proper array.

      if (opts.enabled) { // Only log if the console is currently enabled.

        // Check for color support and if a name is provided for the stream.
        if (colorSupported && name !== undefined && colorTypes.indexOf(type) !== -1) {

          // Determine the color prefix. 'dir' doesn't typically use the '%c' prefix as it formats objects.
          color = (type !== 'dir') ? '%c ' : '';

          // Hat tip to: http://stackoverflow.com/questions/7505623/colors-in-javascript-console
          // Prepend the styled name to the arguments array.
          args.unshift(color + name + ' ', 'color:' + opts.color + '; background:' + opts.background + '; font-weight:bold');

          // Apply the console method with the styled arguments.
          console[type].apply(console, args);

          // Remove the styling arguments from the array before storing,
          // as they are only for console display, not data.
          args.splice(0, 1);

        } else {
          // If color is not supported or not a 'colorType', just apply the method normally.
          console[type].apply(console, args);
        }

      }

      // Add a timestamp to the end of the arguments array for logging purposes.
      args.push(new Date());

      // Store the logged arguments.
      logs.push(args);
    }

    /**
     * Converts an 'arguments' object to a true JavaScript array.
     * @param {IArguments} args - The arguments object.
     * @returns {Array} A new array containing the arguments.
     */
    function argumentsToArray(args) {

      return Array.prototype.slice.call(args, 0);

    }

    /**
     * Detects if the current browser's console supports CSS styling (color).
     * This relies on user agent sniffing, which is generally discouraged,
     * but necessary here due to lack of a standard API for console capabilities.
     * @returns {boolean} True if color is supported, false otherwise.
     */
    function isColorSupported() {

      // It feels dirty doing user agent browser detection, but I don't think
      // there's another reliable way to determine if the console supports color.
      var ua = navigator.userAgent.toLowerCase();

      // Currently, Firefox and Chrome/Chromium-based browsers support console styling.
      return ua.indexOf('firefox') !== -1 || ua.indexOf('chrome') !== -1;

    }

    // --- Public API Methods ---

    /**
     * Creates or retrieves a named console stream.
     * @param {string} name - The name of the stream.
     * @param {object} [options] - Options for the new stream.
     * @returns {Console} The requested console stream instance.
     */
    this.stream = function (name, options) {

      var stream = streams[name]; // Try to retrieve an existing stream.

      if (!stream) { // If no stream exists with this name, create a new one.
        stream = new Console(console, name, options);
        streams[name] = stream; // Store the new stream.
      }

      return stream; // Return the stream instance.
    };

    /**
     * Enables logging for this console instance or a specific named stream.
     * @param {string} [name] - Optional name of the stream to enable. If omitted, enables the current instance.
     */
    this.on = function (name) {
      if (typeof name !== 'undefined') {
        streams[name].on(); // Call 'on' for the specified stream.
      } else {
        opts.enabled = true; // Enable the current console instance.
      }
    };

    /**
     * Disables logging for this console instance or a specific named stream.
     * @param {string} [name] - Optional name of the stream to disable. If omitted, disables the current instance.
     */
    this.off = function (name) {
      if (typeof name !== 'undefined') {
        streams[name].off(); // Call 'off' for the specified stream.
      } else {
        opts.enabled = false; // Disable the current console instance.
      }
    };

    /**
     * Retrieves all logged messages for this console instance.
     * @returns {Array} An array of logged messages.
     */
    this.logs = function () {
      return logs; // Return the internal logs array.
    };

    /**
     * Sets the default text color for this console instance.
     * @param {string} color - The CSS color string (e.g., '#bada55', 'red').
     */
    this.color = function (color) {
      opts.color = color; // Update the color option.
    };

    /**
     * Sets the default background color for this console instance.
     * @param {string} background - The CSS background color string.
     */
    this.background = function (background) {
      opts.background = background; // Update the background option.
    };

    // --- Overriding Standard Console Methods ---
    // These methods wrap the native console functions, adding Lumberjack's logging and styling.

    this.assert = function () {
      log(arguments, 'assert');
    };
    this.clear = function () {
      log(arguments, 'clear');
    };
    this.count = function () {
      log(arguments, 'count');
    };
    this.debug = function () {
      log(arguments, 'debug');
    };
    this.dir = function () {
      log(arguments, 'dir');
    };
    this.dirxml = function () {
      log(arguments, 'dirxml');
    };
    this.error = function () {
      log(arguments, 'error');
    };
    this.exception = function () {
      log(arguments, 'exception');
    }; // Note: 'exception' is often an alias for 'error'.
    this.group = function () {
      log(arguments, 'group');
    };
    this.groupCollapsed = function () {
      log(arguments, 'groupCollapsed');
    };
    this.groupEnd = function () {
      log(arguments, 'groupEnd');
    };
    this.info = function () {
      log(arguments, 'info');
    };
    this.log = function () {
      log(arguments, 'log');
    };
    this.profile = function () {
      log(arguments, 'profile');
    };
    this.profileEnd = function () {
      log(arguments, 'profileEnd');
    };
    this.table = function () {
      log(arguments, 'table');
    };
    this.time = function () {
      log(arguments, 'time');
    };
    this.timeEnd = function () {
      log(arguments, 'timeEnd');
    };
    this.timeStamp = function () {
      log(arguments, 'timeStamp');
    };
    this.trace = function () {
      log(arguments, 'trace');
    };
    this.warn = function () {
      log(arguments, 'warn');
    };
  }


  // Store a reference to the original window.console object.
  var console = window.console;

  // Replace the global window.console with our new Console instance.
  // This effectively "hijacks" the console for enhanced logging.
  window.console = new Console(console);

})();