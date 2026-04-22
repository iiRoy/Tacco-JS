((globalEnvironment) => {

    const withinWorkerContext = typeof WorkerGlobalScope !== 'undefined' && globalEnvironment instanceof WorkerGlobalScope;

    // --- Utility for binary data interpretation (replaces Gordon.Stream) ---
    class BinaryDataInterpreter {
        constructor(buffer) {
            this.dataView = new DataView(buffer);
            this.position = 0;
            this.isLittleEndian = true; // Shapefiles typically use little-endian for geometry data
        }

        advanceCursor(byteCount) {
            this.position += byteCount;
        }

        readUnsignedInteger(littleEndian = this.isLittleEndian) {
            if (this.position + 4 > this.dataView.byteLength) throw new Error("Attempted to read past buffer end.");
            const val = this.dataView.getUint32(this.position, littleEndian);
            this.position += 4;
            return val;
        }

        readSignedInteger(littleEndian = this.isLittleEndian) {
            if (this.position + 4 > this.dataView.byteLength) throw new Error("Attempted to read past buffer end.");
            const val = this.dataView.getInt32(this.position, littleEndian);
            this.position += 4;
            return val;
        }

        readFloatingPoint(littleEndian = this.isLittleEndian) {
            if (this.position + 8 > this.dataView.byteLength) throw new Error("Attempted to read past buffer end.");
            const val = this.dataView.getFloat64(this.position, littleEndian);
            this.position += 8;
            return val;
        }

        // Specific reader for bounding boxes (minX, minY, maxX, maxY)
        readSpatialExtent() {
            return {
                minX: this.readFloatingPoint(),
                minY: this.readFloatingPoint(),
                maxX: this.readFloatingPoint(),
                maxY: this.readFloatingPoint()
            };
        }
    }

    // --- Lookup map for geometry types (replaces SHAPE_TYPES) ---
    const GEOMETRY_KIND_MAP = {
        0: "NullGeometry",
        1: "PointFeature",
        3: "PolylineFeature",
        5: "PolygonFeature",
        8: "MultiPointFeature",
        11: "PointZFeature",
        13: "PolylineZFeature",
        15: "PolygonZFeature",
        18: "MultiPointZFeature",
        21: "PointMFeature",
        23: "PolylineMFeature",
        25: "PolygonMFeature",
        28: "MultiPointMFeature",
        31: "MultiPatchFeature"
    };

    // --- Data source acquisition (replaces handleUri/handleFile) ---
    const acquireSourceData = async (sourceIdentifier, inWorker = false) => {
        if (sourceIdentifier instanceof File) {
            return new Promise((resolve, reject) => {
                const fileReader = inWorker ? new FileReaderSync() : new FileReader();
                fileReader.onload = (e) => resolve(e.target.result);
                fileReader.onerror = reject;
                fileReader.readAsArrayBuffer(sourceIdentifier);
            });
        } else if (typeof sourceIdentifier === "string") {
            const response = await fetch(sourceIdentifier);
            if (!response.ok) {
                throw new Error(`Data acquisition failed for ${sourceIdentifier}: ${response.status} ${response.statusText}`);
            }
            return await response.arrayBuffer();
        } else {
            throw new Error("Invalid source for geospatial data. Expected File object or URL string.");
        }
    };

    // --- DBF attribute handler (replaces DBF constructor logic) ---
    // This is a placeholder. In a real system, 'dbf_parser_module.js' would be imported.
    class DbfAttributeHandler {
        static async fetchAndParse(sourcePath) {
            if (!sourcePath) return null;
            // Simulate async loading and parsing of DBF data
            // In a real scenario, this would fetch a .dbf file and parse it.
            // For this Type IV clone, we return a simple mock object.
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve({
                        header: { version: 3, recordCount: 2, headerLength: 32, recordLength: 20 },
                        records: [{ "NameField": "MockA", "NumericVal": 100 }, { "NameField": "MockB", "NumericVal": 200 }]
                    });
                }, 5);
            });
        }
    }

    // --- Core parsing functions (replaces readFileHeader, readRecords, _readX methods) ---

    const decodeFileHeader = (dataInterpreter) => {
        const structuralMetadata = {};

        structuralMetadata.fileSignature = dataInterpreter.readSignedInteger(false); // Big Endian
        if (structuralMetadata.fileSignature !== 9994) { // 0x0000270a
            throw new Error("Invalid geospatial file signature detected.");
        }

        dataInterpreter.advanceCursor(20); // Skip 5 unused 32-bit integers

        structuralMetadata.totalByteLength = dataInterpreter.readSignedInteger(false) * 2; // Big Endian, in bytes

        structuralMetadata.formatVersion = dataInterpreter.readSignedInteger();

        const geometryTypeCode = dataInterpreter.readSignedInteger();
        structuralMetadata.primaryGeometryType = GEOMETRY_KIND_MAP[geometryTypeCode] || "UnknownGeometry";

        structuralMetadata.spatialBoundingBox = dataInterpreter.readSpatialExtent();

        structuralMetadata.zExtent = {
            min: dataInterpreter.readFloatingPoint(),
            max: dataInterpreter.readFloatingPoint()
        };

        structuralMetadata.mExtent = {
            min: dataInterpreter.readFloatingPoint(),
            max: dataInterpreter.readFloatingPoint()
        };

        return structuralMetadata;
    };

    // Dispatch map for specific geometry parsing logic
    const geometryPayloadExtractors = {
        "NullGeometry": (interpreter, payloadContainer) => { /* No data for null */ },
        "PointFeature": (interpreter, payloadContainer) => {
            payloadContainer.x = interpreter.readFloatingPoint();
            payloadContainer.y = interpreter.readFloatingPoint();
        },
        "PolylineFeature": (interpreter, payloadContainer) => {
            payloadContainer.bbox = interpreter.readSpatialExtent();
            const numParts = interpreter.readSignedInteger();
            const numPoints = interpreter.readSignedInteger();
            payloadContainer.partStartIndices = Array.from({ length: numParts }, () => interpreter.readSignedInteger());
            payloadContainer.coordinates = Array.from({ length: numPoints }, () => ({
                x: interpreter.readFloatingPoint(),
                y: interpreter.readFloatingPoint()
            }));
        },
        "PolygonFeature": (interpreter, payloadContainer) => {
            payloadContainer.bbox = interpreter.readSpatialExtent();
            const numParts = interpreter.readSignedInteger();
            const numPoints = interpreter.readSignedInteger();
            payloadContainer.partStartIndices = Array.from({ length: numParts }, () => interpreter.readSignedInteger());
            payloadContainer.coordinates = Array.from({ length: numPoints }, () => ({
                x: interpreter.readFloatingPoint(),
                y: interpreter.readFloatingPoint()
            }));
        },
        "MultiPointFeature": (interpreter, payloadContainer) => {
            payloadContainer.bbox = interpreter.readSpatialExtent();
            const numPoints = interpreter.readSignedInteger();
            payloadContainer.coordinates = Array.from({ length: numPoints }, () => ({
                x: interpreter.readFloatingPoint(),
                y: interpreter.readFloatingPoint()
            }));
        },
        // Z and M variants: simply call base and then skip Z/M values as original does not fully process
        "PointZFeature": (interpreter, payloadContainer) => {
            geometryPayloadExtractors.PointFeature(interpreter, payloadContainer);
            payloadContainer.z = interpreter.readFloatingPoint();
            payloadContainer.m = interpreter.readFloatingPoint();
        },
        "PolylineZFeature": (interpreter, payloadContainer) => {
            geometryPayloadExtractors.PolylineFeature(interpreter, payloadContainer);
            interpreter.advanceCursor(payloadContainer.coordinates.length * 8); // Skip Z values
            interpreter.advanceCursor(payloadContainer.coordinates.length * 8); // Skip M values
        },
        "PolygonZFeature": (interpreter, payloadContainer) => {
            geometryPayloadExtractors.PolygonFeature(interpreter, payloadContainer);
            interpreter.advanceCursor(payloadContainer.coordinates.length * 8); // Skip Z values
            interpreter.advanceCursor(payloadContainer.coordinates.length * 8); // Skip M values
        },
        "MultiPointZFeature": (interpreter, payloadContainer) => {
            geometryPayloadExtractors.MultiPointFeature(interpreter, payloadContainer);
            interpreter.advanceCursor(payloadContainer.coordinates.length * 8); // Skip Z values
            interpreter.advanceCursor(payloadContainer.coordinates.length * 8); // Skip M values
        },
        "PointMFeature": (interpreter, payloadContainer) => {
            geometryPayloadExtractors.PointFeature(interpreter, payloadContainer);
            payloadContainer.m = interpreter.readFloatingPoint();
        },
        "PolylineMFeature": (interpreter, payloadContainer) => {
            geometryPayloadExtractors.PolylineFeature(interpreter, payloadContainer);
            interpreter.advanceCursor(payloadContainer.coordinates.length * 8); // Skip M values
        },
        "PolygonMFeature": (interpreter, payloadContainer) => {
            geometryPayloadExtractors.PolygonFeature(interpreter, payloadContainer);
            interpreter.advanceCursor(payloadContainer.coordinates.length * 8); // Skip M values
        },
        "MultiPointMFeature": (interpreter, payloadContainer) => {
            geometryPayloadExtractors.MultiPointFeature(interpreter, payloadContainer);
            interpreter.advanceCursor(payloadContainer.coordinates.length * 8); // Skip M values
        },
        "MultiPatchFeature": (interpreter, payloadContainer) => {
            geometryPayloadExtractors.PolygonFeature(interpreter, payloadContainer); // MultiPatch has similar structure to Polygon
            // Additional MultiPatch specific fields (part types, Z/M values) would follow.
            // Skipping for strict Type IV, as original doesn't implement full parsing for these either.
            interpreter.advanceCursor(interpreter.readSignedInteger() * 4); // Skip NumParts, PartTypes
            interpreter.advanceCursor(payloadContainer.coordinates.length * 8); // Skip Z values
            interpreter.advanceCursor(payloadContainer.coordinates.length * 8); // Skip M values
        }
    };

    const extractFeatureRecords = (dataInterpreter) => {
        const collectionOfFeatures = [];
        let featureOrdinal = 1;

        while (dataInterpreter.position < dataInterpreter.dataView.byteLength) {
            const recordStartOffset = dataInterpreter.position;
            const recordId = dataInterpreter.readSignedInteger(false); // Big Endian
            const recordLengthInWords = dataInterpreter.readSignedInteger(false); // Big Endian
            const recordByteSize = recordLengthInWords * 2;

            if (recordId === 0 && dataInterpreter.position >= dataInterpreter.dataView.byteLength) {
                break; // End of file indicator or last null record
            }

            const recordGeometryCode = dataInterpreter.readSignedInteger(); // Little Endian
            const recordGeometryKind = GEOMETRY_KIND_MAP[recordGeometryCode];

            const currentFeature = {
                identifier: recordId,
                geometryKind: recordGeometryKind,
                payloadData: {}
            };

            const payloadExtractor = geometryPayloadExtractors[recordGeometryKind];
            if (payloadExtractor) {
                payloadExtractor(dataInterpreter, currentFeature.payloadData);
            } else {
                // If geometry type is unknown, skip its data.
                dataInterpreter.advanceCursor(recordByteSize - (dataInterpreter.position - recordStartOffset - 8));
            }

            collectionOfFeatures.push(currentFeature);
            featureOrdinal++;

            // Crucial: Ensure the interpreter's position is exactly at the start of the next record.
            // This corrects for any discrepancies in parsing Z/M values or unknown types.
            const expectedNextRecordStart = recordStartOffset + 8 + recordByteSize;
            if (dataInterpreter.position !== expectedNextRecordStart) {
                dataInterpreter.position = expectedNextRecordStart;
            }
        }
        return collectionOfFeatures;
    };

    // --- GeoJSON formatting (replaces formatIntoGeoJson) ---
    const convertShapesToGeoJson = (fileHeader, featureRecords) => {
        const geoJsonOutput = {
            type: "FeatureCollection",
            bbox: [
                fileHeader.spatialBoundingBox.minX,
                fileHeader.spatialBoundingBox.minY,
                fileHeader.spatialBoundingBox.maxX,
                fileHeader.spatialBoundingBox.maxY
            ],
            features: []
        };

        for (const record of featureRecords) {
            const geoFeature = {
                type: "Feature",
                properties: {}
            };

            let geoGeometry = {};

            if (record.payloadData.bbox) {
                geoFeature.bbox = [
                    record.payloadData.bbox.minX,
                    record.payloadData.bbox.minY,
                    record.payloadData.bbox.maxX,
                    record.payloadData.bbox.maxY
                ];
            }

            switch (record.geometryKind) {
                case "PointFeature":
                case "PointZFeature":
                case "PointMFeature":
                    geoGeometry.type = "Point";
                    geoGeometry.coordinates = [record.payloadData.x, record.payloadData.y];
                    break;
                case "MultiPointFeature":
                case "MultiPointZFeature":
                case "MultiPointMFeature":
                    geoGeometry.type = "MultiPoint";
                    geoGeometry.coordinates = record.payloadData.coordinates.map(coord => [coord.x, coord.y]);
                    break;
                case "PolylineFeature":
                case "PolylineZFeature":
                case "PolylineMFeature":
                    if (record.payloadData.partStartIndices && record.payloadData.partStartIndices.length > 1) {
                        geoGeometry.type = "MultiLineString";
                        const multiLineSegments = [];
                        for (let i = 0; i < record.payloadData.partStartIndices.length; i++) {
                            const startIndex = record.payloadData.partStartIndices[i];
                            const endIndex = record.payloadData.partStartIndices[i + 1] || record.payloadData.coordinates.length;
                            multiLineSegments.push(record.payloadData.coordinates.slice(startIndex, endIndex).map(coord => [coord.x, coord.y]));
                        }
                        geoGeometry.coordinates = multiLineSegments;
                    } else {
                        geoGeometry.type = "LineString";
                        geoGeometry.coordinates = record.payloadData.coordinates.map(coord => [coord.x, coord.y]);
                    }
                    break;
                case "PolygonFeature":
                case "PolygonZFeature":
                case "PolygonMFeature":
                case "MultiPatchFeature":
                    geoGeometry.type = "Polygon";
                    const polygonRings = [];
                    for (let i = 0; i < record.payloadData.partStartIndices.length; i++) {
                        const startIndex = record.payloadData.partStartIndices[i];
                        const endIndex = record.payloadData.partStartIndices[i + 1] || record.payloadData.coordinates.length;
                        polygonRings.push(record.payloadData.coordinates.slice(startIndex, endIndex).map(coord => [coord.x, coord.y]));
                    }
                    geoGeometry.coordinates = polygonRings;
                    break;
                case "NullGeometry":
                    geoGeometry.type = "GeometryCollection";
                    geoGeometry.geometries = [];
                    break;
                default:
                    geoGeometry = null; // Unrecognized geometry
            }
            geoFeature.geometry = geoGeometry;
            geoJsonOutput.features.push(geoFeature);
        }
        return geoJsonOutput;
    };

    // --- Main processing pipeline (replaces Shapefile constructor and handleUri/onFileLoad) ---
    const processGeospatialFile = async (binaryDataBuffer, optionsObject) => {
        const dataInterpreter = new BinaryDataInterpreter(binaryDataBuffer);

        const fileHeader = decodeFileHeader(dataInterpreter);
        const featureRecords = extractFeatureRecords(dataInterpreter);
        const geoJsonResult = convertShapesToGeoJson(fileHeader, featureRecords);

        // Integrate DBF attributes
        if (optionsObject.auxiliaryFilePath) {
            const dbfAttributes = await DbfAttributeHandler.fetchAndParse(optionsObject.auxiliaryFilePath);
            if (dbfAttributes && dbfAttributes.records) {
                for (let i = 0; i < geoJsonResult.features.length && i < dbfAttributes.records.length; i++) {
                    geoJsonResult.features[i].properties = {
                        ...geoJsonResult.features[i].properties,
                        ...dbfAttributes.records[i]
                    };
                }
            }
        }
        return {
            structuralMetadata: fileHeader,
            featureRecords: featureRecords, // Raw parsed records
            formattedGeoJson: geoJsonResult
        };
    };

    // --- Main thread entry point (replaces Shapefile constructor) ---
    if (!withinWorkerContext) {
        class GeospatialDataLoader {
            constructor(inputSource, resultHandler) {
                this.completionCallback = resultHandler;
                const normalizedSource = typeof inputSource === "string" ? { vectorSource: inputSource } : inputSource;

                this.initiateLoading(normalizedSource)
                    .then(finalResult => {
                        if (this.completionCallback) this.completionCallback(finalResult);
                    })
                    .catch(error => {
                        console.error("Geospatial data loading failed:", error);
                        if (this.completionCallback) this.completionCallback(null, error);
                    });
            }

            async initiateLoading(configOptions) {
                // Determine if a web worker should be used
                if (typeof Worker !== 'undefined') {
                    const workerScriptPath = (configOptions.workerRoot || "") + "geo_processor_worker.js"; // Renamed worker script
                    const dataWorker = new Worker(workerScriptPath); // New worker per instance

                    return new Promise((resolve, reject) => {
                        dataWorker.onmessage = (event) => {
                            dataWorker.terminate(); // Clean up worker
                            if (event.data && event.data.error) {
                                reject(new Error(event.data.error));
                            } else {
                                resolve(event.data);
                            }
                        };
                        dataWorker.onerror = (errorEvent) => {
                            dataWorker.terminate();
                            reject(new Error(`Worker error: ${errorEvent.message || 'Unknown worker error'}`));
                        };

                        dataWorker.postMessage(["INITIATE_VECTOR_PROCESSING", configOptions]);
                    });
                } else {
                    // Fallback to main thread processing if workers are not available
                    const rawDataSource = await acquireSourceData(configOptions.vectorSource, false);
                    return await processGeospatialFile(rawDataSource, { auxiliaryFilePath: configOptions.dbf });
                }
            }
        }
        globalEnvironment["VectorMapLoader"] = GeospatialDataLoader; // Renamed global entry
    }
    // --- Web Worker entry point ---
    else {
        globalEnvironment.onmessage = async (event) => {
            const [actionCommand, payloadData] = event.data;

            if (actionCommand === "INITIATE_VECTOR_PROCESSING") {
                try {
                    const fileBuffer = await acquireSourceData(payloadData.vectorSource, true); // `true` for worker context
                    const finalResult = await processGeospatialFile(fileBuffer, { auxiliaryFilePath: payloadData.dbf });
                    globalEnvironment.postMessage(finalResult);
                } catch (error) {
                    globalEnvironment.postMessage({ error: error.message || String(error) });
                }
            }
        };
    }

})(typeof self !== 'undefined' ? self : typeof window !== 'undefined' ? window : this);