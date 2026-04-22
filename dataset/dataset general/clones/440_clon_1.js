/*
 * Vogue - Client
 * Copyright (c) 2011 Andrew Davey (andrew@equin.co.uk)
 * This file contains the client-side logic for the Vogue stylesheet reloader.
 * It connects to a Socket.IO server to receive updates and reload stylesheets.
 */
( function () {

  var script, // Variable to hold script configuration information
      hop = Object.prototype.hasOwnProperty, // Shortcut for hasOwnProperty method
      head = document.getElementsByTagName("head")[0]; // Reference to the document's <head> element

  /**
   * Main Vogue client function.
   * Initializes Socket.IO connection and sets up stylesheet watching/reloading.
   */
  function vogue() {

    var stylesheets, // Object to store references to local stylesheets
        socket = io.connect( script.rootUrl ); // Establish Socket.IO connection to the root URL

    /**
     * Iterates through all available stylesheets and registers them for watching with the server.
     * This function is called once the Socket.IO connection is established.
     */
    function watchAllStylesheets() {
      var href; // Variable to hold the stylesheet's href (key)
      for ( href in stylesheets ) { // Loop through all collected stylesheets
        if ( hop.call( stylesheets, href ) ) { // Ensure it's an own property, not from prototype chain
          socket.emit( "watch", { // Emit a "watch" event to the server
            href: href // Send the href of the stylesheet to be watched
          } );
        }
      }
    }

    /**
     * Reloads a specific stylesheet by updating its href to bypass browser cache.
     * If the stylesheet is not a DOM element (e.g., from an @import rule), it creates a new link element.
     *
     * @param {String} href The URL key of the stylesheet to be reloaded.
     */
    function reloadStylesheet( href ) {

      var newHref = stylesheets[ href ].href + // Get the current href
            ( href.indexOf( "?" ) >= 0 ? "&" : "?" ) + // Append '?' or '&' depending on existing query string
            "_vogue_nocache=" + ( new Date ).getTime(), // Add a unique cache-busting parameter
          stylesheet; // Variable to hold the stylesheet DOM element

      // Check if the appropriate DOM Node is there, or if it's a dummy object for @import.
      if ( !stylesheets[ href ].setAttribute ) {

        // If it's not a DOM node (likely an @import), create a new link element.
        stylesheet = document.createElement( "link" ); // Create a new <link> element
        stylesheet.setAttribute( "rel", "stylesheet" ); // Set rel attribute
        stylesheet.setAttribute( "href", newHref ); // Set the new href
        head.appendChild( stylesheet ); // Append the new link to the head

        // Update the reference in the 'stylesheets' object to the newly created link element.
        stylesheets[ href ] = stylesheet;

      } else {

        // If it's an existing DOM node, simply update its href attribute to trigger reload.
        stylesheets[ href ].href = newHref;

      }
    }


    /**
     * Handles incoming messages from the Socket.IO server.
     * Typically, these messages indicate a stylesheet update.
     *
     * @param {Object} message Socket.io message object.
     * @param {String} message.href The URL of the stylesheet to be reloaded.
     */
    function handleMessage( message ) {

      reloadStylesheet( message.href ); // Call the reload function with the received href

    }

    /**
     * Scans the current page for local stylesheets (both <link> and @import rules within <style> tags).
     *
     * @returns {Object} A map of local stylesheets, keyed by their base URL.
     */
    function getLocalStylesheets() {

      /**
       * Determines if a given link element refers to a local stylesheet.
       * A stylesheet is considered local if its href contains any of the predefined base URLs
       * and is not explicitly an external HTTPS/HTTP link.
       *
       * @param {Object} link The link (or link-like object) to check.
       * @returns {Boolean} True if the stylesheet is local, false otherwise.
       */
      function isLocalStylesheet( link ) {

        var href, // Variable to hold the stylesheet's URL
            i, // Loop counter
            isExternal = true; // Flag to track if the stylesheet is external, defaults to true

        // Only consider elements with rel="stylesheet"
        if ( link.getAttribute( "rel" ) !== "stylesheet" ) {
          return false;
        }

        href = link.href; // Get the full href of the link

        // Check against all known base URLs
        for ( i = 0; i < script.bases.length; i += 1 ) {
          if ( href.indexOf( script.bases[ i ] ) > -1 ) {
            isExternal = false; // Found a match, so it's not external
            break; // No need to check further bases
          }
        }

        // Return true if it's not external OR if it's external but not an http/https link
        // (i.e., it's a relative path that didn't match a base, but is still local)
        return !( isExternal && href.match( /^https?:/ ) );
      }

      /**
       * Checks if the stylesheet's media attribute is set to 'print'.
       * Vogue typically ignores print stylesheets for live reloading.
       *
       * @param {Object} link The stylesheet element to check.
       * @returns {Boolean} True if it's a print stylesheet, false otherwise.
       */
      function isPrintStylesheet( link ) {
        return link.getAttribute( "media" ) === "print";
      }

      /**
       * Extracts the base URL portion of a stylesheet's href.
       * This is used to normalize the keys for the 'stylesheets' object.
       *
       * @param {String} href The full URL of the stylesheet.
       * @returns {String|Boolean} The base URL part, or false if no matching base is found.
       */
      function getBase( href ) {

        var base, // Variable to hold a single base URL from script.bases
            j; // Loop counter

        for ( j = 0; j < script.bases.length; j += 1 ) {
          base = script.bases[ j ]; // Get the current base URL
          if ( href.indexOf( base ) > -1 ) {
            return href.substr( base.length ); // Return the part of the href after the base
          }
        }
        return false; // No matching base found
      }

      /**
       * Generic property getter function.
       * Used to provide a .getAttribute method for objects representing @import rules.
       *
       * @param {String} property The name of the property to retrieve.
       * @returns {*} The value of the requested property.
       */
      function getProperty( property ) {
        return this[ property ];
      }

      var stylesheets = {}, // Initialize the object to store found stylesheets
          reImport = /@import\s+url\(["']?([^"'\)]+)["']?\)/g, // Regex to find @import rules
          links = document.getElementsByTagName( "link" ), // Get all <link> elements
          link, // Variable to hold a single link element
          href, // Variable to hold the stylesheet's href
          matches, // Variable to hold regex matches
          content, // Variable to hold the content of <style> tags
          i, // Loop counter
          m; // Loop limit/length

      // --- Process <link> elements ---
      // Go through all the <link> tags in the page, looking for local stylesheets.
      for ( i = 0, m = links.length; i < m; i += 1 ) {

        link = links[ i ]; // Get the current link element

        if ( isPrintStylesheet( link ) ) continue; // Skip print stylesheets
        if ( !isLocalStylesheet( link ) ) continue; // Skip non-local stylesheets

        // If the link is local, get its base URL.
        href = getBase( link.href );
        if ( href !== false ) {
          stylesheets[ href ] = link; // Store the link element using its base href as key
        }
      }

      // --- Process <style> elements for @import rules ---
      links = document.getElementsByTagName( "style" ); // Re-use 'links' variable for <style> elements
      for ( i = 0, m = links.length; i < m; i += 1 ) {

        if ( isPrintStylesheet( links[ i ] ) ) continue; // Skip print stylesheets

        content = links[ i ].text || links[ i ].textContent; // Get the CSS content of the style tag

        // Find all @import rules within the content
        while ( ( matches = reImport.exec( content ) ) ) {

          // Create a dummy link-like object for the @import rule
          link = {
            rel: "stylesheet",
            href: matches[ 1 ], // The URL from the @import rule
            getAttribute: getProperty // Provide a getAttribute method for consistency
          };

          if ( isLocalStylesheet( link ) ) {
            // If the imported stylesheet is local, get its base URL.
            href = getBase( link.href );
            if ( href !== false ) {
              stylesheets[ href ] = link; // Store the dummy link object
            }
          }
        }
      }
      return stylesheets; // Return the collected local stylesheets
    }

    // --- Vogue function execution starts here ---
    stylesheets = getLocalStylesheets(); // Populate the 'stylesheets' object
    socket.on( "connect", watchAllStylesheets ); // When connected, start watching all stylesheets
    socket.on( "update", handleMessage ); // When an update message is received, handle it
  }

  /**
   * Loads a JavaScript script into the page dynamically.
   *
   * @param {String} src The URL of the script to be loaded.
   * @param {Function} loadedCallback The function to be called once the script has loaded.
   */
  function loadScript( src, loadedCallback ) {

    var script = document.createElement( "script" ); // Create a new <script> element
    script.setAttribute( "type", "text/javascript" ); // Set the type attribute
    script.setAttribute( "src", src ); // Set the source URL

    // Assign the callback for standard 'load' event
    script.onload = loadedCallback;

    // Assign the callback for 'onreadystatechange' to handle older IE versions
    script.onreadystatechange = function () {
      if ( this.readyState === "complete" || this.readyState === "loaded" ) {
        loadedCallback(); // Call the callback when script is ready
      }
    };

    head.appendChild( script ); // Append the script to the document's head to start loading
  }

  /**
   * Loads multiple JavaScript scripts into the page sequentially or in parallel (depending on browser).
   * It ensures that a final callback is executed only after all specified scripts have loaded.
   *
   * @param {Object} scripts An object where keys are global variable names and values are script URLs.
   *                         Scripts are loaded only if the corresponding global variable is not already defined.
   * @param {Function} loadedCallback The function to be called when all required scripts have loaded.
   */
  function loadScripts( scripts, loadedCallback ) {

    var srcs = [], // Array to hold URLs of scripts that need to be loaded
        property, // Loop variable for object properties
        count, // Counter for pending scripts
        i, // Loop counter
        src, // Variable to hold a single script URL
        countDown = function () { // Callback function to decrement the counter and check completion
          count -= 1; // Decrement the count
          if ( !count ) { // If count reaches zero, all scripts are loaded
            loadedCallback(); // Execute the final callback
          }
        };

    // Determine which scripts actually need to be loaded (i.e., not already present in window)
    for ( property in scripts ) {
      if ( !( property in window ) ) { // Check if the global variable for this script is undefined
        srcs.push( scripts[ property ] ); // Add its URL to the list of scripts to load
      }
    }

    count = srcs.length; // Initialize the counter with the number of scripts to load
    if ( !count ) {
      loadedCallback(); // If no scripts need loading, execute callback immediately
      return; // Exit the function
    }

    // Load each required script
    for ( i = 0; i < srcs.length; i += 1 ) {
      src = srcs[ i ]; // Get the current script URL
      loadScript( src, countDown ); // Load the script and use countDown as its completion callback
    }
  }

  /**
   * Fetches configuration information for the Vogue client script itself.
   * This includes its root URL and an array of base URLs for local stylesheets.
   *
   * @returns {Object} An object containing 'rootUrl' and 'bases' properties.
   */
  function getScriptInfo() {

    var bases = [ document.location.protocol + "//" + document.location.host ], // Default base URL: current host
        scripts, // Collection of all <script> elements
        src, // Variable to hold a script's src attribute
        rootUrl, // The root URL of the Vogue client script
        baseMatch; // Regex match for an optional 'base' parameter in the script URL

    // If __vogue__ is not globally defined, it's the first time running or not pre-configured
    if ( typeof window.__vogue__ === "undefined" ) {

      scripts = document.getElementsByTagName( "script" ); // Get all script tags

      // Find the vogue-client.js script itself
      for ( var i = 0; i < scripts.length; i++ ) {
        src = scripts[ i ].getAttribute( "src" ); // Get the src attribute
        if ( src && src.slice( -15 ) === 'vogue-client.js' ) break; // Found it if it ends with 'vogue-client.js'
      }

      rootUrl = src.match( /^https?\:\/\/(.*?)\// )[ 0 ]; // Extract the root URL (protocol + host + first path segment)

      // Check for an optional 'base' argument in the script's URL query string.
      // E.g., vogue-client.js?base=http://localhost:3000/css/,/another/path/
      baseMatch = src.match( /\bbase=(.*)(&|$)/ );

      if ( baseMatch ) {
        // If a base argument is found, concatenate its values (comma-separated) to the 'bases' array.
        bases = bases.concat( baseMatch[ 1 ].split( "," ) );
      }

      return {
        rootUrl: rootUrl,
        bases: bases
      };

    } else {

      // If __vogue__ is already defined (e.g., from a server-side pre-configuration),
      // update its bases and return it.
      window.__vogue__.bases = bases;
      return window.__vogue__;

    }
  }

  /**
   * Extracts the port number from a given URL string.
   *
   * @param {String} url URL to get the port from.
   * @returns {Number} The port number, or 80 if no valid port number is found.
   */
  function getPort( url ) {

    // URL may contain the port number after the second colon.
    // Example: http://domain:1234/
    // We skip the first 6 characters ("http://" or "https:") to ignore the protocol colon.
    var index = url.indexOf( ":", 6 );

    // If no colon is found after the protocol, default to port 80.
    // Otherwise, parse the substring after the colon as an integer.
    return index < 0 ? 80 : parseInt( url.substr( index + 1 ), 10 );
  }

  // --- Initial client setup ---
  script = getScriptInfo(); // Get the Vogue client script's configuration
  loadScripts( { // Load necessary external scripts
    io: script.rootUrl + "socket.io/socket.io.js" // Load Socket.IO client library
  }, vogue ); // Once Socket.IO is loaded, execute the main vogue function
}() );