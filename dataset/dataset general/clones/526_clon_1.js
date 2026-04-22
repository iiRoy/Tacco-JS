! function( e ) {
  // This outer IIFE ensures the module is available in various environments.
  // It checks for CommonJS (Node.js), AMD (RequireJS), and then falls back to a global object.

  if ( "object" == typeof exports ) {
    // CommonJS environment detected (e.g., Node.js)
    module.exports = e();
  } else if ( "function" == typeof define && define.amd ) {
    // AMD environment detected (e.g., RequireJS)
    define( e );
  } else {
    // Browser global environment
    var f; // Declare a variable to hold the global object reference

    // Determine the global object: window, global (for web workers), or self (general global context)
    "undefined" != typeof window ? f = window : "undefined" != typeof global ? f = global : "undefined" != typeof self && ( f = self );

    // Ensure f.ic exists, then attach the 'ajax' module to it.
    ( f.ic || ( f.ic = {} ) ).ajax = e();
  }
}( function() {
  // This is the factory function that will be executed to define the module's content.
  // It's wrapped in a browserify-like UMD loader structure.

  var define, module, exports; // These variables are typically provided by the module loader/bundler.

  return ( function e( t, n, r ) {
    // This inner IIFE is a simplified CommonJS-like module loader for the browser.
    // 'e' is the require function, 't' is modules, 'n' is cache, 'r' is entry points.

    function s( o, u ) {
      // The actual 'require' function within this bundle.
      // 'o' is the module ID to require, 'u' is a flag for internal use.

      if ( !n[ o ] ) {
        // If the module is not in the cache, try to load it.

        if ( !t[ o ] ) {
          // If the module definition doesn't exist in 't', try global 'require'.
          var a = typeof require == "function" && require;

          if ( !u && a ) {
            return a( o, !0 );
          }

          if ( i ) {
            return i( o, !0 );
          }

          // If all attempts fail, throw an error.
          throw new Error( "Cannot find module '" + o + "'" );
        }

        // Create a new module object and cache it.
        var f = n[ o ] = {
          exports: {}
        };

        // Execute the module's factory function.
        t[ o ][ 0 ].call( f.exports, function( e ) {
          var n = t[ o ][ 1 ][ e ];
          return s( n ? n : e ); // Resolve relative paths for dependencies.
        }, f, f.exports, e, t, n, r );
      }

      // Return the cached module's exports.
      return n[ o ].exports;
    }

    var i = typeof require == "function" && require; // Keep a reference to global 'require' if it exists.

    // Load all entry point modules.
    for ( var o = 0; o < r.length; o++ ) {
      s( r[ o ] );
    }

    return s; // Return the 'require' function for this bundle.

  })( {
    // The modules object for the bundler. Module ID 1 is defined here.
    1: [ function( _dereq_, module, exports ) {
      // This is the actual content of module ID 1.

      "use strict"; // Enforce strict mode for this module.

      /*!
       * ic-ajax
       *
       * - (c) 2013 Instructure, Inc
       * - please see license at https://github.com/instructure/ic-ajax/blob/master/LICENSE
       * - inspired by discourse ajax: https://github.com/discourse/discourse/blob/master/app/assets/javascripts/discourse/mixins/ajax.js#L19
       */

      var Ember = window.Ember["default"] || window.Ember; // Get Ember, supporting both default export and direct global.

      /*
       * jQuery.ajax wrapper, supports the same signature except providing
       * `success` and `error` handlers will throw an error (use promises instead)
       * and it resolves only the response (no access to jqXHR or textStatus).
       * This function provides a simplified promise-based AJAX interface.
       */

      function request() {
        // Calls the 'raw' function and processes its promise result.
        return raw.apply( null, arguments ).then( function( result ) {
          // Resolve with only the 'response' part of the result.
          return result.response;
        }, null, 'ic-ajax: unwrap raw ajax response' ); // Label for promise debugging.
      }

      exports.request = request; // Export the 'request' function.

      request.OVERRIDE_REST_ADAPTER = true; // Flag to indicate if the REST adapter should be overridden.

      exports["default"] = request; // Export 'request' as the default export.

      /*
       * Same as `request` except it resolves an object with `{response, textStatus,
       * jqXHR}`, useful if you need access to the jqXHR object for headers, etc.
       * This provides more detailed information from the AJAX call.
       */

      function raw() {
        // Parses arguments and creates a promise for the AJAX call.
        return makePromise( parseArgs.apply( null, arguments ) );
      }

      exports.raw = raw; // Export the 'raw' function.

      var __fixtures__ = {}; // Internal object to store defined AJAX fixtures.
      exports.__fixtures__ = __fixtures__; // Export fixtures for testing/debugging purposes.

      /*
       * Defines a fixture that will be used instead of an actual ajax
       * request to a given url. This is useful for testing, allowing you to
       * stub out responses your application will send without requiring
       * libraries like sinon or mockjax, etc.
       *
       * For example:
       *
       *    defineFixture('/self', {
       *      response: { firstName: 'Ryan', lastName: 'Florence' },
       *      textStatus: 'success'
       *      jqXHR: {}
       *    });
       *
       * @param {String} url       The URL to associate the fixture with.
       * @param {Object} fixture   The fixture object containing response, status, etc.
       */

      function defineFixture( url, fixture ) {
        // Store a deep copy of the fixture to prevent accidental modification.
        __fixtures__[ url ] = JSON.parse( JSON.stringify( fixture ) );
      }

      exports.defineFixture = defineFixture;

      /*
       * Looks up a fixture by url in the internal __fixtures__ object.
       *
       * @param {String} url The URL to look up the fixture for.
       * @returns {Object|undefined} The fixture object if found, otherwise undefined.
       */

      function lookupFixture( url ) {
        return __fixtures__ && __fixtures__[ url ];
      }

      exports.lookupFixture = lookupFixture;

      /**
       * Creates an Ember.RSVP.Promise for an AJAX request.
       * Handles fixture lookup and actual jQuery.ajax calls.
       * @param {Object} settings - jQuery.ajax settings object.
       * @returns {Ember.RSVP.Promise} A promise that resolves or rejects based on the AJAX call or fixture.
       */
      function makePromise( settings ) {
        return new Ember.RSVP.Promise( function( resolve, reject ) {
          var fixture = lookupFixture( settings.url ); // Check if a fixture exists for the given URL.

          if ( fixture ) {
            // If a fixture is found, resolve/reject immediately.
            if ( fixture.textStatus === 'success' ) {
              return Ember.run( null, resolve, fixture ); // Resolve on the Ember run loop.
            } else {
              return Ember.run( null, reject, fixture ); // Reject on the Ember run loop.
            }
          }

          // If no fixture, proceed with a real AJAX call.
          settings.success = makeSuccess( resolve ); // Assign promise resolver to success callback.
          settings.error = makeError( reject ); // Assign promise rejecter to error callback.

          Ember.$.ajax( settings ); // Execute the jQuery AJAX request.
        }, 'ic-ajax: ' + ( settings.type || 'GET' ) + ' to ' + settings.url ); // Promise label for debugging.
      };

      /**
       * Parses the arguments provided to `request` or `raw` into a settings object.
       * Supports (url, settings) or (settings) or (url) signatures.
       * @returns {Object} The normalized settings object for jQuery.ajax.
       * @throws {Ember.Error} If 'success' or 'error' callbacks are provided, as promises should be used.
       */
      function parseArgs() {
        var settings = {}; // Initialize an empty settings object.

        if ( arguments.length === 1 ) {
          if ( typeof arguments[ 0 ] === "string" ) {
            settings.url = arguments[ 0 ]; // If single arg is string, it's the URL.
          } else {
            settings = arguments[ 0 ]; // Otherwise, single arg is the settings object.
          }
        } else if ( arguments.length === 2 ) {
          settings = arguments[ 1 ]; // Second arg is settings.
          settings.url = arguments[ 0 ]; // First arg is URL.
        }

        // Prohibit direct success/error callbacks, enforce promise usage.
        if ( settings.success || settings.error ) {
          throw new Ember.Error( "ajax should use promises, received 'success' or 'error' callback" );
        }

        return settings;
      }

      /**
       * Creates a success callback for jQuery.ajax that resolves the promise.
       * @param {Function} resolve The promise's resolve function.
       * @returns {Function} The success callback.
       */
      function makeSuccess( resolve ) {
        return function( response, textStatus, jqXHR ) {
          Ember.run( null, resolve, {
            response: response,
            textStatus: textStatus,
            jqXHR: jqXHR
          } );
        }
      }

      /**
       * Creates an error callback for jQuery.ajax that rejects the promise.
       * @param {Function} reject The promise's reject function.
       * @returns {Function} The error callback.
       */
      function makeError( reject ) {
        return function( jqXHR, textStatus, errorThrown ) {
          Ember.run( null, reject, {
            jqXHR: jqXHR,
            textStatus: textStatus,
            errorThrown: errorThrown
          } );
        };
      }

      // Integration with Ember Data's RESTAdapter if DS is present.
      if ( typeof window.DS !== 'undefined' ) {
        // Register an initializer to override DS.RESTAdapter's ajax method.
        Ember.onLoad( 'Ember.Application', function( Application ) {
          Application.initializer( {
            name: 'ic-ajax_REST_Adapter',
            after: 'store', // Ensure this runs after the 'store' initializer.
            initialize: function( container, application ) {
              // Only override if the flag is set to true.
              if ( request.OVERRIDE_REST_ADAPTER ) {
                DS.RESTAdapter.reopen( {
                  ajax: function( url, type, options ) {
                    // Normalize options and then use ic-ajax's request function.
                    options = this.ajaxOptions( url, type, options );
                    return request( options );
                  }
                } );
              }
            }
          } );
        } );
      }
    }, {} ] // End of module ID 1.
  }, {}, [ 1 ] ) // The modules, cache, and entry points for the bundler.
  ( 1 ) // Execute the entry point module (module ID 1).
} );