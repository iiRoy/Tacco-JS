// Original file: OpenLayers/Layer/OpenURL.js
// This file contains the implementation of the OpenURL layer for OpenLayers.
// Copyright (c) 2007-2009 UNC Chapel Hill University Library.
// Created by Hugh A. Cayless, with subsequent revisions by J. Clifford Dyer.
// Licensed under the Clear BSD license. For the complete text of the license,
// please refer to http://svn.openlayers.org/trunk/openlayers/license.txt .

// Required components for this layer:
// @requires OpenLayers/Layer/Grid.js - Provides the base grid layer functionality.
// @requires OpenLayers/Tile/Image.js - Used for handling individual image tiles.

// This file defines the `OpenLayers.Layer.OpenURL` class.
//
// Class: OpenLayers.Layer.OpenURL
//
// This layer type is designed to interact with OpenURL-compliant image servers,
// specifically those that can serve regions of images (like Djatoka).
// It extends the base OpenLayers.Layer.Grid class to manage image tiles.
//
// Inherits from:
// - OpenLayers.Layer.Grid: The foundation for grid-based layers.
//

OpenLayers.Layer.OpenURL = OpenLayers.Class( OpenLayers.Layer.Grid, {

    /**
     * APIProperty: isBaseLayer
     * {Boolean} Indicates if this layer should be treated as a base layer.
     *           Set to true for this OpenURL layer.
     */
    isBaseLayer : true, // This layer will be a base layer in the map.

    /**
     * APIProperty: tileOrigin
     * {<OpenLayers.Pixel>} The origin of the tile grid in pixel coordinates.
     *                      Defaults to null, set when the map is available.
     */
    tileOrigin : null , // The pixel coordinates of the tile origin.

    // OpenURL specific parameters, used in constructing image requests.
    url_ver       : 'Z39.88-2004', // The OpenURL version.
    rft_id        : null,          // The identifier for the requested resource.
    svc_id        : "info:lanl-repo/svc/getRegion", // The service identifier for region requests.
    svc_val_fmt   : "info:ofi/fmt:kev:mtx:jpeg2000", // The service value format.
    format        : null,          // The desired image format (e.g., "image/jpeg").
    tileHeight    : null,          // The height of a tile.

    /**
     * Constructor: OpenLayers.Layer.OpenURL
     *
     * Initializes a new OpenLayers.Layer.OpenURL instance.
     *
     * Parameters:
     * name    - {String} The name of the layer.
     * url     - {String} The URL of the OpenURL server (e.g., Djatoka resolver).
     * options - {Object} A hash of additional options to configure the layer.
     *           - rft_id: The identifier for the requested image.
     *           - format: The image format to request.
     *           - metadataUrl: URL to fetch image metadata if not provided directly.
     *           - imgMetadata: Pre-fetched image metadata object.
     */
    initialize : function(name, url, options) {

        // Prepare arguments for the superclass constructor.
        var newArguments = [ ] ;
        newArguments.push(name, url, { } , options);

        // Call the superclass (OpenLayers.Layer.Grid) constructor.
        OpenLayers.Layer.Grid.prototype.initialize.apply(this, newArguments);

        // Set OpenURL specific properties from options.
        this.rft_id = options.rft_id;
        this.format = options.format;

        // Obtain image metadata. If not provided in options, fetch it.
        if ( !options.imgMetadata ) {
            // Issue a synchronous request to get image metadata.
            var request = OpenLayers.Request.issue({
                url   : options.metadataUrl,
                async : false
            });
            // Parse the JSON response text into an object.
            this.imgMetadata = eval( '(' + request.responseText + ')' );
        } else {
            // Use the metadata provided directly in the options.
            this.imgMetadata = options.imgMetadata;
        }

        // Determine the minimum useful zoom level for the viewer.
        var minLevel = this.getMinLevel();

        // Calculate 'viewerLevel'. This represents the largest zoom level (smallest resolution)
        // at which the entire image still fits within the viewer's dimensions.
        // It's the highest level where the image is fully visible without scrolling.
        var viewerLevel = Math.ceil(
            Math.max(
                0,
                Math.min(
                    minLevel,
                    Math.max(
                        ( Math.log( this.imgMetadata.width )  - Math.log( OpenLayers.Layer.OpenURL.viewerWidth  ) ),
                        ( Math.log( this.imgMetadata.height ) - Math.log( OpenLayers.Layer.OpenURL.viewerHeight ) )
                    ) / Math.log( 2 )
                )
            )
        );

        // Calculate the zoom offset based on minLevel and viewerLevel.
        this.zoomOffset = minLevel - viewerLevel;

        // Calculate the width of the image at the viewerLevel.
        var w = this.imgMetadata.width / Math.pow(2, viewerLevel);

        // Calculate the height of the image at the viewerLevel.
        var h = this.imgMetadata.height / Math.pow(2, viewerLevel);

        // Initialize the resolutions array.
        this.resolutions = new Array();
        // Populate resolutions from viewerLevel down to 0.
        for ( var i = viewerLevel ; i >= 0 ; i-- ) {
            this.resolutions.push( Math.pow(2, i) );
        }

        // Set the tile size based on the calculated width and height.
        this.tileSize = new OpenLayers.Size( Math.ceil(w) , Math.ceil(h) );
    } ,

    /**
     * APIMethod: destroy
     * Cleans up the layer.
     *
     * Overrides the default destroy method from the superclass.
     */
    destroy : function( ) {
        // Currently, no specific cleanup is required for this layer beyond
        // what the superclass handles.
        OpenLayers.Layer.Grid.prototype.destroy.apply( this , arguments );
    } ,


    /**
     * APIMethod: clone
     * Creates a clone of this layer.
     *
     * Parameters:
     * obj - {Object} Optional object to extend with this layer's properties.
     *
     * Returns:
     * {<OpenLayers.Layer.OpenURL>} A new instance of this layer,
     *                              which is an exact clone.
     */
    clone : function ( obj ) {

        // If no object is provided, create a new OpenURL layer instance.
        if ( obj == null ) {
            obj = new OpenLayers.Layer.OpenURL( this.name ,
                                                this.url ,
                                                this.options );
        }

        // Apply all additions from superclasses to the cloned object.
        obj = OpenLayers.Layer.Grid.prototype.clone.apply( this , [obj] );

        // No non-initialization, non-simple values to copy here,
        // as they are handled by the constructor or metadata fetching.

        return obj; // Return the cloned object.
    } ,

    /**
     * Method: getURL
     * Constructs the URL for a specific tile, given its bounds.
     *
     * Parameters:
     * bounds - {<OpenLayers.Bounds>} The geographical bounds of the tile.
     *
     * Returns:
     * {String} The complete URL string for the tile image.
     */
    getURL : function ( bounds ) {
        // Adjust the bounds according to the layer's configuration.
        bounds = this.adjustBounds( bounds );
        // Calculate the tile's position and size based on the adjusted bounds.
        this.calculatePositionAndSize( bounds );

        // Determine the zoom level, adjusted by the layer's zoomOffset.
        var z = this.map.getZoom() + this.zoomOffset;

        // Construct the OpenURL path string with all necessary parameters.
        var path = OpenLayers.Layer.OpenURL.djatokaURL +
                   "?url_ver="     + this.url_ver     +
                   "&rft_id="      + this.rft_id      +
                   "&svc_id="      + this.svc_id      +
                   "&svc_val_fmt=" + this.svc_val_fmt +
                   "&svc.format="  + this.format      +
                   "&svc.level="   + z                +
                   "&svc.rotate=0" +
                   "&svc.region="  + this.tilePos.lat +
                   ","             + this.tilePos.lon +
                   ","             + this.imageSize.h +
                   ","             + this.imageSize.w ;

        // Get the base URL for the tile server.
        var url = this.url;
        // If the URL is an array, select one based on the path.
        if ( url instanceof Array ) {
            url = this.selectUrl( path , url );
        }

        // Combine the base URL and the OpenURL path to form the final tile URL.
        return url + path;
    } ,

    /**
     * Method: addTile
     * Creates and adds a new tile to the layer's grid.
     *
     * Parameters:
     * bounds   - {<OpenLayers.Bounds>} The geographical bounds for the new tile.
     * position - {<OpenLayers.Pixel>} The pixel position for the new tile.
     *
     * Returns:
     * {<OpenLayers.Tile.Image>} The newly created and added OpenLayers.Tile.Image object.
     */
    addTile : function( bounds , position ) {
        // Recalculate the tile's specific position and size based on its bounds.
        this.calculatePositionAndSize( bounds );
        // The size property of the layer.
        var size = this.size;
        // Create and return a new Image tile instance.
        return new OpenLayers.Tile.Image( this ,
                                          position ,
                                          bounds ,
                                          null , // No URL initially, will be fetched by getURL.
                                          this.imageSize );
    } ,

    /**
     * APIMethod: setMap
     * Called when the layer is added to a map.
     * This method ensures that the tile origin is set if it hasn't been already.
     *
     * Parameters:
     * map - {<OpenLayers.Map>} The map instance this layer is being added to.
     */
    setMap : function( map ) {
        // Call the superclass's setMap method first.
        OpenLayers.Layer.Grid.prototype.setMap.apply( this , arguments );

        // If tileOrigin is not yet defined, set it to the bottom-left corner of the map's max extent.
        if ( !this.tileOrigin ) {
            this.tileOrigin = new OpenLayers.LonLat( this.map.maxExtent.left ,
                                                     this.map.maxExtent.bottom );
        }
    } ,

    /**
     * Method: calculatePositionAndSize
     * Determines the pixel position and dimensions of a tile within the full image,
     * accounting for Djatoka's coordinate system.
     *
     * Parameters:
     * bounds - {<OpenLayers.Bounds>} The current tile's geographical bounds.
     */
    calculatePositionAndSize : function( bounds ) {
        // Recalculate x and y coordinates because the standard resolution might be off.
        // This is necessary to align with the Djatoka server's internal tile grid.

        // Get the maximum extent of the map.
        var max = this.map.getMaxExtent();

        // Calculate the number of horizontal tiles for the entire image.
        var xtiles = Math.round( 1 / ( this.tileSize.w / max.getWidth() ) );

        // Determine the horizontal tile index (xpos) based on the bounds.
        var xpos = Math.round( ( bounds.left / max.getWidth() ) * xtiles );

        // Set the x-coordinate for the tile position within the full image.
        var x = xpos * ( this.tileSize.w + 1 );

        var w , h ; // Variables for width and height of the current tile.

        // Calculate the full extent width based on the current map resolution.
        var xExtent = max.getWidth() / this.map.getResolution();

        // Adjust tile width for the last column if it's not a full tile.
        if ( xpos == xtiles - 1 ) {
            w = xExtent % ( this.tileSize.w + 1 );
        } else {
            w = this.tileSize.w;
        }

        // Repeat the process for the vertical (y) dimension.

        // Calculate the number of vertical tiles for the entire image.
        var ytiles = Math.round( 1 / ( this.tileSize.h / max.getHeight() ) );

        // Djatoka's coordinate system is top-down, so we invert for y.
        var y = max.getHeight() - bounds.top;
        // Ensure y is not negative.
        y = y < 0 ? 0 : y ;

        // Determine the vertical tile index (ypos).
        var ypos = Math.round( ( y / max.getHeight() ) * ytiles );

        // Set the y-coordinate for the tile position within the full image.
        y = ypos * ( this.tileSize.h + 1 );

        // Calculate the full extent height based on the current map resolution.
        var yExtent = max.getHeight() / this.map.getResolution();

        // Adjust tile height for the last row if it's not a full tile.
        if ( ypos == ytiles - 1 ) {
            h = yExtent % ( this.tileSize.h + 1 );
        } else {
            h = this.tileSize.h;
        }

        // Store the calculated tile position (x, y) and image size (w, h).
        this.tilePos   = new OpenLayers.LonLat( x , y );
        this.imageSize = new OpenLayers.Size( w , h );
    } ,

    /**
     * Method: getImageMetadata
     * Retrieves the metadata object for the image being displayed.
     *
     * Returns:
     * {Object} The image metadata object.
     */
    getImageMetadata : function( ) {
      return this.imgMetadata;
    } ,

    /**
     * Method: getResolutions
     * Returns the array of available resolutions for this layer.
     *
     * Returns:
     * {Array(Number)} An array of resolution values.
     */
    getResolutions : function( ) {
      return this.resolutions;
    } ,

    /**
     * Method: getTileSize
     * Returns the size of the tiles for this layer.
     *
     * Returns:
     * {<OpenLayers.Size>} The tile size object.
     */
    getTileSize : function( ) {
      return this.tileSize;
    } ,

    /**
     * Method: getMinLevel
     * Determines the minimum useful zoom level based on image metadata.
     * This accounts for variations in Djatoka versions regarding 'levels' and 'dwtLevels'.
     *
     * Returns:
     * {Number} The calculated minimum zoom level.
     */
    getMinLevel : function( ) {
        // Djatoka versions pre-April 17, 2009, used 'levels' for the number of
        // encoded image levels. Later versions introduced 'dwtLevels' for this,
        // and 'levels' then represented the levels between the full image size
        // and Djatoka's minimum returnable size.
        // We need the lesser of these two values to determine the true minimum level.

        var levelsInImg;          // Total levels encoded in the image.
        var levelsToDjatokaMin;   // Levels down to Djatoka's smallest dimension.

        // Check for the presence of 'dwtLevels' to infer Djatoka version behavior.
        if ( this.imgMetadata.dwtLevels === undefined ) {
            // Older Djatoka version: 'levels' contains the encoded levels.
            var maxImgDimension = Math.max( this.imgMetadata.width ,
                                            this.imgMetadata.height );
            levelsInImg = this.imgMetadata.levels;

            // Calculate levels to Djatoka's minimum level dimension manually.
            levelsToDjatokaMin = Math.floor(
                ( Math.log( maxImgDimension ) -
                  Math.log( OpenLayers.Layer.OpenURL.minDjatokaLevelDimension ) ) /
                Math.log( 2 )
            );
        } else {
            // Newer Djatoka version: 'dwtLevels' holds encoded levels, 'levels' holds min levels.
            levelsInImg        = this.imgMetadata.dwtLevels;
            levelsToDjatokaMin = this.imgMetadata.levels;
        }

        // Return the minimum of the two calculated level counts.
        return Math.min( levelsInImg , levelsToDjatokaMin );
    } ,

    /**
     * Constant: CLASS_NAME
     * {String} The name of this class.
     */
    CLASS_NAME : "OpenLayers.Layer.OpenURL"

}); // End of OpenLayers.Class definition.

// Static properties for the OpenLayers.Layer.OpenURL class.
// These define default viewer and Djatoka-specific dimensions.

// Default viewer width for calculating initial zoom levels.
OpenLayers.Layer.OpenURL.viewerWidth  = 512 ;

// Default viewer height for calculating initial zoom levels.
OpenLayers.Layer.OpenURL.viewerHeight = 512 ;

// Minimum dimension (in pixels) that Djatoka will return for a level.
OpenLayers.Layer.OpenURL.minDjatokaLevelDimension = 48 ;

// The base URL for the Djatoka resolver service.
OpenLayers.Layer.OpenURL.djatokaURL = '/adore-djatoka/resolver' ;