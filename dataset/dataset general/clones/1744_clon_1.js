/*
 * impress.js
 *
 * This is the impress.js library, a presentation tool that leverages
 * CSS3 transforms and transitions in modern web browsers.
 * It's inspired by the innovative presentation style of prezi.com.
 *
 * (c) Copyright 2011-2012 Bartek Szopka (@bartaz)
 *
 * Distributed under the terms of the MIT and GPL Licenses.
 *
 * -----------------------------------------------------------------------------
 *  Author:    Bartek Szopka
 *  Version:   0.5.3
 *  Web:       http://bartaz.github.com/impress.js/
 *  Source:    http://github.com/bartaz/impress.js/
 * -----------------------------------------------------------------------------
 */

/* jshint bitwise: true, curly: true, eqeqeq: true, forin: true, latedef: true, newcap: true,
           noarg: true, noempty: true, undef: true, strict: true, browser: true */

// Welcome, fellow developer!
// If you're curious about the inner workings, let me guide you through
// the core mechanisms that drive impress.js.

( function ( document, window ) {
    'use strict';
    
    // --- HELPER FUNCTIONS ---
    
    // The `pfx` function is designed to take a standard CSS property name
    // and return its browser-prefixed version, if one exists for the current browser.
    // This implementation draws heavily from the excellent Modernizr library (http://www.modernizr.com/).
    var pfx = ( function () {
        
        // We create a dummy element to test style properties.
        var style = document.createElement( 'dummy' ).style;
        
        // A list of common browser prefixes.
        var prefixes = 'Webkit Moz O ms Khtml'.split( ' ' );
        
        // A simple memoization cache to store results and avoid redundant computations.
        var memory = {};
        
        return function ( prop ) {
            // Check if the property's prefixed version has already been determined.
            if ( typeof memory[ prop ] === "undefined" ) {
                
                // Capitalize the first letter of the property for prefixing.
                var ucProp = prop.charAt( 0 ).toUpperCase() + prop.substr( 1 );
                
                // Combine the original property with its prefixed versions.
                var props = ( prop + ' ' + prefixes.join( ucProp + ' ' ) + ucProp ).split( ' ' );
                
                // Initialize the memory entry to null.
                memory[ prop ] = null;
                
                // Iterate through the possible property names to find a supported one.
                for ( var i in props ) {
                    if ( style[ props[ i ] ] !== undefined ) {
                        memory[ prop ] = props[ i ]; // Found it! Store and break.
                        break;
                    }
                }
            
            }
            
            return memory[ prop ]; // Return the cached (or newly found) prefixed property.
        };
    
    } )();
    
    // The `arrayify` function converts an array-like object (e.g., NodeList)
    // into a true JavaScript Array, enabling the use of `Array.prototype` methods.
    var arrayify = function ( a ) {
        return [].slice.call( a );
    };
    
    // The `css` function applies a set of CSS styles defined in `props` to the `el` element.
    // It automatically processes property names through `pfx` to ensure browser compatibility.
    var css = function ( el, props ) {
        var key, pkey;
        for ( key in props ) {
            if ( props.hasOwnProperty( key ) ) { // Ensure we're only dealing with own properties.
                pkey = pfx( key );              // Get the prefixed property name.
                if ( pkey !== null ) {
                    el.style[ pkey ] = props[ key ]; // Apply the style.
                }
            }
        }
        return el; // Return the modified element.
    };
    
    // The `toNumber` function attempts to convert a `numeric` value into a number.
    // If conversion fails (result is NaN), it returns `fallback` (or 0 if `fallback` is not provided).
    var toNumber = function ( numeric, fallback ) {
        return isNaN( numeric ) ? ( fallback || 0 ) : Number( numeric );
    };
    
    // The `byId` function is a straightforward wrapper for `document.getElementById`.
    // As the name suggests, it retrieves an element by its ID.
    var byId = function ( id ) {
        return document.getElementById( id );
    };
    
    // The `$` function returns the first element matching the given CSS `selector`.
    // It can search within a specified `context` element or the entire `document` by default.
    var $ = function ( selector, context ) {
        context = context || document; // Default context is the document.
        return context.querySelector( selector );
    };
    
    // The `$$` function returns an array of elements matching the CSS `selector`.
    // Similar to `$`, it operates within a `context` or the `document` by default.
    var $$ = function ( selector, context ) {
        context = context || document; // Default context is the document.
        return arrayify( context.querySelectorAll( selector ) ); // Convert NodeList to Array.
    };
    
    // The `triggerEvent` function creates and dispatches a custom DOM event.
    // It takes an `el`ement, an `eventName`, and optional `detail` data.
    var triggerEvent = function ( el, eventName, detail ) {
        var event = document.createEvent( "CustomEvent" );
        event.initCustomEvent( eventName, true, true, detail ); // Bubbles, cancelable, detail data.
        el.dispatchEvent( event ); // Dispatch the event on the specified element.
    };
    
    // The `translate` function generates a CSS `translate3d` transform string.
    var translate = function ( t ) {
        return " translate3d(" + t.x + "px," + t.y + "px," + t.z + "px) ";
    };
    
    // The `rotate` function constructs a CSS rotate transform string.
    // Rotations are applied in X, Y, Z order by default.
    // Setting `revert` to `true` reverses the order to Z, Y, X.
    var rotate = function ( r, revert ) {
        var rX = " rotateX(" + r.x + "deg) ",
            rY = " rotateY(" + r.y + "deg) ",
            rZ = " rotateZ(" + r.z + "deg) ";
        
        return revert ? rZ + rY + rX : rX + rY + rZ;
    };
    
    // The `scale` function creates a CSS `scale` transform string.
    var scale = function ( s ) {
        return " scale(" + s + ") ";
    };
    
    // The `perspective` function generates a CSS `perspective` transform string.
    var perspective = function ( p ) {
        return " perspective(" + p + "px) ";
    };
    
    // The `getElementFromHash` function retrieves an element using its ID
    // extracted from the hash part of the window's URL.
    // It handles both `#slide-id` and `#/slide-id` formats.
    var getElementFromHash = function () {
        // Remove `#` or `#/` from the beginning of the hash.
        return byId( window.location.hash.replace( /^#\/?/, "" ) );
    };
    
    // The `computeWindowScale` function calculates the scaling factor
    // required to fit the presentation within the current window size,
    // based on the dimensions specified in the `config`.
    var computeWindowScale = function ( config ) {
        var hScale = window.innerHeight / config.height,
            wScale = window.innerWidth / config.width,
            scale = hScale > wScale ? wScale : hScale; // Use the smaller scale to fit.
        
        // Apply maximum scale constraint if defined.
        if ( config.maxScale && scale > config.maxScale ) {
            scale = config.maxScale;
        }
        
        // Apply minimum scale constraint if defined.
        if ( config.minScale && scale < config.minScale ) {
            scale = config.minScale;
        }
        
        return scale;
    };
    
    // --- BROWSER SUPPORT CHECK ---
    var body = document.body;
    
    var ua = navigator.userAgent.toLowerCase();
    
    // impress.js requires:
    // 1. CSS 3D transforms support.
    // 2. `classList` API.
    // 3. `dataset` API.
    // 4. Excludes specific mobile devices (iPhone, iPod, Android) due to
    //    insufficient 3D support or hardware performance.
    var impressSupported = 
                          ( pfx( "perspective" ) !== null ) && // Check for 3D transforms.
                           
                          ( body.classList ) &&                // Check for classList API.
                           ( body.dataset ) &&                  // Check for dataset API.
                           
                          ( ua.search( /(iphone)|(ipod)|(android)/ ) === -1 ); // Blacklist mobile.
    
    // Adjust body classes based on impress.js support.
    if ( !impressSupported ) {
        // If not supported, add "impress-not-supported".
        // Note: `classList` might not be supported, so use `+=`.
        body.className += " impress-not-supported ";
    } else {
        // If supported, remove "impress-not-supported" and add "impress-supported".
        body.classList.remove( "impress-not-supported" );
        body.classList.add( "impress-supported" );
    }
    
    // --- GLOBALS AND DEFAULTS ---
    
    // `roots` will hold references to all impress.js instances on the page.
    // This design allows for multiple independent presentations, though its practical
    // utility might be limited in typical scenarios.
    var roots = {};
    
    // Default configuration values for impress.js presentations.
    var defaults = {
        width: 1024,
        height: 768,
        maxScale: 1,
        minScale: 0,
        
        perspective: 1000,
        
        transitionDuration: 1000
    };
    
    // A simple, empty function used as a placeholder for unsupported API calls.
    var empty = function () { return false; };
    
    // --- IMPRESS.JS API ---
    
    // This is the main `impress` function. It initializes and returns the
    // impress.js API for a presentation identified by `rootId` (defaults to 'impress').
    var impress = window.impress = function ( rootId ) {
        
        // If impress.js is not supported by the browser, return a dummy API.
        // This prevents errors by avoiding calls to unsupported features.
        if ( !impressSupported ) {
            return {
                init: empty,
                goto: empty,
                prev: empty,
                next: empty
            };
        }
        
        rootId = rootId || "impress"; // Use "impress" as the default root ID.
        
        // If an instance for this `rootId` already exists, return its API.
        if ( roots[ "impress-root-" + rootId ] ) {
            return roots[ "impress-root-" + rootId ];
        }
        
        // Internal state variables for the presentation.
        var stepsData = {};         // Stores parsed data for each step.
        var activeStep = null;      // The currently active step element.
        var currentState = null;    // The current transformation state of the presentation.
        var steps = null;           // An array of all step elements.
        var config = null;          // The presentation's configuration options.
        var windowScale = null;     // The computed scale factor based on window size.
        
        // DOM elements for the presentation.
        var root = byId( rootId );              // The main container element.
        var canvas = document.createElement( "div" ); // The canvas element that holds steps.
        
        var initialized = false;    // Flag to track if the presentation has been initialized.
        
        // --- STEP EVENTS ---
        // impress.js dispatches two custom events related to step transitions:
        // `impress:stepenter`: Fired when a step becomes fully visible (transition ends).
        // `impress:stepleave`: Fired when a step begins to transition away.
        
        var lastEntered = null; // Stores the last step that was entered.
        
        // `onStepEnter` is triggered whenever a step is entered.
        // The `impress:stepenter` event is dispatched only if the `step` is
        // different from the `lastEntered` step, preventing redundant events.
        var onStepEnter = function ( step ) {
            if ( lastEntered !== step ) {
                triggerEvent( step, "impress:stepenter" );
                lastEntered = step;
            }
        };
        
        // `onStepLeave` is triggered when a step is exited.
        // The `impress:stepleave` event is dispatched only if the `step` being left
        // is the same as the `lastEntered` step, ensuring correct event sequencing.
        var onStepLeave = function ( step ) {
            if ( lastEntered === step ) {
                triggerEvent( step, "impress:stepleave" );
                lastEntered = null;
            }
        };
        
        // `initStep` processes a step element, extracting data from its `data-*` attributes
        // and applying initial CSS transformations to position it in 3D space.
        var initStep = function ( el, idx ) {
            var data = el.dataset, // Get all data attributes.
                step = {
                    translate: {
                        x: toNumber( data.x ),
                        y: toNumber( data.y ),
                        z: toNumber( data.z )
                    },
                    rotate: {
                        x: toNumber( data.rotateX ),
                        y: toNumber( data.rotateY ),
                        z: toNumber( data.rotateZ || data.rotate ) // `data-rotate` is a shorthand for `data-rotate-z`.
                    },
                    scale: toNumber( data.scale, 1 ), // Default scale is 1.
                    el: el // Store a reference to the element itself.
                };
            
            // Assign a default ID if the element doesn't have one.
            if ( !el.id ) {
                el.id = "step-" + ( idx + 1 );
            }
            
            // Store the processed step data.
            stepsData[ "impress-" + el.id ] = step;
            
            // Apply initial CSS styles for 3D positioning.
            css( el, {
                position: "absolute",
                transform: "translate(-50%,-50%)" + // Center the element.
                           translate( step.translate ) +
                           rotate( step.rotate ) +
                           scale( step.scale ),
                transformStyle: "preserve-3d" // Enable 3D children.
            } );
        };
        
        // `newStep` is a utility function to initialize and add a new step element.
        var newStep = function ( el ) {
            initStep( el );    // Initialize the step's data and styles.
            steps.push( el ); // Add the new step to the array of steps.
        };
        
        // The `init` API function is responsible for setting up the entire presentation.
        // It should only be called once per impress.js instance.
        var init = function () {
            if ( initialized ) { return; } // Prevent re-initialization.
            
            // Configure the viewport for mobile devices.
            // This is crucial for proper scaling and avoids issues on devices like iPad.
            var meta = $( "meta[name='viewport']" ) || document.createElement( "meta" );
            meta.content = "width=device-width, minimum-scale=1, maximum-scale=1, user-scalable=no";
            if ( meta.parentNode !== document.head ) {
                meta.name = 'viewport';
                document.head.appendChild( meta );
            }
            
            // Initialize the configuration object by merging defaults with root element's data attributes.
            var rootData = root.dataset;
            config = {
                width: toNumber( rootData.width, defaults.width ),
                height: toNumber( rootData.height, defaults.height ),
                maxScale: toNumber( rootData.maxScale, defaults.maxScale ),
                minScale: toNumber( rootData.minScale, defaults.minScale ),                
                perspective: toNumber( rootData.perspective, defaults.perspective ),
                transitionDuration: toNumber( rootData.transitionDuration, defaults.transitionDuration )
            };
            
            // Compute the initial window scaling factor.
            windowScale = computeWindowScale( config );
            
            // Wrap all step elements within a "canvas" div.
            // This canvas is then appended to the root element.
            arrayify( root.childNodes ).forEach( function ( el ) {
                canvas.appendChild( el );
            } );
            root.appendChild( canvas );
            
            // Set essential document and body styles.
            document.documentElement.style.height = "100%";
            
            css( body, {
                height: "100%",
                overflow: "hidden" // Prevent scrolling.
            } );
            
            // Define common styles for the root and canvas elements.
            var rootStyles = {
                position: "absolute",
                transformOrigin: "top left",
                transition: "all 0s ease-in-out", // Initial transition duration is 0.
                transformStyle: "preserve-3d"
            };
            
            // Apply styles to the root element.
            css( root, rootStyles );
            css( root, {
                top: "50%",
                left: "50%",
                // Apply perspective and initial window scaling.
                transform: perspective( config.perspective / windowScale ) + scale( windowScale )
            } );
            
            // Apply styles to the canvas element.
            css( canvas, rootStyles );
            
            // Update body classes to reflect impress.js being enabled.
            body.classList.remove( "impress-disabled" );
            body.classList.add( "impress-enabled" );
            
            // Get all step elements and initialize them.
            steps = $$( ".step", root );
            steps.forEach( initStep );
            
            // Set the initial state of the canvas.
            currentState = {
                translate: { x: 0, y: 0, z: 0 },
                rotate:    { x: 0, y: 0, z: 0 },
                scale:     1
            };
            
            initialized = true; // Mark as initialized.
            
            // Trigger an event indicating impress.js has initialized.
            triggerEvent( root, "impress:init", { api: roots[ "impress-root-" + rootId ] } );
        };
        
        // `getStep` is a helper to retrieve a step element.
        // It accepts an index (number), an ID (string), or a DOM element itself.
        var getStep = function ( step ) {
            if ( typeof step === "number" ) {
                // If a number, treat as an index (negative indices count from end).
                step = step < 0 ? steps[ steps.length + step ] : steps[ step ];
            } else if ( typeof step === "string" ) {
                // If a string, treat as an ID.
                step = byId( step );
            }
            // Return the element if it's a valid step and has data, otherwise null.
            return ( step && step.id && stepsData[ "impress-" + step.id ] ) ? step : null;
        };
        
        // Used to clear timeouts for `impress:stepenter` event debounce.
        var stepEnterTimeout = null;
        
        // naugtur:
        // `setTransformationCallback` API function - allows an external tool to receive
        // the current transformation data (scale, rotate, translate) of the active step.
        var transformationCallback = null;
        var setTransformationCallback = function ( callback ) {
            transformationCallback = callback;
        };
        
        // The `goto` API function navigates the presentation to a specified step.
        // `el` can be a step index, ID, or DOM element. `duration` is an optional transition time.
        var goto = function ( el, duration ) {
            
            // If not initialized or `el` is not a valid step, abort.
            if ( !initialized || !( el = getStep( el ) ) ) {
                return false;
            }
            
            // Workaround for browser scrolling behavior:
            // Browsers might scroll the page to make a focused element visible,
            // even with `overflow: hidden` on the body. This resets the scroll position.
            // A more robust solution might be needed for accessibility.
            window.scrollTo( 0, 0 );
            
            var step = stepsData[ "impress-" + el.id ]; // Get the data for the target step.
            
            // Update classes for the previously active and newly active steps.
            if ( activeStep ) {
                activeStep.classList.remove( "active" );
                body.classList.remove( "impress-on-" + activeStep.id );
            }
            el.classList.add( "active" );
            
            body.classList.add( "impress-on-" + el.id );
            
            // Compute the target transformation state for the canvas.
            // This is the inverse of the step's own transformation.
            var target = {
                rotate: {
                    x: -step.rotate.x,
                    y: -step.rotate.y,
                    z: -step.rotate.z
                },
                translate: {
                    x: -step.translate.x,
                    y: -step.translate.y,
                    z: -step.translate.z
                },
                scale: 1 / step.scale // Inverse scale.
            };
            
            // naugtur:
            // If a transformation callback is registered, invoke it with the step's data.
            if ( transformationCallback ) { 
                transformationCallback( {
                  scale: step.scale,
                  rotate: step.rotate,
                  translate: step.translate
                } );
            }
            
            // Determine if the transition is a "zooming in" effect.
            // This influences the order of CSS transitions (scale vs. move/rotate).
            // Zooming in: scale is delayed. Zooming out: move/rotate are delayed.
            var zoomin = target.scale >= currentState.scale;
            
            duration = toNumber( duration, config.transitionDuration ); // Use default duration if not specified.
            var delay = ( duration / 2 ); // Half the duration for delayed transitions.
            
            // If the same step is re-selected, it's likely due to a window resize.
            // In this case, force a re-computation of the window scale.
            if ( el === activeStep ) {