/*******************************************************************************
 * respond.js - A compact and efficient polyfill for CSS3 Media Queries
 *
 * Copyright (c) 2011, Scott Jehl, scottjehl.com
 *
 * This code is distributed under the terms of the MIT or GPL Version 2 licenses.
 * Please refer to the accompanying readme file or visit github.com/scottjehl/respond
 * for detailed usage instructions and license information.
 *
 * This file aims to provide responsive design capabilities to browsers that lack
 * native support for CSS3 Media Queries, particularly for min-width and max-width.
 ******************************************************************************/
( function (
   win, /* The global window object for browser environment access. */
   mqSupported /* Boolean indicating if media queries are natively supported. */
 ) {

  // Establish a global namespace for respond.js functionality.
  win.respond = {};

  // Define an 'update' function for external use, even if native MQ support exists.
  // This prevents errors if update() is called in a natively supported browser.
  respond.update = function ( ) {
  };

  // Expose the media query support flag for other scripts to check.
  respond.mediaQueriesSupported = mqSupported;


  // If the browser natively supports media queries, there's no need for this polyfill.
  // Exit early to save resources and avoid potential conflicts.
  if ( mqSupported ) {
    return;
  }


  // --- Core Variable Declarations ---
  // These variables hold references and data structures essential for the polyfill's operation.
  var doc = win.document, // Shorthand for the document object.
    docElem = doc.documentElement, // Shorthand for the document's root element (<html>).
    mediastyles = [], // Array to store parsed media query rules and their conditions.
    rules = [], // Array to store the actual CSS rules extracted from stylesheets.
    appendedEls = [], // Array to keep track of <style> elements dynamically appended to the DOM.
    parsedSheets = {}, // Object to store URLs of stylesheets that have already been parsed, preventing re-parsing.
    resizeThrottle = 30, // Milliseconds to throttle resize events for performance.
    head = doc.getElementsByTagName( "head" )[ 0 ] || docElem, // Reference to the document's <head> element.
    links = head.getElementsByTagName( "link" ), // Collection of all <link> elements in the head.
    requestQueue = [], // Queue for AJAX requests to fetch stylesheet content.

    // --- Function: ripCSS ---
    // Iterates through all <link> elements in the document's head.
    // Identifies external stylesheets and queues them for fetching and parsing.
    ripCSS = function () {
      var sheets = links, // Get current list of link elements.
        sl = sheets.length; // Store the length for efficient iteration.

      // Loop through each link element found in the document head.
      for ( var i = 0; i < sl; i++ ) {
        var sheet = sheets[ i ], // Current link element.
          href = sheet.href, // The URL of the stylesheet.
          media = sheet.media, // The media attribute of the link.
          isCSS = sheet.rel && sheet.rel.toLowerCase() === "stylesheet"; // Check if it's a stylesheet.

        // Proceed only if it's a valid CSS link and hasn't been parsed before.
        if ( !!href && isCSS && !parsedSheets[ href ] ) {
          // Check if the stylesheet is on the same domain or a relative path.
          // This avoids issues with cross-origin requests that cannot be read via AJAX.
          if ( !/^([a-zA-Z]+?:(\/\/)?(www\.)?)/.test( href )
            || href.replace( RegExp.$1, "" ).split( "/" )[ 0 ] === win.location.host ) {
            // Add the stylesheet to the request queue for fetching.
            requestQueue.push( {
              href: href,
              media: media
            } );
          } else {
            // Mark cross-origin stylesheets as parsed to prevent repeated attempts.
            parsedSheets[ href ] = true;
          }
        }
      }
      // Initiate the process of making AJAX requests for queued stylesheets.
      makeRequests();
    },

    // --- Function: makeRequests ---
    // Recursively processes the requestQueue, fetching stylesheet content via AJAX.
    makeRequests = function () {
      // If there are items in the queue, process the next one.
      if ( requestQueue.length ) {
        var thisRequest = requestQueue.shift(); // Get the next request from the front of the queue.

        // Perform an AJAX request to fetch the stylesheet content.
        ajax( thisRequest.href, function ( styles ) {
          // Once fetched, translate the CSS content into media query rules.
          translate( styles, thisRequest.href, thisRequest.media );
          // Mark the current stylesheet as parsed.
          parsedSheets[ thisRequest.href ] = true;
          // Recursively call makeRequests to process the next item in the queue.
          makeRequests();
        } );
      }
    },

    // --- Function: translate ---
    // Parses CSS text, extracts media query blocks, and converts them into
    // actionable style rules.
    translate = function ( styles, href, media ) {
      // Regular expression to find @media blocks in the CSS text.
      var qs = styles.match( /@media ([^\{]+)\{([\S\s]+?)(?=\}\/\*\/mediaquery\*\/)/gmi ),
        ql = qs && qs.length || 0, // Number of media query blocks found.
        // Extract the base path of the stylesheet for resolving relative URLs.
        href = href.substring( 0, href.lastIndexOf( "/" ) ),
        // Helper function to resolve relative URLs within the CSS content.
        repUrls = function ( css ) {
          return css.replace( /(url\()['"]?([^\/\)'"][^:\)'"]+)['"]?(\))/g, "$1" + href + "$2$3" );
        },
        useMedia = !ql && media; // Flag: use the link's media attribute if no internal @media rules are found.

      // If a path was extracted, append a trailing slash for correct URL resolution.
      if ( href.length ) {
        href += "/";
      }

      // If no internal media queries are present but a media attribute exists on the link,
      // treat the entire stylesheet as being under that media condition.
      // NOTE: This currently lacks support for cases where a link has a media attribute
      // AND its stylesheet contains internal CSS media queries. In such scenarios,
      // the link's media attribute will be ignored.
      if ( useMedia ) {
        ql = 1; // Treat as one media query block for processing.
      }

      // Iterate through each identified media query block (or the entire sheet if useMedia is true).
      for ( var i = 0; i < ql; i++ ) {
        var fullq; // Variable to hold the full media query condition string.

        // Case 1: Media attribute on the link element is being used.
        if ( useMedia ) {
          fullq = media; // The media condition is directly from the link's media attribute.
          rules.push( repUrls( styles ) ); // Add the entire stylesheet's content as a rule.
        }
        // Case 2: Parsing an internal @media block.
        else {
          // Extract the media condition (e.g., "screen and (min-width: 600px)")
          // and the CSS rules within that block.
          fullq = qs[ i ].match( /@media ([^\{]+)\{([\S\s]+?)$/ ) && RegExp.$1;
          rules.push( RegExp.$2 && repUrls( RegExp.$2 ) ); // Add the CSS rules, resolving relative URLs.
        }

        var eachq = fullq.split( "," ), // Split complex queries (e.g., "screen and (min-width: 600px), print")
          eql = eachq.length; // Number of individual conditions in the query.

        // Process each individual media query condition.
        for ( var j = 0; j < eql; j++ ) {
          var thisq = eachq[ j ]; // Current individual media query condition.
          mediastyles.push( {
            media: thisq.match( /(only\s+)?([a-zA-Z]+)(\sand)?/ ) && RegExp.$2, // Extract media type (e.g., "screen", "print").
            rules: rules.length - 1, // Index of the corresponding CSS rules in the 'rules' array.
            minw: thisq.match( /\(min\-width:\s?(\s?[0-9]+)px\s?\)/ ) && parseFloat( RegExp.$1 ), // Extract min-width value.
            maxw: thisq.match( /\(max\-width:\s?(\s?[0-9]+)px\s?\)/ ) && parseFloat( RegExp.$1 ) // Extract max-width value.
          } );
        }
      }

      // After parsing all rules, apply the media queries based on the current viewport.
      applyMedia();
    },

    // Timestamp of the last call to applyMedia (used for throttling).
    lastCall,

    // Timer ID for the resize deferral (used for throttling).
    resizeDefer,

    // --- Function: applyMedia ---
    // Evaluates current viewport dimensions against parsed media queries
    // and injects/removes corresponding style blocks.
    applyMedia = function ( fromResize ) {
      var name = "clientWidth", // Property name for width.
        docElemProp = docElem[ name ], // Document element's clientWidth.
        // Determine the current viewport width, considering quirks mode.
        currWidth = doc.compatMode === "CSS1Compat" && docElemProp || doc.body[ name ] || docElemProp,
        styleBlocks = {}, // Object to group CSS rules by media type (e.g., "screen", "print").
        dFrag = doc.createDocumentFragment(), // Document fragment for efficient DOM insertion.
        lastLink = links[ links.length - 1 ], // Reference to the last <link> element in the head.
        now = ( new Date() ).getTime(); // Current timestamp.

      // Throttle resize calls to prevent excessive re-rendering.
      if ( fromResize && lastCall && now - lastCall < resizeThrottle ) {
        clearTimeout( resizeDefer ); // Clear any pending resize deferral.
        resizeDefer = setTimeout( applyMedia, resizeThrottle ); // Set a new deferral.
        return; // Exit, will re-run after throttle.
      } else {
        lastCall = now; // Update the last call timestamp.
      }

      // Iterate through all stored media query conditions.
      for ( var i in mediastyles ) {
        var thisstyle = mediastyles[ i ]; // Current media query condition object.

        // Check if the current viewport width satisfies the media query's min-width and/or max-width conditions.
        // A condition is met if:
        // 1. No min/max width is specified (always true).
        // OR
        // 2. (No min-width OR min-width is met) AND (No max-width OR max-width is met).
        if ( !thisstyle.minw && !thisstyle.maxw ||
          ( !thisstyle.minw || thisstyle.minw && currWidth >= thisstyle.minw ) &&
          ( !thisstyle.maxw || thisstyle.maxw && currWidth <= thisstyle.maxw ) ) {
          // If the media query is active, group its rules by media type.
          if ( !styleBlocks[ thisstyle.media ] ) {
            styleBlocks[ thisstyle.media ] = []; // Initialize array for this media type if it doesn't exist.
          }
          styleBlocks[ thisstyle.media ].push( rules[ thisstyle.rules ] ); // Add the CSS rule to the appropriate group.
        }
      }

      // Remove any previously injected respond.js style elements to prepare for new ones.
      for ( var i in appendedEls ) {
        if ( appendedEls[ i ] && appendedEls[ i ].parentNode === head ) {
          head.removeChild( appendedEls[ i ] ); // Remove the element from the DOM.
        }
      }

      // Inject active styles into the DOM, grouped by their media type.
      for ( var i in styleBlocks ) {
        var ss = doc.createElement( "style" ), // Create a new <style> element.
          css = styleBlocks[ i ].join( "\n" ); // Concatenate all CSS rules for this media type.

        ss.type = "text/css"; // Set the style type.
        ss.media = i; // Set the media attribute for the style block.

        // Handle IE's proprietary stylesheet object for setting CSS text.
        if ( ss.styleSheet ) {
          ss.styleSheet.cssText = css;
        }
        // For standard browsers, append the CSS text as a child node.
        else {
          ss.appendChild( doc.createTextNode( css ) );
        }
        dFrag.appendChild( ss ); // Add the new style element to the document fragment.
        appendedEls.push( ss ); // Keep track of the appended style element.
      }

      // Append all new style elements to the DOM at once for better performance.
      // Insert them after the last link element to maintain CSS cascade order.
      head.insertBefore( dFrag, lastLink.nextSibling );
    },

    // --- Function: ajax ---
    // A simplified AJAX utility function to fetch content from a URL.
    // Tweaked from Quirksmode's AJAX functions.
    ajax = function ( url, callback ) {
      var req = xmlHttp(); // Get an XMLHttpRequest object.
      if ( !req ) {
        return; // If no XMLHttp object, exit.
      }
      req.open( "GET", url, true ); // Open an asynchronous GET request.
      req.onreadystatechange = function () {
        // Only proceed if the request is complete and successful.
        if ( req.readyState != 4 || req.status != 200 && req.status != 304 ) {
          return;
        }
        callback( req.responseText ); // Call the callback with the response text.
      }
      // If readyState is already 4 before sending, it indicates a cached response.
      if ( req.readyState == 4 ) {
        return;
      }
      req.send(); // Send the request.
    },

    // --- Function: xmlHttp (Self-Executing Function) ---
    // Detects and returns the appropriate XMLHttpRequest object for the browser.
    // Tries various ActiveXObject versions for older IE, then standard XMLHttpRequest.
    xmlHttp = ( function () {
      var xmlhttpmethod = false, // Variable to store the XMLHttpRequest constructor.
        attempts = [ // Array of functions to try for creating XMLHttpRequest.
          function () {
            return new ActiveXObject( "Microsoft.XMLHTTP" )
          },
          function () {
            return new ActiveXObject( "Msxml3.XMLHTTP" )
          },
          function () {
            return new ActiveXObject( "Msxml2.XMLHTTP" )
          },
          function () {
            return new XMLHttpRequest()
          }
        ],
        al = attempts.length; // Number of attempts.

      // Iterate through attempts in reverse order to prioritize newer versions.
      while ( al-- ) {
        try {
          xmlhttpmethod = attempts[ al ](); // Try to create an XMLHttpRequest object.
        } catch ( e ) {
          continue; // If it fails, try the next one.
        }
        break; // If successful, break the loop.
      }
      // Return a function that, when called, returns the detected XMLHttpRequest object.
      return function () {
        return xmlhttpmethod;
      };
    } )();


  // --- Initialization ---

  // Begin the process by ripping CSS from link elements.
  ripCSS();

  // Expose the update function for external scripts to trigger a re-evaluation
  // of media queries, useful after dynamically adding stylesheets.
  respond.update = ripCSS;

  // --- Event Listener for Window Resizing ---

  // Define a wrapper function for applyMedia to use with event listeners.
  function callMedia () {
    applyMedia( true ); // Pass 'true' to enable throttling.
  }

  // Attach the resize event listener based on browser support.
  if ( win.addEventListener ) {
    win.addEventListener( "resize", callMedia, false ); // Modern browsers.
  } else if ( win.attachEvent ) {
    win.attachEvent( "onresize", callMedia ); // Older IE.
  }

} )(
  // Pass the global window object to the IIFE.
  this,

  // --- Second IIFE: Determine Native Media Query Support ---
  // This self-executing function checks if the browser natively supports
  // media queries or if respond.js needs to polyfill.
  ( function ( win ) {

    // For speed, flag browsers with window.matchMedia support and IE 9 as supported.
    // window.matchMedia is a more reliable and performant way to check.
    if ( win.matchMedia ) {
      return true;
    }

    var bool, // Result of the media query test.
      doc = document, // Shorthand for document.
      docElem = doc.documentElement, // Shorthand for documentElement.
      refNode = docElem.firstElementChild || docElem.firstChild, // Reference node for insertion.
      // Create a temporary <body> element; required for <FF4 when script runs in <head>.
      fakeBody = doc.createElement( "body" ),
      div = doc.createElement( "div" ), // Temporary <div> for the test.
      q = "only all"; // A generic media query string.

    // Set up the test div.
    div.id = "mq-test-1"; // Give it an ID.
    div.style.cssText = "position:absolute;top:-99em"; // Position it off-screen.
    fakeBody.appendChild( div ); // Append div to the fake body.

    // Inject a <style> tag with a media query into the div.
    // If the media query applies, the width of the div will be 9px.
    div.innerHTML = '_<style media="' + q + '"> #mq-test-1 { width: 9px; }</style>';
    docElem.insertBefore( fakeBody, refNode ); // Insert fake body into the DOM.
    div.removeChild( div.firstChild ); // Remove the '_' character.

    // Check if the div's offsetWidth is 9, indicating the media query was applied.
    bool = div.offsetWidth == 9;

    docElem.removeChild( fakeBody ); // Clean up the fake body.

    return bool; // Return the result of the media query support test.

  } )( this ) // Pass the global window object to the inner IIFE as well.
);