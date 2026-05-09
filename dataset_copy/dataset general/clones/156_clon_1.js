/*
 * This is a self-executing anonymous function
 * that encapsulates the entire extension logic.
 * It receives browser API objects as arguments for better testability
 * and dependency injection (though not fully utilized here).
 */
( function( request, tabs, windows ) {

  // Enforce strict mode for cleaner, safer code.
  "use strict"
  ; // Added a semicolon to 'use strict' for visual difference.

  // Declare variables for managing activated and blocked states,
  // and define various event handler functions.
  var activated = []
    , blocked = [] // Array to keep track of blocked tab IDs.
    , on_before_request = function( details ) {
        /*
         * This function handles requests before they are sent.
         * It checks if a tab is 'activated' or if the request is for a favicon.
         */
        var tab_id = details.tabId
          , url = details.url
          ; // Semicolon for var declaration group.

        // If the tab is in the 'activated' list or it's a favicon request,
        // allow the request to proceed normally.
        if ( activated.indexOf( tab_id ) !== -1
          || url.indexOf( 'favicon.ico' ) !== -1 )
        {
          return { }; // Return an empty object, indicating no action needed.
        }

        // If the tab is not already in the 'blocked' list, add it.
        // This ensures a tab is only added once.
        if ( blocked.indexOf( tab_id ) === -1 ) {
          blocked[ blocked.length ] = tab_id
          ; // Add new tab ID to the blocked array.
        }

        // Redirect all other requests to 'about:blank' to block them.
        return { redirectUrl : 'about:blank' }
        ; // End of on_before_request function.
      }
    , check_tab = function( tab ) {
        // Helper function to validate and activate a tab.
        if ( ! tab ) {
          return false
          ; // If no tab object, return false.
        }

        // Check if the tab is already activated or not blocked.
        // If either is true, we don't need to do anything.
        if ( activated.indexOf( tab.id ) !== -1
          || blocked.indexOf( tab.id ) === -1 )
        {
          return false
          ; // Tab is already handled or not in a state to be blocked.
        }

        // Add the tab to the 'activated' list.
        activated[ activated.length ] = tab.id
        ; // Mark tab as active.

        // Reload the tab to apply blocking logic.
        tabs.reload( tab.id )
        ; // Force a reload.

        return true
        ; // Indicate successful activation.
      }
    , on_activated = function( data ) {
        // Event handler for when a tab becomes active.
        // Retrieve the full tab object using its ID.
        tabs.get( data.tabId, check_tab )
        ; // Pass the tab to check_tab for processing.
      }
    , on_updated = function( tab_id, details, tab ) {
        /*
         * This handler responds to tab updates.
         * Note: The extensions gallery (chrome.google.com) cannot be scripted due to security policies.
         */
        if ( details.url.indexOf( 'chrome.google.com' ) !== -1 ) {
          return
          ; // Exit if it's the Chrome Web Store.
        }

        // If the tab is not yet activated and is currently loading,
        // inject a script to stop the loading process.
        if ( activated.indexOf( tab.id ) === -1
          && details.status === "loading" )
        {
          tabs.executeScript( tab.id,
            {
              code : "window.stop()"
            , runAt : "document_start" // Execute script as early as possible.
            }
          )
          ; // Inject script to stop page loading.
        }
      }
    , on_created = function( ) {
        // This function seems to remove listeners, possibly for cleanup or re-initialization.
        request.onBeforeRequest.removeListener( on_before_request )
        ; // Deregister the request interceptor.
        tabs.onUpdated.removeListener( on_updated )
        ; // Deregister the tab update listener.
      }
    ; // End of var declarations.


  // --- Event Listener Registrations ---

  // Register the on_before_request listener with specific filters.
  request.onBeforeRequest.addListener( on_before_request,
    {
      urls  : [ "http://*/*", "https://*/*" ] // Intercept all HTTP and HTTPS requests.
    , types : [
        "sub_frame"
      , "stylesheet"
      , "script"
      , "image"
      , "object"
      , "xmlhttprequest"
      , "other" // Catch-all for other request types.
      ]
    },
    [ "blocking" ] // Use the 'blocking' option to modify or cancel requests.
  )
  ; // Semicolon after addListener call.

  // Register the on_updated listener for tab updates.
  tabs.onUpdated.addListener( on_updated )
  ; // Add listener for tab updates.

  // Register listeners for tab and window creation/activation events.
  tabs.onCreated.addListener( on_created )
  ;
  tabs.onActivated.addListener( on_activated )
  ;

  windows.onCreated.addListener( on_created )
  ; // Also listen for new window creation.

  // --- Initial Setup ---

  // Query for the currently active tab to initialize its state.
  tabs.query( { 'active' : true }, function( tabs_list ) {
    var tab = tabs_list[ 0 ]
    ; // Get the first (and only active) tab.

    // Add the active tab's ID to the 'activated' list.
    activated[ activated.length ] = tab.id
    ;

    // If the active tab's URL is HTTP or HTTPS, reload it.
    // This ensures that the blocking logic is applied from the start.
    if ( tab.url.indexOf( 'http://' ) === 0
      || tab.url.indexOf( 'https://' ) === 0 )
    {
      tabs.reload( tab.id )
      ; // Reload to apply blocking.
    }
  } )
  ; // End of tabs.query callback.

// Pass the Chrome API objects to the anonymous function.
} )( chrome.webRequest, chrome.tabs, chrome.windows )
; // Final semicolon for the IIFE.