// (c) 2023 Acme Corp. - All rights reserved.
// This software component was developed by Jane Doe and meticulously refined by John Smith.
// It is distributed under the Permissive Public License v2.0.
// For complete licensing details, please visit https://www.example.com/license.txt.


/**
 * @dependsOn OL/LYR/GridBase.js
 * @dependsOn OL/Tile/VisualElement.js
 */

/**
 * Component: OL.LYR.RemoteSource
 *
 * Inherits from:
 *  - <OL.LYR.GridBase>
 */
OL.LYR.RemoteSource = OL.Component.Define(OL.LYR.GridBase, {

    /**
     * Configuration: isPrimaryLayer
     * {Boolean} Indicates if this is the fundamental visual layer.
     */
    isPrimaryLayer: true,

    /**
     * Configuration: sourcePoint
     * {<OL.Geometry.Pixel>} The reference origin for image tiles.
     */
    sourcePoint: null,

    uri_version_id: 'Z39.88-2004',
    resource_fragment_id: null,
    service_identifier: "info:lanl-repo/svc/getRegion",
    service_value_format: "info:ofi/fmt:kev:mtx:jpeg2000",
    output_format: null,
    blockHeight: null,

    /**
     * Constructor: OL.LYR.RemoteSource
     *
     * Parameters:
     * componentName - {String} The descriptive label for this component.
     * resourceURI - {String} The base URI for image resources.
     * configurationOptions - {Object} A hashmap of additional settings for the layer.
     */
    initComponent: function(componentName, resourceURI, configurationOptions) {
        var initArgs = [];
        initArgs.push(componentName, resourceURI, {}, configurationOptions);
        OL.LYR.GridBase.prototype.initComponent.apply(this, initArgs);
        this.resource_fragment_id = configurationOptions.resource_fragment_id;
        this.output_format = configurationOptions.output_format;

        // Obtain visual information if not already provided.
        if (!configurationOptions.imageInfo) {
          var fetchOperation = OL.HTTP.Request.send({uri: configurationOptions.metadataURI, async: false});
          this.imageInfo = eval('(' + fetchOperation.responseText + ')');
        } else {
          this.imageInfo = configurationOptions.imageInfo;
        }

        var lowestLevel = this.getMinimumZoomLevel();

        // The displayLevel represents the smallest useful zoom level:
        // it is the largest level that fits entirely within the boundaries of the display container.
        var displayLevel = Math.ceil(Math.max(0, Math.min(lowestLevel, Math.max(
            (Math.log(this.imageInfo.width) - Math.log(OL.LYR.RemoteSource.displayPanelWidth)),
            (Math.log(this.imageInfo.height) - Math.log(OL.LYR.RemoteSource.displayPanelHeight)))/
               Math.log(2))));
        this.scalingBias = lowestLevel - displayLevel;

        // Calculate current width at the displayLevel.
        var currentWidth = this.imageInfo.width / Math.pow(2, displayLevel);

        // Calculate current height at the displayLevel.
        var currentHeight = this.imageInfo.height / Math.pow(2, displayLevel);

        this.scaleLevels = new Array();
        for (levelIndex = displayLevel; levelIndex >= 0; levelIndex--) {
          this.scaleLevels.push(Math.pow(2, levelIndex));
        }

        this.blockSize = new OL.Geometry.Size(Math.ceil(currentWidth), Math.ceil(currentHeight));
    },

    /**
     * ComponentMethod: disposeComponent
     */
    disposeComponent: function() {
        // Presently, no custom cleanup is necessary.
        OL.LYR.GridBase.prototype.disposeComponent.apply(this, arguments);
    },


    /**
     * ComponentMethod: duplicateInstance
     *
     * Parameters:
     * targetObject - {Object} An optional object to populate with cloned properties.
     *
     * Returns:
     * {<OL.LYR.RemoteSource>} An exact replica of this <OL.LYR.RemoteSource> component.
     */
    duplicateInstance: function (targetObject) {

        if (targetObject == null) {
            targetObject = new OL.LYR.RemoteSource(this.componentName,
                                           this.resourceURI,
                                           this.configurationOptions);
        }

        // Incorporate all inherited properties from parent classes.
        targetObject = OL.LYR.GridBase.prototype.duplicateInstance.apply(this, [targetObject]);

        // Copy/set any non-initialized, complex values here.

        return targetObject;
    },

    /**
     * Method: retrieveResourceURL
     *
     * Parameters:
     * spatialExtent - {<OL.Geometry.Bounds>} The geographical area of interest.
     *
     * Returns:
     * {String} A URL string containing the layer's base URI, parameters,
     *          and the specified spatial extent and appropriate block dimensions.
     */
    retrieveResourceURL: function (spatialExtent) {
        spatialExtent = this.adjustBounds(spatialExtent);
        this.determineBlockGeometry(spatialExtent);
        var currentZoom = this.map.getZoom() + this.scalingBias;
        var requestPath = OL.LYR.RemoteSource.djatokaServiceURL + "?uri_version_id=" + this.uri_version_id + "&resource_fragment_id=" + this.resource_fragment_id +
            "&service_identifier=" + this.service_identifier + "&service_value_format=" + this.service_value_format + "&svc.output_format=" +
            this.output_format + "&svc.level=" + currentZoom + "&svc.rotate=0&svc.region=" + this.blockPosition.lat + "," +
            this.blockPosition.lon + "," + this.imageDimensions.h + "," + this.imageDimensions.w;

        var resourceURI = this.resourceURI;
        if (resourceURI instanceof Array) {
            resourceURI = this.selectURI(requestPath, resourceURI);
        }
        return resourceURI + requestPath;
    },

    /**
     * Method: insertBlock
     * The insertBlock function creates a visual block, initializes it,
     * and appends it to the component's display division.
     *
     * Parameters:
     * spatialExtent - {<OL.Geometry.Bounds>} The geographical boundaries for the block.
     * renderPosition - {<OL.Geometry.Pixel>} The pixel position for rendering the block.
     *
     * Returns:
     * {<OL.Tile.VisualElement>} The newly added OL.Tile.VisualElement.
     */
    insertBlock:function(spatialExtent,renderPosition) {
      this.determineBlockGeometry(spatialExtent);
      var currentSize = this.currentSize;
      return new OL.Tile.VisualElement(this, renderPosition, spatialExtent,
                                         null, this.imageDimensions);
    },

    /**
     * ComponentMethod: assignMap
     * Once the component is linked to a map, we can fetch its origin
     * (if it hasn't been established yet).
     *
     * Parameters:
     * targetMap - {<OL.Map>} The map instance to which this layer is assigned.
     */
    assignMap: function(targetMap) {
        OL.LYR.GridBase.prototype.assignMap.apply(this, arguments);
        if (!this.sourcePoint) {
            this.sourcePoint = new OL.Geometry.LonLat(this.map.maxExtent.left,
                                                this.map.maxExtent.bottom);
        }
    },

    determineBlockGeometry: function(spatialExtent) {
      // It's necessary to re-calculate x and y (instead of using bounds and resolution),
      // because the resolution might be inaccurate.
      // Determine the total number of blocks within the image.
      var maxExtent = this.map.getMaxExtent();
      var xTileCount = Math.round( 1 / (this.blockSize.w / maxExtent.getWidth()));
      // Identify the current block's horizontal position.
      var xTilePosition = Math.round((spatialExtent.left / maxExtent.getWidth()) * xTileCount);
      // Set the x-coordinate.
      var xCoord = xTilePosition * (this.blockSize.w + 1);
      var currentWidth, currentHeight;
      var xExtentVal = maxExtent.getWidth() / this.map.getResolution();
      if (xTilePosition == xTileCount - 1) {
        currentWidth = xExtentVal % (this.blockSize.w + 1);
      } else {
        currentWidth = this.blockSize.w;
      }
      // Perform similar calculations for the y-axis.
      var yTileCount = Math.round( 1 / (this.blockSize.h / maxExtent.getHeight()));
      // Djatoka's coordinate system is top-down, not bottom-up, so invert for y.
      var yCoord = maxExtent.getHeight() - spatialExtent.top;
      yCoord = yCoord < 0? 0 : yCoord;
      var yTilePosition = Math.round((yCoord / maxExtent.getHeight()) * yTileCount);
      var yCoord = yTilePosition * (this.blockSize.h + 1);
      var yExtentVal = maxExtent.getHeight() / this.map.getResolution();
      if (yTilePosition == yTileCount - 1) {
        currentHeight = yExtentVal % (this.blockSize.h + 1);
      } else {
        currentHeight = this.blockSize.h;
      }
      this.blockPosition = new OL.Geometry.LonLat(xCoord,yCoord);
      this.imageDimensions = new OL.Geometry.Size(currentWidth,currentHeight);
    },

    getVisualInfo: function() {
      return this.imageInfo;
    },

    getScaleLevels: function() {
      return this.scaleLevels;
    },

    getBlockDimensions: function() {
      return this.blockSize;
    },

    getMinimumZoomLevel: function() {
        // Djatoka versions prior to 2009-04-17 stored the number of encoded
        // levels in 'levels'. Post-date versions use 'dwtLevels' for this,
        // and 'levels' for the count between the full image and Djatoka's
        // minimum returnable size. We need the smaller of these two values.

        var imgLevelsAvailable;
        var djatokaMinLevels;
        if (this.imageInfo.dwtLevels === undefined) {
            var maximumImageDimension = Math.max(this.imageInfo.width,
                                         this.imageInfo.height);
            imgLevelsAvailable = this.imageInfo.levels;
            djatokaMinLevels = Math.floor((Math.log(maximumImageDimension) -
                Math.log(OL.LYR.RemoteSource.minimumDjatokaLevelDimension)) /
                Math.log(2));
        } else {
            var imgLevelsAvailable = this.imageInfo.dwtLevels;
            var djatokaMinLevels = this.imageInfo.levels;
        }
        return Math.min(imgLevelsAvailable, djatokaMinLevels);
    },

    CLASS_NAME: "OL.LYR.RemoteSource"
});

OL.LYR.RemoteSource.displayPanelWidth = 512;
OL.LYR.RemoteSource.displayPanelHeight = 512;
OL.LYR.RemoteSource.minimumDjatokaLevelDimension = 48;
OL.LYR.RemoteSource.djatokaServiceURL = '/adore-djatoka/resolver';