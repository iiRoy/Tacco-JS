/*
 * LocationHandler
 *
 * This JavaScript class manages browser location changes using the History API.
 * It provides features like caching page content and custom event hooks.
 *
 * @author Michele Salvini [ @slvdj ]
 * @company Nerocreativo s.r.l.
 * @version 1.0.0
 *
 * Dependencies:
 *   - jQuery 1.7 or higher for DOM manipulation and AJAX calls.
 *
 */

function LocationHandler ( params , jQuery )

{

  // Ensure the History API is available before proceeding.
  if ( ! this . check ( ) ) {
    return this;
  }

  // Self-reference for use within closures.
  var self = this ,

      // Initialize parameters, defaulting to an empty object if not provided.
      params = params || { } ;

  // Assign jQuery instance, defaulting to global '$' if not provided.
  self . $ = jQuery || $ ;

  // Flag to control active state of the handler.
  self . active = true ;

  // Storage for various attributes, like hostname.
  self . attributes = { } ;

  // Collection of customizable callback functions.
  self . hooks = { } ;

  // Cache for storing loaded page content.
  self . cache = { } ;


  // Define the list of available hooks.
  var hooks = [
    "locationWillChange" ,
    "nextLocationWillLoad" ,
    "nextLocationIsReady" ,
    "nextLocationInit" ,
    "locationDidChange" ,
    "nextLocationThrowsException"
  ] ;

  // Iterate over hooks and assign them from params or default to a no-op function.
  self . $ . each ( hooks , function ( k , hook ) {

    self . hooks [ hook ] = ( typeof params [ hook ] != "function" ) ? function ( ) { } : params [ hook ] ;

  } ) ;

  // Default attributes.
  var attributes = {
    hostname : location . host
  } ;

  // Apply custom attributes from params, overriding defaults.
  self . $ . each ( attributes , function ( attribute , value ) {

    if ( typeof params [ attribute ] != "undefined" ) {
      self . attributes [ attribute ] = params [ attribute ] ;
    } else {
      self . attributes [ attribute ] = value ;
    }

  } ) ;

  // Set the initial location attribute.
  self . set ( 'location' , location . href ) ;

  // Event handler for browser's back/forward buttons (popstate).
  window . onpopstate = function ( historyObj ) {

    // If a valid history state is available, change location.
    if ( historyObj && historyObj . state && historyObj . state . url ) {
      self . changeLocation ( historyObj . state . url , true , historyObj . state . customParams ) ;
    }

  } ;

  // Push the initial state into the history stack to enable future state changes.
  window . history . pushState ( { url : location . href , customParams : { } } , '' , location . href ) ;

  // Return the instance for chaining.
  return this ;

}


/*
 * Checks
 *
 * These methods verify browser capabilities.
 */

LocationHandler . prototype . check = function ( )

{

  // Check if the History API (window.history and pushState) is supported.
  return ( typeof window . history != "undefined" && typeof window . history . pushState != "undefined" ) ;

}


/*
 * Data Management
 *
 * Methods for interacting with the internal cache.
 */

LocationHandler . prototype . getCache = function ( location )

{

  // Retrieve cached data for a given location.
  if ( typeof this . cache [ location ] != "undefined" ) {
    return this . cache [ location ] ;
  }

  // Return false if no data is found in cache.
  return false ;

}


LocationHandler . prototype . setCache = function ( location , data )

{

  // Store data in the cache associated with a specific location.
  this . cache [ location ] = data ;

  // Return the instance for chaining.
  return this ;

}


/*
 * Loading Logic
 *
 * Core methods for handling page content loading and transitions.
 */

LocationHandler . prototype . locationDidChange = function ( changeObj )

{

  var self = this ;

  // Re-enable the handler.
  self . active = true ;

  // Call the custom hook after location has changed.
  self . hooks . locationDidChange ( changeObj ) ;

}


LocationHandler . prototype . nextLocationInit = function ( changeObj )

{

  var self = this ;

  // Execute the custom hook for next location initialization and get a potential delay.
  var timer = self . hooks . nextLocationInit ( changeObj ) ;

  // Ensure timer is a number, defaulting to 0.
  if ( typeof timer != "number" ) {
    timer = 0 ;
  }

  // Delay the actual location change notification.
  setTimeout ( function ( ) {

    self . locationDidChange ( changeObj ) ;

  } , timer ) ;

}


LocationHandler . prototype . nextLocationThrowsException = function ( changeObj )

{

  // Re-enable the handler if an exception occurred during loading.
  this . active = true ;

}


LocationHandler . prototype . nextLocationLoad = function ( changeObj )

{

  var self = this ;

  // Execute the custom hook before the next location starts loading and get a potential delay.
  var timer = self . hooks . nextLocationWillLoad ( changeObj ) ;

  // Ensure timer is a number, defaulting to 0.
  if ( typeof timer != "number" ) {
    timer = 0 ;
  }

  // Delay the loading process.
  setTimeout ( function ( ) {

    // Check if the content is available in cache.
    if ( changeObj . fromCache ) {

      // Content is from cache, trigger the "is ready" hook.
      var timer = self . hooks . nextLocationIsReady ( changeObj ) ;

      // Ensure timer is a number, defaulting to 0.
      if ( typeof timer != "number" ) {
        timer = 0 ;
      }

      // Delay initialization.
      setTimeout ( function ( ) {

        self . nextLocationInit ( changeObj ) ;

      } , timer ) ;

    }
    else {

      // Content is not in cache, perform an AJAX request.
      self . $ . ajax ( {
        url : changeObj . to ,
        method : 'get' ,
        dataType : 'text' , // Expecting HTML content.
        error : function ( ) {

          // Handle AJAX error: trigger the "throws exception" hook.
          var timer = self . hooks . nextLocationThrowsException ( changeObj ) ;

          // Ensure timer is a number, defaulting to 0.
          if ( typeof timer != "number" ) {
            timer = 0 ;
          }

          // Delay the exception handling.
          setTimeout ( function ( ) {

            self . nextLocationThrowsException ( changeObj ) ;

          } , timer ) ;

        } ,
        success : function ( response ) {

          // Regular expressions to extract specific parts of the HTML response.
          var patternCustom = /<!--LocationHandlerStart-->((.|[\n\r])*)<!--LocationHandlerEnd-->/im ,
              patternBody = /<body[^>]*>((.|[\n\r])*)<\/body>/im ,
              patternBodyClass = /<body[^>]*class="([^"]*)"/im ,

              // Execute patterns against the response.
              mCustom = patternCustom . exec ( response ) ,
              mBody = patternBody . exec ( response ) ,
              mBodyClass = patternBodyClass . exec ( response ) ,

              data = '' , // Content to be injected.
              bodyClass = '' ; // Body classes to be applied.

          // Prioritize custom marked content.
          if ( mCustom && mCustom . length && typeof mCustom [ 1 ] != "undefined" ) {
            data = mCustom [ 1 ] ;
          }
          // Fallback to full body content.
          else if ( mBody && mBody . length && typeof mBody [ 1 ] != "undefined" ) {
            data = mBody [ 1 ] ;
          }

          // Extract body classes.
          if ( mBodyClass && mBodyClass . length && typeof mBodyClass [ 1 ] != "undefined" ) {
            bodyClass = mBodyClass [ 1 ] ;
          }

          // Pattern to extract page title.
          var patternTitle = /<title[^>]*>((.|[\n\r])*)<\/title>/im ;

              // Execute pattern and get title.
              mTitle = patternTitle . exec ( response ) ,
              title = mTitle && mTitle . length && typeof mTitle [ 1 ] != "undefined" ? mTitle [ 1 ] : '' ;

          // Update change object with extracted data.
          changeObj . fromTitle = document . title ;
          changeObj . toTitle = title ;
          changeObj . data = data ;
          changeObj . bodyClass = bodyClass ;

          // Cache the fetched data for future use.
          self . setCache ( changeObj . to , { data : data , title : title , bodyClass : bodyClass } ) ;

          // Trigger the "is ready" hook.
          var timer = self . hooks . nextLocationIsReady ( changeObj ) ;

          // Ensure timer is a number, defaulting to 0.
          if ( typeof timer != "number" ) {
            timer = 0 ;
          }

          // Delay initialization.
          setTimeout ( function ( ) {

            self . nextLocationInit ( changeObj ) ;

          } , timer ) ;

        }
      } ) ;

    }

  } , timer ) ;

}


LocationHandler . prototype . changeLocation = function ( newLocation , isFromHistory , customParams )

{

  // If History API is not supported, fall back to a full page reload.
  if ( ! this . check ( ) ) {
    location . href = newLocation ;
    return ;
  }

  var self = this ;

  // If the handler is not active, prevent new changes.
  if ( ! self . active ) {
    return ;
  }

  // Prevent navigating to external URLs using the History API.
  if ( ! ( new RegExp ( 'https?://' + this . get ( 'hostname' ) , 'gi' ) . test ( newLocation ) ) ) {
    location . href = newLocation ; // Fallback to full reload for external links.
    return ;
  }

  // Only proceed if the new location is different from the current one.
  if ( self . get ( 'location' ) != newLocation ) {

    self . active = false ; // Deactivate handler during transition.

    // Create a change object to pass to hooks.
    var changeObj = {
      from : self . get ( 'location' ) ,
      to : newLocation ,
      state : customParams
    } ;

    // Execute the "will change" hook and get a potential delay or cancellation flag.
    var timer = self . hooks . locationWillChange ( changeObj ) ;

    // If the hook explicitly returns false, cancel the location change.
    if ( timer === false ) {
      self . active = true ; // Re-activate if cancelled.
      return ;
    }

    // Ensure timer is a number, defaulting to 0.
    if ( typeof timer != "number" ) {
      timer = 0 ;
    }

    // Delay the actual location change.
    setTimeout ( function ( ) {

      self . set ( 'location' , newLocation ) ; // Update internal location.

      // If not triggered by history navigation, push the new state to browser history.
      if ( ! isFromHistory ) {
        window . history . pushState ( { url : newLocation , customParams : customParams } , '' , newLocation ) ;
      }

      changeObj . fromCache = false ; // Assume not from cache initially.

      var fromCache = self . getCache ( changeObj . to ) ; // Check cache.

      // If content is found in cache, update changeObj.
      if ( ! ( ! fromCache ) ) {
        changeObj . fromCache = true ;
        changeObj . data = fromCache . data ;
        changeObj . toTitle = fromCache . title ;
        changeObj . bodyClass = fromCache . bodyClass ;
      }

      self . nextLocationLoad ( changeObj ) ; // Proceed to load the next location content.

    } , timer ) ;

  }

}


LocationHandler . prototype . handleClickWithLocationHandler = function ( locationHandler , customParams )

{

  // If the handler cannot check history API, return a no-op function.
  if ( ! locationHandler . check ( ) ) {
    return function ( ) { } ;
  }

  // Return an event handler function for anchor clicks.
  return function ( event )
  {

    // Prevent default anchor behavior (e.g., full page reload).
    event && event . preventDefault && event . preventDefault ( ) ;

    // Get the target URL from the clicked element.
    var newLocation = this . href ; // `this` refers to the clicked DOM element (e.g., <a>).

    // Delegate to the changeLocation method.
    locationHandler . changeLocation ( newLocation , false , customParams ) ;

  }

}


/*
 * Utilities, Getter, Setter
 *
 * General utility methods for managing handler attributes.
 */

LocationHandler . prototype . get = function ( attr )

{

  // Retrieve an attribute value by name.
  if ( typeof this . attributes [ attr ] != "undefined" ) {
    return this . attributes [ attr ] ;
  }

  // Return false if the attribute is not found.
  return false ;

}


LocationHandler . prototype . set = function ( attr , value )

{

  var self = this ,
      attributes = { } ; // Temporary object for attributes to set.

  // Handle single attribute (string) or multiple attributes (object).
  if ( typeof attr == "string" ) {
    attributes [ attr ] = value ;
  }
  else if ( typeof attr == "object" ) {
    attributes = attr ;
  }

  // Iterate over the attributes to set.
  self . $ . each ( attributes , function ( att , value )
  {

    // If the value is a function, execute it to get the new value.
    if ( typeof value == "function" ) {

      self . attributes [ attr ] = value ( self . attributes [ attr ] ) ;
    }
    // If the value is defined, assign it directly.
    else if ( typeof value != "undefined" ) {

      self . attributes [ attr ] = value ;
    }

  } ) ;

  // Return the instance for chaining.
  return self ;

}