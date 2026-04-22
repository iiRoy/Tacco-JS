/*
 * This file contains client-side JavaScript logic for a Meteor application.
 * It initializes various UI components, handles user interactions, and integrates
 * with third-party services like Google Analytics and UserVoice.
 */

/*
 * Meteor startup function:
 * This code runs as soon as the Meteor application starts on the client.
 */
Meteor.startup( function ( ) {

  // jQuery's document ready equivalent, ensuring DOM is loaded.
  $( function ( ) {
    // Create a new script element for Disqus comments.
    var el = document.createElement( "script" ) ;
    // Set the source of the script.
    el.src = "/scripts/disqus.js" ;
    // Specify the type of script.
    el.type = 'text/javascript' ;
    // Prepend the script element to the Disqus comment box container.
    $( "#disqusCommentBox" ).prepend( el ) ;

  } ) ;

} ) ;


/*
 * Global variable declarations for various UI elements and state management.
 */
var layer ;                 // KineticJS Layer for drawing elements.
var headerSection ;         // Represents the header UI component.
var footerSection ;         // Represents the footer UI component.
var bodySection ;           // Represents the main body UI component.
var gridItems ;             // Collection of items in the grid.
var gridHilightRect ;       // Highlight rectangle for grid cells.
var itemCount = 0 ;         // Counter for tracking the number of items added.


// Global configuration object for stage dimensions and cell sizes.
var Global = {
  STAGE_WIDTH  : 600 ,           // Width of the KineticJS stage.
  STAGE_HEIGHT : 720 ,           // Height of the KineticJS stage.
  CELL_HEIGHT  : null ,          // Calculated height of a grid cell.
  CELL_WIDTH   : null            // Calculated width of a grid cell.
} ;


// ItemPool object for managing selected and active items.
var ItemPool = ItemPool || { } ;
ItemPool.selectedItems = [ ] ;      // Array to hold currently selected items.
ItemPool.items = [ ] ;              // Array to hold all items on the stage.


/**
 * Adds an item to the global item pool.
 * @param {Object} item The item to be added.
 */
ItemPool.addItem = function ( item ) {
  ItemPool.items.push( item ) ;
} ;


/**
 * Selects a given item, deselecting the previously selected one if different.
 * @param {Object} item The item to be selected.
 */
ItemPool.selectItem = function ( item ) {
  // The original code had a commented-out loop to hide all pointers.
  // for(var i=0; i<ItemPool.items.length; i++){
  //   ItemPool.items[i].hidePointers();
  // }

  if ( ItemPool.currentItem && ( ItemPool.currentItem.id( ) != item.id( ) ) ) {
    // If there's a current item and it's not the new item, hide its pointers.
    ItemPool.currentItem.hidePointers( ) ;

  }
  // Set the new item as the current item.
  ItemPool.currentItem = item ;


} ;


/**
 * Clears all currently selected items from the pool.
 */
ItemPool.clearSelectedItems = function ( ) {
  ItemPool.selectedItems = [ ] ;
} ;


/**
 * Placeholder function for duplicating the current item.
 * Currently, this function does nothing.
 */
ItemPool.duplicateCurrentItem = function ( ) {

} ;


/**
 * Removes the current item from the item pool.
 * It iterates through the items to find the current item by its ID.
 */
ItemPool.removeCurrentItem = function ( ) {
  var pos = -1 ; // Initialize position to -1 (not found).
  for ( var i = 0 ; i < ItemPool.items.length ; i++ ) {
    // Original comment: console.log("Item ID :" + ItemPool.items[i].kn.id());
    if ( ItemPool.items[i].kn.id( ) === ItemPool.currentItem.id( ) ) {
      pos = i ;     // Found the item, store its position.
      break ;       // Exit the loop.
    }
  }
  // Original comment: console.log("Remove Item Pos: " + pos)
  if ( pos != -1 ) {
    // If the item was found, remove it from the array.
    ItemPool.items.splice( pos , 1 ) ;
  }
} ;


// Document ready function to initialize the application.
$( document ).ready( function ( ) {
  // Set up Google Analytics tracking.
  setGoogleAnalytics( ) ;
  // Initialize UserEcho for feedback.
  setUserEcho( ) ;
  // Original comment: loadDisqus(); // This function is commented out in the original code.

  // Show the 'tabEditor' tab by default.
  $( '#griditTabs a[href="#tabEditor"]' ).tab( 'show' ) ;

  // Variables for tracking keyboard input.
  var ctrlDown = false ;
  var ctrlKey  = "17" ; // ASCII code for Ctrl key.
  var deleteKey = "46" ; // ASCII code for Delete key.
  var vKey = "86" ; // ASCII code for 'v' key (for paste).
  var cKey = "67" ; // ASCII code for 'c' key (for copy).

  // Event listener for keydown events on the document body.
  $( 'body' ).keydown( function ( e ) {
    var keycode = e.keyCode ? e.keyCode : e.which ; // Get the key code.
    // Check for Delete Key press.
    if ( keycode == deleteKey ) {

      ItemPool.currentItem.remove( ) ;       // Remove the currently selected item from the stage.
      ItemPool.removeCurrentItem( ) ;        // Remove the current item from the item pool.
      layer.draw( ) ;                        // Redraw the KineticJS layer to reflect changes.
    }

    else if ( e.keyCode == ctrlKey ) {
      ctrlDown = true ; // Set ctrlDown flag to true when Ctrl is pressed.
    }
    // Original commented-out code for copy functionality.
    // else if (ctrlDown && (e.keyCode == cKey)){
    //   alert("copy");
    // }
    else if ( ctrlDown && ( e.keyCode == vKey ) ) {
      // Original commented-out code for paste functionality.
      // alert("");
    }

  } ).keyup( function ( e ) { // Event listener for keyup events.
    if ( e.keyCode == ctrlKey ) {
      ctrlDown = false ; // Reset ctrlDown flag when Ctrl is released.
    }
  } ) ;

  // Initialize the KineticJS stage.
  var stage = new Kinetic.Stage( {
    container : 'stage' ,             // ID of the container div for the stage.
    width     : Global.STAGE_WIDTH ,  // Set stage width from global config.
    height    : Global.STAGE_HEIGHT   // Set stage height from global config.
  } ) ;

  // Initialize the KineticJS layer.
  layer = new Kinetic.Layer( ) ;

  // Create the header section rectangle.
  headerSection = RRectangle( {
    styles : {
      x           : 0 ,
      y           : 0 ,
      width       : 600 ,
      height      : 50 ,
      fill        : '#E9F1FA' ,
      stroke      : '#DBE2F0' ,
      strokeWidth : 2 ,
      opacity     : 1 ,
      isDraggable : true ,
      isLocked    : true
    } ,
    ponterSides : {
      top    : false ,
      right  : false ,
      bottom : true ,
      left   : false
    }
  } ) ;

  // Create the body section rectangle.
  bodySection = RRectangle( {
    styles : {
      x           : 0 ,
      y           : 0 ,
      width       : 600 ,
      height      : 800 ,
      fill        : '#ffffff' ,
      stroke      : '#DBE2F0' ,
      strokeWidth : 2 ,
      opacity     : 0.5 ,
      isDraggable : true ,
      isLocked    : true
    } ,
    ponterSides : {
      top    : false ,
      right  : false ,
      bottom : false ,
      left   : false
    }
  } ) ;

  // Create the footer section rectangle.
  footerSection = RRectangle( {
    styles : {
      x           : 0 ,
      y           : 760 ,
      width       : 600 ,
      height      : 40 ,
      fill        : '#E9F1FA' ,
      stroke      : '#DBE2F0' ,
      strokeWidth : 2 ,
      opacity     : 1 ,
      isDraggable : true ,
      isLocked    : true
    } ,
    ponterSides : {
      top    : true ,
      right  : false ,
      bottom : false ,
      left   : false
    }
  } ) ;

  // Original commented-out lines for adding sections to the layer.
  // layer.add(bodySection.kn);
  // layer.add(headerSection.kn);
  // layer.add(footerSection.kn);

  // Add the main layer to the stage.
  stage.add( layer ) ;
  // Original commented-out line for setting text.
  // txt.kn.setText("Class Student Report");

  // Draw the initial state of the layer.
  layer.draw( ) ;
} ) ;


/**
 * The Editor function creates and manages the grid and components within the stage.
 * @param {number} rows The number of rows for the grid layout.
 * @returns {object} An object with public methods for the editor.
 */
function Editor ( rows ) {
  // Mapping of component types to their respective constructor functions.
  var components = {
    LABEL     : RText ,
    RECTANGLE : RRectangle
  } ;

  // Color palette for different item types or states.
  var color = {
    "1" : {
      fill   : "#D1E8FF" ,
      stroke : "#73ABFF"
    } ,
    "2" : {
      fill   : "#FFE0D1" ,
      stroke : "#FF9966"
    } ,
    "3" : {
      fill   : "#FF9595" ,
      stroke : "#FF6A6A"
    } ,
    "4" : {
      fill   : "#CFFFC9" ,
      stroke : "#78E378"
    } ,
    "5" : {
      fill   : "#FFFA94" ,
      stroke : "#FF9E36"
    } ,
    "6" : {
      fill   : "#FFCCFF" ,
      stroke : "#FF66FF"
    }
  } ;

  var selectedItems = [ ] ; // Array to hold selected items within the editor scope.

  // Initialize the grid structure.
  createGrid( rows ) ;

  /**
   * Creates the visual grid lines and the highlight rectangle.
   * @param {number} rows The number of rows for the grid.
   */
  function createGrid ( rows ) {
    Global.CELL_HEIGHT = 40 ;                          // Define a fixed cell height.
    Global.CELL_WIDTH = Global.STAGE_WIDTH / rows ;    // Calculate cell width based on stage width and rows.
    var columns = Math.floor( Global.STAGE_HEIGHT / Global.CELL_HEIGHT ) ; // Calculate number of columns.

    // Initialize the grid highlight rectangle.
    gridHilightRect = RRectangle( {
      styles : {
        x           : 0 ,
        y           : 0 ,
        width       : Global.CELL_WIDTH ,
        height      : Global.CELL_HEIGHT ,
        isDraggable : false ,
        isLocked    : false ,
        opacity     : 0.4 ,
        strokeWidth : 0.5 ,
        fill        : "#FF0000" ,
        stroke      : "#FF0000" ,
        visible     : false
      } ,
      ponterSides : {
        top    : false ,
        right  : false ,
        bottom : false ,
        left   : false
      }
    } ) ;

    // Add the highlight rectangle to the layer.
    layer.add( gridHilightRect.kn ) ;

    // Original comment: var item; // This variable was declared but not used.
    var line ; // Variable to hold KineticJS Line objects.
    gridItems = { } ; // Initialize gridItems as an empty object.

    // Draw horizontal grid lines.
    for ( var j = 0 ; j <= columns ; j++ ) {
      line = new Kinetic.Line( {
        points      : [ 0 , j * Global.CELL_HEIGHT , Global.STAGE_WIDTH , j * Global.CELL_HEIGHT ] ,
        stroke      : '#B2BBEC' ,
        strokeWidth : 0.7
      } ) ;
      layer.add( line ) ;
    }

    // Draw vertical grid lines.
    for ( var i = 0 ; i <= rows ; i++ ) {
      line = new Kinetic.Line( {
        points      : [ i * Global.CELL_WIDTH , 0 , i * Global.CELL_WIDTH , Global.STAGE_HEIGHT ] ,
        stroke      : '#B2BBEC' ,
        strokeWidth : 0.7
      } ) ;
      layer.add( line ) ;
    }

    // Original comment: console.log(gridItems);
    // Redraw the layer to display the grid.
    layer.draw( ) ;
  }

  /**
   * Checks if a component is colliding with a container.
   * Note: This collision detection seems to only check X and Y bounds, not full overlap.
   * @param {Object} container The container KineticJS node.
   * @param {Object} component The component KineticJS node.
   * @returns {boolean} True if the component is within the container's bounds, false otherwise.
   */
  function areColliding ( container , component ) {
    // Original comments:
    // //console.log(component.getY());
    // //console.log(container.getY());
    // //console.log(container.getHeight());
    return ( component.getCurrentX( ) >= container.getCurrentX( ) ) &&
      ( component.getCurrentY( ) >= container.getCurrentY( ) &&
        component.getCurrentY( ) <= ( container.getCurrentY( ) + container.getHeight( ) ) ) ;
  }

  /**
   * Determines which section (Header, Footer, or Body) an item was dropped into.
   * @param {Object} item The item that was dropped.
   * @returns {string} The name of the section ("Header", "Footer", or "Body").
   */
  function getDroppedContainer ( item ) {
    if ( areColliding( headerSection.kn , item.kn ) ) {
      return "Header" ;
    }
    else if ( areColliding( footerSection.kn , item.kn ) ) {
      return "Footer" ;
    }
    else {
      return "Body" ;
    }
  }


  /**
   * Adds a new component to the current layer based on type and parameters.
   * It snaps the component to the grid.
   * @param {Object} currentLayer The KineticJS layer to add the component to.
   * @param {string} type The type of component (e.g., "LABEL_1", "RECTANGLE_2").
   * @param {Object} params Parameters for the component, including initial x, y.
   */
  function addComponent ( currentLayer , type , params ) {

    // Calculate the grid row and column index based on the parameters.
    var rowIndex = Math.floor( params.x / Global.CELL_WIDTH ) ;
    var columnIndex = Math.floor( params.y / Global.CELL_HEIGHT ) ;

    // Original comments:
    // console.log("rest x : " + params.x % Global.CELL_WIDTH);
    // console.log("rest y : " + params.y % Global.CELL_HEIGHT);

    // Adjust row and column indices for snapping to grid.
    if ( params.x % Global.CELL_WIDTH <= Global.CELL_WIDTH / 2 ) {
      rowIndex-- ;
    }

    if ( params.y % Global.CELL_HEIGHT <= Global.CELL_HEIGHT / 2 ) {
      columnIndex-- ;
    }

    // Set the snapped x and y coordinates.
    params.x = ( rowIndex ) * Global.CELL_WIDTH ;
    params.y = ( columnIndex ) * Global.CELL_HEIGHT ;

    // Parse the component type string (e.g., "LABEL_1" -> "LABEL", 1).
    var parts = type.split( "_" ) ;
    var componentType = parts[0].toUpperCase( ).trim( ) ;
    var columnsCount = Math.floor( parts[1] ) ;

    // Check if the component type is valid.
    if ( components[componentType] ) {
      // Create a new item (KineticJS shape).
      var item = components[componentType]( {
        styles : {
          x         : params.x ,
          y         : params.y ,
          width     : Global.CELL_WIDTH * columnsCount ,
          opacity   : 0.7 ,
          fill      : "#D1E8FF" ,
          stroke    : "#73ABFF" ,
          text      : itemCount.toString( ) ,
          itemIndex : componentType + itemCount
        }
      } ) ;

      // Add the new item to the current layer.
      currentLayer.add( item.kn ) ;
      // Redraw the layer to show the new item.
      currentLayer.draw( ) ;
      // Original comment: console.log(getDroppedContainer(item));

      itemCount++ ;        // Increment the global item counter.
      ItemPool.addItem( item ) ; // Add the item to the global item pool.
    }
  }

  // Return public methods of the Editor.
  return {
    addComponent : addComponent
  }
}


/*
 * Main Section:
 * This part of the code defines various event handlers for drag-and-drop
 * functionality and utility functions for external services.
 */


/**
 * Handles the dragstart event for draggable components.
 * Sets the data to be transferred (component type).
 * @param {Event} e The drag event object.
 */
function handleDragStart ( e ) {
  // Original comment: this.style.opacity = '0.4';  // this / e.target is the source node.
  e.dataTransfer.setData( "type" , e.target.id ) ; // Set the type of the dragged element.
}


/**
 * Handles the dragover event.
 * Prevents default to allow dropping and sets the drop effect.
 * @param {Event} e The drag event object.
 * @returns {boolean} Always false to indicate a valid drop target.
 */
function handleDragOver ( e ) {
  if ( e.preventDefault ) {
    e.preventDefault( ) ; // Necessary. Allows us to drop.
  }

  e.dataTransfer.dropEffect = 'move' ;  // See the section on the DataTransfer object.

  return false ;
}


/**
 * Handles the dragenter event.
 * Adds an 'over' class to the target element for visual feedback.
 * @param {Event} e The drag event object.
 */
function handleDragEnter ( e ) {
  // Original comment: this / e.target is the current hover target.
  this.classList.add( 'over' ) ; // Add a class for styling.
}


/**
 * Handles the dragleave event.
 * Removes the 'over' class from the target element.
 * @param {Event} e The drag event object.
 */
function handleDragLeave ( e ) {
  // Original comment: console.log('drag leave');
  this.classList.remove( 'over' ) ;  // this / e.target is previous target element.
}


/**
 * Handles the drop event.
 * Prevents default behavior and stops propagation.
 * @param {Event} e The drag event object.
 * @returns {boolean} Always false.
 */
function handleDrop ( e ) {
  // Original comment: this / e.target is current target element.
  // Original comment: console.log("drop baby");
  if ( e.stopPropagation ) {
    e.stopPropagation( ) ; // Stops the browser from redirecting.
  }

  // See the section on the DataTransfer object.

  return false ;
}


/**
 * Handles the dragend event.
 * Currently, this function does nothing.
 * @param {Event} e The drag event object.
 */
function handleDragEnd ( e ) {
  // Original comment: console.log("dragend");
}


/**
 * Initializes Google Analytics tracking.
 * This is a standard Google Analytics snippet.
 */
function setGoogleAnalytics ( ) {
  ( function ( i , s , o , g , r , a , m ) {
    i['GoogleAnalyticsObject'] = r ;
    i[r] = i[r] || function ( ) {
        ( i[r].q = i[r].q || [ ] ).push( arguments )
      } , i[r].l = 1 * new Date( ) ;
    a = s.createElement( o ) ,
      m = s.getElementsByTagName( o )[0] ;
    a.async = 1 ;
    a.src = g ;
    m.parentNode.insertBefore( a , m )
  } )( window , document , 'script' , '//www.google-analytics.com/analytics.js' , 'ga' ) ;

  ga( 'create' , 'UA-50598124-1' , 'meteor.com' ) ; // Create a new GA tracker.
  ga( 'send' , 'pageview' ) ;                       // Send a pageview hit.
}


/**
 * Initializes UserEcho for feedback and support.
 * This is a standard UserVoice JavaScript SDK snippet.
 */
function setUserEcho ( ) {
  // Include the UserVoice JavaScript SDK (only needed once on a page).
  UserVoice = window.UserVoice || [ ] ;
  ( function ( ) {
    var uv = document.createElement( 'script' ) ;
    uv.type = 'text/javascript' ;
    uv.async = true ;
    uv.src = '//widget.uservoice.com/wdBzBp4jiyJe1eVSRYDSVg.js' ;
    var s = document.getElementsByTagName( 'script' )[0] ;
    s.parentNode.insertBefore( uv , s )
  } )( ) ;

  /*
   * UserVoice Javascript SDK developer documentation:
   * https://www.uservoice.com/o/javascript-sdk
   */

  // Set visual colors for the UserVoice widget.
  UserVoice.push( ['set' , {
    accent_color          : '#448dd6' ,
    trigger_color         : 'white' ,
    trigger_background_color : '#6aba2e'
  }] ) ;

  // Identify the user and pass traits (commented out by default).
  // To enable, replace sample data with actual user traits and uncomment the line.
  UserVoice.push( ['identify' , {
    // email:      'john.doe@example.com', // User’s email address
    // name:       'John Doe', // User’s real name
    // created_at: 1364406966, // Unix timestamp for the date the user signed up
    // id:         123, // Optional: Unique id of the user (if set, this should not change)
    // type:       'Owner', // Optional: segment your users by type
    // account: {
    //   id:           123, // Optional: associate multiple users with a single account
    //   name:         'Acme, Co.', // Account name
    //   created_at:   1364406966, // Unix timestamp for the date the account was created
    //   monthly_rate: 9.99, // Decimal; monthly rate of the account
    //   ltv:          1495.00, // Decimal; lifetime value of the account
    //   plan:         'Enhanced' // Plan name for the account
    // }
  }] ) ;

  // Add default trigger to the bottom-right corner of the window.
  UserVoice.push( ['addTrigger' , { mode : 'contact' , trigger_position : 'bottom-right' }] ) ;

  // Or, use your own custom trigger (commented out).
  // UserVoice.push(['addTrigger', '#id', { mode: 'contact' }]);

  // Autoprompt for Satisfaction and SmartVote (only displayed under certain conditions).
  UserVoice.push( ['autoprompt' , { }] ) ;

}


/**
 * Loads the Disqus commenting system script.
 * Note: This function is currently commented out in the document.ready block.
 */
function loadDisqus ( ) {
  var el = document.createElement( "script" ) ; // Create a new script element.
  el.src = "/disqus.js" ;                     // Set the source of the Disqus script.
  el.type = 'text/javascript' ;               // Specify script type.
  $( "#disqusCommentBox" ).prepend( el ) ;    // Prepend to the comment box.

}


// Global variables for offset and editor instance.
var offsetX ;
var offsetY ;
var editor ;


// Second document ready block (can be merged with the first one, but kept separate as in original).
$( document ).ready( function ( ) {
  // Calculate the offset of the stage container.
  var containerOffset = $( "#stage" ).offset( ) ;
  offsetX = containerOffset.left ;
  offsetY = containerOffset.top ;

  // Initialize the Editor with 12 rows.
  editor = Editor( 12 ) ;

  // Select all elements with the class 'component'.
  var cols = document.querySelectorAll( '.component' ) ;
  // Iterate over each component and add dragstart event listener.
  [].forEach.call( cols , function ( col ) {
    col.addEventListener( 'dragstart' , handleDragStart , false ) ;
    // Original commented-out drag event listeners:
    // col.addEventListener('dragenter', handleDragEnter, false);
    // col.addEventListener('dragover', handleDragOver, false);
    // col.addEventListener('dragleave', handleDragLeave, false);
    // col.addEventListener('drop', handleDrop, false);
    // console.log('add');
  } ) ;

  // Select all elements with the class 'stage'.
  var stg = document.querySelectorAll( '.stage' ) ;
  // Iterate over each stage element (likely just one) and add event listeners.
  [].forEach.call( stg , function ( col ) {
    // Original commented-out drag event listeners:
    // col.addEventListener('drop', handleDrop, false);
    // console.log('add');
  } ) ;

  /**
   * Retrieves component data, sorted by some criteria (sortEntities is not defined here),
   * and formats it into an array of objects with xIndex, yIndex, width, and height.
   * @returns {Array<Object>} An array of component data objects.
   */
  function getComponentsData ( ) {
    // `sortEntities()` is called but not defined in the provided code snippet.
    sortEntities( ) ;
    var divs = [ ] ; // Array to store formatted component data.
    var box ;        // Temporary variable for item's bounding box.

    // Iterate through all items in the ItemPool.
    for ( var i = 0 ; i < ItemPool.items.length ; i++ ) {
      box = ItemPool.items[i].box ; // Get the KineticJS box object for the item.
      divs.push( {
        xIndex : Math.floor( box.getAbsolutePosition( ).x / Global.CELL_WIDTH ) ,
        yIndex : Math.floor( box.getAbsolutePosition( ).y / Global.CELL_HEIGHT ) ,
        width  : Math.floor( box.getWidth( ) / Global.CELL_WIDTH ) ,
        height : Math.floor( box.getHeight( ) / Global.CELL_HEIGHT )
      } ) ;
    }

    return divs ; // Return the array of component data.
  }

  /**
   * Retrieves component data, sorted, and formats it for use with a Gridster-Bootstrap layout.
   * @returns {Array<Object>} An array of component data objects with col, row, size_x, size_y.
   */
  function getComponentsDataForGridsterBootstrap ( ) {
    // `sortEntities()` is called but not defined in the provided code snippet.
    sortEntities( ) ;
    var divs = [ ] ; // Array to store formatted component data.
    var box ;        // Temporary variable for item's bounding box.

    // Iterate through all items in the ItemPool.
    for ( var i = 0 ; i < ItemPool.items.length ; i++ ) {
      box = ItemPool.items[i].box ; // Get the KineticJS box object for the item.
      divs.push( {
        col    : Math.floor( box.getAbsolutePosition( ).x / Global.CELL_WIDTH ) ,
        row    : Math.floor( box.getAbsolutePosition( ).y / Global.CELL_HEIGHT ) + 1 , // Gridster rows are 1-indexed.
        size_x : Math.floor( box.getWidth( ) / Global.CELL_WIDTH ) ,
        size_y : Math.floor( box.getHeight( ) / Global.CELL_HEIGHT )
      } ) ;
    }

    return divs ; // Return the array of Gridster-compatible component data.
  }

  // Event listener for the download button click.
  $( "#downloadButton" ).click( function ( ) {
    // The body of this function is empty in the provided code.
  } ) ;