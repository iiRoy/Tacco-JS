/*
 *  Module: GeoConverter.js
 *  Purpose: Provides utilities for converting between Well-Known Text (WKT)
 *           geometry representations and Leaflet.js layer objects.
 *
 *  Disclaimer: This software is provided "as is", without warranty of any kind.
 *              The author and contributors are not liable for any damages
 *              arising from its use. Use at your own risk.
 *
 *  Copyright (c) 2023 GeoSpatial Solutions Inc.
 *  All rights reserved.
 *
 *  This code is proprietary and confidential. Unauthorized copying,
 *  modification, or distribution is strictly prohibited.
 */

// Global utility object for geometry processing, extending the base Wkt.Wkt prototype.
// Renamed from Wkt.Wkt to GeoUtil.GeoProcessor for clarity and distinction.

/**
 * @property {boolean} GeoUtil.GeoProcessor.prototype.considerAsRectangle
 * A contextual flag indicating whether a closed polygon should be processed
 * with assumptions typical for rectangular shapes. Defaults to false.
 */
GeoUtil.GeoProcessor.prototype.considerAsRectangle = false;

/**
 * @private
 * Simple helper to check if a value is an array.
 * @param {*} value - The value to check.
 * @returns {boolean} True if the value is an array, false otherwise.
 */
const isArrayCheck = (value) => Array.isArray(value);

/**
 * @function GeoUtil.GeoProcessor.prototype.pruneDuplicateEndpoints
 * Recursively processes an array of coordinate sequences, removing a closing
 * coordinate if it exactly matches the opening coordinate. This is primarily
 * for rendering closed geometries in systems that imply closure.
 *
 * @param {Array<Object|Array>} inputCoordSequences - An array of coordinate objects
 *                                                    or nested arrays of coordinates.
 * @returns {Array<Object|Array>} A new array with redundant closing coordinates removed.
 */
GeoUtil.GeoProcessor.prototype.pruneDuplicateEndpoints = function (inputCoordSequences) {
    // If no input, or if it's not an array, return an empty array or the input directly.
    if (!isArrayCheck(inputCoordSequences) || inputCoordSequences.length === 0) {
        return [];
    }

    const processedSegments = [];
    let currentVertexCounter = 0;

    for (const currentCoord of inputCoordSequences) {
        // If the current element is itself an array, recurse into it.
        if (isArrayCheck(currentCoord)) {
            processedSegments.push(this.pruneDuplicateEndpoints(currentCoord));
        } else {
            // For individual coordinate objects:
            // Add the first coordinate unconditionally.
            // For subsequent coordinates, only add if it's not identical to the first.
            if (currentVertexCounter === 0 || !this.areCoordinatesIdentical(inputCoordSequences[0], currentCoord)) {
                processedSegments.push(currentCoord);
            }
        }
        currentVertexCounter++;
    }

    return processedSegments;
};

/**
 * @property {Object} GeoUtil.GeoProcessor.prototype.leafletLayerFactories
 * A collection of factory methods to create Leaflet.js layer objects
 * from internal geometry representations. Each method corresponds to a
 * specific geometry type.
 */
GeoUtil.GeoProcessor.prototype.leafletLayerFactories = {
    /**
     * Generates a Leaflet marker layer representing a single point.
     * @param {Object} [layerOptions] - Configuration options for the Leaflet marker.
     * @param {Object|Array} [geoComponent] - The specific geometry component to build from.
     *                                        If an array, the first element is used.
     * @returns {L.Marker} A Leaflet marker instance.
     */
    buildPoint: function (layerOptions, geoComponent) {
        let targetCoord = geoComponent || this.currentGeometryComponents;
        // Ensure we're working with a single coordinate object.
        if (isArrayCheck(targetCoord)) {
            targetCoord = targetCoord[0];
        }

        // Validate targetCoord before proceeding.
        if (!targetCoord || typeof targetCoord.x === 'undefined' || typeof targetCoord.y === 'undefined') {
            console.warn("Invalid coordinate data for point construction:", targetCoord);
            return null; // Or throw an error
        }

        const leafletLatLng = this.mapCoordToLeafletLatLng(targetCoord);
        return L.marker(leafletLatLng, layerOptions);
    },

    /**
     * Generates a Leaflet feature group containing multiple markers for a multipoint geometry.
     * @param {Object} [layerOptions] - Configuration options for the Leaflet feature group.
     * @returns {L.FeatureGroup} A Leaflet feature group of markers.
     */
    buildMultiPoint: function (layerOptions) {
        const componentCoordinates = this.currentGeometryComponents;
        if (!componentCoordinates || componentCoordinates.length === 0) {
            return L.featureGroup([], layerOptions); // Return empty group if no points
        }

        const pointLayers = componentCoordinates.map(singleCoord =>
            this.leafletLayerFactories.buildPoint.call(this, layerOptions, singleCoord)
        );

        // Filter out any nulls if buildPoint returned them due to validation
        const validPointLayers = pointLayers.filter(layer => layer !== null);

        return L.featureGroup(validPointLayers, layerOptions);
    },

    /**
     * Generates a Leaflet polyline layer for a linestring geometry.
     * @param {Object} [layerOptions] - Configuration options for the Leaflet polyline.
     * @param {Object|Array} [geoComponent] - The specific geometry component to build from.
     * @returns {L.Polyline} A Leaflet polyline instance.
     */
    buildLineString: function (layerOptions, geoComponent) {
        const componentCoords = geoComponent || this.currentGeometryComponents;
        const leafletLatLngs = this.mapCoordsToLeafletLatLngs(componentCoords);

        // Guard against empty or invalid coordinate lists
        if (!leafletLatLngs || leafletLatLngs.length === 0 || (isArrayCheck(leafletLatLngs[0]) && leafletLatLngs[0].length === 0)) {
            console.warn("Empty or invalid LatLngs for linestring:", componentCoords);
            return L.polyline([], layerOptions);
        }

        return L.polyline(leafletLatLngs, layerOptions);
    },

    /**
     * Generates a Leaflet multi-polyline layer for a multilinestring geometry.
     * @param {Object} [layerOptions] - Configuration options for the Leaflet multi-polyline.
     * @returns {L.MultiPolyline} A Leaflet multi-polyline instance.
     */
    buildMultiLineString: function (layerOptions) {
        const componentCoords = this.currentGeometryComponents;
        // Level 1 indicates the coordinates are nested one level deeper (e.g., [ [p1,p2], [p3,p4] ])
        const leafletLatLngsNested = this.mapCoordsToLeafletLatLngs(componentCoords, 1);

        if (!leafletLatLngsNested || leafletLatLngsNested.length === 0) {
            return L.multiPolyline([], layerOptions);
        }

        return L.multiPolyline(leafletLatLngsNested, layerOptions);
    },

    /**
     * Generates a Leaflet polygon layer for a polygon geometry.
     * @param {Object} [layerOptions] - Configuration options for the Leaflet polygon.
     * @returns {L.Polygon} A Leaflet polygon instance.
     */
    buildPolygon: function (layerOptions) {
        // First, normalize the component coordinates by pruning duplicate endpoints.
        const normalizedCoords = this.pruneDuplicateEndpoints(this.currentGeometryComponents);
        // Level 1 indicates the coordinates are nested one level deeper for polygon rings.
        const leafletLatLngsForPolygon = this.mapCoordsToLeafletLatLngs(normalizedCoords, 1);

        if (!leafletLatLngsForPolygon || leafletLatLngsForPolygon.length === 0) {
            return L.polygon([], layerOptions);
        }

        return L.polygon(leafletLatLngsForPolygon, layerOptions);
    },

    /**
     * Generates a Leaflet multi-polygon layer for a multipolygon geometry.
     * @param {Object} [layerOptions] - Configuration options for the Leaflet multi-polygon.
     * @returns {L.MultiPolygon} A Leaflet multi-polygon instance.
     */
    buildMultiPolygon: function (layerOptions) {
        // Normalize coordinates before mapping to Leaflet LatLngs.
        const normalizedCoords = this.pruneDuplicateEndpoints(this.currentGeometryComponents);
        // Level 2 indicates coordinates are nested two levels deep for multi-polygon structures.
        const leafletLatLngsForMultiPolygon = this.mapCoordsToLeafletLatLngs(normalizedCoords, 2);

        if (!leafletLatLngsForMultiPolygon || leafletLatLngsForMultiPolygon.length === 0) {
            return L.multiPolygon([], layerOptions);
        }

        return L.multiPolygon(leafletLatLngsForMultiPolygon, layerOptions);
    },

    /**
     * Generates a Leaflet feature group for a geometry collection.
     * Each component within the collection is recursively built into a Leaflet layer.
     * @param {Object} [layerOptions] - Configuration options for the Leaflet feature group.
     * @returns {L.FeatureGroup} A Leaflet feature group containing various geometry layers.
     */
    buildGeometryCollection: function (layerOptions) {
        const rawComponents = this.currentGeometryComponents;
        if (!rawComponents || rawComponents.length === 0) {
            return L.featureGroup([], layerOptions);
        }

        const collectionLayers = [];
        for (const componentItem of rawComponents) {
            // Dynamically call the appropriate builder based on component type.
            // Ensure `this` context is preserved for the builder function.
            // Also, pass the component itself, as it might be a nested structure.
            const builderFunc = this.leafletLayerFactories[`build${componentItem.type.charAt(0).toUpperCase() + componentItem.type.slice(1)}`];
            if (builderFunc) {
                // Temporarily override `this.currentGeometryComponents` for the recursive call
                const originalComponents = this.currentGeometryComponents;
                this.currentGeometryComponents = componentItem.components;
                const builtLayer = builderFunc.call(this, layerOptions, componentItem.components);
                if (builtLayer) {
                    collectionLayers.push(builtLayer);
                }
                this.currentGeometryComponents = originalComponents; // Restore original
            } else {
                console.warn(`No builder found for geometry type: ${componentItem.type}`);
            }
        }

        return L.featureGroup(collectionLayers, layerOptions);
    }
};

// Extend the GeoUtil.GeoProcessor prototype with Leaflet's coordinate conversion utilities
// and a custom single coordinate converter.
L.Util.extend(GeoUtil.GeoProcessor.prototype, {
    /**
     * Converts an array of internal coordinates to an array of Leaflet LatLngs.
     * This leverages Leaflet's internal GeoJSON conversion utility.
     * @function
     * @param {Array} coordinates - The array of coordinates to convert.
     * @param {number} [depth] - The nesting level of coordinates (e.g., 0 for points, 1 for lines/polygons, 2 for multi-polygons).
     * @returns {Array<L.LatLng>} An array of Leaflet LatLng objects.
     */
    mapCoordsToLeafletLatLngs: L.GeoJSON.coordsToLatLngs,

    /**
     * Converts a single internal coordinate object to a Leaflet LatLng object.
     * @param {Object} coordinateObj - The coordinate object with 'x' (longitude) and 'y' (latitude) properties.
     * @param {boolean} [invertXY=false] - If true, treats 'x' as latitude and 'y' as longitude.
     * @returns {L.LatLng} A Leaflet LatLng object.
     */
    mapCoordToLeafletLatLng: function (coordinateObj, invertXY = false) {
        if (!coordinateObj || typeof coordinateObj.x === 'undefined' || typeof coordinateObj.y === 'undefined') {
            console.error("Invalid coordinate object provided for conversion:", coordinateObj);
            return null; // Or throw an error
        }
        const latitude = invertXY ? coordinateObj.x : coordinateObj.y;
        const longitude = invertXY ? coordinateObj.y : coordinateObj.x;

        // The third parameter 'true' forces Leaflet to treat these as raw lat/lng values.
        return L.latLng(latitude, longitude, true);
    }
});

/**
 * @function GeoUtil.GeoProcessor.prototype.extractGeoDataFromLeafletLayer
 * Analyzes a given Leaflet layer object and extracts its geometric data
 * into a standardized internal representation (type and components).
 *
 * @param {L.Layer} leafletLayerInstance - An instance of a Leaflet layer (e.g., L.Marker, L.Polygon).
 * @returns {Object} A hash containing the 'type' (string) and 'components' (Array) of the geometry.
 */
GeoUtil.GeoProcessor.prototype.extractGeoDataFromLeafletLayer = function (leafletLayerInstance) {
    let extractedGeometryParts;
    let temporaryLatLngs;

    /**
     * @private
     * Recursive helper function to convert Leaflet LatLng arrays into
     * standardized internal coordinate objects {x: lng, y: lat}.
     * @param {Array<L.LatLng|Array>} latLngSequence - An array of Leaflet LatLng objects or nested arrays.
     * @returns {Array<Object|Array>} An array of internal coordinate objects or nested arrays thereof.
     */
    const convertLatLngsToInternalCoords = (latLngSequence) => {
        if (!latLngSequence || latLngSequence.length === 0) {
            return [];
        }

        const internalCoordList = [];
        for (const element of latLngSequence) {
            if (isArrayCheck(element)) {
                // If it's a nested array, recurse.
                internalCoordList.push(convertLatLngsToInternalCoords(element));
            } else if (element && typeof element.lng === 'number' && typeof element.lat === 'number') {
                // If it's a LatLng object, extract x (lng) and y (lat).
                internalCoordList.push({
                    x: element.lng,
                    y: element.lat
                });
            } else {
                console.warn("Skipping invalid LatLng element during conversion:", element);
            }
        }
        return internalCoordList;
    };

    // --- Processing for L.Marker ---
    if (leafletLayerInstance instanceof L.Marker) {
        const markerLatLng = leafletLayerInstance.getLatLng();
        return {
            type: 'point',
            components: [{
                x: markerLatLng.lng,
                y: markerLatLng.lat
            }]
        };
    }

    // --- Processing for L.Rectangle ---
    if (leafletLayerInstance instanceof L.Rectangle) {
        const boundaryBox = leafletLayerInstance.getBounds(); // L.LatLngBounds object
        const southWest = boundaryBox.getSouthWest();
        const northEast = boundaryBox.getNorthEast();

        // Construct the polygon coordinates for a rectangle, ensuring closure.
        const rectangleVertices = [
            { x: southWest.lng, y: northEast.lat }, // Top-left
            { x: northEast.lng, y: northEast.lat }, // Top-right
            { x: northEast.lng, y: southWest.lat }, // Bottom-right
            { x: southWest.lng, y: southWest.lat }, // Bottom-left
            { x: southWest.lng, y: northEast.lat }  // Close the loop (Top-left again)
        ];

        return {
            type: 'polygon',
            isRectangularShape: true, // Custom flag to indicate it originated as a rectangle
            components: [rectangleVertices] // Polygons are arrays of rings.
        };
    }

    // --- Processing for L.Polyline ---
    if (leafletLayerInstance instanceof L.Polyline) {
        temporaryLatLngs = leafletLayerInstance.getLatLngs();

        // Check if the polyline is already closed by virtue of its first and last points.
        // If it is, and it's not a polygon, we might want to handle it specially.
        // For a simple polyline, we just convert its points directly.
        if (temporaryLatLngs && temporaryLatLngs.length > 0) {
             const startPoint = temporaryLatLngs[0];
             const endPoint = temporaryLatLngs[temporaryLatLngs.length - 1];

             // If it's a closed polyline (first and last points are identical),
             // this might indicate a polygon that was created as a polyline.
             // We'll treat it as a linestring for now, but this is a point for potential refinement.
             const isClosedPolyline = startPoint && endPoint && startPoint.equals(endPoint);

             extractedGeometryParts = convertLatLngsToInternalCoords(temporaryLatLngs);

             return {
                 type: 'linestring',
                 components: extractedGeometryParts,
                 // Optional: Add a flag if it was a closed polyline, but not handled as a polygon.
                 wasClosedButNotPolygon: isClosedPolyline
             };
        }
        return { type: 'linestring', components: [] }; // Return empty if no points
    }

    // --- Processing for L.Polygon ---
    if (leafletLayerInstance instanceof L.Polygon) {
        const polygonRings = [];
        temporaryLatLngs = leafletLayerInstance.getLatLngs(); // This typically gets the outer ring and holes as nested arrays.

        if (temporaryLatLngs && temporaryLatLngs.length > 0) {
            // Leaflet's getLatLngs for polygon returns [outerRing, hole1, hole2, ...]
            // Each ring needs to be explicitly closed in our internal representation.
            for (let i = 0; i < temporaryLatLngs.length; i++) {
                const currentRingLatLngs = temporaryLatLngs[i];
                if (currentRingLatLngs && currentRingLatLngs.length > 0) {
                    const internalRingCoords = convertLatLngsToInternalCoords(currentRingLatLngs);
                    // Ensure explicit closure for each ring if not already present.
                    if (internalRingCoords.length > 1 && !this.areCoordinatesIdentical(internalRingCoords[0], internalRingCoords[internalRingCoords.length - 1])) {
                        internalRingCoords.push(internalRingCoords[0]);
                    }
                    polygonRings.push(internalRingCoords);
                }
            }
        }

        return {
            type: 'polygon',
            components: polygonRings
        };
    }

    // --- Processing for Multi-geometries and Layer Groups (L.MultiPolyline, L.MultiPolygon, L.FeatureGroup) ---
    if (leafletLayerInstance instanceof L.MultiPolyline ||
        leafletLayerInstance instanceof L.MultiPolygon ||
        leafletLayerInstance instanceof L.FeatureGroup ||
        leafletLayerInstance instanceof L.LayerGroup) { // L.LayerGroup is a base for L.FeatureGroup
        const collectedFeatures = [];
        const internalLeafletLayers = leafletLayerInstance.getLayers ? leafletLayerInstance.getLayers() : Object.values(leafletLayerInstance._layers || {});

        if (internalLeafletLayers.length === 0) {
             return { type: 'geometrycollection', components: [] };
        }

        for (const subLayer of internalLeafletLayers) {
            // Recursively deconstruct each sub-layer.
            const deconstructedSubLayer = this.extractGeoDataFromLeafletLayer(subLayer);
            if (deconstructedSubLayer) {
                collectedFeatures.push(deconstructedSubLayer);
            }
        }

        // Determine the type for FeatureGroup/LayerGroup based on its contents.
        const determineCollectionType = () => {
            if (leafletLayerInstance instanceof L.MultiPolyline) {
                return 'multilinestring';
            }
            if (leafletLayerInstance instanceof L.MultiPolygon) {
                return 'multipolygon';
            }
            // For L.FeatureGroup/L.LayerGroup, try to infer a more specific multi-type
            // if all contained features are of the same basic geometry type.
            let allArePoints = true;
            let allAreLines = true;
            let allArePolygons = true;

            for (const feature of collectedFeatures) {
                if (feature.type !== 'point') allArePoints = false;
                if (feature.type !== 'linestring') allAreLines = false;
                if (feature.type !== 'polygon') allArePolygons = false;
            }

            if (allArePoints && collectedFeatures.length > 0) return 'multipoint';
            if (allAreLines && collectedFeatures.length > 0) return 'multilinestring';
            if (allArePolygons && collectedFeatures.length > 0) return 'multipolygon';

            // If mixed types, or single type not covered above, it's a generic geometrycollection.
            return 'geometrycollection';
        };

        return {
            type: determineCollectionType(),
            // Flatten the components from each collected feature.
            components: collectedFeatures.map(f => f.components).filter(c => c !== undefined && c !== null)
        };
    }

    // --- Fallback for unrecognized objects ---
    console.warn('The provided Leaflet object does not match any recognizable geometry type for deconstruction:', leafletLayerInstance);
    return null; // Indicate failure to deconstruct
};