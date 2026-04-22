function checkStructureForArray(structureElement) {
    return Object.prototype.toString.call(structureElement) === '[object Array]';
}

function FeatureHandler(initialElements) {
    this.componentElements = initialElements;
    this.isBoundedQuadrilateral = false;
}

FeatureHandler.prototype.compareSpatialPoints = function (pointRefA, pointRefB) {
    return pointRefA.x === pointRefB.x && pointRefA.y === pointRefB.y;
};

FeatureHandler.prototype.processGeometricBoundary = function (geometrySegments) {
    const handlerInstance = this;

    function refineSegment(segmentEntry) {
        if (checkStructureForArray(segmentEntry[0])) {
            return segmentEntry.map(refineSegment);
        } else {
            const initialVertex = segmentEntry[0];
            return segmentEntry.filter((currentVertex, idx) => {
                return idx === 0 || !handlerInstance.compareSpatialPoints(initialVertex, currentVertex);
            });
        }
    }
    return refineSegment(geometrySegments);
};

FeatureHandler.prototype.createFrameworkRepresentations = {
    producePointFeature: function (featureOptions, componentData) {
        let currentComponent = componentData || this.componentElements;
        if (checkStructureForArray(currentComponent)) {
            currentComponent = currentComponent[0];
        }
        return L.marker(this.translateCoordinatesToLatLng(currentComponent), featureOptions);
    },

    produceMultiPointFeature: function (featureOptions) {
        const pointCollection = this.componentElements;
        const generatedEntities = pointCollection.map(segment =>
            this.createFrameworkRepresentations.producePointFeature.call(this, featureOptions, segment)
        );
        return L.featureGroup(generatedEntities, featureOptions);
    },

    produceLineFeature: function (featureOptions, componentData) {
        const lineCollection = componentData || this.componentElements;
        const transformedData = this.translateCoordinateGroupsToLatLngs(lineCollection);
        return L.polyline(transformedData, featureOptions);
    },

    produceMultiLineFeature: function (featureOptions) {
        const multiLineCollection = this.componentElements;
        const transformedData = this.translateCoordinateGroupsToLatLngs(multiLineCollection, 1);
        return L.multiPolyline(transformedData, featureOptions);
    },

    produceAreaFeature: function (featureOptions) {
        const processedSegments = this.processGeometricBoundary(this.componentElements);
        const transformedData = this.translateCoordinateGroupsToLatLngs(processedSegments, 1);
        return L.polygon(transformedData, featureOptions);
    },

    produceMultiAreaFeature: function (featureOptions) {
        const processedSegments = this.processGeometricBoundary(this.componentElements);
        const transformedData = this.translateCoordinateGroupsToLatLngs(processedSegments, 2);
        return L.multiPolygon(transformedData, featureOptions);
    },

    produceCombinedFeature: function (featureOptions) {
        const elementList = this.componentElements;

        const renderedItems = elementList.map(item => {
            const subHandler = new FeatureHandler(item.components);
            subHandler.compareSpatialPoints = this.compareSpatialPoints;
            subHandler.translateCoordinatesToLatLng = this.translateCoordinatesToLatLng;
            subHandler.translateCoordinateGroupsToLatLngs = this.translateCoordinateGroupsToLatLngs;
            subHandler.processGeometricBoundary = this.processGeometricBoundary;

            const methodMapping = {
                'point': subHandler.createFrameworkRepresentations.producePointFeature,
                'multipoint': subHandler.createFrameworkRepresentations.produceMultiPointFeature,
                'linestring': subHandler.createFrameworkRepresentations.produceLineFeature,
                'multilinestring': subHandler.createFrameworkRepresentations.produceMultiLineFeature,
                'polygon': subHandler.createFrameworkRepresentations.produceAreaFeature,
                'multipolygon': subHandler.createFrameworkRepresentations.produceMultiAreaFeature,
                'geometrycollection': subHandler.createFrameworkRepresentations.produceCombinedFeature
            };

            const builderFunction = methodMapping[item.type];
            if (builderFunction) {
                return builderFunction.call(subHandler, featureOptions, item.components);
            }
            return null;
        }).filter(Boolean);

        return L.featureGroup(renderedItems, featureOptions);
    }
};

FeatureHandler.prototype.translateCoordinateGroupsToLatLngs = L.GeoJSON.coordsToLatLngs;
FeatureHandler.prototype.translateCoordinatesToLatLng = function (coordObject, invertXY) {
    const latComponent = invertXY ? coordObject.x : coordObject.y;
    const lngComponent = invertXY ? coordObject.y : coordObject.x;
    return L.latLng(latComponent, lngComponent, true);
};

FeatureHandler.prototype.decomposeFrameworkObject = function (platformObject) {
    const currentHandler = this;

    const retrieveCoordinateEntries = function (latLngEntry) {
        return latLngEntry.map(element => {
            if (checkStructureForArray(element)) {
                return retrieveCoordinateEntries(element);
            } else {
                return {
                    x: element.lng,
                    y: element.lat
                };
            }
        });
    };

    const decompositionRegistry = new Map();

    decompositionRegistry.set(L.Marker, function (objRef) {
        return {
            geometryType: 'point',
            geometryData: [{
                x: objRef.getLatLng().lng,
                y: objRef.getLatLng().lat
            }]
        };
    });
    decompositionRegistry.set(L.marker, decompositionRegistry.get(L.Marker));

    decompositionRegistry.set(L.Rectangle, function (objRef) {
        const boundaryInfo = objRef.getBounds();
        return {
            geometryType: 'polygon',
            isBoundedQuadrilateral: true,
            geometryData: [
                [
                    { x: boundaryInfo.getSouthWest().lng, y: boundaryInfo.getNorthEast().lat },
                    { x: boundaryInfo.getNorthEast().lng, y: boundaryInfo.getNorthEast().lat },
                    { x: boundaryInfo.getNorthEast().lng, y: boundaryInfo.getSouthWest().lat },
                    { x: boundaryInfo.getSouthWest().lng, y: boundaryInfo.getSouthWest().lat },
                    { x: boundaryInfo.getSouthWest().lng, y: boundaryInfo.getNorthEast().lat }
                ]
            ]
        };
    });
    decompositionRegistry.set(L.rectangle, decompositionRegistry.get(L.Rectangle));

    decompositionRegistry.set(L.Polyline, function (objRef) {
        const polylineLatLngs = objRef.getLatLngs();
        const extractedPoints = polylineLatLngs.map(ll => ({ x: ll.lng, y: ll.lat }));
        return {
            geometryType: 'linestring',
            geometryData: extractedPoints
        };
    });
    decompositionRegistry.set(L.polyline, decompositionRegistry.get(L.Polyline));

    decompositionRegistry.set(L.Polygon, function (objRef) {
        let allLeafletRings = objRef.getLatLngs();
        if (allLeafletRings.length > 0 && !(allLeafletRings[0] instanceof L.LatLng || (typeof allLeafletRings[0] === 'object' && allLeafletRings[0] !== null && 'lat' in allLeafletRings[0]))) {
            // It's already an array of arrays (e.g., [[outer], [hole1]])
        } else {
            allLeafletRings = [allLeafletRings];
        }

        const compiledRings = allLeafletRings.map(ringLatLngs => {
            const ringPoints = ringLatLngs.map(ll => ({ x: ll.lng, y: ll.lat }));
            if (ringPoints.length > 0 && !currentHandler.compareSpatialPoints(ringPoints[0], ringPoints[ringPoints.length - 1])) {
                ringPoints.push(ringPoints[0]);
            }
            return ringPoints;
        });

        return {
            geometryType: 'polygon',
            geometryData: compiledRings
        };
    });
    decompositionRegistry.set(L.polygon, decompositionRegistry.get(L.Polygon));

    const collectionDecomposer = function (objRef) {
        const subFeatures = [];
        const layerMap = objRef._layers;

        Object.values(layerMap).forEach(individualLayer => {
            if (individualLayer.getLatLngs || individualLayer.getLatLng) {
                const processedSub = currentHandler.decomposeFrameworkObject(individualLayer);
                if (processedSub && processedSub.geometryData) {
                    subFeatures.push(processedSub);
                }
            }
        });

        let deducedType;
        if (objRef.constructor === L.MultiPolyline) {
            deducedType = 'multilinestring';
        } else if (objRef.constructor === L.MultiPolygon) {
            deducedType = 'multipolygon';
        } else if (objRef.constructor === L.FeatureGroup) {
            const constituentTypes = Object.values(layerMap).map(l => l.constructor);
            const allAreMarkers = constituentTypes.every(c => c === L.Marker || c === L.marker);
            const allArePolylines = constituentTypes.every(c => c === L.Polyline || c === L.polyline);
            const allArePolygons = constituentTypes.every(c => c === L.Polygon || c === L.polygon);

            if (allAreMarkers) {
                deducedType = 'multipoint';
            } else if (allArePolylines) {
                deducedType = 'multilinestring';
            } else if (allArePolygons) {
                deducedType = 'multipolygon';
            } else {
                deducedType = 'geometrycollection';
            }
        } else {
            deducedType = 'geometrycollection';
        }

        let finalPayload;
        if (deducedType === 'multipoint' || deducedType === 'multilinestring' || deducedType === 'multipolygon') {
            finalPayload = subFeatures.map(item => item.geometryData);
        } else {
            finalPayload = subFeatures;
        }

        return {
            geometryType: deducedType,
            geometryData: finalPayload
        };
    };

    decompositionRegistry.set(L.MultiPolyline, collectionDecomposer);
    decompositionRegistry.set(L.MultiPolygon, collectionDecomposer);
    decompositionRegistry.set(L.LayerGroup, collectionDecomposer);
    decompositionRegistry.set(L.FeatureGroup, collectionDecomposer);

    const handlerFunction = decompositionRegistry.get(platformObject.constructor);

    if (handlerFunction) {
        return handlerFunction(platformObject);
    }

    if (platformObject.constructor === L.Circle || platformObject.constructor === L.circle) {
        console.log('Disassembly of FrameworkCircle objects is not yet supported');
        return null;
    }

    console.log('The provided object does not possess any recognized attributes.');
    return null;
};