/*
 * This file contains the jQuery history plugin implementation.
 *
 * Original Author: Taku Sano (Mikage Sawatari)
 * Date of Original Copyright: 2006
 *
 * This software is distributed under the terms of the MIT License.
 * For details, please refer to:
 *   http://www.opensource.org/licenses/mit-license.php
 *
 * Significant modifications were made by Lincoln Cooper to enhance browser compatibility,
 * specifically by introducing support for Safari. Additionally, a refinement was implemented
 * to ensure the callback function is invoked only once during the initialization phase
 * for Microsoft Internet Explorer when no initial hash value is provided.
 *
 * Further modifications were contributed by MaX to address and resolve issues
 * related to the handling of multiple iframes within Internet Explorer environments.
 * These changes aim to improve the robustness and reliability of the plugin.
 */
/* This block defines core functionalities and initial states for the history plugin. */
jQuery  .  extend (
{
  historyCurrentHash: undefined // Stores the most recently processed hash value.

  , historyCallback: undefined // The user-defined callback function to be executed on hash change.

  // Initializes the history plugin, setting up event listeners and browser-specific behaviors.
  , historyInit: function (  callback  ) {
    jQuery . historyCallback = callback; // Assign the provided callback function.
    var current_hash = location.hash; // Retrieve the current hash from the URL.

    jQuery.historyCurrentHash = current_hash; // Store the initial hash.
    // Check if the current browser is Microsoft Internet Explorer.
    if (jQuery.browser.msie)
    {
      // Important: Prevent the history callback from firing two times during initial load
      //           if there is no hash value specified in the URL.
      if (jQuery.historyCurrentHash == '') {
        jQuery.historyCurrentHash = '#'; // Default to '#' for IE if hash is empty.
      }
      // For IE, a hidden iframe is used to track history changes due to browser limitations.
      // We check if the iframe already exists to prevent re-creation in multi-iframe scenarios.
      if ( ! $ ("#jQuery_history").size ()) { /* MaX's fix */
        $("body") . prepend (  '<iframe id="jQuery_history" style="display:none"></iframe>'  ) ;
      }
      var ihistory = $ ("#jQuery_history") [0]; /* Get the iframe element */
      var iframe = ihistory . contentWindow . document; // Access the iframe's document object.
      iframe.open(); // Open the iframe document for writing.
      iframe.close(); // Close it, ensuring it's ready for hash updates.
      iframe.location.hash = current_hash; // Set the iframe's hash to the current URL hash.
    }
    // Handle Safari-specific history management due to its unique behavior.
    else if ( $ . browser . safari )
    {
      // Safari requires manual management of back and forward stacks.
      jQuery.historyBackStack = []; // Initialize the back stack.
      jQuery.historyBackStack.length = history.length; // Sync length with browser history.
      jQuery.historyForwardStack = []; // Initialize the forward stack.

      jQuery.isFirst = true; // Flag to indicate if this is the first history entry.
    }
    // Execute the callback function with the initial hash (without the leading '#').
    jQuery.historyCallback (  current_hash.replace(/^#/, '')  ) ;
    // Set up a periodic check for history changes.
    setInterval (  jQuery.historyCheck, 100  ) ;
  } , // End of historyInit function definition.

  // Adds a new history entry, primarily for Safari's manual history management.
  historyAddHistory: function (  hash  )
  {
    // Pushes the new hash onto the back stack, ensuring the check function has data to process.
    jQuery.historyBackStack.push(  hash  ) ;

    // When a new history item is added, the forward stack must be cleared.
    // This simulates a "true click" or direct navigation, invalidating future-history.
    jQuery.historyForwardStack.length = 0;
    this.isFirst = true; // Mark as the first entry for subsequent checks.
  } , // End of historyAddHistory function definition.

  // Periodically checks for changes in the browser's history hash.
  historyCheck: function (  )
  {
    // Specific logic for Microsoft Internet Explorer.
    if (  jQuery.browser.msie  )
    {
      // In IE, history changes are tracked via the hidden iframe's location.hash.
      var ihistory = $ ("#jQuery_history") [0];
      var iframe = ihistory.contentDocument || ihistory.contentWindow.document; // Get iframe document.
      var current_hash = iframe.location.hash; // Retrieve the hash from the iframe.

      // If the iframe's hash has changed from our last known hash...
      if (  current_hash != jQuery.historyCurrentHash  )
      {
        location.hash = current_hash; // Update the main window's hash.
        jQuery.historyCurrentHash = current_hash; // Update our internal tracking variable.
        // Trigger the callback with the new hash, removing the leading '#'.
        jQuery.historyCallback (  current_hash.replace(/^#/, '')  ) ;
      }
    }
    // Specific logic for Safari browser, which requires manual stack management.
    else if (  $ . browser . safari  )
    {
      // Only perform checks if not explicitly told to pause (e.g., during a manual hash update).
      if (  ! jQuery.dontCheck  )
      {
        var historyDelta = history.length - jQuery.historyBackStack.length; // Calculate change in history length.

        // If historyDelta is non-zero, it means a browser back/forward button was used.
        if (  historyDelta  )
        {
          jQuery.isFirst = false; // No longer the first entry if history navigation occurred.
          if (  historyDelta < 0  )
          { // Back button was pushed.
            // Move items from the back stack to the forward stack.
            for (  var i = 0; i < Math.abs (  historyDelta  ) ; i++  )
            {
              jQuery.historyForwardStack.unshift (  jQuery.historyBackStack.pop ()  ) ;
            }
          }
          else
          { // Forward button was pushed.
            // Move items from the forward stack to the back stack.
            for (  var i = 0; i < historyDelta; i++  )
            {
              jQuery.historyBackStack.push (  jQuery.historyForwardStack.shift ()  ) ;
            }
          }
          var cachedHash = jQuery.historyBackStack [  jQuery.historyBackStack.length - 1  ] ; // Get the new current hash.
          if (  cachedHash != undefined  )
          {
            jQuery.historyCurrentHash = location.hash; // Update current hash from location.
            jQuery.historyCallback (  cachedHash  ) ; // Trigger callback with the cached hash.
          }
        }
        // Special case: Back button pushed to the beginning, and URL already points to a hash (e.g., a bookmark).
        // Safari's document.URL doesn't change in this specific scenario.
        else if (  jQuery.historyBackStack [  jQuery.historyBackStack.length - 1  ] == undefined
          && ! jQuery.isFirst  )
        {
          if (  document.URL.indexOf('#') >= 0  )
          {
            jQuery.historyCallback (  document.URL.split('#')[1]  ) ; // Use document.URL if hash is present.
          }
          else
          {
            var current_hash = location.hash; // Fallback to location.hash.
            jQuery.historyCallback (  ''  ) ; // Callback with empty hash.
          }
          jQuery.isFirst = true; // Reset first entry flag.
        }
      }
    }
    // For all other browsers (non-IE, non-Safari).
    else
    {
      // Simply check the main window's location.hash for changes.
      var current_hash = location.hash;
      if (  current_hash != jQuery.historyCurrentHash  )
      {
        jQuery.historyCurrentHash = current_hash; // Update internal hash tracker.
        jQuery.historyCallback (  current_hash.replace(/^#/, '')  ) ; // Invoke callback.
      }
    }
  } , // End of historyCheck function.

  // Programmatically loads a new hash into the history.
  historyLoad: function (  hash  )
  {
    var newhash; // Variable to hold the formatted hash.

    // Determine the hash format based on the browser.
    if (  jQuery.browser.safari  )
    {
      newhash = hash; // Safari handles hash directly without a leading '#'.
    }
    else
    {
      newhash = '#' + hash; // Prepend '#' for other browsers.
      location.hash = newhash; // Set the main window's hash.
    }
    jQuery.historyCurrentHash = newhash; // Update the internal current hash.

    // IE-specific handling for loading a new hash.
    if (  jQuery.browser.msie  )
    {
      var ihistory = $ ("#jQuery_history") [0]; // Get the history iframe.
      var iframe = ihistory.contentWindow.document; // Access its document.
      iframe.open(); // Prepare iframe for content.
      iframe.close(); // Finalize iframe document.
      iframe.location.hash = newhash; // Set the iframe's hash.
      jQuery.historyCallback (  hash  ) ; // Trigger the callback.
    }
    // Safari-specific handling for loading a new hash.
    else if (  jQuery.browser.safari  )
    {
      jQuery.dontCheck = true; // Temporarily disable history checking to prevent false positives.
      // Manually add the new hash to Safari's history stack.
      this.historyAddHistory (  hash  ) ;

      // Introduce a delay to allow Safari's internal history object to update correctly.
      // Without this, the check loop might detect an incorrect hash change immediately.
      var fn = function (  ) {  jQuery.dontCheck = false;  } ;
      window.setTimeout (  fn, 200  ) ;
      jQuery.historyCallback (  hash  ) ; // Execute the callback function.

      // Important Note for Safari:
      // The assignment to "location.hash" must be the final operation in this block.
      // Safari's execution flow can halt after this command.
      // Using "location.hash =" directly ensures both the browser's URL and history object
      // are updated as expected, unlike assigning to a variable first.
      location.hash = newhash;
    }
    // Generic handling for other browsers.
    else
    {
      jQuery.historyCallback (  hash  ) ; // Simply trigger the callback.
    }
  } // End of historyLoad function.
} ) ; // End of jQuery.extend call.