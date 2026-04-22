$( function ( ) {
  /*
   * Initialize canvas and context for drawing operations.
   * This is the main drawing surface for the game.
   */
  var canvas = $( '#canvas' )[ 0 ] ; // Get the DOM element for the canvas
  var context = canvas.getContext( '2d' ) ; // Obtain the 2D rendering context

  // Define the 'mouse' object, which encapsulates all mouse-related state and behavior.
  var mouse = {
    x : 0 ,
    y : 0 ,
    gridX : 0 ,
    gridY : 0 ,
    gameX : 0 ,
    gameY : 0 ,
    insideCanvas : false ,
    panDirection : "" , // Stores the current panning direction (e.g., "_top", "_left")
    panningThreshold : 48 , // Distance from edge to trigger panning
    panningVelocity : 24 , // Speed of panning
    /*
     * handlePanning function:
     * This method is responsible for calculating and applying viewport adjustments
     * based on the mouse's position near the canvas edges.
     * It also updates the mouse's game coordinates and pan direction.
     */
    handlePanning : function ( ) {
      var panDirection = "" ; // Temporary variable to build the pan direction string

      // Check if the mouse cursor is currently within the canvas boundaries
      if ( mouse.insideCanvas ) {
        /*
         * Handle vertical panning:
         * Check if mouse is near the top edge of the viewport.
         */
        if ( mouse.y <= game.viewportTop + mouse.panningThreshold && mouse.y >= game.viewportTop ) {
          game.viewportDeltaY = -mouse.panningVelocity ; // Pan upwards
          panDirection += "_top" ; // Append "_top" to the direction string
        }
        // Check if mouse is near the bottom edge of the viewport.
        else if ( mouse.y >= game.viewportTop + game.viewportHeight - mouse.panningThreshold && mouse.y <= game.viewportTop + game.viewportHeight ) {
          game.viewportDeltaY = mouse.panningVelocity ; // Pan downwards
          panDirection += "_bottom" ; // Append "_bottom" to the direction string
        }
        // If not near top or bottom, no vertical panning
        else {
          game.viewportDeltaY = 0 ;
          panDirection += "" ; // No change to panDirection
        }

        /*
         * Handle horizontal panning:
         * Check if mouse is near the left edge of the viewport.
         */
        if ( mouse.x < mouse.panningThreshold && mouse.y >= game.viewportTop && mouse.y <= game.viewportTop + game.viewportHeight ) {
          game.viewportDeltaX = -mouse.panningVelocity ; // Pan leftwards
          panDirection += "_left" ; // Append "_left"
        }
        // Check if mouse is near the right edge of the viewport.
        else if ( mouse.x > game.screenWidth - mouse.panningThreshold && mouse.y >= game.viewportTop && mouse.y <= game.viewportTop + game.viewportHeight ) {
          game.viewportDeltaX = mouse.panningVelocity ; // Pan rightwards
          panDirection += "_right" ; // Append "_right"
        }
        // If not near left or right, no horizontal panning
        else {
          game.viewportDeltaX = 0 ;
          panDirection += "" ; // No change
        }
      } /* end of if (mouse.insideCanvas) */

      /*
       * Boundary checks for horizontal panning:
       * Prevent panning beyond the map's left or right edges.
       */
      if ( ( game.viewportX + game.viewportDeltaX < 0 ) || ( game.viewportX + game.viewportDeltaX + game.screenWidth + ( sidebar.visible ? -sidebar.width : 0 ) > game.currentLevel.mapImage.width ) ) {
        game.viewportDeltaX = 0 ; // Stop horizontal panning if out of bounds
        // console.log (game.viewportX+game.viewportDeltaX +game.screenWidth+(sidebar.visible?-sidebar.width:0));
        // console.log (game.currentLevel.mapImage.width);
      }

      // Special handling for when sidebar is not visible and viewport exceeds map width
      if ( !sidebar.visible && ( game.viewportX + game.screenWidth > game.currentLevel.mapImage.width ) ) {
        game.viewportX = game.currentLevel.mapImage.width - game.screenWidth ; // Adjust viewport to map edge
        game.viewportDeltaX = 0 ; // Stop horizontal panning
      }

      /*
       * Boundary checks for vertical panning:
       * Prevent panning beyond the map's top or bottom edges.
       */
      if ( ( game.viewportY + game.viewportDeltaY < 0 ) || ( game.viewportY + game.viewportDeltaY + game.viewportHeight > game.currentLevel.mapImage.height ) ) {
        game.viewportDeltaY = 0 ; // Stop vertical panning if out of bounds
      }

      /*
       * Update panDirection string based on actual delta values.
       * If there was a pan direction but no actual movement, prefix with "no_pan".
       */
      if ( panDirection != "" ) {
        if ( game.viewportDeltaX == 0 && game.viewportDeltaY == 0 ) {
          panDirection = "no_pan" + panDirection ;
        } else {
          panDirection = "pan" + panDirection ;
        }
      }
      mouse.panDirection = panDirection ; // Store the final pan direction

      // Apply the calculated viewport deltas to update the game viewport coordinates
      game.viewportX += game.viewportDeltaX ;
      game.viewportY += game.viewportDeltaY ;

      // Recalculate mouse's game coordinates based on new viewport position
      mouse.gameX = mouse.x + game.viewportX - game.viewportLeft ;
      mouse.gameY = mouse.y + game.viewportY - game.viewportTop ;

      // Calculate viewport adjustment values for drawing elements relative to the viewport
      game.viewportAdjustX = game.viewportLeft - game.viewportX ;
      game.viewportAdjustY = game.viewportTop - game.viewportY ;
    } , // End of handlePanning function

    cursorLoop : 0 , // Counter for animating the mouse cursor
    /*
     * drawCursor function:
     * Renders the appropriate animated mouse cursor on the canvas.
     */
    drawCursor : function ( ) {
      // If mouse is not inside canvas, do not draw cursor
      if ( !this.insideCanvas ) {
        return ;
      }

      this.cursorLoop ++ ; // Increment cursor animation loop counter
      // Reset loop counter if it exceeds the total animation frames
      if ( this.cursorLoop >= this.cursor.cursorSpeed * this.cursor.count ) {
        this.cursorLoop = 0 ;
      }
      // alert(mouse.spriteImage) // Debugging line, commented out

      // If a drag selection is active, draw a white rectangle to indicate the selection area
      if ( this.dragSelect ) {
        var x = Math.min( this.gameX , this.dragX ) ; // Determine top-left X coordinate
        var y = Math.min( this.gameY , this.dragY ) ; // Determine top-left Y coordinate
        var width = Math.abs( this.gameX - this.dragX ) ; // Calculate width of the selection rectangle
        var height = Math.abs( this.gameY - this.dragY ) ; // Calculate height of the selection rectangle
        context.strokeStyle = 'white' ; // Set stroke color to white
        context.strokeRect( x + game.viewportAdjustX , y + game.viewportAdjustY , width , height ) ; // Draw the rectangle
      }

      // Calculate the correct frame for the animated cursor from the sprite sheet
      var imageNumber = this.cursor.spriteOffset + Math.floor( this.cursorLoop / this.cursor.cursorSpeed ) ;
      // Draw the cursor image onto the canvas
      context.drawImage( this.spriteImage , 30 * ( imageNumber ) , 0 , 30 , 24 , this.x - this.cursor.x , this.y - this.cursor.y , 30 , 24 ) ;
    } , // End of drawCursor function

    /*
     * checkOverObject function:
     * Determines if the mouse cursor is currently hovering over any game object (overlay, building, turret, unit).
     * Sets `mouse.overObject` to the detected object or null.
     */
    checkOverObject : function ( ) {
      this.overObject = null ; // Reset overObject before checking

      // Check for overlays (like tiberium fields)
      for ( var i = game.overlay.length - 1 ; i >= 0 ; i -- ) {
        var overlay = game.overlay[ i ] ;
        // If it's tiberium and mouse is on its grid cell, set it as overObject
        if ( overlay.name == 'tiberium' && this.gridX == overlay.x && this.gridY == overlay.y ) {
          // console.log(overlay.name + ' ' +overlay.x + ' ' +overlay.y + ' '+this.gridX + ' '+this.gridY )
          this.overObject = overlay ;
          // alert('overlay') // Debugging line, commented out
        }
      } ;

      // Check for buildings
      for ( var i = game.buildings.length - 1 ; i >= 0 ; i -- ) {
        if ( game.buildings[ i ].underPoint( this.gameX , this.gameY ) ) {
          this.overObject = game.buildings[ i ] ;
          break ; // Found a building, no need to check further
        }
      } ;

      // Check for turrets
      for ( var i = game.turrets.length - 1 ; i >= 0 ; i -- ) {
        if ( game.turrets[ i ].underPoint( this.gameX , this.gameY ) ) {
          this.overObject = game.turrets[ i ] ;
          break ; // Found a turret, no need to check further
        }
      } ;

      // Check for units
      for ( var i = game.units.length - 1 ; i >= 0 ; i -- ) {
        // Ensure unit has an 'underPoint' method before calling
        if ( game.units[ i ].underPoint && game.units[ i ].underPoint( this.gameX , this.gameY ) ) {
          this.overObject = game.units[ i ] ;
          break ; // Found a unit, no need to check further
        }
      } ;

      return this.overObject ; // Return the object currently under the mouse, or null
    } , // End of checkOverObject function

    /*
     * draw function:
     * This is the main drawing routine for the mouse.
     * It determines the appropriate cursor to display based on game state and mouse position,
     * and also handles drawing deployment grids or tooltips.
     */
    draw : function ( ) {
      this.cursor = this.cursors[ 'default' ] ; // Start with the default cursor
      var selectedObject = this.checkOverObject( ) ; // Check if mouse is over any game object

      // If mouse is outside the main game viewport area (e.g., in the top tab area)
      if ( this.y < game.viewportTop || this.y > game.viewportTop + game.viewportHeight ) {
        // Default cursor is used if too far up or down (outside game area)
      }
      // If sidebar is in deployment mode (building placement)
      else if ( sidebar.deployMode ) {
        var buildingType = buildings.types[ sidebar.deployBuilding ] || turrets.types[ sidebar.deployBuilding ] ;
        var grid = $.extend( [ ] , buildingType.gridShape ) ; // Get the building's grid shape
        grid.push( grid[ grid.length - 1 ] ) ; // Extend grid shape for visual effect (or for bib?)
        // grid.push(grid[1]); // Another potential extension, commented out

        // Iterate through the grid shape to highlight placement cells
        for ( var y = 0 ; y < grid.length ; y ++ ) {
          for ( var x = 0 ; x < grid[ y ].length ; x ++ ) {
            if ( grid[ y ][ x ] == 1 ) { // If this cell is part of the building's footprint
              // Check if placement is obstructed or out of bounds
              if ( mouse.gridY + y < 0 || mouse.gridY + y >= game.buildingObstructionGrid.length || mouse.gridX + x < 0 || mouse.gridX + x >= game.buildingObstructionGrid[ mouse.gridY + y ].length || game.buildingObstructionGrid[ mouse.gridY + y ][ mouse.gridX + x ] == 1 ) {
                // if (game.buildingObstructionGrid[mouse.gridY+y][mouse.gridX+x] == 1){ // Original condition
                game.highlightGrid( mouse.gridX + x , mouse.gridY + y , 1 , 1 , sidebar.placementRedImage ) ; // Red highlight for invalid placement
              } else {
                game.highlightGrid( mouse.gridX + x , mouse.gridY + y , 1 , 1 , sidebar.placementWhiteImage ) ; // White highlight for valid placement
              }
            }
          }
        }
      }
      // If sidebar is in repair mode
      else if ( sidebar.repairMode ) {
        // If hovering over a friendly building/turret that is damaged
        if ( selectedObject && selectedObject.team == game.currentLevel.team && ( selectedObject.type == 'building' || selectedObject.type == 'turret' ) && ( selectedObject.health < selectedObject.hitPoints ) ) {
          this.cursor = this.cursors[ 'repair' ] ; // Show repair cursor
        } else {
          this.cursor = this.cursors[ 'no_repair' ] ; // Show no-repair cursor
        }
      }
      // If sidebar is in sell mode
      else if ( sidebar.sellMode ) {
        // If hovering over a friendly building/turret
        if ( selectedObject && selectedObject.team == game.currentLevel.team && ( selectedObject.type == 'building' || selectedObject.type == 'turret' ) ) {
          this.cursor = this.cursors[ 'sell' ] ; // Show sell cursor
        } else {
          this.cursor = this.cursors[ 'no_sell' ] ; // Show no-sell cursor
        }
      }
      // If mouse is over the sidebar itself (when visible)
      else if ( sidebar.visible && mouse.x > sidebar.left ) {
        // Check if hovering over a button in the sidebar
        var hovButton = sidebar.hoveredButton( ) ;
        if ( hovButton ) {
          var tooltipName = hovButton.type ; // Default tooltip name
          // Customize tooltip name based on button type
          switch ( hovButton.type ) {
            case 'infantry' :
              tooltipName = infantry.types[ hovButton.name ].label ;
              break ;
            case 'building' :
              tooltipName = buildings.types[ hovButton.name ].label ;
              break ;
            case 'turret' :
              tooltipName = turrets.types[ hovButton.name ].label ;
              break ;
            case 'vehicle' :
              tooltipName = vehicles.types[ hovButton.name ].label ;
              break ;
          }
          var tooltipCost = "$" + hovButton.cost ; // Format cost for tooltip

          // Draw tooltip background
          context.fillStyle = 'black' ;
          context.fillRect( Math.round( this.x ) , Math.round( this.y + 16 ) , tooltipName.length * 5.5 + 8 , 32 ) ;
          context.strokeStyle = 'darkgreen' ;
          context.strokeRect( Math.round( this.x ) , Math.round( this.y + 16 ) , tooltipName.length * 5.5 + 8 , 32 ) ;
          context.fillStyle = 'darkgreen' ;

          // Draw tooltip text (name and cost)
          context.font = '12px "Command and Conquer"' ;
          context.fillText( tooltipName , Math.round( this.x + 4 ) , Math.round( this.y + 30 ) ) ;
          context.fillText( tooltipCost , Math.round( this.x + 4 ) , Math.round( this.y + 44 ) ) ;
        }
      }
      // If currently dragging to select units
      else if ( this.dragSelect ) {
        this.cursor = this.cursors[ 'default' ] ; // Show default cursor during drag select
      }
      // If hovering over a game object (and not in fog)
      else if ( selectedObject && !this.isOverFog ) {
        // If hovering over an enemy unit/building and friendly units are selected
        if ( selectedObject.team && selectedObject.team != game.currentLevel.team && game.selectedAttackers.length > 0 ) {
          this.cursor = this.cursors[ 'attack' ] ; // Show attack cursor
        }
        // Special case: friendly harvester selected alone
        else if ( game.selectedUnits.length == 1 && game.selectedUnits[ 0 ].name == 'harvester' && game.selectedUnits[ 0 ].team == game.currentLevel.team && ( selectedObject.name == 'tiberium' || selectedObject.name == 'refinery' ) ) {
          // If hovering over tiberium
          if ( selectedObject.name == 'tiberium' ) {
            this.cursor = this.cursors[ 'attack' ] ; // Harvester "attacks" tiberium to harvest
          }
          // If hovering over a friendly refinery
          if ( selectedObject.name == 'refinery' && selectedObject.team == game.currentLevel.team ) {
            this.cursor = this.cursors[ 'load_vehicle' ] ; // Harvester enters refinery
          }
        }
        // Special case: single friendly unit selected, and hovering over it
        else if ( game.selectedUnits.length == 1 && selectedObject.selected && selectedObject.team == game.currentLevel.team ) {
          if ( selectedObject.name == 'mcv' ) {
            this.cursor = this.cursors[ 'build_command' ] ; // MCV can deploy
          }
        }
        // If hovering over an unselected object (not tiberium)
        else if ( !selectedObject.selected && selectedObject.name != 'tiberium' ) {
          this.cursor = this.cursors[ 'select' ] ; // Show select cursor
        }
        // If hovering over tiberium
        else if ( selectedObject.name == 'tiberium' ) {
          // Check if the tiberium cell is obstructed for movement
          if ( game.obstructionGrid[ mouse.gridY ] && game.obstructionGrid[ mouse.gridY ][ mouse.gridX ] == 1 ) {
            this.cursor = this.cursors[ 'no_move' ] ; // Cannot move here
          } else {
            this.cursor = this.cursors[ 'move' ] ; // Can move here (e.g., to harvest)
          }
        }
      }
      // If panning is active (mouse near screen edge)
      else if ( this.panDirection && this.panDirection != "" ) {
        this.cursor = this.cursors[ this.panDirection ] ; // Show appropriate pan cursor
      }
      // If units are selected and mouse is over a valid move location
      else if ( game.selectedUnits.length > 0 ) {
        // Check if the grid cell is obstructed for movement (and not in fog)
        if ( game.obstructionGrid[ mouse.gridY ] && game.obstructionGrid[ mouse.gridY ][ mouse.gridX ] == 1 && !this.isOverFog ) {
          this.cursor = this.cursors[ 'no_move' ] ; // Show no-move cursor
        } else {
          this.cursor = this.cursors[ 'move' ] ; // Show move cursor
        }
      }

      // Finally, draw the determined cursor if the mouse is inside the canvas
      if ( this.insideCanvas ) {
        this.drawCursor( ) ;
      }
    } , // End of draw function

    /*
     * click function:
     * Handles mouse click events, distinguishing between left and right clicks.
     * Delegates clicks to appropriate handlers based on mouse position (tab area, sidebar, game area).
     */
    click : function ( ev , rightClick ) {
      // If click is in the top tab area
      if ( mouse.y <= game.viewportTop && mouse.y > game.viewportTop - 15 ) {
        // Options button area
        if ( mouse.x >= 0 && mouse.x < 160 ) {
          // alert ('No Options yet.'); // Placeholder
        }
        // Score button area
        else if ( mouse.x >= 320 && mouse.x < 480 ) {
          // alert ('Score button clicked'); // Placeholder
        }
        // Sidebar toggle button area
        else if ( mouse.x >= 480 && mouse.x < 640 ) {
          // alert ('Sidebar button clicked'); // Placeholder
          sidebar.visible = !sidebar.visible ; // Toggle sidebar visibility
        }
      }
      // If click is within the main game viewport area
      else if ( mouse.y >= game.viewportTop && mouse.y <= game.viewportTop + game.viewportHeight ) {
        // If sidebar is visible and click is within sidebar area
        if ( sidebar.visible && mouse.x > sidebar.left ) {
          // alert ('sidebar clicked'); // Placeholder
          sidebar.click( ev , rightClick ) ; // Delegate click to sidebar handler
        }
        // Otherwise, click is in the main game area
        else {
          game.click( ev , rightClick ) ; // Delegate click to game handler
          // alert('game area clicked'); // Placeholder
        }
      }
    } , // End of click function

    /*
     * listenEvents function:
     * Sets up all event listeners for mouse interactions on the canvas and document.
     */
    listenEvents : function ( ) {
      // Mouse movement handler
      $( '#canvas' ).mousemove( function ( ev ) {
        var offset = $( '#canvas' ).offset( ) ; // Get canvas position relative to document
        mouse.x = ev.pageX - offset.left ; // Calculate mouse X relative to canvas
        mouse.y = ev.pageY - offset.top ; // Calculate mouse Y relative to canvas

        // Update mouse's grid and game coordinates
        mouse.gridX = Math.floor( ( mouse.gameX ) / game.gridSize ) ;
        mouse.gridY = Math.floor( ( mouse.gameY ) / game.gridSize ) ;
        mouse.isOverFog = fog.isOver( mouse.gameX , mouse.gameY ) ; // Check if mouse is over fog of war
        // mouse.panDirection = mouse.handlePanning(); // Panning handled in drawMap
        // mouse.showAppropriateCursor(); // Cursor handled in draw

        // If mouse button is pressed, check for drag selection
        if ( mouse.buttonPressed ) {
          // If mouse has moved significantly since button press, activate drag select
          if ( Math.abs( mouse.dragX - mouse.gameX ) > 5 || Math.abs( mouse.dragY - mouse.gameY ) > 5 ) {
            mouse.dragSelect = true ;
          }
        } else {
          mouse.dragSelect = false ; // Reset drag select if button not pressed
        }
      } ) ;

      // Left click handler
      $( '#canvas' ).click( function ( ev ) {
        mouse.click( ev , false ) ; // Call click handler for left click
        mouse.dragSelect = false ; // Reset drag select state
        return false ; // Prevent default browser action
      } ) ;

      // Mouse button down handler
      $( '#canvas' ).mousedown( function ( ev ) {
        if ( ev.which == 1 ) { // If left mouse button
          mouse.buttonPressed = true ; // Set button pressed flag
          mouse.dragX = mouse.gameX ; // Store initial drag X position
          mouse.dragY = mouse.gameY ; // Store initial drag Y position
          ev.preventDefault( ) ; // Prevent default browser action (e.g., text selection)
        }
        return false ; // Prevent default browser action
      } ) ;

      // Right click handler (context menu)
      $( '#canvas' ).bind( 'contextmenu' , function ( ev ) {
        mouse.click( ev , true ) ; // Call click handler for right click
        return false ; // Prevent default browser context menu
      } ) ;

      // Mouse button up handler
      $( '#canvas' ).mouseup( function ( ev ) {
        if ( ev.which == 1 ) { // If left mouse button released
          if ( mouse.dragSelect ) { // If a drag selection occurred
            if ( !ev.shiftKey ) { // If Shift key is not pressed, clear existing selection
              game.clearSelection( ) ;
            }
            // Calculate selection rectangle coordinates
            var x1 = Math.min( mouse.gameX , mouse.dragX ) ;
            var y1 = Math.min( mouse.gameY , mouse.dragY ) ;
            var x2 = Math.max( mouse.gameX , mouse.dragX ) ;
            var y2 = Math.max( mouse.gameY , mouse.dragY ) ;
            // Iterate through units to select those within the drag rectangle
            for ( var i = game.units.length - 1 ; i >= 0 ; i -- ) {
              var unit = game.units[ i ] ;
              // Select friendly units that are not already selected and are within the rectangle
              if ( !unit.selected && unit.team == game.currentLevel.team && x1 <= unit.x * game.gridSize && x2 >= unit.x * game.gridSize && y1 <= unit.y * game.gridSize && y2 >= unit.y * game.gridSize ) {
                game.selectItem( unit , ev.shiftKey ) ; // Select the unit
              }
            } ;
            // mouse.dragSelect = false; // Reset drag select, handled by mousemove
          }
          mouse.buttonPressed = false ; // Reset button pressed flag
        }
        return false ; // Prevent default browser action
      } ) ;

      // Mouse leave canvas handler
      $( '#canvas' ).mouseleave( function ( ev ) {
        mouse.insideCanvas = false ; // Mouse is no longer inside the canvas
      } ) ;

      // Mouse enter canvas handler
      $( '#canvas' ).mouseenter( function ( ev ) {
        mouse.buttonPressed = false ; // Reset button pressed state on re-entry
        mouse.insideCanvas = true ; // Mouse is now inside the canvas
      } ) ;

      // Keyboard key press handler for the document
      $( document ).keypress( function ( ev ) {
        game.keyPressed( ev ) ; // Delegate key press to game handler
      } ) ;
    } , // End of listenEvents function

    loaded : false , // Flag to indicate if mouse assets are loaded
    preloadCount : 0 , // Counter for assets to preload
    loadedCount : 0 , // Counter for assets already loaded
    preloadImage : preloadImage , // Reference to global preloadImage function
    spriteImage : null , // Image object for cursor sprites
    cursors : [ ] , // Array to store cursor definitions
    cursorCount : 0 , // Total number of cursor sprites loaded
    /*
     * loadCursor function:
     * Defines a new cursor type and adds it to the `mouse.cursors` array.
     * Each cursor definition includes its offset for drawing and animation properties.
     */
    loadCursor : function ( name , x , y , imageCount , cursorSpeed ) {
      // Set default values if not provided
      if ( !x && !y ) {
        x = 0 ;
        y = 0 ;
      }
      if ( !cursorSpeed ) {
        cursorSpeed = 1 ;
      }
      if ( !imageCount ) {
        imageCount = 1 ;
      }
      // Store cursor definition
      this.cursors[ name ] = {
        x : x ,
        y : y ,
        name : name ,
        count : imageCount ,
        spriteOffset : this.cursorCount ,
        cursorSpeed : cursorSpeed
      } ;
      this.cursorCount += imageCount ; // Increment total cursor sprite count
    } , // End of loadCursor function

    /*
     * loadAllCursors function:
     * Preloads the cursor sprite sheet and defines all individual cursor types.
     */
    loadAllCursors : function ( ) {
      mouse.spriteImage = this.preloadImage( 'cursors.png' ) ; // Load the cursor sprite sheet image

      // Define various cursor types with their properties (name, x-offset, y-offset, image count, animation speed)
      mouse.loadCursor( 'attack' , 15 , 12 , 8 ) ;
      mouse.loadCursor( 'big_detonate' , 15 , 12 , 3 ) ;
      mouse.loadCursor( 'build_command' , 15 , 12 , 9 ) ;
      mouse.loadCursor( 'default' ) ;
      mouse.loadCursor( 'detonate' , 15 , 12 , 3 ) ;
      mouse.loadCursor( 'load_vehicle' , 15 , 12 , 3 , 2 ) ;

      // Placeholder cursors
      mouse.loadCursor( 'unknown' ) ;
      mouse.loadCursor( 'unknown' ) ;

      mouse.loadCursor( 'move' , 15 , 12 ) ;
      mouse.loadCursor( 'no_default' ) ;
      mouse.loadCursor( 'no_move' , 15 , 12 ) ;

      // Panning cursors (no_pan variants)
      mouse.loadCursor( 'no_pan_bottom' , 15 , 24 ) ;
      mouse.loadCursor( 'no_pan_bottom_left' , 0 , 24 ) ;
      mouse.loadCursor( 'no_pan_bottom_right' , 30 , 24 ) ;
      mouse.loadCursor( 'no_pan_left' , 0 , 12 ) ;
      mouse.loadCursor( 'no_pan_right' , 30 , 12 ) ;
      mouse.loadCursor( 'no_pan_top' , 15 , 0 ) ;
      mouse.loadCursor( 'no_pan_top_left' , 0 , 0 ) ;
      mouse.loadCursor( 'no_pan_top_right' , 30 , 0 ) ;

      mouse.loadCursor( 'no_repair' , 15 , 0 ) ;
      mouse.loadCursor( 'no_sell' , 15 , 12 ) ;

      // Panning cursors (pan variants)
      mouse.loadCursor( 'pan_bottom' , 15 , 24 ) ;
      mouse.loadCursor( 'pan_bottom_left' , 0 , 24 ) ;
      mouse.loadCursor( 'pan_bottom_right' , 30 , 24 ) ;
      mouse.loadCursor( 'pan_left' , 0 , 12 ) ;
      mouse.loadCursor( 'pan_right' , 30 , 12 ) ;
      mouse.loadCursor( 'pan_top' , 15 , 0 ) ;
      mouse.loadCursor( 'pan_top_left' , 0 , 0 ) ;
      mouse.loadCursor( 'pan_top_right' , 30 , 0 ) ;

      mouse.loadCursor( 'repair' , 15 , 0 , 24 ) ;
      mouse.loadCursor( 'select' , 15 , 12 , 6 , 2 ) ;
      mouse.loadCursor( 'sell' , 15 , 12 , 24 ) ;
    } // End of loadAllCursors function
  } ; // End of mouse object definition

  /*
   * The 'game' object encapsulates global game state and core functionalities.
   * This includes screen dimensions, viewport settings, game loop, and map drawing.
   */
  var game = {
    screenWidth : canvas.width , // Width of the game canvas
    screenHeight : canvas.height , // Height of the game canvas
    viewportTop : 35 , // Top offset for the game viewport
    viewportLeft : 0 , // Left offset for the game viewport
    viewportX : 0 , // Current X position of the viewport on the map
    viewportY : 0 , // Current Y position of the viewport on the map
    viewportDeltaX : 0 , // Change in viewport X position per frame
    viewportDeltaY : 0 , // Change in viewport Y position per frame
    gridSize : 24 , // Size of a single grid cell in pixels
    animationLoop : null , // Reference to the animation loop interval
    animationTimeout : 50 , // Delay for the animation loop in milliseconds
    debugMode : false , // Flag for debugging features
    speedAdjustmentFactor : 0.2 , // Factor to adjust game speed

    /*
     * setViewport function:
     * Defines the clipping region for the game viewport, ensuring drawing
     * only occurs within the visible game area, excluding the sidebar.
     */
    setViewport : function ( ) {
      context.beginPath( ) ; // Start a new path
      // Calculate viewport width based on sidebar visibility
      this.viewportWidth = ( sidebar.visible ) ? ( this.screenWidth - sidebar.width ) : this.screenWidth ;
      this.viewportHeight = 480 ; // Fixed viewport height
      // Define the rectangular clipping region
      context.rect( this.viewportLeft , this.viewportTop , this.viewportWidth - this.viewportLeft , this.viewportHeight ) ;
      context.clip( ) ; // Apply the clipping region to the context
    } , // End of setViewport function

    /*
     * drawMap function:
     * Draws the current level's map image onto the canvas, applying viewport
     * transformations and updating obstruction grids based on game objects.
     */
    drawMap : function ( ) {
      // context.drawImage(this.currentLevel.mapImage,0,0); // Original full map draw, commented out
      mouse.handlePanning( ) ; // Update viewport based on mouse panning

      // Draw a portion of the map image corresponding to the current viewport
      context.drawImage( this.currentLevel.mapImage ,
        this.viewportX , this.viewportY , this.viewportWidth , this.viewportHeight ,
        this.viewportLeft , this.viewportTop , this.viewportWidth , this.viewportHeight ) ;

      // Initialize various obstruction grids for pathfinding and building placement
      game.obstructionGrid = [ ] ; // General obstructions (units, buildings, terrain)
      game.heroObstructionGrid = [ ] ; // Obstructions for hero units (may differ in fog)
      game.buildingObstructionGrid = [ ] ; // Obstructions for building placement

      // Populate obstruction grids from the current level's base obstruction data
      for ( var y = 0 ; y < this.currentLevel.obstructionGrid.length ; y ++ ) {
        game.obstructionGrid[ y ] = [ ] ;
        game.heroObstructionGrid[ y ] = [ ] ;
        game.buildingObstructionGrid[ y ] = [ ] ;
        for ( var x = 0 ; x < this.currentLevel.obstructionGrid[ y ].length ; x ++ ) {
          game.obstructionGrid[ y ][ x ] = this.currentLevel.obstructionGrid[ y ][ x ] ;
          game.heroObstructionGrid[ y ][ x ] = this.currentLevel.obstructionGrid[ y ][ x ] ;
          game.buildingObstructionGrid[ y ][ x ] = this.currentLevel.obstructionGrid[ y ][ x ] ;
        }
      }

      // Add buildings to obstruction grids
      for ( var i = this.buildings.length - 1 ; i >= 0 ; i -- ) {
        var bldng = this.buildings[ i ] ;
        for ( var y = 0 ; y < bldng.gridShape.length ; y ++ ) {
          for ( var x = 0 ; x < bldng.gridShape[ y ].length ; x ++ ) {
            if ( bldng.gridShape[ y ][ x ] == 1 ) { // If this cell is part of the building's footprint
              game.obstructionGrid[ y + bldng.y ][ x + bldng.x ] = 1 ;
              game.heroObstructionGrid[ y + bldng.y ][ x + bldng.x ] = 1 ;
              game.buildingObstructionGrid[ y + bldng.y ][ x + bldng.x ] = 1 ;

              // Include an extra row below the building as a no-building zone (for 'bib' - Building In Base)
              if ( y == bldng.gridShape.length - 1 ) {
                game.buildingObstructionGrid[ y + 1 + bldng.y ][ x + bldng.x ] = 1 ;
              }
            }
          }
        }
      } ;

      // Add turrets to obstruction grids (turrets occupy a single grid cell)
      for ( var i = this.turrets.length - 1 ; i >= 0 ; i -- ) {
        game.obstructionGrid[ this.turrets[ i ].y ][ this.turrets[ i ].x ] = 1 ;
        // These lines seem to be using bldng.y and bldng.x which are from the previous loop.
        // This is likely a copy-paste error in the original code and should probably use this.turrets[i].y and x.
        // However, as per Type I cloning rules, I must preserve the original code exactly.
        game.heroObstructionGrid[ y + bldng.y ][ x + bldng.x ] = 1 ;
        game.buildingObstructionGrid[ y + bldng.y ][ x + bldng.x ] = 1 ;
      } ;

      // Add units to obstruction grids (primarily for building obstruction, as units can move)
      for ( var i = this.units.length - 1 ; i >= 0 ; i -- ) {
        var unit = this.units[ i ] ;

        var x = unit.x ;
        var y = unit.y ;
        // var collisionRadius = unit.collisionRadius/game.gridSize; // Collision radius, commented out

        // Mark the unit's current grid cell as obstructed for building placement
        game.buildingObstructionGrid[ Math.floor( y ) ][ Math.floor( x ) ] = 1 ;
        // The following lines are commented out in the original code, so they remain so.
        // game.obstructionGrid[Math.floor(y-collisionRadius)][Math.floor(x-collisionRadius)] = 1;
        // game.obstructionGrid[Math.floor(y-collisionRadius)][Math.floor(x+collisionRadius)] = 1;
        // game.obstructionGrid[Math.floor(y+collisionRadius)][Math.floor(x-collisionRadius)] = 1;
      }
    } // End of drawMap function
  } ; // End of game object definition
} ) ;