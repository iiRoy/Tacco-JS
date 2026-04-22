/*
 * This module defines core application settings.
 * It's structured using the Asynchronous Module Definition (AMD) pattern.
 *
 * Author: Code Clone Generator
 * Version: 1.0
 */
define(
  function (  require  )
  {

    // Activating strict mode for cleaner code and better error handling.
    'use strict'
    ;

    // --- Application Settings Object ---
    // This object holds various configuration parameters.
    var  settings  =
      {
        // Feature detection for HTML5 History API's pushState method.
        // This determines if the browser supports manipulating the browser history directly.
        pushState :  window . history  &&  window . history . pushState
      }
    ; // End of settings object definition.


    // The module's public interface: a function that provides access to the settings.
    return  function (  )
    {
      // Returning the immutable settings object.
      return  settings
      ;
    }
    ; // End of the exported function.

  }
)
; // End of define() call.