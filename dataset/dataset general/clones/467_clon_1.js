!function( e ) {
  /*
   * This is a UMD (Universal Module Definition) pattern.
   * It attempts to make the code compatible with various module loaders.
   */
  if ( "object" == typeof exports ) {
    // CommonJS environment
    module.exports = e();
  } else if ( "function" == typeof define && define.amd ) {
    // AMD environment (e.g., RequireJS)
    define( e );
  } else {
    // Browser global environment
    var f;
    if ( "undefined" != typeof window ) {
      f = window;
    } else if ( "undefined" != typeof global ) {
      f = global;
    } else if ( "undefined" != typeof self ) {
      f = self;
    }

    // Attach the module to the global object
    f.App = e();
  }
}(function() {
  var define, module, exports; /* These variables are for the internal module system,
                                * ensuring they are locally scoped if not provided externally. */

  return (function e( t, n, r ) {
    function s( o, u ) {
      if ( !n[o] ) {
        if ( !t[o] ) {
          // Attempt to use Node.js require if available and not a "browserified" module.
          var a = typeof require == "function" && require;
          if ( !u && a ) return a( o, !0 );

          // If a global 'i' (likely another require) exists, try that.
          if ( i ) return i( o, !0 );

          // If all attempts fail, throw an error.
          throw new Error( "Cannot find module '" + o + "'" );
        }
        // Initialize the module if found in the 't' (modules) object.
        var f = n[o] = { exports: {} };
        t[o][0].call( f.exports, function( e ) {
          var n = t[o][1][e];
          return s( n ? n : e );
        }, f, f.exports, e, t, n, r );
      }
      return n[o].exports;
    }

    // Global require, if it exists.
    var i = typeof require == "function" && require;

    // Load all required modules specified in 'r'.
    for ( var o = 0; o < r.length; o++ ) s( r[o] );

    // Return the main 'require' function 's'.
    return s;
  })({
    1: [function( _dereq_, module, exports ) {
      "use strict"; // Enforce strict mode for this module.

      // --- Module Dependencies ---
      var fs = _dereq_("fs");                // File system access (Node.js specific).
      var url = _dereq_("url");               // URL parsing and resolution.
      var revalidator = _dereq_("revalidator"); // JSON schema validation library.
      var isURL = _dereq_("is-url");           // Utility to check if a string is a URL.
      var schema = _dereq_("./schema");       // The application's main schema definition.

      /**
       * App Class Definition.
       * This module exports the App constructor.
       */
      var App = module.exports = (function() {

        /**
         * App Constructor.
         * Initializes a new App instance from raw data (string or object).
         * @param {string|object} raw - The raw input, either a JSON string, a file path, or a plain object.
         */
        function App( raw ) {
          var key; // Loop variable for property iteration.

          // Check if the input is a string.
          if ( typeof( raw ) === 'string' ) {

            // If the string looks like a JSON file path, read its content.
            if ( raw.match( /\.json$/i ) ) {
              raw = fs.readFileSync( raw );
            }

            try {
              // Attempt to parse the string as JSON.
              raw = JSON.parse( raw );
            } catch ( err ) {
              // Handle JSON parsing errors.
              throw new Error( "Malformed JSON" );
            }
          }

          // Assign properties from the raw data to the current instance.
          for ( key in raw ) {
            if ( raw.hasOwnProperty( key ) ) {
              this[key] = raw[key];
            }
          }

          return this; // Return the initialized instance.
        }

        /**
         * App Prototype Methods and Getters.
         * Defines properties and methods available to all App instances.
         */
        App.prototype = {
          // Getter for validation errors using revalidator and the defined schema.
          get errors() {
            return revalidator.validate( this, schema ).errors;
          },

          // Getter for overall validation status.
          get valid() {
            return revalidator.validate( this, schema ).valid;
          },

          // Getter that provides a human-readable string of validation errors.
          get errorString() {
            return this.errors.map( function( error ) {
              return [ "-", error.property, error.message ].join( " " );
            }).join( "\n" );
          },

          // Getter that returns a JSON string representation of the app's valid properties.
          get toJSON() {
            var key;
            var out = {}; // Object to hold only the valid properties.
            var validProps = Object.keys( schema.properties ); // Get keys of properties defined in the schema.

            // Iterate over own properties of the current instance.
            for ( key in this ) {
              if ( this.hasOwnProperty( key ) && validProps.indexOf( key ) > -1 ) {
                out[key] = this[key]; // Copy only schema-defined properties.
              }
            }
            // Stringify the filtered object with 2-space indentation.
            return JSON.stringify( out, null, 2 );
          }
        };

        /**
         * Static method to create a new App instance.
         * Provides a factory-like interface.
         * @param {string|object} raw - The raw input data.
         * @returns {App} A new App instance.
         */
        App.new = function( raw ) {
          return new App( raw );
        };

        // Static property: an example App instance based on the schema's example data.
        App.example = new App( schema.example );

        // Static property: the schema definition itself.
        App.schema = schema;

        return App; // Return the App constructor.

      })(); // Immediately invoked function expression for the App class.

    }, { "./schema": 2, "fs": 3, "is-url": 9, "revalidator": 10, "url": 8 }],
    2: [function( _dereq_, module, exports ) {
      "use strict"; // Use strict mode.

      // Defines the JSON schema for an 'App' object.
      var schema = {
        "properties": {
          "name": {
            "description": "A clean and simple name to identify the template (30 characters max).",
            "type": "string",
            "minLength": 3,
            "maxLength": 30,
            "allowEmpty": false,
            "example": "Small Sharp Tool"
          },
          "description": {
            "description": "A brief summary of the app: what it does, who it's for, why it exists, etc.",
            "type": "string",
            "example": "This app does one little thing, and does it well.",
            "maxLength": 140
          },
          "keywords": {
            "description": "An array of strings describing the app.",
            "type": "array",
            "example": ["productivity", "HTML5", "scalpel"]
          },
          "website": {
            "description": "The project's website.",
            "type": "string",
            "format": "url",
            "allowEmpty": false,
            "example": "https://small-sharp-tool.com/"
          },
          "repository": {
            "description": "The location of the application's source code, such as a Git URL, GitHub URL, Subversion URL, or Mercurial URL.",
            "type": "string",
            "format": "url",
            "allowEmpty": false,
            "example": "https://github.com/jane-doe/small-sharp-tool"
          },
          "logo": {
            "description": "The URL of the application's logo image. Dimensions should be square. Format can be SVG, PNG, or JPG.",
            "type": "string",
            "format": "url",
            "allowEmpty": false,
            "example": "https://small-sharp-tool.com/logo.svg"
          },
          "success_url": {
            "description": "A URL specifying where to redirect the user once their new app is deployed. If value is a fully-qualified URL, the user should be redirected to that URL. If value begins with a slash `/`, the user should be redirected to that path in their newly deployed app.",
            "type": "string",
            "allowEmpty": false,
            "example": "/welcome"
          },
          "scripts": {
            "description": "A key-value object specifying scripts or shell commands to execute at different stages in the build/release process. Currently, `postdeploy` is the only supported script.",
            "type": "object",
            "example": {"postdeploy": "bundle exec rake bootstrap"}
          },
          "env": {
            "description": "A key-value object for environment variables, or [config vars](https://devcenter.heroku.com/articles/config-vars) in Heroku parlance. Keys are the names of the environment variables. Values can be strings or objects. If the value is a string, it will be used. If the value is an object, it defines specific requirements for that variable:\n\n- `description`: a human-friendly blurb about what the value is for and how to determine what it should be\n- `value`: a default value to use. This should always be a string.\n- `required`: A boolean indicating whether the given value is required for the app to function (default: `true`).\n- `generator`: a string representing a function to call to generate the value. Currently the only supported generator is `secret`, which generates a pseudo-random string of characters.",
            "type": "object",
            "example": {
              "BUILDPACK_URL": "https://github.com/stomita/heroku-buildpack-phantomjs",
              "SECRET_TOKEN": {
                "description": "A secret key for verifying the integrity of signed cookies.",
                "generator": "secret"
              },
              "WEB_CONCURRENCY": {
                "description": "The number of processes to run.",
                "value": "5"
              }
            }
          },
          "addons": {
            "description": "An array of strings specifying Heroku addons to provision on the app before deploying. Each addon should be in the format `addon:plan` or `addon`. If plan is omitted, that addon's default plan will be provisioned.",
            "type": "array",
            "example": [
              "openredis",
              "mongolab:shared-single-small"
            ]
          }
        }
      };

      // --- Schema Post-processing ---

      // Creates an `example` object containing example values for each property.
      schema.example = {};
      Object.keys( schema.properties ).map( function( key ) {
        schema.example[key] = schema.properties[key].example;
      });

      // Creates a stringified JSON version of the example object, formatted for readability.
      schema.exampleJSON = JSON.stringify( schema.example, null, 2 );

      // Transforms schema properties into an array format, adding convenience fields.
      schema.propertiesArray = Object.keys( schema.properties ).map( function( name ) {
        var prop = schema.properties[name];
        prop.name = name; // Add the property name to the property object itself.
        // Determine if the property is required or optional.
        prop.requiredOrOptional = prop.required ? "required" : "optional";

        var jsonDoc = {};
        jsonDoc[prop.name] = prop.example;
        // Also add a stringified JSON example for just this specific property.
        prop.exampleJSON = JSON.stringify( jsonDoc, null, 2 );
        return prop;
      });

      // Export the augmented schema object.
      module.exports = schema;

    }, {}],
    3: [function( _dereq_, module, exports ) {
      /* This is likely a placeholder for the 'fs' module in a browser environment,
       * or an empty module representing a Node.js built-in that's not needed. */
    }, {}],
    4: [function( _dereq_, module, exports ) {
      (function( global ) {
        /*! http://mths.be/punycode v1.2.4 by @mathias */
        ;(function( root ) {

          /**
           * Detect free variables for CommonJS and browser globals.
           * This helps determine the correct `root` object (global or window).
           */
          var freeExports = typeof exports == 'object' && exports;
          var freeModule = typeof module == 'object' && module &&
            module.exports == freeExports && module;
          var freeGlobal = typeof global == 'object' && global;

          // If global or window exists, use it as the root.
          if ( freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal ) {
            root = freeGlobal;
          }

          /**
           * The `punycode` object will be exposed globally or via module exports.
           * @name punycode
           * @type Object
           */
          var punycode,

            /** Maximum positive signed 32-bit integer value (2^31 - 1). */
            maxInt = 2147483647, // Also 0x7FFFFFFF

            /** Bootstring parameters as defined in RFC 3492. */
            base = 36,
            tMin = 1,
            tMax = 26,
            skew = 38,
            damp = 700,
            initialBias = 72,
            initialN = 128, // Represents 0x80, the start of non-basic code points.
            delimiter = '-', // The separator used in Punycode strings.

            /** Regular expressions for Punycode processing. */
            regexPunycode = /^xn--/, // Identifies Punycode-encoded labels.
            regexNonASCII = /[^ -~]/, // Matches unprintable ASCII and non-ASCII characters.
            // Matches various Unicode and ASCII separators for domain names.
            regexSeparators = /\x2E|\u3002|\uFF0E|\uFF61/g,

            /** Error messages for specific Punycode failures. */
            errors = {
              'overflow': 'Overflow: input needs wider integers to process',
              'not-basic': 'Illegal input >= 0x80 (not a basic code point)',
              'invalid-input': 'Invalid input'
            },

            /** Convenience shortcuts to frequently used values and functions. */
            baseMinusTMin = base - tMin,
            floor = Math.floor,
            stringFromCharCode = String.fromCharCode,

            /** Temporary variable, often used for iteration. */
            key;

          /*--------------------------------------------------------------------------*/

          /**
           * A utility function for throwing specific RangeErrors.
           * @private
           * @param {String} type - The type of error (key from `errors` object).
           * @returns {Error} Throws a `RangeError` with the corresponding message.
           */
          function error( type ) {
            throw RangeError( errors[type] );
          }

          /**
           * A generic `Array#map` utility function, optimized for performance.
           * @private
           * @param {Array} array - The array to iterate over.
           * @param {Function} fn - The callback function applied to each item.
           * @returns {Array} A new array with results from the callback.
           */
          function map( array, fn ) {
            var length = array.length;
            while ( length-- ) {
              array[length] = fn( array[length] );
            }
            return array;
          }

          /**
           * A specialized `Array#map`-like utility for domain name strings.
           * Splits the domain by separators, maps each part, and rejoins them.
           * @private
           * @param {String} string - The domain name string.
           * @param {Function} fn - The function to apply to each domain label.
           * @returns {String} A new string with mapped domain labels.
           */
          function mapDomain( string, fn ) {
            return map( string.split( regexSeparators ), fn ).join( '.' );
          }

          /**
           * Decodes a UCS-2 string into an array of Unicode code points.
           * Handles surrogate pairs to correctly represent astral plane characters.
           * @see `punycode.ucs2.encode`
           * @see <http://mathiasbynens.be/notes/javascript-encoding>
           * @memberOf punycode.ucs2
           * @name decode
           * @param {String} string - The Unicode input string (UCS-2).
           * @returns {Array} An array of numeric code points.
           */
          function ucs2decode( string ) {
            var output = [],
              counter = 0,
              length = string.length,
              value,
              extra;

            while ( counter < length ) {
              value = string.charCodeAt( counter++ );
              // Check for high surrogate and ensure there's a next character.
              if ( value >= 0xD800 && value <= 0xDBFF && counter < length ) {
                extra = string.charCodeAt( counter++ );
                // If it's a valid low surrogate.
                if ( ( extra & 0xFC00 ) == 0xDC00 ) {
                  // Combine surrogates to get the full code point.
                  output.push( ( ( value & 0x3FF ) << 10 ) + ( extra & 0x3FF ) + 0x10000 );
                } else {
                  // Unmatched high surrogate, treat as a single code unit.
                  output.push( value );
                  counter--; // Decrement to re-process the 'extra' character.
                }
              } else {
                // Not a surrogate or no matching surrogate, just push the code unit.
                output.push( value );
              }
            }
            return output;
          }

          /**
           * Encodes an array of numeric code points into a UCS-2 string.
           * Converts astral plane code points into surrogate pairs.
           * @see `punycode.ucs2.decode`
           * @memberOf punycode.ucs2
           * @name encode
           * @param {Array} codePoints - The array of numeric code points.
           * @returns {String} The resulting Unicode string (UCS-2).
           */
          function ucs2encode( array ) {
            return map( array, function( value ) {
              var output = '';
              // If the value is an astral plane character.
              if ( value > 0xFFFF ) {
                value -= 0x10000;
                // High surrogate.
                output += stringFromCharCode( ( value >>> 10 & 0x3FF ) | 0xD800 );
                // Low surrogate.
                value = 0xDC00 | ( value & 0x3FF );
              }
              output += stringFromCharCode( value );
              return output;
            }).join( '' );
          }

          /**
           * Converts a basic code point to its corresponding digit value.
           * Used in Punycode decoding.
           * @see `digitToBasic()`
           * @private
           * @param {Number} codePoint - The basic numeric code point.
           * @returns {Number} The digit value (0-35) or `base` if invalid.
           */
          function basicToDigit( codePoint ) {
            if ( codePoint - 48 < 10 ) { // '0' through '9'
              return codePoint - 22;
            }
            if ( codePoint - 65 < 26 ) { // 'A' through 'Z'
              return codePoint - 65;
            }
            if ( codePoint - 97 < 26 ) { // 'a' through 'z'
              return codePoint - 97;
            }
            return base; // Invalid basic code point.
          }

          /**
           * Converts a digit value into a basic code point (ASCII character).
           * Used in Punycode encoding.
           * @see `basicToDigit()`
           * @private
           * @param {Number} digit - The numeric value (0-35).
           * @param {Number} flag - If non-zero, use uppercase characters.
           * @returns {Number} The ASCII code point.
           */
          function digitToBasic( digit, flag ) {
            // 0-25 map to 'a'-'z' or 'A'-'Z'
            // 26-35 map to '0'-'9'
            return digit + 22 + 75 * ( digit < 26 ) - ( ( flag != 0 ) << 5 );
          }

          /**
           * Bias adaptation function as per section 3.4 of RFC 3492.
           * This function dynamically adjusts the bias used in the encoding/decoding loops.
           * @private
           * @see http://tools.ietf.org/html/rfc3492#section-3.4
           * @param {Number} delta - The difference in total points.
           * @param {Number} numPoints - The number of code points processed so far.
           * @param {Boolean} firstTime - True if this is the first adaptation step.
           * @returns {Number} The new bias value.
           */
          function adapt( delta, numPoints, firstTime ) {
            var k = 0;
            // First time, dampen the delta. Otherwise, shift it right by 1 (divide by 2).
            delta = firstTime ? floor( delta / damp ) : delta >> 1;
            delta += floor( delta / numPoints );
            // Loop to adjust 'k' based on delta and bootstring parameters.
            for ( /* no initialization */ ; delta > baseMinusTMin * tMax >> 1; k += base ) {
              delta = floor( delta / baseMinusTMin );
            }
            return floor( k + ( baseMinusTMin + 1 ) * delta / ( delta + skew ) );
          }

          /**
           * Converts a Punycode string of ASCII-only symbols to a string of Unicode symbols.
           * This is the core Punycode decoding algorithm.
           * @memberOf punycode
           * @param {String} input - The Punycode string (e.g., "xn--blah").
           * @returns {String} The resulting string of Unicode symbols.
           */
          function decode( input ) {
            // Note: Does not use UCS-2 internally; operates on code points.
            var output = [],
              inputLength = input.length,
              out,
              i = 0,
              n = initialN,
              bias = initialBias,
              basic,
              j,
              index,
              oldi,
              w,
              k,
              digit,
              t,
              /** Cached calculation results for `base - t` to avoid re-calculation. */
              baseMinusT;

            // --- Handle Basic Code Points ---
            // Find the last delimiter (if any) to separate basic from non-basic parts.
            basic = input.lastIndexOf( delimiter );
            if ( basic < 0 ) {
              basic = 0; // No delimiter, entire string is basic.
            }

            // Copy the initial basic code points to the output.
            for ( j = 0; j < basic; ++j ) {
              // Ensure these are truly basic ASCII characters.
              if ( input.charCodeAt( j ) >= 0x80 ) {
                error( 'not-basic' );
              }
              output.push( input.charCodeAt( j ) );
            }

            // --- Main Decoding Loop ---
            // Start after the delimiter if basic code points were copied, otherwise from the beginning.
            for ( index = basic > 0 ? basic + 1 : 0; index < inputLength; /* no final expression */ ) {

              // `index` points to the next character to be processed.
              // Decode a generalized variable-length integer (`delta`) which is added to `i`.
              // Overflow checking is performed as `i` increases.
              for ( oldi = i, w = 1, k = base; /* no condition, loop breaks internally */ ; k += base ) {

                if ( index >= inputLength ) {
                  error( 'invalid-input' ); // Ran out of input unexpectedly.
                }

                digit = basicToDigit( input.charCodeAt( index++ ) ); // Get the value of the current digit.

                // Check for overflow conditions.
                if ( digit >= base || digit > floor( ( maxInt - i ) / w ) ) {
                  error( 'overflow' );
                }

                i += digit * w; // Accumulate the value.
                t = k <= bias ? tMin : ( k >= bias + tMax ? tMax : k - bias ); // Calculate threshold 't'.

                if ( digit < t ) {
                  break; // Exit inner loop if digit is below threshold.
                }

                baseMinusT = base - t;
                if ( w > floor( maxInt / baseMinusT ) ) {
                  error( 'overflow' );
                }

                w *= baseMinusT; // Update weight 'w'.
              }

              out = output.length + 1;
              bias = adapt( i - oldi, out, oldi == 0 ); // Adapt the bias for the next iteration.

              // `i` represents the delta, which now needs to be distributed.
              // `n` is incremented by `i / out`.
              if ( floor( i / out ) > maxInt - n ) {
                error( 'overflow' );
              }

              n += floor( i / out ); // Increment `n`, the current code point value.
              i %= out; // `i` becomes the insertion index.

              // Insert the new code point `n` into the output array at position `i`.
              output.splice( i++, 0, n );

            }

            return ucs2encode( output ); // Convert the array of code points back to a UCS-2 string.
          }

          /**
           * Converts a string of Unicode symbols to a Punycode string of ASCII-only symbols.
           * This is the core Punycode encoding algorithm.
           * @memberOf punycode
           * @param {String} input - The string of Unicode symbols (e.g., "bücher").
           * @returns {String} The resulting Punycode string (e.g., "bcher-kva").
           */
          function encode( input ) {
            var n, // Current code point being processed.
              delta, // Accumulated difference for bias adaptation.
              handledCPCount, // Count of code points already handled.
              basicLength, // Length of the basic part of the string.
              bias, // The current bias value.
              j, // Loop counter.
              m, // Smallest code point value.
              // Remaining variables for Punycode encoding logic will follow.