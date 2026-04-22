(function universalModuleLoader(globalObj, moduleProducer) {
  if (typeof exports === 'object' && typeof module === 'object') {
    module.exports = moduleProducer();
  } else if (typeof define === 'function' && define.amd) {
    define(moduleProducer);
  } else if (typeof exports === 'object') {
    exports["tracedErrorMapper"] = moduleProducer();
  } else {
    globalObj["tracedErrorMapper"] = moduleProducer();
  }
})(this, function() {
  return (function(componentUnits) { // packageBootstrapper
    // The component cache storage
    var cachedUnits = {};

    // The component loading function
    function __load_unit__(unitId) {

      // Verify if the component is already in cache
      if (cachedUnits[unitId]) {
        return cachedUnits[unitId].output;
      }

      // Create a fresh component instance (and store it in the cache)
      var modInstance = cachedUnits[unitId] = {
        output: {},
        identifier: unitId,
        isReady: false
      };

      // Run the component's internal function
      componentUnits[unitId].call(modInstance.output, modInstance, modInstance.output, __load_unit__);

      // Mark the component as initialized
      modInstance.isReady = true;

      // Return the component's exposed items
      return modInstance.output;
    }

    // Expose the raw components object to the loader
    __load_unit__.components = componentUnits;

    // Expose the component cache to the loader
    __load_unit__.cache = cachedUnits;

    // Set the base path for module loading (if any)
    __load_unit__.basePath = "";

    // Load the initial entry component and return its outputs
    return __load_unit__(0);
  })
  /************************************************************************/
  ([
    /* 0 */
    /***/
    function(currentModule, exposedItems, __load_unit__) {

      var __MOD_DEF_ARR__, __MOD_DEF_RES__; /*
       * error-trace-remapper.js
       * created by J. Smith <dev@example.com> (2024)
       *
       * https://github.com/synthcode/error-trace-remapper
       *
       * Licensed under the New BSD license. See LICENSE or:
       * http://opensource.org/licenses/BSD-3-Clause
       */

      /*global defineFunc */

      // We only bring in the source-map-consumer part, not the full source-map library,
      // as we don't need its map generation capabilities.
      !(__MOD_DEF_ARR__ = [__load_unit__(1)], __MOD_DEF_RES__ = (function(mapDataConsumer) {
        /**
         * Rework entries within a stack trace using available source maps.
         *
         * @param {Array} errorTrace - An array of strings representing the
         *                             browser's stack trace format. Currently,
         *                             only Chrome's format is fully supported.
         * @param {function} completionCallback - A function invoked with the
         *                                      transformed stack trace (an
         *                                      Array of Strings) as its first
         *                                      argument.
         */
        var remapErrorStack = function(errorTrace, completionCallback) {
          var traceSegments = errorTrace.split("\n");
          var resourceMapCache = {};
          var segmentDetails = {};

          var retriever = new ResourceRetriever(function() {
            var processedOutput = [traceSegments[0]].concat(
              applySourceMappings(traceSegments, segmentDetails, retriever.resourceMapCache)).join("\n");
            completionCallback(processedOutput);
          });

          // Skip the initial line which typically contains the exception message
          for (var idx = 1; idx < traceSegments.length; idx++) {
            var matchInfo = traceSegments[idx].match(/^ +at.+\((.*):([0-9]+):([0-9]+)/);
            if (matchInfo && matchInfo.length === 4) { // Ensure matchInfo is not null and has expected parts
              segmentDetails[idx] = matchInfo;
              var resourcePath = matchInfo[1],
                lineNumber = parseInt(matchInfo[2], 10),
                columnNumber = parseInt(matchInfo[3], 10);
              retriever.loadResource(resourcePath);
            }
          }
        };

        var ResourceRetriever = function(completionCallback) {
          this.pendingRequests = 0;
          this.resourceMapCache = {};
          this.completionCallback = completionCallback;
        };

        ResourceRetriever.prototype.loadResource = function(resourcePath) {
          if (!(resourcePath in this.resourceMapCache)) {
            this.pendingRequests++;
            this.resourceMapCache[resourcePath] = null;
          } else {
            return; // Resource already being fetched or cached
          }

          var dataFetcher = obtainHttpRequest();
          var selfRef = this;
          dataFetcher.onreadystatechange = function(httpEvent) {
            selfRef.handleScriptResponse.call(selfRef, httpEvent, resourcePath);
          };
          dataFetcher.open("GET", resourcePath, true);
          dataFetcher.send();
        };

        var fullUrlRegex = new RegExp('^(?:[a-z]+:)?//', 'i');

        ResourceRetriever.prototype.handleScriptResponse = function(httpEvent, resourcePath) {
          if (httpEvent.target.readyState !== 4) {
            return;
          }

          if (httpEvent.target.status === 200 ||
            (resourcePath.slice(0, 7) === "file://" && httpEvent.target.status === 0)) {
            // Check for source map URL comment in the file content
            var mapCommentMatch = httpEvent.target.responseText.match("//# sourceMappingURL=(.*)");
            if (mapCommentMatch && mapCommentMatch.length === 2) {
              // Extract the source map's URI
              var mapLocation = mapCommentMatch[1];

              if (!fullUrlRegex.test(mapLocation)) {
                // If it's a relative URL, resolve it against the script's origin
                var sourceOrigin;
                var finalSlashPos = resourcePath.lastIndexOf('/');
                if (finalSlashPos !== -1) {
                  sourceOrigin = resourcePath.slice(0, finalSlashPos + 1);
                  mapLocation = sourceOrigin + mapLocation;
                  // If no slash, the script URI is flat, so relative resolution fails.
                  // We'd have to treat it as absolute then.
                }
              }

              var mapLoader = obtainHttpRequest();
              var selfRef = this;
              mapLoader.onreadystatechange = function() {
                if (mapLoader.readyState === 4) {
                  selfRef.pendingRequests--;
                  if (mapLoader.status === 200 ||
                    (mapLocation.slice(0, 7) === "file://" && mapLoader.status === 0)) {
                    selfRef.resourceMapCache[resourcePath] = mapLoader.responseText;
                  }
                  if (selfRef.pendingRequests === 0) {
                    selfRef.completionCallback(selfRef.resourceMapCache);
                  }
                }
              };

              mapLoader.open("GET", mapLocation, true);
              mapLoader.send();
            } else {
              // No source map URL found for this script
              this.pendingRequests--;
            }
          } else {
            // An HTTP error occurred during the script's URI fetch
            this.pendingRequests--;
          }

          if (this.pendingRequests === 0) {
            this.completionCallback(this.resourceMapCache);
          }
        };

        var applySourceMappings = function(traceSegments, segmentDetails, resourceMapCache) {
          var processedResult = [];
          var currentMap;
          for (var idx = 1; idx < traceSegments.length; idx++) {
            var segmentRow = segmentDetails[idx];
            if (segmentRow) {
              var resourcePath = segmentRow[1];
              currentMap = resourceMapCache[resourcePath];
            }

            if (currentMap) {
              // Utilize the source-map library's consumer
              var mapProcessor = new mapDataConsumer.MappingDataAnalyzer(currentMap);
              var originalLocation = mapProcessor.originalPositionFor(
                {
                  line: parseInt(segmentRow[2], 10),
                  column: parseInt(segmentRow[3], 10)
                });
              processedResult.push(createFormattedPosition(originalLocation.source,
                originalLocation.line, originalLocation.column, originalLocation.name));
            } else {
              // Include the original line, reformatted for consistency
              processedResult.push(traceSegments[idx]);
            }
          }

          return processedResult;
        };

        var createFormattedPosition = function(origSource, origLine, origCol, origName) {
          // Mimic Chrome's stack trace output format
          return "    at " + (origName ? origName : "(unknown)") +
            " (" + origSource + ":" + origLine + ":" + origCol + ")";
        };

        // Standard XMLHttpRequest creation pattern
        var HttpRequestCreators = [
          function() {
            return new XMLHttpRequest();
          },
          function() {
            return new ActiveXObject("Msxml2.XMLHTTP");
          },
          function() {
            return new ActiveXObject("Msxml3.XMLHTTP");
          },
          function() {
            return new ActiveXObject("Microsoft.XMLHTTP");
          }
        ];

        function obtainHttpRequest() {
          var ajaxRequest = false;
          for (var creatorIdx = 0; creatorIdx < HttpRequestCreators.length; creatorIdx++) {
            try {
              ajaxRequest = HttpRequestCreators[creatorIdx]();
            } catch (error) {
              continue;
            }
            break;
          }
          return ajaxRequest;
        }

        return {
          remapErrorStack: remapErrorStack
        };
      }.apply(null, __MOD_DEF_ARR__)), __MOD_DEF_RES__ !== undefined && (currentModule.exports = __MOD_DEF_RES__));


    /***/
    },
    /* 1 */
    /***/
    function(currentModule, exposedItems, __load_unit__) {

      var __MOD_DEF_RES__; /* -*- Mode: js; js-indent-level: 2; -*- */
      /*
       * Copyright 2011 Mozilla Foundation and contributors
       * Licensed under the New BSD license. See LICENSE or:
       * http://opensource.org/licenses/BSD-3-Clause
       */
      if (false) {
        var def = require('amdefine')(currentModule, require);
      }
      !(__MOD_DEF_RES__ = (function(require_func, output_obj, mod_obj) {

        var helperFunctions = __load_unit__(2);
        var dichotomicSearch = __load_unit__(3);
        var DistinctArray = __load_unit__(4).DistinctArray;
        var b64VariableLength = __load_unit__(5);

        /**
         * A MappingDataAnalyzer instance represents a parsed source map
         * which we can query for information about the original file locations
         * by providing a file location in the generated source.
         *
         * The only argument is the raw source map (either as a JSON string, or
         * already parsed into an object). According to the specification, source maps
         * include the following attributes:
         *
         *   - mapSchemaVersion: Indicates the version of the source map specification.
         *   - sourceFiles: An array of URLs pointing to the original source files.
         *   - symbolNames: An array of identifiers that can be referenced by individual mappings.
         *   - sourceBaseUrl: Optional. The URL root from which all sources are relative.
         *   - sourceFileContents: Optional. An array containing the contents of the original source files.
         *   - encodingString: A string of base64 VLQs that contain the actual mappings.
         *   - outputFile: Optional. The generated file name associated with this source map.
         *
         * Here's an example source map, taken from the source map spec[0]:
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
         * [0]: https://docs.google.com/document/d/1U1RGAehQwRypUTovF1KRlpiOFze0b-_2gc6fAH0KY0k/edit?pli=1#
         */
        function MappingDataAnalyzer(inputMapData) {
          var parsedMap = inputMapData;
          if (typeof inputMapData === 'string') {
            parsedMap = JSON.parse(inputMapData.replace(/^\)\]\}'/, ''));
          }

          var specVersion = helperFunctions.getArgument(parsedMap, 'version');
          var sourceFiles = helperFunctions.getArgument(parsedMap, 'sources');
          // Sass 3.3 omits the 'names' array, so we diverge from the spec (which
          // mandates the array) to ensure compatibility.
          var symbolNames = helperFunctions.getArgument(parsedMap, 'names', []);
          var sourceBaseUrl = helperFunctions.getArgument(parsedMap, 'sourceRoot', null);
          var sourceFileContents = helperFunctions.getArgument(parsedMap, 'sourcesContent', null);
          var encodingString = helperFunctions.getArgument(parsedMap, 'mappings');
          var outputFile = helperFunctions.getArgument(parsedMap, 'file', null);

          // Again, Sass deviates from the spec by providing the version as a
          // string rather than a number, so we use loose equality checking here.
          if (specVersion != this._currentSpecVersion) {
            throw new Error('Unsupported version: ' + specVersion);
          }

          // Pass `true` below to permit duplicate names and source entries. While source maps
          // are designed for compression and deduplication, the TypeScript compiler
          // occasionally produces source maps containing duplicates. See Github issue
          // #72 and bugzil.la/889492.
          this._nameRegistry = DistinctArray.fromArray(symbolNames, true);
          this._sourceRegistry = DistinctArray.fromArray(sourceFiles, true);

          this.rootPath = sourceBaseUrl;
          this.fileContents = sourceFileContents;
          this._encodedMappings = encodingString;
          this.outputScript = outputFile;
        }

        /**
         * Create a MappingDataAnalyzer from a SourceMapGenerator.
         *
         * @param SourceMapGenerator sourceProducer
         *        The source map that will be analyzed.
         * @returns MappingDataAnalyzer
         */
        MappingDataAnalyzer.createFromMapGenerator =
          function MappingDataAnalyzer_createFromMapGenerator(sourceProducer) {
            var readerObject = Object.create(MappingDataAnalyzer.prototype);

            readerObject._nameRegistry = DistinctArray.fromArray(sourceProducer._names.toArray(), true);
            readerObject._sourceRegistry = DistinctArray.fromArray(sourceProducer._sources.toArray(), true);
            readerObject.rootPath = sourceProducer._sourceRoot;
            readerObject.fileContents = sourceProducer._populateSourceContents(readerObject._sourceRegistry.toArray(),
              readerObject.rootPath);
            readerObject.outputScript = sourceProducer._file;

            readerObject.__outputTracePoints = sourceProducer._mappings.slice()
              .sort(helperFunctions.compareOutputLocations);
            readerObject.__sourceTracePoints = sourceProducer._mappings.slice()
              .sort(helperFunctions.compareSourceLocations);

            return readerObject;
          };

        /**
         * The version of the source mapping specification that we are consuming.
         */
        MappingDataAnalyzer.prototype._currentSpecVersion = 3;

        /**
         * The list of original sources.
         */
        Object.defineProperty(MappingDataAnalyzer.prototype, 'sources', {
          accessor: function() {
            return this._sourceRegistry.toVector().map(function(sourceItem) {
              return this.rootPath != null ? helperFunctions.combinePaths(this.rootPath, sourceItem) : sourceItem;
            }, this);
          }
        });

        // `__transformedPositions` and `__sourceTracePoints` are arrays that hold the
        // parsed mapping coordinates from the source map's "mappings" attribute. They
        // are instantiated lazily, accessed via the `_outputTracePoints` and
        // `_sourceTracePoints` accessors respectively, and we only parse the mappings
        // and construct these arrays when a source location query occurs. We use
        // this approach because there can be thousands of mappings, and parsing
        // them is computationally intensive, so we only perform it when necessary.
        //
        // Each object in these arrays has the following structure:
        //
        //     {
        //       generatedLine: The line number in the generated code,
        //       generatedColumn: The column number in the generated code,
        //       source: The path to the original source file that produced this
        //               segment of code,
        //       originalLine: The line number in the original source that
        //                     corresponds to this segment of generated code,
        //       originalColumn: The column number in the original source that
        //                       corresponds to this segment of generated code,
        //       name: The name of the original symbol which generated this segment of
        //             code.
        //     }
        //
        // All properties, except for `generatedLine` and `generatedColumn`, can be
        // `null`.
        //
        // `_outputTracePoints` is ordered by the generated positions.
        //
        // `_sourceTracePoints` is ordered by the original positions.

        MappingDataAnalyzer.prototype.__outputTracePoints = null;
        Object.defineProperty(MappingDataAnalyzer.prototype, '_outputTracePoints', {
          accessor: function() {
            if (!this.__outputTracePoints) {
              this.__outputTracePoints = [];
              this.__sourceTracePoints = [];
              this._decodeMappingData(this._encodedMappings, this.rootPath);
            }

            return this.__outputTracePoints;
          }
        });

        MappingDataAnalyzer.prototype.__sourceTracePoints = null;
        Object.defineProperty(MappingDataAnalyzer.prototype, '_sourceTracePoints', {
          accessor: function() {
            if (!this.__sourceTracePoints) {
              this.__outputTracePoints = [];
              this.__sourceTracePoints = [];
              this._decodeMappingData(this._encodedMappings, this.rootPath);
            }

            return this.__sourceTracePoints;
          }
        });

        /**
         * Parse the mapping string into a data structure that allows easy
         * querying (the ordered arrays in the `this.__outputTracePoints` and
         * `this.__sourceTracePoints` properties).
         */
        MappingDataAnalyzer.prototype._decodeMappingData =
          function MappingDataAnalyzer_decodeMappingData(encodedData, rootUri) {
            var outputLineCount = 1;
            var prevOutputColumn = 0;
            var prevSourceLine = 0;
            var prevSourceColumn = 0;
            var prevSourceIndex = 0;
            var prevNameIndex = 0;
            var delimiterPattern = /^[,;]/;
            var remainingString = encodedData;
            var currentMapping;
            var vlqResult;

            while (remainingString.length > 0) {
              if (remainingString.charAt(0) === ';') {
                outputLineCount++;
                remainingString = remainingString.slice(1);
                prevOutputColumn = 0;
              } else if (remainingString.charAt(0) === ',') {
                remainingString = remainingString.slice(1);
              } else {
                currentMapping = {};
                currentMapping.generatedLine = outputLineCount;

                // Generated column.
                vlqResult = b64VariableLength.read(remainingString);
                currentMapping.generatedColumn = prevOutputColumn + vlqResult.decodedValue;
                prevOutputColumn = currentMapping.generatedColumn;
                remainingString = vlqResult.remainder;

                if (remainingString.length > 0 && !delimiterPattern.test(remainingString.charAt(0))) {
                  // Original source.
                  vlqResult = b64VariableLength.read(remainingString);
                  currentMapping.source = this._sourceRegistry.getItem(prevSourceIndex + vlqResult.decodedValue);
                  prevSourceIndex += vlqResult.decodedValue;
                  remainingString = vlqResult.remainder;
                  if (remainingString.length === 0 || delimiterPattern.test(remainingString.charAt(0))) {
                    throw new Error('Found a source reference, but no line and column data');
                  }

                  // Original line.
                  vlqResult = b64VariableLength.read(remainingString);
                  currentMapping.originalLine = prevSourceLine + vlqResult.decodedValue;
                  prevSourceLine = currentMapping.originalLine;
                  // Lines are stored 0-based in VLQ, convert to 1-based
                  currentMapping.originalLine += 1;
                  remainingString = vlqResult.remainder;
                  if (remainingString.length === 0 || delimiterPattern.test(remainingString.charAt(0))) {
                    throw new Error('Found a source and line reference, but no column data');
                  }

                  // Original column.
                  vlqResult = b64VariableLength.read(remainingString);
                  currentMapping.originalColumn = prevSourceColumn + vlqResult.decodedValue;
                  prevSourceColumn = currentMapping.originalColumn;
                  remainingString = vlqResult.remainder;

                  if (remainingString.length > 0 && !delimiterPattern.test(remainingString.charAt(0))) {
                    // Original name.
                    vlqResult = b64VariableLength.read(remainingString);
                    currentMapping.name = this._nameRegistry.getItem(prevNameIndex + vlqResult.decodedValue);
                    prevNameIndex += vlqResult.decodedValue;
                    remainingString = vlqResult.remainder;
                  }