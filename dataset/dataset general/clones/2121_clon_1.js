/* impress.js - A presentation tool utilizing CSS3 transformations
 *
 * Inspired by prezi.com, leveraging modern browser capabilities.
 *
 * (C) 2011-2012 Bartek Szopka (@bartaz)
 * License: MIT & GPL
 *
 * Project Home: http://bartaz.github.com/impress.js/
 * Source Code : http://github.com/bartaz/impress.js/
 * Version     : 0.5.3
 * Author      : Bartek Szopka
 */

// JSHint configuration:
// bitwise, curly, eqeqeq, forin, latedef, newcap, noarg, noempty, undef, strict, browser
// Ever wondered how impress.js works under the hood?
// Let's dive into its internal mechanisms and helper functions.
( function ( document, window ) {
  "use strict"; // Enforce strict mode for cleaner code.

  // --- Helper Functions ---

  // pfx: Determines the correct CSS vendor prefix for a given property.
  // Heavily influenced by Modernizr's approach.
  var pfx = ( function () {

    var style = document.createElement( 'dummy' ).style; // Temporary element for style checking
    var prefixes = 'Webkit Moz O ms Khtml'.split( ' ' ); // Common prefixes
    var memory = {}; // Cache for prefixed properties

    return function ( prop ) {
      if ( typeof memory[ prop ] === "undefined" ) {

        var ucProp = prop.charAt(0).toUpperCase() + prop.substr(1); // Uppercase first letter
        var props = ( prop + ' ' + prefixes.join( ucProp + ' ' ) + ucProp ).split( ' ' ); // All possible variations

        memory[ prop ] = null; // Initialize cache entry
        for ( var i in props ) { // Iterate through variations
          if ( style[ props[i] ] !== undefined ) { // Check if property exists
            memory[ prop ] = props[i]; // Store the valid prefixed property
            break; // Found it, no need to continue
          }
        }
      }

      return memory[ prop ]; // Return the cached (or newly found) prefixed property
    };

  } )(); // End of pfx IIFE

  // arrayify: Converts an array-like object (e.g., NodeList) into a true Array.
  // This allows access to Array.prototype methods.
  var arrayify = function ( a ) {
    return [].slice.call( a );
  };

  // css: Applies CSS properties to a DOM element.
  // Ensures proper vendor prefixes are used via `pfx` function.
  var css = function ( el, props ) {
    var key, pkey; // Declare variables for property keys.
    for ( key in props ) { // Loop through properties in the 'props' object.
      if ( props.hasOwnProperty( key ) ) { // Ensure it's an own property, not inherited.
        pkey = pfx( key ); // Get the prefixed version of the property name.
        if ( pkey !== null ) { // If a valid prefixed property was found...
          el.style[ pkey ] = props[ key ]; // Apply the style to the element.
        }
      }
    }
    return el; // Return the element for chaining.
  };

  // toNumber: Converts a value to a number.
  // If conversion fails, returns a fallback value (defaulting to 0).
  var toNumber = function ( numeric, fallback ) {
    return isNaN( numeric ) ? ( fallback || 0 ) : Number( numeric );
  };

  // byId: A simple wrapper for document.getElementById.
  var byId = function ( id ) {
    return document.getElementById( id );
  };

  // $: Returns the first element matching the CSS selector.
  // Context can be provided; defaults to `document`.
  var $ = function ( selector, context ) {
    context = context || document; // If no context, use the document.
    return context.querySelector( selector );
  };

  // $$: Returns an array of elements matching the CSS selector.
  // Context can be provided; defaults to `document`.
  var $$ = function ( selector, context ) {
    context = context || document; // Default context is the whole document.
    return arrayify( context.querySelectorAll( selector ) ); // Convert NodeList to Array.
  };

  // triggerEvent: Dispatches a custom DOM event on a specified element.
  var triggerEvent = function ( el, eventName, detail ) {
    var event = document.createEvent( "CustomEvent" ); // Create a new custom event.
    event.initCustomEvent( eventName, true, true, detail ); // Initialize it.
    el.dispatchEvent( event ); // Dispatch the event on the target element.
  };

  // translate: Generates a CSS 3D translate transform string.
  var translate = function ( t ) {
    return " translate3d(" + t.x + "px, " + t.y + "px, " + t.z + "px) ";
  };

  // rotate: Creates a CSS 3D rotate transform string.
  // Rotation order is X, Y, Z by default, but can be reversed.
  var rotate = function ( r, revert ) {
    var rX = " rotateX(" + r.x + "deg) "; // X-axis rotation.
    var rY = " rotateY(" + r.y + "deg) "; // Y-axis rotation.
    var rZ = " rotateZ(" + r.z + "deg) "; // Z-axis rotation.

    return revert ? rZ + rY + rX : rX + rY + rZ; // Apply rotations in specified order.
  };

  // scale: Constructs a CSS scale transform string.
  var scale = function ( s ) {
    return " scale(" + s + ") ";
  };

  // perspective: Generates a CSS perspective transform string.
  var perspective = function ( p ) {
    return " perspective(" + p + "px) ";
  };

  // getElementFromHash: Retrieves a DOM element by its ID, extracted from the URL hash.
  var getElementFromHash = function () {
    // Extracts the ID by removing leading '#' or '#/' from the window location hash.
    // This supports both traditional `#id` and modern `#/id` formats.
    return byId( window.location.hash.replace( /^#\/?/, "" ) );
  };

  // computeWindowScale: Calculates the scaling factor for the presentation
  // based on the browser window size and configured presentation dimensions.
  var computeWindowScale = function ( config ) {
    var hScale = window.innerHeight / config.height; // Vertical scale.
    var wScale = window.innerWidth / config.width; // Horizontal scale.
    var scale = hScale > wScale ? wScale : hScale; // Use the smaller scale to fit content.

    // Apply maximum scale constraint if defined.
    if ( config.maxScale && scale > config.maxScale ) {
      scale = config.maxScale;
    }

    // Apply minimum scale constraint if defined.
    if ( config.minScale && scale < config.minScale ) {
      scale = config.minScale;
    }

    return scale; // The final computed scale factor.
  };

  // --- Feature Support Detection ---
  var body = document.body; // Reference to the document body.

  var ua = navigator.userAgent.toLowerCase(); // User agent string for device detection.
  var impressSupported =
    // Check for CSS 3D transforms support (via pfx function).
    ( pfx( "perspective" ) !== null ) &&

    // Check for essential DOM APIs: classList and dataset.
    ( body.classList ) &&
    ( body.dataset ) &&

    // Blacklist specific mobile devices known to have insufficient 3D support.
    ( ua.search( /(iphone)|(ipod)|(android)/ ) === -1 );

  if ( !impressSupported ) {
    // If impress.js features are not supported, add a class to the body.
    // Note: classList might not be supported here, so use className.
    body.className += " impress-not-supported ";
  } else {
    // If supported, remove the 'not-supported' class and add 'supported'.
    body.classList.remove( "impress-not-supported" );
    body.classList.add( "impress-supported" );
  }

  // --- Global Variables and Configuration Defaults ---

  // Stores references to initialized impress.js instances, keyed by "impress-root-ID".
  // Multiple instances per page are theoretically possible.
  var roots = {};

  // Default configuration settings for impress.js presentations.
  var defaults = {
    width: 1024, // Default presentation width.
    height: 768, // Default presentation height.
    maxScale: 1, // Maximum scaling factor.
    minScale: 0, // Minimum scaling factor.

    perspective: 1000, // Default perspective for 3D transforms.

    transitionDuration: 1000 // Default transition duration in milliseconds.
  };

  // A simple, empty function used as a placeholder for unsupported API methods.
  var empty = function () { return false; }; // Returns false, does nothing.

  // --- IMPRESS.JS Core API ---

  // The main impress.js function. It initializes and returns the API
  // for a presentation associated with a specific root element ID.
  var impress = window.impress = function ( rootId ) { // Expose impress globally.

    // If browser features are not supported, return a fallback API.
    // This prevents errors and provides a graceful degradation.
    if ( !impressSupported ) {
      return {
        init: empty, // Dummy init function.
        goto: empty, // Dummy goto function.
        prev: empty, // Dummy prev function.
        next: empty  // Dummy next function.
      };
    }

    rootId = rootId || "impress"; // Default root ID is "impress".

    // If this impress instance is already initialized, return its existing API.
    if ( roots[ "impress-root-" + rootId ] ) {
      return roots[ "impress-root-" + rootId ];
    }

    // Internal state variables for the presentation.
    var stepsData = {};     // Stores data for all presentation steps.
    var activeStep = null;  // Reference to the currently active step element.
    var currentState = null; // Current transform state (position, rotation, scale).
    var steps = null;       // Array of all step DOM elements.
    var config = null;      // Merged configuration options.
    var windowScale = null; // Calculated scale factor for the window.

    // Core DOM elements for the presentation.
    var root = byId( rootId );              // The main container element.
    var canvas = document.createElement( "div" ); // A canvas element to wrap steps.

    var initialized = false; // Flag to track initialization status.

    // --- Step Event Handlers ---
    // impress.js dispatches two custom events for step transitions:
    // - `impress:stepenter`: Fired when a step becomes fully visible (transition finished).
    // - `impress:stepleave`: Fired when a step begins to transition out.

    var lastEntered = null; // Tracks the last step that was entered.

    // onStepEnter: Triggers 'impress:stepenter' event if the step is new.
    var onStepEnter = function ( step ) {
      if ( lastEntered !== step ) { // Only trigger if it's a different step.
        triggerEvent( step, "impress:stepenter" );
        lastEntered = step; // Update the last entered step.
      }
    };

    // onStepLeave: Triggers 'impress:stepleave' event if the step is currently active.
    var onStepLeave = function ( step ) {
      if ( lastEntered === step ) { // Only trigger if this was the last active step.
        triggerEvent( step, "impress:stepleave" );
        lastEntered = null; // Clear the last entered step.
      }
    };

    // initStep: Initializes a single step element.
    // Reads transform data from `data-*` attributes and applies initial CSS.
    var initStep = function ( el, idx ) {
      var data = el.dataset; // Dataset for custom data attributes.
      var step = { // Structure to hold step properties.
        translate: {
          x: toNumber( data.x ), // X translation.
          y: toNumber( data.y ), // Y translation.
          z: toNumber( data.z )  // Z translation.
        },
        rotate: {
          x: toNumber( data.rotateX ), // X rotation.
          y: toNumber( data.rotateY ), // Y rotation.
          z: toNumber( data.rotateZ || data.rotate ) // Z rotation (or general rotate).
        },
        scale: toNumber( data.scale, 1 ), // Scale factor (default to 1).
        el: el // Reference to the DOM element itself.
      };

      if ( !el.id ) { // If element has no ID, assign a generated one.
        el.id = "step-" + ( idx + 1 );
      }

      stepsData[ "impress-" + el.id ] = step; // Store step data in global object.

      // Apply initial CSS styles for step positioning and 3D transforms.
      css( el, {
        position: "absolute",
        transform: "translate(-50%,-50%)" + // Center the step.
          translate( step.translate ) +     // Apply translation.
          rotate( step.rotate ) +           // Apply rotation.
          scale( step.scale ),              // Apply scaling.
        transformStyle: "preserve-3d"       // Enable 3D context for children.
      } );
    };

    // init: The primary API function to initialize and start the presentation.
    var init = function () {
      if ( initialized ) { return; } // Prevent re-initialization.

      // Configure viewport meta tag for optimal mobile experience.
      var meta = $( "meta[name='viewport']" ) || document.createElement( "meta" );
      meta.content = "width=device-width, minimum-scale=1, maximum-scale=1, user-scalable=no";
      if ( meta.parentNode !== document.head ) {
        meta.name = 'viewport';
        document.head.appendChild( meta );
      }

      // Initialize configuration by merging defaults with root element's data attributes.
      var rootData = root.dataset;
      config = {
        width: toNumber( rootData.width, defaults.width ),
        height: toNumber( rootData.height, defaults.height ),
        maxScale: toNumber( rootData.maxScale, defaults.maxScale ),
        minScale: toNumber( rootData.minScale, defaults.minScale ),
        perspective: toNumber( rootData.perspective, defaults.perspective ),
        transitionDuration: toNumber( rootData.transitionDuration, defaults.transitionDuration )
      };

      windowScale = computeWindowScale( config ); // Calculate initial window scale.

      // Wrap all step elements within a new "canvas" div.
      arrayify( root.childNodes ).forEach( function ( el ) {
        canvas.appendChild( el ); // Move children to canvas.
      } );
      root.appendChild( canvas ); // Add canvas to the root.

      // Set essential initial styles for document and body.
      document.documentElement.style.height = "100%";
      css( body, {
        height: "100%",
        overflow: "hidden" // Prevent scrolling.
      } );

      // Define common styles for root and canvas elements.
      var rootStyles = {
        position: "absolute",
        transformOrigin: "top left",
        transition: "all 0s ease-in-out", // No initial transition.
        transformStyle: "preserve-3d"
      };

      // Apply styles to the root element.
      css( root, rootStyles );
      css( root, {
        top: "50%",
        left: "50%",
        transform: perspective( config.perspective / windowScale ) + scale( windowScale )
      } );

      // Apply styles to the canvas element.
      css( canvas, rootStyles );

      // Update body classes to reflect impress.js enabled state.
      body.classList.remove( "impress-disabled" );
      body.classList.add( "impress-enabled" );

      // Discover and initialize all step elements within the root.
      steps = $$( ".step", root );
      steps.forEach( initStep ); // Apply initStep to each found step.

      // Set the initial presentation state.
      currentState = {
        translate: { x: 0, y: 0, z: 0 },
        rotate: { x: 0, y: 0, z: 0 },
        scale: 1
      };

      initialized = true; // Mark impress.js as initialized.

      // Trigger a custom event indicating impress.js initialization is complete.
      triggerEvent( root, "impress:init", { api: roots[ "impress-root-" + rootId ] } );
    };

    // getStep: A utility function to retrieve a step element based on various inputs.
    // Accepts an index (number), an ID (string), or a direct DOM element.
    var getStep = function ( step ) {
      if ( typeof step === "number" ) {
        // If a number, treat as an index (allowing negative indices for end-relative access).
        step = step < 0 ? steps[ steps.length + step ] : steps[ step ];
      } else if ( typeof step === "string" ) {
        // If a string, treat as an element ID.
        step = byId( step );
      }
      // Return the step element if valid (has ID and exists in stepsData), otherwise null.
      return ( step && step.id && stepsData[ "impress-" + step.id ] ) ? step : null;
    };

    // Global variable to hold timeout ID for stepenter event debouncing.
    var stepEnterTimeout = null;

    // goto: Navigates the presentation to a specified step.
    // Takes a step element (or its ID/index) and an optional transition duration.
    var goto = function ( el, duration ) {

      if ( !initialized || !( el = getStep( el ) ) ) {
        // If impress.js isn't initialized or the target is not a valid step,
        // abort the navigation.
        return false;
      }

      // Workaround for browser scrolling issues:
      // Browsers may scroll to focused elements, disrupting impress.js positioning.
      // Reset scroll position to top-left to prevent this.
      window.scrollTo( 0, 0 );

      var step = stepsData[ "impress-" + el.id ]; // Get detailed data for the target step.

      if ( activeStep ) {
        activeStep.classList.remove( "active" ); // Deactivate previous step.
        body.classList.remove( "impress-on-" + activeStep.id ); // Remove body class for previous step.
      }
      el.classList.add( "active" ); // Activate the new step.

      body.classList.add( "impress-on-" + el.id ); // Add body class for the new step.

      // Calculate the target transformation state for the canvas.
      var target = {
        rotate: {
          x: -step.rotate.x, // Invert X rotation.
          y: -step.rotate.y, // Invert Y rotation.
          z: -step.rotate.z  // Invert Z rotation.
        },
        translate: {
          x: -step.translate.x, // Invert X translation.
          y: -step.translate.y, // Invert Y translation.
          z: -step.translate.z  // Invert Z translation.
        },
        scale: 1 / step.scale // Invert scale.
      };

      // Determine if the transition involves zooming in.
      // This influences the order of CSS transitions for visual effect.
      var zoomin = target.scale >= currentState.scale;

      duration = toNumber( duration, config.transitionDuration ); // Use configured or default duration.
      var delay = ( duration / 2 ); // Half the duration for transition delay.

      // If navigating to the same step, recompute window scale (e.g., after resize).
      if ( el === activeStep ) {
        windowScale = computeWindowScale( config );
      }

      var targetScale = target.scale * windowScale; // Final scale including window factor.

      // Trigger 'impress:stepleave' event for the previously active step, if applicable.
      if ( activeStep && activeStep !== el ) {
        onStepLeave( activeStep );
      }

      // Apply CSS transforms to `root` and `canvas` elements.
      // `root` handles scaling, `canvas` handles translation and rotation,
      // allowing for staggered transitions.
      css( root, {
        // Adjust perspective based on target scale to maintain visual consistency.
        transform: perspective( config.perspective / targetScale ) + scale( targetScale ),