( /* anonymous self-executing function */ function ( factory )
 {
  // Check for AMD loader (e.g., RequireJS, curl.js)
  if  ( typeof define  !==  'undefined'  &&  define.amd )
  {
   define( [ 'jquery' ] ,  factory ) ; // Define module with jQuery as a dependency
  }
  // Check for CommonJS environment (e.g., Node.js, Browserify, Webpack)
  else   if  ( typeof module  !==  'undefined'  &&  module.exports )
  {
   var $  =  require( 'jquery' ) ;  // Import jQuery using CommonJS require
   module.exports  =  factory( $ ) ;  // Export the result of the factory function
  }
  else
  {
   // Fallback to global scope (standard browser environment)
   window.scrollMonitor  =  factory( jQuery ) ; // Attach scrollMonitor to the window object
  }
 } ) ( function  ( $ )
 {

  var exports  =  {} ; // This object will store all publicly exposed functions and properties

  var $window  =  $( window ) ;  /* jQuery wrapper for the browser window object */
  var $document  =  $( document ) ; // jQuery wrapper for the entire document

  // Array to hold all currently registered ElementWatcher instances
  var watchers  =  [ ] ;


  // --- Constants for Event Type Names ---
  var VISIBILITYCHANGE  =  'visibilityChange' ;
  var ENTERVIEWPORT  =  'enterViewport' ;
  var FULLYENTERVIEWPORT  =  'fullyEnterViewport' ;
  var EXITVIEWPORT  =  'exitViewport' ;
  var PARTIALLYEXITVIEWPORT  =  'partiallyExitViewport' ;
  var LOCATIONCHANGE  =  'locationChange' ;
  var STATECHANGE  =  'stateChange' ; /* General catch-all for any state alteration */

  // An ordered list of all supported event types
  var eventTypes  =  [
   VISIBILITYCHANGE ,
   ENTERVIEWPORT ,
   FULLYENTERVIEWPORT ,
   EXITVIEWPORT ,
   PARTIALLYEXITVIEWPORT ,
   LOCATIONCHANGE ,
   STATECHANGE
  ] ;

  // Default offset values for watchers, applied to their boundaries
  var defaultOffsets  =  { top :  0 ,  bottom :  0 } ;

  /* Global viewport and document properties, exposed via the exports object */
  exports.viewportTop ;
  exports.viewportBottom ;
  exports.documentHeight ;
  exports.viewportHeight  =  $window.height( ) ; // Initial height of the browser viewport

  // Variables to track previous document height and the latest event object for context
  var previousDocumentHeight ;
  var latestEvent ; // Holds the event object from the most recent scroll or resize

  /* Loop index for iterating through watchers during viewport calculation */
  var calculateViewportI ;
  /**
   * Calculates and updates the global viewport and document dimensions.
   * Also triggers recalculation of watcher locations if document height changes.
   */
  function  calculateViewport ( )
  {
   // Determine the current scroll position from the top of the document
   exports.viewportTop  =  $window.scrollTop( ) ;
   // Calculate the bottom edge of the viewport
   exports.viewportBottom  =  exports.viewportTop  +  exports.viewportHeight ;
   exports.documentHeight  =  $document.height( ) ; // Get the total height of the document

   // If the document's height has changed since the last check,
   // all watcher locations might need to be re-evaluated.
   if  ( exports.documentHeight  !==  previousDocumentHeight )
   {
    calculateViewportI  =  watchers.length ;
    while  ( calculateViewportI-- )
    {
     watchers[ calculateViewportI ] . recalculateLocation( ) ; // Update each watcher's stored position
    }
    previousDocumentHeight  =  exports.documentHeight ; // Store the new document height for future comparison
   }
  }

  /*
   * Recalculates viewport height, updates global viewport properties,
   * and then triggers updates for all registered watchers.
   */
  function  recalculateWatchLocationsAndTrigger ( )
  {
   exports.viewportHeight  =  $window.height( ) ; // Refresh the current viewport height
   calculateViewport( ) ; // Update global viewport top/bottom and document height
   updateAndTriggerWatchers( ) ; // Process all watcher states and callbacks
  }

  // Timer ID for debouncing resize events to prevent excessive function calls
  var recalculateAndTriggerTimer ;
  /*
   * Debounced function to call recalculateWatchLocationsAndTrigger.
   * This limits how often the function is executed during rapid resize events.
   */
  function  debouncedRecalcuateAndTrigger ( )
  {
   clearTimeout( recalculateAndTriggerTimer ) ; // Clear any previously set timer
   recalculateAndTriggerTimer  =  setTimeout( recalculateWatchLocationsAndTrigger ,  100 ) ; // Set a new timer
  }

  /* Loop index for updating and triggering watchers */
  var updateAndTriggerWatchersI ;
  /**
   * Orchestrates the update and callback triggering for all registered watchers.
   * It performs two passes to ensure state consistency:
   * 1. All watchers update their internal state (isInViewport, etc.).
   * 2. All watchers then trigger their callbacks based on their (now updated) state.
   */
  function  updateAndTriggerWatchers ( )
  {
   // First pass: Update the internal state of each watcher.
   // This ensures that when callbacks are triggered in the second pass,
   // they are operating on the most current data.
   updateAndTriggerWatchersI  =  watchers.length ;
   while  ( updateAndTriggerWatchersI-- )
   {
    watchers[ updateAndTriggerWatchersI ] . update( ) ;
   }

   // Second pass: Trigger any relevant callbacks for each watcher.
   // This separation prevents callbacks from being triggered based on stale data
   // if another watcher's state update affects the current one.
   updateAndTriggerWatchersI  =  watchers.length ;
   while  ( updateAndTriggerWatchersI-- )
   {
    watchers[ updateAndTriggerWatchersI ] . triggerCallbacks( ) ;
   }
  }

  /* Constructor for creating an ElementWatcher instance */
  function  ElementWatcher ( watchItem ,  offsets )
  {
   var self  =  this ; // Store a reference to the current instance for use in nested functions

   this.watchItem  =  watchItem ; // The actual item (DOM element, number, or object) being watched

   // Process the provided offsets:
   if  ( ! offsets )
   {
    this.offsets  =  defaultOffsets ; // If no offsets provided, use the global defaults
   }
   else   if  ( offsets  ===  + offsets ) // Check if offsets is a numeric value
   {
    this.offsets  =  { top :  offsets ,  bottom :  offsets } ; // Apply the same numeric offset to both top and bottom
   }
   else
   {
    this.offsets  =  $.extend( {} ,  defaultOffsets ,  offsets ) ; // Merge custom offsets with defaults
   }

   this.callbacks  =  {} ;  /* Object to store arrays of callback functions for each event type */

   // Initialize an empty array for each defined event type in the callbacks object
   for  ( var i  =  0 ,  j  =  eventTypes.length ;  i  <  j ;  i++ )
   {
    self.callbacks[ eventTypes[ i ] ]  =  [ ] ;
   }

   this.locked  =  false ; // Flag to control if recalculateLocation should run

   // --- Variables to store the previous state of the watcher for change detection ---
   var wasInViewport ;
   var wasFullyInViewport ;
   var wasAboveViewport ;
   var wasBelowViewport ;

   var listenerToTriggerListI ; // Loop index for iterating through callback listener arrays
   var listener ; // Variable to hold the current listener object {callback: function, isOne: boolean}
   /**
    * Helper function to iterate through an array of listeners and execute their callbacks.
    * Removes 'one-time' listeners after execution.
    * @param {Array} listeners The array of listener objects to process.
    */
   function  triggerCallbackArray ( listeners )
   {
    if  ( listeners.length  ===  0 )
    {
     return ; // If no listeners, simply return
    }
    listenerToTriggerListI  =  listeners.length ;
    while  ( listenerToTriggerListI-- )
    {
     listener  =  listeners[ listenerToTriggerListI ] ;
     listener.callback.call( self ,  latestEvent ) ; // Execute the callback in the context of the watcher
     if  ( listener.isOne )
     {
      listeners.splice( listenerToTriggerListI ,  1 ) ; // Remove 'one-time' listeners from the array
     }
    }
   }
   /*
    * This method is responsible for comparing the current state of the watcher
    * with its previous state and triggering appropriate event callbacks.
    */
   this.triggerCallbacks  =  function  triggerCallbacks ( )
   {
    // ENTERVIEWPORT event: triggered when the element enters the viewport
    if  ( this.isInViewport  &&  ! wasInViewport )
    {
     triggerCallbackArray( this.callbacks[ ENTERVIEWPORT ] ) ;
    }
    // FULLYENTERVIEWPORT event: triggered when the element fully enters the viewport
    if  ( this.isFullyInViewport  &&  ! wasFullyInViewport )
    {
     triggerCallbackArray( this.callbacks[ FULLYENTERVIEWPORT ] ) ;
    }


    // VISIBILITYCHANGE event: triggered when the element crosses both above/below boundaries
    if  ( this.isAboveViewport  !==  wasAboveViewport  &&
     this.isBelowViewport  !==  wasBelowViewport )
    {
     triggerCallbackArray( this.callbacks[ VISIBILITYCHANGE ] ) ;

     // Special handling for cases where the element is scrolled completely past
     // without ever being 'fully in' or 'in' the viewport during the update cycle.
     if  ( ! wasFullyInViewport  &&  ! this.isFullyInViewport )
     {
      triggerCallbackArray( this.callbacks[ FULLYENTERVIEWPORT ] ) ;
      triggerCallbackArray( this.callbacks[ PARTIALLYEXITVIEWPORT ] ) ;
     }
     if  ( ! wasInViewport  &&  ! this.isInViewport )
     {
      triggerCallbackArray( this.callbacks[ ENTERVIEWPORT ] ) ;
      triggerCallbackArray( this.callbacks[ EXITVIEWPORT ] ) ;
     }
    }

    // PARTIALLYEXITVIEWPORT event: triggered when the element was fully in, but now is only partially in
    if  ( ! this.isFullyInViewport  &&  wasFullyInViewport )
    {
     triggerCallbackArray( this.callbacks[ PARTIALLYEXITVIEWPORT ] ) ;
    }
    // EXITVIEWPORT event: triggered when the element exits the viewport entirely
    if  ( ! this.isInViewport  &&  wasInViewport )
    {
     triggerCallbackArray( this.callbacks[ EXITVIEWPORT ] ) ;
    }
    // VISIBILITYCHANGE event: triggered for any general change in visibility status
    if  ( this.isInViewport  !==  wasInViewport )
    {
     triggerCallbackArray( this.callbacks[ VISIBILITYCHANGE ] ) ;
    }
    // STATECHANGE event: triggered if any of the core visibility states have changed
    switch  ( true )
    {
     case  wasInViewport  !==  this.isInViewport :
     case  wasFullyInViewport  !==  this.isFullyInViewport :
     case  wasAboveViewport  !==  this.isAboveViewport :
     case  wasBelowViewport  !==  this.isBelowViewport :
      triggerCallbackArray( this.callbacks[ STATECHANGE ] ) ;
    }

    // Update the 'was' variables to reflect the current state for the next cycle
    wasInViewport  =  this.isInViewport ;
    wasFullyInViewport  =  this.isFullyInViewport ;
    wasAboveViewport  =  this.isAboveViewport ;
    wasBelowViewport  =  this.isBelowViewport ;

   } ;

   /* Method to determine and store the current pixel location of the watched item within the document */
   this.recalculateLocation  =  function ( )
   {
    if  ( this.locked )
    {
     return ; // If the watcher is locked, do not recalculate its location
    }
    var previousTop  =  this.top ; // Store the previous top position for change detection
    var previousBottom  =  this.bottom ; // Store the previous bottom position for change detection

    // Determine the location based on the type of watchItem
    if  ( this.watchItem.nodeName ) // If it's a DOM element (has nodeName property)
    {
     var cachedDisplay  =  this.watchItem.style.display ;
     // Temporarily set display to empty string if it's 'none' to get correct offset values
     if  ( cachedDisplay  ===  'none' )
     {
      this.watchItem.style.display  =  '' ;
     }

     var elementLocation  =  $( this.watchItem ) . offset( ) ; // Get the element's position relative to the document
     this.top  =  elementLocation.top ;
     this.bottom  =  elementLocation.top  +  this.watchItem.offsetHeight ; // Calculate bottom from top and height

     // Restore the original display style if it was temporarily changed
     if  ( cachedDisplay  ===  'none' )
     {
      this.watchItem.style.display  =  cachedDisplay ;
     }

    }
    else   if  ( this.watchItem  ===  + this.watchItem ) // If it's a number (checked by unary plus operator)
    {
     if  ( this.watchItem  >  0 )
     {
      this.top  =  this.bottom  =  this.watchItem ; // Treat positive number as absolute pixel position from top
     }
     else
     {
      // Treat negative number as an offset from the document's bottom
      this.top  =  this.bottom  =  exports.documentHeight  -  this.watchItem ;
     }

    }
    else   // Assume it's an object with 'top' and 'bottom' properties
    {
     this.top  =  this.watchItem.top ;
     this.bottom  =  this.watchItem.bottom ;
    }

    // Apply the user-defined offsets to the calculated boundaries
    this.top  -=  this.offsets.top ;
    this.bottom  +=  this.offsets.bottom ;
    this.height  =  this.bottom  -  this.top ; // Calculate the effective height of the watched area

    // Trigger the LOCATIONCHANGE event if the item's position has actually moved
    if  ( ( previousTop  !==  undefined  ||  previousBottom  !==  undefined )  &&  ( this.top  !==  previousTop  ||  this.bottom  !==  previousBottom ) )
    {
     triggerCallbackArray( this.callbacks[ LOCATIONCHANGE ] ) ;
    }
   } ;

   this.recalculateLocation( ) ; // Perform an initial calculation of the item's location
   this.update( ) ; // Perform an initial update of the item's viewport status

   // Initialize the 'was' variables with the current state after the initial update
   wasInViewport  =  this.isInViewport ;
   wasFullyInViewport  =  this.isFullyInViewport ;
   wasAboveViewport  =  this.isAboveViewport ;
   wasBelowViewport  =  this.isBelowViewport ;
  }

  /* Define methods and properties for the ElementWatcher prototype */
  ElementWatcher.prototype  =  {
   /* Registers an event listener for a specific event type */
   on :  function  ( event ,  callback ,  isOne )
   {
    // Immediately trigger the callback if the event's condition is currently met
    switch  ( true )
    {
     case  event  ===  VISIBILITYCHANGE  &&  ! this.isInViewport  &&  this.isAboveViewport :
     case  event  ===  ENTERVIEWPORT  &&  this.isInViewport :
     case  event  ===  FULLYENTERVIEWPORT  &&  this.isFullyInViewport :
     case  event  ===  EXITVIEWPORT  &&  this.isAboveViewport  &&  ! this.isInViewport :
     case  event  ===  PARTIALLYEXITVIEWPORT  &&  this.isAboveViewport :
      callback( ) ; // Execute the callback immediately
      if  ( isOne )
      {
       return ; // If it's a 'one-time' listener, don't add it to the permanent list
      }
    }

    // Add the listener to the appropriate array in the callbacks object
    if  ( this.callbacks[ event ] )
    {
     this.callbacks[ event ] . push( { callback :  callback ,  isOne :  isOne } ) ;
    }
    else
    {
     // Throw an error if an invalid event type is provided
     throw  new  Error( 'Tried to add a scroll monitor listener of type '  +  event  +  '. Your options are: '  +  eventTypes.join( ', ' ) ) ;
    }
   } ,

   /* Unregisters a previously added event listener */
   off :  function  ( event ,  callback )
   {
    if  ( this.callbacks[ event ] )
    {
     // Iterate through the listeners for the given event type
     for  ( var i  =  0 ,  item ;  item  =  this.callbacks[ event ][ i ] ;  i++ )
     {
      if  ( item.callback  ===  callback )
      {
       this.callbacks[ event ] . splice( i ,  1 ) ; // Remove the matching callback
       break ; // Exit the loop once the callback is found and removed
      }
     }
    }
    else
    {
     // Throw an error if trying to remove a listener for an invalid event type
     throw  new  Error( 'Tried to remove a scroll monitor listener of type '  +  event  +  '. Your options are: '  +  eventTypes.join( ', ' ) ) ;
    }
   } ,

   /* Registers a one-time event listener that will be automatically removed after being triggered once */
   one :  function  ( event ,  callback )
   {
    this.on( event ,  callback ,  true ) ; // Delegate to the 'on' method, setting the 'isOne' flag to true
   } ,

   /* Recalculates the height of the watched item and its bottom boundary */
   recalculateSize :  function ( )
   {
    this.height  =  this.watchItem.offsetHeight  +  this.offsets.top  +  this.offsets.bottom ;
    this.bottom  =  this.top  +  this.height ;
   } ,

   /* Updates the viewport status properties (isAboveViewport, isInViewport, etc.) of the watcher */
   update :  function ( )
   {
    this.isAboveViewport  =  this.top  <  exports.viewportTop ; // True if the item's top is above the viewport's top
    this.isBelowViewport  =  this.bottom  >  exports.viewportBottom ; // True if the item's bottom is below the viewport's bottom

    // An item is in the viewport if its top boundary is below the viewport's bottom
    // AND its bottom boundary is above the viewport's top.
    this.isInViewport  =  ( this.top  <=  exports.viewportBottom  &&  this.bottom  >=  exports.viewportTop ) ;
    // An item is fully in the viewport if its top is below the viewport's top
    // AND its bottom is above the viewport's bottom,
    // OR if the item itself spans the entire viewport (i.e., it's both above and below).
    this.isFullyInViewport  =  ( this.top  >=  exports.viewportTop  &&  this.bottom  <=  exports.viewportBottom )  ||
     ( this.isAboveViewport  &&  this.isBelowViewport ) ;
   } ,

   /* Destroys the watcher instance, removing it from the global list and clearing its callbacks */
   destroy :  function ( )
   {
    var index  =  watchers.indexOf( this ) ,
     self  =  this ; // Cache 'this' for use within the loop closure
    watchers.splice( index ,  1 ) ; // Remove the watcher from the global watchers array
    // Clear all callback arrays associated with this watcher
    for  ( var i  =  0 ,  j  =  eventTypes.length ;  i  <  j ;  i++ )
    {
     self.callbacks[ eventTypes[ i ] ] . length  =  0 ;
    }
   } ,

   // Method to prevent recalculating the element's location (e.g., for fixed elements)
   lock :  function ( )
   {
    this.locked  =  true ;
   } ,

   // Method to re-enable recalculating the element's location
   unlock :  function ( )
   {
    this.locked  =  false ;
   }
  } ;

  /* Factory function to create event-specific handler methods (e.g., watcher.enterViewport(fn)) */
  var eventHandlerFactory  =  function  ( type )
  {
   return  function  ( callback ,  isOne )
   {
    this.on.call( this ,  type ,  callback ,  isOne ) ; // Delegate to the generic 'on' method
   } ;
  } ;

  // Dynamically add convenience methods for each event type to the ElementWatcher prototype.
  // This allows users to write `watcher.enterViewport(myFunc)` instead of `watcher.on('enterViewport', myFunc)`.
  for  ( var i  =  0 ,  j  =  eventTypes.length ;  i  <  j ;  i++ )
  {
   var type  =  eventTypes[ i ] ;
   ElementWatcher.prototype[ type ]  =  eventHandlerFactory( type ) ;
  }

  calculateViewport( ) ; // Perform an initial calculation of viewport and document dimensions

  /**
   * The main scroll event listener function.
   * This is triggered whenever the window is scrolled.
   * @param {Event} event The native scroll event object.
   */
  function  scrollMonitorListener ( event )
  {
   latestEvent  =  event ; // Store the current event object for context in callbacks
   calculateViewport( ) ; // Re-calculate current viewport boundaries and document height
   updateAndTriggerWatchers( ) ; // Update all watchers and trigger their callbacks
  }

  // Register the scroll and debounced resize event listeners on the window object
  $window.on( 'scroll' ,  scrollMonitorListener ) ;
  $window.on( 'resize' ,  debouncedRecalcuateAndTrigger ) ;

  /* Public method to create a new ElementWatcher instance */
  exports.beget  =  exports.create  =  function  ( element ,  offsets )
  {
   // Normalize the 'element' input, accepting string selectors, jQuery objects, or raw DOM elements
   if  ( typeof element  ===  'string' )
   {
    element  =  $( element ) [ 0 ] ; // Convert a CSS selector string to its first matching DOM element
   }
   if  ( element  instanceof  $ )
   {
    element  =  element[ 0 ] ; // Extract the raw DOM element from a jQuery object
   }
   var watcher  =  new  ElementWatcher( element ,  offsets ) ; // Create a new watcher instance
   watchers.push( watcher ) ; // Add the new watcher to the global list
   watcher.update( ) ; // Perform an initial update for the newly created watcher
   return  watcher ; // Return the new watcher instance to the caller
  } ;

  /* Public method to force an immediate update of all watchers' states and trigger callbacks */
  exports.update  =  function ( )
  {
   latestEvent  =  null ; // Clear any previous event context for this manual update
   calculateViewport( ) ; // Re-calculate current viewport and document dimensions
   updateAndTriggerWatchers( ) ; // Update and trigger callbacks for all registered watchers
  } ;
  /* Public method to force a recalculation of all watcher locations and then trigger a full update */
  exports.recalculateLocations  =  function ( )
  {
   exports.documentHeight  =  0 ; // Setting this to 0 forces calculateViewport to re-evaluate document height
   exports.update( ) ; // Trigger a full update cycle, which includes location recalculation
  } ;

  return  exports ; // Return the exports object, making public functions accessible
 } ) ;