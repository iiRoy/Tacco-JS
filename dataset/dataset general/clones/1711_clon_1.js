/*
 * matchMedia() polyfill - Tests a CSS media type/query in JavaScript.
 * Authors & copyright (c) 2012: Scott Jehl, Paul Irish, Nicholas Zakas.
 * This code is released under a Dual MIT/BSD license.
 *
 * NOTE: If you are already including a window.matchMedia polyfill via Modernizr
 * or some other means, this specific part of the code might not be necessary.
 */
( function ( w ) {
  "use strict"; /* Enforce strict mode for cleaner code. */

  // Assign w.matchMedia if it doesn't already exist.
  w.matchMedia = w.matchMedia || function ( doc, undefined ) {

    /*
     * Declare variables for use within this scope.
     * bool: Stores the result of the media query match.
     * docElem: The document's root element (e.g., <html>).
     * refNode: A reference node for inserting elements.
     * fakeBody: A temporary <body> element for testing.
     * div: A temporary <div> element with a specific ID.
     */
    var bool,
        docElem    = doc.documentElement,
        refNode    = docElem.firstElementChild || docElem.firstChild,
        fakeBody   = doc.createElement( "body" ),
        div        = doc.createElement( "div" );

    div.id = "mq-test-1"; // Set a unique ID for the test element.
    div.style.cssText = "position:absolute;top:-100em"; // Position off-screen.
    fakeBody.style.background = "none"; // Ensure no background interferes.

    fakeBody.appendChild( div ); // Add the test div to the fake body.

    // Return the actual media query testing function.
    return function ( q ) {
      // Inject a style block with the media query and test rule.
      div.innerHTML = '&shy;<style media="' + q + '"> #mq-test-1 { width: 42px; }</style>';

      // Insert the fake body into the document to apply styles.
      docElem.insertBefore( fakeBody, refNode );

      // Check if the width of the div matches the test value.
      bool = div.offsetWidth === 42;

      // Clean up: remove the fake body from the document.
      docElem.removeChild( fakeBody );

      // Return an object with the match status and the queried media.
      return {
        matches: bool,
        media:   q
      };
    };

  }( w.document ); // Immediately invoke with the window's document.

} )( this ); // Pass 'this' (window in a browser context) to the IIFE.

/*
 * matchMedia() polyfill: addListener/removeListener extension.
 * Author & copyright (c) 2012: Scott Jehl.
 * Released under a Dual MIT/BSD license.
 */
( function ( w ) {
  "use strict";

  // If matchMedia is supported and already has addListener, then we don't need this polyfill.
  if ( w.matchMedia && w.matchMedia( "all" ).addListener ) {
    return false; // Indicate that this polyfill was not applied.
  }

  // Store a reference to the original matchMedia implementation.
  var localMatchMedia = w.matchMedia;

  // Check if media queries are natively supported by testing 'only all'.
  var hasMediaQueries = localMatchMedia( "only all" ).matches;

  // Internal state variables.
  var isListening = false, // Flag to track if resize event listener is active.
      timeoutID   = 0,     // Timeout ID for debouncing resize events.
      queries     = [];    // Array to store active media queries and their listeners.

  // Event handler for window resize, debounces calls to process media queries.
  var handleChange = function ( evt ) {
    w.clearTimeout( timeoutID ); // Clear any existing timeout.

    // Set a new timeout to process queries after a short delay.
    timeoutID = w.setTimeout( function () {
      // Iterate through all registered media queries.
      for ( var i = 0, il = queries.length; i < il; i++ ) {
        var mql       = queries[ i ].mql,       // The media query list object.
            listeners = queries[ i ].listeners || [], // Associated listeners.
            matches   = localMatchMedia( mql.media ).matches; // Current match status.

        // If the match status has changed, update and notify listeners.
        if ( matches !== mql.matches ) {
          mql.matches = matches; // Update the mql object.

          // Call each listener associated with this media query.
          for ( var j = 0, jl = listeners.length; j < jl; j++ ) {
            listeners[ j ].call( w, mql ); // Invoke listener with the updated mql.
          }
        }
      }
    }, 30 ); // Debounce delay of 30 milliseconds.
  };

  // Override the global matchMedia function.
  w.matchMedia = function ( media ) {
    // Get the original media query list object.
    var mql       = localMatchMedia( media ),
        listeners = [], // Array to hold listeners for THIS specific mql.
        index     = 0;  // Index in the global 'queries' array.

    // Add a polyfilled addListener method to the mql object.
    mql.addListener = function ( listener ) {
      // If media queries are not supported, do nothing.
      if ( !hasMediaQueries ) {
        return;
      }

      // If not already listening for resize events, start.
      if ( !isListening ) {
        isListening = true;
        w.addEventListener( "resize", handleChange, true ); // Use capture phase.
      }

      // If this mql is not yet registered in the global 'queries' array, add it.
      if ( index === 0 ) {
        index = queries.push( {
          mql:       mql,
          listeners: listeners
        } );
      }

      listeners.push( listener ); // Add the new listener.
    };

    // Add a polyfilled removeListener method to the mql object.
    mql.removeListener = function ( listener ) {
      // Iterate through listeners and remove the matching one.
      for ( var i = 0, il = listeners.length; i < il; i++ ) {
        if ( listeners[ i ] === listener ) {
          listeners.splice( i, 1 ); // Remove the listener from the array.
          // Note: Does not remove the mql from global 'queries' array if all listeners are removed.
          // This might be an oversight in the original polyfill design, but we must clone it exactly.
        }
      }
    };

    return mql; // Return the enhanced mql object.
  };

} )( this );

/*
 * Respond.js v1.4.0: min/max-width media query polyfill.
 * (c) Scott Jehl. MIT License. See j.mp/respondjs for details.
 */
( function ( w ) {
  "use strict";

  var respond = {}; // Initialize the respond object.
  w.respond = respond; // Expose respond globally.

  respond.update = function () {
  }; // Placeholder for update function.

  var requestQueue = []; // Queue for AJAX requests for external stylesheets.

  // XMLHttp factory function.
  var xmlHttp = function () {
    var xmlhttpmethod = false; // Initialize to false.
    try {
      xmlhttpmethod = new w.XMLHttpRequest(); // Standard XMLHttpRequest.
    } catch ( e ) {
      xmlhttpmethod = new w.ActiveXObject( "Microsoft.XMLHTTP" ); // IE ActiveX.
    }
    return function () {
      return xmlhttpmethod;
    };
  }(),

  // AJAX utility function.
  ajax = function ( url, callback ) {
    var req = xmlHttp(); // Get an XMLHttpRequest object.
    if ( !req ) {
      return; // If no request object, exit.
    }

    req.open( "GET", url, true ); // Open an asynchronous GET request.

    // Define the state change handler.
    req.onreadystatechange = function () {
      // Check for completion and successful status codes.
      if ( req.readyState !== 4 || ( req.status !== 200 && req.status !== 304 ) ) {
        return;
      }
      callback( req.responseText ); // Call callback with response text.
    };

    // If readyState is already 4, it means the request is already complete (e.g., cached).
    if ( req.readyState === 4 ) {
      return;
    }

    req.send( null ); // Send the request.
  };

  respond.ajax = ajax; // Expose ajax utility.
  respond.queue = requestQueue; // Expose the request queue.

  // Regular expressions for parsing CSS.
  respond.regex = {
    media:      /@media[^\{]+\{([^\{\}]*\{[^\}\{]*\})+/gi, // Finds @media blocks.
    keyframes:  /@(?:\-(?:o|moz|webkit)\-)?keyframes[^\{]+\{(?:[^\{\}]*\{[^\}\{]*\})+[^\}]*\}/gi, // Finds keyframes.
    urls:       /(url\()['"]?([^\/\)'"][^:\)'"]+)['"]?(\))/g, // Finds URLs in CSS.
    findStyles: /@media *([^\{]+)\{([\S\s]+?)$/, // Extracts media query and styles.
    only:       /(only\s+)?([a-zA-Z]+)\s?/, // Parses 'only' and media type.
    minw:       /\([\s]*min\-width\s*:[\s]*([\s]*[0-9\.]+)(px|em)[\s]*\)/, // Extracts min-width.
    maxw:       /\([\s]*max\-width\s*:[\s]*([\s]*[0-9\.]+)(px|em)[\s]*\)/  // Extracts max-width.
  };

  // Check if native media queries are supported.
  respond.mediaQueriesSupported = w.matchMedia && w.matchMedia( "only all" ) !== null && w.matchMedia( "only all" ).matches;

  // If native support exists, exit early.
  if ( respond.mediaQueriesSupported ) {
    return;
  }

  /*
   * Initialize core variables for Respond.js.
   */
  var doc             = w.document,       // Document object.
      docElem         = doc.documentElement, // Document's root element.
      mediastyles     = [],               // Array to store parsed media queries.
      rules           = [],               // Array to store CSS rules.
      appendedEls     = [],               // Array to track appended style elements.
      parsedSheets    = {},               // Object to track processed stylesheets.
      resizeThrottle  = 30,               // Debounce throttle for resize events.
      head            = doc.getElementsByTagName( "head" )[ 0 ] || docElem, // Head element.
      base            = doc.getElementsByTagName( "base" )[ 0 ], // Base element.
      links           = head.getElementsByTagName( "link" ), // All link elements.
      lastCall,                           // Timestamp of the last applyMedia call.
      resizeDefer,                        // Timeout ID for deferred resize.
      eminpx,                             // Value of 1em in pixels.

  // Function to calculate the pixel value of 'em'.
  getEmValue = function () {
    var ret, // Return value.
        div = doc.createElement( "div" ), // Temporary div.
        body = doc.body, // Document body.
        originalHTMLFontSize = docElem.style.fontSize, // Original HTML font size.
        originalBodyFontSize = body && body.style.fontSize, // Original body font size.
        fakeUsed = false; // Flag if a temporary body was created.

    div.style.cssText = "position:absolute;font-size:1em;width:1em"; // Set test styles.

    // If no body exists, create a temporary one.
    if ( !body ) {
      body = fakeUsed = doc.createElement( "body" );
      body.style.background = "none"; // Ensure no background.
    }

    // Set font sizes to 100% for consistent 'em' calculation.
    docElem.style.fontSize = "100%";
    body.style.fontSize = "100%";

    body.appendChild( div ); // Append test div to body.

    // If a fake body was used, insert it into the document.
    if ( fakeUsed ) {
      docElem.insertBefore( body, docElem.firstChild );
    }

    ret = div.offsetWidth; // Get the computed width (1em in pixels).

    // Clean up: remove the fake body or div.
    if ( fakeUsed ) {
      docElem.removeChild( body );
    } else {
      body.removeChild( div );
    }

    // Restore original font sizes.
    docElem.style.fontSize = originalHTMLFontSize;
    if ( originalBodyFontSize ) {
      body.style.fontSize = originalBodyFontSize;
    }

    ret = eminpx = parseFloat( ret ); // Store and return the em value.
    return ret;
  },

  // Function to apply media query styles based on current viewport width.
  applyMedia = function ( fromResize ) {
    var name        = "clientWidth", // Property name for viewport width.
        docElemProp = docElem[ name ], // Document element's clientWidth.
        currWidth   = doc.compatMode === "CSS1Compat" && docElemProp || doc.body[ name ] || docElemProp, // Current viewport width.
        styleBlocks = {}, // Object to store CSS rules grouped by media query.
        lastLink    = links[ links.length - 1 ], // Last link element in the head.
        now         = new Date().getTime(); // Current timestamp.

    // Debounce resize events.
    if ( fromResize && lastCall && now - lastCall < resizeThrottle ) {
      w.clearTimeout( resizeDefer );
      resizeDefer = w.setTimeout( applyMedia, resizeThrottle );
      return;
    } else {
      lastCall = now; // Update last call timestamp.
    }

    // Iterate through all parsed media styles.
    for ( var i in mediastyles ) {
      if ( mediastyles.hasOwnProperty( i ) ) {
        var thisstyle = mediastyles[ i ], // Current media style object.
            min       = thisstyle.minw,  // Minimum width.
            max       = thisstyle.maxw,  // Maximum width.
            minnull   = min === null,    // Is min-width null?
            maxnull   = max === null,    // Is max-width null?
            em        = "em";            // Unit for 'em'.

        // Convert min-width to pixels if specified in ems.
        if ( !!min ) {
          min = parseFloat( min ) * ( min.indexOf( em ) > -1 ? eminpx || getEmValue() : 1 );
        }
        // Convert max-width to pixels if specified in ems.
        if ( !!max ) {
          max = parseFloat( max ) * ( max.indexOf( em ) > -1 ? eminpx || getEmValue() : 1 );
        }

        // Check if the media query matches the current viewport width.
        if ( !thisstyle.hasquery || ( !minnull || !maxnull ) && ( minnull || currWidth >= min ) && ( maxnull || currWidth <= max ) ) {
          // If a match, add rules to the styleBlocks object.
          if ( !styleBlocks[ thisstyle.media ] ) {
            styleBlocks[ thisstyle.media ] = [];
          }
          styleBlocks[ thisstyle.media ].push( rules[ thisstyle.rules ] );
        }
      }
    }

    // Remove previously appended style elements.
    for ( var j in appendedEls ) {
      if ( appendedEls.hasOwnProperty( j ) ) {
        if ( appendedEls[ j ] && appendedEls[ j ].parentNode === head ) {
          head.removeChild( appendedEls[ j ] );
        }
      }
    }
    appendedEls.length = 0; // Clear the array.

    // Append new style elements for matching media queries.
    for ( var k in styleBlocks ) {
      if ( styleBlocks.hasOwnProperty( k ) ) {
        var ss  = doc.createElement( "style" ), // Create a new style element.
            css = styleBlocks[ k ].join( "\n" ); // Join CSS rules.

        ss.type  = "text/css"; // Set type.
        ss.media = k;          // Set media attribute.

        head.insertBefore( ss, lastLink.nextSibling ); // Insert into head.

        // Apply CSS rules, handling IE's styleSheet.cssText.
        if ( ss.styleSheet ) {
          ss.styleSheet.cssText = css;
        } else {
          ss.appendChild( doc.createTextNode( css ) );
        }
        appendedEls.push( ss ); // Add to tracking array.
      }
    }
  },

  // Function to parse CSS text and extract media queries.
  translate = function ( styles, href, media ) {
    var qs = styles.replace( respond.regex.keyframes, "" ).match( respond.regex.media ), // Find @media blocks, exclude keyframes.
        ql = qs && qs.length || 0; // Number of media queries found.

    href = href.substring( 0, href.lastIndexOf( "/" ) ); // Extract base path from href.

    // Function to replace relative URLs in CSS with absolute paths.
    var repUrls = function ( css ) {
      return css.replace( respond.regex.urls, "$1" + href + "$2$3" );
    },
    useMedia = !ql && media; // Flag if media attribute should be used directly.

    if ( href.length ) {
      href += "/"; // Add trailing slash if href exists.
    }

    if ( useMedia ) {
      ql = 1; // If using media attribute directly, treat as one query.
    }

    // Process each media query found.
    for ( var i = 0; i < ql; i++ ) {
      var fullq, thisq, eachq, eql;

      if ( useMedia ) {
        fullq = media;          // Use the link's media attribute.
        rules.push( repUrls( styles ) ); // Push all styles.
      } else {
        fullq = qs[ i ].match( respond.regex.findStyles ) && RegExp.$1; // Extract query part.
        rules.push( RegExp.$2 && repUrls( RegExp.$2 ) ); // Extract styles and fix URLs.
      }

      eachq = fullq.split( "," ); // Split by comma for multiple queries in one block.
      eql = eachq.length;       // Number of individual queries.

      // Parse each individual query.
      for ( var j = 0; j < eql; j++ ) {
        thisq = eachq[ j ];
        mediastyles.push( {
          media:    thisq.split( "(" )[ 0 ].match( respond.regex.only ) && RegExp.$2 || "all", // Extract media type (e.g., 'screen').
          rules:    rules.length - 1, // Index of the corresponding CSS rules.
          hasquery: thisq.indexOf( "(" ) > -1, // Does it contain a media feature (e.g., min-width)?
          minw:     thisq.match( respond.regex.minw ) && parseFloat( RegExp.$1 ) + ( RegExp.$2 || "" ), // Extract min-width value.
          maxw:     thisq.match( respond.regex.maxw ) && parseFloat( RegExp.$1 ) + ( RegExp.$2 || "" )  // Extract max-width value.
        } );
      }
    }
    applyMedia(); // Apply the newly parsed media styles.
  },

  // Function to process the AJAX request queue.
  makeRequests = function () {
    if ( requestQueue.length ) {
      var thisRequest = requestQueue.shift(); // Get the next request from the queue.
      ajax( thisRequest.href, function ( styles ) {
        translate( styles, thisRequest.href, thisRequest.media ); // Process the fetched styles.
        parsedSheets[ thisRequest.href ] = true; // Mark as processed.
        w.setTimeout( function () {
          makeRequests(); // Process next request after a short delay.
        }, 0 );
      } );
    }
  },

  // Function to rip CSS from link elements.
  ripCSS = function () {
    // Iterate through all link elements.
    for ( var i = 0; i < links.length; i++ ) {
      var sheet   = links[ i ], // Current link element.
          href    = sheet.href, // Href attribute.
          media   = sheet.media, // Media attribute.
          isCSS   = sheet.rel && sheet.rel.toLowerCase() === "stylesheet"; // Is it a stylesheet?

      // If it's a valid CSS link and not yet parsed.
      if ( !!href && isCSS && !parsedSheets[ href ] ) {
        // If styleSheet object available (IE), use its rawCssText.
        if ( sheet.styleSheet && sheet.styleSheet.rawCssText ) {
          translate( sheet.styleSheet.rawCssText, href, media );
          parsedSheets[ href ] = true;
        } else {
          // Check if the stylesheet is on the same domain or relative path.
          if ( !/^([a-zA-Z:]*\/\/)/.test( href ) && !base || href.replace( RegExp.$1, "" ).split( "/" )[ 0 ] === w.location.host ) {
            // Handle protocol-relative URLs.
            if ( href.substring( 0, 2 ) === "//" ) {
              href = w.location.protocol + href;
            }
            requestQueue.push( {
              href:  href,
              media: media
            } ); // Add to request queue.
          }
        }
      }
    }
    makeRequests(); // Start processing the request queue.
  };

  ripCSS(); // Initial call to rip CSS from the document.
  respond.update = ripCSS; // Expose ripCSS as respond.update.
  respond.getEmValue = getEmValue; // Expose getEmValue.

  // Callback for resize event.
  function callMedia() {
    applyMedia( true ); // Call applyMedia, indicating it's from a resize event.
  }

  // Attach resize event listener.
  if ( w.addEventListener ) {
    w.addEventListener( "resize", callMedia, false ); // Modern browsers.
  } else if ( w.attachEvent ) {
    w.attachEvent( "onresize", callMedia ); // IE < 9.
  }

} )( this );