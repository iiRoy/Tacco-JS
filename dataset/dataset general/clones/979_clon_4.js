(function (globalScope) {
    const geospatialProcessor = (function () {

        const COORD_SCALE_FACTOR = 1e-6;
        const BYTE_CHUNK_SIZE = 2;
        const COORD_RESOLUTION_DENOMINATOR = 65535; // Target resolution 65k

        const BASE64_CHAR_MAP = (function() {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
            const map = new Map();
            for (let i = 0; i < chars.length; i++) {
                map.set(chars[i], i);
            }
            map.set('_', 62);
            map.set('-', 63);
            return map;
        })();

        const decodeUrlSafeBase64 = (encodedString) => {
            let output = '';
            let i = 0;
            const paddedString = encodedString.length % 4 === 0 ? encodedString : encodedString + '==='.slice(0, 4 - (encodedString.length % 4));

            while (i < paddedString.length) {
                let val1 = BASE64_CHAR_MAP.get(paddedString[i++]);
                let val2 = BASE64_CHAR_MAP.get(paddedString[i++]);
                let val3 = BASE64_CHAR_MAP.get(paddedString[i++]);
                let val4 = BASE64_CHAR_MAP.get(paddedString[i++]);

                let combined = (val1 << 18) | (val2 << 12) | (val3 << 6) | val4;

                let char1 = (combined >> 16) & 0xFF;
                let char2 = (combined >> 8) & 0xFF;
                let char3 = combined & 0xFF;

                output += String.fromCharCode(char1);
                if (val3 !== 64) output += String.fromCharCode(char2);
                if (val4 !== 64) output += String.fromCharCode(char3);
            }
            return output;
        };

        const extractNumericValue = (sourceBytes, count) => {
            return Array.from({ length: count }).reduce((acc, _, index) => {
                return acc | (sourceBytes.charCodeAt(index) << (index * 8));
            }, 0);
        };

        const constrainLongitude = (val) => Math.min(180, Math.max(-180, val));
        const constrainLatitude = (val) => Math.min(85, Math.max(-85, val));

        const arePointsNear = (pointX, pointY, tolerance = 1e-9) => {
            const diffLon = Math.abs(pointY[0] - pointX[0]);
            const diffLat = Math.abs(pointY[1] - pointX[1]);
            return diffLon < tolerance && diffLat < tolerance;
        };

        const extractPathSegments = (encodedString) => {
            const inputBytes = decodeUrlSafeBase64(encodedString);
            const totalBytesLength = inputBytes.length;

            const minLat = extractNumericValue(inputBytes.substring(0, 4), 4) * COORD_SCALE_FACTOR;
            const minLon = extractNumericValue(inputBytes.substring(4, 4), 4) * COORD_SCALE_FACTOR;
            const maxLat = extractNumericValue(inputBytes.substring(8, 4), 4) * COORD_SCALE_FACTOR;
            const maxLon = extractNumericValue(inputBytes.substring(12, 4), 4) * COORD_SCALE_FACTOR;

            const deltaLat = maxLat - minLat;
            const deltaLon = maxLon - minLon;

            const latFactor = deltaLat / COORD_RESOLUTION_DENOMINATOR;
            const lonFactor = deltaLon / COORD_RESOLUTION_DENOMINATOR;

            const decodedPoints = [];
            let currentByteIndex = 16;

            const decodePointsRecursively = () => {
                if (currentByteIndex >= totalBytesLength) {
                    return;
                }
                const readChunk = () => {
                    const val = extractNumericValue(inputBytes.substring(currentByteIndex, currentByteIndex + BYTE_CHUNK_SIZE), BYTE_CHUNK_SIZE);
                    currentByteIndex += BYTE_CHUNK_SIZE;
                    return val;
                };

                const rawLat = readChunk();
                const rawLon = readChunk();

                const lat = constrainLatitude(rawLat * latFactor + minLat);
                const lon = constrainLongitude(rawLon * lonFactor + minLon);

                decodedPoints.push([lon, lat]);
                decodePointsRecursively();
            };

            decodePointsRecursively();
            return decodedPoints;
        };

        const retrieveSegmentData = (segmentBlock, segmentId, geospatialData) => {
            geospatialData.segmentCache = geospatialData.segmentCache || {};
            if (geospatialData.segmentCache[segmentId]) {
                return geospatialData.segmentCache[segmentId];
            }
            return geospatialData.segmentCache[segmentId] = extractPathSegments(segmentBlock);
        };

        const resolveOverlap = (currentSegment, previousPoints, overlapThreshold = 10 / COORD_RESOLUTION_DENOMINATOR) => {
            const previousLength = previousPoints.length;
            const currentLength = currentSegment.length;

            if (previousLength < 1) return 0;

            const checkOverlap = (idx) => {
                if (idx >= currentLength || idx >= previousLength) {
                    return idx;
                }
                const prevPoint = previousPoints[previousLength - 1 - idx];
                const currPoint = currentSegment[idx];
                if (arePointsNear(prevPoint, currPoint, overlapThreshold)) {
                    return checkOverlap(idx + 1);
                }
                return idx;
            };

            return checkOverlap(0);
        };

        const assembleShape = (regionIdentifier, sourceData, processingOptions) => {
            const config = processingOptions || {};
            const regionPaths = Array.isArray(regionIdentifier) ? regionIdentifier : sourceData.paths[regionIdentifier];

            if (!regionPaths) return null;

            sourceData.segmentCache = sourceData.segmentCache || {};

            const processSinglePath = (currentPathSegment, accumulator = { points: [], fixedPoints: [0], segmentIds: [] }) => {
                if (currentPathSegment.length === 0) {
                    if (accumulator.points.length > 0) {
                        accumulator.points.push(accumulator.points[0]);
                    }
                    return accumulator;
                }

                const [currentWayRef, ...remainingPath] = currentPathSegment;
                const wayIdentifier = Math.abs(currentWayRef);
                let currentWay = retrieveSegmentData(sourceData.ways[wayIdentifier], wayIdentifier, sourceData);

                if (currentWayRef < 0) {
                    currentWay = [...currentWay].reverse();
                }

                let effectiveWay = [...currentWay];

                if (config.adjustOverlaps) {
                    const overlapCount = resolveOverlap(effectiveWay, accumulator.points);
                    if (overlapCount > 0) {
                        effectiveWay = effectiveWay.slice(overlapCount);
                    }
                    if (remainingPath.length === 0) {
                        const reversedEffectiveWay = [...effectiveWay].reverse();
                        const pathOverlap = resolveOverlap(accumulator.points, reversedEffectiveWay);
                        if (pathOverlap > 0) {
                            accumulator.points = accumulator.points.slice(pathOverlap - 1);
                            effectiveWay = effectiveWay.slice(0, effectiveWay.length - (pathOverlap - 1));
                        }
                    }
                } else {
                    if (accumulator.points.length > 0) {
                        accumulator.points.pop();
                    }
                }

                const updatedPoints = [...accumulator.points, ...effectiveWay];
                const updatedFixedPoints = [...accumulator.fixedPoints, updatedPoints.length - 1];
                const updatedSegmentIds = [...accumulator.segmentIds, wayIdentifier];

                return processSinglePath(remainingPath, {
                    points: updatedPoints,
                    fixedPoints: updatedFixedPoints,
                    segmentIds: updatedSegmentIds
                });
            };

            const processedPaths = regionPaths.map(pathRef => {
                const path = typeof pathRef === 'number' ? [pathRef] : pathRef;
                return processSinglePath(path);
            });

            return {
                shapeType: 'Polygon',
                windingRule: 'nonZero',
                coordinates: processedPaths.map(p => p.points),
                sourcePaths: regionPaths,
                segmentMarkers: processedPaths.map(p => p.fixedPoints)
            };
        };

        const acquireAdjustedShape = (identifier, dataSource) => {
            return assembleShape(identifier, dataSource, { adjustOverlaps: true });
        };

        const fetchRemoteData = (resourcePath, successHandler, errorHandler) => {
            fetch(resourcePath, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Network response was not ok: ${response.status}`);
                }
                return response.json();
            })
            .then(data => successHandler(data))
            .catch(error => {
                if (typeof errorHandler === 'function') {
                    errorHandler(error);
                } else {
                    console.error('Failed to retrieve remote data:', error);
                }
            });
        };

        const createRegionProxy = (regionId, dataSource) => {
            const regionMeta = dataSource.regions[regionId];
            const regionProps = regionMeta.property || {};

            const checkBorderIntersection = (otherRegionId, checkFn) => {
                const pathSet1 = dataSource.paths[regionId];
                const pathSet2 = dataSource.paths[otherRegionId];

                if (!pathSet1 || !pathSet2) return false;

                const wayMap = new Set();
                pathSet1.forEach(pathSegment => {
                    const actualPath = typeof pathSegment === 'number' ? [pathSegment] : pathSegment;
                    actualPath.forEach(wayRef => wayMap.add(Math.abs(wayRef)));
                });

                for (const pathSegment of pathSet2) {
                    const actualPath = typeof pathSegment === 'number' ? [pathSegment] : pathSegment;
                    for (const wayRef of actualPath) {
                        if (wayMap.has(Math.abs(wayRef))) {
                            if (checkFn) return checkFn(pathSegment);
                            return true;
                        }
                    }
                }
                return false;
            };

            return {
                osmIdentifier: regionId,
                geoNamesIdentifier: regionProps.geoNamesId,
                isoCode: regionProps.iso3166,
                level: regionMeta.level,
                attributes: regionProps,

                retrieveSharedBorderWays: (otherId) => {
                    const borderWays = [];
                    checkBorderIntersection(otherId, (pathSegment) => {
                        borderWays.push(pathSegment);
                        return false;
                    });
                    return borderWays;
                },

                isBordering: (otherId) => {
                    return checkBorderIntersection(otherId);
                },

                isChildOf: (parentId) => {
                    return regionMeta.parents.some(parent => parent.id === parentId);
                }
            };
        };

        const mergeIntersectingShapes = (geoData, queryOptions) => {
            const regionDefinitions = geoData.regions;
            const inputPaths = geoData.paths;
            const queryFilter = queryOptions.filter;

            const filteredRegionPaths = Object.entries(regionDefinitions).flatMap(([id, definition]) => {
                const currentId = Number(id);
                const proxyRecord = createRegionProxy(currentId, geoData);
                const filterResult = queryFilter(proxyRecord);

                if (!filterResult) return [];

                let pathsToUse = inputPaths[currentId];
                if (filterResult !== true && filterResult.path) {
                    pathsToUse = filterResult.path;
                }

                const processSegments = (segments) => segments.filter(seg => (typeof seg === 'number' ? [seg] : seg).length > 0)
                                                             .map(seg => typeof seg === 'number' ? [seg] : seg);

                return pathsToUse && pathsToUse.length ? processSegments(pathsToUse) : [];
            });

            if (filteredRegionPaths.length === 0) return null;

            const allWayReferences = filteredRegionPaths.flat();

            const wayUsageMap = new Map();
            const wayEndpoints = new Map();

            const getCoordinatesForWayRef = (wayRef) => {
                const wayId = Math.abs(wayRef);
                let coords = retrieveSegmentData(geoData.ways[wayId], wayId, geoData);
                if (wayRef < 0) {
                    coords = [...coords].reverse();
                }
                return coords;
            };

            allWayReferences.forEach((pathSegment) => {
                const waysInSegment = typeof pathSegment === 'number' ? [pathSegment] : pathSegment;
                waysInSegment.forEach((wayRef) => {
                    const wayId = Math.abs(wayRef);
                    wayUsageMap.set(wayId, (wayUsageMap.get(wayId) || 0) + 1);
                });
            });

            const boundaryWayRefs = allWayReferences.flat().filter(wayRef => {
                const wayId = Math.abs(wayRef);
                return wayUsageMap.get(wayId) === 1;
            });

            if (boundaryWayRefs.length === 0) return null;

            boundaryWayRefs.forEach(wayRef => {
                const coords = getCoordinatesForWayRef(wayRef);
                wayEndpoints.set(wayRef, { start: coords[0], end: coords[coords.length - 1] });
            });

            const pointToWayRefs = new Map();

            wayEndpoints.forEach((endpoints, wayRef) => {
                const startKey = JSON.stringify(endpoints.start);
                const endKey = JSON.stringify(endpoints.end);

                if (!pointToWayRefs.has(startKey)) pointToWayRefs.set(startKey, new Set());
                pointToWayRefs.get(startKey).add(wayRef);

                if (!pointToWayRefs.has(endKey)) pointToWayRefs.set(endKey, new Set());
                pointToWayRefs.get(endKey).add(wayRef);
            });

            const assembledPolygons = [];
            const visitedWays = new Set();

            const reconstructPath = (startWayRef) => {
                if (visitedWays.has(startWayRef)) return [];

                const currentPath = [];
                let currentWay = startWayRef;
                let firstWay = true;

                while (currentWay !== startWayRef || firstWay) {
                    if (visitedWays.has(currentWay)) {
                        break;
                    }
                    visitedWays.add(currentWay);
                    currentPath.push(currentWay);

                    const currentWayCoords = getCoordinatesForWayRef(currentWay);
                    const currentEndPoint = currentWayCoords[currentWayCoords.length - 1];
                    const endPointKey = JSON.stringify(currentEndPoint);

                    const potentialNextWays = pointToWayRefs.get(endPointKey);
                    let nextWay = null;

                    if (potentialNextWays) {
                        for (const candidateWayRef of potentialNextWays) {
                            if (candidateWayRef === currentWay) continue;
                            const candidateEndpoints = wayEndpoints.get(candidateWayRef);
                            if (arePointsNear(candidateEndpoints.start, currentEndPoint)) {
                                nextWay = candidateWayRef;
                                break;
                            }
                            if (arePointsNear(candidateEndpoints.end, currentEndPoint)) {
                                nextWay = -candidateWayRef;
                                break;
                            }
                        }
                    }
                    if (!nextWay && !firstWay && currentWay === startWayRef) {
                         break;
                    } else if (!nextWay && firstWay) {
                        const startPoint = currentWayCoords[0];
                        if (arePointsNear(startPoint, currentEndPoint)) {
                            break;
                        }
                    }
                    currentWay = nextWay;
                    firstWay = false;

                    if (!currentWay) {
                        console.warn('Broken path in recombination:', currentPath);
                        break;
                    }
                }
                return currentPath;
            };

            for (const startWayRef of boundaryWayRefs) {
                if (!visitedWays.has(startWayRef)) {
                    const newPath = reconstructPath(startWayRef);
                    if (newPath.length > 0) {
                        assembledPolygons.push(newPath);
                    }
                }
            }

            const finalCoordinates = assembledPolygons.map(pathOfWays => {
                let currentPolygonRing = [];
                pathOfWays.forEach((wayRef, index) => {
                    let wayCoords = getCoordinatesForWayRef(wayRef);
                    if (index > 0 && currentPolygonRing.length > 0) {
                        currentPolygonRing.pop();
                    }
                    currentPolygonRing.push(...wayCoords);
                });
                if (currentPolygonRing.length > 0 && !arePointsNear(currentPolygonRing[0], currentPolygonRing[currentPolygonRing.length - 1])) {
                     currentPolygonRing.push(currentPolygonRing[0]);
                }
                return currentPolygonRing;
            });

            return {
                shapeType: 'Polygon',
                windingRule: 'nonZero',
                coordinates: finalCoordinates,
                sourcePaths: assembledPolygons
            };
        };

        const processGeospatialRecords = (recordSet, operationOptions) => {
            const opts = operationOptions || {};
            const regionDefinitions = recordSet.regions;
            const postProcessingFilter = opts.postFilter || (recordSet.meta && recordSet.meta.postFilter ? new Function('record', recordSet.meta.postFilter) : undefined);
            const activeScheme = opts.scheme || (recordSet.meta && recordSet.meta.scheme);
            const borderDisputes = recordSet.meta && recordSet.meta.disputedBorders || {};
            const effectiveSetupKey = opts.recombine || opts.language || 'en';
            const effectiveBorderDispute = typeof effectiveSetupKey === 'string' ? borderDisputes[effectiveSetupKey] : effectiveSetupKey;

            Object.values(borderDisputes).forEach(setup => {
                Object.entries(setup).forEach(([key, value]) => {
                    if (typeof value === 'string') {
                        setup[key] = new Function('record', value);
                    }
                });
            });

            const featureList = Object.entries(regionDefinitions).flatMap(([id, definition]) => {
                const currentId = Number(id);
                const proxyRecord = createRegionProxy(currentId, recordSet);

                if (postProcessingFilter && !postProcessingFilter(proxyRecord)) {
                    return [];
                }

                let shapeData = null;
                if (effectiveBorderDispute && effectiveBorderDispute[currentId]) {
                    shapeData = mergeIntersectingShapes(recordSet, {
                        filter: effectiveBorderDispute[currentId]
                    });
                } else if (activeScheme && activeScheme[currentId]) {
                    const schemeFilter = activeScheme[currentId];
                    shapeData = mergeIntersectingShapes(recordSet, {
                        filter: typeof schemeFilter === 'string' ? new Function('record', schemeFilter) : schemeFilter
                    });
                } else {
                    shapeData = assembleShape(currentId, recordSet);
                }

                if (!shapeData) return [];

                return [{
                    kind: "Feature",
                    geometry: shapeData,
                    attributes: {
                        osmIdentifier: id,
                        levelValue: definition.level,
                        propertiesMap: definition.property || {},
                        parentIdentifiers: definition.parents,
                        displayHint: definition.name,
                        displayName: definition.name,
                        mainTitle: definition.name,
                        wikiLink: definition.wikipedia,
                        sequenceIndex: definition.index,
                        areaMeasure: definition.square
                    }
                }];
            });

            featureList.sort((a, b) => a.attributes.sequenceIndex - b.attributes.sequenceIndex);

            return featureList;
        };

        const transformFeatureCoordinates = (inputFeature) => {
            const reversePolygonCoordinates = (polyCoords) =>
                polyCoords.map(ring => ring.map(point => [point[1], point[0]]));

            return {
                kind: "Feature",
                geometry: {
                    shapeType: 'Polygon',
                    windingRule: inputFeature.geometry.coordinates.length > 1 ? 'evenOdd' : 'nonZero',
                    coordinates: reversePolygonCoordinates(inputFeature.geometry.coordinates)
                },
                attributes: inputFeature.properties
            };
        };

        return {
            processRecords: processGeospatialRecords,
            fetchData: fetchRemoteData,
            convertFeatureCoords: transformFeatureCoordinates,
            getAdjustedShape: acquireAdjustedShape
        };
    })();

    globalScope.geospatialProcessor = geospatialProcessor;
})(globalThis);