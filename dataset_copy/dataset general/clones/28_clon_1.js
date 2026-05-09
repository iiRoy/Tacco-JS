// This is a Type I clone of the Backgrid library initialization and core components.
// All functionality and variable names are preserved exactly.
// Only whitespace and comments have been altered.

// Original source: http://github.com/wyuenho/backgrid
// Copyright (c) 2014 Jimmy Yuen Ho Wong and contributors <wyuenho@gmail.com>
// Licensed under the MIT license - for full details, please refer to the original project.
// This file is generated for demonstrating code clone generation.

( function ( factory ) {

    // Check for CommonJS environment and export if available.
    if ( typeof exports == "object" ) {
        module.exports = factory(
            module.exports,
            require( "underscore" ), // Dependency: Underscore.js
            require( "backbone" )    // Dependency: Backbone.js
        );
    }
    // If not CommonJS, assume a browser environment.
    else factory( this, this._, this.Backbone );

} ( function ( root, _, Backbone ) {

    "use strict"; // Enforce strict mode for cleaner code.

    // A small note: This part of the code includes a polyfill for String.prototype.trim.
    // It's based on work by Kristopher Michael Kowal, as referenced in the original source.
    // ES5 15.5.4.20 specification: http://es5.github.com/#x15.5.4.20

    // Whitespace characters used for trimming.
    var ws = "\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u180E\u2000\u2001\u2002\u2003"
           + "\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028"
           + "\u2029\uFEFF";

    // Implement String.prototype.trim if it's not natively available or if it's buggy.
    if ( !String.prototype.trim || ws.trim() ) {
        // References for faster/more robust trim implementations:
        // http://blog.stevenlevithan.com/archives/faster-trim-javascript
        // http://perfectionkills.com/whitespace-deviations/

        ws = "[" + ws + "]"; // Convert whitespace string to a regex character class.
        var trimBeginRegexp = new RegExp( "^" + ws + ws + "*" ), // Regex for leading whitespace.
            trimEndRegexp   = new RegExp( ws + ws + "*$" );    // Regex for trailing whitespace.

        // Assign the custom trim function.
        String.prototype.trim = function trim () {
            // Check for valid 'this' context.
            if ( this === undefined || this === null ) {
                throw new TypeError( "can't convert " + this + " to object" );
            }
            // Perform trimming using replace with regex.
            return String( this )
                .replace( trimBeginRegexp, "" )
                .replace( trimEndRegexp, "" );
        };
    }

    // Helper function to left-pad a string with a specified character.
    function lpad ( str, length, padstr ) {
        var paddingLen = length - ( str + '' ).length; // Calculate needed padding length.
        paddingLen     = paddingLen < 0 ? 0 : paddingLen; // Ensure padding length is not negative.
        var padding    = '';

        // Build the padding string.
        for ( var i = 0; i < paddingLen; i++ ) {
            padding = padding + padstr;
        }

        return padding + str; // Prepend padding to the original string.
    }

    // Assign jQuery (or compatible) reference from Backbone.
    var $ = Backbone.$;

    // Initialize the Backgrid namespace.
    var Backgrid = root.Backgrid = {

        VERSION: "0.3.0", // Current version of Backgrid.

        Extension: {}, // Namespace for Backgrid extensions.

        /**
         * Resolves a string name to a Backgrid class, potentially in extensions.
         * @param {string} name The class name (e.g., 'text-cell').
         * @param {string} suffix The suffix to append (e.g., 'Cell', 'Formatter').
         * @returns {Function} The resolved class constructor.
         * @throws {ReferenceError} If the class is not found.
         */
        resolveNameToClass: function ( name, suffix ) {
            // Check if name is a string, otherwise return it directly.
            if ( _.isString( name ) ) {
                // Convert hyphenated name to CamelCase and append suffix.
                var key = _.map( name.split( '-' ), function ( e ) {
                    return e.slice( 0, 1 ).toUpperCase() + e.slice( 1 );
                } ).join( '' ) + suffix;

                // Look up the class in Backgrid or Backgrid.Extension.
                var klass = Backgrid[ key ] || Backgrid.Extension[ key ];

                // Throw error if class is undefined.
                if ( _.isUndefined( klass ) ) {
                    throw new ReferenceError( "Class '" + key + "' not found" );
                }

                return klass; // Return the found class.
            }

            return name; // Return name as is if it's not a string (e.g., already a class).
        },

        /**
         * Executes a function if the first argument is a function, otherwise returns the argument.
         * @param {*} value The value or function to call.
         * @param {Object} context The `this` context for the function call.
         * @param {...*} args Additional arguments for the function.
         * @returns {*} The result of the function call or the original value.
         */
        callByNeed: function () {
            var value = arguments[ 0 ];
            if ( !_.isFunction( value ) ) return value; // If not a function, return value directly.

            var context = arguments[ 1 ];
            var args    = [].slice.call( arguments, 2 ); // Get arguments after the first two.
            // Apply the function with context and arguments.
            return value.apply( context, !!( args + '' ) ? args : void 0 );
        }
    };

    // Extend Backgrid with Backbone's event capabilities.
    _.extend( Backgrid, Backbone.Events );

    //
    // Backgrid.Command Class Definition
    //
    // This class translates DOM Events into a standardized set of commands
    // recognized by Backgrid. Consumers can listen for Backgrid events that
    // include a `Backgrid.Command` instance to react to user input.
    //
    // Keyboard shortcuts can be customized by modifying the prototype methods
    // of this class.
    //
    // @class Backgrid.Command
    // @constructor
    // @param {Event} evt The DOM Event object.
    //
    var Command = Backgrid.Command = function ( evt ) {
        // Copy relevant properties from the DOM event to the command instance.
        _.extend( this, {
            altKey:   !!evt.altKey,
            "char":   evt[ "char" ],
            charCode: evt.charCode,
            ctrlKey:  !!evt.ctrlKey,
            key:      evt.key,
            keyCode:  evt.keyCode,
            locale:   evt.locale,
            location: evt.location,
            metaKey:  !!evt.metaKey,
            repeat:   !!evt.repeat,
            shiftKey: !!evt.shiftKey,
            which:    evt.which
        } );
    };

    // Extend the Command prototype with methods to check for specific commands.
    _.extend( Command.prototype, {
        // Up Arrow key command.
        // @member Backgrid.Command
        moveUp: function () {
            return this.keyCode == 38;
        },
        // Down Arrow key command.
        // @member Backgrid.Command
        moveDown: function () {
            return this.keyCode === 40;
        },
        // Shift + Tab key command (moves left).
        // @member Backgrid.Command
        moveLeft: function () {
            return this.shiftKey && this.keyCode === 9;
        },
        // Tab key command (moves right).
        // @member Backgrid.Command
        moveRight: function () {
            return !this.shiftKey && this.keyCode === 9;
        },
        // Enter key command.
        // @member Backgrid.Command
        save: function () {
            return this.keyCode === 13;
        },
        // Escape key command.
        // @member Backgrid.Command
        cancel: function () {
            return this.keyCode === 27;
        },
        // Checks if none of the specific navigation/action commands are active.
        // @member Backgrid.Command
        passThru: function () {
            return !( this.moveUp() || this.moveDown() || this.moveLeft() ||
                      this.moveRight() || this.save() || this.cancel() );
        }
    } );

    //
    // Backgrid.CellFormatter Abstract Class
    //
    // This is an abstract base class for cell formatters.
    // Concrete cell classes typically expect a formatter that implements
    // `fromRaw(rawData)` and `toRaw(formattedData)` methods.
    // This class provides a basic implementation that can be extended.
    //
    // @abstract
    // @class Backgrid.CellFormatter
    // @constructor
    //
    var CellFormatter = Backgrid.CellFormatter = function () {};

    _.extend( CellFormatter.prototype, {

        /**
         * Converts a raw value from a model into a formatted string for display.
         * The default implementation simply returns the value as is.
         *
         * @member Backgrid.CellFormatter
         * @param {*} rawData The raw value from the model.
         * @param {Backbone.Model} model The Backbone model instance.
         * @returns {*} The formatted value for display.
         */
        fromRaw: function ( rawData, model ) {
            return rawData;
        },

        /**
         * Converts a formatted string (e.g., from user input) back into a raw,
         * appropriately typed value for persistence in the model.
         *
         * If the input is invalid or cannot be converted, it should return `undefined`.
         *
         * @member Backgrid.CellFormatter
         * @param {string} formattedData The formatted string from user input.
         * @param {Backbone.Model} model The Backbone model instance.
         * @returns {*|undefined} The raw value for the model, or `undefined` if invalid.
         */
        toRaw: function ( formattedData, model ) {
            return formattedData;
        }

    } );

    //
    // Backgrid.NumberFormatter Class
    //
    // Formats floating-point numbers. Note: Does not support scientific notation.
    //
    // @class Backgrid.NumberFormatter
    // @extends Backgrid.CellFormatter
    // @constructor
    // @param {Object} [options] Configuration options.
    // @throws {RangeError} If `decimals` is less than 0 or greater than 20.
    //
    var NumberFormatter = Backgrid.NumberFormatter = function ( options ) {
        // Merge default options with instance-specific options.
        _.extend( this, this.defaults, options || {} );

        // Validate the number of decimals.
        if ( this.decimals < 0 || this.decimals > 20 ) {
            throw new RangeError( "decimals must be between 0 and 20" );
        }
    };

    // Inherit from CellFormatter.
    NumberFormatter.prototype = new CellFormatter();

    // Extend prototype with NumberFormatter specific methods and properties.
    _.extend( NumberFormatter.prototype, {

        // Default configuration options for the number formatter.
        // @member Backgrid.NumberFormatter
        // @cfg {Object} options
        // @cfg {number} [options.decimals=2] Number of decimal places to display (integer).
        // @cfg {string} [options.decimalSeparator='.'] Character for separating decimals.
        // @cfg {string} [options.orderSeparator=','] Character for separating thousands (can be empty).
        defaults: {
            decimals:       2,
            decimalSeparator: '.',
            orderSeparator:   ','
        },

        // Regular expression to insert thousands separators.
        HUMANIZED_NUM_RE: /(\d)(?=(?:\d{3})+$)/g,

        /**
         * Converts a raw number into a formatted string.
         * Applies `orderSeparator` for thousands and `decimalSeparator` for decimals,
         * and rounds to the specified number of `decimals`.
         *
         * @member Backgrid.NumberFormatter
         * @param {number} number The raw numeric value.
         * @param {Backbone.Model} model The Backbone model instance.
         * @returns {string} The formatted number string.
         */
        fromRaw: function ( number, model ) {
            // Return empty string for null or undefined numbers.
            if ( _.isNull( number ) || _.isUndefined( number ) ) return '';

            // Fix number to specified decimals, then split into integer and decimal parts.
            number = number.toFixed( ~~this.decimals );

            var parts       = number.split( '.' );
            var integerPart = parts[ 0 ];
            var decimalPart = parts[ 1 ] ? ( this.decimalSeparator || '.' ) + parts[ 1 ] : '';

            // Apply thousands separator to the integer part and combine.
            return integerPart.replace( this.HUMANIZED_NUM_RE, '$1' + this.orderSeparator ) + decimalPart;
        },

        /**
         * Converts a formatted number string back into a raw number.
         * Removes `orderSeparator` and `decimalSeparator` before parsing.
         *
         * @member Backgrid.NumberFormatter
         * @param {string} formattedData The formatted number string.
         * @param {Backbone.Model} model The Backbone model instance.
         * @returns {number|undefined} The raw number, or `undefined` if parsing fails.
         */
        toRaw: function ( formattedData, model ) {
            formattedData = formattedData.trim(); // Trim leading/trailing whitespace.

            if ( formattedData === '' ) return null; // Return null for empty string.

            var rawData = '';

            // Remove thousands separators.
            var thousands = formattedData.split( this.orderSeparator );
            for ( var i = 0; i < thousands.length; i++ ) {
                rawData += thousands[ i ];
            }

            // Handle decimal separator replacement.
            var decimalParts = rawData.split( this.decimalSeparator );
            rawData          = '';
            for ( var i = 0; i < decimalParts.length; i++ ) {
                rawData = rawData + decimalParts[ i ] + '.';
            }

            // Remove trailing dot if any.
            if ( rawData[ rawData.length - 1 ] === '.' ) {
                rawData = rawData.slice( 0, rawData.length - 1 );
            }

            // Convert to number, fix decimals, and convert back to number.
            var result = ( rawData * 1 ).toFixed( ~~this.decimals ) * 1;
            // Return result if it's a valid number.
            if ( _.isNumber( result ) && !_.isNaN( result ) ) return result;
        }

    } );

    //
    // Backgrid.PercentFormatter Class
    //
    // Formats numbers as percentages, allowing for a multiplier and symbol.
    //
    // @class Backgrid.PercentFormatter
    // @extends Backgrid.NumberFormatter
    // @constructor
    // @throws {RangeError} Inherited from NumberFormatter if `decimals` is invalid.
    //
    var PercentFormatter = Backgrid.PercentFormatter = function () {
        // Call the parent constructor.
        Backgrid.NumberFormatter.apply( this, arguments );
    };

    // Inherit from NumberFormatter.
    PercentFormatter.prototype = new Backgrid.NumberFormatter(),

    // Extend prototype with PercentFormatter specific methods and properties.
    _.extend( PercentFormatter.prototype, {

        // Default configuration options for the percent formatter.
        // @member Backgrid.PercentFormatter
        // @cfg {Object} options
        // @cfg {number} [options.multiplier=1] Factor to multiply raw value by for display.
        // @cfg {string} [options.symbol='%'] Symbol to append to the percentage string.
        defaults: _.extend( {}, NumberFormatter.prototype.defaults, {
            multiplier: 1,
            symbol:     "%"
        } ),

        /**
         * Converts a raw number to a formatted percentage string.
         * Multiplies the number by `multiplier`, formats it using `NumberFormatter`,
         * and then appends the `symbol`.
         *
         * @member Backgrid.PercentFormatter
         * @param {number} number The raw numeric value.
         * @param {Backbone.Model} model The Backbone model instance.
         * @returns {string} The formatted percentage string.
         */
        fromRaw: function ( number, model ) {
            var args = [].slice.call( arguments, 1 ); // Get arguments after 'number'.
            args.unshift( number * this.multiplier ); // Prepend multiplied number.
            // Call parent's fromRaw and append the symbol.
            return ( NumberFormatter.prototype.fromRaw.apply( this, args ) || "0" ) + this.symbol;
        },

        /**
         * Converts a formatted percentage string back to a raw number.
         * Removes the `symbol`, parses using `NumberFormatter`, and then
         * divides by the `multiplier`.
         *
         * @member Backgrid.PercentFormatter
         * @param {string} formattedValue The formatted percentage string.
         * @param {Backbone.Model} model The Backbone model instance.
         * @returns {number|undefined} The raw number, or `undefined` if parsing fails.
         */
        toRaw: function ( formattedValue, model ) {
            var tokens = formattedValue.split( this.symbol ); // Split by the symbol.
            // Check if split resulted in a valid number part.
            if ( tokens && tokens[ 0 ] && tokens[ 1 ] === "" || tokens[ 1 ] == null ) {
                var rawValue = NumberFormatter.prototype.toRaw.call( this, tokens[ 0 ] ); // Parse the number part.
                if ( _.isUndefined( rawValue ) ) return rawValue; // If parent couldn't parse, return undefined.
                return rawValue / this.multiplier; // Divide by multiplier.
            }
        }

    } );

    //
    // Backgrid.DatetimeFormatter Class
    //
    // Handles conversion between various datetime formats (ISO-8601, UNIX offset).
    // For more advanced formatting, consider Backgrid.Extension.MomentFormatter.
    //
    // @class Backgrid.DatetimeFormatter
    // @extends Backgrid.CellFormatter
    // @constructor
    // @param {Object} [options] Configuration options.
    // @throws {Error} If both `includeDate` and `includeTime` are false.
    //
    var DatetimeFormatter = Backgrid.DatetimeFormatter = function ( options ) {
        // Merge default options with instance-specific options.
        _.extend( this, this.defaults, options || {} );

        // Validate configuration: at least one of date or time must be included.
        if ( !this.includeDate && !this.includeTime ) {
            throw new Error( "Either includeDate or includeTime must be true" );
        }
    };

    // Inherit from CellFormatter.
    DatetimeFormatter.prototype = new CellFormatter();

    // Extend prototype with DatetimeFormatter specific methods and properties.
    _.extend( DatetimeFormatter.prototype, {

        // Default configuration options for the datetime formatter.
        // @member Backgrid.DatetimeFormatter
        // @cfg {Object} options
        // @cfg {boolean} [options.includeDate=true] Whether the date part should be included.
        // @cfg {boolean} [options.includeTime=true] Whether the time part should be included.
        // @cfg {boolean} [options.includeMilli=false] If `includeTime` is true, whether to include milliseconds.
        defaults: {
            includeDate:  true,
            includeTime:  true,
            includeMilli: false
        },

        // Regular expressions for parsing date and time components.
        DATE_RE:       /^([+\-]?\d{4})-(\d{2})-(\d{2})$/,
        TIME_RE:       /^(\d{2}):(\d{2}):(\d{2})(\.(\d{3}))?$/,
        ISO_SPLITTER_RE: /T|Z| +/, // Regex to split ISO string by 'T', 'Z', or space.

        /**
         * Internal helper to convert and validate datetime data.
         * @param {*} data The raw datetime input (number for UNIX offset, string for ISO).
         * @param {boolean} validate If true, performs strict validation and returns undefined on failure.
         * @returns {string|null|undefined} Formatted ISO string, null for empty, undefined for invalid (if validate is true).
         * @private
         */
        _convert: function ( data, validate ) {
            // Return null for empty or whitespace-only input.
            if ( ( data + '' ).trim() === '' ) return null;

            var date, time = null; // Initialize date and time components.

            if ( _.isNumber( data ) ) {
                // If data is a number (UNIX offset), create a Date object and format.
                var jsDate = new Date( data );
                date = lpad( jsDate.getUTCFullYear(), 4, 0 ) + '-' + lpad( jsDate.getUTCMonth() + 1, 2, 0 ) + '-' + lpad( jsDate.getUTCDate(), 2, 0 );
                time = lpad( jsDate.getUTCHours(), 2, 0 ) + ':' + lpad( jsDate.getUTCMinutes(), 2, 0 ) + ':' + lpad( jsDate.getUTCSeconds(), 2, 0 );
            } else {
                // If data is a string, trim and split by ISO delimiters.
                data      = data.trim();
                var parts = data.split( this.ISO_SPLITTER_RE ) || [];
                // Determine date and time parts based on regex matching.
                date      = this.DATE_RE.test( parts[ 0 ] ) ? parts[ 0 ] : '';
                time      = date && parts[ 1 ] ? parts[ 1 ] : this.TIME_RE.test( parts[ 0 ] ) ? parts[ 0 ] : '';
            }

            // Extract year, month, day, hour, minute, second, millisecond using regex.
            var YYYYMMDD  = this.DATE_RE.exec( date ) || [];
            var HHmmssSSS = this.TIME_RE.exec( time ) || [];

            // Perform validation if requested.
            if ( validate ) {
                if ( this.includeDate && _.isUndefined( YYYYMMDD[ 0 ] ) ) return; // Date required but not found.
                if ( this.includeTime && _.isUndefined( HHmmssSSS[ 0 ] ) ) return; // Time required but not found.
                if ( !this.includeDate && date ) return; // Date not allowed but found.
                if ( !this.includeTime && time ) return; // Time not allowed but found.
            }

            // Create a UTC Date object from parsed components.
            var jsDate = new Date( Date.UTC( YYYYMMDD[ 1 ] * 1 || 0,
                                             YYYYMMDD[ 2 ] * 1 - 1 || 0,
                                             YYYYMMDD[ 3 ] * 1 || 0,
                                             HHmmssSSS[ 1 ] * 1 || null,
                                             HHmmssSSS[ 2 ] * 1 || null,
                                             HHmmssSSS[ 3 ] * 1 || null,
                                             HHmmssSSS[ 5 ] * 1 || null ) );

            var result = ''; // Initialize result string.

            // Build the date part of the result.
            if ( this.includeDate ) {
                result = lpad( jsDate.getUTCFullYear(), 4, 0 ) + '-' + lpad( jsDate.getUTCMonth() + 1, 2, 0 ) + '-' + lpad( jsDate.getUTCDate(), 2, 0 );
            }

            // Build the time part of the result.
            if ( this.includeTime ) {
                result = result + ( this.includeDate ? 'T' : '' ) + lpad( jsDate.getUTCHours(), 2, 0 ) + ':' + lpad( jsDate.getUTCMinutes(), 2, 0 ) + ':' + lpad( jsDate.getUTCSeconds(), 2, 0 );

                // Include milliseconds if requested.
                if ( this.includeMilli ) {
                    result = result + '.' + lpad( jsDate.getUTCMilliseconds(), 3, 0 );
                }
            }

            // Append 'Z' for UTC if both date and time are included.
            if ( this.includeDate && this.includeTime ) {
                result += "Z";
            }

            return result; // Return the formatted string.
        }
    } );