( function webpackUniversalModuleDefinition( root , factory ) {

  // This is a Universal Module Definition (UMD) pattern.
  // It allows the library to be used in various JavaScript environments.

  // Check for CommonJS environment (e.g., Node.js, Webpack, Browserify).
	if ( typeof exports === 'object' && typeof module === 'object' ) {
		module.exports = factory();
	}
  // Check for AMD (Asynchronous Module Definition) environment (e.g., RequireJS).
	else if ( typeof define === 'function' && define.amd ) {
		define( factory );
	}
  // Check for a simpler CommonJS-like environment (e.g., older Node, some build tools).
	else if ( typeof exports === 'object' ) {
		exports[ "sourceMappedStackTrace" ] = factory();
	}
  // If no module system is detected, expose the library globally on the 'root' object (usually 'window').
	else {
		root[ "sourceMappedStackTrace" ] = factory();
	}

} ) ( this , function() {

  // This function encapsulates the Webpack runtime and all bundled modules.
  return ( function( modules ) { // webpackBootstrap - This comment is part of the original Webpack output.

    // A cache to store modules that have already been loaded.
    var installedModules = {};

    // The core Webpack 'require' function.
    function __webpack_require__( moduleId ) {

      // If the module is already in the cache, return its exports immediately.
      if ( installedModules[ moduleId ] ) {
        return installedModules[ moduleId ].exports;
      }

      // If the module is not in cache, create a new module object.
      var module = installedModules[ moduleId ] = {
        exports : {}, // The object that will hold the module's exports.
        id      : moduleId, // The unique ID of this module.
        loaded  : false     // A flag indicating if the module has completed loading.
      };

      // Execute the module's function, binding 'this' to module.exports,
      // and passing 'module', 'module.exports', and '__webpack_require__' as arguments.
      modules[ moduleId ].call( module.exports, module, module.exports, __webpack_require__ );

      // Mark the module as loaded after its execution.
      module.loaded = true;

      // Return the exports of the module.
      return module.exports;

    } // End of __webpack_require__ function.


    // Expose the 'modules' object itself for advanced usage or introspection.
    __webpack_require__.m = modules;

    // Expose the module cache for debugging or analysis.
    __webpack_require__.c = installedModules;

    // Set the public path for assets. It's typically an empty string here.
    __webpack_require__.p = "";

    // Load the entry module (module 0) and return its exports.
    // This effectively starts the application or library.
    return __webpack_require__( 0 );

  } )
  /************************************************************************/
  // This array contains all the bundled module definitions.
  ([
    /* 0 */
    /***/ function( module, exports, __webpack_require__ ) {

      // This is the primary module for the 'sourcemapped-stacktrace' library.
      // It includes logic for re-mapping stack traces using source maps.

      var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;

      /*
       * sourcemapped-stacktrace.js
       * created by James Salter <iteration@gmail.com> (2014)
       *
       * Project repository: https://github.com/novocaine/sourcemapped-stacktrace
       *
       * Licensed under the New BSD license. Please see the accompanying LICENSE file or visit:
       * http://opensource.org/licenses/BSD-3-Clause
       */

      /*global define */ // Ensure 'define' is recognized by linters for AMD context.

      // Important: We specifically include only the 'source-map-consumer' component.
      // The full 'source-map' library contains generation tools not required for this project.
      ! ( __WEBPACK_AMD_DEFINE_ARRAY__ = [ __webpack_require__( 1 ) ], __WEBPACK_AMD_DEFINE_RESULT__ = ( function( source_map_consumer ) {

        /**
         * The main function of the library: re-maps entries in a given stacktrace
         * by utilizing available source maps.
         *
         * @param {Array<string>} stack - An array of strings, typically obtained from the browser's
         *                                stack representation (e.g., `Error.stack`).
         *                                Currently, only the Chrome stack format is reliably supported.
         * @param {function(Array<string>)} done - A callback function. It will be invoked once the
         *                                          transformation is complete, receiving the re-mapped
         *                                          stacktrace (an Array of Strings) as its first argument.
         */
        var mapStackTrace = function( stack, done ) {

          var lines = stack.split( "\n" ); // Split the raw stack string into individual lines.
          var mapForUri = {};              // Object to store fetched source map data, keyed by script URI.
          var rows = {};                   // Object to store parsed fields for each stack trace line.

          // Initialize a Fetcher instance to manage asynchronous script and source map loading.
          var fetcher = new Fetcher( function() {
            // Once all necessary scripts and maps are fetched, proceed to process them.
            var result = [ lines[ 0 ] ]
              .concat(
                processSourceMaps( lines, rows, fetcher.mapForUri )
              )
              .join( "\n" ); // Re-join the processed lines into a single stack string.
            done( result ); // Invoke the provided callback with the final re-mapped stack trace.
          } );

          // Iterate through the stack trace lines, starting from the second line (skipping the initial exception message).
          for ( var i = 1; i < lines.length; i++ ) {
            // Use a regular expression to extract the URI, line number, and column number.
            // This regex specifically targets Chrome's stack trace format (e.g., "    at <func> (<uri>:<line>:<col>)").
            var fields = lines[ i ].match( /^ +at.+\((.*):([0-9]+):([0-9]+)/ );
            if ( fields && fields.length === 4 ) { // Ensure the match was successful and all groups were captured.
              rows[ i ] = fields; // Store the parsed fields for this line.
              var uri = fields[ 1 ];
              var line = parseInt( fields[ 2 ] );
              var col = parseInt( fields[ 3 ], 10 );
              fetcher.fetchScript( uri ); // Request the Fetcher to load this script and its potential source map.
            }
          }
        }; // End of mapStackTrace function.

        /**
         * A utility class responsible for asynchronously fetching script files and their
         * associated source map files.
         *
         * @param {function} done - A callback function to be executed when all pending
         *                          fetch operations have completed.
         */
        var Fetcher = function( done ) {
          this.sem = 0;              // Semaphore to track the number of active/pending HTTP requests.
          this.mapForUri = {};       // A dictionary to cache source map contents, indexed by script URI.
          this.done = done;          // The callback to invoke once all fetching is finished.
        };

        /**
         * Initiates the fetching process for a given script URI.
         * It checks if the URI is already being processed or has been processed.
         *
         * @param {string} uri - The Uniform Resource Identifier (URL) of the script to fetch.
         */
        Fetcher.prototype.fetchScript = function( uri ) {
          // If the URI is not yet in our map cache, proceed to fetch it.
          if ( ! ( uri in this.mapForUri ) ) {
            this.sem++;                // Increment the semaphore to indicate a new active request.
            this.mapForUri[ uri ] = null; // Mark the URI as being processed (value will be filled later).
          } else {
            return; // If already fetching or fetched, do nothing further.
          }

          var xhr = createXMLHTTPObject(); // Create a new XMLHttpRequest object.
          var that = this;                 // Capture 'this' context for use within the event handler.
          xhr.onreadystatechange = function( e ) {
            that.onScriptLoad.call( that, e, uri ); // Call the handler, ensuring correct 'this' context.
          };
          xhr.open( "GET", uri, true ); // Configure the request: GET method, URI, asynchronous.
          xhr.send();                  // Send the HTTP request.
        }; // End of fetchScript method.

        // Regular expression to determine if a URL is absolute (starts with a scheme or //).
        var absUrlRegex = new RegExp( '^(?:[a-z]+:)?//', 'i' );

        /**
         * Event handler for the XMLHttpRequest's `onreadystatechange` event when fetching a script.
         * After a script loads, it attempts to find and fetch its corresponding source map.
         *
         * @param {Event} e - The event object from the XMLHttpRequest.
         * @param {string} uri - The URI of the script that was being fetched.
         */
        Fetcher.prototype.onScriptLoad = function( e, uri ) {
          // Only process when the request is complete (readyState 4).
          if ( e.target.readyState !== 4 ) {
            return;
          }

          // Check if the script fetch was successful (HTTP status 200, or 0 for local file://).
          if ( e.target.status === 200 || ( uri.slice( 0, 7 ) === "file://" && e.target.status === 0 ) ) {
            // Search for the '//# sourceMappingURL=' comment within the script's content.
            var match = e.target.responseText.match( "//# sourceMappingURL=(.*)" );
            if ( match && match.length === 2 ) {
              // Extract the source map URI from the matched comment.
              var mapUri = match[ 1 ];

              // If the map URI is relative, resolve it against the script's base URI.
              if ( ! absUrlRegex.test( mapUri ) ) {
                var origin;
                var lastSlash = uri.lastIndexOf( '/' );
                if ( lastSlash !== -1 ) {
                  origin = uri.slice( 0, lastSlash + 1 ); // Get the base path of the script.
                  mapUri = origin + mapUri;               // Prepend it to the relative map URI.
                  // Note: If lastSlash is -1 (no slash in URI), the script is a bare filename.
                  // In this edge case, we cannot resolve a relative map URI reliably, so it's treated as absolute.
                }
              }

              var xhrMap = createXMLHTTPObject(); // Create another XHR object for the source map file.
              var that = this;
              xhrMap.onreadystatechange = function() {
                if ( xhrMap.readyState === 4 ) {
                  that.sem--; // Decrement semaphore as this map request is finished.
                  // Check for successful source map fetch.
                  if ( xhrMap.status === 200 || ( mapUri.slice( 0, 7 ) === "file://" && xhrMap.status === 0 ) ) {
                    that.mapForUri[ uri ] = xhrMap.responseText; // Store the fetched source map content.
                  }
                  // If all pending requests (including the current one) are complete, trigger the main 'done' callback.
                  if ( that.sem === 0 ) {
                    that.done( that.mapForUri );
                  }
                }
              };

              xhrMap.open( "GET", mapUri, true ); // Configure and send the request for the source map.
              xhrMap.send();
            } else {
              // No sourceMappingURL comment found in the script.
              this.sem--; // Decrement semaphore, as this script's processing is now complete.
            }
          } else {
            // An HTTP error occurred while fetching the script URI itself.
            this.sem--; // Decrement semaphore, as this script's processing is now complete.
          }

          // After handling the current script/map, check if all operations are done.
          if ( this.sem === 0 ) {
            this.done( this.mapForUri ); // If so, call the final 'done' callback.
          }
        }; // End of onScriptLoad method.

        /**
         * Processes the stack trace lines using the fetched source map data.
         * This function iterates through each stack line, and if a source map is available
         * for the corresponding script, it re-maps the position to its original source.
         *
         * @param {Array<string>} lines - The original stack trace lines.
         * @param {Object} rows - An object containing parsed fields (URI, line, column) for each line.
         * @param {Object} mapForUri - A dictionary mapping script URIs to their source map content.
         * @returns {Array<string>} An array of transformed stack trace lines.
         */
        var processSourceMaps = function( lines, rows, mapForUri ) {
          var result = []; // Initialize an array to hold the remapped or re-formatted lines.
          var map;         // Variable to temporarily hold the source map for the current URI.

          for ( var i = 1; i < lines.length; i++ ) { // Iterate through stack lines, skipping the first.
            var row = rows[ i ]; // Retrieve the parsed fields for the current line.
            if ( row ) {
              var uri = row[ 1 ];    // Extract the script URI.
              map = mapForUri[ uri ]; // Get the source map content associated with this URI.
            }

            if ( map ) {
              // If a source map exists for the current URI, create a SourceMapConsumer instance.
              var smc = new source_map_consumer.SourceMapConsumer( map );
              // Query the source map for the original position based on the generated line and column.
              var origPos = smc.originalPositionFor(
                {
                  line   : parseInt( row[ 2 ], 10 ), // Parse generated line number.
                  column : parseInt( row[ 3 ], 10 )  // Parse generated column number.
                }
              );
              // Format the retrieved original position into a standard stack trace line.
              result.push(
                formatOriginalPosition( origPos.source, origPos.line, origPos.column, origPos.name )
              );
            } else {
              // If no source map is available, or if fetching failed,
              // re-add the original line (possibly re-formatted for consistency).
              result.push( lines[ i ] );
            }
          }

          return result; // Return the array of processed stack trace lines.
        }; // End of processSourceMaps function.

        /**
         * Formats the components of an original source position into a readable
         * stack trace line string, mimicking Chrome's format.
         *
         * @param {string} source - The name or URL of the original source file.
         * @param {number} line - The 1-based line number in the original source.
         * @param {number} column - The 0-based column number in the original source.
         * @param {string|null} name - The original name of the function or variable, if available.
         * @returns {string} A formatted string representing the original position.
         */
        var formatOriginalPosition = function( source, line, column, name ) {
          // The format is "    at <name> (<source>:<line>:<column>)"
          return "    at " + ( name ? name : "(unknown)" ) +
            " (" + source + ":" + line + ":" + column + ")";
        }; // End of formatOriginalPosition function.

        // Cross-browser boilerplate for creating XMLHttpRequest objects.
        // This array lists different factory functions for various browser environments.
        var XMLHttpFactories = [
          function() {
            return new XMLHttpRequest();
          },
          function() {
            return new ActiveXObject( "Msxml2.XMLHTTP" );
          },
          function() {
            return new ActiveXObject( "Msxml3.XMLHTTP" );
          },
          function() {
            return new ActiveXObject( "Microsoft.XMLHTTP" );
          }
        ];

        /**
         * Attempts to create an XMLHttpRequest object using a list of known factory functions.
         * This ensures compatibility across different browser versions and IE variants.
         *
         * @returns {XMLHttpRequest|null} A new XMLHttpRequest object if successful, otherwise null.
         */
        function createXMLHTTPObject() {
          var xmlhttp = false; // Initialize the return variable to false.
          for ( var i = 0; i < XMLHttpFactories.length; i++ ) {
            try {
              xmlhttp = XMLHttpFactories[ i ](); // Try creating an object using the current factory.
            } catch ( e ) {
              continue; // If an error occurs (e.g., factory not supported), try the next one.
            }
            break; // If creation is successful, exit the loop.
          }
          return xmlhttp; // Return the created object.
        } // End of createXMLHTTPObject function.

        // Public API: Return an object exposing the main `mapStackTrace` function.
        return {
          mapStackTrace: mapStackTrace
        };

      }.apply( null, __WEBPACK_AMD_DEFINE_ARRAY__ ) ), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && ( module.exports = __WEBPACK_AMD_DEFINE_RESULT__ ) );


    }, // End of module 0.
    /* 1 */
    /***/ function( module, exports, __webpack_require__ ) {

      // This module provides the SourceMapConsumer class,
      // which is used to interpret and query source map data.

      var __WEBPACK_AMD_DEFINE_RESULT__;

      /* -*- Mode: js; js-indent-level: 2; -*- */
      /*
       * Copyright 2011 Mozilla Foundation and contributors.
       * This code is licensed under the New BSD license.
       * For details, refer to the LICENSE file or visit:
       * http://opensource.org/licenses/BSD-3-Clause
       */

      // Conditional `define` for compatibility with `amdefine` in Node.js environments.
      // The `if (false)` ensures this block is stripped by bundlers in browser contexts.
      if ( false ) {
        var define = require( 'amdefine' )( module, require );
      }

      // AMD definition for the SourceMapConsumer module.
      ! ( __WEBPACK_AMD_DEFINE_RESULT__ = ( function( require, exports, module ) {

        // Internal dependencies for the SourceMapConsumer.
        var util       = __webpack_require__( 2 );
        var binarySearch = __webpack_require__( 3 );
        var ArraySet   = __webpack_require__( 4 ).ArraySet;
        var base64VLQ  = __webpack_require__( 5 );

        /**
         * The `SourceMapConsumer` class represents a parsed source map,
         * enabling queries for original file positions given a position
         * in the generated source.
         *
         * The constructor takes the raw source map, which can be either
         * a JSON string or an already parsed object.
         *
         * According to the source map specification, a source map should have
         * the following attributes:
         *
         *   - `version`: The version of the source map specification being followed.
         *   - `sources`: An array of URLs pointing to the original source files.
         *   - `names`: An array of identifiers (variable, function names)
         *              that can be referenced by individual mappings.
         *   - `sourceRoot`: (Optional) The URL root from which all `sources` are relative.
         *   - `sourcesContent`: (Optional) An array containing the actual contents
         *                       of the original source files.
         *   - `mappings`: A string composed of base64 VLQs (Variable-length Quantity)
         *                 which encode the actual mapping data.
         *   - `file`: (Optional) The name of the generated file this source map is associated with.
         *
         * Here is a canonical example of a source map structure, as depicted in the official
         * source map specification [0]:
         *
         *     {
         *       version : 3,
         *       file: "out.js",
         *       sourceRoot : "",
         *       sources: ["foo.js", "bar.js"],
         *       names: ["src", "maps", "are", "fun"],
         *       mappings: "AA,AB;;ABCDE;"
         *     }
         *
         * [0]: For more details, refer to the source map spec:
         *      https://docs.google.com/document/d/1U1RGAehQwRypUTovF1KRlpiOFze0b-_2gc6fAH0KY0k/edit?pli=1#
         *
         * @param {string|object} aSourceMap - The raw source map data (string or parsed object).
         */
        function SourceMapConsumer( aSourceMap ) {
          var sourceMap = aSourceMap;
          // If the input is a string, it needs to be parsed from JSON.
          if ( typeof aSourceMap === 'string' ) {
            // Remove the ")]}'" prefix that some tools add for security reasons (JSONP-like protection).
            sourceMap = JSON.parse( aSourceMap.replace( /^\)\]\}'/, '' ) );
          }

          // Extract mandatory and optional properties from the source map object.
          var version      = util.getArg( sourceMap, 'version' );
          var sources      = util.getArg( sourceMap, 'sources' );
          // Note: Sass 3.3 omits the 'names' array, so we allow an empty array as a default.
          // This slightly deviates from the spec, but enhances compatibility.
          var names        = util.getArg( sourceMap, 'names', [] );
          var sourceRoot   = util.getArg( sourceMap, 'sourceRoot', null );
          var sourcesContent = util.getArg( sourceMap, 'sourcesContent', null );
          var mappings     = util.getArg( sourceMap, 'mappings' );
          var file         = util.getArg( sourceMap, 'file', null );

          // Validate the source map version.
          // Loose equality (`!=`) is used because some tools (like Sass) might provide
          // the version as a string rather than a number.
          if ( version != this._version ) {
            throw new Error( 'Unsupported source map version: ' + version );
          }

          // Initialize `_names` and `_sources` as `ArraySet` instances.
          // The `true` argument allows duplicate entries, accommodating certain
          // compiler outputs (e.g., TypeScript) which might include duplicates.
          // See GitHub issue #72 and bugzil.la/889492 for context.
          this._names = ArraySet.fromArray( names, true );
          this._sources = ArraySet.fromArray( sources, true );

          // Store other properties directly on the instance.
          this.sourceRoot = sourceRoot;
          this.sourcesContent = sourcesContent;
          this._mappings = mappings;
          this.file = file;
        } // End of SourceMapConsumer constructor.

        /**
         * A static factory method to create a `SourceMapConsumer` instance
         * directly from a `SourceMapGenerator` instance.
         * This method avoids the overhead of serializing and then parsing the source map.
         *
         * @param {SourceMapGenerator} aSourceMap - The source map generator object.
         * @returns {SourceMapConsumer} A new instance of SourceMapConsumer.
         */
        SourceMapConsumer.fromSourceMap =
          function SourceMapConsumer_fromSourceMap( aSourceMap ) {
            // Create an object that inherits from SourceMapConsumer's prototype.
            var smc = Object.create( SourceMapConsumer.prototype );

            // Copy properties from the generator to the consumer instance.
            smc._names = ArraySet.fromArray( aSourceMap._names.toArray(), true );
            smc._sources = ArraySet.fromArray( aSourceMap._sources.toArray(), true );
            smc.sourceRoot = aSourceMap._sourceRoot;
            smc.sourcesContent = aSourceMap._generateSourcesContent(
              smc._sources.toArray(),
              smc.sourceRoot
            );
            smc.file = aSourceMap._file;

            // Clone and sort the mappings arrays.
            // `__generatedMappings` is sorted by generated positions.
            smc.__generatedMappings = aSourceMap._mappings.slice()
              .sort( util.compareByGeneratedPositions );
            // `__originalMappings` is sorted by original positions.
            smc.__originalMappings = aSourceMap._mappings.slice()
              .sort( util.compareByOriginalPositions );

            return smc;
          }; // End of SourceMapConsumer.fromSourceMap.

        /**
         * The `_version` property stores the supported version of the source mapping specification.
         * @type {number}
         * @private
         */
        SourceMapConsumer.prototype._version = 3;

        /**
         * A getter property that returns an array of absolute URLs for the original source files.
         * It resolves relative source paths against the `sourceRoot` if one is defined.
         * @type {Array<string>}
         */
        Object.defineProperty( SourceMapConsumer.prototype, 'sources', {
          get: function() {
            return this._sources.toArray().map( function( s ) {
              // If `sourceRoot` exists, join it with the source path; otherwise, use the source path as is.
              return this.sourceRoot != null ? util.join( this.sourceRoot, s ) : s;
            }, this ); // The `this` context for the map function is set to the SourceMapConsumer instance.
          }
        } );

        // Internal arrays to hold parsed mapping coordinates from the source map's "mappings" attribute.
        // These arrays are initialized lazily (only when first accessed) because parsing mappings
        // can be computationally expensive, and it might not always be necessary.
        //
        // Each object within these arrays has the following structure:
        //
        //     {
        //       generatedLine:   The 1-based line number in the generated code,
        //       generatedColumn: The 0-based column number in the generated code,
        //       source:          The path (URL) to the original source file that contributed to this code chunk,
        //       originalLine:    The 1-based line number in the original source,
        //       originalColumn:  The 0-based column number in the original source,
        //       name:            The name of the original symbol (e.g., function name, variable name)
        //                        which generated this specific chunk of code.
        //     }
        //
        // Note: All properties except `generatedLine` and `generatedColumn` can potentially be `null`
        // if the corresponding information is not available in the source map.
        //
        // `_generatedMappings` will be ordered primarily by `generatedLine` and then `generatedColumn`.
        // `_originalMappings` will be ordered primarily by `source`, then `originalLine`, then `originalColumn`.

        SourceMapConsumer.prototype.__generatedMappings = null; // Backing field for _generatedMappings.
        Object.defineProperty( SourceMapConsumer.prototype, '_generatedMappings', {
          get: function() {
            // If the mappings haven't been parsed yet, perform the parsing.
            if ( ! this.__generatedMappings ) {
              this.__generatedMappings = [];
              this.__originalMappings = []; // Initialize both arrays together.
              this._parseMappings( this._mappings, this.sourceRoot );
            }
            return this.__generatedMappings;
          }
        } );

        SourceMapConsumer.prototype.__originalMappings = null; // Backing field for _originalMappings.
        Object.defineProperty( SourceMapConsumer.prototype, '_originalMappings', {
          get: function() {
            // If the mappings haven't been parsed yet, perform the parsing.
            if ( ! this.__originalMappings ) {
              this.__generatedMappings = []; // Initialize both arrays together for consistency.
              this.__originalMappings = [];
              this._parseMappings( this._mappings, this.sourceRoot );
            }
            return this.__originalMappings;
          }
        } );

        /**
         * Parses the base64 VLQ string of mappings (`aStr`) into a structured
         * data format. This populates the `__generatedMappings` and
         * `__originalMappings` arrays.
         *
         * @param {string} aStr - The base64 VLQ string containing all the mapping data.
         * @param {string} aSourceRoot - The source root path, used for resolving source URLs.
         * @private
         */
        SourceMapConsumer.prototype._parseMappings =
          function SourceMapConsumer_parseMappings( aStr, aSourceRoot ) {
            var generatedLine           = 1; // Current line in generated code (1-based).
            var previousGeneratedColumn = 0; // Last generated column position (0-based).
            var previousOriginalLine    = 0; // Last original line position (0-based).
            var previousOriginalColumn  = 0; // Last original column position (0-based).
            var previousSource          = 0; // Index of the last source file referenced.
            var previousName            = 0; // Index of the last name referenced.
            var mappingSeparator        = /^[,;]/; // Regular expression to identify mapping separators.
            var str                     = aStr; // The remaining string to parse.
            var mapping;                        // Object to store the details of the current mapping.
            var temp;                           // Temporary variable to hold results from `base64VLQ.decode`.

            while ( str.length > 0 ) {
              if ( str.charAt( 0 ) === ';' ) {
                generatedLine++;               // Increment generated line number.
                str = str.slice( 1 );          // Consume the semicolon.
                previousGeneratedColumn = 0;   // Reset generated column for the new line.
              } else if ( str.charAt( 0 ) === ',' ) {
                str = str.slice( 1 );          // Consume the comma.
              } else {
                mapping = {};                  // Start a new mapping object.
                mapping.generatedLine = generatedLine; // Set the generated line for this mapping.

                // Decode the generated column field (first field in a segment).
                temp = base64VLQ.decode( str );
                mapping.generatedColumn = previousGeneratedColumn + temp.value;
                previousGeneratedColumn = mapping.generatedColumn; // Update for next iteration.
                str = temp.rest;                                   // Update the remaining string.

                // Check if there are more fields (original source, line, column, name).
                if ( str.length > 0 && ! mappingSeparator.test( str.charAt( 0 ) ) ) {
                  // Decode the original source index (second field).
                  temp = base64VLQ.decode( str );
                  mapping.source = this._sources.at( previousSource + temp.value );
                  previousSource += temp.value; // Update for next iteration.
                  str = temp.rest;
                  if ( str.length === 0 || mappingSeparator.test( str.charAt( 0 ) ) ) {
                    throw new Error( 'Parsing error: Found a source, but no line and column followed.' );
                  }

                  // Decode the original line number (third field).
                  temp = base64VLQ.decode( str );
                  mapping.originalLine = previousOriginalLine + temp.value;
                  previousOriginalLine = mapping.originalLine; // Update for next iteration.
                  // Source map lines are 1-based, but VLQ encoding for lines is 0-based relative to previous.
                  mapping.originalLine += 1;
                  str = temp.rest;
                  if ( str.length === 0 || mappingSeparator.test( str.charAt( 0 ) ) ) {
                    throw new Error( 'Parsing error: Found a source and line, but no column followed.' );
                  }

                  // Decode the original column number (fourth field).
                  temp = base64VLQ.decode( str );
                  mapping.originalColumn = previousOriginalColumn + temp.value;
                  previousOriginalColumn = mapping.originalColumn; // Update for next iteration.
                  str = temp.rest;

                  // Check for the optional original name field (fifth field).
                  if ( str.length > 0 && ! mappingSeparator.test( str.charAt( 0 ) ) ) {
                    // Decode the original name index.
                    temp = base64VLQ.decode( str );
                    mapping.name = this._names.at( previousName + temp.value );
                    previousName += temp.value; // Update for next iteration.
                    str = temp.rest;
                  }
                }
                // Add the fully parsed mapping to the generated mappings array.
                this.__generatedMappings.push( mapping );
                // If original line information exists, also add to original mappings array.
                if ( mapping.originalLine != null ) {
                  this.__originalMappings.push( mapping );
                }
              }
            }
            // After parsing all segments, ensure the mapping arrays are sorted correctly.
            this.__generatedMappings.sort( util.compareByGeneratedPositions );
            this.__originalMappings.sort( util.compareByOriginalPositions );
          }; // End of _parseMappings method.