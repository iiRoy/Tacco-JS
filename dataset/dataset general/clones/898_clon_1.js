// This file defines a custom Leaflet TileLayer for drawing masked canvas tiles.
// It extends L.TileLayer.Canvas to provide additional masking capabilities.

L.TileLayer.MaskCanvas = L.TileLayer.Canvas.extend ( {
  options : {
    radius            : 5 ,
    useAbsoluteRadius : true ,  /* true: radius in meters, false: radius in pixels */
    color             : '#000' ,
    opacity           : 0.5 ,
    noMask            : false , // true results in normal (filled) circled, instead masked circles
    lineColor         : undefined , // color of the circle outline if noMask is true
    debug             : false
  } , // End of options object

  initialize : function ( options , data ) {
    // Store a reference to 'this' for use in nested functions.
    var self = this ;
    L.Util.setOptions ( this , options ) ;

    this.drawTile = function ( tile , tilePoint , zoom ) {
      /*
       * Context object for drawing operations.
       * Contains the canvas, tile point, and current zoom level.
       */
      var ctx = {
        canvas    : tile ,
        tilePoint : tilePoint ,
        zoom      : zoom
      } ;

      // Check if debug information should be drawn.
      if ( self.options.debug ) {
        self._drawDebugInfo ( ctx ) ;
      }

      // Perform the actual drawing.
      this._draw ( ctx ) ;
    } ; // End of drawTile function definition
  } , // End of initialize method

  _drawDebugInfo : function ( ctx ) {
    var max = this.tileSize ;
    var g = ctx.canvas.getContext ( '2d' ) ;

    g.globalCompositeOperation = 'destination-over' ;
    g.strokeStyle = '#000000' ;
    g.fillStyle = '#FFFF00' ;

    g.strokeRect ( 0 , 0 , max , max ) ;

    g.font = "12px Arial" ;

    g.fillRect ( 0 , 0 , 5 , 5 ) ;
    g.fillRect ( 0 , max - 5 , 5 , 5 ) ;
    g.fillRect ( max - 5 , 0 , 5 , 5 ) ;
    g.fillRect ( max - 5 , max - 5 , 5 , 5 ) ;
    g.fillRect ( max / 2 - 5 , max / 2 - 5 , 10 , 10 ) ;

    // Display tile coordinates and zoom level for debugging.
    g.strokeText ( ctx.tilePoint.x + ' ' + ctx.tilePoint.y + ' ' + ctx.zoom , max / 2 - 30 , max / 2 - 10 ) ;
  } , // End of _drawDebugInfo method

  setData : function ( dataset ) {
    // Preserve context for callback functions.
    var self = this ;


    this.bounds = new L.LatLngBounds ( dataset ) ;

    // Initialize a QuadTree for efficient spatial querying of data points.
    this._quad = new QuadTree ( this._boundsToQuery ( this.bounds ) , false , 6 , 6 ) ;

    var first = dataset [ 0 ] ;
    var xc = 1 , yc = 0 ;

    // Determine coordinate keys based on data type.
    if ( first instanceof L.LatLng ) {
      xc = "lng" ;
      yc = "lat" ;
    }

    // Insert each data point into the QuadTree.
    dataset.forEach ( function ( d ) {
      self._quad.insert ( {
        x : d [ xc ] , //longitude
        y : d [ yc ]   //latitude
      } ) ;
    } ) ;

    // Redraw the layer if it's already on a map.
    if ( this._map ) {
      this.redraw ( ) ;
    }
  } , // End of setData method

  setRadius : function ( radius ) {
    // Update the radius option and trigger a redraw.
    this.options.radius = radius ;
    this.redraw ( ) ;
  } , // End of setRadius method

  _tilePoint : function ( ctx , coords ) {
    // Calculate start coordinates for the current tile in pixel space.
    var s = ctx.tilePoint.multiplyBy ( this.options.tileSize ) ;

    // Project actual geographic coordinates to pixel space on the map.
    var p = this._map.project ( new L.LatLng ( coords.y , coords.x ) ) ;

    // Calculate the point to draw relative to the tile's top-left corner.
    var x = Math.round ( p.x - s.x ) ;
    var y = Math.round ( p.y - s.y ) ;

    return [ x , y ] ;
  } , // End of _tilePoint method

  _drawPoints : function ( ctx , coordinates ) {
    var c        = ctx.canvas ,
        g        = c.getContext ( '2d' ) ,
        self     = this ,
        p        ,
        tileSize = this.options.tileSize ;

    // Set the fill style for the circles.
    g.fillStyle = this.options.color ;

    // Check for outline color for circles.
    if ( this.options.lineColor ) {
      g.strokeStyle = this.options.lineColor ;
      g.lineWidth = this.options.lineWidth || 1 ;
    }

    // Set global composite operation.
    g.globalCompositeOperation = 'source-over' ;

    // If masking is enabled, fill the tile and then use 'destination-out'.
    if ( ! this.options.noMask ) {
      g.fillRect ( 0 , 0 , tileSize , tileSize ) ;
      g.globalCompositeOperation = 'destination-out' ;
    }

    // Iterate over coordinates and draw each point.
    coordinates.forEach ( function ( coords ) {
      p = self._tilePoint ( ctx , coords ) ;
      g.beginPath ( ) ;
      g.arc ( p [ 0 ] , p [ 1 ] , self._getRadius ( ) , 0 , Math.PI * 2 ) ;
      g.fill ( ) ;

      // Draw the outline if lineColor is specified.
      if ( self.options.lineColor ) {
        g.stroke ( ) ;
      }
    } ) ; // End of forEach loop
  } , // End of _drawPoints method

  _boundsToQuery : function ( bounds ) {
    // Handle empty datasets to prevent errors.
    if ( bounds.getSouthWest ( ) == undefined ) { return { x : 0 , y : 0 , width : 0.1 , height : 0.1 } ; } // for empty data sets

    // Convert Leaflet bounds object to a query object suitable for QuadTree.
    return {
      x      : bounds.getSouthWest ( ) .lng ,
      y      : bounds.getSouthWest ( ) .lat ,
      width  : bounds.getNorthEast ( ) .lng - bounds.getSouthWest ( ) .lng ,
      height : bounds.getNorthEast ( ) .lat - bounds.getSouthWest ( ) .lat
    } ;
  } , // End of _boundsToQuery method

  _getLatRadius : function ( ) {
    // Calculate latitude radius in degrees.
    return ( this.options.radius / 40075017 ) * 360 ;
  } , // End of _getLatRadius method

  _getLngRadius : function ( ) {
    // Calculate longitude radius in degrees, accounting for latitude distortion.
    return this._getLatRadius ( ) / Math.cos ( L.LatLng.DEG_TO_RAD * this._latlng.lat ) ;
  } , // End of _getLngRadius method

  /*
   * Method to update the internal radius based on the current map zoom and center.
   * This is crucial when useAbsoluteRadius is true.
   */
  projectLatlngs : function ( ) {
    var lngRadius = this._getLngRadius ( ) ,
        latlng2   = new L.LatLng ( this._latlng.lat , this._latlng.lng - lngRadius , true ) ,
        point2    = this._map.latLngToLayerPoint ( latlng2 ) ,
        point     = this._map.latLngToLayerPoint ( this._latlng ) ;

    // Calculate the pixel radius based on projected points.
    this._radius = Math.max ( Math.round ( point.x - point2.x ) , 1 ) ;
  } , // End of projectLatlngs method

  /*
   * Determine the effective radius for drawing.
   * Can be either an absolute pixel value or derived from a metric radius.
   */
  _getRadius : function ( ) {
    if ( this.options.useAbsoluteRadius ) {
      return this._radius ;
    } else {
      return this.options.radius ;
    }
  } , // End of _getRadius method

  _draw : function ( ctx ) {
    // Do nothing if QuadTree or map is not initialized.
    if ( ! this._quad || ! this._map ) {
      return ;
    }

    var tileSize = this.options.tileSize ;

    // Calculate tile's northwest and southeast pixel coordinates.
    var nwPoint = ctx.tilePoint.multiplyBy ( tileSize ) ;
    var sePoint = nwPoint.add ( new L.Point ( tileSize , tileSize ) ) ;

    // If using absolute radius, re-project the radius for the current tile.
    if ( this.options.useAbsoluteRadius ) {
      var centerPoint = nwPoint.add ( new L.Point ( tileSize / 2 , tileSize / 2 ) ) ;
      this._latlng = this._map.unproject ( centerPoint ) ;
      this.projectLatlngs ( ) ;
    }

    // Add padding to the tile bounds to ensure circles near edges are fully drawn.
    var pad = new L.Point ( this._getRadius ( ) , this._getRadius ( ) ) ;
    nwPoint = nwPoint.subtract ( pad ) ;
    sePoint = sePoint.add ( pad ) ;

    // Convert padded pixel bounds back to geographic bounds.
    var bounds = new L.LatLngBounds ( this._map.unproject ( sePoint ) , this._map.unproject ( nwPoint ) ) ;

    // Retrieve coordinates within the calculated bounds from the QuadTree.
    var coordinates = this._quad.retrieveInBounds ( this._boundsToQuery ( bounds ) ) ;

    // Draw the retrieved points on the canvas.
    this._drawPoints ( ctx , coordinates ) ;
  } // End of _draw method
} ) ; // End of L.TileLayer.MaskCanvas extend call

// Factory function for creating a MaskCanvas tile layer instance.
L.TileLayer.maskCanvas = function ( options ) {
  var mc = new L.TileLayer.MaskCanvas ( options ) ;

  // Determine Leaflet version to handle API differences for tile creation.
  var leafletVersion = parseInt ( L.version.match ( /\d{1,}\.(\d{1,})\.\d{1,}/ ) [ 1 ] , 10 ) ;

  if ( leafletVersion < 7 ) {
    mc._createTile = mc._oldCreateTile ; // Assign old createTile method for older Leaflet versions.
  }

  return mc ;
} ; // End of maskCanvas factory function