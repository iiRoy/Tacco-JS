control = {

  layerQueue:        [], /* Stores the ordered list of layer IDs to be processed. */
  imageQueue:        [], /* Holds a queue of images awaiting loading. */
  maxImageCount:     0,  // Total number of images expected to load for the current room.
  currentImageCount: 0,  // Counter for images currently being processed or loaded.
  failedImageLoad:   {}, // Dictionary to track images that failed to load, by URL.

  layersId:        [], // List of all layer IDs in the room.
  layersIdLength:  0,  // Number of layers. (Note: this property is declared but not explicitly updated in the provided code snippet.)

  gameObject:      {}, // Reference to the main game object (e.g., the current room data).
  currentRoomId:   null, // The unique identifier of the room currently being displayed.
  percentageOf:    9999999, // A large initial value used in calculations, possibly for scroll percentage.
  
  /*
   * These properties are stored directly on the 'control' object
   * to provide efficient access for animation and rendering logic.
   * While their values could be derived, direct access avoids repeated computation.
   */
  stageWidth:        null, // Width of the main game stage.
  stageHeight:       null, // Height of the main game stage.
  stageHolderWidth:  null, // Width of the DOM element holding the stage.
  stageHolderHeight: null, // Height of the DOM element holding the stage.

  loadingRoom: true, // Flag indicating whether a room loading operation is in progress.
  loadingItem: null, // Placeholder for an item currently being loaded (not used in snippet).
  loadtime:    {
    start: null, // Timestamp when the room loading process began.
    end:   null  // Timestamp when the room loading process concluded.
  },

  /**
   * Initializes the game control system and sets up event listeners.
   * Also triggers the initial room load.
   * @param {string} roomId The ID of the room to load first.
   */
  init: function ( roomId ) {

    // Attach a 'resize' event handler to the window.
    // This ensures that stage holder dimensions are updated if the browser window resizes.
    $( window ).bind( 'resize', function ( ) {
      try {
        control.stageHolderWidth  = $( '.stage_holder' ).width( );
        control.stageHolderHeight = $( '.stage_holder' ).height( );
      }
      /* Catch block for any errors during dimension retrieval. */
      catch ( er ) {
        // Intentionally do nothing; errors here are non-critical for core functionality.
      }
    } );
    
    // Set initial stage holder dimensions based on current window size.
    control.stageHolderWidth  = $( '.stage_holder' ).width( );
    control.stageHolderHeight = $( '.stage_holder' ).height( );

    // Initiate the loading of the specified room.
    this.loadRoom( roomId );

    // Perform player-specific initialization routines.
    player.init( );

  }, // end of init() method

  /*
   * Responsible for loading a new room into the game environment.
   * This involves clearing the old stage, resetting queues, and fetching room data.
   */
  loadRoom: function ( roomId ) {

    // Record the precise time when the room loading sequence begins.
    control.loadtime.start = new Date( );

    // Update the current room ID to the newly requested room.
    this.currentRoomId = roomId;

    // Start fading out the current stage to prepare for new content.
    // The stage will be emptied completely once new room data is available.
    $( '.stage' ).stop( true, false ); // Stop any active animations on the stage.
    $( '.stage' ).fadeTo( 1333, 0.1 ); // Fade to a low opacity over 1.333 seconds.
    $( '.location' ).text( '' ); // Clear the displayed location text.
    $( '.player_holder' ).remove( ); // Remove the current player sprite.
    $( '.other_player_holders' ).remove( ); // Remove other players' sprites.
    $( '.localChat ul' ).empty( ); // Clear local chat messages.
    player.otherUsers = {}; // Reset the list of other users.
    player.loaded = false; // Mark player as not yet loaded for the new room.
    $( '.exits' ).empty( ); // Clear all previously displayed exit links.

    // Reset the layer and image queues to ensure a clean slate for the new room.
    this.layerQueue = [];
    this.imageQueue = [];

    /*
     * Because the project loads data directly from GitHub (without a custom backend),
     * it uses a '.callback.json' file. This file contains a pre-defined callback
     * that invokes the 'getRoom()' function upon successful script loading.
     *
     * In a typical production setup, a backend script would fetch the JSON
     * and return it with a dynamically generated callback.
     *
     * Note: For a bespoke Glitch client, one could directly load JSON files
     * from GitHub using jQuery's getScript, circumventing cross-domain issues.
     */
    this.loadingRoom = true; // Set the flag to true, indicating a room is actively loading.
    $.getScript( 'http://revdancatt.github.io/CAT422-glitch-location-viewer/locations/' + roomId + '.callback.json' );

  }, // end of loadRoom() method

  /*
   * Prepares the visual stage for the room, setting its dimensions,
   * background gradient, and initial state.
   */
  prepStage: function ( ) {

    // Assign the current game object (room data) to a local variable for easier access.
    room = this.gameObject;

    // Update the browser window's title bar and the on-screen location display.
    document.title = 'MVURXI : ' + room.label;
    $( '.location' ).text( room.label );

    // Stop any ongoing animations on the stage, clear its contents,
    // scroll to the top, and then fade the stage back in.
    $( '.stage' ).stop( true, false ); // Ensure no previous animations interfere.
    $( '.stage' ).empty( ); // Remove all child elements from the stage.
    window.scrollTo( 0, 0 ); // Reset scroll position to the top-left.
    $( '.stage' ).fadeTo( 666, 1 ); // Fade in the stage to full opacity.
    $( '.loading_holder' ).fadeIn( 666 ); // Display the loading indicator.

    // Apply CSS styles to the stage element, defining its position,
    // overflow behavior, and calculated width/height from room data.
    $( '.stage' ).css( {
      position:  'absolute', // Position absolutely within its parent.
      overflow:  'hidden',   // Hide any content that extends beyond its bounds.
      width:     parseInt( room.dynamic.r, 10 ) - parseInt( room.dynamic.l, 10 ), // Calculate width.
      height:    parseInt( room.dynamic.b, 10 ) - parseInt( room.dynamic.t, 10 ), // Calculate height.
      'z-index': -1000 // Place the stage far in the background.
    } );
    
    // Store the calculated stage dimensions for quick access in the control object.
    control.stageWidth  = parseInt( room.dynamic.r, 10 ) - parseInt( room.dynamic.l, 10 );
    control.stageHeight = parseInt( room.dynamic.b, 10 ) - parseInt( room.dynamic.t, 10 );

    // Variables to hold the top and bottom gradient colors.
    var topGradient    = null;
    var bottomGradient = null;

    // Determine if the gradient colors are in hexadecimal string format or integer RGB.
    if ( room.gradient.top >> 16 === 0 && room.gradient.top >> 8 === 0 && ( room.gradient.top.length == 6 || room.gradient.top.length == 4 || room.gradient.top.length == 1 ) ) {

      topGradient = room.gradient.top;
      // Pad hex string with leading zeros if it's shorter than 6 characters.
      while ( topGradient.length < 6 ) {
        topGradient = '0' + topGradient;
      }
      topGradient = '#' + topGradient; // Prepend '#' for valid CSS hex color.

      bottomGradient = room.gradient.bottom;
      // Pad hex string for bottom gradient.
      while ( bottomGradient.length < 6 ) {
        bottomGradient = '0' + bottomGradient;
      }
      bottomGradient = '#' + bottomGradient;

    }
    else {
      // If not hex, assume integer RGB components and convert to 'rgb(R,G,B)' format.
      var r = ( ( room.gradient.top >> 16 ) & 0xff ); // Extract red component.
      var g = ( ( room.gradient.top >> 8 ) & 0xff );  // Extract green component.
      var b = ( ( room.gradient.top ) & 0xff );       // Extract blue component.
      topGradient = 'rgb(' + r + ',' + g + ',' + b + ')';

      r = ( ( room.gradient.bottom >> 16 ) & 0xff );
      g = ( ( room.gradient.bottom >> 8 ) & 0xff );
      b = ( ( room.gradient.bottom ) & 0xff );
      bottomGradient = 'rgb(' + r + ',' + g + ',' + b + ')';
    }

    // Apply the linear gradient background to the stage using various vendor prefixes.
    $( '.stage' ).css( 'background-image', '-webkit-gradient(linear, left top, left bottom, color-stop(0, ' + topGradient + '), color-stop(1, ' + bottomGradient + '))' );
    $( '.stage' ).css( 'background-image', '-o-linear-gradient(bottom, ' + topGradient + ' 0%, ' + bottomGradient + ' 100%)' );
    $( '.stage' ).css( 'background-image', '-moz-linear-gradient(bottom, ' + topGradient + ' 0%, ' + bottomGradient + ' 100%)' );
    $( '.stage' ).css( 'background-image', '-webkit-linear-gradient(bottom, ' + topGradient + ' 0%, ' + bottomGradient + ' 100%)' );
    $( '.stage' ).css( 'background-image', '-ms-linear-gradient(bottom, ' + topGradient + ' 0%, ' + bottomGradient + ' 100%)' );
    $( '.stage' ).css( 'background-image', 'linear-gradient(to bottom, ' + topGradient + ' 0%, ' + bottomGradient + ' 100%)' );

    // Update values relevant for scene scrolling, including the stage width.
    control.percentageOf = $( '.stage' ).width( ) - window.innerWidth;
    control.stageWidth   = $( '.stage' ).width( );

    // Mark room loading as complete and initiate the layer preparation process.
    this.loadingRoom = false;
    this.prepLayers( );

  }, // end of prepStage() method

  /*
   * Organizes and prepares individual layers for rendering.
   * Layers are ordered by their z-index from back to front.
   * This function creates the necessary DOM elements and canvas contexts for each layer.
   */
  prepLayers: function ( ) {

    // Determine the range of z-index values across all dynamic layers.
    var lowestZIndex  = 99999;  // Initialize with a high value.
    var highestZIndex = -99999; // Initialize with a low value.
    var sortedLayersList = [];  /* This variable is declared but not used for its intended purpose in the current implementation. */

    // Iterate through each layer in the room's dynamic data to find the min/max z-index.
    $.each( room.dynamic.layers, function ( id, layer ) {
      if ( layer.z < lowestZIndex )  lowestZIndex  = layer.z;  // Update lowest if current layer is lower.
      if ( layer.z > highestZIndex ) highestZIndex = layer.z; // Update highest if current layer is higher.
    } );

    /*
     * Populate the `layerQueue` with layer IDs, sorted by z-index.
     * This approach involves nested loops (O(N*M)) but is acceptable
     * given that it only executes once per room load and image loading
     * is the primary performance bottleneck.
     */
    this.layerQueue = []; // Clear any existing layers from the queue.
    for ( var z = lowestZIndex; z <= highestZIndex; z++ ) {
      // For each z-index value, iterate through layers to find matches.
      $.each( room.dynamic.layers, function ( id, layer ) {
        if ( layer.z == z ) {
          control.layerQueue.push( id );   // Add layer ID to the sorted queue.
          control.layersId.push( id );     // Add layer ID to the general list.
        }
      } );
    }

    // Variables used for creating and configuring layer elements.
    var filters    = [];
    var tintColor  = null;
    var tintAmount = null;
    var layer      = null;
    var id         = null;
    var newLayer   = null;
    var newCanvas  = null;
    var exitList   = $( '<ul>' ); // jQuery object to build a list of exit links.

    // Iterate through the sorted `layerQueue` to create and configure each layer.
    for ( var l = 0; l < this.layerQueue.length; l++ ) {
      id    = this.layerQueue[ l ];          // Get the current layer ID.
      layer = room.dynamic.layers[ id ]; // Get the full layer data.

      newLayer = $( '<div>' ); // Create a new `div` element for the layer.
      newLayer.attr( 'id', id ); // Assign the layer's ID to the div.
      newLayer.css( {
        'position':  'absolute', // Position the layer absolutely.
        'width':     parseInt( layer.w, 10 ), // Set width from layer data.
        'height':    parseInt( layer.h, 10 ), // Set height from layer data.
        'left':      0, // Align to the left edge.
        'top':       parseInt( $( '.stage' ).css( 'height' ), 10 ) - parseInt( layer.h, 10 ), // Position from bottom.
        'z-index':   parseInt( layer.z, 10 ) // Set CSS z-index for stacking order.
      } );

      // Create a new `canvas` element and attach it to the layer.
      newCanvas = $( '<canvas>' )
        .attr( { id: id + '_canvas', width: parseInt( layer.w, 10 ), height: parseInt( layer.h, 10 ) } )
        .css( { width: parseInt( layer.w, 10 ), height: parseInt( layer.h, 10 ) } )
        .css( { position: 'absolute', top: 0, left: 0 } );

      // Reset filter-related variables for the current layer.
      filters    = [];
      tintColor  = null;
      tintAmount = null;

      // Process any filters defined for this layer.
      for ( var filter in layer.filters ) {
        // Retrieve the filter value.
        filterValue = layer.filters[ filter ];

        // Handle 'brightness' filter.
        if ( filter == 'brightness' ) {

          // Negative brightness values (e.g., -100 to -1) map to a range from 0.0 to 1.0.
          if ( filterValue < 0 ) {
            filters.push( 'brightness(' + ( 1 - ( filterValue / -100 ) ) + ')' );
          }

          // Positive brightness values (e.g., 1 to 20) increase brightness beyond 100%.
          // Extreme positive values might require special handling for "white-out" effects.
          if ( filterValue > 0 ) {
            filters.push( 'brightness(' + ( 1 + ( filterValue / 100 ) ) + ')' );
            // TODO: If `filterValue` is extremely high, consider a "white-out" scenario.
          }
        }

        // Handle 'contrast' filter, following a similar logic to brightness.
        if ( filter == 'contrast' ) {
          if ( filterValue < 0 ) {
            filters.push( 'contrast(' + ( 1 - ( filterValue / -100 ) ) + ')' );
          }
          if ( filterValue > 0 ) {
            filters.push( 'contrast(' + ( 1 + ( filterValue / 100 ) ) + ')' );
          }
        }

        // Handle 'saturation' filter.
        if ( filter == 'saturation' ) {
          if ( filterValue < 0 ) {
            filters.push( 'saturation(' + ( 1 - ( filterValue / -100 ) ) + ')' );
          }
          if ( filterValue > 0 ) {
            filters.push( 'saturation(' + ( 1 + ( filterValue / 100 ) ) + ')' );
          }
        }

        // Note: The 'blur' filter is currently omitted due to performance concerns
        // when applied to complex DOM structures. It's intended for canvas rendering.
        if ( filter == 'tintColor' ) {
          tintColor = filterValue;
        }
        if ( filter == 'tintAmount' ) {
          tintAmount = filterValue;
        }
        // If both tint color and amount are present, apply the tint (logic not implemented yet).
        if ( tintColor !== null && tintAmount !== null ) {
          // Placeholder for tint application logic.
        }

        // Note: Tinting will be implemented when canvas rendering is more mature.
        if ( filter == 'blur' ) {
          // The original code had a commented-out line for blur:
          // filters.push('blur(' + filterValue + 'px)');
        }

      }

      // If any CSS filters were accumulated, apply them to the canvas element.
      if ( filters.length > 0 ) {
        var filterString = filters.join( ' ' );
        newCanvas.css( 'filter',         filterString );
        newCanvas.css( '-webkit-filter', filterString ); // Webkit prefix.
        newCanvas.css( '-moz-filter',    filterString ); // Mozilla prefix.
        newCanvas.css( '-o-filter',      filterString ); // Opera prefix.
        newCanvas.css( '-ms-filter',     filterString ); // Microsoft prefix.
      }

      // Append the canvas element to its parent layer div.
      newLayer.append( newCanvas );

      // Special handling for the 'middleground' layer: embed the player sprite.
      if ( id == 'middleground' ) {
        var playerSprite = $( '<div>' )
          .attr( 'class', 'player_holder' )
          .append(
            $( '<div>' )
              .attr( 'class', 'player_frame' )
              .append(
                $( '<div>' )
                  .attr( 'class', 'player' )
                  .css( 'background-image', 'url(img/glitchen/root_base.png)' ) // Set player image.
              )
          );
        playerSprite.append( $( '<div>' ).addClass( 'nameLabel' ).text( player.username ) ); // Add player's name label.

        // Temporarily set player position. This will later be dynamically sourced.
        player.setPosition( parseInt( layer.w, 10 ) / 2 + 100, 100 );
        newLayer.append( playerSprite ); // Add the player sprite to the layer.

        // If the player is connected to the backend, emit a 'joinroom' event.
        if ( player.connected ) {
          console.log( 'socket.emit: joinroom' ); // Log the event for debugging.
          socket.emit( 'joinroom', room.label, player.position.x, player.position.y, player.position.facing );
        }
      }

      // Attach the fully configured layer to the main stage.
      $( '.stage' ).append( newLayer );

      // Process signposts within this layer to generate navigation links.
      for ( var s in layer.signposts ) {
        
        signpost = layer.signposts[ s ];

        /*
         * TODO: The following block of code, related to signpost image assets,
         * is commented out in the original source, indicating missing assets
         * or incomplete implementation.
         *
         * newImg = $('<img>');
         * newImg.css({
         *     'position': 'absolute',
         *     'width': parseInt(signpost.w, 10),
         *     'height': parseInt(signpost.h, 10),
         *     'left': parseInt(signpost.x, 10) - (parseInt(signpost.w, 10)/2),
         *     'top': parseInt(signpost.y, 10) - (parseInt(signpost.h, 10) * 1),
         *     'z-index': 1000,
         *     'transform': (signpost.r ? 'rotate(' + parseInt(signpost.r, 10) + 'deg)' : '') + (signpost.h_flip ? ' scaleX(-1)' : ''),
         *     'transform-origin': 'bottom'
         * });
         * newImg.attr('src', 'img/scenery/' + signpost.name + '.png');
         * newLayer.append(newImg);
         */

        // For each connection defined within a signpost, create an exit link.
        for ( var c in signpost.connects ) {
          connection = signpost.connects[ c ];
          exitLink = $( '<li>' ).append( $( '<a>' ).attr( {
            id:   connection.tsid.replace( 'L', 'G' ), // Modify TSID for use as a DOM ID.
            href: '#/' + connection.tsid               // Set the navigation hash.
          } ).text( connection.label ) );
          exitList.append( exitLink ); // Add the generated link to the list.
        }
      }
    }

    // Add a heading and the compiled list of exit links to the '.exits' container.
    $( '.exits' ).append( $( '<h2>' ).text( 'Exits' ) );
    $( '.exits' ).append( exitList );
    
    // Bind a click event to all exit links to trigger room loading.
    $( '.exits a' ).bind( 'click', function ( ) {
      control.loadRoom( $( this ).attr( 'id' ) ); // Load the room specified by the link's ID.
    } );

    // Mark the player as fully loaded and ready within the new room context.
    player.loaded = true;

    // Proceed to prepare the individual items (decos) within each layer.
    this.prepItems( );
    
  }, // end of prepLayers() method

  /*
   * Sorts and organizes decorative items (decos) within each layer based on their z-index.
   * This converts raw 'decos' into an ordered 'items' array for each layer.
   */
  prepItems: function ( sortedLayersListParam ) {

    // Use the internally managed layer queue as the primary list of layers to process.
    sortedLayersList = this.layerQueue;

    // Declare variables used in the item preparation loop.
    var items          = null; /* This variable is declared but not assigned or used within the method. */
    var layerId        = null;
    var lowestZIndex   = 99999;  // Initial high value for finding minimum z-index.
    var highestZIndex  = -99999; // Initial low value for finding maximum z-index.
    var decoLength     = 0;      // Stores the number of decos in a layer.
    var deco           = null;   // Temporary variable for a single deco object.
    var z              = null;   // Temporary variable for a deco's z-index.

    // Reset the counter for the total number of images to be loaded.
    this.maxImageCount = 0;

    // Iterate through each layer in the sorted list.
    for ( var l = 0; l < sortedLayersList.length; l++ ) {
      layerId = sortedLayersList[ l ];
      
      // Initialize a new empty array to hold the sorted items for the current layer.
      room.dynamic.layers[ layerId ].items = [];

      // Reset z-index range for the current layer's decos.
      lowestZIndex  = 99999;
      highestZIndex = -99999;

      // Determine the highest and lowest z-index values among the decos in this layer.
      decoLength = room.dynamic.layers[ layerId ].decos.length;
      for ( var d = 0; d < decoLength; d++ ) {
        z = room.dynamic.layers[ layerId ].decos[ d ].z;
        if ( z < lowestZIndex )  lowestZIndex  = z;
        if ( z > highestZIndex ) highestZIndex = z;
      }

      /*
       * Loop from the highest z-index down to the lowest to populate the 'items' array.
       * This order ensures that items closest to the viewer are added first.
       * When items are later rendered (e.g., popped from a stack), those furthest
       * back will be processed first, maintaining correct visual depth.
       *
       * This sorting is an O(N^2) operation, but its impact is minimal as it only
       * occurs once per room load, and image loading is a much more significant factor.
       * Future optimizations could be considered if this becomes a bottleneck.
       */
      for ( var i = highestZIndex; i >= lowestZIndex; i-- ) {
        for ( d = 0; d < decoLength; d++ ) {
          if ( room.dynamic.layers[ layerId ].decos[ d ].z == i ) {
            room.dynamic.layers[ layerId ].items.push( room.dynamic.layers[ layerId ].decos[ d ] );
            this.maxImageCount++; // Increment the total count of images that will need to be loaded.
          }
        }
      }

      // After sorting, delete the original 'decos' array to free up memory.
      delete room.dynamic.layers[ layerId ].decos;

    }

    // Set the current image count to the maximum, useful for displaying loading progress.
    this.currentImageCount = this.maxImageCount;

    // Clear the record of any previously failed image loads.
    this.failedImageLoad = {};

    // TODO: A placeholder comment indicating that exit points should be added to the exit list here.

    // Proceed to the next stage: initiating the loading of all images.
    this.loadImages( );

  }, // end of prepItems() method

  /*
   * Manages the loading of images for the current room.
   * This function checks the `layerQueue` for pending layers.
   */
  loadImages: function ( ) {

    // If a room is currently in the process of being loaded,
    // exit this function to prevent premature or redundant image loading.
    if ( this.loadingRoom ) return;

    // The original comment ended here. It likely intended to continue with logic
    // to check if there are layers left in the queue and process them.
    // (e.g., "Check to see if we are still working on layers; if we have run out, then we're done.")