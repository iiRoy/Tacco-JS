( function( globalScope, noValue ) {
    // This block executes if the current environment is a web browser with DOM and Web Worker support.
    if ( globalScope.document && globalScope.Worker ) {
        // A variable to hold the instance of the background processing thread.
        let backgroundProcessor = null;

        // The primary constructor for loading geospatial shape data in the main thread.
        const GeoShapeLoader = function ( inputOptions, onCompletionCallback ) {
            // Store a reference to the current instance for use in nested functions.
            const currentInstance = this;
            // Normalize the input options: if a string, it's assumed to be the shapefile path.
            const opts = typeof inputOptions === "string" ? { shapeSource: inputOptions } : inputOptions;

            // If no worker thread is currently active, create a new one.
            if ( !backgroundProcessor ) {
                // Construct the full path to the worker script.
                const workerScriptPath = ( opts.scriptBase || "" ) + "geo_worker_script.js";
                // Instantiate a new Web Worker and store its reference in both local and instance scope.
                const processorInstance = backgroundProcessor = this.workerThread = new Worker( workerScriptPath );
            } else {
                // If a worker already exists, reuse it.
                const processorInstance = backgroundProcessor;
            }

            // Define the message handler for communications from the worker thread.
            processorInstance.onmessage = function ( messageEvent ) {
                // Assign the data received from the worker to the instance's property.
                currentInstance.receivedPayload = messageEvent.payload;
                // If a callback function was provided, invoke it with the received data.
                if ( onCompletionCallback ) {
                    onCompletionCallback( messageEvent.receivedData );
                }
            };

            // Send an initial message to the worker to start the data loading process.
            processorInstance.postMessage( [ "InitiateLoading", opts ] );

            // If a DBF attribute file is specified in the options, create a DBF processor.
            if ( opts.attributeDataFile ) {
                this.attributeDataSource = new DbfProcessor( opts.attributeDataFile, function ( attrPayload ) {
                    // Once the DBF data is loaded, send it to the worker to append attributes.
                    processorInstance.postMessage( [ "AppendDbfAttributes", attrPayload ] );
                } );
            }
        };

        // Expose the GeoShapeLoader class globally for external access.
        globalScope[ "GeoShapeLoader" ] = GeoShapeLoader;
        // Terminate execution in this block as the main thread setup is complete.
        return;
    }

    // Determine if the current execution context is a Web Worker (no 'document' object).
    const IS_BACKGROUND_TASK = !globalScope.document;
    if ( IS_BACKGROUND_TASK ) {
        // Load external scripts required for stream manipulation within the worker.
        importScripts( 'data_stream_utility.js' );
        // Set up the global message handler for the worker thread.
        onmessage = function ( workerMessage ) {
            // Use a switch statement to handle different command types received from the main thread.
            switch ( workerMessage.payload[ 0 ] ) {
                case "InitiateLoading":
                    // Create a new GeoShapeLoader instance within the worker to process the data.
                    globalScope.currentShapefile = new GeoShapeLoader( workerMessage.payload[ 1 ] );
                    break;
                case "AppendDbfAttributes":
                    // Add attribute data from the DBF file to the GeoJSON structure.
                    globalScope.currentShapefile.appendAttributesToGeoJson( workerMessage.payload[ 1 ] );
                    // Dispatch the final processed data back to the main thread.
                    globalScope.currentShapefile._dispatchResult();
                    break;
                default:
                    // Log a warning for any unrecognized commands received.
                    console.warn( "Worker received an unknown command:", workerMessage.payload[ 0 ] );
            }
        };
    }

    // A lookup table mapping numeric shape codes to descriptive geometry names.
    const GEOMETRY_KINDS = {
        "0": "NoGeometry",
        "1": "SinglePoint", // Standard 2D geometric shapes
        "3": "LineSegment",
        "5": "ClosedPolygon",
        "8": "MultiplePoints",
        "11": "Point3D", // 3D geometries with Z-axis data
        "13": "LineSegment3D",
        "15": "ClosedPolygon3D",
        "18": "MultiplePoints3D",
        "21": "PointMeasured", // Geometries including user-defined measurement data (M-values)
        "23": "LineSegmentMeasured",
        "25": "ClosedPolygonMeasured",
        "28": "MultiplePointsMeasured",
        "31": "ComplexSurface"
    };

    // The main constructor function for the geospatial data loader (used in both main thread and worker).
    const GeoShapeLoader = function ( configurationOptions, resultHandler ) {
        // Normalize input: convert a string path into an object with a 'shapeSource' property.
        const processedOptions = typeof configurationOptions === "string" ? { shapeSource: configurationOptions } : configurationOptions;
        // Store the callback function that will be invoked upon successful data processing.
        this.completionHandler = resultHandler;

        // Determine if the input is a local file (indicated by a modification timestamp).
        if ( !!processedOptions.shapeSource.modificationTimestamp ) {
            this.processLocalFile( processedOptions );
        } else {
            // Otherwise, assume it's a remote URI and handle accordingly.
            this.processRemoteUri( processedOptions );
        }
    };

    // Define prototype methods for the GeoShapeLoader class.
    GeoShapeLoader.prototype = {
        constructor: GeoShapeLoader, // Ensure the constructor property points to the correct class.

        // Handles loading a geospatial file from a remote URI.
        processRemoteUri: function ( uriOptions ) {
            const httpRequest = new XMLHttpRequest(); // Create a new HTTP request object.
            const selfRef = this; // Maintain a reference to the current instance.

            // Open a synchronous GET request for the shapefile.
            httpRequest.open( "GET", uriOptions.shapeSource, false );
            // Override the MIME type to ensure raw binary data is received.
            httpRequest.overrideMimeType( "text/plain; charset=x-user-defined" );
            // Send the HTTP request.
            httpRequest.send();

            // Check if the HTTP request was successful (status code 200).
            if ( 200 !== httpRequest.status ) {
                throw new Error( "Failed to retrieve resource: " + uriOptions.shapeSource + " with HTTP status: " + httpRequest.status );
            }

            this.resourceUri = uriOptions.shapeSource;
            // Initialize a data stream from the response text.
            this.dataFlow = new Gordon.BinaryStream( httpRequest.responseText );

            // Perform the sequence of parsing operations.
            this.parseFileHeader();
            this.extractRecords();
            this.convertToJsonGeometry();

            // If a DBF attribute file is specified for this URI.
            if ( uriOptions.attributeDataFile ) {
                this.attributeDataSource = IS_BACKGROUND_TASK ?
                    null : // In a worker, DBF processing is handled differently.
                    new DbfProcessor( uriOptions.attributeDataFile, function ( attributePayload ) {
                        selfRef.appendAttributesToGeoJson( attributePayload );
                        selfRef._dispatchResult();
                    } );
            } else {
                // If no DBF file, dispatch the result immediately.
                this._dispatchResult();
            }
        },

        // Handles loading a geospatial file from a local file system (e.g., via file input).
        processLocalFile: function ( fileConfig ) {
            this.configSettings = fileConfig; // Store the file configuration settings.
            let fileReaderInstance; // Declare a variable for the file reader.

            // Check for asynchronous FileReader support.
            if ( !!globalScope.FileReader ) {
                fileReaderInstance = new FileReader();
            } else {
                // Fallback to synchronous FileReader for environments that require it.
                fileReaderInstance = new FileReaderSync();
            }

            // Set up the callback for when the file content has been fully loaded.
            fileReaderInstance.onload = ( function ( instanceRef ) {
                return function ( loadEvent ) {
                    instanceRef.onFileContentLoaded( loadEvent.target.result );
                };
            } )( this );

            // Start reading the file, using either the asynchronous or synchronous method.
            if ( !!globalScope.FileReader ) {
                fileReaderInstance.readAsBinaryString( fileConfig.shapeSource );
            } else {
                // For synchronous readers, call the content handler directly after reading.
                this.onFileContentLoaded( fileReaderInstance.readAsBinaryString( fileConfig.shapeSource ) );
            }
        },

        // Handler method invoked when the file's binary content has been loaded.
        onFileContentLoaded: function ( rawBinaryData ) {
            this.dataFlow = new Gordon.BinaryStream( rawBinaryData ); // Initialize a data stream.

            // Execute the parsing pipeline.
            this.parseFileHeader();
            this.extractRecords();
            this.convertToJsonGeometry();

            // If a DBF attribute file is specified in the configuration.
            if ( this.configSettings.attributeDataFile ) {
                this.attributeDataSource = IS_BACKGROUND_TASK ?
                    null : // In a worker, DBF is handled externally.
                    new DbfProcessor( this.configSettings.attributeDataFile, function ( attributePayload ) {
                        // Append attributes and dispatch the result, ensuring 'this' context is maintained.
                        this.appendAttributesToGeoJson( attributePayload );
                        this._dispatchResult();
                    }.bind(this) ); // Bind 'this' to the current GeoShapeLoader instance.
            } else {
                // If no DBF, dispatch the result immediately.
                this._dispatchResult();
            }
        },

        // Internal method to dispatch the final processed data, either via worker or callback.
        _dispatchResult: function () {
            const outputData = {
                fileMetadata: this.fileMetadata,
                extractedRecords: this.extractedRecords,
                attributeDataSource: this.attributeDataSource,
                jsonGeometry: this.jsonGeometry
            };
            // If currently in a worker thread, post the message back to the main thread.
            if ( IS_BACKGROUND_TASK ) {
                postMessage( outputData );
            } else if ( this.completionHandler ) {
                // Otherwise, invoke the provided completion callback with the processed data.
                this.completionHandler( outputData );
            }
        },

        // Parses the main header section of the shapefile to extract metadata.
        parseFileHeader: function () {
            const currentStream = this.dataFlow;
            const fileMetadata = this.fileMetadata = {}; // Initialize and store header metadata.

            // Validate the minimum expected header length.
            if ( currentStream.length < 100 ) {
                throw new Error( "Error: Insufficient Header Length for Shapefile." );
            }

            // Read the file code (a fixed magic number for shapefiles).
            fileMetadata.magicNumber = currentStream.readSI32( true );

            // Verify that the magic number matches the expected value.
            if ( fileMetadata.magicNumber !== parseInt( 0x0000270a ) ) {
                throw new Error( "Error: Invalid Shapefile Magic Number Detected." );
            }

            // Skip five unused 32-bit unsigned integers in the header.
            currentStream.offset += 4 * 5;

            // Read the total file length (expressed in 16-bit words, converted to bytes).
            fileMetadata.totalLength = currentStream.readSI32( true ) * 2;

            // Read the shapefile format version.
            fileMetadata.formatVersion = currentStream.readSI32();

            // Read the primary shape type for the file and map it to a descriptive name.
            fileMetadata.geometryKind = GEOMETRY_KINDS[ currentStream.readSI32() ];

            // Extract the minimum bounding rectangle (MBR) for all shapes in the file.
            this._fetchSpatialExtent( fileMetadata );

            // Read the Z-axis (depth) range values.
            fileMetadata.zAxisRange = {
                minimum: currentStream.readDouble(),
                maximum: currentStream.readDouble()
            };

            // Read the M-axis (measurement) range values.
            fileMetadata.mAxisRange = {
                minimum: currentStream.readDouble(),
                maximum: currentStream.readDouble()
            };
        },

        // Iterates through the data stream to extract individual shape records.
        extractRecords: function () {
            const dataInputFlow = this.dataFlow;
            const extractedRecords = this.extractedRecords = []; // Array to hold all parsed records.
            let currentRecordEntry;

            // Loop indefinitely until a specific termination condition is met.
            do {
                currentRecordEntry = {}; // Initialize a new object for each record.

                // Read the record number (1-based index).
                currentRecordEntry.uniqueId = dataInputFlow.readSI32( true );

                // A record ID of 0 signifies the end of all records in the file.
                if ( currentRecordEntry.uniqueId === 0 ) {
                    break;
                }

                // Read the length of the record (in 16-bit words, converted to bytes).
                currentRecordEntry.entryLength = dataInputFlow.readSI32( true ) * 2;

                // Determine the geometry type of the current record.
                currentRecordEntry.geometryKind = GEOMETRY_KINDS[ dataInputFlow.readSI32() ];

                // Dynamically call the appropriate parsing function based on the geometry type.
                this[ "_parse" + currentRecordEntry.geometryKind ]( currentRecordEntry );

                // Add the fully parsed record to the collection.
                extractedRecords.push( currentRecordEntry );

            } while ( true ); // Loop continues until explicitly broken.
        },

        // Internal helper method to read the spatial bounding box for a given object.
        _fetchSpatialExtent: function ( targetObject ) {
            const dataInputFlow = this.dataFlow;

            targetObject.spatialExtent = {
                minX: dataInputFlow.readDouble(),
                minY: dataInputFlow.readDouble(),
                maxX: dataInputFlow.readDouble(),
                maxY: dataInputFlow.readDouble()
            };

            return targetObject;
        },

        // Internal helper method to parse subsections (parts) of a complex geometry record.
        _parseSubsections: function ( geometryEntry ) {
            const dataInputFlow = this.dataFlow;
            let numberOfSubsections;
            const subsectionStartIndices = []; // Array to store the starting index for each part.

            numberOfSubsections = geometryEntry.partCount = dataInputFlow.readSI32();

            // The total number of points for this geometry is provided immediately after part count.
            geometryEntry.totalPointCount = dataInputFlow.readSI32();

            // Populate the array with the starting index for each subsection.
            while ( numberOfSubsections-- ) {
                subsectionStartIndices.push( dataInputFlow.readSI32() );
            }

            geometryEntry.subsections = subsectionStartIndices; // Store the collected subsection indices.

            return geometryEntry;
        },

        // Internal helper method to parse the coordinates of a single point geometry.
        _parseSinglePoint: function ( geometryEntry ) {
            const dataInputFlow = this.dataFlow;

            geometryEntry.coordX = dataInputFlow.readDouble();
            geometryEntry.coordY = dataInputFlow.readDouble();

            return geometryEntry;
        },

        // Internal helper method to parse multiple point geometries.
        _parseMultiplePoints: function ( geometryEntry ) {
            const dataInputFlow = this.dataFlow;
            const coordinateSet = []; // Array to store all individual point coordinates.
            let numCoordinates = geometryEntry.totalPointCount || ( geometryEntry.totalPointCount = dataInputFlow.readSI32() );

            // Read X and Y coordinates for each point.
            while ( numCoordinates-- ) {
                coordinateSet.push( {
                    coordX: dataInputFlow.readDouble(),
                    coordY: dataInputFlow.readDouble()
                } );
            }

            geometryEntry.coordinateSet = coordinateSet; // Store the collected points.

            return geometryEntry;
        },

        // Internal method to parse a MultiPoint geometry record.
        _parseMultiplePoints: function ( geometryEntry ) {
            this._fetchSpatialExtent( geometryEntry ); // Read the bounding box.
            this._parseMultiplePoints( geometryEntry ); // Read the individual points.

            return geometryEntry;
        },

        // Internal method to parse a Polygon geometry record.
        _parseAreaGeometry: function ( geometryEntry ) {
            this._fetchSpatialExtent( geometryEntry ); // Read the bounding box.
            this._parseSubsections( geometryEntry ); // Read the polygon's parts (rings).
            this._parseMultiplePoints( geometryEntry ); // Read all points associated with the polygon.

            return geometryEntry;
        },

        // Internal method to parse a PolyLine geometry record (structurally similar to Polygon).
        _parseLineSegment: function ( geometryEntry ) {
            return this._parseAreaGeometry( geometryEntry );
        },

        // Converts the parsed shapefile data into a standard GeoJSON structure.
        convertToJsonGeometry: function () {
            const overallBounds = this.fileMetadata.spatialExtent;
            const rawRecords = this.extractedRecords;
            const allFeatures = []; // Array to hold all GeoJSON features.
            let currentFeature, featureGeometry, featurePoints, featureExtent, geomCoordinates, featureParts, singleCoordinate;
            const geoJsonOutput = {}; // The final GeoJSON object.

            geoJsonOutput.type = "FeatureCollection";
            geoJsonOutput.bbox = [
                overallBounds.minX,
                overallBounds.minY,
                overallBounds.maxX,
                overallBounds.maxY
            ];
            geoJsonOutput.features = allFeatures;

            // Iterate through each raw record and transform it into a GeoJSON feature.
            for ( let recordIndex = 0, recordEntry; recordEntry = rawRecords[ recordIndex ]; recordIndex++ ) {
                currentFeature = {}; // Initialize a new GeoJSON feature.
                featureExtent = recordEntry.spatialExtent;
                featurePoints = recordEntry.coordinateSet;
                featureParts = recordEntry.subsections;

                currentFeature.type = "Feature";
                // Add a bounding box property for non-point geometries.
                if ( recordEntry.geometryKind !== 'SinglePoint' ) {
                    currentFeature.bbox = [
                        featureExtent.minX,
                        featureExtent.minY,
                        featureExtent.maxX,
                        featureExtent.maxY
                    ];
                }
                featureGeometry = currentFeature.geometry = {}; // Initialize the geometry object for the feature.

                // Map shapefile geometry kinds to GeoJSON geometry types.
                switch ( recordEntry.geometryKind ) {
                    case "SinglePoint":
                        featureGeometry.type = "Point";
                        featureGeometry.coordinates = [
                            recordEntry.coordX,
                            recordEntry.coordY
                        ];
                        break;
                    case "MultiplePoints":
                    case "LineSegment":
                        featureGeometry.type = ( recordEntry.geometryKind === "LineSegment" ? "LineString" : "MultiPoint" );
                        geomCoordinates = featureGeometry.coordinates = [];

                        // Transform shapefile points into GeoJSON coordinate arrays.
                        for ( let pointIdx = 0; pointIdx < featurePoints.length; pointIdx++ ) {
                            singleCoordinate = featurePoints[ pointIdx ];
                            geomCoordinates.push( [ singleCoordinate.coordX, singleCoordinate.coordY ] );
                        }
                        break;
                    case "ClosedPolygon":
                        featureGeometry.type = "Polygon";
                        geomCoordinates = featureGeometry.coordinates = [];

                        // Process each part (ring) of the polygon.
                        for ( let partIdx = 0; partIdx < featureParts.length; partIdx++ ) {
                            const currentPartStart = featureParts[ partIdx ];
                            const currentPartCoords = [];
                            let currentPoint;

                            // Collect points belonging to the current part.
                            for ( let pointInPartIdx = currentPartStart; pointInPartIdx < ( featureParts[ partIdx + 1 ] || featurePoints.length ); pointInPartIdx++ ) {
                                currentPoint = featurePoints[ pointInPartIdx ];
                                currentPartCoords.push( [ currentPoint.coordX, currentPoint.coordY ] );
                            }
                            geomCoordinates.push( currentPartCoords );
                        }
                        break;
                    default:
                        // Log a warning for any unsupported geometry kinds.
                        console.warn( "Unsupported geometry kind encountered during GeoJSON conversion:", recordEntry.geometryKind );
                }
                allFeatures.push( currentFeature ); // Add the constructed feature to the collection.
            }
            this.jsonGeometry = geoJsonOutput; // Store the final GeoJSON output.

            // If DBF data was previously deferred, process it now.
            if ( this._deferredAttributeData ) {
                this.appendAttributesToGeoJson( this._deferredAttributeData );
            }
        },

        // Appends attribute data from a DBF file to the corresponding GeoJSON features.
        appendAttributesToGeoJson: function ( attributeData ) {
            // If GeoJSON has not yet been generated, defer the attribute assignment.
            if ( !this.jsonGeometry ) {
                return ( this._deferredAttributeData = attributeData );
            }

            this.attributeDataSource = attributeData; // Store the DBF attribute data.

            const geoFeatures = this.jsonGeometry.features;
            let featureCount = geoFeatures.length;
            const dbfRecords = attributeData.records;

            // Iterate backwards through features, assigning properties from DBF records.
            while ( featureCount-- ) {
                geoFeatures[ featureCount ].attributes = dbfRecords[ featureCount ];
            }
        }
    }; // End of GeoShapeLoader.prototype definitions.

    // Expose the GeoShapeLoader class globally for external access.
    globalScope[ "GeoShapeLoader" ] = GeoShapeLoader;

} )( self ); // Invoke the self-executing function, passing 'self' (the global object in web workers and window in browsers).