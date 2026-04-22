(function(globalContext, noValue) {
    // Module version for tracking changes and debugging.
    const MODULE_VERSION = "2.2.0-beta";

    // Internal logging utility to provide contextual messages.
    const _log = (level, message, ...args) => {
        if (typeof console !== 'undefined' && console[level]) {
            console[level](`[GeospatialDataProcessor v${MODULE_VERSION}] ${message}`, ...args);
        }
    };

    // Default configuration options for the geospatial data processor.
    const DEFAULT_PROCESSOR_OPTIONS = {
        workerScriptRoot: "", // Base path for the Web Worker script.
        enableVerboseLogging: false, // Controls detailed debug logging.
        strictDataValidation: false // Enables stricter checks for data integrity.
    };

    // --- Main Thread / Browser Environment Logic ---
    // This block executes if we are in a browser environment with `document` and `Worker` support.
    if (globalContext.document && globalContext.Worker) {
        let globalWorkerReference = null; // A shared Web Worker instance for efficiency.

        /**
         * @class GeospatialDataProcessorFacade
         * @param {string|object} initializationOptions - File path (string) or configuration object.
         * @param {function} [processingCompletionCallback] - Callback for when data processing finishes.
         * @constructor
         * Acts as a facade in the main thread, orchestrating shapefile loading
         * by delegating the heavy parsing to a Web Worker.
         */
        const GeospatialDataProcessorFacade = function(initializationOptions, processingCompletionCallback) {
            const currentFacadeInstance = this; // Reference to the current instance.
            let resolvedConfiguration = (typeof initializationOptions === "string") ? {
                shapefileSource: initializationOptions
            } : initializationOptions;

            // Merge default options with user-provided configuration.
            this.config = { ...DEFAULT_PROCESSOR_OPTIONS,
                ...resolvedConfiguration
            };

            if (this.config.enableVerboseLogging) {
                _log('debug', 'Facade instance initialized with configuration:', this.config);
            }

            // Lazy initialization of the Web Worker. Create if not exists, otherwise reuse.
            if (!globalWorkerReference) {
                const workerScriptPath = this.config.workerScriptRoot + "shapefile.js";
                try {
                    globalWorkerReference = new globalContext.Worker(workerScriptPath);
                    this.workerInstanceHandle = globalWorkerReference; // Expose worker handle on the facade instance.
                    _log('info', `New Web Worker successfully spawned from: ${workerScriptPath}`);
                } catch (error) {
                    _log('error', `Critical error creating Web Worker: ${error.message}`);
                    throw new Error(`Worker initialization failure: ${error.message}`);
                }
            } else {
                if (this.config.enableVerboseLogging) {
                    _log('debug', 'Reusing an already active Web Worker instance.');
                }
            }

            // Assign the worker instance that this facade will communicate with.
            const designatedWorker = globalWorkerReference;

            // Establish the message handler for responses from the worker.
            designatedWorker.onmessage = function(workerMessageEvent) {
                // Store the raw data received from the worker.
                currentFacadeInstance.lastProcessedResult = workerMessageEvent.data;
                // If a completion callback was provided, invoke it.
                if (typeof processingCompletionCallback === 'function') {
                    processingCompletionCallback(workerMessageEvent.data);
                } else if (currentFacadeInstance.config.enableVerboseLogging) {
                    _log('warn', 'No explicit completion callback provided for worker message event.');
                }
            };

            // Send the initial command to the worker to load the shapefile.
            designatedWorker.postMessage(["LoadShapefile", this.config]); // Changed command name for clarity.

            // If an attribute data source (e.g., DBF file) is specified, initiate its loading.
            if (this.config.attributeDataSource) {
                this.dbfAttributeLoader = new DBF(this.config.attributeDataSource, function(dbfContent) {
                    designatedWorker.postMessage(["AttachDbfAttributes", dbfContent]); // Changed command name.
                });
            } else {
                if (this.config.enableVerboseLogging) {
                    _log('debug', 'No DBF attribute source specified in configuration.');
                }
            }
        };

        // Expose the facade class globally.
        globalContext["GeospatialDataProcessor"] = GeospatialDataProcessorFacade;
        return; // Terminate execution, as this is the main thread context.
    }

    // --- Web Worker Context Logic ---
    // This block executes when the code is running inside a Web Worker.
    const isInWorkerContext = !globalContext.document; // Determine if in a worker context.
    if (isInWorkerContext) {
        importScripts('stream.js'); // Import necessary binary stream parsing library.
        _log('info', 'GeospatialDataProcessor operating within a Web Worker environment.');

        // Variable to hold the active shapefile processor instance within this worker.
        let workerProcessorInstance = null;

        // A map of command strings to their respective handler functions for incoming worker messages.
        const workerCommandHandlers = {
            "LoadShapefile": (payload) => { // Handler for loading a shapefile.
                try {
                    workerProcessorInstance = new GeospatialDataProcessor(payload);
                    _log('debug', 'Shapefile processing instance successfully created in worker.');
                } catch (error) {
                    _log('error', `Failed to initialize shapefile processor in worker: ${error.message}`);
                    globalContext.postMessage({
                        status: "error",
                        message: `Worker Error: ${error.message}`
                    }); // Report error back to the main thread.
                }
            },
            "AttachDbfAttributes": (attributesData) => { // Handler for attaching DBF attributes.
                if (workerProcessorInstance && workerProcessorInstance.finalGeoJSONResult) {
                    workerProcessorInstance.applyDbfAttributesToGeoJSON(attributesData); // Renamed method.
                    workerProcessorInstance.dispatchResultToInitiator(); // Renamed method.
                    _log('debug', 'DBF attributes applied and final result dispatched from worker.');
                } else {
                    _log('warn', 'DBF attributes received, but GeoJSON is not yet ready. Storing for later application.');
                    // Store the attributes if GeoJSON hasn't been generated yet.
                    workerProcessorInstance.pendingDbfAttributes = attributesData;
                }
            },
            "ResetWorkerState": () => { // New command to reset the worker's internal state.
                if (workerProcessorInstance) {
                    workerProcessorInstance._resetInternalState(); // Renamed method.
                    workerProcessorInstance = null;
                    _log('info', 'Worker processor internal state has been reset.');
                    globalContext.postMessage({
                        status: "worker_reset_complete"
                    });
                } else {
                    _log('warn', 'Reset command received, but no active processor instance to reset.');
                }
            }
        };

        // The primary message handler for the Web Worker.
        globalContext.onmessage = function(messageEvent) {
            const [commandType, commandPayload] = messageEvent.data; // Destructure the incoming message.
            if (DEFAULT_PROCESSOR_OPTIONS.enableVerboseLogging) {
                _log('debug', `Worker received command: '${commandType}'`);
            }

            // Invoke the appropriate command handler if it exists.
            if (workerCommandHandlers[commandType]) {
                workerCommandHandlers[commandType](commandPayload);
            } else {
                _log('warn', `Received an unrecognized worker command: '${commandType}'`);
                globalContext.postMessage({
                    status: "error",
                    message: `Unknown command received by worker: ${commandType}`
                });
            }
        };
    }

    /**
     * @constant {object} GeometryTypeMap
     * Maps ESRI Shapefile type codes to their corresponding descriptive string names.
     */
    const GeometryTypeMap = {
        0: "NullShape",
        1: "Point",
        3: "PolyLine",
        5: "Polygon",
        8: "MultiPoint",
        11: "PointZ",
        13: "PolyLineZ",
        15: "PolygonZ",
        18: "MultiPointZ",
        21: "PointM",
        23: "PolyLineM",
        25: "PolygonM",
        28: "MultiPointM",
        31: "MultiPatch"
    };

    /**
     * Generates a simple UUID (UUID v4 style) for unique feature identification.
     * @returns {string} A new unique identifier string.
     */
    const generateFeatureUuid = () => { // Renamed helper function.
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(char) {
            const randomValue = Math.random() * 16 | 0;
            const finalValue = char === 'x' ? randomValue : (randomValue & 0x3 | 0x8);
            return finalValue.toString(16);
        });
    };

    /**
     * @class GeospatialDataProcessor
     * @param {object} processorConfiguration - Configuration object for the shapefile processing.
     * @param {function} [onProcessingComplete] - Optional callback for when parsing is complete.
     * @constructor
     * The core logic for parsing and transforming shapefile binary data.
     * This class is primarily intended to run within a Web Worker.
     */
    const GeospatialDataProcessor = function(processorConfiguration, onProcessingComplete) {
        // Merge default options and normalize configuration.
        this.config = { ...DEFAULT_PROCESSOR_OPTIONS,
            ...(typeof processorConfiguration === "string" ? {
                shapefileSource: processorConfiguration
            } : processorConfiguration)
        };

        if (this.config.enableVerboseLogging) {
            _log('debug', 'Worker-side GeospatialDataProcessor core initialized with config:', this.config);
        }

        this.completionHandler = onProcessingComplete; // Store the completion callback.

        // Initialize all internal state variables.
        this.sourceIdentifier = null; // URI or file name of the source.
        this.binaryInputStream = null; // The Gordon.Stream instance.
        this.fileHeaderData = null; // Parsed shapefile header.
        this.shapeRecordsArray = []; // Collection of parsed shape records.
        this.finalGeoJSONResult = null; // The generated GeoJSON FeatureCollection.
        this.dbfAttributeData = null; // Parsed DBF attribute data.
        this.pendingDbfAttributes = null; // Holds DBF data if GeoJSON isn't ready.

        // Critical validation: ensure a shapefile source is provided.
        if (!this.config.shapefileSource) {
            throw new Error("Initialization Error: A 'shapefileSource' is a mandatory configuration option.");
        }

        // Determine the appropriate method to handle the shapefile source.
        if (this.config.shapefileSource.lastModifiedDate) { // Check for File API object properties.
            this.processLocalShapefile(this.config); // Renamed method.
        } else {
            this.fetchRemoteShapefile(this.config); // Renamed method.
        }
    };

    // Prototype methods for GeospatialDataProcessor.
    GeospatialDataProcessor.prototype = {
        constructor: GeospatialDataProcessor, // Explicitly define constructor for prototype chain.

        /**
         * Resets all internal state variables of the processor instance.
         * @private
         */
        _resetInternalState: function() { // Renamed method.
            this.sourceIdentifier = null;
            this.binaryInputStream = null;
            this.fileHeaderData = null;
            this.shapeRecordsArray = [];
            this.finalGeoJSONResult = null;
            this.dbfAttributeData = null;
            this.pendingDbfAttributes = null;
            _log('debug', 'GeospatialDataProcessor internal state has been cleared.');
        },

        /**
         * Fetches shapefile data from a remote URI using a synchronous XMLHttpRequest.
         * @param {object} currentConfig - Configuration object containing the URI.
         * @private
         */
        fetchRemoteShapefile: function(currentConfig) { // Renamed method.
            const httpClient = new XMLHttpRequest(); // Renamed variable.
            const selfRef = this; // Capture 'this' for callbacks.

            try {
                // Perform a synchronous GET request as per original design.
                httpClient.open("GET", currentConfig.shapefileSource, false);
                httpClient.overrideMimeType("text/plain; charset=x-user-defined");
                httpClient.send();

                // Validate the HTTP response status.
                if (httpClient.status !== 200) {
                    throw new Error(`HTTP Fetch Error: Status ${httpClient.status} encountered for ${currentConfig.shapefileSource}`);
                }

                this.sourceIdentifier = currentConfig.shapefileSource;
                this.binaryInputStream = new Gordon.Stream(httpClient.responseText); // Initialize binary stream.

                this._decodeFileHeader(); // Renamed method.
                this._extractShapeRecords(); // Renamed method.
                this._generateGeoJSONOutput(); // Renamed method.

                // If DBF attributes are expected, handle the worker context's deferral.
                if (currentConfig.attributeDataSource) {
                    if (isInWorkerContext) {
                        _log('debug', 'DBF attribute source specified. Worker will await attributes via message.');
                    } else {
                        // This path should ideally not be taken if the worker is active.
                        this.dbfAttributeLoader = new DBF(currentConfig.attributeDataSource, function(attributesPayload) {
                            selfRef.applyDbfAttributesToGeoJSON(attributesPayload);
                            selfRef.dispatchResultToInitiator();
                        });
                    }
                } else {
                    this.dispatchResultToInitiator(); // Dispatch result if no DBF is expected.
                }
            } catch (error) {
                _log('error', `Failed to fetch or process remote shapefile: ${error.message}`);
                throw error; // Re-throw for upstream error handling.
            }
        },

        /**
         * Processes a local File object (e.g., from a file input element).
         * @param {object} currentConfig - Configuration object containing the File object.
         * @private
         */
        processLocalShapefile: function(currentConfig) { // Renamed method.
            this.sourceIdentifier = currentConfig.shapefileSource.name || "local_file_input";
            let fileReaderUtility;

            // Prioritize FileReaderSync in worker context for synchronous file reading.
            if (isInWorkerContext && globalContext.FileReaderSync) {
                fileReaderUtility = new globalContext.FileReaderSync();
                try {
                    const fileContentBinary = fileReaderUtility.readAsBinaryString(currentConfig.shapefileSource);
                    this.onFileContentLoaded(fileContentBinary); // Renamed method.
                } catch (error) {
                    _log('error', `FileReaderSync failed to read local file: ${error.message}`);
                    throw new Error(`Synchronous file read error: ${error.message}`);
                }
            } else if (globalContext.FileReader) { // Fallback to asynchronous FileReader for main thread or non-sync workers.
                fileReaderUtility = new globalContext.FileReader();
                fileReaderUtility.onload = ((contextRef) => {
                    return (loadEvent) => {
                        contextRef.onFileContentLoaded(loadEvent.target.result);
                    };
                })(this);
                fileReaderUtility.onerror = (errorEvent) => { // Add an explicit error handler for FileReader.
                    _log('error', `FileReader encountered an error during file load: ${errorEvent.target.error.name}`);
                    throw new Error(`File loading error: ${errorEvent.target.error.message}`);
                };
                fileReaderUtility.readAsBinaryString(currentConfig.shapefileSource);
            } else {
                throw new Error("No compatible FileReader API found in the current environment.");
            }
        },

        /**
         * Callback invoked once the binary content of the shapefile is loaded.
         * @param {string} binaryContentString - The binary string content of the shapefile.
         * @private
         */
        onFileContentLoaded: function(binaryContentString) { // Renamed method.
            // Apply strict validation for minimum file length.
            if (this.config.strictDataValidation && (!binaryContentString || binaryContentString.length < 100)) {
                throw new Error("Data Validation Error: File content is empty or too short for a valid shapefile header.");
            }

            this.binaryInputStream = new Gordon.Stream(binaryContentString);

            this._decodeFileHeader();
            this._extractShapeRecords();
            this._generateGeoJSONOutput();

            // If DBF attributes were received while GeoJSON was not ready, apply them now.
            if (this.pendingDbfAttributes) {
                this.applyDbfAttributesToGeoJSON(this.pendingDbfAttributes);
                this.pendingDbfAttributes = noValue; // Clear the pending data after use.
            }

            // Dispatch results only if no DBF source was provided, or if DBF attributes have been handled.
            if (!this.config.attributeDataSource || (this.config.attributeDataSource && !this.pendingDbfAttributes)) {
                this.dispatchResultToInitiator();
            }
        },

        /**
         * Dispatches the final processed data payload to the caller (main thread or callback).
         * @private
         */
        dispatchResultToInitiator: function() { // Renamed method.
            const finalProcessedPayload = {
                processingStatus: "success",
                sourceReference: this.sourceIdentifier,
                headerMetadata: this.fileHeaderData,
                rawShapeRecords: this.shapeRecordsArray,
                dbfAttributePayload: this.dbfAttributeData,
                geoJsonOutput: this.finalGeoJSONResult
            };

            if (isInWorkerContext) {
                globalContext.postMessage(finalProcessedPayload); // Use globalContext for explicit worker postMessage.
            } else if (typeof this.completionHandler === 'function') {
                this.completionHandler(finalProcessedPayload);
            } else {
                _log('warn', 'No designated handler to deliver the final processing result.');
            }
        },

        /**
         * Decodes the main 100-byte shapefile header section from the binary stream.
         * @private
         */
        _decodeFileHeader: function() { // Renamed method.
            const dataStreamReader = this.binaryInputStream; // Renamed variable.
            const headerFields = this.fileHeaderData = {}; // Renamed variable.

            // Ensure sufficient bytes for the header.
            if (dataStreamReader.length < 100) {
                throw new Error("File Header Error: Insufficient bytes for a valid 100-byte header.");
            }

            headerFields.fileSignatureCode = dataStreamReader.readSI32(true); // Renamed variable.

            // Strict validation for the magic file code.
            if (this.config.strictDataValidation && headerFields.fileSignatureCode !== 0x270a) {
                throw new Error(`File Signature Mismatch: Expected 0x270a, found 0x${headerFields.fileSignatureCode.toString(16)}.`);
            }

            // Skip five unused 32-bit integer fields (5 * 4 = 20 bytes).
            dataStreamReader.offset += 5 * 4;

            headerFields.totalFileLengthWords = dataStreamReader.readSI32(true);
            headerFields.totalFileLengthBytes = headerFields.totalFileLengthWords * 2; // Calculate total file length in bytes.

            headerFields.protocolVersion = dataStreamReader.readSI32(); // Renamed variable.

            const rawShapeTypeCode = dataStreamReader.readSI32();
            headerFields.primaryShapeType = GeometryTypeMap[rawShapeTypeCode]; // Renamed variable, used GeometryTypeMap.

            if (this.config.strictDataValidation && !headerFields.primaryShapeType) {
                _log('warn', `Unrecognized primary shape type code in header: ${rawShapeTypeCode}`);
            }

            this._readSpatialBoundingBox(headerFields); // Renamed method.

            headerFields.zCoordinateRange = { // Renamed variable.
                minimum: dataStreamReader.readDouble(),
                maximum: dataStreamReader.readDouble()
            };

            headerFields.mMeasurementRange = { // Renamed variable.
                minimum: dataStreamReader.readDouble(),
                maximum: dataStreamReader.readDouble()
            };

            if (this.config.enableVerboseLogging) {
                _log('debug', 'Shapefile header successfully decoded:', headerFields);
            }
        },

        /**
         * Parses individual shape records from the binary stream until the end of the file.
         * @private
         */
        _extractShapeRecords: function() { // Renamed method.
            const dataStreamReader = this.binaryInputStream;
            const recordsCollection = this.shapeRecordsArray = []; // Renamed variable.

            // Continue reading records as long as there are bytes remaining in the stream.
            while (dataStreamReader.offset < dataStreamReader.length) {
                const currentRecordObject = {}; // Renamed variable.

                // Record Number (1-based sequence).
                currentRecordObject.recordSequenceNumber = dataStreamReader.readSI32(true); // Renamed variable.

                // A record number of 0 can sometimes indicate EOF, but stream length check is more robust.
                if (currentRecordObject.recordSequenceNumber === 0 && recordsCollection.length > 0) {
                    _log('debug', 'Record sequence number 0 encountered; interpreting as end of records.');
                    break;
                }

                // Content Length of the record (in 16-bit words).
                currentRecordObject.contentLengthWords = dataStreamReader.readSI32(true);
                currentRecordObject.contentLengthBytes = currentRecordObject.contentLengthWords * 2;

                const recordStartOffset = dataStreamReader.offset; // Mark the start of the record's data.

                const recordShapeTypeRaw = dataStreamReader.readSI32();
                currentRecordObject.shapeType = GeometryTypeMap[recordShapeTypeRaw]; // Renamed variable, used GeometryTypeMap.

                // Handle unrecognized shape types.
                if (this.config.strictDataValidation && !currentRecordObject.shapeType) {
                    _log('warn', `Unrecognized record shape type code: ${recordShapeTypeRaw} at stream offset ${recordStartOffset}. Skipping record data.`);
                    dataStreamReader.offset = recordStartOffset + currentRecordObject.contentLengthBytes; // Skip to next record.
                    continue;
                }

                // Dynamically invoke the appropriate method to parse specific shape data.
                const recordParsingMethod = `_read${currentRecordObject.shapeType.replace(/\s/g, '')}`; // Construct method name.
                if (typeof this[recordParsingMethod] === 'function') {
                    this[recordParsingMethod](currentRecordObject);
                } else {
                    _log('warn', `No specific parsing method for shape type: ${currentRecordObject.shapeType}. Skipping detailed record data.`);
                    dataStreamReader.offset = recordStartOffset + currentRecordObject.contentLengthBytes; // Advance stream.
                }

                // Validate that the record parser consumed the expected number of bytes.
                if (this.config.strictDataValidation && (dataStreamReader.offset - recordStartOffset) !== currentRecordObject.contentLengthBytes) {
                    _log('warn', `Record ${currentRecordObject.recordSequenceNumber} parser consumed ${dataStreamReader.offset - recordStartOffset} bytes, but declared length was ${currentRecordObject.contentLengthBytes}. Stream offset might be misaligned, attempting to correct.`);
                    dataStreamReader.offset = recordStartOffset + currentRecordObject.contentLengthBytes; // Realign stream.
                }

                recordsCollection.push(currentRecordObject);
            }
            if (this.config.enableVerboseLogging) {
                _log('debug', `Successfully extracted ${recordsCollection.length} shape records.`);
            }
        },

        /**
         * Extracts bounding box coordinates from the stream and assigns them to a target object.
         * @param {object} targetDataContainer - The object to populate with bounding box information.
         * @returns {object} The updated target object.
         * @private
         */
        _readSpatialBoundingBox: function(targetDataContainer) { // Renamed method.
            const dataStreamReader = this.binaryInputStream;
            targetDataContainer.spatialExtent = { // Renamed variable.
                minX: dataStreamReader.readDouble(),
                minY: dataStreamReader.readDouble(),
                maxX: dataStreamReader.readDouble(),
                maxY: dataStreamReader.readDouble()
            };
            return targetDataContainer;
        },

        /**
         * Reads part definitions (start indices for segments) for complex multi-part shapes.
         * @param {object} recordEntity - The current shape record entity.
         * @returns {object} The record entity with part indices.
         * @private
         */
        _readPartDefinitions: function(recordEntity) { // Renamed method.
            const dataStreamReader = this.binaryInputStream;
            const numberOfSegments = dataStreamReader.readSI32(); // Renamed variable.
            const segmentStartIndices = []; // Renamed variable.

            recordEntity.totalCoordinatePoints = dataStreamReader.readSI32(); // Renamed variable.

            for (let i = 0; i < numberOfSegments; i++) {
                segmentStartIndices.push(dataStreamReader.readSI32());
            }

            recordEntity.partStartingIndices = segmentStartIndices; // Renamed variable.
            return recordEntity;
        },

        /**
         * Extracts a single point's X and Y coordinates.
         * @param {object} recordEntity - The current shape record entity.
         * @returns {object} The record entity with point coordinates.
         * @private
         */
        _readPoint: function(recordEntity) {
            const dataStreamReader = this.binaryInputStream;
            recordEntity.coordinateX = dataStreamReader.readDouble(); // Renamed variable.
            recordEntity.coordinateY = dataStreamReader.readDouble(); // Renamed variable.
            return recordEntity;
        },

        /**
         * Extracts an array of point coordinates for multi-point or line/polygon geometries.
         * @param {object} recordEntity - The current shape record entity.
         * @returns {object} The record entity with an array of points.
         * @private
         */
        _readCoordinatePoints: function(recordEntity) { // Renamed method.
            const dataStreamReader = this.binaryInputStream;
            const pointCoordinatesArray = []; // Renamed variable.
            const totalPointsToRead = recordEntity.totalCoordinatePoints || dataStreamReader.readSI32();

            recordEntity.totalCoordinatePoints = totalPointsToRead; // Ensure the count is on the record.

            for (let i = 0; i < totalPointsToRead; i++) {
                pointCoordinatesArray.push({
                    x: dataStreamReader.readDouble(),
                    y: dataStreamReader.readDouble()
                });
            }

            recordEntity.coordinatesList = pointCoordinatesArray; // Renamed variable.
            return recordEntity;
        },

        /**
         * Processes MultiPoint geometry records.
         * @param {object} recordEntity - The current shape record entity.
         * @returns {object} The processed record entity.
         * @private
         */
        _readMultiPoint: function(recordEntity) {
            this._readSpatialBoundingBox(recordEntity);
            this._readCoordinatePoints(recordEntity);
            return recordEntity;
        },

        /**
         * Processes Polygon geometry records.
         * @param {object} recordEntity - The current shape record entity.
         * @returns {object} The processed record entity.
         * @private
         */
        _readPolygon: function(recordEntity) {
            this._readSpatialBoundingBox(recordEntity);
            this._readPartDefinitions(recordEntity);
            this._readCoordinatePoints(recordEntity);
            return recordEntity;
        },

        /**
         * Processes PolyLine geometry records (delegates to Polygon processing due to similar structure).
         * @param {object} recordEntity - The current shape record entity.
         * @returns {object} The processed record entity.
         * @private
         */
        _readPolyLine: function(recordEntity) {
            // PolyLine and Polygon records often share the same structure for bounds, parts, and points.
            return this._readPolygon(recordEntity);
        },

        /**
         * Transforms the parsed shape records into a GeoJSON FeatureCollection object.
         * @private
         */
        _generateGeoJSONOutput: function() { // Renamed method.
            const globalBounds = this.fileHeaderData.spatialExtent;
            const allShapeRecords = this.shapeRecordsArray;
            const geoJsonFeaturesCollection = []; // Renamed variable.

            const constructedGeoJSON = { // Renamed variable.
                type: "FeatureCollection",
                bbox: [
                    globalBounds.minX,
                    globalBounds.minY,
                    globalBounds.maxX,
                    globalBounds.maxY
                ],
                features: geoJsonFeaturesCollection
            };

            for (let idx = 0; idx < allShapeRecords.length; idx++) {
                const currentShapeRecord = allShapeRecords[idx];
                const newGeoFeature = {
                    type: "Feature",
                    id: generateFeatureUuid(), // Assign a unique ID to each feature.
                    properties: {} // Initialize an empty properties object.
                };
                let featureGeometryObject = newGeoFeature.geometry = {};

                // Include bounding box in feature if available and not a simple point.
                if (currentShapeRecord.spatialExtent && currentShapeRecord.shapeType !== 'Point') {
                    newGeoFeature.bbox = [
                        currentShapeRecord.spatialExtent.minX,
                        currentShapeRecord.spatialExtent.minY,
                        currentShapeRecord.spatialExtent.maxX,
                        currentShapeRecord.spatialExtent.maxY
                    ];
                }

                switch (currentShapeRecord.shapeType) {
                    case "Point":
                        featureGeometryObject.type = "Point";
                        featureGeometryObject.coordinates = [currentShapeRecord.coordinateX, currentShapeRecord.coordinateY];
                        break;
                    case "MultiPoint":
                    case "PolyLine":
                        featureGeometryObject.type = (currentShapeRecord.shapeType === "PolyLine" ? "LineString" : "MultiPoint");
                        // Use map for cleaner coordinate transformation.
                        featureGeometryObject.coordinates = currentShapeRecord.coordinatesList.map(pt => [pt.x, pt.y]);
                        break;
                    case "Polygon":
                        featureGeometryObject.type = "Polygon";
                        const polygonCoordinateSegments = [];
                        const pointsForPolygon = currentShapeRecord.coordinatesList;
                        const partIndicesForPolygon = currentShapeRecord.partStartingIndices;

                        for (let segmentIdx = 0; segmentIdx < partIndicesForPolygon.length; segmentIdx++) {
                            const segmentBegin = partIndicesForPolygon[segmentIdx];
                            const segmentEnd = partIndicesForPolygon[segmentIdx + 1] || pointsForPolygon.length;
                            const currentSegmentCoordinates = [];
                            for (let pointInSegmentIdx = segmentBegin; pointInSegmentIdx < segmentEnd; pointInSegmentIdx++) {
                                const currentPointData = pointsForPolygon[pointInSegmentIdx];
                                currentSegmentCoordinates.push([currentPointData.x, currentPointData.y]);
                            }
                            polygonCoordinateSegments.push(currentSegmentCoordinates);
                        }
                        featureGeometryObject.coordinates = polygonCoordinateSegments;
                        break;
                    default:
                        _log('warn', `GeoJSON transformation not fully implemented for shape type: ${currentShapeRecord.shapeType}. Defaulting to GeometryCollection.`);
                        featureGeometryObject.type = "GeometryCollection";
                        featureGeometryObject.coordinates = [];
                }
                geoJsonFeaturesCollection.push(newGeoFeature);
            }
            this.finalGeoJSONResult = constructedGeoJSON; // Store the final GeoJSON output.

            if (this.config.enableVerboseLogging) {
                _log('debug', `GeoJSON FeatureCollection generated with ${geoJsonFeaturesCollection.length} features.`);
            }
        },

        /**
         * Integrates external DBF attribute data into the generated GeoJSON features.
         * @param {object} receivedDbfData - The parsed DBF data object.
         * @private
         */
        applyDbfAttributesToGeoJSON: function(receivedDbfData) { // Renamed method.
            if (!this.finalGeoJSONResult) {
                _log('warn', 'Attempted to apply DBF attributes before GeoJSON was generated. Deferring application.');
                this.pendingDbfAttributes = receivedDbfData;
                return;
            }

            this.dbfAttributeData = receivedDbfData; // Store the DBF data.

            const featuresToUpdate = this.finalGeoJSONResult.features;
            const dbfRecordsList = receivedDbfData.records;

            // Warn if there's a mismatch in the number of features and DBF records.
            if (featuresToUpdate.length !== dbfRecordsList.length) {
                _log('warn', `Attribute count mismatch: ${featuresToUpdate.length} GeoJSON features vs. ${dbfRecordsList.length} DBF records.`);
                if (this.config.strictDataValidation) {
                    throw new Error("Data Integrity Error: GeoJSON feature count does not match DBF record count, cannot reliably merge attributes.");
                }
            }

            for (let i = 0; i < featuresToUpdate.length; i++) {
                if (dbfRecordsList[i]) {
                    // Merge DBF properties into existing feature properties.
                    featuresToUpdate[i].properties = { ...featuresToUpdate[i].properties,
                        ...dbfRecordsList[i]
                    };
                } else {
                    _log('warn', `No corresponding DBF record found for GeoJSON feature at index ${i}.`);
                }
            }
            _log('debug', 'DBF attributes successfully integrated into GeoJSON features.');
        }
    };

    // In the worker context, expose the core processor class globally.
    if (isInWorkerContext) {
        globalContext["GeospatialDataProcessor"] = GeospatialDataProcessor;
    }
})(self, void 0); // Use `self` for the global object in workers, `void 0` for `undefined`.