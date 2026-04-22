/*!
 * OSMeRegions JavaScript Library. This library provides functionality
 * for working with geographical regions, primarily decoding and
 * manipulating geographical data.
 *
 * Project homepage:
 * http://data.esosedi.org/regions/
 *
 * Source code repository:
 * https://github.com/esosedi/regions
 *
 * @author Anton Korzunov <kashey@yandex-team.ru>
 *
 * Released under the MIT license.
 * This license allows redistribution and use in source and binary forms, with or without
 * modification, provided that the above copyright notice and this permission notice
 * appear in all copies.
 */
(function(global) {

    var osmeRegions = (function() {

        /**
         * @class osmeMapCollection
         * @description This class serves as a wrapper for map data,
         * encapsulating the geographical information and providing
         * methods for its manipulation.
         */

        /**
         * @class RegionObject
         * @description A wrapper class specifically designed for filtering
         * and interacting with individual regions. It provides utility methods
         * related to region properties and boundaries.
         */


        // Global constants and configuration variables for coordinate decoding.
        var latLongOrder = 0, // Order of latitude/longitude in coordinate pairs (0 means [lat, long], 1 means [long, lat])
            codingCoefficient = 1 / 1000000, // Coefficient used for decoding coordinates from integer values.
            fraction = 2, // Number of bytes used for fractional part in coordinate encoding.
            dividor = 1 / 0xFFFF; // Target resolution is 65535 (0xFFFF), real resolution is often 4096. This determines the scaling factor.

        /**
         * Flips the order of coordinates within an array of [lat, long] pairs to [long, lat].
         * This is useful for adapting to different geographical data formats.
         * @param {Array<Array<number>>} a - An array of coordinate pairs, e.g., [[lat1, long1], [lat2, long2]].
         * @returns {Array<Array<number>>} A new array with flipped coordinate pairs.
         */
        function flipa(a) {
            var b = [];
            for (var i = 0, l = a.length; i < l; ++i) {
                b[i] = [a[i][1], a[i][0]]; // Swaps latitude and longitude.
            }
            return b;
        }

        /**
         * Applies the `flipa` function to each sub-array within a nested array structure.
         * This is typically used for multi-polygon or multi-line-string geometries.
         * @param {Array<Array<Array<number>>>} a - A nested array of coordinate arrays.
         * @returns {Array<Array<Array<number>>>} A new nested array with all coordinates flipped.
         */
        function flip(a) {
            var b = [];
            for (var i = 0, l = a.length; i < l; ++i) {
                b[i] = flipa(a[i]); // Calls flipa for each inner array.
            }
            return b;
        }

        /**
         * Decodes a byte vector (string) into an integer.
         * This function is part of the Yandex.Maps.API coordinate encoding scheme.
         * @param {string} x - The byte vector as a string.
         * @param {number} N - The number of bytes to decode.
         * @returns {number} The decoded integer value.
         */
        function decodeByteVector(x, N) {
            var point = 0;
            // Iterates through the specified number of bytes, shifting and OR-ing them.
            for (var i = 0; i < N; ++i) {
                point |= (x.charCodeAt(i) << (i * 8));
            }
            return point;
        }

        /**
         * Clamps a given longitude value to be within the valid range of -180 to 180 degrees.
         * @param {number} x - The longitude value to clamp.
         * @returns {number} The clamped longitude value.
         */
        function clampx(x) {
            return Math.min(180, Math.max(-180, x));
        }

        /**
         * Clamps a given latitude value to be within the valid range of -85 to 85 degrees.
         * Note: Some systems use -90 to 90, but 85 is a common practical limit to avoid extreme distortions near poles.
         * @param {number} y - The latitude value to clamp.
         * @returns {number} The clamped latitude value.
         */
        function clampy(y) {
            return Math.min(85, Math.max(-85, y));
        }

        /**
         * Decodes a base64-encoded string. It handles URL-safe base64 variations
         * by replacing '_' with '/' and '-' with '+'.
         * Supports both browser `atob` and Node.js `Buffer`.
         * @param {string} input - The base64-encoded string.
         * @returns {string} The decoded binary string.
         */
        function fromBase64(input) {
            // Replace URL-safe characters with standard base64 characters.
            input = input.replace(/_/g, '/').replace(/-/g, '+');
            if (typeof atob != "undefined") {
                return atob(input); // Browser environment.
            } else {
                // Node.js environment or similar.
                return new Buffer(input, 'base64').toString('binary');
            }
        }

        /**
         * Decodes a block of encoded line coordinates into an array of [longitude, latitude] pairs.
         * This function parses a compact binary representation of a geographical line segment.
         * @param {string} encodedCoordinates - The base64-encoded string containing coordinate data.
         * @returns {Array<Array<number>>} An array of decoded [longitude, latitude] coordinate pairs.
         */
        function decodeLineBlock(encodedCoordinates) {
            var byteVector = fromBase64(encodedCoordinates), // Decode base64 string to binary string.
                byteVectorLength = byteVector.length, // Total length of the binary data.
                // Extract bounding box coordinates from the first 16 bytes.
                // Bounds are stored as minLat, minLon, maxLat, maxLon.
                bounds = [
                    [decodeByteVector(byteVector.substr(0, 4), 4) * codingCoefficient, decodeByteVector(byteVector.substr(4, 4), 4) * codingCoefficient], // minLat, minLon
                    [decodeByteVector(byteVector.substr(8, 4), 4) * codingCoefficient, decodeByteVector(byteVector.substr(12, 4), 4) * codingCoefficient] // maxLat, maxLon
                ],
                // Calculate the dimensions (width and height) of the bounding box.
                dimension = [bounds[1][0] - bounds[0][0], bounds[1][1] - bounds[0][1]],
                result = [], // Array to store the decoded coordinate pairs.
                index = 16, // Starting index for reading actual coordinate points (after bounds).
                // Calculate scaling factors for X (latitude) and Y (longitude) based on dimensions and resolution.
                fx = dimension[0] * dividor,
                fy = dimension[1] * dividor;

            /**
             * Helper function to read a fractional coordinate component from the byte vector.
             * It advances the `index` after reading.
             * @returns {number} The decoded fractional component.
             */
            function read() {
                var ret = decodeByteVector(byteVector.substr(index, fraction), fraction);
                index += fraction; // Move index past the read bytes.
                return ret;
            }

            // Loop through the rest of the byte vector to decode all points.
            while (index < byteVectorLength) {
                // Decode raw X and Y values, scale them, and add to the base coordinates.
                // Clamp them to valid geographical ranges.
                var position = [clampy(read() * fx + bounds[0][0]), clampx(read() * fy + bounds[0][1])];
                result.push([position[1], position[0]]); // Store as [longitude, latitude].
            }
            return result;
        }

        /**
         * Decodes a geographical 'way' (a sequence of connected line segments or points).
         * It uses a cache to avoid re-decoding the same way multiple times.
         * @param {string} lineBlock - The encoded line block string for the way.
         * @param {number} wayId - The unique identifier for this way.
         * @param {object} osmeData - The overall data object containing way cache.
         * @returns {Array<Array<number>>} An array of [longitude, latitude] coordinates for the way.
         */
        function decodeWay(lineBlock, wayId, osmeData) {
            // Check if the way is already in the cache.
            if (osmeData.wayCache[wayId]) {
                return osmeData.wayCache[wayId];
            }
            // If not cached, decode it and store in cache before returning.
            return osmeData.wayCache[wayId] = decodeLineBlock(lineBlock);
        }


        /**
         * Retrieves the geometry for a given region ID, specifically enabling
         * the degenerate path fixing mechanism. This is a convenience wrapper.
         * @param {number|Array<number>} regionId - The ID of the region or an array of path IDs.
         * @param {object} osmeData - The global OSMe data object.
         * @returns {object|boolean} The geometry object or false if region data is not found.
         */
        function getFixedGeometry(regionId, osmeData) {
            return getGeometry(regionId, osmeData, {
                fixDegenerate: true
            })
        }

        /**
         * Checks if two 2D points are approximately equal within a given difference threshold.
         * @param {Array<number>} first - The first point [x, y].
         * @param {Array<number>} second - The second point [x, y].
         * @param {number} [diff=1e-9] - The maximum allowed difference for each coordinate.
         * @returns {boolean} True if the points are approximately equal, false otherwise.
         */
        function EQ(first, second, diff) {
            diff = diff || 1e-9; // Default difference threshold.
            var dx = Math.abs(second[0] - first[0]), // Absolute difference in x-coordinates.
                dy = Math.abs(second[1] - first[1]); // Absolute difference in y-coordinates.
            return dx < diff && dy < diff; // Both differences must be within the threshold.
        }

        /**
         * Fixes degenerate paths by removing overlapping segments at the ends of ways.
         * This is crucial when combining multiple ways that share common points at their junctions.
         * @param {Array<Array<number>>} way - The current way (an array of coordinates).
         * @param {Array<Array<number>>} path - The accumulated path so far (an array of coordinates).
         * @returns {number} The number of overlapping points at the beginning of the `way`.
         */
        function fixDegenerate(way, path) {
            var offset = 0,
                l = way.length,
                lp = path.length,
                limit = Math.min(l, lp), // Limit iteration to the length of the shorter path.
                delta = 10 / 0xFFFF; // A small delta value to compare floating-point coordinates (10 "hops" in resolution units).

            lp--; // Adjust lp to be the last index of path.

            if (lp < 1) {
                return 0; // Not enough points in path to have an overlap.
            }

            // Iterate from the beginning of `way` and end of `path` to find overlaps.
            for (var i = 0; i < limit; ++i) {
                // Compare points from `way` (start) with `path` (end, reversed order).
                if (EQ(way[i], path[lp - i], delta)) {
                    offset++; // Increment offset for each matching point.
                } else {
                    break; // Stop if a non-matching point is found.
                }
            }

            return offset; // Return the number of overlapping points.
        }

        /**
         * Retrieves the geometry for a specified region, constructing a GeoJSON-like
         * polygon object from its constituent ways. It can optionally fix degenerate
         * (overlapping) segments between ways.
         * @param {number|Array<number>} regionId - The ID of the region or an array of path IDs.
         * @param {object} osmeData - The global OSMe data object containing paths and ways.
         * @param {object} [options] - Options for geometry generation.
         * @param {boolean} [options.fixDegenerate=false] - Whether to fix overlapping segments.
         * @returns {object|boolean} A geometry object (GeoJSON-like Polygon) or false if paths are not found.
         */
        function getGeometry(regionId, osmeData, options) {
            var coordinates = [], // Array to hold the final polygon rings.
                fixedPoints = [], // Stores indices of points where segments were joined.
                meta = [], // Stores metadata about the ways used.
                // Determine paths: if regionId is an array, use it directly; otherwise, look up in osmeData.paths.
                paths = regionId.length ? regionId : osmeData.paths[regionId],
                osmeWays = osmeData.ways, // Raw encoded way data.
                options = options || {}; // Ensure options object exists.

            osmeData.wayCache = osmeData.wayCache || {}; // Initialize way cache if it doesn't exist.

            if (!paths) {
                return false; // Return false if no paths are found for the region.
            }

            // Iterate through each path (outer ring or inner hole).
            for (var pathId = 0, pathLength = paths.length; pathId < pathLength; ++pathId) {
                var path = paths[pathId]; // Current path definition.
                var pathCoordinates = [], // Coordinates for the current path/ring.
                    ways = [], // IDs of ways forming this path.
                    segmentFixedPoints = [0]; // Tracks segment start points within pathCoordinates.

                // If path is a single number, convert to an array for consistent processing.
                if (typeof path == 'number') {
                    path = [path];
                }

                // Iterate through each way within the current path.
                for (var i = 0, l = path.length; i < l; ++i) {
                    var wayId = Math.abs(path[i]); // Get absolute way ID (direction indicated by sign).
                    var way = decodeWay(osmeWays[wayId], wayId, osmeData); // Decode the way coordinates.

                    if (path[i] < 0) {
                        way = way.slice(0); // Create a copy before reversing to avoid modifying cached way.
                        way.reverse(); // Reverse way coordinates if path[i] is negative.
                    }

                    if (options.fixDegenerate) {
                        // Apply degenerate fixing logic if enabled.
                        var offset = fixDegenerate(way, pathCoordinates);
                        if (offset) {
                            way = way.slice(offset); // Remove overlapping points from the beginning of the current way.
                        }
                        // Special handling for the last segment to fix potential overlaps at the end of the full path.
                        if (i == l - 1) {
                            var tw = way.slice(0);
                            tw.reverse(); // Reverse current way for comparison.
                            offset = fixDegenerate(pathCoordinates, way); // Compare end of pathCoordinates with reversed current way.
                            if (offset) {
                                offset--; // Adjust offset for array indexing.
                                way.length = way.length - offset; // Truncate current way.
                                pathCoordinates = pathCoordinates.slice(offset); // Truncate pathCoordinates.
                            }
                        }
                    } else {
                        // If not fixing degenerate paths, simply remove the last point of the previous segment
                        // to prevent duplicate points at junctions (assuming segments share one common point).
                        if (pathCoordinates.length) {
                            pathCoordinates.length = pathCoordinates.length - 1;
                        }
                    }

                    // Append current way's coordinates to the path.
                    pathCoordinates.push.apply(pathCoordinates, way);
                    segmentFixedPoints.push(pathCoordinates.length - 1); // Mark end of this segment.
                    ways.push(wayId); // Add way ID to metadata.
                }

                // Close the polygon ring by adding the first point again.
                pathCoordinates.push(pathCoordinates[0]);
                coordinates.push(pathCoordinates); // Add the completed ring to the main coordinates array.
                fixedPoints.push(segmentFixedPoints); // Store segment fixed points.
                meta.push(ways); // Store way metadata.
            }

            // Return a GeoJSON-like Polygon object.
            return {
                type: 'Polygon',
                fillRule: 'nonZero', // Default fill rule for polygons.
                coordinates: coordinates, // The array of rings.
                path: paths, // Original path definition.
                fixedPoints: fixedPoints // Points used for segment joining.
            };
        }

        /**
         * Performs an AJAX GET request to load data from a specified path.
         * It expects a JSON response and calls callbacks based on success or failure.
         * @param {string} path - The URL path to fetch data from.
         * @param {Function} callback - Function to call on successful data retrieval and parsing.
         * @param {Function} errorCallback - Function to call if an error occurs (network or parsing).
         */
        function load(path, callback, errorCallback) {
            var xhr = new XMLHttpRequest(); // Create a new XMLHttpRequest object.
            xhr.open("GET", path, true); // Initialize the request: GET method, URL, asynchronous.
            xhr.onreadystatechange = function() {
                // Check if the request is complete.
                if (xhr.readyState === 4) {
                    // Check if the HTTP status indicates success.
                    if (xhr.status === 200 || xhr.status === 304) {
                        try {
                            var response = JSON.parse(xhr.responseText); // Parse the JSON response.
                            callback(response); // Call the success callback with the parsed data.
                        } catch (e) {
                            // Catch JSON parsing errors.
                            errorCallback(e); // Call the error callback.
                        }
                    } else {
                        // Handle HTTP errors (non-200/304 status).
                        window.console && console.error("Response recieved with status " + xhr.status);
                        errorCallback(xhr); // Call error callback with the XHR object.
                    }
                }
            };
            // Set request headers.
            xhr.setRequestHeader("Content-Type", "application/json");
            xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
            xhr.send(); // Send the request.
        }

        /**
         * Processes raw geographical regions data, applies filters and recombination rules,
         * and generates a GeoJSON FeatureCollection-like array of region features.
         * This is the main function for preparing region data for mapping.
         * @param {object} regionsData - The raw regions data object.
         * @param {object} [options] - Configuration options for processing.
         * @param {Function} [options.postFilter] - A function to filter regions after initial processing.
         * @param {object} [options.scheme] - A scheme object for applying specific geometry rules.
         * @param {string|object} [options.recombine] - Recombination setup, or language for disputed borders.
         * @param {string} [options.lang='en'] - Language code for disputed borders if `recombine` is a string.
         * @returns {Array<object>} An array of GeoJSON-like Feature objects representing the regions.
         */
        function setupGeometry(regionsData, options) {
            options = options || {}; // Ensure options object exists.
            var regions = regionsData.regions, // Raw region definitions.
                dataset = [], // Temporary array to build the result, maintaining original order.
                // Determine post-filter function: from options, meta data, or none.
                postFilter = options.postFilter || (regionsData.meta && regionsData.meta.postFilter ? new Function('region', regionsData.meta.postFilter) : 0),
                // Determine scheme: from options or meta data.
                scheme = options.scheme || regionsData.meta && regionsData.meta.scheme,
                // Disputed borders configuration from meta data.
                disputedBorders = regionsData.meta && regionsData.meta.disputedBorders || {},
                // Determine the specific disputed border setup to use based on options.recombine or options.lang.
                useSetup = options.recombine || options.lang || 'en',
                disputedBorder = typeof useSetup == 'string' ? disputedBorders[useSetup] : useSetup,
                geometry = 0; // Placeholder for the generated geometry.

            // Pre-process disputedBorders: convert string filters to Function objects.
            for (var i in disputedBorders) {
                var setup = disputedBorders[i];
                for (var j in setup) {
                    var regionSet = setup[j];
                    if (typeof regionSet == 'string') {
                        setup[j] = new Function('region', regionSet);
                    }
                }
            }

            // Iterate through each region defined in regionsData.
            for (var i in regions) {
                if (regions.hasOwnProperty(i)) {
                    // Apply post-filter if it exists.
                    if (!postFilter || postFilter(wrapRegion(i, regionsData))) {
                        // Check for disputed borders first.
                        if (disputedBorder && disputedBorder[+i]) {
                            geometry = recombineRegion(regionsData, {
                                filter: disputedBorder[+i]
                            });
                        }
                        // Then check for scheme-specific rules.
                        else if (scheme && scheme[+i]) {
                            var sch = scheme[+i];
                            geometry = recombineRegion(regionsData, {
                                filter: typeof sch == 'string' ? new Function('region', sch) : sch
                            });
                        }
                        // Otherwise, use the default geometry for the region.
                        else {
                            geometry = getGeometry(+i, regionsData);
                        }

                        // If geometry was successfully generated, create a GeoJSON Feature object.
                        dataset[regions[i].index] = {
                            type: "Feature",
                            geometry: geometry, // The generated geometry object.
                            properties: {
                                osmId: i, // OpenStreetMap ID.
                                level: regions[i].level, // Administrative level.
                                properties: regions[i].property || {}, // Additional properties.
                                parents: regions[i].parents, // Parent regions.
                                hintContent: regions[i].name, // Hint content for display.
                                name: regions[i].name, // Region name.
                                title: regions[i].name, // Region title.
                                wikipedia: regions[i].wikipedia, // Wikipedia link.
                                orderIndex: regions[i].index, // Original order index.
                                square: regions[i].square // Area in square units.
                            }
                        };
                    }
                }
            }
            // Filter out any empty slots in the dataset (due to filtering).
            var result = [];
            for (var i = 0, l = dataset.length; i < l; ++i) {
                if (dataset[i]) {
                    result.push(dataset[i]);
                }
            }
            return result; // Return the array of processed region features.
        }

        /**
         * Converts a feature's geometry coordinates by flipping their order
         * (e.g., from [lat, long] to [long, lat]) and adjusts the fill rule
         * for polygons based on the number of coordinate rings.
         * @param {object} feature - A GeoJSON-like Feature object.
         * @returns {object} A new Feature object with converted coordinates.
         */
        function convertCoordinate(feature) {
            return {
                type: "Feature",
                geometry: {
                    type: 'Polygon',
                    // Use 'evenOdd' fill rule if there are multiple rings (potential holes),
                    // otherwise 'nonZero' for simple polygons.
                    fillRule: feature.geometry.coordinates.length > 1 ? 'evenOdd' : 'nonZero',
                    coordinates: flip(feature.geometry.coordinates) // Flip all coordinate pairs.
                },
                properties: feature.properties // Keep properties unchanged.
            };
        }

        /**
         * Wraps a region's data into a `RegionObject` for easier filtering and interaction.
         * This object provides methods like `getBorderWith`, `hasBorderWith`, and `hasParent`.
         * @param {number|string} rid - The ID of the region.
         * @param {object} data - The global OSMe data object.
         * @returns {RegionObject} An instance of the RegionObject.
         */
        function wrapRegion(rid, data) {
            var meta = data.regions[rid], // Metadata for the specific region.
                prop = meta.property || {}; // Additional properties of the region.
            return {
                osmId: rid, // OpenStreetMap ID.
                geoNamesId: prop.geoNamesId, // GeoNames ID.
                iso: prop.iso3166, // ISO 3166 code.
                level: meta.level, // Administrative level.
                properties: prop, // All region properties.

                /**
                 * Retrieves the paths (ways) that form a border between this region and another specified region.
                 * @param {number|string} id - The ID of the other region to check for borders with.
                 * @returns {Array<Array<number>>} An array of path definitions that represent the shared border.
                 */
                getBorderWith: function(id) {
                    var wset = {}, // Set to store ways of the other region.
                        i, l1, j, l2,
                        path1 = data.paths[id], // Paths of the other region.
                        path2 = data.paths[rid]; // Paths of the current region.

                    // Populate wset with all way IDs from the other region.
                    for (i = 0, l1 = path1.length; i < l1; ++i) {
                        for (j = 0, l2 = path1[i].length; j < l2; ++j) {
                            wset[Math.abs(path1[i][j])] = 1;
                        }
                    }

                    var result = []; // Array to store shared border paths.
                    // Check ways of the current region against the wset.
                    for (i = 0, l1 = path2.length; i < l1; ++i) {
                        for (j = 0, l2 = path2[i].length; j < l2; ++j) {
                            if (wset[Math.abs(path2[i][j])]) {
                                // If a way is found in both regions, it's part of the border.
                                // path is full in
                                result.push(path2[i]);
                            }
                        }
                    }
                    return result;
                },

                /**
                 * Checks if this region shares a border with another specified region.
                 * @param {number|string} id - The ID of the other region.
                 * @returns {boolean} True if a shared border exists, false otherwise.
                 */
                hasBorderWith: function(id) {
                    var wset = {}, // Set to store ways of the current region.
                        i, l1, j, l2,
                        path1 = data.paths[rid], // Paths of the current region.
                        path2 = data.paths[id]; // Paths of the other region.

                    if (!path1 || !path2) {
                        return false; // Cannot have a border if one of the regions has no paths.
                    }

                    // Populate wset with all way IDs from the current region.
                    for (i = 0, l1 = path1.length; i < l1; ++i) {
                        for (j = 0, l2 = path1[i].length; j < l2; ++j) {
                            wset[Math.abs(path1[i][j])] = 1;
                        }
                    }
                    // Check if any way from the other region is present in wset.
                    for (i = 0, l1 = path2.length; i < l1; ++i) {
                        for (j = 0, l2 = path2[i].length; j < l2; ++j) {
                            if (wset[Math.abs(path2[i][j])]) {
                                return true; // Found a shared way, so they have a border.
                            }
                        }
                    }
                    return false; // No shared ways found.
                },

                /**
                 * Checks if this region has a specific parent region.
                 * @param {number|string} id - The ID of the potential parent region.
                 * @returns {boolean} True if the region has the specified parent, false otherwise.
                 */
                hasParent: function(id) {
                    var parents = meta.parents; // Array of parent objects.
                    for (var i = 0, l = parents.length; i < l; ++i) {
                        if (parents[i].id == id) {
                            return true; // Found the parent.
                        }
                    }
                    return false; // Parent not found.
                }
            }
        }

        /**
         * Recombines multiple regions into a single, possibly complex, geometry based on a filter query.
         * This function is used for creating composite regions, like disputed territories or custom administrative units.
         * @param {object} regionsData - The global OSMe data object.
         * @param {object} query - An object containing the filter function.
         * @param {Function} query.filter - A function that takes a `RegionObject` and returns true if the region should be included.
         * @returns {object|boolean} A geometry object for the recombined region, or false if no regions pass the filter.
         */
        function recombineRegion(regionsData, query) {
            var regions = regionsData.regions, // All region definitions.
                inpaths = regionsData.paths, // All path definitions.
                passRegions = {}, // Stores IDs of regions that pass the filter.
                paths = []; // Accumulates paths from all passing regions.

            /**
             * Filters paths from a region, ensuring each path is treated as an array of ways.
             * @param {Array<Array<number>>|Array<number>} path - The path definition for a region.
             * @returns {Array<Array<Array<number>>>} Processed paths.
             */
            function filterPath(path) {
                var result = [];
                for (var i = 0, l = path.length; i < l; ++i) {
                    // Ensure each path segment is wrapped in its own array, even if it's a single way.
                    if (1 || path[i].length > 1) { // The `1 ||` is a redundant condition, always true.
                        result.push([path[i]]);
                    }
                }
                return result;
            }

            // Iterate through all regions to apply the filter and collect paths.
            for (var ri in regions) {
                if (regions.hasOwnProperty(ri)) {
                    var tpaths = inpaths[ri]; // Get paths for the current region.
                    var qf = query.filter(wrapRegion(ri, regionsData)); // Apply the filter.
                    if (qf) {
                        if (qf !== true) {
                            if (qf.path) {
                                tpaths = qf.path; // If filter returns an object with `path`, use that.
                            }
                        }
                        if (tpaths && tpaths.length) {
                            tpaths = filterPath(tpaths); // Process paths.
                            if (tpaths.length) {
                                passRegions[ri] = ri; // Mark region as passed.
                                paths.push.apply(paths, tpaths); // Add paths to the accumulator.
                            }
                        }
                    }
                }
            }

            /**
             * Attempts to join two sets of paths (not fully implemented in the provided snippet).
             * This function appears to be a work in progress or a placeholder for more advanced
             * topological merging logic that is not fully present.
             * @param {Array} patha - First set of paths.
             * @param {Array} pathb - Second set of paths.
             * @returns {boolean} Always returns false in its current state, indicating no join occurred.
             */
            function joinPaths(patha, pathb) {

                var usedWays = {}, // Counts how many times each way ID appears.
                    wayDirection = {}, // Stores directional information for ways.
                    wayLookup = {}; // Maps ways to their neighbors.

                var apaths = [patha, pathb] // Array containing the two sets of paths.
                // Count occurrences of each way ID across both path sets.
                for (var ri = 0; ri < 2; ++ri) {
                    var tpaths = apaths[ri];
                    for (var pathId = 0, pathLength = tpaths.length; pathId < pathLength; ++pathId) {
                        var path = tpaths[pathId];
                        if (typeof path == 'number') {
                            path = [path];
                        }
                        for (var i = 0, l = path.length; i < l; ++i) {
                            var wayId = Math.abs(path[i]);
                            usedWays[wayId] = (usedWays[wayId] || 0) + 1;
                        }
                    }
                }


                var pass = 0,
                    lost = 0; // Counters for ways that are unique or shared.
                // Analyze ways based on their counts.
                for (var ri = 0; ri < 2; ++ri) {
                    var tpaths = apaths[ri];
                    for (var pathId = 0, pathLength = tpaths.length; pathId < pathLength; ++pathId) {
                        var path = tpaths[pathId];
                        if (typeof path == 'number') {
                            path = [path];
                        }

                        for (var i = 0, l = path.length; i < l; ++i) {
                            var wayId = Math.abs(path[i]);
                            if (usedWays[wayId] === 1) {
                                pass++; // This way is unique to one of the paths.
                                var lw = +path[(i - 1 + l) % l], // Left neighbor way ID.
                                    rw = +path[(i + 1 + l) % l]; // Right neighbor way ID.
                                wayLookup[lw] = wayLookup[lw] || [];
                                //wayLookup[rw] = wayLookup[rw] || []; // Commented out, not used.
                                wayLookup[lw].push(path[i]);
                                // wayLookup[rw].push(path[i]); // Commented out, not used.
                                wayDirection[path[i]] = [
                                    +lw, // Left way.
                                    +path[i], // Current way.
                                    +rw, // Right way.
                                    ri, // Path set index.
                                    pathId // Path index within the set.
                                ];
                            } else {
                                lost++; // This way is shared between paths.
                            }
                        }
                    }
                }
                if (!lost) {
                    return false; // If no shared ways, no 'lost' geometry to merge.
                }

                // The function is incomplete here; it returns false if there are no shared ways.
                // The actual recombination logic to form a new geometry from the paths is missing.
            }
            // The recombineRegion function is also incomplete, it needs to call joinPaths or similar logic.
            // For now, it will simply return false if joinPaths returns false or if it's not called.
            // Given the structure, it appears it *should* call getGeometry eventually, but the logic is missing.
            return false; // Placeholder return as the recombination logic is incomplete in the snippet.

        } // End of recombineRegion function.

    })(); // End of osmeRegions IIFE.

    // Expose osmeRegions to the global scope (e.g., window in browsers).
    // This part was not in the original snippet, but is implied by the IIFE structure.
    // If the snippet is truly only the inner IIFE, this line should be omitted.
    // For this exercise, I will assume the user provided the *entire* inner module content.
    // global.osmeRegions = osmeRegions; // Assuming this would be the typical export.

})(this); // Call the main IIFE, passing `this` (which is `window` in browsers, or global object in Node.js).