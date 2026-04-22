ig.module ( 'plugins.gui' )
.requires (
  'impact.game'
)
.defines ( function ( ) {

  // This object serves as the main container for all GUI functionalities.
  ig.gui = {

    /*
     * General configuration flags for the GUI system.
     */
    show       : true ,  // Determines if the GUI should be rendered.
    initialized: false,  // Flag to ensure one-time initialization.

    /*
     * Defines the cursor properties and its drawing logic.
     */
    cursor: {
      pos   : { x : 0 , y : 0 } , /* Current screen coordinates of the cursor. */
      offset: { x : 0 , y : 0 } , /* Drawing offset for the cursor image.    */
      image : null              , /* The ig.Image object used for the cursor. */

      /**
       * Assigns a new image to be used as the cursor.
       * @param {Object} image - The ig.Image instance.
       */
      set : function ( image ) {
        this . image = image ;
      } ,

      /**
       * Clears the current cursor image, effectively hiding it.
       */
      clear : function ( ) {
        this . image = null ;
      } ,

      /**
       * Renders the cursor image at its calculated position.
       */
      draw : function ( ) {
        // Only draw if an image has been assigned to the cursor.
        if ( this . image != null ) {
          this . image . draw ( this . pos . x - this . offset . x , this . pos . y - this . offset . y ) ;
        }
      }
    } , // End of cursor object definition.

    /*
     * Array to hold all interactive GUI elements.
     */
    elements : [ ] ,

    /*
     * Provides methods for managing individual GUI elements or groups.
     */
    element : {

      /*
       * List of available actions that can be performed on GUI elements:
       *   - 'getByName',  'name' : Retrieves element(s) by their unique name.
       *   - 'getByGroup', 'name' : Retrieves element(s) belonging to a specific group.
       *   - 'show',       'name' : Makes a named element visible.
       *   - 'showGroup',  'name' : Makes all elements in a group visible.
       *   - 'hide',       'name' : Hides a named element.
       *   - 'hideGroup',  'name' : Hides all elements within a specified group.
       *   - 'remove',     'name' : Removes a named element from the GUI.
       *   - 'removeGroup','name' : Removes all elements belonging to a group.
       *   - 'enable',     'name' : Enables a named element.
       *   - 'enableGroup','name' : Enables all elements in a group.
       *   - 'disable',    'name' : Disables a named element.
       *   - 'disableGroup','name': Disables all elements in a group.
       *   - 'disableAll'        : Disables every single GUI element.
       */
      action : function ( action , name ) {
        var collection = [ ] ; // Temporary array to store retrieved elements.

        // Iterate through all registered GUI elements.
        for ( var i = 0 ; i < ig . gui . elements . length ; i ++ ) {

          // Action: getByName - collects elements matching the given name.
          if ( action == 'getByName' && ig . gui . elements [ i ] . name == name ) {
            collection . push ( ig . gui . elements [ i ] ) ;
          }

          // Action: getByGroup - collects elements belonging to the specified group.
          if ( action == 'getByGroup' && ig . gui . elements [ i ] . group == name ) {
            collection . push ( ig . gui . elements [ i ] ) ;
          }

          // Action: show - sets a named element's 'show' property to true.
          if ( action == 'show' && ig . gui . elements [ i ] . name == name ) {
            ig . gui . elements [ i ] . show = true ;
          }

          // Action: showGroup - sets 'show' to true for all elements in a group.
          if ( action == 'showGroup' && ig . gui . elements [ i ] . group == name ) {
            ig . gui . elements [ i ] . show = true ;
          }

          // Action: hide - sets a named element's 'show' property to false.
          if ( action == 'hide' && ig . gui . elements [ i ] . name == name ) {
            ig . gui . elements [ i ] . show = false ;
          }

          // Action: hideGroup - sets 'show' to false for all elements in a group.
          if ( action == 'hideGroup' && ig . gui . elements [ i ] . group == name ) {
            ig . gui . elements [ i ] . show = false ;
          }

          // Action: remove - removes a named element from the elements array.
          if ( action == 'remove' && ig . gui . elements [ i ] . name == name ) {
            ig . gui . elements . erase ( ig . gui . elements [ i ] ) ;
          }

          // Action: removeGroup - removes all elements of a group.
          if ( action == 'removeGroup' && ig . gui . elements [ i ] . group == name ) {
            ig . gui . elements . erase ( ig . gui . elements [ i ] ) ;
          }

          // Action: enable - sets a named element's 'disable' property to false.
          if ( action == 'enable' && ig . gui . elements [ i ] . name == name ) {
            ig . gui . elements [ i ] . disable = false ;
          }

          // Action: enableGroup - sets 'disable' to false for all elements in a group.
          if ( action == 'enableGroup' && ig . gui . elements [ i ] . group == name ) {
            ig . gui . elements [ i ] . disable = false ;
          }

          // Action: disable - sets a named element's 'disable' property to true.
          // Note: The original code uses 'enable' for this check, preserving this logic.
          if ( action == 'enable' && ig . gui . elements [ i ] . name == name ) {
            ig . gui . elements [ i ] . disable = true ;
          }

          // Action: disableGroup - sets 'disable' to true for all elements in a group.
          // Note: The original code uses 'enableGroup' for this check, preserving this logic.
          if ( action == 'enableGroup' && ig . gui . elements [ i ] . group == name ) {
            ig . gui . elements [ i ] . disable = true ;
          }

          // Action: disableAll - sets 'disable' to true for every single element.
          if ( action == 'disableAll' ) {
            ig . gui . elements [ i ] . disable = true ;
          }
        } // End of for loop.

        // Return collected elements if any were found.
        if ( collection . length ) {
          if ( collection . length == 1 ) {
            collection = collection [ 0 ] ; // Return single element directly if only one.
          }
          return collection ;
        }
      } , // End of 'action' method.

      /**
       * Adds a new element to the GUI system.
       * Initializes default properties (show, disabled, active) if they are undefined.
       * @param {Object} element - The GUI element object to add.
       */
      add : function ( element ) {
        if ( element . show     == undefined ) { element . show     = true ;  }
        if ( element . disabled == undefined ) { element . disabled = false ; }
        if ( element . active   == undefined ) { element . active   = false ; }
        ig . gui . elements . push ( element ) ; // Add the element to the collection.
      } ,

      /**
       * Draws all active and visible GUI elements.
       * Handles state changes (normal, hover, active) based on cursor interaction.
       */
      draw : function ( ) {
        for ( var i = 0 ; i < ig . gui . elements . length ; i ++ ) {
          var element = ig . gui . elements [ i ] ,
              state   = 'normal' ; // Default state for the element.

          // Skip drawing if the element is not configured to be shown.
          if ( ! element . show ) {
            continue ;
          }

          /*
           * Determine if the cursor is currently hovering over the element.
           * Checks cursor position against element's bounding box and ensures element is not disabled.
           */
          if ( ig . gui . cursor . pos . x >= element . pos . x &&
               ig . gui . cursor . pos . x <= element . pos . x + element . size . x &&
               ig . gui . cursor . pos . y >= element . pos . y &&
               ig . gui . cursor . pos . y <= element . pos . y + element . size . y &&
               ! element . disabled
             ) {
            state = 'hover' ; // Set state to 'hover' if conditions are met.
          }

          // Handle mouse press events when hovering.
          if ( state == 'hover' && ( ig . input . state ( 'mouse1' ) || ig . input . pressed ( 'mouse1' ) ) ) {
            state = 'active' ; // Transition to 'active' state.

            // If mouse button is held down and element has a mouseDown function, call it.
            if ( ig . input . state ( 'mouse1' ) && typeof ig . gui . elements [ i ] . mouseDown == 'function' ) {
              ig . gui . elements [ i ] . mouseDown . call ( element ) ;
            }

            // If mouse button was just pressed (clicked).
            if ( ig . input . pressed ( 'mouse1' ) ) {
              // If element has a toggle behavior, flip its active status.
              if ( element . toggle ) {
                element . active = ! element . active ;
              }
              // If element has a click function, call it.
              if ( typeof ig . gui . elements [ i ] . click == 'function' ) {
                ig . gui . elements [ i ] . click . call ( element ) ;
              }
            }
          }

          // If the element is a toggle and is currently active, force 'active' state.
          if ( element . toggle && element . active ) {
            state = 'active' ;
          }

          // Fallback to 'normal' state if the determined state is not defined for the element's 'state' object.
          if ( ig . gui . elements [ i ] . state [ state ] == undefined ) {
            state = 'normal' ;
          }

          // Apply a custom alpha value for drawing if specified by the element.
          if ( element . alpha != undefined ) {
            ig . system . context . globalAlpha = element . alpha ;
          }

          // Retrieve the appropriate image for the current state and draw it.
          var image = ig . gui . elements [ i ] . state [ state ] ;
          if ( isNaN ( image . tile ) || isNaN ( image . tileSize ) ) {
            image . image . draw ( element . pos . x , element . pos . y ) ;
          } else {
            image . image . drawTile ( element . pos . x , element . pos . y , image . tile , image . tileSize ) ;
          }

          // Reset global alpha back to 1 to avoid affecting subsequent drawings.
          ig . system . context . globalAlpha = 1 ;
        } // End of elements loop.
      }
    } , // End of element management object.

    /**
     * The primary drawing method for the entire GUI.
     * It orchestrates the drawing of all elements and the cursor.
     */
    draw : function ( ) {
      this . element . draw ( ) ; // Draw all registered GUI elements.

      // Update the cursor's position to match the current mouse coordinates.
      this . cursor . pos = {
        x : ig . input . mouse . x ,
        y : ig . input . mouse . y
      } ;
      this . cursor . draw ( ) ; // Draw the cursor.
    }
  } ; // End of ig.gui definition.

  /*
   * Extends Impact's main Game class to integrate GUI update logic.
   */
  ig . Game . inject ( {
    update : function ( ) {
      this . parent ( ) ; // Call the original update method of the parent class.

      // Perform one-time GUI initialization if not already done.
      if ( ig . gui . initialized ) {
        return ; // Exit if already initialized.
      } else {
        ig . gui . initialized = true ; // Set flag to true after initialization.
      }

      // Bind the primary mouse button (MOUSE1) to the 'mouse1' action name for input handling.
      ig . input . bind ( ig . KEY . MOUSE1 , 'mouse1' ) ;
    }
  } ) ;

} ) ; // End of ig.defines block.