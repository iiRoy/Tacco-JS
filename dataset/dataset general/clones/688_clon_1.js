/*
 * This file provides utility functions for testing the timezone-js library.
 * It's structured as a self-executing anonymous function to encapsulate its scope
 * and avoid polluting the global namespace.
 */
var fs = require('fs'); // Import Node.js 'fs' module for file system operations.

(function ( ) { // Start of the Immediately Invoked Function Expression (IIFE).

    // Establish a reference to the global object.
    // 'this' refers to 'window' in a browser environment or 'global' in Node.js.
    var root = this;

    // Initialize the TestUtils object.
    // This object will hold all utility functions.
    var TestUtils = { };

    /*
     * Check if 'exports' is defined, indicating a CommonJS (Node.js) environment.
     * If so, assign TestUtils to exports to make it available for other modules.
     */
    if ( typeof exports !== 'undefined' ) {
        TestUtils = exports;
    }
    else {
        /*
         * Otherwise, assume a browser environment and attach TestUtils to the
         * global 'root' object to make it globally accessible.
         */
        TestUtils = root.TestUtils = { };
    }


    /**
     * Initializes the timezoneJS library with specified options.
     * This function sets up the necessary configuration for timezone data loading.
     *
     * @param {object} timezoneJS - The main timezoneJS library object.
     * @param {object} options    - Configuration options for the initialization process.
     * @returns {object} The configured timezoneJS object instance.
     */
    var init = function ( timezoneJS, options ) {

        var opts = {
            async: false, /* Default to synchronous loading of timezone data */
            loadingScheme: timezoneJS.timezone.loadingSchemes.LAZY_LOAD /* Use lazy loading by default */
        };

        // Merge user-provided options with default options.
        // The 'options || {}' ensures that we always iterate over a valid object.
        for ( var k in ( options || { } ) ) {
            opts[ k ] = options[ k ];
        }


        // Reset internal state of timezoneJS to ensure a fresh start.
        // This clears any previously loaded zone, rule, or loaded zone data.
        timezoneJS.timezone.zones = { };        /* Clear all timezone definitions */
        timezoneJS.timezone.rules = { };        /* Clear all timezone rules */
        timezoneJS.timezone.loadedZones = { };  /* Clear the cache of loaded zones */


        // Configure timezoneJS settings based on the merged options.
        timezoneJS.timezone.zoneFileBasePath = 'lib/tz'; // Base path for timezone data files.

        // Define the transport mechanism used by timezoneJS to fetch data.
        timezoneJS.timezone.transport = function ( opts ) {
            // This function handles the actual fetching of timezone data files.
            // It supports both asynchronous and synchronous loading modes.
            if ( opts.async ) {
                // If asynchronous loading is requested, a success handler must be provided.
                if ( typeof opts.success !== 'function' ) {
                    return; // If no success callback, there's nothing to do.
                }

                // Ensure an error handler is available; default to console.error if none provided.
                opts.error = opts.error || console.error;

                // Use Node.js 'fs.readFile' for asynchronous file reading.
                return fs.readFile( opts.url, 'utf8', function ( err, data ) {
                    // Callback function for fs.readFile.
                    // If an error occurs, call the error handler; otherwise, call the success handler.
                    return err ? opts.error( err ) : opts.success( data );
                } );
            }
            // If synchronous loading is requested, use Node.js 'fs.readFileSync'.
            return fs.readFileSync( opts.url, 'utf8' );
        };

        timezoneJS.timezone.loadingScheme = opts.loadingScheme; // Set the chosen loading scheme.
        timezoneJS.timezone.init( opts ); // Perform the core initialization of the timezoneJS library.

        return timezoneJS; // Return the fully configured timezoneJS object.
    };


    /**
     * Returns an initialized instance of the timezoneJS library.
     *
     * @param {object} options - Options to pass to the timezoneJS initialization function.
     * @returns {object} An initialized timezoneJS object.
     */
    TestUtils.getTimezoneJS = function ( options ) {
        // The main timezone-js library file is expected to be at '../src/date'.
        return init( require( '../src/date' ), options );
    };


    /**
     * Parses an ISO 8601 formatted date/time string into a JavaScript Date object.
     * This function supports various ISO 8601 formats including date-only,
     * date-time, and with timezone offsets (Z or +/-HH:MM).
     *
     * @param {string} timestring - The ISO 8601 formatted date/time string to parse.
     * @returns {Date|null|NaN} A Date object if parsing is successful,
     *                          null if the string does not match the ISO 8601 pattern,
     *                          or NaN if the timezone offset is malformed.
     */
    TestUtils.parseISO = function ( timestring ) {
        /*
         * Regular expression pattern to match and capture components of an ISO 8601 string.
         * Captures year, month, day, hour, minute, second, millisecond, and timezone offset.
         */
        var pat = '^(?:([+-]?[0-9]{4,})(?:-([0-9]{2})(?:-([0-9]{2}))?)?)?' + // Date part: YYYY-MM-DD (optional)
                  '(?:T(?:([0-9]{2})(?::([0-9]{2})(?::([0-9]{2})(?:\\.' +    // Time part: HH:MM:SS.mmm (optional)
                  '([0-9]{3}))?)?)?)?(Z|[-+][0-9]{2}:[0-9]{2})?)?$';        // Timezone part: Z or +/-HH:MM (optional)

        var match = timestring.match( pat ); // Attempt to match the input timestring against the regex.

        if ( match ) {
            // If a match is found, extract the captured groups into a 'parts' object.
            var parts = {
                year:   match[ 1 ] || 0,   // Year, defaults to 0 if not present.
                month:  match[ 2 ] || 1,   // Month (1-indexed), defaults to 1 (January).
                day:    match[ 3 ] || 1,   // Day, defaults to 1.
                hour:   match[ 4 ] || 0,   // Hour, defaults to 0.
                minute: match[ 5 ] || 0,   // Minute, defaults to 0.
                second: match[ 6 ] || 0,   // Second, defaults to 0.
                milli:  match[ 7 ] || 0,   // Millisecond, defaults to 0.
                offset: match[ 8 ] || "Z"  // Timezone offset, defaults to "Z" (UTC).
            };

            // Calculate the UTC timestamp using Date.UTC.
            // Note: Date.UTC month parameter is 0-indexed, so we subtract 1 from the parsed month.
            var utcDate = Date.UTC( parts.year, parts.month - 1, parts.day,
                                    parts.hour, parts.minute, parts.second, parts.milli );

            // If the timezone offset is not 'Z' (UTC), adjust the calculated UTC timestamp.
            if ( parts.offset !== "Z" ) {
                // Parse the explicit offset string (e.g., "+01:00", "-05:30").
                match = parts.offset.match( '([-+][0-9]{2})(?::([0-9]{2}))?' );
                if ( !match ) {
                    return NaN; // Return NaN if the offset format is invalid.
                }

                // Calculate the total offset in milliseconds.
                // match[1] is the hour component, match[2] is the optional minute component.
                var offset = ( match[ 1 ] * 60 * 60 * 1000 ) + ( ( match[ 2 ] || 0 ) * 60 * 1000 );
                utcDate -= offset; // Subtract the offset to normalize to actual UTC.
            }

            return new Date( utcDate ); // Return a new Date object created from the adjusted UTC timestamp.
        }

        return null; // Return null if the input timestring did not match the ISO 8601 pattern.
    };

} ).call( this ); // End of the IIFE. The '.call(this)' executes it, setting 'this' to the global object.