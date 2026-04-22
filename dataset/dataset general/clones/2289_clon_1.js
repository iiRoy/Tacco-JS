/*
 * This is a Type I clone of the original jQuery Routes plugin code.
 * All functional logic, variable names, and expressions are strictly preserved.
 * Only whitespace, comments, and line breaks have been altered to demonstrate
 * a visually distinct, yet logically identical, code fragment.
 *
 * Original project information:
 * jQuery routes - v2.0
 * Routing in javascript using hashchange event.
 * Project URL: http://thorsteinsson.is/projects/jquery-routes/
 *
 * Copyright (c) 2010 Ægir Þorsteinsson
 * Licensed under Creative Commons Attribution 3.0 license:
 * http://creativecommons.org/licenses/by/3.0/
 */
( function( $ ) {

  // Internal counter for unnamed routes.
  var routecount = 0;

  /**
   * Helper function to left-pad a number with a leading zero if it's a single digit.
   * @param {number} d - The number to pad.
   * @returns {string} The padded number as a string.
   */
  var datelpad = function( d ) {
    d = d + ''; // Convert to string for length check.
    return d.length < 2
      ? '0' + d
      : d;
  };

  /**
   * Defines date types using the legacy 'DD-MM-YYYY' format.
   * Includes parsing and stringification methods for date and dateend.
   */
  var legacyDateTypes = {
    'date': {
      regexp: /(\d{1,2})\-(\d{1,2})\-(\d{4})/, // Regex for DD-MM-YYYY
      parse: function( d, dd, mm, yyyy ) {
        // Note: Months are 0-indexed in Date constructor.
        return new Date( yyyy, datelpad( mm - 1 ), datelpad( dd ) );
      },
      stringify: function( date ) {
        // Formats date back to DD-MM-YYYY.
        return datelpad( date.getDate() )
          + '-'
          + datelpad( date.getMonth() + 1 )
          + '-'
          + date.getFullYear();
      }
    },
    'dateend': {
      regexp: /(\d{1,2})\-(\d{1,2})\-(\d{4})/, // Same regex as 'date'
      parse: function( d, dd, mm, yyyy ) {
        // Creates a date at the very end of the day.
        return new Date( yyyy, mm - 1, dd, 23, 59, 59, 999 );
      },
      stringify: function( date ) {
        // Formats date back to DD-MM-YYYY.
        return datelpad( date.getDate() )
          + '-'
          + datelpad( date.getMonth() + 1 )
          + '-'
          + date.getFullYear();
      }
    }
  };

  /**
   * Defines date types using the ISO 'YYYY-MM-DD' format.
   * Includes parsing and stringification methods.
   */
  var isoDateTypes = {
    'date': {
      regexp: /(\d{4})\-(\d{1,2})\-(\d{1,2})/, // Regex for YYYY-MM-DD
      parse: function( d, yyyy, mm, dd ) {
        // Creates a standard date object.
        return new Date( yyyy, mm - 1, dd );
      },
      stringify: function( date ) {
        // Uses toISOString and splits to get only the date part.
        return date.toISOString().split( 'T' )[ 0 ];
      }
    },
    'dateend': {
      regexp: /(\d{4})\-(\d{1,2})\-(\d{1,2})/, // Same regex as 'date'
      parse: function( d, yyyy, mm, dd ) {
        // Creates a date at the very end of the day using ISO format.
        return new Date( yyyy, mm - 1, dd, 23, 59, 59, 999 );
      },
      stringify: function( date ) {
        // Uses toISOString and splits to get only the date part.
        return date.toISOString().split( 'T' )[ 0 ];
      }
    }
  };

  // Extend jQuery with a 'routes' object for routing functionality.
  $.extend( {
    routes: {

      /**
       * Toggles the date format used by the router (ISO or legacy).
       * @param {boolean} iso - If true, use ISO dates; otherwise, use legacy dates.
       */
      useIsoDates: function( iso ) {
        if ( iso === true ) {
          this.datatypes.date    = isoDateTypes.date;
          this.datatypes.dateend = isoDateTypes.dateend;
        } else {
          this.datatypes.date    = legacyDateTypes.date;
          this.datatypes.dateend = legacyDateTypes.dateend;
        }
      },

      /**
       * Defines various data types for route parameters, including their regex patterns
       * and parsing/stringifying functions.
       */
      datatypes: {
        'int': {
          regexp: /\d+?/, // One or more digits.
          parse: function( d ) {
            return parseInt( d, 10 );
          }
        },
        'float': {
          regexp: /\d+\.\d+?/, // Digits, a dot, then more digits.
          parse: function( d ) {
            return parseFloat( d );
          }
        },
        'word': {
          regexp: /\w+?/ // One or more word characters.
        },
        'string': {
          regexp: /\w+?/ // Alias for word.
        },
        'datetime': {
          regexp: /(\d{4})\-(\d{2})\-(\d{2})T(\d{2}):(\d{2}):(\d{2})\.(\d{3})Z/, // ISO datetime format.
          parse: function( d, yyyy, mm, dd, hh, MM, ss, ms ) {
            // Constructs a Date object from captured groups.
            return new Date( yyyy, mm - 1, dd, hh, MM, ss, ms );
          },
          stringify: function( date ) {
            // Converts Date object to ISO string.
            return date.toISOString();
          }
        },
        'date': isoDateTypes.date, // Default to ISO date format.
        'dateend': isoDateTypes.dateend // Default to ISO dateend format.
      },

      // An object to store all registered routes, indexed by their names.
      list: {},

      // Stores information about the currently active route and its parameters.
      current: null,

      /**
       * Reloads the current route, optionally with updated parameters.
       * If parameters change, it updates the hash. Otherwise, it re-executes the route.
       * @param {object} args - Optional new arguments to merge with current route's arguments.
       */
      reload: function( args ) {
        if ( this.current ) {
          // Merge new arguments with existing ones.
          args = $.extend( this.current.arguments, args );
          var url = this.current.url( args ); // Generate the URL for the new args.
          if ( url !== location.hash ) {
            location.hash = url; // If URL changed, update hash.
          } else {
            this.current.execute( args ); // Otherwise, just re-execute.
          }
        } else {
          // If no current route, force a page reload.
          location.href.replace( location.href );
        }
      },

      /**
       * Adds a new route to the routing system.
       * Routes can be named and have default parameters.
       * @param {string} route - The route pattern (e.g., '/users/{id:int}/edit/').
       * @param {string} [name] - A unique name for the route. If omitted, one is generated.
       * @param {object} [defaults] - Default parameter values for the route.
       * @param {function} func - The callback function to execute when this route matches.
       * @returns {object} The newly created route object.
       */
      add: function( route, name, defaults, func ) {

        // Handle parameter overloading: name/defaults/func can be optional or reordered.
        if ( typeof( name ) === 'function' ) {
          func = name;
          name = undefined;
        }
        if ( typeof( defaults ) === 'function' ) {
          func = defaults;
          defaults = undefined;
        }
        if ( typeof( name ) === 'object' ) {
          defaults = name;
          name = undefined;
        }

        // Ensure every route has a name; generate one if not provided.
        if ( name === undefined ) {
          name = 'route' + ( ++routecount );
        }

        // Ensure route always ends with a slash for consistent matching.
        if ( route[ route.length - 1 ] !== '/' ) {
          route += '/';
        }

        // Regular expression to find parameter placeholders like '{param:datatype}'.
        var regex = /\{\s*?([a-zA-Z0-9:\|\\*\?\.]*?)\s*?\}/gim;
        var items = [ 'var s="#' + route + '";' ]; // Array to build the URL generation function string.
        var item = route; // A mutable copy of the route string for regex processing.
        var routeexp = '^' + route; // The base for the route matching regex.
        var vars = []; // Stores parsed parameter names and their data types.

        // Loop to find and process all parameters in the route string.
        while ( ( match = regex.exec( item ) ) !== null ) {
          var arr = match[ 1 ].split( ':' ); // Split parameter name from its data type.
          var first = arr[ 0 ]; // Parameter name.
          var constraint = arr[ 1 ]; // Data type constraint (e.g., 'int', 'date').

          // Add a replacement instruction to the items array for URL generation.
          items.push( 's=s.replace("' + match[ 0 ] + '",p.' + first + ');' );
          item = item.replace( match[ 0 ], '' ); // Remove the placeholder from the mutable item string.

          if ( constraint ) {
            // If a data type constraint is specified.
            if ( $.routes.datatypes[ constraint ] ) {
              // Use the regex from the predefined datatype.
              constraint = $.routes.datatypes[ constraint ].regexp.toString();
              constraint = constraint.replace( /\/[gim]+$/g, '' ); // Remove regex flags.
              constraint = constraint.replace( /\/$|^\//g, '' ); // Remove wrapping slashes.
              constraint = constraint.replace( /[\(\)]/g, '' ); // Remove any existing groups.
            }
            constraint = '(' + constraint + ')'; // Wrap the constraint in a capturing group.
          } else {
            // If no data type, default to a general non-greedy match.
            constraint = '(.*?)';
          }

          if ( defaults && defaults[ first ] ) {
            constraint += '?'; // If a default exists, make the parameter optional in the regex.
          }

          routeexp = routeexp.replace( match[ 0 ], constraint ); // Replace placeholder with its regex part.
          vars.push( match[ 1 ].split( ':' ) ); // Store parameter name and type.
          regex.lastIndex = match.index; // Reset regex lastIndex for next match on the original route.
        }
        items.push( 'return s;' ); // Final statement for the URL generation function.

        /**
         * Internal helper to find the datatype definition for a given parameter name.
         * @param {string} parameter - The name of the parameter.
         * @returns {object|undefined} The datatype object or undefined if not found.
         */
        var getDatatype = function( parameter ) {
          for ( var i = 0, len = vars.length; i < len; i++ ) {
            if ( vars[ i ][ 0 ] === parameter ) {
              return $.routes.datatypes[ vars[ i ][ 1 ] ];
            }
          }
        };

        /**
         * Prepares parameter values for URL generation, applying stringify methods if available.
         * @param {object} obj - The raw parameter object.
         * @returns {object} The prepared parameter object.
         */
        var getParams = function( obj ) {
          var args = $.extend( {}, defaults, obj ),
            dt; // Merge defaults with provided params.
          for ( var item in args ) {
            if ( args.hasOwnProperty( item ) ) {
              dt = getDatatype( item ); // Get datatype for current parameter.
              if ( dt && dt.stringify ) {
                args[ item ] = dt.stringify( args[ item ] ); // Apply stringify if available.
              }
            }
          }
          return args;
        };

        // Create a function dynamically to combine parameters into a URL string.
        var combine = new Function( 'p', items.join( '' ) );

        /**
         * Generates the full URL hash for this route with given parameters.
         * @param {object} p - Parameters for the route.
         * @returns {string} The generated URL hash.
         */
        var url = function( p ) {
          return combine( getParams( p ) );
        };

        /**
         * Extracts and parses parameters from a given hash string based on the route's definition.
         * @param {string} hash - The URL hash string.
         * @returns {object} An object containing extracted and parsed parameters.
         */
        var extract = function( hash ) {
          // Initialize context with default values.
          var context = defaults
            ? defaults
            : {};
          var currentArgs = route.exp.exec( hash ); // Execute route regex on the hash.

          // Iterate through defined route variables to extract and parse.
          $.each( vars, function( x, varsEntry ) {
            var datatype = $.routes.datatypes[ varsEntry[ 1 ] ]; // Get datatype definition.
            var val = currentArgs[ x + 1 ]; // The raw value captured by regex.

            // If a datatype is defined and has a parse method.
            if ( datatype && datatype.parse ) {
              var parseArgs = [ val ]; // Start with the raw value.
              // If datatype has a specific regex for parsing, execute it.
              if ( datatype.regexp ) {
                // Use the raw value or stringified default if value is missing for parsing regex.
                var p = datatype.regexp.exec( val || ( defaults && defaults[ varsEntry[0] ] ? datatype.stringify( defaults[ varsEntry[0] ] ) : '' ) );
                if ( p ) {
                  // Add captured groups as arguments to the parse function.
                  for ( var y = 1; y < p.length; y++ ) {
                    parseArgs.push( p[ y ] );
                  }
                }
              }
              val = datatype.parse.apply( datatype, parseArgs ); // Apply the parse function.
            }
            context[ varsEntry[ 0 ] ] = val; // Assign the parsed value to the context.
          } );
          return context;
        };

        // Add the newly created route object to the global list.
        return this.list[ name ] = {
          name: name, // Route's unique name.
          exp: new RegExp( routeexp, 'i' ), // The compiled regular expression for matching.
          route: route, // The original route string pattern.
          func: func, // The callback function.
          url: url, // Function to generate URL from parameters.
          routeTo: function( data ) {
            // Helper to navigate to this route.
            location.href = this.url( data );
          },
          execute: function( data ) {
            // Executes the route's callback function with extended parameters.
            this.func.apply( $.extend( {}, defaults, data ) );
          },
          vars: vars, // Array of parameter definitions.
          defaults: defaults, // Default parameter values.
          level: route.length - route.replace( new RegExp( "/", "g" ), '' ).length, // Number of slashes in the route.
          extract: extract // Function to extract parameters from a hash.
        };
      },

      /**
       * Adds a custom data type definition to the router.
       * @param {string} name - The name of the new data type.
       * @param {object} dt - The data type definition (regexp, parse, stringify).
       */
      addDataType: function( name, dt ) {
        $.routes.datatypes[ name ] = dt;
        createDatatypeArray( name ); // Also create an array version of this datatype.
      },

      /**
       * Retrieves a registered route by its name.
       * @param {string} name - The name of the route to find.
       * @returns {object|undefined} The route object or undefined if not found.
       */
      find: function( name ) {
        return this.list[ name ];
      },

      /**
       * Finds the best matching route for a given hash string.
       * Prioritizes routes with higher 'level' (more specific routes).
       * @param {string} hash - The hash string (without '#').
       * @returns {object|undefined} The best matching route object.
       */
      findRoute: function( hash ) {
        var route; // Stores the best matching route.
        // Iterate through all registered routes.
        $.each( this.list, function( i, match ) {
          var exp = match.exp.exec( hash ); // Attempt to match the hash.
          if ( exp ) {
            // If a match is found, and it's either the first match or more specific.
            if ( ( route && match.level > route.level ) || !route ) {
              route = match; // Update the best route.
              args = exp; // Store the captured regex groups (used by extract).
            }
          }
        } );
        return route;
      },

      /**
       * Loads and executes the route corresponding to the current hash.
       * @param {string} hash - The full hash string (e.g., '#/users/123/').
       */
      load: function( hash ) {
        // Find the most suitable route by removing the '#' prefix.
        var route = $.routes.findRoute( hash.substr( 1 ) );

        // If no route matches, simply return.
        if ( !route ) {
          return;
        }

        // Extract parameters from the hash using the matched route's extractor.
        var params = route.extract( hash );

        // Set the current route and its arguments.
        $.routes.current           = route;
        $.routes.current.arguments = params;

        // Execute the route's callback function.
        route.execute( params );
      }
    }
  } );

  /**
   * Custom jQuery expression selector to find elements that have a link
   * whose href attribute ends with the current location hash.
   * ':hasRoute'
   */
  $.expr[ ':' ].hasRoute = function( elem, index, match ) {
    return $( elem ).has( 'a[href$=' + location.hash + ']' ).length > 0;
  };

  /**
   * jQuery plugin to update hrefs of 'a' tags within a selected element.
   * It re-generates route URLs based on new parameters.
   * @param {object} params - Parameters to merge into the route URLs.
   */
  $.fn.updateRoutes = function( params ) {
    $( 'a', this ).each( function() {
      var item = $( this ),
        hash = item.attr( 'href' ).substr( 1 ), // Get hash part from href.
        route = $.routes.findRoute( hash ); // Find the matching route for this link.
      if ( !route ) {
        return; // Skip if no route found.
      }

      var linkparams = route.extract( hash ); // Extract existing parameters from the link's href.
      // Generate new hash by merging existing and new parameters.
      var newhash = route.url( $.extend( {}, linkparams, params ) );
      item.attr( 'href', newhash ); // Update the link's href.
    } );
  };

  /**
   * Creates an "array" version of a given datatype.
   * For example, if 'int' is defined, this creates 'intarray' which can parse/stringify '/1/2/3'.
   * @param {string} name - The name of the base datatype.
   */
  function createDatatypeArray( name ) {
    var dt = $.routes.datatypes[ name ]; // Get the base datatype definition.
    $.routes.datatypes[ name + 'array' ] = {
      datatype: name, // Reference to the original datatype.
      // Regex matches one or more occurrences of the base datatype's regex, separated by '/' or '?' (optional).
      regexp: new RegExp( '[' + dt.regexp.toString().slice( 1, dt.regexp.toString().length - 1 ) + '\\/\?]*', 'i' ),
      parse: function( d ) {
        var arr = d.split( '/' ), // Split the input string by '/'.
          newarr = [], // Array to store parsed values.
          baseDt = $.routes.datatypes[ this.datatype ]; // Get the base datatype again.
        for ( var i = 0; i < arr.length; i++ ) {
          // Execute base datatype's regex on each segment.
          var groups = baseDt.regexp.exec( arr[ i ] ).slice( 1 );
          var args = [ arr[ i ] ].concat( groups ); // Prepare arguments for base datatype's parse.
          newarr.push( baseDt.parse.apply( baseDt, args ) ); // Parse and add to newarr.
        }
        return newarr;
      },
      stringify: function( arr ) {
        for ( var i = 0; i < arr.length; i++ ) {
          var baseDt = $.routes.datatypes[ this.datatype ]; // Get the base datatype.
          // Stringify each item using base datatype's stringify or toString.
          arr[ i ] = ( !!baseDt.stringify
            ? baseDt.stringify( arr[ i ] )
            : arr[ i ].toString() );
        }
        return arr.join( '/' ); // Join stringified items with '/'.
      }
    };
  }

  // Initialize: create array data types for all existing basic datatypes.
  var dts = $.extend( {}, $.routes.datatypes ); // Create a shallow copy to iterate safely.
  for ( var name in dts ) {
    if ( dts.hasOwnProperty( name ) ) {
      createDatatypeArray( name );
    }
  }

  // Event Listener: Bind to the 'hashchange' event to load routes dynamically.
  $( window ).bind( 'hashchange', function() {
    $.routes.load( location.hash );
  } );

  // Document Ready: Run the route loading logic once the DOM is ready.
  $( function() {
    var hash = location.hash;
    if ( hash.length > 0 ) {
      // Ensure hash ends with a slash if it's not empty, for consistent matching.
      if ( hash[ hash.length - 1 ] !== '/' ) {
        hash += '/';
      }
      $.routes.load( hash ); // Load the initial route based on the URL hash.
    }
  } );

}( jQuery ) );