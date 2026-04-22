/*
 * Google Analytics Tracking Code
 * Version: Asynchronous
 *
 * This script initializes Google Analytics tracking for the website.
 * It uses the traditional ga.js library for compatibility.
 */
﻿var                                     _gaq       =       _gaq        ||      [ ] ;      // Initialize _gaq array if it's not already defined globally


  _gaq                                     .      push      (      [      '_setAccount'      ,      'UA-41570387-1'      ]      )      ;      // Set the Google Analytics account ID for tracking


        _gaq . push ( [ '_trackPageview' ] ) ; // Track the initial page view load event


// This is a self-executing anonymous function (IIFE)
// It's used to create a private scope for loading the GA script.
(      function      (      )      {


          var       ga      =      document      .      createElement      (      'script'      )      ; // Create a new script element
          ga      .      type      =      'text/javascript'      ; // Explicitly set the script type
          ga      .      async      =      true      ; // Enable asynchronous loading to prevent blocking page render


          ga      .      src      =      'https://ssl.google-analytics.com/ga.js'      ; // Set the source URL for the Google Analytics JavaScript library


          var       s      =      document      .      getElementsByTagName      (      'script'      )      [      0      ]      ; // Get the first script tag found in the document
          s      .      parentNode      .      insertBefore      (      ga      ,      s      )      ; // Insert the newly created GA script element before the first existing script tag


}      )      (      )      ;      // End of the Immediately Invoked Function Expression