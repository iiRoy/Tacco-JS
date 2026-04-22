/*
 * Geodata Processing Utility
 * https://spatial-data.org/geodata-utils/
 * https://github.com/geodata-utils/processing
 *
 * @creator Adrian K. (adrian.k@example.com)
 * Provided under the MIT license
 */
(function (applicationScope) {

    var geoProcessor = (function () {

        /**
         * Container for spatial information
         * @name GeoFeatureCollection
         * @class
         */

        /**
         * Helper for filtering geographic areas
         * @name GeographicArea
         * @class
         */


        var coordinateOrdering = 0,
            scalingFactor = 1 / 1000000,
            segmentPrecision = 2,
            scalingDivisor = 1 / 0xFFFF; // Target resolution 65k, actual 4k

        function reverseCoords (coordList) {
            var reversedList = [];
            for (var idx = 0, len = coordList.length; idx < len; ++idx) {
                reversedList[idx] = [coordList[idx][1], coordList[idx][0]];
            }
            return reversedList;
        }

        function reverseNestedCoords (nestedList) {
            var finalReversedList = [];
            for (var idx = 0, len = nestedList.length; idx < len; ++idx) {
                finalReversedList[idx] = reverseCoords(nestedList[idx]);
            }
            return finalReversedList;
        }

        /**
         * decodeNumericSequence
         * Part of Yandex.Maps.API
         */
        function decodeBinaryChunk (inputSeq, count) {
            var numericVal = 0;
            for (var i = 0; i < count; ++i) {
                numericVal |= (inputSeq.charCodeAt(i) << (i * 8));
            }
            return numericVal;
        }

        function restrictLongitude (valueX) {
            return Math.min(180, Math.max(-180, valueX));
        }

        function restrictLatitude (valueY) {
            return Math.min(85, Math.max(-85, valueY));
        }

        function decodeBase64String (base64Input) {
            base64Input = base64Input.replace(/_/g, '/').replace(/-/g, '+');
            if (typeof atob !== "undefined") {
                return atob(base64Input);
            } else {
                // Node.js environment or similar
                return new Buffer(base64Input, 'base64').toString('binary');
            }
        }

        function parseSegmentData (encodedSegment) {
            var rawByteData = decodeBase64String(encodedSegment),
                rawDataLength = rawByteData.length,
                boundaryLimits = [
                    [decodeBinaryChunk(rawByteData.substr(0, 4), 4) * scalingFactor, decodeBinaryChunk(rawByteData.substr(4, 4), 4) * scalingFactor],
                    [decodeBinaryChunk(rawByteData.substr(8, 4), 4) * scalingFactor, decodeBinaryChunk(rawByteData.substr(12, 4), 4) * scalingFactor]
                ],
                extentDimensions = [boundaryLimits[1][0] - boundaryLimits[0][0], boundaryLimits[1][1] - boundaryLimits[0][1]],
                outputCoordinates = [],
                currentOffset = 16,
                xScale = extentDimensions[0] * scalingDivisor,
                yScale = extentDimensions[1] * scalingDivisor;

            function extractNumericSegment () {
                var extractedValue = decodeBinaryChunk(rawByteData.substr(currentOffset, segmentPrecision), segmentPrecision);
                currentOffset += segmentPrecision;
                return extractedValue;
            }

            while (currentOffset < rawDataLength) {
                var currentPoint = [restrictLatitude(extractNumericSegment() * xScale + boundaryLimits[0][0]), restrictLongitude(extractNumericSegment() * yScale + boundaryLimits[0][1])];
                outputCoordinates.push([currentPoint[1], currentPoint[0]]);
            }
            return outputCoordinates;
        }

        function retrievePathSegment (encodedSegmentData, segmentId, geoDataSource) {
            if (geoDataSource.segmentCache[segmentId]) {
                return geoDataSource.segmentCache[segmentId];
            }
            return geoDataSource.segmentCache[segmentId] = parseSegmentData(encodedSegmentData);
        }


        function fetchAdjustedBoundary (regionKey, geoDataSource) {
            return getBoundaryData(regionKey, geoDataSource, {adjustEnds: true})
        }

        function arePointsEqual (pt1, pt2, errorMargin) {
            errorMargin = errorMargin || 1e-9;
            var deltaX = Math.abs(pt2[0] - pt1[0]),
                deltaY = Math.abs(pt2[1] - pt1[1]);
            return deltaX < errorMargin && deltaY < errorMargin;
        }

        function handleOverlap (pathSegment, coordinateSequence) {
            var overlapCount = 0,
                segmentLen = pathSegment.length,
                sequenceLen = coordinateSequence.length,
                comparisonLimit = Math.min(segmentLen, sequenceLen),
                toleranceThreshold = 10 / 0xFFFF; // 10 units of resolution difference
            sequenceLen--;
            if (sequenceLen < 1) {
                return 0;
            }

            for (var i = 0; i < comparisonLimit; ++i) {
                if (arePointsEqual(pathSegment[i], coordinateSequence[sequenceLen - i], toleranceThreshold)) {
                    overlapCount++;
                } else {
                    break;
                }
            }

            return overlapCount;
        }

        function getBoundaryData (regionKey, geoDataSource, processingOptions) {
            var polygonCoords = [],
                segmentBreakpoints = [],
                segmentInfo = [],
                regionBoundaryPaths = regionKey.length ? regionKey : geoDataSource.paths[regionKey],
                sourceSegments = geoDataSource.ways,
                processingOptions = processingOptions || {};

            geoDataSource.segmentCache = geoDataSource.segmentCache || {};

            if (!regionBoundaryPaths) {
                return false;
            }
            for (var pathIndex = 0, totalPaths = regionBoundaryPaths.length; pathIndex < totalPaths; ++pathIndex) {
                var currentPath = regionBoundaryPaths[pathIndex];
                var currentPathCoords = [],
                    pathSegments = [],
                    currentSegmentBreakpoints = [0];
                if (typeof currentPath == 'number') {
                    currentPath = [currentPath];
                }
                for (var j = 0, segmentCount = currentPath.length; j < segmentCount; ++j) {
                    var segmentIdent = Math.abs(currentPath[j]);
                    var segmentData = retrievePathSegment(sourceSegments[segmentIdent], segmentIdent, geoDataSource);
                    if (currentPath[j] < 0) {
                        segmentData = segmentData.slice(0);
                        segmentData.reverse();
                    }
                    if (processingOptions.adjustEnds) {
                        var overlapAmount = handleOverlap(segmentData, currentPathCoords);
                        if (overlapAmount) {
                            segmentData = segmentData.slice(overlapAmount);
                        }
                        if (j == segmentCount - 1) {
                            var reversedSegment = segmentData.slice(0);
                            reversedSegment.reverse();
                            overlapAmount = handleOverlap(currentPathCoords, segmentData);
                            if (overlapAmount) {
                                overlapAmount--;
                                segmentData.length = segmentData.length - overlapAmount;
                                currentPathCoords = currentPathCoords.slice(overlapAmount);
                            }
                        }
                    } else {
                        // Remove last point if paths connect to prevent duplicate points
                        if (currentPathCoords.length) {
                            currentPathCoords.length = currentPathCoords.length - 1;
                        }
                    }

                    currentPathCoords.push.apply(currentPathCoords, segmentData);
                    currentSegmentBreakpoints.push(currentPathCoords.length - 1);
                    pathSegments.push(segmentIdent);
                }
                currentPathCoords.push(currentPathCoords[0]); // Close the polygon
                polygonCoords.push(currentPathCoords);
                segmentBreakpoints.push(currentSegmentBreakpoints);
                segmentInfo.push(pathSegments);
            }

            return {
                type: 'Polygon',
                windingRule: 'nonZero',
                coordinates: polygonCoords,
                boundaryPath: regionBoundaryPaths,
                boundaryBreakpoints: segmentBreakpoints
            };
        }

        /**
         * Standard XHR data retrieval
         * @param {String} resourceURL
         * @param {Function} successCallback
         * @param {Function) failureCallback
        */
        function fetchData (resourceURL, successCallback, failureCallback) {
            var httpRequest = new XMLHttpRequest();
            httpRequest.open("GET", resourceURL, true);
            httpRequest.onreadystatechange = function () {
                if (httpRequest.readyState === 4) {
                    if (httpRequest.status === 200 || httpRequest.status === 304) {
                        try {
                            var serverResponse = JSON.parse(httpRequest.responseText);
                            successCallback(serverResponse);
                        } catch (parsingError) {
                            failureCallback(parsingError);
                        }
                    } else {
                        // Log error to console if available
                        window.console && console.error("Server response received with status " + httpRequest.status);
                        failureCallback(httpRequest);
                    }
                }
            };
            httpRequest.setRequestHeader("Content-Type", "application/json");
            httpRequest.setRequestHeader("X-Requested-With", "XMLHttpRequest");
            httpRequest.send();
        }

        /**
         * Main processing function for geographic data
         * @param inputRegionData
         * @param processingOptions
         * @returns {Array}
         */
        function processGeometries (inputRegionData, processingOptions) {
            processingOptions = processingOptions || {};
            var regionDetails = inputRegionData.regions,
                featureCollection = [],
                regionFilterFunc = processingOptions.postFilter || (inputRegionData.meta && inputRegionData.meta.postFilter ? new Function('area', inputRegionData.meta.postFilter) : 0),
                boundaryScheme = processingOptions.scheme || inputRegionData.meta && inputRegionData.meta.scheme,
                contentiousBoundaries = inputRegionData.meta && inputRegionData.meta.disputedBorders || {},
                configKey = processingOptions.recombine || processingOptions.lang || 'en',
                activeBoundaryConfig = typeof configKey == 'string' ? contentiousBoundaries[configKey] : configKey,
                spatialData = 0;

            for (var disputeId in contentiousBoundaries) {
                var disputeSetup = contentiousBoundaries[disputeId];
                for (var configItem in disputeSetup) {
                    var regionConfig = disputeSetup[configItem];
                    if (typeof regionConfig == 'string') {
                        disputeSetup[configItem] = new Function('area', regionConfig);
                    }
                }
            }

            for (var regionId in regionDetails) {
                if (regionDetails.hasOwnProperty(regionId)) {
                    if (!regionFilterFunc || regionFilterFunc(createRegionWrapper(regionId, inputRegionData))) {
                        if (activeBoundaryConfig && activeBoundaryConfig[+regionId]) {
                            spatialData = combineRegions(inputRegionData, {
                                filter: activeBoundaryConfig[+regionId]
                            });
                        } else if (boundaryScheme && boundaryScheme[+regionId]) {
                            var schemeEntry = boundaryScheme[+regionId];
                            spatialData = combineRegions(inputRegionData, {
                                filter: typeof schemeEntry == 'string' ? new Function('area', schemeEntry) : schemeEntry
                            });
                        } else {
                            spatialData = getBoundaryData(+regionId, inputRegionData);
                        }

                        featureCollection[regionDetails[regionId].index] = {
                            type: "Feature",
                            geometry: spatialData,
                            properties: {
                                osmIdentifier: regionId,
                                hierarchyLevel: regionDetails[regionId].level,
                                attributes: regionDetails[regionId].property || {},
                                parentRegions: regionDetails[regionId].parents,
                                displayHint: regionDetails[regionId].name,
                                regionName: regionDetails[regionId].name,
                                regionTitle: regionDetails[regionId].name,
                                wikipediaLink: regionDetails[regionId].wikipedia,
                                sortOrder: regionDetails[regionId].index,
                                areaSquare: regionDetails[regionId].square
                            }
                        };
                    }
                }
            }
            var finalResult = [];
            for (var i = 0, totalFeatures = featureCollection.length; i < totalFeatures; ++i) {
                if (featureCollection[i]) {
                    finalResult.push(featureCollection[i]);
                }
            }
            return finalResult;
        }

        function transformFeatureCoordinates (geoFeature) {
            return {
                type: "Feature",
                geometry: {
                    type: 'Polygon',
                    windingRule: geoFeature.geometry.coordinates.length > 1 ? 'evenOdd' : 'nonZero',
                    coordinates: reverseNestedCoords(geoFeature.geometry.coordinates)
                },
                properties: geoFeature.properties
            };
        }

        /**
         * Creates a wrapper object for region filter functions
         * @param regionKey
         * @param sourceData
         * @returns {GeographicArea}
         */
        function createRegionWrapper (regionKey, sourceData) {
            var regionMeta = sourceData.regions[regionKey],
                regionProperties = regionMeta.property || {};
            return {
                osmIdentifier: regionKey,
                geoNamesIdentifier: regionProperties.geoNamesId,
                isoCode: regionProperties.iso3166,
                hierarchyLevel: regionMeta.level,
                attributes: regionProperties,

                getSharedBoundaryWith: function (targetId) {
                    var waySet = {}, i, len1, j, len2,
                        pathA = sourceData.paths[targetId],
                        pathB = sourceData.paths[regionKey];
                    for (i = 0, len1 = pathA.length; i < len1; ++i) {
                        for (j = 0, len2 = pathA[i].length; j < len2; ++j) {
                            waySet[Math.abs(pathA[i][j])] = 1;
                        }
                    }
                    var commonSegments = [];
                    for (i = 0, len1 = pathB.length; i < len1; ++i) {
                        for (j = 0, len2 = pathB[i].length; j < len2; ++j) {
                            if (waySet[Math.abs(pathB[i][j])]) {
                                // This path shares segments
                                commonSegments.push(pathB[i]);
                            }
                        }
                    }
                    return commonSegments;
                },

                sharesBoundaryWith: function (targetId) {

                    var waySet = {}, i, len1, j, len2,
                        pathA = sourceData.paths[regionKey],
                        pathB = sourceData.paths[targetId];
                    if (!pathA || !pathB) {
                        return false;
                    }
                    for (i = 0, len1 = pathA.length; i < len1; ++i) {
                        for (j = 0, len2 = pathA[i].length; j < len2; ++j) {
                            waySet[Math.abs(pathA[i][j])] = 1;
                        }
                    }
                    for (i = 0, len1 = pathB.length; i < len1; ++i) {
                        for (j = 0, len2 = pathB[i].length; j < len2; ++j) {
                            if (waySet[Math.abs(pathB[i][j])]) {
                                return true;
                            }
                        }
                    }
                    return false;
                },

                hasParentRegion: function (parentId) {
                    var parentList = regionMeta.parents;
                    for (var i = 0, len = parentList.length; i < len; ++i) {
                        if (parentList[i].id == parentId) {
                            return true;
                        }
                    }
                    return false;
                }
            }
        }

        /**
         * Recombination logic for regions
         * @param inputData
         * @param recombinationQuery
         * @returns {*}
         */
        function combineRegions (inputData, recombinationQuery) {
            var regionMetaInfo = inputData.regions,
                sourcePaths = inputData.paths,
                selectedRegions = {},
                combinedPaths = [];

            function processIndividualPath (singlePath) {
                var outputSegments = [];
                for (var i = 0, l = singlePath.length; i < l; ++i) {
                    if (1 || singlePath[i].length > 1) { // This condition (1 || ...) seems to always be true
                        outputSegments.push([singlePath[i]]);
                    }
                }
                return outputSegments;
            }

            // Populate selected regions and their path segments
            for (var regionIdentifier in regionMetaInfo) {
                if (regionMetaInfo.hasOwnProperty(regionIdentifier)) {
                    var currentRegionPaths = sourcePaths[regionIdentifier];
                    var queryFilterResult = recombinationQuery.filter(createRegionWrapper(regionIdentifier, inputData));
                    if (queryFilterResult) {
                        if (queryFilterResult !== true) {
                            if (queryFilterResult.path) {
                                currentRegionPaths = queryFilterResult.path;
                            }
                        }
                        if (currentRegionPaths && currentRegionPaths.length) {
                            currentRegionPaths = processIndividualPath(currentRegionPaths);
                            if (currentRegionPaths.length) {
                                selectedRegions[regionIdentifier] = regionIdentifier;
                                combinedPaths.push.apply(combinedPaths, currentRegionPaths);
                            }
                        }
                    }
                }
            }

            function mergePathSegments (pathA, pathB) {

                var segmentUsage = {},
                    segmentOrientation = {},
                    segmentAdjacency = {};

                var pathGroup = [pathA, pathB]
                for (var groupIdx = 0; groupIdx < 2; ++groupIdx) {
                    var segmentsInGroup = pathGroup[groupIdx];
                    for (var pathEntryIdx = 0, totalPathEntries = segmentsInGroup.length; pathEntryIdx < totalPathEntries; ++pathEntryIdx) {
                        var singleEntry = segmentsInGroup[pathEntryIdx];
                        if (typeof singleEntry == 'number') {
                            singleEntry = [singleEntry];
                        }
                        for (var i = 0, segmentCount = singleEntry.length; i < segmentCount; ++i) {
                            var segmentId = Math.abs(singleEntry[i]);
                            segmentUsage[segmentId] = (segmentUsage[segmentId] || 0) + 1;
                        }
                    }
                }


                var keptSegments = 0, discardedSegments = 0;
                for (var groupIdx = 0; groupIdx < 2; ++groupIdx) {
                    var segmentsInGroup = pathGroup[groupIdx];
                    for (var pathEntryIdx = 0, totalPathEntries = segmentsInGroup.length; pathEntryIdx < totalPathEntries; ++pathEntryIdx) {
                        var singleEntry = segmentsInGroup[pathEntryIdx];
                        if (typeof singleEntry == 'number') {
                            singleEntry = [singleEntry];
                        }

                        for (var i = 0, segmentCount = singleEntry.length; i < segmentCount; ++i) {
                            var segmentId = Math.abs(singleEntry[i]);
                            if (segmentUsage[segmentId] === 1) {
                                keptSegments++;
                                var prevSegmentId = +singleEntry[(i - 1 + segmentCount) % segmentCount],
                                    nextSegmentId = +singleEntry[(i + 1 + segmentCount) % segmentCount];
                                segmentAdjacency[prevSegmentId] = segmentAdjacency[prevSegmentId] || [];
                                segmentAdjacency[prevSegmentId].push(singleEntry[i]);
                                segmentOrientation[singleEntry[i]] = [
                                    +prevSegmentId,
                                    +singleEntry[i],
                                    +nextSegmentId,
                                    groupIdx,
                                    pathEntryIdx
                                ];
                            } else {
                                discardedSegments++;
                            }
                        }
                    }
                }
                if (!discardedSegments) {
                    return false;
                }