// This file contains utilities for processing geographic boundary data.
// It is a derivative work, intended for educational purposes and demonstrating
// code transformation techniques.
// Original source: http://data.esosedi.org/regions/
// License: MIT (as per original)

(function (globalScope) {
    // Core logic container for geographical boundary operations
    var geoBoundariesProcessor = (function () {

        /**
         * @typedef {Object} MapDataContainer
         * @property {Object.<string, Object>} regions - Metadata for each region.
         * @property {Object.<string, Array<Array<number>>>} paths - Way paths for regions.
         * @property {Object.<string, string>} ways - Encoded way geometries.
         * @property {Object} meta - Additional metadata.
         * @property {Object.<string, Array<Array<number>>>} [wayCache] - Cache for decoded ways.
         */

        /**
         * @typedef {Object} BoundaryEntity
         * @property {string} osmId - OpenStreetMap ID.
         * @property {string} [geoNamesId] - GeoNames ID.
         * @property {string} [iso] - ISO 3166 code.
         * @property {number} level - Administrative level.
         * @property {Object} properties - Custom properties.
         * @property {function(number): Array<Array<number>>} findSharedPaths - Finds paths shared with another region.
         * @property {function(number): boolean} sharesBoundaryWith - Checks if a boundary is shared with another region.
         * @property {function(number): boolean} isDescendantOf - Checks if a region has a specific parent.
         */

        // Configuration constants for coordinate decoding
        const COORD_SCALING_FACTOR = 1 / 1000000; // Factor to convert integer representation to float coordinates
        const BYTE_SEGMENT_LENGTH = 2;          // Number of bytes per coordinate component in the encoded string
        const INVERSE_RESOLUTION_SCALE = 1 / 0xFFFF; // Target resolution factor for decoding (1/65535)

        /**
         * Reverses the order of coordinates within an array of [lat, lon] pairs to [lon, lat].
         * @param {Array<Array<number>>} inputArray - An array of coordinate pairs [lat, lon].
         * @returns {Array<Array<number>>} A new array with coordinates flipped to [lon, lat].
         */
        function reverseCoordPair(inputArray) {
            const outputArray = [];
            for (let k = 0; k < inputArray.length; ++k) {
                const currentPair = inputArray[k];
                outputArray.push([currentPair[1], currentPair[0]]);
            }
            return outputArray;
        }

        /**
         * Applies `reverseCoordPair` to each sub-array within a nested array structure.
         * @param {Array<Array<Array<number>>>} inputMatrix - A nested array of coordinate arrays.
         * @returns {Array<Array<Array<number>>>} A new nested array with all inner coordinate pairs flipped.
         */
        function reverseCoordMatrix(inputMatrix) {
            const outputMatrix = [];
            for (let k = 0; k < inputMatrix.length; ++k) {
                outputMatrix.push(reverseCoordPair(inputMatrix[k]));
            }
            return outputMatrix;
        }

        /**
         * Decodes a specific number of bytes from a string into an integer.
         * @param {string} byteString - The string containing byte characters.
         * @param {number} byteCount - The number of bytes to decode.
         * @returns {number} The decoded integer value.
         */
        function extractNumericValue(byteString, byteCount) {
            let numericResult = 0;
            for (let i = 0; i < byteCount; ++i) {
                numericResult |= (byteString.charCodeAt(i) << (i * 8));
            }
            return numericResult;
        }

        /**
         * Clamps a longitude value to the range [-180, 180].
         * @param {number} longitude - The longitude value.
         * @returns {number} The clamped longitude.
         */
        function constrainLongitude(longitude) {
            return Math.max(-180, Math.min(180, longitude));
        }

        /**
         * Clamps a latitude value to the range [-85, 85].
         * @param {number} latitude - The latitude value.
         * @returns {number} The clamped latitude.
         */
        function constrainLatitude(latitude) {
            return Math.max(-85, Math.min(85, latitude));
        }

        /**
         * Decodes a Base64-encoded string, handling URL-safe variants.
         * Provides a fallback for environments without `atob`.
         * @param {string} encodedString - The Base64 string to decode.
         * @returns {string} The decoded binary string.
         */
        function decodeBase64String(encodedString) {
            let processedString = encodedString.replace(/_/g, '/').replace(/-/g, '+');
            if (typeof globalScope.atob !== "undefined") {
                return globalScope.atob(processedString);
            } else {
                // Node.js Buffer fallback or similar
                if (typeof Buffer !== "undefined" && Buffer.from) {
                    return Buffer.from(processedString, 'base64').toString('binary');
                } else {
                    // Fallback for extremely limited environments (might fail)
                    console.warn("Base64 decoding requires `atob` or Node.js `Buffer`.");
                    return ''; // Or throw an error
                }
            }
        }

        /**
         * Parses an encoded geometry block string into an array of coordinate pairs.
         * The encoding format involves byte vectors for bounds and then delta-encoded points.
         * @param {string} encodedCoordsString - The Base64-encoded coordinate string.
         * @returns {Array<Array<number>>} An array of [longitude, latitude] coordinate pairs.
         */
        function parseEncodedGeometryBlock(encodedCoordsString) {
            const binaryData = decodeBase64String(encodedCoordsString);
            const dataLength = binaryData.length;

            if (dataLength < 16) { // Minimum 4 bytes for each of 4 boundary components
                console.error("Encoded geometry block is too short:", encodedCoordsString);
                return [];
            }

            // Extract bounds: [minX, minY], [maxX, maxY]
            const minX = extractNumericValue(binaryData.substring(0, 4), 4) * COORD_SCALING_FACTOR;
            const minY = extractNumericValue(binaryData.substring(4, 8), 4) * COORD_SCALING_FACTOR;
            const maxX = extractNumericValue(binaryData.substring(8, 12), 4) * COORD_SCALING_FACTOR;
            const maxY = extractNumericValue(binaryData.substring(12, 16), 4) * COORD_SCALING_FACTOR;

            const xRange = maxX - minX;
            const yRange = maxY - minY;

            const decodedPoints = [];
            let currentReadIndex = 16; // Start reading actual points after the 16-byte header

            const xStep = xRange * INVERSE_RESOLUTION_SCALE;
            const yStep = yRange * INVERSE_RESOLUTION_SCALE;

            // Helper to read two-byte segments
            const readSegment = () => {
                const value = extractNumericValue(binaryData.substring(currentReadIndex, currentReadIndex + BYTE_SEGMENT_LENGTH), BYTE_SEGMENT_LENGTH);
                currentReadIndex += BYTE_SEGMENT_LENGTH;
                return value;
            };

            while (currentReadIndex < dataLength) {
                const rawLat = readSegment();
                const rawLon = readSegment();

                const calculatedLat = constrainLatitude(rawLat * xStep + minX);
                const calculatedLon = constrainLongitude(rawLon * yStep + minY);

                decodedPoints.push([calculatedLon, calculatedLat]);
            }
            return decodedPoints;
        }

        /**
         * Retrieves a decoded way from cache or decodes it and then caches it.
         * @param {string} pathEncodedBlock - The encoded string for the way.
         * @param {number|string} wayIdentifier - The unique ID for the way.
         * @param {MapDataContainer} geoData - The global geographical data object.
         * @returns {Array<Array<number>>} The decoded array of [longitude, latitude] points for the way.
         */
        function retrieveCachedOrDecodedPath(pathEncodedBlock, wayIdentifier, geoData) {
            if (!geoData.wayCache) {
                geoData.wayCache = {}; // Initialize cache if it doesn't exist
            }
            if (geoData.wayCache[wayIdentifier]) {
                return geoData.wayCache[wayIdentifier];
            }
            const decodedPath = parseEncodedGeometryBlock(pathEncodedBlock);
            geoData.wayCache[wayIdentifier] = decodedPath;
            return decodedPath;
        }

        /**
         * Checks if two coordinate points are approximately equal within a given tolerance.
         * @param {Array<number>} point1 - The first point [lon, lat].
         * @param {Array<number>} point2 - The second point [lon, lat].
         * @param {number} [tolerance=1e-9] - The maximum allowed difference for coordinates.
         * @returns {boolean} True if points are approximately equal, false otherwise.
         */
        function arePointsApproximatelyEqual(point1, point2, tolerance = 1e-9) {
            const deltaLon = Math.abs(point2[0] - point1[0]);
            const deltaLat = Math.abs(point2[1] - point1[1]);
            return deltaLon < tolerance && deltaLat < tolerance;
        }

        /**
         * Trims overlapping segments from the beginning of a `way` array that match the end of a `currentPath` array.
         * This is used to connect segments without redundant points.
         * @param {Array<Array<number>>} waySegment - The segment to potentially trim.
         * @param {Array<Array<number>>} currentPathAccumulator - The path accumulated so far.
         * @returns {number} The number of points trimmed from the beginning of `waySegment`.
         */
        function trimOverlappingSegments(waySegment, currentPathAccumulator) {
            let overlapCount = 0;
            const pathLen = currentPathAccumulator.length;
            const segmentLen = waySegment.length;

            if (pathLen < 1 || segmentLen < 1) {
                return 0; // No overlap possible
            }

            // A small delta to account for floating point inaccuracies, representing
            // a few "hops" in the original encoding resolution.
            const overlapDelta = 10 * INVERSE_RESOLUTION_SCALE; // 10 hops

            // Check from the end of currentPath and beginning of waySegment
            // The comparison is `currentPath[pathLen - 1 - i]` vs `waySegment[i]`
            for (let i = 0; i < Math.min(segmentLen, pathLen); ++i) {
                if (arePointsApproximatelyEqual(currentPathAccumulator[pathLen - 1 - i], waySegment[i], overlapDelta)) {
                    overlapCount++;
                } else {
                    break; // Mismatch found, stop counting overlap
                }
            }
            return overlapCount;
        }

        /**
         * Retrieves the full geometry (polygon coordinates) for a given region ID.
         * Handles path reversal and degenerate segment fixing.
         * @param {number|Array<number|Array<number>>} regionIdentifier - The ID of the region or its raw path data.
         * @param {MapDataContainer} geoData - The global geographical data object.
         * @param {Object} [opts] - Options for geometry retrieval.
         * @param {boolean} [opts.fixDegenerate=false] - Whether to fix degenerate (overlapping) segments.
         * @returns {Object|boolean} A GeoJSON-like Polygon object or false if paths are not found.
         */
        function retrieveBoundaryShape(regionIdentifier, geoData, opts) {
            const options = opts || {};
            const regionPaths = Array.isArray(regionIdentifier) ? regionIdentifier : geoData.paths[regionIdentifier];

            if (!regionPaths) {
                // If no paths defined for the region, return false or an empty geometry
                return false;
            }

            const allCoordinates = [];
            const segmentMarkers = []; // Stores indices where new segments begin in allCoordinates
            const wayMetadata = [];     // Stores original way IDs for each segment

            // Ensure wayCache exists
            if (!geoData.wayCache) {
                geoData.wayCache = {};
            }

            for (let pIdx = 0; pIdx < regionPaths.length; ++pIdx) {
                let currentPathSegment = regionPaths[pIdx];
                const accumulatedPathCoords = [];
                const currentSegmentMarkers = [0]; // Marks start of each way within this path
                const segmentWayIds = [];

                // Normalize path segment to an array of way IDs if it's a single number
                if (typeof currentPathSegment === 'number') {
                    currentPathSegment = [currentPathSegment];
                }

                for (let wIdx = 0; wIdx < currentPathSegment.length; ++wIdx) {
                    const currentWayRef = currentPathSegment[wIdx];
                    const absoluteWayId = Math.abs(currentWayRef);
                    let decodedWay = retrieveCachedOrDecodedPath(geoData.ways[absoluteWayId], absoluteWayId, geoData);

                    // Reverse way if the reference is negative
                    if (currentWayRef < 0) {
                        // Create a shallow copy to avoid modifying the cached original
                        decodedWay = [...decodedWay].reverse();
                    }

                    if (options.fixDegenerate) {
                        // Trim leading overlap with the previously accumulated path
                        const leadingOverlap = trimOverlappingSegments(decodedWay, accumulatedPathCoords);
                        if (leadingOverlap > 0) {
                            decodedWay = decodedWay.slice(leadingOverlap);
                        }

                        // Special handling for the last way in a path to fix potential closing overlap
                        if (wIdx === currentPathSegment.length - 1) {
                            // Check for overlap between the end of the accumulated path and the *reversed* end of the current way
                            // This handles cases where the path might close on itself
                            const reverseCheckPath = [...decodedWay].reverse();
                            const trailingOverlap = trimOverlappingSegments(accumulatedPathCoords, reverseCheckPath);
                            if (trailingOverlap > 0) {
                                // Adjust both the accumulated path and the current way to remove overlap
                                accumulatedPathCoords.length -= trailingOverlap;
                                decodedWay = decodedWay.slice(0, decodedWay.length - trailingOverlap);
                            }
                        }
                    } else {
                        // If not fixing degenerates, simply remove the last point of the previous segment
                        // to prevent duplicate points where segments meet (if any points exist)
                        if (accumulatedPathCoords.length > 0) {
                            accumulatedPathCoords.pop();
                        }
                    }

                    accumulatedPathCoords.push(...decodedWay);
                    currentSegmentMarkers.push(accumulatedPathCoords.length - 1);
                    segmentWayIds.push(absoluteWayId);
                }

                // Ensure the path is closed by adding the first point again if it's not already closed
                if (accumulatedPathCoords.length > 0 &&
                    !arePointsApproximatelyEqual(accumulatedPathCoords[0], accumulatedPathCoords[accumulatedPathCoords.length - 1])) {
                    accumulatedPathCoords.push(accumulatedPathCoords[0]);
                }

                allCoordinates.push(accumulatedPathCoords);
                segmentMarkers.push(currentSegmentMarkers);
                wayMetadata.push(segmentWayIds);
            }

            return {
                type: 'Polygon',
                windingRule: allCoordinates.length > 1 ? 'evenOdd' : 'nonZero', // GeoJSON 'evenodd' vs 'nonzero'
                coordinates: allCoordinates,
                originalPaths: regionPaths, // Store original path definitions
                segmentBoundaries: segmentMarkers
                // Optionally add wayMetadata if needed: originalWayRefs: wayMetadata
            };
        }

        /**
         * Fetches remote JSON data using XMLHttpRequest.
         * @param {string} urlPath - The URL to fetch data from.
         * @param {function(Object): void} successCallback - Callback for successful data retrieval.
         * @param {function(Error|XMLHttpRequest): void} failureCallback - Callback for failed requests.
         */
        function fetchRemoteData(urlPath, successCallback, failureCallback) {
            const dataRequest = new XMLHttpRequest();
            dataRequest.open("GET", urlPath, true); // Asynchronous GET request

            dataRequest.onreadystatechange = function () {
                // Check if the request is complete
                if (dataRequest.readyState === XMLHttpRequest.DONE) {
                    if (dataRequest.status >= 200 && dataRequest.status < 300) { // HTTP OK range
                        try {
                            const parsedResponse = JSON.parse(dataRequest.responseText);
                            successCallback(parsedResponse);
                        } catch (parsingError) {
                            console.error("Failed to parse JSON response:", parsingError);
                            failureCallback(parsingError);
                        }
                    } else {
                        console.warn(`Data retrieval failed with status: ${dataRequest.status} for URL: ${urlPath}`);
                        failureCallback(new Error(`HTTP Error: ${dataRequest.status}`));
                    }
                }
            };

            dataRequest.onerror = function () {
                console.error("Network error occurred during data request for URL:", urlPath);
                failureCallback(new Error("Network Error"));
            };

            // Set appropriate headers
            dataRequest.setRequestHeader("Content-Type", "application/json");
            dataRequest.setRequestHeader("X-Requested-With", "XMLHttpRequest"); // Common header for AJAX

            dataRequest.send(); // Send the request
        }

        /**
         * Helper to create a proxy object for a region, used in filter functions.
         * @param {string|number} regionIdValue - The ID of the region.
         * @param {MapDataContainer} fullGeoData - The complete geographical data.
         * @returns {BoundaryEntity} A proxy object exposing region properties and methods.
         */
        function createRegionProxy(regionIdValue, fullGeoData) {
            const regionMeta = fullGeoData.regions[regionIdValue];
            if (!regionMeta) {
                console.warn(`Region metadata not found for ID: ${regionIdValue}`);
                return null; // Or throw an error
            }
            const regionProps = regionMeta.property || {};

            return {
                osmId: String(regionIdValue),
                geoNamesId: regionProps.geoNamesId,
                iso: regionProps.iso3166,
                level: regionMeta.level,
                properties: { ...regionProps }, // Shallow copy of properties

                /**
                 * Determines which paths (ways) are shared with another region.
                 * @param {number|string} targetRegionId - The ID of the other region.
                 * @returns {Array<Array<number>>} An array of path arrays that are shared.
                 */
                findSharedPaths: function (targetRegionId) {
                    const commonWays = new Set();
                    const pathsA = fullGeoData.paths[regionIdValue];
                    const pathsB = fullGeoData.paths[targetRegionId];

                    if (!pathsA || !pathsB) {
                        return []; // No paths to compare
                    }

                    // Collect all way IDs from pathsA
                    for (const pathGroup of pathsA) {
                        const pathArray = Array.isArray(pathGroup) ? pathGroup : [pathGroup];
                        for (const wayIdRef of pathArray) {
                            commonWays.add(Math.abs(wayIdRef));
                        }
                    }

                    const sharedPathSegments = [];
                    // Check pathsB for ways present in commonWays
                    for (const pathGroup of pathsB) {
                        const pathArray = Array.isArray(pathGroup) ? pathGroup : [pathGroup];
                        let foundShared = false;
                        for (const wayIdRef of pathArray) {
                            if (commonWays.has(Math.abs(wayIdRef))) {
                                foundShared = true;
                                break;
                            }
                        }
                        if (foundShared) {
                            sharedPathSegments.push(pathArray);
                        }
                    }
                    return sharedPathSegments;
                },

                /**
                 * Checks if this region shares any boundary segment with another region.
                 * @param {number|string} otherRegionId - The ID of the other region to check against.
                 * @returns {boolean} True if a shared boundary is found, false otherwise.
                 */
                sharesBoundaryWith: function (otherRegionId) {
                    const thisRegionWaySet = new Set();
                    const thisRegionPaths = fullGeoData.paths[regionIdValue];
                    const otherRegionPaths = fullGeoData.paths[otherRegionId];

                    if (!thisRegionPaths || !otherRegionPaths) {
                        return false; // Cannot share boundary if paths are missing for either
                    }

                    // Populate set with absolute way IDs of the current region
                    for (const pathGroup of thisRegionPaths) {
                        const pathArray = Array.isArray(pathGroup) ? pathGroup : [pathGroup];
                        for (const wayRef of pathArray) {
                            thisRegionWaySet.add(Math.abs(wayRef));
                        }
                    }

                    // Check if any way from the other region exists in this region's way set
                    for (const pathGroup of otherRegionPaths) {
                        const pathArray = Array.isArray(pathGroup) ? pathGroup : [pathGroup];
                        for (const wayRef of pathArray) {
                            if (thisRegionWaySet.has(Math.abs(wayRef))) {
                                return true; // Found a shared way
                            }
                        }
                    }
                    return false; // No shared ways found
                },

                /**
                 * Checks if this region has a specific parent region in its hierarchy.
                 * @param {number|string} parentIdToCheck - The ID of the potential parent region.
                 * @returns {boolean} True if `parentIdToCheck` is a parent, false otherwise.
                 */
                isDescendantOf: function (parentIdToCheck) {
                    const parentList = regionMeta.parents;
                    if (!parentList || parentList.length === 0) {
                        return false;
                    }
                    return parentList.some(p => String(p.id) === String(parentIdToCheck));
                }
            };
        }

        /**
         * Processes raw region data to produce a GeoJSON FeatureCollection.
         * Applies filters, handles disputed borders, and recombines regions.
         * @param {MapDataContainer} rawRegionsData - The raw data containing regions, paths, and ways.
         * @param {Object} [processingOptions] - Options for processing.
         * @param {function(BoundaryEntity): boolean} [processingOptions.postFilter] - A function to filter final regions.
         * @param {Object} [processingOptions.scheme] - Custom scheme for region geometries.
         * @param {string|Object} [processingOptions.languageCode='en'] - Language code for disputed borders or custom setup.
         * @returns {Array<Object>} An array of GeoJSON Feature objects.
         */
        function processRegionDefinitions(rawRegionsData, processingOptions) {
            const opts = processingOptions || {};

            if (!rawRegionsData || !rawRegionsData.regions) {
                console.warn("Invalid or empty rawRegionsData provided.");
                return [];
            }

            const regionRecords = rawRegionsData.regions;
            const featureCollection = []; // Temporarily stores features by index
            const metaInfo = rawRegionsData.meta || {};

            // Determine the post-filter function
            let finalFilter = opts.postFilter;
            if (!finalFilter && metaInfo.postFilter) {
                try {
                    finalFilter = new Function('region', metaInfo.postFilter);
                } catch (e) {
                    console.error("Error creating postFilter function from metadata:", e);
                    finalFilter = null;
                }
            }

            // Prepare disputed borders and schemes
            const disputedBorderConfigs = metaInfo.disputedBorders || {};
            const regionSchemes = opts.scheme || metaInfo.scheme;

            // Pre-process disputed border functions for efficiency
            for (const borderKey in disputedBorderConfigs) {
                if (disputedBorderConfigs.hasOwnProperty(borderKey)) {
                    const borderSetup = disputedBorderConfigs[borderKey];
                    for (const regionIdStr in borderSetup) {
                        if (borderSetup.hasOwnProperty(regionIdStr) && typeof borderSetup[regionIdStr] === 'string') {
                            try {
                                borderSetup[regionIdStr] = new Function('region', borderSetup[regionIdStr]);
                            } catch (e) {
                                console.error(`Error compiling disputed border filter for ${borderKey}:${regionIdStr}`, e);
                                borderSetup[regionIdStr] = null; // Invalidate filter
                            }
                        }
                    }
                }
            }

            const activeDisputedBorderSet = typeof opts.languageCode === 'string'
                ? disputedBorderConfigs[opts.languageCode]
                : opts.languageCode; // Allows direct object for custom overrides

            // Iterate through all regions to build features
            for (const regionKey in regionRecords) {
                if (!regionRecords.hasOwnProperty(regionKey)) {
                    continue;
                }

                const currentRegionId = parseInt(regionKey, 10);
                const regionDetails = regionRecords[regionKey];
                const regionProxy = createRegionProxy(currentRegionId, rawRegionsData);

                if (!regionProxy) {
                    continue; // Skip if region proxy couldn't be created (e.g., missing metadata)
                }

                if (finalFilter && !finalFilter(regionProxy)) {
                    continue; // Skip region if post-filter rejects it
                }

                let regionGeometry = null;
                let recombinationQuery = null;

                // Check for disputed borders
                if (activeDisputedBorderSet && activeDisputedBorderSet[currentRegionId]) {
                    recombinationQuery = { filter: activeDisputedBorderSet[currentRegionId] };
                }
                // Check for custom schemes
                else if (regionSchemes && regionSchemes[currentRegionId]) {
                    const schemeDefinition = regionSchemes[currentRegionId];
                    recombinationQuery = {
                        filter: typeof schemeDefinition === 'string'
                            ? new Function('region', schemeDefinition)
                            : schemeDefinition
                    };
                }

                if (recombinationQuery) {
                    // Recombine regions based on the filter
                    regionGeometry = mergeRegionSegments(rawRegionsData, recombinationQuery);
                } else {
                    // Get standard geometry for the region
                    regionGeometry = retrieveBoundaryShape(currentRegionId, rawRegionsData);
                }

                if (regionGeometry) {
                    featureCollection[regionDetails.index] = {
                        type: "Feature",
                        geometry: regionGeometry,
                        properties: {
                            osmId: String(currentRegionId),
                            level: regionDetails.level,
                            attributes: regionDetails.property || {}, // Renamed 'properties' to 'attributes'
                            parentIds: regionDetails.parents ? regionDetails.parents.map(p => p.id) : [], // Simplified parents
                            displayHint: regionDetails.name, // Renamed 'hintContent'
                            displayName: regionDetails.name, // Renamed 'name'
                            pageTitle: regionDetails.name,   // Renamed 'title'
                            wikiLink: regionDetails.wikipedia, // Renamed 'wikipedia'
                            sequenceIndex: regionDetails.index, // Renamed 'orderIndex'
                            areaSquareKm: regionDetails.square // Renamed 'square'
                        }
                    };
                }
            }

            // Filter out empty slots and return the final array
            return featureCollection.filter(feature => feature !== undefined);
        }

        /**
         * Transforms the coordinates of a GeoJSON Feature from [lon, lat] to [lat, lon]
         * and adjusts the winding rule for polygons.
         * @param {Object} inputFeature - A GeoJSON Feature object with Polygon geometry.
         * @returns {Object} A new GeoJSON Feature object with transformed coordinates.
         */
        function transformFeatureCoordinates(inputFeature) {
            if (!inputFeature || !inputFeature.geometry || inputFeature.geometry.type !== 'Polygon') {
                console.warn("Invalid feature or non-Polygon geometry for coordinate transformation.");
                return inputFeature; // Return original if not applicable
            }

            const originalCoords = inputFeature.geometry.coordinates;
            const transformedCoords = reverseCoordMatrix(originalCoords);

            return {
                type: "Feature",
                geometry: {
                    type: 'Polygon',
                    // Use 'evenodd' if there are multiple rings (holes), otherwise 'nonzero'
                    windingRule: transformedCoords.length > 1 ? 'evenodd' : 'nonzero',
                    coordinates: transformedCoords
                },
                properties: { ...inputFeature.properties } // Shallow copy of properties
            };
        }

        /**
         * Filters and normalizes path segments for recombination.
         * @param {Array<number|Array<number>>} pathList - List of path definitions.
         * @returns {Array<Array<Array<number>>>} Normalized paths, each wrapped in an array.
         */
        function normalizePathSegments(pathList) {
            const normalized = [];
            for (const segment of pathList) {
                // Ensure each segment is an array of way IDs, then wrap it in another array.
                // The original code `result.push([path[i]])` suggests this structure.
                if (Array.isArray(segment)) {
                    if (segment.length > 0) { // Only add non-empty segments
                        normalized.push([segment]);
                    }
                } else if (typeof segment === 'number') {
                    normalized.push([[segment]]); // Wrap single way ID
                }
            }
            return normalized;
        }

        /**
         * Recombines multiple region paths into a single geometry based on a filter function.
         * This function is complex and aims to merge adjacent regions by finding common boundaries.
         * @param {MapDataContainer} fullGeoData - The complete geographical data.
         * @param {Object} queryOptions - Options for recombination.
         * @param {function(BoundaryEntity): (boolean|Object)} queryOptions.filter - Filter function to select regions.
         * @returns {Object|boolean} A GeoJSON-like Polygon object representing the combined region, or false if no regions match.
         */
        function mergeRegionSegments(fullGeoData, queryOptions) {
            const allRegions = fullGeoData.regions;
            const allInputPaths = fullGeoData.paths;
            const matchingRegionIds = new Set();
            let combinedPaths = [];

            if (!queryOptions || typeof queryOptions.filter !== 'function') {
                console.error("Recombination query must include a valid filter function.");
                return false;
            }

            // First pass: identify regions that match the filter and collect their paths
            for (const rId in allRegions) {
                if (allRegions.hasOwnProperty(rId)) {
                    const regionProxy = createRegionProxy(rId, fullGeoData);
                    if (!regionProxy) continue;

                    const filterResult = queryOptions.filter(regionProxy);
                    if (filterResult) {
                        matchingRegionIds.add(parseInt(rId, 10));
                        let regionSpecificPaths = allInputPaths[rId];

                        // If filter returns an object with 'path', use that specific path
                        if (typeof filterResult === 'object' && filterResult.path) {
                            regionSpecificPaths = filterResult.path;
                        }

                        if (regionSpecificPaths && regionSpecificPaths.length > 0) {
                            // Normalize and add to combinedPaths
                            combinedPaths.push(...normalizePathSegments(regionSpecificPaths));
                        }
                    }
                }
            }

            if (combinedPaths.length === 0) {
                return false; // No regions matched the filter or had valid paths
            }

            // Simplified approach to 'joinPaths' logic, focusing on unique ways
            // This part of the original logic was quite intricate and might be simplified
            // if the goal is just to combine paths without complex topological merging.
            // For a direct clone, we'd replicate the original `joinPaths` closely.
            // Let's attempt a structural change while preserving the core idea of identifying shared ways.

            const waysUsageCount = new Map(); // Map<wayId, count>
            const wayRefToPathInfo = new Map(); // Map<wayRef, { pathIndex, segmentIndex }>
            const boundarySegments = []; // Stores actual ways that form the outer boundary

            // Populate way usage and map way references to their paths
            combinedPaths.forEach((pathGroup, pathGroupIndex) => {
                const pathArray = pathGroup[0]; // Assuming normalizePathSegments makes it [[wayId, ...]]
                pathArray.forEach((wayRef, segmentIndex) => {
                    const absWayId = Math.abs(wayRef);
                    waysUsageCount.set(absWayId, (waysUsageCount.get(absWayId) || 0) + 1);
                    // Store the wayRef (positive/negative) along with its path context
                    wayRefToPathInfo.set(wayRef, { pathGroupIndex, segmentIndex });
                });
            });

            // Identify boundary ways (those used only once)
            combinedPaths.forEach(pathGroup => {
                const pathArray = pathGroup[0];
                pathArray.forEach(wayRef => {
                    const absWayId = Math.abs(wayRef);
                    if (waysUsageCount.get(absWayId) === 1) {
                        boundarySegments.push(wayRef); // These ways form the outer boundary
                    }
                });
            });

            // If no unique boundary segments, it means all paths are internal or perfectly overlapping.
            // This might indicate an issue or a fully enclosed area.
            // For now, let's just use retrieveBoundaryShape with the first path as a fallback.
            if (boundarySegments.length === 0) {
                if (combinedPaths.length > 0) {
                     // Try to get geometry from the first path, assuming it's representative
                    return retrieveBoundaryShape(combinedPaths[0][0], fullGeoData, { fixDegenerate: true });
                }
                return false;
            }

            // Now, reconstruct the boundary from `boundarySegments`.
            // This is a simplified reconstruction. A robust solution needs to connect these segments
            // into contiguous rings, handling multiple rings (holes) properly.
            // For a Type III clone, we can simplify this part if the original `joinPaths` was also
            // not a full-blown polygon union algorithm. The original 'joinPaths' was fairly complex
            // and seemed to build a connected graph of ways. Let's try to simulate that.

            const wayGraph = new Map(); // Map<wayId, { nextWayRef, prevWayRef }>
            const wayEndpoints = new Map(); // Map<wayId, { startPoint, endPoint }>

            // Pre-decode all boundary segments to get their start/end points
            boundarySegments.forEach(wayRef => {
                const absWayId = Math.abs(wayRef);
                const decodedWay = retrieveCachedOrDecodedPath(fullGeoData.ways[absWayId], absWayId, fullGeoData);
                const actualWay = wayRef < 0 ? [...decodedWay].reverse() : decodedWay;
                if (actualWay.length > 0) {
                    wayEndpoints.set(wayRef, {
                        start: actualWay[0],
                        end: actualWay[actualWay.length - 1],
                        coords: actualWay // Store full coordinates for later
                    });
                }
            });

            // Build a connectivity graph for boundary ways
            // This is a heuristic and might not produce perfectly joined polygons for all complex cases.
            // The original `joinPaths` had a more specific way of linking.
            const connectedRings = [];
            const visitedWays = new Set();

            for (const startWayRef of boundarySegments) {
                if (visitedWays.has(startWayRef)) continue;

                let currentRing = [];
                let currentWay = startWayRef;
                let currentWayInfo = wayEndpoints.get(currentWay);

                if (!currentWayInfo) continue; // Should not happen if boundarySegments are valid

                const ringStartPoint = currentWayInfo.start;
                let ringEndPoint = currentWayInfo.end;

                let loopCount = 0;
                const MAX_LOOP_ITERATIONS = boundarySegments.length * 2; // Safety break

                while (!arePointsApproximatelyEqual(ringEndPoint, ringStartPoint) && loopCount < MAX_LOOP_ITERATIONS) {
                    currentRing.push(currentWay);
                    visitedWays.add(currentWay);

                    let nextWayFound = false;
                    for (const potentialNextWayRef of boundarySegments) {
                        if (visitedWays.has(potentialNextWayRef)) continue;

                        const potentialNextWayInfo = wayEndpoints.get(potentialNextWayRef);
                        if (!potentialNextWayInfo) continue;

                        // Check if current way's end connects to potential next way's start
                        if (arePointsApproximatelyEqual(ringEndPoint, potentialNextWayInfo.start)) {
                            currentWay = potentialNextWayRef;
                            currentWayInfo = potentialNextWayInfo;
                            ringEndPoint = currentWayInfo.end;
                            nextWayFound = true;
                            break;
                        }
                        // Check if current way's end connects to potential next way's end (reversed connection)
                        else if (arePointsApproximatelyEqual(ringEndPoint, potentialNextWayInfo.end)) {
                            // Reverse the potential next way to connect
                            currentWay = -potentialNextWayRef; // Mark as reversed
                            currentWayInfo = { // Create a temporary info for the reversed way
                                start: potentialNextWayInfo.end,
                                end: potentialNextWayInfo.start,
                                coords: [...potentialNextWayInfo.coords].reverse()
                            };
                            ringEndPoint = currentWayInfo.end;
                            nextWayFound = true;
                            break;
                        }
                    }

                    if (!nextWayFound) {
                        // This path segment doesn't connect to anything else in boundarySegments.
                        // It might be a disconnected island or a broken boundary.
                        // For simplicity, we'll break and treat this as a potentially incomplete ring.
                        break;
                    }
                    loopCount++;
                }

                if (currentRing.length > 0) {
                    // Add the last way if the loop closed, or if it's the only way
                    if (!visitedWays.has(currentWay)) {
                       currentRing.push(currentWay);
                       visitedWays.add(currentWay);
                    }
                    connectedRings.push(currentRing);
                }
            }

            // Assemble coordinates from the connected rings
            const finalGeometryCoordinates = [];
            for (const ring of connectedRings) {
                let ringCoords = [];
                let currentAccumulatedPath = [];

                for (let i = 0; i < ring.length; i++) {
                    const wayRef = ring[i];
                    const absWayId = Math.abs(wayRef);
                    let decodedWay = retrieveCachedOrDecodedPath(fullGeoData.ways[absWayId], absWayId, fullGeoData);

                    if (wayRef < 0) {
                        decodedWay = [...decodedWay].reverse();
                    }

                    // Trim overlap if path is not empty
                    if (currentAccumulatedPath.length > 0) {
                         const overlap = trimOverlappingSegments(decodedWay, currentAccumulatedPath);
                         if (overlap > 0) {
                             decodedWay = decodedWay.slice(overlap);
                         }
                    }
                    currentAccumulatedPath.push(...decodedWay);
                }

                // Ensure the final ring is closed
                if (currentAccumulatedPath.length > 0 &&
                    !arePointsApproximatelyEqual(currentAccumulatedPath[0], currentAccumulatedPath[currentAccumulatedPath.length - 1])) {
                    currentAccumulatedPath.push(currentAccumulatedPath[0]);
                }

                if (currentAccumulatedPath.length > 1) { // A ring needs at least 2 distinct points (closed makes 3)
                    finalGeometryCoordinates.push(currentAccumulatedPath);
                }
            }

            if (finalGeometryCoordinates.length === 0) {
                return false; // No valid geometry could be formed
            }

            // Return a GeoJSON-like Polygon object
            return {
                type: 'Polygon',
                windingRule: finalGeometryCoordinates.length > 1 ? 'evenodd' : 'nonzero',
                coordinates: finalGeometryCoordinates
            };
        }

        // Public API of the geoBoundariesProcessor
        return {
            loadData: fetchRemoteData,
            processGeoData: processRegionDefinitions,
            getRawGeometry: retrieveBoundaryShape, // Equivalent to getGeometry without specific options
            getFixedGeometry: (regionId, data) => retrieveBoundaryShape(regionId, data, { fixDegenerate: true }),
            transformCoordsToLatLon: transformFeatureCoordinates, // Original flip functionality
            recombineRegions: mergeRegionSegments // Original recombineRegion
        };

    })();

    // Expose the library globally, potentially under a different name
    if (typeof define === 'function' && define.amd) {
        define(function () {
            return geoBoundariesProcessor;
        });
    } else if (typeof module !== 'undefined' && module.exports) {
        module.exports = geoBoundariesProcessor;
    } else {
        globalScope.geoBoundaries = geoBoundariesProcessor; // Changed global name
    }

})(this);