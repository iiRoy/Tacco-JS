(function globalModuleWrapper(globalObj, moduleCreator) {
  // Check for CommonJS environment (Node.js)
  if (typeof exports === 'object' && typeof module === 'object') {
    module.exports = moduleCreator();
  }
  // Check for AMD environment (RequireJS)
  else if (typeof define === 'function' && define.amd) {
    define(moduleCreator);
  }
  // Check for legacy CommonJS (browserify, old Node)
  else if (typeof exports === 'object') {
    const moduleName = "sourceMappedStackTrace"; // Define module name
    exports[moduleName] = moduleCreator();
  }
  // Fallback to global scope
  else {
    const moduleName = "sourceMappedStackTrace"; // Redundant but illustrates a point
    globalObj[moduleName] = moduleCreator();
  }
})(this, function() {
  // Start of Webpack-like bundle logic
  return (function(componentDefinitions) {
    // Internal cache for loaded components
    let loadedComponentCache = {};

    // Custom component loader function
    function loadComponent(componentId) {
      // If component is already in cache, return its exports
      if (loadedComponentCache[componentId]) {
        return loadedComponentCache[componentId].output;
      }

      // Prepare a new component context and store it in cache
      let currentModuleContext = {
        output: {}, // The exports object for this component
        identifier: componentId,
        isInitialized: false
      };
      loadedComponentCache[componentId] = currentModuleContext;

      // Execute the component's factory function
      // It receives: (exports, module, module.exports, __webpack_require__)
      // Here: (currentModuleContext.output, currentModuleContext, currentModuleContext.output, loadComponent)
      componentDefinitions[componentId].call(
        currentModuleContext.output,
        currentModuleContext,
        currentModuleContext.output,
        loadComponent
      );

      // Mark the component as initialized
      currentModuleContext.isInitialized = true;

      // Return the component's exports
      return currentModuleContext.output;
    }

    // Expose component definitions for inspection
    loadComponent.definitions = componentDefinitions;

    // Expose the component cache for debugging
    loadComponent.componentCache = loadedComponentCache;

    // Set a base path for assets (currently empty)
    loadComponent.assetBasePath = "";

    // Load and return the entry component (component ID 0)
    const entryPointResult = loadComponent(0);
    return entryPointResult;
  })
  /************************************************************************/
  ([
    /* 0 */
    /***/ function(currentModuleContext, currentExports, loadComponent) {

      // Define AMD dependencies for the main module
      let amdDependencies, amdResult;
      amdDependencies = [loadComponent(1)];
      amdResult = (function(SourceMapDataParser) {
        /**
         * sourcemapped-stacktrace.js - Remap stack traces using source maps.
         * Created by James Salter (2014) - iteration@gmail.com
         * Project Home: https://github.com/novocaine/sourcemapped-stacktrace
         * Licensed under the New BSD license. Refer to LICENSE for details.
         */

        /**
         * Transforms a raw stack trace string by applying source map information.
         * This function currently supports Chrome-style stack trace formats.
         *
         * @param {string} rawStackTrace - The browser's raw stack trace string.
         * @param {function(string): void} completionHandler - Callback invoked with the remapped stack trace (string).
         */
        const traceMapper = function(rawStackTrace, completionHandler) {
          if (typeof rawStackTrace !== 'string' || !rawStackTrace) {
            console.error("Invalid stack trace provided. Expected a non-empty string.");
            return completionHandler("Error: Invalid stack trace input.");
          }

          const traceLines = rawStackTrace.split("\n");
          const resourceMapCache = {}; // Cache for source maps, keyed by URI
          const parsedEntries = {}; // Parsed stack trace line details

          // Initialize the resource loader with a callback for when all resources are fetched.
          const resourceLoader = new ResourceLoader(function() {
            // After all source maps are loaded, process and combine the results.
            const initialMessage = traceLines[0]; // The first line is usually the error message
            const transformedEntries = transformStackEntries(traceLines.slice(1), parsedEntries, resourceLoader.resourceMapCache);
            const finalStackTrace = [initialMessage].concat(transformedEntries).join("\n");
            completionHandler(finalStackTrace);
          });

          // Iterate through stack trace lines, skipping the initial error message.
          for (let i = 1; i < traceLines.length; i++) {
            // Regex to extract URI, line, and column from a Chrome-style stack frame.
            // Example: "    at Function.method (http://example.com/script.js:10:20)"
            const frameDetails = traceLines[i].match(/^ +at.+\((.*):([0-9]+):([0-9]+)\)/);

            if (frameDetails && frameDetails.length === 4) {
              parsedEntries[i] = frameDetails; // Store the raw parsed fields
              const entryUri = frameDetails[1];
              const entryLine = parseFloat(frameDetails[2]); // Using parseFloat as a minor change
              const entryColumn = parseFloat(frameDetails[3]);

              // Request the script and its associated source map (if any)
              resourceLoader.fetchResource(entryUri);
            } else {
              // If a line doesn't match the expected format, we still need to include it.
              // We could store it here for later, but for now, it's just skipped from mapping.
            }
          }
        };

        /**
         * Manages the asynchronous loading of script files and their associated source maps.
         * Uses a semaphore to track pending requests and calls a callback when all are complete.
         * @param {function(): void} allLoadedCallback - Function to call once all resources are fetched.
         */
        const ResourceLoader = function(allLoadedCallback) {
          this.pendingRequests = 0; // Semaphore to count active HTTP requests
          this.resourceMapCache = {}; // Cache for fetched script content or source map data
          this.allLoadedCallback = allLoadedCallback;
        };

        /**
         * Initiates fetching of a script resource.
         * @param {string} resourcePath - The URI of the script to fetch.
         */
        ResourceLoader.prototype.fetchResource = function(resourcePath) {
          // If URI is already being fetched or is in cache, skip.
          if (this.resourceMapCache.hasOwnProperty(resourcePath) && this.resourceMapCache[resourcePath] !== null) {
            return;
          }

          if (!(resourcePath in this.resourceMapCache)) {
            this.pendingRequests++;
            this.resourceMapCache[resourcePath] = null; // Mark as pending
          }

          const httpRequest = createHttpRequestObject();
          const self = this; // Capture 'this' for the event handler

          httpRequest.onreadystatechange = function(event) {
            self.handleResourceLoaded(event, resourcePath, httpRequest);
          };

          try {
            httpRequest.open("GET", resourcePath, true);
            httpRequest.send();
          } catch (error) {
            console.error(`Failed to initiate request for ${resourcePath}:`, error);
            this.pendingRequests--; // Decrement on failure to start request
            if (this.pendingRequests === 0) {
              this.allLoadedCallback(this.resourceMapCache);
            }
          }
        };

        // Regular expression to test for absolute URLs
        const absoluteUrlPattern = new RegExp('^(?:[a-z]+:)?//', 'i');

        /**
         * Handles the completion of an HTTP request for a script or source map.
         * @param {Event} eventData - The event object from XMLHttpRequest.
         * @param {string} currentResourceUri - The URI of the resource being loaded.
         * @param {XMLHttpRequest} completedRequest - The XMLHttpRequest object.
         */
        ResourceLoader.prototype.handleResourceLoaded = function(eventData, currentResourceUri, completedRequest) {
          const targetRequest = eventData.target || completedRequest; // Ensure we get the XHR object

          // Only process when request is complete
          if (targetRequest.readyState !== 4) {
            return;
          }

          const isLocalFileProtocol = currentResourceUri.startsWith("file://");
          const isSuccess = (targetRequest.status === 200 || (isLocalFileProtocol && targetRequest.status === 0));

          if (isSuccess) {
            // Attempt to find a sourceMappingURL comment in the script content
            const mapLinkMatch = targetRequest.responseText.match("//# sourceMappingURL=(.*)");
            if (mapLinkMatch && mapLinkMatch.length > 1) {
              let sourceMapUrl = mapLinkMatch[1];

              // Resolve relative source map URLs
              if (!absoluteUrlPattern.test(sourceMapUrl)) {
                const lastSlashIndex = currentResourceUri.lastIndexOf('/');
                if (lastSlashIndex !== -1) {
                  const baseUrl = currentResourceUri.substring(0, lastSlashIndex + 1);
                  sourceMapUrl = baseUrl + sourceMapUrl;
                }
                // If lastSlashIndex is -1, the script URI has no path, so mapUri is treated as absolute
              }

              const mapRequest = createHttpRequestObject();
              const self = this;

              mapRequest.onreadystatechange = function() {
                if (mapRequest.readyState === 4) {
                  self.pendingRequests--;
                  const isMapSuccess = (mapRequest.status === 200 || (sourceMapUrl.includes("file://") && mapRequest.status === 0));
                  if (isMapSuccess) {
                    self.resourceMapCache[currentResourceUri] = mapRequest.responseText;
                  } else {
                    console.warn(`Failed to fetch source map for ${currentResourceUri} from ${sourceMapUrl}. Status: ${mapRequest.status}`);
                  }
                  if (self.pendingRequests === 0) {
                    self.allLoadedCallback(self.resourceMapCache);
                  }
                }
              };

              mapRequest.open("GET", sourceMapUrl, true);
              mapRequest.send();
            } else {
              // No source map found for this script
              this.pendingRequests--;
            }
          } else {
            // HTTP error fetching the script itself
            console.warn(`Failed to fetch script: ${currentResourceUri}. Status: ${targetRequest.status}`);
            this.pendingRequests--;
          }

          // Check if all requests are done after processing a script (or failed to find map)
          if (this.pendingRequests === 0) {
            this.allLoadedCallback(this.resourceMapCache);
          }
        };

        /**
         * Processes each stack trace entry using loaded source maps to find original positions.
         * @param {Array<string>} traceLines - The array of stack trace lines (excluding the first error message).
         * @param {Object} parsedEntries - Object containing parsed details for each line.
         * @param {Object} resourceMapCache - Cache of loaded source map data.
         * @returns {Array<string>} An array of transformed stack trace lines.
         */
        const transformStackEntries = function(traceLines, parsedEntries, resourceMapCache) {
          const remappedLines = [];
          for (let i = 0; i < traceLines.length; i++) {
            const originalLineIndex = i + 1; // Adjust for the skipped first line
            const entryDetails = parsedEntries[originalLineIndex];

            if (entryDetails) {
              const entryUri = entryDetails[1];
              const currentMapData = resourceMapCache[entryUri];

              if (currentMapData) {
                // Create a SourceMapConsumer instance from the source map data.
                const consumerInstance = new SourceMapDataParser.SourceMapConsumer(currentMapData);
                const originalLocation = consumerInstance.originalPositionFor({
                  line: parseFloat(entryDetails[2]),
                  column: parseFloat(entryDetails[3])
                });

                // If original position is found, format it.
                if (originalLocation && originalLocation.source) {
                  remappedLines.push(formatMappedLocation(originalLocation.source,
                    originalLocation.line, originalLocation.column, originalLocation.name));
                  continue; // Move to the next line after successful mapping
                }
              }
            }
            // If no map or original position found, keep the original line.
            // This also reformats it for consistency, though it doesn't change content.
            remappedLines.push(traceLines[i]);
          }
          return remappedLines;
        };

        /**
         * Formats the original source position into a Chrome-like stack trace entry.
         * @param {string} sourceFile - The path to the original source file.
         * @param {number} lineNumber - The line number in the original source.
         * @param {number} columnNumber - The column number in the original source.
         * @param {string|null} symbolName - The name of the symbol at the original position, if available.
         * @returns {string} The formatted stack trace entry.
         */
        const formatMappedLocation = function(sourceFile, lineNumber, columnNumber, symbolName) {
          const effectiveSymbolName = symbolName || "(anonymous)"; // Use (anonymous) if no name
          return `    at ${effectiveSymbolName} (${sourceFile}:${lineNumber}:${columnNumber})`;
        };

        // Array of functions that can create an XMLHttpRequest object, for cross-browser compatibility.
        const httpObjectProviders = [
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

        /**
         * Creates and returns an appropriate XMLHttpRequest object for the current environment.
         * @returns {XMLHttpRequest|null} An XMLHttpRequest object, or null if none can be created.
         */
        function createHttpRequestObject() {
          let requestInstance = null;
          for (let i = 0; i < httpObjectProviders.length; i++) {
            try {
              requestInstance = httpObjectProviders[i]();
              if (requestInstance) {
                return requestInstance; // Successfully created an instance
              }
            } catch (e) {
              // Continue to the next provider if current one fails
              console.log(`HTTP object provider failed: ${e.message}`);
            }
          }
          console.error("Could not create an XMLHttpRequest object in this environment.");
          return null; // No suitable provider found
        }

        // The public API for this module
        return {
          mapStackTrace: traceMapper
        };
      }.apply(null, amdDependencies)); // Apply AMD dependencies
      if (amdResult !== undefined) {
        currentModuleContext.output = amdResult; // Assign result to module exports
      }

      /***/
    },
    /* 1 */
    /***/ function(currentModuleContext, currentExports, loadComponent) {

      let amdResult;
      // Conditional AMD definition for environments like amdefine (Node.js)
      if (false) {
        let define = require('amdefine')(module, require);
      }
      amdResult = (function(require, exports, module) {

        const utility = loadComponent(2);
        const binarySearchAlgorithm = loadComponent(3);
        const UniqueArraySet = loadComponent(4).ArraySet; // Renamed to UniqueArraySet conceptually
        const vlqDecoder = loadComponent(5);

        /**
         * A SourceMapDataParser instance processes a parsed source map,
         * enabling queries for original file positions based on generated source locations.
         *
         * The constructor accepts the raw source map, either as a JSON string or an already parsed object.
         * Source map specification attributes include:
         *   - version: The spec version (e.g., 3).
         *   - sources: URLs of original source files.
         *   - names: Identifiers referenced by mappings.
         *   - sourceRoot: Optional. Base URL for relative source paths.
         *   - sourcesContent: Optional. Contents of original source files.
         *   - mappings: Base64 VLQ string representing actual mappings.
         *   - file: Optional. The generated file name this map corresponds to.
         */
        function SourceMapDataParser(inputMapData) {
          let parsedMap = inputMapData;
          if (typeof inputMapData === 'string') {
            // Remove the ")]}'" prefix that sometimes appears in JSON responses for security.
            parsedMap = JSON.parse(inputMapData.replace(/^\)\]\}'/, ''));
          }

          // Validate and extract required/optional fields from the source map.
          const mapVersion = utility.retrieveArgument(parsedMap, 'version');
          const sourcePaths = utility.retrieveArgument(parsedMap, 'sources');
          // Sass 3.3 omits the 'names' array, so we provide a default empty array.
          const symbolNames = utility.retrieveArgument(parsedMap, 'names', []);
          const baseSourcePath = utility.retrieveArgument(parsedMap, 'sourceRoot', null);
          const sourceContents = utility.retrieveArgument(parsedMap, 'sourcesContent', null);
          const encodedMappings = utility.retrieveArgument(parsedMap, 'mappings');
          const outputFile = utility.retrieveArgument(parsedMap, 'file', null);

          // Ensure the source map version is supported.
          if (mapVersion != this.expectedVersion) { // Loose equality for version string vs number
            throw new Error(`Unsupported source map version: ${mapVersion}. Expected ${this.expectedVersion}.`);
          }

          // Create sets for unique names and sources, allowing duplicates if present (e.g., TypeScript compiler).
          this.symbolNames = UniqueArraySet.createFrom(symbolNames, true);
          this.sourceFiles = UniqueArraySet.createFrom(sourcePaths, true);

          this.baseSourcePath = baseSourcePath;
          this.sourceContents = sourceContents;
          this.encodedMappings = encodedMappings;
          this.outputFile = outputFile;
        }

        /**
         * Creates a SourceMapDataParser instance from an existing SourceMapGenerator object.
         * This is useful for testing or chaining map operations.
         * @param {object} generatorMap - An object representing a SourceMapGenerator's internal state.
         * @returns {SourceMapDataParser} A new SourceMapDataParser instance.
         */
        SourceMapDataParser.fromSourceMapGenerator =
          function SourceMapDataParser_fromSourceMapGenerator(generatorMap) {
            const parserInstance = Object.create(SourceMapDataParser.prototype);

            parserInstance.symbolNames = UniqueArraySet.createFrom(generatorMap._names.toArray(), true);
            parserInstance.sourceFiles = UniqueArraySet.createFrom(generatorMap._sources.toArray(), true);
            parserInstance.baseSourcePath = generatorMap._sourceRoot;
            parserInstance.sourceContents = generatorMap._generateSourcesContent(parserInstance.sourceFiles.toArray(),
              parserInstance.baseSourcePath);
            parserInstance.outputFile = generatorMap._file;

            // Sort mappings by generated and original positions for efficient lookups.
            parserInstance.parsedGeneratedMapEntries = generatorMap._mappings.slice()
              .sort(utility.compareByGeneratedPositions);
            parserInstance.parsedOriginalMapEntries = generatorMap._mappings.slice()
              .sort(utility.compareByOriginalPositions);

            return parserInstance;
          };

        /**
         * The expected version of the source mapping specification.
         */
        SourceMapDataParser.prototype.expectedVersion = 3;

        /**
         * Getter for the list of original source files, resolving them relative to sourceRoot.
         */
        Object.defineProperty(SourceMapDataParser.prototype, 'sources', {
          get: function() {
            return this.sourceFiles.toArray().map(function(s) {
              return this.baseSourcePath != null ? utility.join(this.baseSourcePath, s) : s;
            }, this);
          }
        });

        // `parsedGeneratedMapEntries` and `parsedOriginalMapEntries` store decoded mappings.
        // They are lazily initialized because parsing the VLQ string can be expensive.
        // Each entry object typically includes:
        //   - generatedLine: Line in the generated code.
        //   - generatedColumn: Column in the generated code.
        //   - source: Path to the original source file.
        //   - originalLine: Line in the original source.
        //   - originalColumn: Column in the original source.
        //   - name: Name of the original symbol.
        // All properties except generatedLine/Column can be null.
        // `parsedGeneratedMapEntries` is sorted by generated positions.
        // `parsedOriginalMapEntries` is sorted by original positions.

        SourceMapDataParser.prototype.parsedGeneratedMapEntries = null;
        Object.defineProperty(SourceMapDataParser.prototype, 'generatedMappings', {
          get: function() {
            if (!this.parsedGeneratedMapEntries) {
              this.parsedGeneratedMapEntries = [];
              this.parsedOriginalMapEntries = []; // Initialize both together
              this.decodeMapString(this.encodedMappings, this.baseSourcePath);
            }
            return this.parsedGeneratedMapEntries;
          }
        });

        SourceMapDataParser.prototype.parsedOriginalMapEntries = null;
        Object.defineProperty(SourceMapDataParser.prototype, 'originalMappings', {
          get: function() {
            if (!this.parsedOriginalMapEntries) {
              this.parsedGeneratedMapEntries = [];
              this.parsedOriginalMapEntries = []; // Initialize both together
              this.decodeMapString(this.encodedMappings, this.baseSourcePath);
            }
            return this.parsedOriginalMapEntries;
          }
        });

        /**
         * Decodes the VLQ mapping string into structured data and populates
         * `parsedGeneratedMapEntries` and `parsedOriginalMapEntries`.
         * @param {string} mappingString - The base64 VLQ mapping string.
         * @param {string|null} currentSourceRoot - The source root for resolving paths.
         */
        SourceMapDataParser.prototype.decodeMapString =
          function SourceMapDataParser_decodeMapString(mappingString, currentSourceRoot) {
            let genLineNum = 1;
            let prevGenCol = 0;
            let prevOrigLine = 0;
            let prevOrigCol = 0;
            let prevSourceIdx = 0;
            let prevNameIdx = 0;
            const mappingTokenDelimiter = /^[,;]/;
            let remainingString = mappingString;
            let decodedSegment;
            let currentMapping;

            if (!mappingString) {
              return; // Nothing to decode
            }

            while (remainingString.length > 0) {
              const firstChar = remainingString.charAt(0);
              if (firstChar === ';') {
                genLineNum++;
                remainingString = remainingString.slice(1);
                prevGenCol = 0; // Reset column for new line
              } else if (firstChar === ',') {
                remainingString = remainingString.slice(1);
              } else {
                currentMapping = {};
                currentMapping.generatedLine = genLineNum;

                // Decode generated column.
                decodedSegment = vlqDecoder.decodeValue(remainingString);
                currentMapping.generatedColumn = prevGenCol + decodedSegment.value;
                prevGenCol = currentMapping.generatedColumn;
                remainingString = decodedSegment.remaining;

                // Check for optional fields: source, original line/column, name.
                if (remainingString.length > 0 && !mappingTokenDelimiter.test(remainingString.charAt(0))) {
                  // Original source index.
                  decodedSegment = vlqDecoder.decodeValue(remainingString);
                  currentMapping.source = this.sourceFiles.at(prevSourceIdx + decodedSegment.value);
                  prevSourceIdx += decodedSegment.value;
                  remainingString = decodedSegment.remaining;

                  if (remainingString.length === 0 || mappingTokenDelimiter.test(remainingString.charAt(0))) {
                    throw new Error('Mapping error: Found source, but missing line and column.');
                  }

                  // Original line number (0-based in VLQ, convert to 1-based).
                  decodedSegment = vlqDecoder.decodeValue(remainingString);
                  currentMapping.originalLine = prevOrigLine + decodedSegment.value;
                  prevOrigLine = currentMapping.originalLine;
                  currentMapping.originalLine += 1; // Convert to 1-based indexing
                  remainingString = decodedSegment.remaining;

                  if (remainingString.length === 0 || mappingTokenDelimiter.test(remainingString.charAt(0))) {
                    throw new Error('Mapping error: Found source and line, but missing column.');
                  }

                  // Original column number.
                  decodedSegment = vlqDecoder.decodeValue(remainingString);
                  currentMapping.originalColumn = prevOrigCol + decodedSegment.value;
                  prevOrigCol = currentMapping.originalColumn;
                  remainingString = decodedSegment.remaining;

                  // Optional original name index.
                  if (remainingString.length > 0 && !mappingTokenDelimiter.test(remainingString.charAt(0))) {
                    decodedSegment = vlqDecoder.decodeValue(remainingString);
                    currentMapping.name = this.symbolNames.at(prevNameIdx + decodedSegment.value);
                    prevNameIdx += decodedSegment.value;
                    remainingString = decodedSegment.remaining;
                  }
                }

                // Store the mapping in both sorted arrays.
                this.parsedGeneratedMapEntries.push(currentMapping);
                if (currentMapping.originalLine != null) { // Only add to original mappings if original position exists
                  this.parsedOriginalMapEntries.push(currentMapping);
                }
              }
            }

            // Sort the generated mappings by generated position and original mappings by original position.
            this.parsedGeneratedMapEntries.sort(utility.compareByGeneratedPositions);
            this.parsedOriginalMapEntries.sort(utility.compareByOriginalPositions);
          };

        // This is a minimal implementation for SourceMapConsumer.
        // It provides the core `originalPositionFor` method.
        SourceMapDataParser.prototype.originalPositionFor = function(location) {
          const {
            line,
            column
          } = location;
          if (line == null || column == null) {
            throw new Error("Cannot get original position without line and column.");
          }

          // Ensure mappings are parsed
          this.generatedMappings;

          const searchResult = binarySearchAlgorithm.search(
            this.parsedGeneratedMapEntries, {
              generatedLine: line,
              generatedColumn: column
            },
            utility.compareByGeneratedPositions,
            binarySearchAlgorithm.LEAST_UPPER_BOUND
          );

          if (searchResult < 0) {
            return {
              source: null,
              line: null,
              column: null,
              name: null
            };
          }

          const mapping = this.parsedGeneratedMapEntries[searchResult];
          if (mapping.generatedLine === line && mapping.generatedColumn <= column) {
            return {
              source: this.baseSourcePath ? utility.join(this.baseSourcePath, mapping.source) : mapping.source,
              line: mapping.originalLine,
              column: mapping.originalColumn,
              name: mapping.name
            };
          } else {
            return {
              source: null,
              line: null,
              column: null,
              name: null
            };
          }
        };


        return {
          SourceMapConsumer: SourceMapDataParser
        };
      }.apply(null, [loadComponent(2), currentExports, currentModuleContext]));
      if (amdResult !== undefined) {
        currentModuleContext.output = amdResult;
      }


      /***/
    },
    /* 2 */
    /***/ function(currentModuleContext, currentExports, loadComponent) {

      let amdResult;
      amdResult = (function(exports) {

        /**
         * A small collection of utility functions used throughout the source-map library.
         */

        /**
         * Returns a parameter from an object, throwing an error if it is not present.
         * @param {object} obj - The object to retrieve the argument from.
         * @param {string} name - The name of the argument.
         * @param {any} [defaultValue] - An optional default value if the argument is not found.
         * @returns {any} The value of the argument.
         * @throws {Error} If the argument is missing and no default value is provided.
         */
        function retrieveArgument(obj, name, defaultValue) {
          if (name in obj) {
            return obj[name];
          }
          if (arguments.length === 3) {
            return defaultValue;
          }
          throw new Error('"' + name + '" is a required argument.');
        }
        exports.retrieveArgument = retrieveArgument;

        const isAbsoluteURL = /^(?:[a-z]+:)?\/\//i;

        /**
         * Joins two paths together, normalizing the result.
         * @param {string} root - The base path.
         * @param {string} url - The path to join.
         * @returns {string} The joined and normalized path.
         */
        function join(root, url) {
          if (!root) {
            return url;
          }
          if (isAbsoluteURL.test(url)) {
            return url;
          }
          const lastChar = root.charAt(root.length - 1);
          if (lastChar !== '/' && lastChar !== '\\') {
            root += '/';
          }
          return root + url;
        }
        exports.join = join;

        /**
         * Compares two mapping entries by their generated positions (line and column).
         * @param {object} mapA - The first mapping entry.
         * @param {object} mapB - The second mapping entry.
         * @returns {number} A negative, zero, or positive value indicating order.
         */
        function compareByGeneratedPositions(mapA, mapB) {
          let cmp = mapA.generatedLine - mapB.generatedLine;
          if (cmp === 0) {
            cmp = mapA.generatedColumn - mapB.generatedColumn;
          }
          return cmp;
        }
        exports.compareByGeneratedPositions = compareByGeneratedPositions;

        /**
         * Compares two mapping entries by their original positions (source, line, and column).
         * @param {object} mapA - The first mapping entry.
         * @param {object} mapB - The second mapping entry.
         * @returns {number} A negative, zero, or positive value indicating order.
         */
        function compareByOriginalPositions(mapA, mapB) {
          let cmp = mapA.source - mapB.source;
          if (cmp === 0) {
            cmp = mapA.originalLine - mapB.originalLine;
            if (cmp === 0) {
              cmp = mapA.originalColumn - mapB.originalColumn;
            }
          }
          return cmp;
        }
        exports.compareByOriginalPositions = compareByOriginalPositions;

      }.apply(null, [currentExports]));
      if (amdResult !== undefined) {
        currentModuleContext.output = amdResult;
      }

      /***/
    },
    /* 3 */
    /***/ function(currentModuleContext, currentExports, loadComponent) {

      let amdResult;
      amdResult = (function(exports) {

        /**
         * A collection of binary search algorithms.
         */

        /**
         * Low-level binary search implementation.
         * @param {Array} aHaystack - The array to search in.
         * @param {any} aNeedle - The value to search for.
         * @param {function(any, any): number} aCompareFunction - A comparison function.
         * @param {number} [aBias] - Bias for result, e.g., LEAST_UPPER_BOUND or GREATEST_LOWER_BOUND.
         * @returns {number} The index of the found element or the insertion point.
         */
        function search(aHaystack, aNeedle, aCompareFunction, aBias) {
          let minIdx = 0;
          let maxIdx = aHaystack.length - 1;
          let currentIdx;

          while (minIdx <= maxIdx) {
            currentIdx = minIdx + Math.floor((maxIdx - minIdx) / 2);
            const comparisonResult = aCompareFunction(aNeedle, aHaystack[currentIdx]);

            if (comparisonResult === 0) {
              return currentIdx;
            } else if (comparisonResult > 0) {
              minIdx = currentIdx + 1;
            } else {
              maxIdx = currentIdx - 1;
            }
          }

          if (aBias === GREATEST_LOWER_BOUND) {
            return minIdx - 1;
          } else { // LEAST_UPPER_BOUND or no bias
            return minIdx;
          }
        }
        exports.search = search;

        /**
         * Bias towards the greatest lower bound (inclusive).
         */
        const GREATEST_LOWER_BOUND = 1;
        exports.GREATEST_LOWER_BOUND = GREATEST_LOWER_BOUND;

        /**
         * Bias towards the least upper bound (exclusive).
         */
        const LEAST_UPPER_BOUND = 2;
        exports.LEAST_UPPER_BOUND = LEAST_UPPER_BOUND;

      }.apply(null, [currentExports]));
      if (amdResult !== undefined) {
        currentModuleContext.output = amdResult;
      }

      /***/
    },
    /* 4 */
    /***/ function(currentModuleContext, currentExports, loadComponent) {

      let amdResult;
      amdResult = (function(exports) {

        /**
         * An ArraySet is like an array that doesn't allow duplicates.
         * It maintains insertion order.
         */
        function ArraySet() {
          this._array = [];
          this._set = {};
        }

        /**
         * Creates an ArraySet from an existing array.
         * @param {Array} aArray - The source array.
         * @param {boolean} aAllowDuplicates - If true, duplicates are added but ignored.
         * @returns {ArraySet} A new ArraySet instance.
         */
        ArraySet.createFrom = function ArraySet_createFrom(aArray, aAllowDuplicates) {
          const set = new ArraySet();
          if (aArray) {
            for (let i = 0; i < aArray.length; i++) {
              set.add(aArray[i], aAllowDuplicates);
            }
          }
          return set;
        };

        /**
         * Adds an item to the set if it doesn't already exist.
         * @param {any} aItem - The item to add.
         * @param {boolean} aAllowDuplicates - If true, allows adding an item even if it exists.
         * @returns {number} The index of the added item.
         */
        ArraySet.prototype.add = function ArraySet_add(aItem, aAllowDuplicates) {
          const idx = this._set[aItem];
          if (idx === undefined || aAllowDuplicates) {
            const newIdx = this._array.push(aItem) - 1;
            if (idx === undefined) { // Only update set if not already present
              this._set[aItem] = newIdx;
            }
            return newIdx;
          }
          return idx;
        };

        /**
         * Returns the item at a specific index.
         * @param {number} aIdx - The index.
         * @returns {any} The item at the index.
         */
        ArraySet.prototype.at = function ArraySet_at(aIdx) {
          if (aIdx < 0 || aIdx >= this._array.length) {
            throw new Error(`Invalid index: ${aIdx}. ArraySet has ${this._array.length} items.`);
          }
          return this._array[aIdx];
        };

        /**
         * Returns the index of an item.
         * @param {any} aItem - The item to find.
         * @returns {number} The index of the item, or -1 if not found.
         */
        ArraySet.prototype.indexOf = function ArraySet_indexOf(aItem) {
          const idx = this._set[aItem];
          if (idx === undefined) {
            return -1;
          }
          return idx;
        };

        /**
         * Returns all items in the set as an array.
         * @returns {Array} An array of all items.
         */
        ArraySet.prototype.toArray = function ArraySet_toArray() {
          return this._array.slice(); // Return a shallow copy
        };

        exports.ArraySet = ArraySet;

      }.apply(null, [currentExports]));
      if (amdResult !== undefined) {
        currentModuleContext.output = amdResult;
      }

      /***/
    },
    /* 5 */
    /***/ function(currentModuleContext, currentExports, loadComponent) {

      let amdResult;
      amdResult = (function(exports) {

        /**
         * Implementation of Base64 VLQ (Variable-length quantity) encoding/decoding.
         * This is used for compact source map mappings.
         */

        const VLQ_BASE_SHIFT = 5; // Number of bits per digit
        const VLQ_BASE = 1 << VLQ_BASE_SHIFT; // 32
        const VLQ_BASE_MASK = VLQ_BASE - 1; // 31
        const VLQ_CONTINUATION_BIT = VLQ_BASE; // 32

        /**
         * Decodes a single VLQ value from a string.
         * @param {string} aStr - The string containing the VLQ sequence.
         * @returns {{value: number, remaining: string}} An object with the decoded value and the rest of the string.
         */
        function decodeValue(aStr) {
          let result = 0;
          let shift = 0;
          let digit;
          let shouldContinue;
          let i = 0;

          do {
            const charCode = aStr.charCodeAt(i++);
            const charValue = base64CharToValue(charCode);

            digit = charValue & VLQ_BASE_MASK;
            result += digit << shift;
            shouldContinue = (charValue & VLQ_CONTINUATION_BIT) !== 0;
            shift += VLQ_BASE_SHIFT;
          } while (shouldContinue);

          // The last bit of the first digit is the sign bit.
          // If it's set, the number is negative.
          const isNegative = (result & 1) === 1;
          result = result >> 1; // Remove the sign bit

          return {
            value: isNegative ? -result : result,
            remaining: aStr.slice(i)
          };
        }
        exports.decodeValue = decodeValue;

        /**
         * Converts a Base64 character code to its integer value.
         * @param {number} aCharCode - The ASCII character code.
         * @returns {number} The integer value.
         * @throws {Error} If an invalid Base64 character is encountered.
         */
        function base64CharToValue(aCharCode) {
          // 'A' through 'Z'
          if (aCharCode >= 65 && aCharCode <= 90) {
            return aCharCode - 65;
          }
          // 'a' through 'z'
          if (aCharCode >= 97 && aCharCode <= 122) {
            return (aCharCode - 97) + 26;
          }
          // '0' through '9'
          if (aCharCode >= 48 && aCharCode <= 57) {
            return (aCharCode - 48) + 52;
          }
          // '+'
          if (aCharCode === 43) {
            return 62;
          }
          // '/'
          if (aCharCode === 47) {
            return 63;
          }
          throw new Error('Invalid Base64 character code.');
        }

      }.apply(null, [currentExports]));
      if (amdResult !== undefined) {
        currentModuleContext.output = amdResult;
      }

      /***/
    }
  ])
});