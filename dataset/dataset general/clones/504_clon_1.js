/*
 * This is a Type I clone of the Modernizr library (Custom Build v2.6.2).
 * The original build details were:
 * Build: http://modernizr.com/download/#-fontface-backgroundsize-borderimage-borderradius-boxshadow-flexbox-hsla-multiplebgs-opacity-rgba-textshadow-cssanimations-csscolumns-generatedcontent-cssgradients-cssreflections-csstransforms-csstransforms3d-csstransitions-applicationcache-canvas-canvastext-draganddrop-hashchange-history-audio-video-indexeddb-input-inputtypes-localstorage-postmessage-sessionstorage-websockets-websqldatabase-webworkers-geolocation-inlinesvg-smil-svg-svgclippaths-touch-webgl-shiv-cssclasses-addtest-prefixed-teststyles-testprop-testallprops-hasevent-prefixes-domprefixes-css_vhunit-css_vwunit-load
 * License: MIT & BSD.
 *
 * This file contains only whitespace and comment changes from the original source.
 * All functional code, identifiers, and logic remain precisely as in the original.
 */
; /* Empty statement for consistency. */


window.Modernizr = (function( window, document, undefined ) {

        // Library version information.
        var version = '2.6.2'
        , Modernizr = {} // Main Modernizr object.
        , enableClasses = true // Flag to enable/disable adding classes to <html>.
        , docElement = document.documentElement // Reference to the document's root element.

        , mod = 'modernizr' // String constant for Modernizr.
        , modElem = document.createElement(mod) // A temporary DOM element for styling tests.
        , mStyle = modElem.style // Style property of the temporary element.

        , inputElem = document.createElement('input') // A temporary input element.

        , smile = ':)' // A simple string constant for content generation tests.

        , toString = {}.toString // Reference to Object.prototype.toString.

        , prefixes = ' -webkit- -moz- -o- -ms- '.split(' ') // CSS vendor prefixes.


        , omPrefixes = 'Webkit Moz O ms' // DOM-style vendor prefixes.
        , cssomPrefixes = omPrefixes.split(' ') // Array of CSSOM prefixes.
        , domPrefixes = omPrefixes.toLowerCase().split(' ') // Array of DOM prefixes.

        , ns = {'svg': 'http://www.w3.org/2000/svg'} // Namespace for SVG.

        , tests = {} // Object to store feature detection functions.
        , inputs = {} // Object to store input type tests.
        , attrs = {} // Object to store HTML attribute tests.

        , classes = [] // Array to collect detected feature classes.

        , slice = classes.slice // Reference to Array.prototype.slice.

        , featureName // Variable to hold the current feature name during processing.
        ; /* End of variable declarations block. */


    // Function to inject styles and elements into the DOM for testing.
    injectElementWithStyles = function( rule, callback, nodes, testnames ) {

        var style
            , ret
            , node
            , docOverflow
            , div = document.createElement('div') // Create a temporary div.
            , body = document.body || document.createElement('body') // Get or create a fake body.
        ; // End of local variable declarations.

        // If 'nodes' is an integer, create that many nested divs.
        if ( parseInt(nodes, 10) ) {
            while ( nodes-- ) {
                node = document.createElement('div');
                node.id = testnames ? testnames[nodes] : mod + (nodes + 1); // Assign IDs.
                div.appendChild(node);
            }
        }

        // Construct the style string.
        style = ['&#173;', '<style id="s', mod, '">', rule, '</style>'].join('');
        div.id = mod; // Set the div's ID to 'modernizr'.

        // Inject the style and div into the body (or fake body).
        (document.body ? div : body).innerHTML += style;
        body.appendChild(div);

        // If there's no real body, append the fake one to the document element.
        if ( !document.body ) {
            body.style.background = ''; // Clear background.
            body.style.overflow = 'hidden'; // Hide overflow.
            docOverflow = docElement.style.overflow; // Save original overflow.
            docElement.style.overflow = 'hidden'; // Hide document overflow.
            docElement.appendChild(body); // Append fake body.
        }

        // Execute the callback and store the result.
        ret = callback(div, rule);

        // Clean up the DOM.
        if ( !document.body ) {
            body.parentNode.removeChild(body); // Remove fake body.
            docElement.style.overflow = docOverflow; // Restore document overflow.
        } else {
            div.parentNode.removeChild(div); // Remove the test div.
        }

        // Return the boolean result.
        return !!ret;

    } /* End of injectElementWithStyles function. */

    , /* Separator for the next variable declaration. */


    isEventSupported = (function() {

        // Mapping of event names to default element types for testing.
        var TAGNAMES = {
            'select': 'input'
            , 'change': 'input'
            , 'submit': 'form'
            , 'reset': 'form'
            , 'error': 'img'
            , 'load': 'img'
            , 'abort': 'img'
        };

        // Inner function to check if an event is supported.
        function isEventSupported( eventName, element ) {

            // Use provided element or create one based on TAGNAMES mapping.
            element = element || document.createElement(TAGNAMES[eventName] || 'div');
            eventName = 'on' + eventName; // Prepend 'on' to event name.

            // Check if the event property exists directly on the element.
            var isSupported = eventName in element;

            // If not directly supported, try setting and checking attribute.
            if ( !isSupported ) {
                // If element doesn't have setAttribute, create a new div.
                if ( !element.setAttribute ) {
                    element = document.createElement('div');
                }
                // Check if setAttribute and removeAttribute are available.
                if ( element.setAttribute && element.removeAttribute ) {
                    element.setAttribute(eventName, ''); // Set empty attribute.
                    isSupported = is(element[eventName], 'function'); // Check if it becomes a function.

                    // Clean up if it was set.
                    if ( !is(element[eventName], 'undefined') ) {
                        element[eventName] = undefined;
                    }
                    element.removeAttribute(eventName); // Remove attribute.
                }
            }

            element = null; // Dereference element to prevent memory leaks.
            return isSupported; // Return the support status.
        }
        return isEventSupported; // Return the inner function.
    })() /* End of isEventSupported IIFE. */

    , /* Separator for the next variable declaration. */


    _hasOwnProperty = ({}).hasOwnProperty // Reference to Object.prototype.hasOwnProperty.
    , hasOwnProp // Variable to store the proper hasOwnProperty function.
    ; // End of local variable declarations.

    // Determine the most reliable hasOwnProperty method.
    if ( !is(_hasOwnProperty, 'undefined') && !is(_hasOwnProperty.call, 'undefined') ) {
        hasOwnProp = function (object, property) {
            return _hasOwnProperty.call(object, property); // Use call method if available.
        };
    }
    else {
        hasOwnProp = function (object, property) {
            // Fallback for older browsers or strict environments.
            return ((property in object) && is(object.constructor.prototype[property], 'undefined'));
        };
    }


    // Polyfill for Function.prototype.bind if it doesn't exist.
    if (!Function.prototype.bind) {
        Function.prototype.bind = function bind(that) {

            var target = this; // The function to be bound.

            // Ensure the target is a function.
            if (typeof target != "function") {
                throw new TypeError();
            }

            var args = slice.call(arguments, 1) // Arguments to prepend to the bound function's arguments.
                , bound = function () { // The new bound function.

                // If called with 'new', act as a constructor.
                if (this instanceof bound) {

                    var F = function(){}; // Intermediate constructor.
                    F.prototype = target.prototype; // Inherit prototype.
                    var self = new F(); // Create new instance.

                    // Apply the original function with combined arguments.
                    var result = target.apply(
                        self,
                        args.concat(slice.call(arguments)) // Combine arguments.
                    );

                    // If the result is an object, return it; otherwise, return the new instance.
                    if (Object(result) === result) {
                        return result;
                    }
                    return self;

                } else {

                    // If not called with 'new', simply apply.
                    return target.apply(
                        that, // The 'this' context.
                        args.concat(slice.call(arguments)) // Combined arguments.
                    );

                }

            }; // End of bound function definition.

            return bound; // Return the newly created bound function.
        }; // End of bind polyfill.
    }

    // Helper function to set CSS text on the temporary style element.
    function setCss( str ) {
        mStyle.cssText = str;
    }

    // Helper function to set CSS text with vendor prefixes.
    function setCssAll( str1, str2 ) {
        return setCss(prefixes.join(str1 + ';') + ( str2 || '' ));
    }

    // Helper function to check the type of an object.
    function is( obj, type ) {
        return typeof obj === type;
    }

    // Helper function to check if a string contains a substring.
    function contains( str, substr ) {
        return !!~('' + str).indexOf(substr); // Uses bitwise NOT to check for -1.
    }

    // Helper function to test for a CSS property.
    function testProps( props, prefixed ) {
        for ( var i in props ) {
            var prop = props[i];
            // Check if the property does not contain a hyphen and exists in mStyle.
            if ( !contains(prop, "-") && mStyle[prop] !== undefined ) {
                return prefixed == 'pfx' ? prop : true; // Return property name or true.
            }
        }
        return false; // Property not found.
    }

    // Helper function to test for a DOM property.
    function testDOMProps( props, obj, elem ) {
        for ( var i in props ) {
            var item = obj[props[i]]; // Get the property value.
            if ( item !== undefined) {

                // If elem is false, just return the property name.
                if (elem === false) return props[i];

                // If it's a function, return a bound version.
                if (is(item, 'function')){
                    return item.bind(elem || obj);
                }

                // Otherwise, return the item itself.
                return item;
            }
        }
        return false; // Property not found.
    }

    // Main helper function to test for CSS and DOM properties with prefixes.
    function testPropsAll( prop, prefixed, elem ) {

        var ucProp = prop.charAt(0).toUpperCase() + prop.slice(1) // Capitalize first letter.
            , props = (prop + ' ' + cssomPrefixes.join(ucProp + ' ') + ucProp).split(' ') // Generate CSS property names.
        ;

        // If 'prefixed' is a string or undefined, test CSS properties.
        if(is(prefixed, "string") || is(prefixed, "undefined")) {
            return testProps(props, prefixed);

        } else {
            // Otherwise, test DOM properties.
            props = (prop + ' ' + (domPrefixes).join(ucProp + ' ') + ucProp).split(' '); // Generate DOM property names.
            return testDOMProps(props, prefixed, elem);
        }
    }

    /* Feature detection tests start here. */

    // Test for Flexbox.
    tests['flexbox'] = function() {
        return testPropsAll('flexWrap');
    };

    // Test for Canvas.
    tests['canvas'] = function() {
        var elem = document.createElement('canvas'); // Create a canvas element.
        return !!(elem.getContext && elem.getContext('2d')); // Check for getContext method.
    };

    // Test for Canvas Text API.
    tests['canvastext'] = function() {
        // Requires canvas support and fillText method.
        return !!(Modernizr['canvas'] && is(document.createElement('canvas').getContext('2d').fillText, 'function'));
    };


    // Test for WebGL.
    tests['webgl'] = function() {
        return !!window.WebGLRenderingContext; // Check for WebGLRenderingContext object.
    };


    // Test for Touch events.
    tests['touch'] = function() {
        var bool; // Result boolean.

        // Check for 'ontouchstart' in window or DocumentTouch support.
        if(('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch) {
            bool = true;
        } else {
            // Fallback to media query test.
            injectElementWithStyles(['@media (', prefixes.join('touch-enabled),('), mod, ')', '{#modernizr{top:9px;position:absolute}}'].join(''), function( node ) {
                bool = node.offsetTop === 9;
            });
        }

        return bool;
    };


    // Test for Geolocation API.
    tests['geolocation'] = function() {
        return 'geolocation' in navigator; // Check for 'geolocation' property in navigator.
    };


    // Test for PostMessage API.
    tests['postmessage'] = function() {
        return !!window.postMessage; // Check for postMessage method in window.
    };


    // Test for Web SQL Database API.
    tests['websqldatabase'] = function() {
        return !!window.openDatabase; // Check for openDatabase method in window.
    };

    // Test for IndexedDB API.
    tests['indexedDB'] = function() {
        return !!testPropsAll("indexedDB", window); // Check for "indexedDB" property in window.
    };

    // Test for Hashchange event.
    tests['hashchange'] = function() {
        // Check event support and document mode for IE.
        return isEventSupported('hashchange', window) && (document.documentMode === undefined || document.documentMode > 7);
    };

    // Test for History API.
    tests['history'] = function() {
        return !!(window.history && history.pushState); // Check for history object and pushState method.
    };

    // Test for Drag and Drop API.
    tests['draganddrop'] = function() {
        var div = document.createElement('div'); // Create a temporary div.
        // Check for 'draggable' attribute or 'ondragstart' and 'ondrop' events.
        return ('draggable' in div) || ('ondragstart' in div && 'ondrop' in div);
    };

    // Test for WebSockets API.
    tests['websockets'] = function() {
        return 'WebSocket' in window || 'MozWebSocket' in window; // Check for WebSocket or MozWebSocket.
    };


    // Test for RGBA color support.
    tests['rgba'] = function() {
        setCss('background-color:rgba(150,255,150,.5)'); // Set a background color with RGBA.

        return contains(mStyle.backgroundColor, 'rgba'); // Check if 'rgba' is in the computed style.
    };

    // Test for HSLA color support.
    tests['hsla'] = function() {
        setCss('background-color:hsla(120,40%,100%,.5)'); // Set a background color with HSLA.

        // Check for 'rgba' or 'hsla' in the computed style.
        return contains(mStyle.backgroundColor, 'rgba') || contains(mStyle.backgroundColor, 'hsla');
    };

    // Test for Multiple Backgrounds support.
    tests['multiplebgs'] = function() {
        setCss('background:url(https://),url(https://),red url(https://)'); // Set multiple backgrounds.

        // Check if the background property contains at least three 'url(' instances.
        return (/(url\s*\(.*?){3}/).test(mStyle.background);
    };

    // Test for Background Size property.
    tests['backgroundsize'] = function() {
        return testPropsAll('backgroundSize'); // Test for 'backgroundSize'.
    };

    // Test for Border Image property.
    tests['borderimage'] = function() {
        return testPropsAll('borderImage'); // Test for 'borderImage'.
    };


    // Test for Border Radius property.
    tests['borderradius'] = function() {
        return testPropsAll('borderRadius'); // Test for 'borderRadius'.
    };

    // Test for Box Shadow property.
    tests['boxshadow'] = function() {
        return testPropsAll('boxShadow'); // Test for 'boxShadow'.
    };

    // Test for Text Shadow property.
    tests['textshadow'] = function() {
        return document.createElement('div').style.textShadow === ''; // Check if textShadow style property exists.
    };


    // Test for Opacity property.
    tests['opacity'] = function() {
        setCssAll('opacity:.55'); // Set opacity with prefixes.

        return (/^0.55$/).test(mStyle.opacity); // Check if the computed opacity is correct.
    };


    // Test for CSS Animations.
    tests['cssanimations'] = function() {
        return testPropsAll('animationName'); // Test for 'animationName'.
    };


    // Test for CSS Columns.
    tests['csscolumns'] = function() {
        return testPropsAll('columnCount'); // Test for 'columnCount'.
    };


    // Test for CSS Gradients.
    tests['cssgradients'] = function() {
        var str1 = 'background-image:' // Base string for background-image.
            , str2 = 'gradient(linear,left top,right bottom,from(#9f9),to(white));' // Old Webkit gradient.
            , str3 = 'linear-gradient(left top,#9f9, white);' // Standard linear gradient.
        ;

        // Apply various gradient syntaxes with prefixes.
        setCss(
            (str1 + '-webkit- '.split(' ').join(str2 + str1) +
                prefixes.join(str3 + str1)).slice(0, -str1.length)
        );

        return contains(mStyle.backgroundImage, 'gradient'); // Check if 'gradient' is in the computed background image.
    };


    // Test for CSS Reflections.
    tests['cssreflections'] = function() {
        return testPropsAll('boxReflect'); // Test for 'boxReflect'.
    };


    // Test for CSS Transforms.
    tests['csstransforms'] = function() {
        return !!testPropsAll('transform'); // Test for 'transform'.
    };


    // Test for CSS Transforms 3D.
    tests['csstransforms3d'] = function() {

        var ret = !!testPropsAll('perspective'); // Initial check for 'perspective'.

        // If perspective is supported, perform a media query test for 3D transforms.
        if ( ret && 'webkitPerspective' in docElement.style ) {

            injectElementWithStyles('@media (transform-3d),(-webkit-transform-3d){#modernizr{left:9px;position:absolute;height:3px;}}', function( node, rule ) {
                ret = node.offsetLeft === 9 && node.offsetHeight === 3; // Check element's position and height.
            });
        }
        return ret; // Return the final result.
    };


    // Test for CSS Transitions.
    tests['csstransitions'] = function() {
        return testPropsAll('transition'); // Test for 'transition'.
    };


    // Test for Font Face.
    tests['fontface'] = function() {
        var bool; // Result boolean.

        // Inject a font-face rule and check if it's applied correctly.
        injectElementWithStyles('@font-face {font-family:"font";src:url("https://")}', function( node, rule ) {
            var style = document.getElementById('smodernizr') // Get the style element.
                , sheet = style.sheet || style.styleSheet // Get the stylesheet object.
                , cssText = sheet ? (sheet.cssRules && sheet.cssRules[0] ? sheet.cssRules[0].cssText : sheet.cssText || '') : '' // Extract CSS text.
            ;

            bool = /src/i.test(cssText) && cssText.indexOf(rule.split(' ')[0]) === 0; // Check for 'src' and rule matching.
        });

        return bool; // Return the result.
    };

    // Test for Generated Content (CSS :before/:after).
    tests['generatedcontent'] = function() {
        var bool; // Result boolean.

        // Inject content using :after pseudo-element and check its height.
        injectElementWithStyles(['#', mod, '{font:0/0 a}#', mod, ':after{content:"', smile, '";visibility:hidden;font:3px/1 a}'].join(''), function( node ) {
            bool = node.offsetHeight >= 3; // Check if the generated content has height.
        });

        return bool; // Return the result.
    };

    // Test for Video element capabilities.
    tests['video'] = function() {
        var elem = document.createElement('video') // Create a video element.
            , bool = false // Initial result.
        ;

        try {
            if ( bool = !!elem.canPlayType ) { // Check if canPlayType exists.
                bool      = new Boolean(bool); // Convert to Boolean object.
                bool.ogg  = elem.canPlayType('video/ogg; codecs="theora"')      .replace(/^no$/,''); // Ogg support.

                bool.h264 = elem.canPlayType('video/mp4; codecs="avc1.42E01E"') .replace(/^no$/,''); // H.264 support.

                bool.webm = elem.canPlayType('video/webm; codecs="vp8, vorbis"').replace(/^no$/,''); // WebM support.
            }

        } catch(e) { /* Error handling. */ }

        return bool; // Return the result object.
    };

    // Test for Audio element capabilities.
    tests['audio'] = function() {
        var elem = document.createElement('audio') // Create an audio element.
            , bool = false // Initial result.
        ;

        try {
            if ( bool = !!elem.canPlayType ) { // Check if canPlayType exists.
                bool      = new Boolean(bool); // Convert to Boolean object.
                bool.ogg  = elem.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/,''); // Ogg support.
                bool.mp3  = elem.canPlayType('audio/mpeg;')               .replace(/^no$/,''); // MP3 support.

                bool.wav  = elem.canPlayType('audio/wav; codecs="1"')     .replace(/^no$/,''); // WAV support.
                bool.m4a  = ( elem.canPlayType('audio/x-m4a;')            ||
                              elem.canPlayType('audio/aac;'))             .replace(/^no$/,''); // M4A/AAC support.
            }
        } catch(e) { /* Error handling. */ }

        return bool; // Return the result object.
    };


    // Test for Local Storage.
    tests['localstorage'] = function() {
        try {
            localStorage.setItem(mod, mod); // Try setting an item.
            localStorage.removeItem(mod); // Try removing it.
            return true; // If successful, local storage is supported.
        } catch(e) {
            return false; // If an error occurs, it's not supported.
        }
    };

    // Test for Session Storage.
    tests['sessionstorage'] = function() {
        try {
            sessionStorage.setItem(mod, mod); // Try setting an item.
            sessionStorage.removeItem(mod); // Try removing it.
            return true; // If successful, session storage is supported.
        } catch(e) {
            return false; // If an error occurs, it's not supported.
        }
    };


    // Test for Web Workers.
    tests['webworkers'] = function() {
        return !!window.Worker; // Check for Worker object in window.
    };


    // Test for Application Cache.
    tests['applicationcache'] = function() {
        return !!window.applicationCache; // Check for applicationCache object in window.
    };

    /* End of feature detection tests. */

    // The rest of the Modernizr implementation would follow here,
    // including running tests, adding classes, and exposing the API.
    // For this Type I clone, we only process the provided snippet.

})( window, document, undefined ); // Immediately Invoked Function Expression (IIFE).