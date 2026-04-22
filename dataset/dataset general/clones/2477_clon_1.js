/*
 * @fileoverview RWD Retrofit Module - Core Logic
 * @version 1.7 - Enhanced for clarity and modern formatting.
 * @author Izilla Partners Pty Ltd (http://www.izilla.com.au)
 * @license MIT - Open-source licensing.
 *
 * This module provides a robust solution for managing responsive web design
 * alongside existing desktop-first sites. It intelligently adjusts media
 * queries and viewport settings, particularly useful for accommodating
 * tablets and other mobile devices that might otherwise receive a desktop layout.
 *
 * It generates dynamic media query strings for JavaScript-based media query
 * handling, compatible with libraries like `enquire.js`.
 *
 * Prerequisites:
 *  - A `<meta name="viewport" content="width=device-width, initial-scale=1" />` tag.
 *  - Desktop stylesheet `<link>` with `class="rwdretrofit-desktop"` and `media` attribute.
 *  - Mobile stylesheet `<link>` with `class="rwdretrofit-mobile"` and `media` attribute.
 *  - Optional `data-breakpoint-width`, `data-viewport-width`, and `data-debug`
 *    attributes can be added to the desktop stylesheet link for fine-grained control.
 */

// Start of the Immediately Invoked Function Expression (IIFE) for encapsulation.
; var rwdRetrofit = ( function ( ) {

  // --- Initial Environment Checks ---
  // Verify essential browser APIs are available for script execution.
  if ( ! document.querySelector || ! document.getElementsByClassName || typeof ( document.documentElement.clientWidth ) == 'undefined' ) {
    return ; // Exit early if required DOM manipulation or measurement capabilities are absent.
  }

  // --- DOM Element Retrieval ---
  // Locate the primary viewport meta tag.
  var meta = document.querySelector( 'meta[name="viewport"]' )
    // Find all stylesheet links designated for desktop.
    , desktop = document.getElementsByClassName( 'rwdretrofit-desktop' )
    // Find all stylesheet links designated for mobile.
    , mobile = document.getElementsByClassName( 'rwdretrofit-mobile' )
    ;

  // If any critical DOM elements are missing, the module cannot proceed.
  if ( ! meta || desktop.length === 0 || mobile.length === 0 ) {
    return ; // Terminate execution if essential elements are not found.
  }

  // --- Variable Declarations and Initializations ---
  // Define various flags, constants, and initial values used throughout the module.
  var supportsTouch = 'ontouchstart' in window                                   // Boolean: true if touch events are supported.
    , content = 'content'                                                       // String constant for the 'content' attribute name.
    , media = 'media'                                                           // String constant for the 'media' attribute name.
    , initialContent = meta && meta.getAttribute( content )                     // Stores the original content of the viewport meta tag.
    , desktopContent = 'width=980'                                              // Default viewport content for desktop mode.
    , duration = 250                                                            // Integer: Milliseconds for viewport transition delay.
    , supportsOrientationChange = 'onorientationchange' in window               // Boolean: true if the 'onorientationchange' event is supported.
    , orientationEvent = supportsOrientationChange ? 'orientationchange' : 'resize' // Determines the appropriate event to listen for.
    , desktopMQ = desktop[ 0 ].getAttribute( media )                            // Retrieves the media query string from the first desktop link.
    , mobileMQ = mobile[ 0 ].getAttribute( media )                              // Retrieves the media query string from the first mobile link.
    , dataBreakpointWidth = desktop[ 0 ].getAttribute( 'data-breakpoint-width' ) // Optional: Custom breakpoint width from data attribute.
    , breakpointWidth                                                           // Variable: Will hold the calculated or provided breakpoint width.
    , dataViewportWidth = desktop[ 0 ].getAttribute( 'data-viewport-width' )    // Optional: Custom viewport width from data attribute.
    , dataDebug = desktop[ 0 ].getAttribute( 'data-debug' )                     // Optional: Debug flag to force touch-like behavior.
    , mediaQueries = { }                                                        // Object: To store the final desktop and mobile media query strings.
    ;

  // --- Breakpoint and Viewport Calculation Logic ---
  // This block determines the effective breakpoint and viewport content.
  if ( supportsTouch || dataDebug === 'true' ) {
    // If a custom breakpoint width is explicitly provided via a data attribute, use it.
    if ( dataBreakpointWidth ) {
      breakpointWidth = dataBreakpointWidth ;
    }
    // Otherwise, extract the breakpoint width from the existing desktop media query.
    else {
      breakpointWidth = desktopMQ.replace( /.*?min-width:\s?(\d*).*/g, '$1' ) ;
    }

    // Adjust the `desktopContent` if a custom `dataViewportWidth` is provided
    // and it's greater than or equal to the determined `breakpointWidth`.
    if ( dataViewportWidth && parseInt( dataViewportWidth ) >= parseInt( breakpointWidth ) ) {
      desktopContent = desktopContent.replace( /\d+/, dataViewportWidth ) ;
    }
    // If no custom `dataViewportWidth`, or if it's smaller,
    // ensure `desktopContent` reflects the `breakpointWidth` if it's larger than the default 980.
    else {
      if ( breakpointWidth > 980 ) {
        desktopContent = desktopContent.replace( /\d+/, breakpointWidth ) ;
      }
    }
  }
  // For non-touch devices without debug mode, simply extract the breakpoint
  // from the desktop media query as the primary reference.
  else {
    breakpointWidth = desktopMQ.replace( /.*?min-width:\s?(\d*).*/g, '$1' ) ;
  }

  // --- Media Query String Updates ---
  // Modify the desktop and mobile media query strings based on the calculated `breakpointWidth`.
  desktopMQ = desktopMQ.replace( /(min-width:\s?)\d*/g, '$1' + breakpointWidth ) ;
  mobileMQ = mobileMQ.replace( /(max-width:\s?)\d*/g, '$1' + ( breakpointWidth - 1 ) ) ;

  // Store the final, adjusted media query strings in the `mediaQueries` object.
  mediaQueries.desktop = desktopMQ ;
  mediaQueries.mobile = mobileMQ ;

  // --- Dynamic Stylesheet Media Attribute Update ---
  // If touch is supported or debug mode is active, update the `media` attribute
  // of the stylesheet links in the DOM to reflect the new breakpoint.
  if ( supportsTouch || dataDebug === 'true' ) {
    // Iterate over all desktop stylesheet links.
    for ( var i = 0 ; i < desktop.length ; i ++ ) {
      desktop[ i ].setAttribute( media, desktopMQ ) ;
    }

    // Iterate over all mobile stylesheet links.
    for ( var j = 0 ; j < mobile.length ; j ++ ) {
      mobile[ j ].setAttribute( media, mobileMQ ) ;
    }
  }

  // --- Touch Device Viewport Switching Logic ---
  // Implement dynamic viewport meta tag adjustments specifically for touch-enabled devices.
  if ( supportsTouch ) {
    // Defines the function responsible for switching the viewport meta content.
    function switchViewport ( ) {
      // Temporarily set the viewport to its initial content to allow browser reflow.
      meta.setAttribute( content, initialContent ) ;
      // After a short delay, check the current client width and apply desktop content if appropriate.
      window.setTimeout( function ( ) {
        if ( document.documentElement.clientWidth >= breakpointWidth ) {
          meta.setAttribute( content, desktopContent ) ;
        }
      }, duration ) ;
    }

    // Immediately execute the viewport switch upon script load for touch devices.
    switchViewport ( ) ;
    // Attach an event listener to re-evaluate the viewport on orientation change or resize.
    window.addEventListener( orientationEvent, switchViewport, false ) ;
  }

  // --- Module Output ---
  // Return the `mediaQueries` object, making the calculated media query strings accessible.
  return mediaQueries ;

} ) ( ) ; // Close the IIFE.