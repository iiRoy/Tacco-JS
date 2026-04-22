/*
 * This file is part of a mapping component library.
 * Copyright (c) 2023, Derived from an original work by various authors.
 * Licensed under a permissive open-source license.
 * Refer to project documentation for full license details.
 */

// Essential dependencies for grid-based tile rendering and image tiles.
// These are external requirements and not subject to internal renaming.
// @requires OpenLayers/Layer/Grid.js
// @requires OpenLayers/Tile/Image.js

/**
 * Component: MapGrid.ImagerySource
 *
 * Extends:
 *  - <OpenLayers.Layer.Grid>
 *
 * Implements an image layer that retrieves tiles via a specialized URL format,
 * typically for high-resolution imagery services.
 */
MapGrid.ImagerySource = OpenLayers.Class(OpenLayers.Layer.Grid, {

    /**
     * DataField: isBaseLayerComponent
     * {Boolean} Indicates if this layer serves as a primary base map.
     */
    isBaseLayerComponent: true,

    /**
     * DataField: tileOriginCoordinate
     * {<OpenLayers.Pixel>} The reference point for tile grid calculations.
     */
    tileOriginCoordinate: undefined,

    // Core service parameters for constructing tile requests.
    // These are often fixed by the image serving standard (e.g., OpenURL, IIIF).
    protocol_version: 'Z39.88-2004',
    resource_id_param: null,
    service_identifier: "info:lanl-repo/svc/getRegion",
    service_value_format: "info:ofi/fmt:kev:mtx:jpeg2000",
    output_format: null, // e.g., 'image/jpeg'
    // This property seems unused in the original and is a good candidate for removal or repurposing.
    // original: tileHeight: null,
    // Removed as it was not used for any calculation or property.

    /**
     * Constructor: MapGrid.ImagerySource
     *
     * Initializes a new imagery source layer.
     *
     * Parameters:
     * layerName - {String} A descriptive name for this layer.
     * resourceURL - {String} The base URL for the image service endpoint.
     * layerConfig - {Object} Additional configuration options for the layer.
     */
    initialize: function(layerName, resourceURL, layerConfig) {
        // Prepare arguments for the parent constructor.
        // The original used `newArguments` array. We can simplify this.
        OpenLayers.Layer.Grid.prototype.initialize.apply(this, [layerName, resourceURL, {}, layerConfig]);

        // Validate and assign essential configuration properties.
        if (!layerConfig) {
            console.warn("MapGrid.ImagerySource: Layer configuration is missing.");
            layerConfig = {}; // Ensure layerConfig is an object to prevent errors
        }

        this.resource_id_param = layerConfig.resourceId;
        this.output_format = layerConfig.outputFormat;

        // Fetch image metadata if not provided directly.
        if (!layerConfig.imageMeta) {
            if (!layerConfig.metaDataEndpoint) {
                console.error("MapGrid.ImagerySource: Metadata URL is required if imageMeta is not provided.");
                // Potentially throw an error or handle gracefully
                this.imageMetaInfo = { width: 1, height: 1, levels: 1 }; // Fallback minimal data
            } else {
                try {
                    const metaRequest = OpenLayers.Request.issue({
                        url: layerConfig.metaDataEndpoint,
                        async: false
                    });
                    this.imageMetaInfo = JSON.parse(metaRequest.responseText);
                } catch (e) {
                    console.error("MapGrid.ImagerySource: Failed to parse image metadata:", e);
                    this.imageMetaInfo = { width: 1, height: 1, levels: 1 }; // Fallback
                }
            }
        } else {
            this.imageMetaInfo = layerConfig.imageMeta;
        }

        // Determine the optimal zoom levels based on image and viewer dimensions.
        const effectiveMinLevel = this.computeMinimumZoomLevel();

        // The 'visualFitLevel' is the largest zoom level where the entire image
        // comfortably fits within the viewer's dimensions.
        const visualFitLevel = Math.ceil(Math.max(0, Math.min(effectiveMinLevel, Math.max(
            (Math.log(this.imageMetaInfo.width) - Math.log(MapGrid.ImagerySource.displayAreaWidth)),
            (Math.log(this.imageMetaInfo.height) - Math.log(MapGrid.ImagerySource.displayAreaHeight))) /
            Math.log(2))));

        this.zoomLevelAdjustment = effectiveMinLevel - visualFitLevel;

        // Calculate initial tile dimensions at the visual fit level.
        const currentWidth = this.imageMetaInfo.width / Math.pow(2, visualFitLevel);
        const currentHeight = this.imageMetaInfo.height / Math.pow(2, visualFitLevel);

        // Pre-calculate resolutions for available zoom levels.
        this.availableResolutions = [];
        for (let idx = visualFitLevel; idx >= 0; --idx) { // Changed loop direction and type
            this.availableResolutions.push(Math.pow(2, idx));
        }

        this.nominalTileDimension = new OpenLayers.Size(Math.ceil(currentWidth), Math.ceil(currentHeight));
    },

    /**
     * APIMethod: releaseResources
     * Cleans up any layer-specific resources.
     */
    releaseResources: function() {
        // No special cleanup beyond the parent class for now.
        OpenLayers.Layer.Grid.prototype.destroy.apply(this, arguments);
    },

    /**
     * APIMethod: duplicateLayer
     *
     * Parameters:
     * targetObject - {Object} An optional object to populate with cloned properties.
     *
     * Returns:
     * {<MapGrid.ImagerySource>} A new instance, a replica of this layer.
     */
    duplicateLayer: function (targetObject) {

        // Use a guard clause for targetObject
        if (!targetObject) {
            targetObject = new MapGrid.ImagerySource(this.name, this.url, this.options);
        }

        // Apply superclass cloning logic.
        targetObject = OpenLayers.Layer.Grid.prototype.clone.apply(this, [targetObject]);

        // No additional complex properties to deep copy beyond what OpenLayers.Class handles
        // or what is set in the constructor.

        return targetObject;
    },

    /**
     * Method: generateTileRequestURL
     *
     * Parameters:
     * tileBoundary - {<OpenLayers.Bounds>} The geographical bounds of the tile.
     *
     * Returns:
     * {String} A fully formed URL for retrieving the tile image.
     */
    generateTileRequestURL: function (tileBoundary) {
        const adjustedBounds = this.adjustBounds(tileBoundary);
        this.determineTileMetrics(adjustedBounds); // Calculate internal tile position and size

        const currentZoom = this.map.getZoom();
        const effectiveServiceLevel = currentZoom + this.zoomLevelAdjustment;

        // Construct the query string parameters.
        const queryParams = [
            `url_ver=${this.protocol_version}`,
            `rft_id=${this.resource_id_param}`,
            `svc_id=${this.service_identifier}`,
            `svc_val_fmt=${this.service_value_format}`,
            `svc.format=${this.output_format}`,
            `svc.level=${effectiveServiceLevel}`,
            `svc.rotate=0`,
            `svc.region=${this.tileLogicalPosition.lat},${this.tileLogicalPosition.lon},${this.effectiveImageSize.h},${this.effectiveImageSize.w}`
        ].join('&');

        let fullURL = MapGrid.ImagerySource.djatokaServiceURL + '?' + queryParams;

        // Handle multiple URLs if configured (e.g., for load balancing).
        if (Array.isArray(this.url)) {
            fullURL = this.selectUrl(fullURL, this.url);
        }
        // The original logic appended 'path' again, which is likely a bug or specific to a very old OL version.
        // Assuming 'selectUrl' returns the base URL and we append the query string.
        // If 'url' is a string, it's just the base URL.
        const finalUrl = Array.isArray(this.url) ? fullURL : this.url + fullURL; // Re-adding the base URL part

        return finalUrl;
    },

    /**
     * Method: createAndAttachTile
     * Creates, initializes, and adds a new image tile to the layer's rendering container.
     *
     * Parameters:
     * tileBounds - {<OpenLayers.Bounds>} The geographical extent of the new tile.
     * tilePosition - {<OpenLayers.Pixel>} The screen position for the tile.
     *
     * Returns:
     * {<OpenLayers.Tile.Image>} The newly created tile object.
     */
    createAndAttachTile: function(tileBounds, tilePosition) {
        this.determineTileMetrics(tileBounds); // Ensure metrics are up-to-date for this tile.
        const currentTileDimensions = this.effectiveImageSize; // Use the dynamically calculated size.
        return new OpenLayers.Tile.Image(this, tilePosition, tileBounds,
            null, currentTileDimensions);
    },

    /**
     * APIMethod: associateWithMap
     * This method is invoked when the layer is successfully added to a map instance.
     * It ensures the tile origin is set if it hasn't been already.
     *
     * Parameters:
     * mapInstance - {<OpenLayers.Map>} The map to which this layer is associated.
     */
    associateWithMap: function(mapInstance) {
        OpenLayers.Layer.Grid.prototype.setMap.apply(this, arguments);
        // Lazily initialize tileOriginCoordinate if not explicitly set.
        if (this.tileOriginCoordinate === undefined) {
            if (mapInstance && mapInstance.maxExtent) { // Guard clause for mapInstance and its properties
                this.tileOriginCoordinate = new OpenLayers.LonLat(mapInstance.maxExtent.left,
                    mapInstance.maxExtent.bottom);
            } else {
                console.warn("MapGrid.ImagerySource: Cannot determine tile origin; map or maxExtent is undefined.");
                this.tileOriginCoordinate = new OpenLayers.LonLat(0, 0); // Fallback
            }
        }
    },

    /**
     * Method: determineTileMetrics
     * Calculates the specific pixel position and size of a tile within the
     * overall image based on its geographical bounds and current map resolution.
     * This is crucial for OpenURL/Djatoka type services.
     *
     * Parameters:
     * currentBounds - {<OpenLayers.Bounds>} The bounds of the tile for which to calculate metrics.
     */
    determineTileMetrics: function(currentBounds) {
        // Recalculate x, y, width, height based on image extent, not just resolution.
        // The resolution can be approximate, so direct calculation from max extent is more robust.

        const mapExtent = this.map.getMaxExtent();
        const mapResolution = this.map.getResolution();

        // Calculate tile grid properties based on the nominal tile size.
        const horizontalTileCount = Math.round(1 / (this.nominalTileDimension.w / mapExtent.getWidth()));
        const verticalTileCount = Math.round(1 / (this.nominalTileDimension.h / mapExtent.getHeight()));

        // Determine the X-position and width of the current tile.
        const tileXIndex = Math.round((currentBounds.left / mapExtent.getWidth()) * horizontalTileCount);
        let calculatedX = tileXIndex * (this.nominalTileDimension.w + 1); // +1 might be for borders or specific service quirks

        let tileWidth;
        const totalXExtentPixels = mapExtent.getWidth() / mapResolution;
        if (tileXIndex === horizontalTileCount - 1) {
            // This is the last tile in the row, its width might be fractional.
            tileWidth = totalXExtentPixels % (this.nominalTileDimension.w + 1);
        } else {
            tileWidth = this.nominalTileDimension.w;
        }

        // Determine the Y-position and height of the current tile.
        // Djatoka often uses a top-down coordinate system for Y, so invert for OpenLayers' bottom-up.
        let invertedY = mapExtent.getHeight() - currentBounds.top;
        if (invertedY < 0) invertedY = 0; // Ensure non-negative.

        const tileYIndex = Math.round((invertedY / mapExtent.getHeight()) * verticalTileCount);
        let calculatedY = tileYIndex * (this.nominalTileDimension.h + 1);

        let tileHeight;
        const totalYExtentPixels = mapExtent.getHeight() / mapResolution;
        if (tileYIndex === verticalTileCount - 1) {
            // This is the last tile in the column.
            tileHeight = totalYExtentPixels % (this.nominalTileDimension.h + 1);
        } else {
            tileHeight = this.nominalTileDimension.h;
        }

        this.tileLogicalPosition = new OpenLayers.LonLat(calculatedX, calculatedY);
        this.effectiveImageSize = new OpenLayers.Size(tileWidth, tileHeight);
    },

    /**
     * Getter: retrieveImageMetadata
     * Returns the metadata object for the source image.
     * @returns {Object}
     */
    retrieveImageMetadata: function() {
        return this.imageMetaInfo;
    },

    /**
     * Getter: getAvailableResolutions
     * Returns an array of pre-calculated resolutions.
     * @returns {Array<Number>}
     */
    getAvailableResolutions: function() {
        return this.availableResolutions;
    },

    /**
     * Getter: getNominalTileSize
     * Returns the standard size for tiles at the base zoom level.
     * @returns {<OpenLayers.Size>}
     */
    getNominalTileSize: function() {
        return this.nominalTileDimension;
    },

    /**
     * Method: computeMinimumZoomLevel
     * Determines the smallest useful zoom level based on the image's internal
     * DWT (Discrete Wavelet Transform) levels and Djatoka's minimum dimension constraint.
     *
     * @returns {Number} The minimum zoom level.
     */
    computeMinimumZoomLevel: function() {
        let internalImageLevels;
        let djatokaMinLevels;

        // Djatoka metadata structures changed over time.
        // Adapt to either 'dwtLevels' (newer) or infer from 'levels' (older).
        if (this.imageMetaInfo.dwtLevels === undefined) {
            // Older Djatoka versions: 'levels' contains the full DWT levels.
            internalImageLevels = this.imageMetaInfo.levels;
            const largestDimension = Math.max(this.imageMetaInfo.width, this.imageMetaInfo.height);
            // Calculate levels needed to reach Djatoka's minimum output dimension.
            djatokaMinLevels = Math.floor((Math.log(largestDimension) -
                Math.log(MapGrid.ImagerySource.minimumDjatokaTileDimension)) /
                Math.log(2));
        } else {
            // Newer Djatoka versions: 'dwtLevels' is full image levels, 'levels' is Djatoka's internal min.
            internalImageLevels = this.imageMetaInfo.dwtLevels;
            djatokaMinLevels = this.imageMetaInfo.levels;
        }
        // The effective minimum level is the lesser of the two constraints.
        return Math.min(internalImageLevels, djatokaMinLevels);
    },

    CLASS_NAME: "MapGrid.ImagerySource"
});

// Static properties defining default viewer and service constraints.
MapGrid.ImagerySource.displayAreaWidth = 512;
MapGrid.ImagerySource.displayAreaHeight = 512;
MapGrid.ImagerySource.minimumDjatokaTileDimension = 48; // Smallest dimension Djatoka can return.
MapGrid.ImagerySource.djatokaServiceURL = '/adore-djatoka/resolver';