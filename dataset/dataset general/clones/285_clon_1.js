var /* Global namespace initialization */ GSVPANO = GSVPANO || {}; // Ensure GSVPANO exists

GSVPANO.PanoLoader = function /* Constructor for PanoLoader */ ( parameters ) {

    'use strict' ; // Enforce strict mode for better code quality

    var _parameters = parameters || { } /* Store configuration parameters */ ,
        _location, /* The geographic location (lat/lng) */
        _zoom, /* Current zoom level for panorama tiles */
        _panoId, /* The unique panorama ID */
        _panoClient = new google.maps.StreetViewService ( ) , // Google Street View service instance
        _count = 0 /* Counter for loaded tiles */ ,
        _total = 0 /* Total number of tiles expected */ ,
        _canvas = document.createElement ( 'canvas' ) /* Offscreen canvas for composing tiles */ ,
        _ctx = _canvas.getContext ( '2d' ) /* 2D rendering context for the canvas */ ,
        rotation = 0 /* Panorama rotation angle */ ,
        pitch = 0 /* Panorama pitch angle */ ,
        copyright = '' /* Copyright information for the panorama */ ,
        onSizeChange = null /* Callback for size changes (not currently used) */ ,
        onPanoramaLoad = null ; // Callback triggered when panorama is fully loaded

  this . setProgress = function ( p )
  {
      if ( this . onProgress )
      { // Check if a progress callback is defined
          this . onProgress ( p ) ; // Invoke the progress callback
      }
  } ; // End of setProgress method

this . throwError = function ( message ) {
    /* Handles error reporting */
    if ( this . onError )
    { // If a custom error handler is provided
        this . onError ( message ) ; // Call the custom handler
    } else {
        console . error ( message ) ; // Otherwise, log to console
    }
} ;

  this . adaptTextureToZoom = function ( )
  {
      // Adjusts the canvas size based on the current zoom level
      var w = 416 * Math . pow ( 2 , _zoom ) ,
          h = ( 416 * Math . pow ( 2 , _zoom - 1 ) ) ;

      _canvas . width = w ;
      _canvas . height = h ;

      // Flip the context horizontally for correct tile orientation
      _ctx . translate ( _canvas . width , 0 ) ;
      _ctx . scale ( -1 , 1 ) ;
  } ;

this . composeFromTile = function ( x , y , texture )
{
    // Draws a single tile onto the canvas
    _ctx . drawImage ( texture , x * 512 , y * 512 ) ;

    _count ++ ; // Increment the count of loaded tiles

    var p = Math . round ( _count * 100 / _total ) ;
    this . setProgress ( p ) ; // Update loading progress

    if ( _count === _total )
    { // If all tiles have been loaded
        this . canvas = _canvas ; // Expose the composed canvas
        if ( this . onPanoramaLoad )
        { // Trigger the panorama loaded callback
            this . onPanoramaLoad ( ) ;
        }
    }
} ;

  this . composePanorama = function ( panoId )
  {
      this . setProgress ( 0 ) ; // Reset progress to 0

      console . log ( 'Loading panorama for zoom ' + _zoom + '...' ) ;

      var w = ( _zoom == 3 ) ? 7 : Math . pow ( 2 , _zoom ) , // Calculate width based on zoom
          h = Math . pow ( 2 , _zoom - 1 ) , // Calculate height based on zoom
          self = this , // Reference to 'this' for inner functions
          url , // Variable to hold tile URL
          x , // X-coordinate for tile loop
          y ; // Y-coordinate for tile loop

      _count = 0 ; // Reset tile counter
      _total = w * h ; // Calculate total number of tiles

      for ( y = 0 ; y < h ; y ++ )
      {
          for ( x = 0 ; x < w ; x ++ )
          {
              url = 'http://maps.google.com/cbk?output=tile&panoid=' + panoId + '&zoom=' + _zoom + '&x=' + x + '&y=' + y + '&' + Date . now ( ) ;

              ( function ( x , y ) { // Create a closure to capture x and y for each image request
                  var img = new Image ( ) ;
                  img . addEventListener ( 'load' , function ( ) {
                      self . composeFromTile ( x , y , this ) ; // Draw tile when loaded
                  } ) ;
                  img . crossOrigin = '' ; // Enable CORS for images
                  img . src = url ; // Set image source to trigger loading
              } ) ( x , y ) ; // Immediately invoke the closure
          }
      }
  } ;

this . load = function ( location , callback )
{
    console . log ( 'Load for' , location ) ; // Log the location being loaded

    var self = this ; // Store reference to 'this' for the callback scope

    _panoClient . getPanoramaByLocation ( location , 50 , function ( result , status ) {
        // Callback from Google Street View Service
        if ( status === google . maps . StreetViewStatus . OK )
        {
            if ( self . onPanoramaData ) self . onPanoramaData ( result ) ; // Notify if panorama data is available

            rotation = result . tiles . centerHeading * Math . PI / 180.0 ; // Calculate rotation
            pitch = result . tiles . originPitch ; // Get pitch
            copyright = result . copyright ; // Store copyright
            self . copyright = result . copyright ; // Expose copyright on instance
            _panoId = result . location . pano ; // Store panorama ID
            self . location = location ; // Expose location on instance
            self . rotation = rotation ; // Expose rotation on instance
            self . pitch = pitch ; // Expose pitch on instance
            self . image_date = result . imageDate ; // Expose image date
            self . id = _panoId ; // Expose panorama ID on instance

            callback ( ) ; // Proceed with the main callback
        } else {
            if ( self . onNoPanoramaData ) self . onNoPanoramaData ( status ) ; // Notify if no panorama data
            self . throwError ( 'Could not retrieve panorama for the following reason: ' + status ) ; // Report error
            callback ( ) ; // Still call callback to allow flow to continue
        }
    } ) ;
} ;

  this . setZoom = function ( z )
  {
      _zoom = z ; // Update the internal zoom level
      this . adaptTextureToZoom ( ) ; // Recalculate canvas size based on new zoom
  } ;

this . setZoom ( _parameters . zoom || 1 ) ; // Initialize zoom level from parameters or default to 1