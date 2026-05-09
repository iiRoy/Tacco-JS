/* abyssa 6.7.0 - A stateful router library for single page applications */

// This is a self-executing anonymous function to encapsulate the library.
!function( e ) {
  // Check for CommonJS environment
  if ( "object" == typeof exports && "undefined" != typeof module ) {
    module.exports = e();
  }
  // Check for AMD environment
  else if ( "function" == typeof define && define.amd ) {
    define( [], e );
  }
  // Fallback for browser global
  else {
    var f;
    // Determine the global object based on environment
    if ( "undefined" != typeof window ) {
      f = window;
    } else if ( "undefined" != typeof global ) {
      f = global;
    } else if ( "undefined" != typeof self ) {
      f = self;
    }
    // Attach Abyssa to the global object
    f.Abyssa = e();
  }
}( function() {
  // These variables are often defined in UMD wrappers for compatibility,
  // but are not used directly in this specific module's factory function.
  var define, module, exports;

  return ( function e( t, n, r ) {
    // The `s` function acts as a custom require mechanism for bundled modules.
    function s( o, u ) {
      // If the module `o` is not yet in the cache `n`
      if ( ! n[o] ) {
        // And if the module `o` is not defined in the `t` definitions
        if ( ! t[o] ) {
          // Try to use a native `require` if available and `u` (don't create new module) is false
          var a = typeof require == "function" && require;
          if ( ! u && a ) {
            return a( o, !0 );
          }
          // If a global `require` (i) exists, try that
          if ( i ) {
            return i( o, !0 );
          }
          // Otherwise, throw an error indicating the module wasn't found
          throw new Error( "Cannot find module '" + o + "'" );
        }
        // If the module is defined, create a new module entry in `n`
        var f = n[o] = { exports:{} };
        // Execute the module's factory function
        t[o][0].call( f.exports, function( e ) {
          var n = t[o][1][e];
          return s( n ? n : e );
        }, f, f.exports, e, t, n, r );
      }
      return n[o].exports;
    }

    // Global `require` reference for fallback
    var i = typeof require == "function" && require;

    // Load initial required modules
    for ( var o = 0; o < r.length; o++ ) {
      s( r[o] );
    }

    return s; // Return the custom require function
  } ) ( {
    1:[ function( _dereq_, module, exports ) {
      /**
       * @license
       * crossroads <http://millermedeiros.github.com/crossroads.js/>
       * Author: Miller Medeiros | MIT License
       * v0.12.0 (2013/01/21 13:47)
       */

      ( function () {
        // Factory function that receives 'signals' as a dependency
        var factory = function ( signals ) {

          var crossroads,
              _hasOptionalGroupBug, // Flag to check for IE's optional group bug
              UNDEF;                // Undefined placeholder

          // Helper Functions ----------------------------------------------------
          // =====================================================================

          // IE 7-8 capture optional groups as empty strings while other browsers
          // capture as `undefined`. This checks for that specific browser behavior.
          _hasOptionalGroupBug = ( /t(.+)?/ ).exec( 't' )[1] === '';

          /**
           * Custom Array.indexOf implementation for older browsers.
           * @param {Array} arr The array to search within.
           * @param {*} val The value to search for.
           * @returns {number} The index of the value, or -1 if not found.
           */
          function arrayIndexOf( arr, val ) {
            if ( arr.indexOf ) {
              return arr.indexOf( val );
            } else {
              // Array.indexOf doesn't work on IE 6-7, so we provide a manual loop.
              var n = arr.length;
              while ( n-- ) {
                if ( arr[n] === val ) {
                  return n;
                }
              }
              return -1;
            }
          }

          /**
           * Removes an item from an array.
           * @param {Array} arr The array to modify.
           * @param {*} item The item to remove.
           */
          function arrayRemove( arr, item ) {
            var i = arrayIndexOf( arr, item );
            if ( i !== -1 ) {
              arr.splice( i, 1 );
            }
          }

          /**
           * Checks the kind of an object (e.g., 'RegExp', 'Array').
           * @param {*} val The value to check.
           * @param {string} kind The expected kind string.
           * @returns {boolean} True if the value is of the specified kind.
           */
          function isKind( val, kind ) {
            return '[object ' + kind + ']' === Object.prototype.toString.call( val );
          }

          /**
           * Checks if a value is a regular expression.
           * @param {*} val The value to check.
           * @returns {boolean} True if the value is a RegExp object.
           */
          function isRegExp( val ) {
            return isKind( val, 'RegExp' );
          }

          /**
           * Checks if a value is an array.
           * @param {*} val The value to check.
           * @returns {boolean} True if the value is an Array object.
           */
          function isArray( val ) {
            return isKind( val, 'Array' );
          }

          /**
           * Checks if a value is a function.
           * @param {*} val The value to check.
           * @returns {boolean} True if the value is a function.
           */
          function isFunction( val ) {
            return typeof val === 'function';
          }

          /**
           * Typecasts a string value to its appropriate JavaScript type.
           * Borrowed from AMD-utils.
           * @param {string} val The string value to typecast.
           * @returns {*} The typecasted value.
           */
          function typecastValue( val ) {
            var r;
            if ( val === null || val === 'null' ) {
              r = null;
            } else if ( val === 'true' ) {
              r = true;
            } else if ( val === 'false' ) {
              r = false;
            } else if ( val === UNDEF || val === 'undefined' ) {
              r = UNDEF;
            } else if ( val === '' || isNaN( val ) ) { // isNaN('') returns false, so handle empty string explicitly
              r = val;
            } else {
              // parseFloat(null || '') returns NaN, so this handles numeric conversions.
              r = parseFloat( val );
            }
            return r;
          }

          /**
           * Typecasts all values in an array.
           * @param {Array<string>} values An array of string values.
           * @returns {Array<*>} An array of typecasted values.
           */
          function typecastArrayValues( values ) {
            var n = values.length,
                result = [];
            while ( n-- ) {
              result[n] = typecastValue( values[n] );
            }
            return result;
          }

          /**
           * Decodes a query string into an object.
           * Borrowed from AMD-Utils.
           * @param {string} str The query string (e.g., "?a=1&b=2").
           * @param {boolean} shouldTypecast Whether to typecast the values.
           * @returns {Object} An object representing the query parameters.
           */
          function decodeQueryString( str, shouldTypecast ) {
            var queryArr = ( str || '' ).replace( '?', '' ).split( '&' ),
                n = queryArr.length,
                obj = {},
                item,
                val;

            while ( n-- ) {
              item = queryArr[n].split( '=' );
              val = shouldTypecast ? typecastValue( item[1] ) : item[1];
              obj[item[0]] = ( typeof val === 'string' ) ? decodeURIComponent( val ) : val;
            }
            return obj;
          }


          // Crossroads Main Object ----------------------------------------------
          // =====================================================================

          /**
           * @constructor
           * Creates a new Crossroads instance.
           */
          function Crossroads() {
            // Signals for bypassed and routed events
            this.bypassed = new signals.Signal();
            this.routed = new signals.Signal();

            this._routes = [];        // Stores all registered routes
            this._prevRoutes = [];    // Stores routes matched in the previous parse
            this._piped = [];         // Stores other Crossroads instances to pipe to

            this.resetState();        // Initialize state variables
          }

          Crossroads.prototype = {

            greedy : false,           // Whether to match all possible routes

            greedyEnabled : true,     // If greedy behavior is allowed

            ignoreCase : true,        // Whether route patterns are case-insensitive

            ignoreState : false,      // If true, will re-route even if request is same as previous

            shouldTypecast : false,   // Whether to convert string parameters to native types

            normalizeFn : null,       // Default function to normalize route parameters

            /**
             * Resets the internal state of the router, clearing previous matches.
             */
            resetState : function(){
              this._prevRoutes.length = 0;
              this._prevMatchedRequest = null;
              this._prevBypassedRequest = null;
            },

            /**
             * Creates a new Crossroads instance.
             * @returns {Crossroads} A new Crossroads router.
             */
            create : function () {
              return new Crossroads();
            },

            /**
             * Adds a new route to the router.
             * @param {string|RegExp} pattern The route pattern.
             * @param {Function} [callback] The function to call when the route matches.
             * @param {number} [priority] The priority of the route (higher means checked first).
             * @returns {Route} The newly created Route object.
             */
            addRoute : function ( pattern, callback, priority ) {
              var route = new Route( pattern, callback, priority, this );
              this._sortedInsert( route ); // Insert in sorted order based on priority
              return route;
            },

            /**
             * Removes a route from the router.
             * @param {Route} route The route object to remove.
             */
            removeRoute : function ( route ) {
              arrayRemove( this._routes, route );
              route._destroy(); // Clean up route's internal resources
            },

            /**
             * Removes all registered routes.
             */
            removeAllRoutes : function () {
              var n = this.getNumRoutes();
              while ( n-- ) {
                this._routes[n]._destroy();
              }
              this._routes.length = 0;
            },

            /**
             * Parses a request string and dispatches matching routes.
             * @param {string} [request=''] The request string to parse.
             * @param {Array<*>} [defaultArgs=[]] Default arguments to pass to route callbacks.
             */
            parse : function ( request, defaultArgs ) {
              request = request || '';
              defaultArgs = defaultArgs || [];

              // If ignoreState is true, always process. Otherwise, avoid re-processing same request.
              if ( ! this.ignoreState &&
                  ( request === this._prevMatchedRequest ||
                    request === this._prevBypassedRequest ) ) {
                return;
              }

              var routes = this._getMatchedRoutes( request ),
                  i = 0,
                  n = routes.length,
                  cur;

              if ( n ) {
                this._prevMatchedRequest = request; // Store the matched request

                this._notifyPrevRoutes( routes, request ); // Notify previously matched routes about switching
                this._prevRoutes = routes; // Update previous routes

                // Iterate through matched routes and dispatch them
                while ( i < n ) {
                  cur = routes[i];
                  // Dispatch the route's matched signal
                  cur.route.matched.dispatch.apply( cur.route.matched, defaultArgs.concat( cur.params ) );
                  cur.isFirst = !i; // Mark the first matched route
                  // Dispatch the global routed signal
                  this.routed.dispatch.apply( this.routed, defaultArgs.concat( [ request, cur ] ) );
                  i += 1;
                }
              } else {
                this._prevBypassedRequest = request; // Store the bypassed request
                // If no routes matched, dispatch the bypassed signal
                this.bypassed.dispatch.apply( this.bypassed, defaultArgs.concat( [ request ] ) );
              }

              this._pipeParse( request, defaultArgs ); // Pipe the parse call to other routers
            },

            /**
             * Notifies previously matched routes that the current request has switched.
             * @param {Array<Object>} matchedRoutes The routes matched in the current parse.
             * @param {string} request The current request string.
             * @private
             */
            _notifyPrevRoutes : function( matchedRoutes, request ) {
              var i = 0,
                  prev;
              while ( prev = this._prevRoutes[i++] ) {
                // Check if the route still exists and if it has switched
                if ( prev.route.switched && this._didSwitch( prev.route, matchedRoutes ) ) {
                  prev.route.switched.dispatch( request );
                }
              }
            },

            /**
             * Checks if a given route has switched away from the currently matched routes.
             * @param {Route} route The route to check.
             * @param {Array<Object>} matchedRoutes The routes matched in the current parse.
             * @returns {boolean} True if the route is no longer matched.
             * @private
             */
            _didSwitch : function ( route, matchedRoutes ){
              var matched,
                  i = 0;
              while ( matched = matchedRoutes[i++] ) {
                // If the route is found in the new set of matched routes, it hasn't switched.
                if ( matched.route === route ) {
                  return false;
                }
              }
              return true; // The route was not found, so it has switched.
            },

            /**
             * Passes the parse call to any piped routers.
             * @param {string} request The request string.
             * @param {Array<*>} defaultArgs Default arguments.
             * @private
             */
            _pipeParse : function( request, defaultArgs ) {
              var i = 0,
                  route; // 'route' here refers to a piped router, not a Route object
              while ( route = this._piped[i++] ) {
                route.parse( request, defaultArgs );
              }
            },

            /**
             * Gets the number of routes currently registered.
             * @returns {number} The count of routes.
             */
            getNumRoutes : function () {
              return this._routes.length;
            },

            /**
             * Inserts a route into the `_routes` array, maintaining sorted order by priority.
             * Uses a simplified insertion sort.
             * @param {Route} route The route to insert.
             * @private
             */
            _sortedInsert : function ( route ) {
              var routes = this._routes,
                  n = routes.length;
              // Find the correct position based on priority (higher priority at the end)
              do { --n; } while ( routes[n] && route._priority <= routes[n]._priority );
              routes.splice( n + 1, 0, route );
            },

            /**
             * Retrieves a list of routes that match the given request.
             * @param {string} request The request string.
             * @returns {Array<Object>} An array of objects, each containing a route and its parameters.
             * @private
             */
            _getMatchedRoutes : function ( request ) {
              var res = [],
                  routes = this._routes,
                  n = routes.length,
                  route;
              // Loop decrementally because higher priority routes are at the end of the array.
              while ( route = routes[--n] ) {
                // Check if the route matches, and if greedy is enabled or the route itself is greedy.
                if ( ( ! res.length || this.greedy || route.greedy ) && route.match( request ) ) {
                  res.push( {
                    route : route,
                    params : route._getParamsArray( request )
                  } );
                }
                // If greedy is not enabled and we found a match, stop searching.
                if ( ! this.greedyEnabled && res.length ) {
                  break;
                }
              }
              return res;
            },

            /**
             * Pipes this router's parse calls to another router.
             * @param {Crossroads} otherRouter The router to pipe to.
             */
            pipe : function ( otherRouter ) {
              this._piped.push( otherRouter );
            },

            /**
             * Stops piping parse calls to a specific router.
             * @param {Crossroads} otherRouter The router to unpipe.
             */
            unpipe : function ( otherRouter ) {
              arrayRemove( this._piped, otherRouter );
            },

            /**
             * Returns a string representation of the Crossroads instance.
             * @returns {string} The string representation.
             */
            toString : function () {
              return '[crossroads numRoutes:' + this.getNumRoutes() + ']';
            }
          };

          // "Static" instance of Crossroads (default router)
          crossroads = new Crossroads();
          crossroads.VERSION = '0.12.0'; // Library version

          /**
           * Normalization function: returns all parameters as a single array, with the first element being the `vals_` array.
           * @param {string} req The request string.
           * @param {Object} vals The parameters object.
           * @returns {Array<Array<*>>} Normalized parameters.
           */
          crossroads.NORM_AS_ARRAY = function ( req, vals ) {
            return [ vals.vals_ ];
          };

          /**
           * Normalization function: returns all parameters as a single array, with the first element being the parameters object.
           * @param {string} req The request string.
           * @param {Object} vals The parameters object.
           * @returns {Array<Object>} Normalized parameters.
           */
          crossroads.NORM_AS_OBJECT = function ( req, vals ) {
            return [ vals ];
          };


          // Route Definition ----------------------------------------------------
          // =====================================================================

          /**
           * @constructor
           * Creates a new Route object.
           * @param {string|RegExp} pattern The pattern for this route.
           * @param {Function} [callback] The callback function for this route.
           * @param {number} [priority] The priority of this route.
           * @param {Crossroads} router The parent Crossroads router.
           */
          function Route( pattern, callback, priority, router ) {
            var isRegexPattern = isRegExp( pattern ),
                patternLexer = router.patternLexer; // Reference to the router's pattern lexer

            this._router = router;
            this._pattern = pattern;
            // Extract parameter IDs if not a RegExp pattern
            this._paramsIds = isRegexPattern ? null : patternLexer.getParamIds( pattern );
            this._optionalParamsIds = isRegexPattern ? null : patternLexer.getOptionalParamsIds( pattern );
            // Compile the pattern into a RegExp if it's a string
            this._matchRegexp = isRegexPattern ? pattern : patternLexer.compilePattern( pattern, router.ignoreCase );

            // Signals for when the route is matched or switched
            this.matched = new signals.Signal();
            this.switched = new signals.Signal();

            // Add the initial callback if provided
            if ( callback ) {
              this.matched.add( callback );
            }
            this._priority = priority || 0; // Set route priority
          }

          Route.prototype = {

            greedy : false, // Whether this specific route should be greedy

            rules : void(0), // Validation rules for parameters

            /**
             * Checks if the route matches the given request.
             * @param {string} request The request string to test.
             * @returns {boolean} True if the route matches.
             */
            match : function ( request ) {
              request = request || '';
              // First, test against the compiled regular expression.
              // Then, validate parameters using defined rules.
              return this._matchRegexp.test( request ) && this._validateParams( request );
            },

            /**
             * Validates the parameters extracted from a request against the route's rules.
             * @param {string} request The original request string.
             * @returns {boolean} True if all parameters pass validation.
             * @private
             */
            _validateParams : function ( request ) {
              var rules = this.rules,
                  values = this._getParamsObject( request ),
                  key;

              // Iterate through each rule defined for the route.
              for ( key in rules ) {
                // Ensure it's a direct property and not the 'normalize_' rule, then validate.
                if ( key !== 'normalize_' && rules.hasOwnProperty( key ) && ! this._isValidParam( request, key, values ) ) {
                  return false; // If any parameter fails validation, the route does not match.
                }
              }
              return true; // All parameters passed validation.
            },

            /**
             * Checks if a single parameter is valid according to its rule.
             * @param {string} request The original request string.
             * @param {string} prop The name of the parameter.
             * @param {Object} values The object containing all extracted parameter values.
             * @returns {boolean} True if the parameter is valid.
             * @private
             */
            _isValidParam : function ( request, prop, values ) {
              var validationRule = this.rules[prop],
                  val = values[prop],
                  isValid = false,
                  isQuery = ( prop.indexOf( '?' ) === 0 ); // Check if it's a query parameter

              // If value is null/undefined and it's an optional parameter, it's valid.
              if ( val == null && this._optionalParamsIds && arrayIndexOf( this._optionalParamsIds, prop ) !== -1 ) {
                isValid = true;
              }
              // If the rule is a RegExp, test the value against it.
              else if ( isRegExp( validationRule ) ) {
                if ( isQuery ) {
                  val = values[prop + '_']; // Use raw string for query params if rule is RegExp
                }
                isValid = validationRule.test( val );
              }
              // If the rule is an Array, check if the value is present in the array.
              else if ( isArray( validationRule ) ) {
                if ( isQuery ) {
                  val = values[prop + '_']; // Use raw string for query params if rule is Array
                }
                isValid = this._isValidArrayRule( validationRule, val );
              }
              // If the rule is a Function, execute it for validation.
              else if ( isFunction( validationRule ) ) {
                isValid = validationRule( val, request, values );
              }

              // Return isValid (false if rule type is unsupported or validation failed)
              return isValid;
            },

            /**
             * Checks if a value is present in an array rule, considering case-insensitivity if configured.
             * @param {Array<*>} arr The array rule.
             * @param {*} val The value to check for.
             * @returns {boolean} True if the value is found in the array.
             * @private
             */
            _isValidArrayRule : function ( arr, val ) {
              // If case-insensitivity is off, use standard indexOf.
              if ( ! this._router.ignoreCase ) {
                return arrayIndexOf( arr, val ) !== -1;
              }

              // If case-insensitivity is on and value is a string, convert to lowercase.
              if ( typeof val === 'string' ) {
                val = val.toLowerCase();
              }

              var n = arr.length,
                  item,
                  compareVal;

              // Manually iterate and compare, converting array items to lowercase if they are strings.
              while ( n-- ) {
                item = arr[n];
                compareVal = ( typeof item === 'string' ) ? item.toLowerCase() : item;
                if ( compareVal === val ) {
                  return true;
                }
              }
              return false;
            },

            /**
             * Extracts and processes parameters from a request string into an object.
             * @param {string} request The request string.
             * @returns {Object} An object containing the extracted parameters.
             * @private
             */
            _getParamsObject : function ( request ) {
              var shouldTypecast = this._router.shouldTypecast,
                  values = this._router.patternLexer.getParamValues( request, this._matchRegexp, shouldTypecast ),
                  o = {},
                  n = values.length,
                  param,
                  val;

              while ( n-- ) {
                val = values[n];
                if ( this._paramsIds ) {
                  param = this._paramsIds[n];
                  // Handle query parameters (starting with '?')
                  if ( param.indexOf( '?' ) === 0 && val ) {
                    o[param + '_'] = val; // Store raw query string for validation
                    val = decodeQueryString( val, shouldTypecast ); // Decode and typecast query string
                    values[n] = val; // Update the values array with the decoded object
                  }
                  // Normalize IE's optional group bug (empty string to undefined)
                  if ( _hasOptionalGroupBug && val === '' && arrayIndexOf( this._optionalParamsIds, param ) !== -1 ) {
                    val = void(0); // Set to undefined
                    values[n] = val; // Update values array as well
                  }
                  o[param] = val; // Assign the parameter value
                }
                o[n] = val; // Also store by numerical index (for RegExp patterns)
              }
              o.request_ = shouldTypecast ? typecastValue( request ) : request; // Store original request
              o.vals_ = values; // Store the array of values
              return o;
            },

            /**
             * Gets the parameters as an array, optionally applying a normalization function.
             * @param {string} request The request string.
             * @returns {Array<*>} An array of parameters.
             * @private
             */
            _getParamsArray : function ( request ) {
              var norm = this.rules ? this.rules.normalize_ : null,
                  params;

              norm = norm || this._router.normalizeFn; // Use route-specific normalize or router's default
              if ( norm && isFunction( norm ) ) {
                params = norm( request, this._getParamsObject( request ) ); // Apply normalization function
              } else {
                params = this._getParamsObject( request ).vals_; // Default: return the `vals_` array
              }
              return params;
            },

            /**
             * Interpolates a route pattern with replacements to generate a URL string.
             * @param {Object} replacements An object mapping parameter names to values.
             * @returns {string} The interpolated URL string.
             * @throws {Error} If the generated string does not validate against `Route.rules`.
             */
            interpolate : function( replacements ) {
              var str = this._router.patternLexer.interpolate( this._pattern, replacements );
              if ( ! this._validateParams( str ) ) { // Validate the generated string
                throw new Error( 'Generated string doesn\'t validate against `Route.rules`.' );
              }
              return str;
            },

            /**
             * Disposes of the route, removing it from its parent router.
             */
            dispose : function () {
              this._router.removeRoute( this );
            },

            /**
             * Internal method to clean up route resources.
             * @private
             */
            _destroy : function () {
              this.matched.dispose(); // Dispose of signals
              this.switched.dispose();
              // Nullify references to aid garbage collection
              this.matched = this.switched = this._pattern = this._matchRegexp = null;
            },

            /**
             * Returns a string representation of the Route instance.
             * @returns {string} The string representation.
             */
            toString : function () {
              return '[Route pattern:"' + this._pattern + '", numListeners:' + this.matched.getNumListeners() + ']';
            }

          };



          // Pattern Lexer Implementation ----------------------------------------
          // =====================================================================

          // The patternLexer is responsible for parsing route patterns and
          // converting them into regular expressions or extracting parameter info.
          Crossroads.prototype.patternLexer = ( function () {

            var
                // Regular expression to match characters that need escaping in a regex string
                ESCAPE_CHARS_REGEXP = /[\\.+*?\^$\[\](){}\/'#]/g,

                // Regular expressions for handling trailing slashes
                LOOSE_SLASHES_REGEXP = /^\/|\/$/g, // Matches slashes at the beginning or end of string
                LEGACY_SLASHES_REGEXP = /\/$/g,    // Matches only trailing slashes

                // Regular expression to find parameters: anything inside `{}` or `: :`
                PARAMS_REGEXP = /(?:\{|:)([^}:]+)(?:\}|:)/g,

                // Tokens used internally to save and restore parts of the pattern
                // during compilation to avoid accidental escaping.
                TOKENS = {
                  'OS' : { // Optional Slashes
                    // Matches slashes that are part of optional groups, e.g., `/:foo:` or `/foo{?bar}`
                    rgx : /([:}]|\w(?=\/))\/?(:|(?:\{\?))/g,
                    save : '$1{{id}}$2', // Placeholder for the slash
                    res : '\\/?'         // Resulting regex for an optional slash
                  },
                  'RS' : { // Required Slashes
                    // Matches slashes that are required, e.g., `/{foo}/{bar}`
                    rgx : /([:}])\/?(\{)/g,
                    save : '$1{{id}}$2', // Placeholder
                    res : '\\/'          // Resulting regex for a required slash
                  },
                  'RQ' : { // Required Query String
                    // Matches required query string parameters `{?param}`
                    rgx : /\{\?([^}]+)\}/g,
                    // Regex to match anything from `?` until `#` or end of string
                    res : '\\?([^#]+)'
                  },
                  'OQ' : { // Optional Query String
                    // Matches optional query string parameters `:?param:`
                    // (This token definition appears to be incomplete in the original code,
                    // as it only has 'rgx' but not 'save' or 'res' for its purpose)