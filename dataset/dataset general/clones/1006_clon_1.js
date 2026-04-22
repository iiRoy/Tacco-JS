/*
 * This is a customized build of Modernizr, version 2.6.2.
 * (C) 2012 Modernizr and released under MIT & BSD licenses.
 *
 * It includes detection for the following features:
 * fontface, backgroundsize, borderimage, borderradius, boxshadow,
 * flexbox, hsla, multiplebgs, opacity, rgba, textshadow,
 * cssanimations, csscolumns, generatedcontent, cssgradients,
 * cssreflections, csstransforms, csstransforms3d, csstransitions,
 * applicationcache, canvas, canvastext, draganddrop, hashchange,
 * history, audio, video, indexeddb, input, inputtypes, localstorage,
 * postmessage, sessionStorage, websockets, websqldatabase, webworkers,
 * geolocation, inlinesvg, smil, svg, svgclippaths, touch, webgl.
 *
 * Also includes shiv, cssclasses, addtest, prefixed, teststyles,
 * testprop, testallprops, hasevent, prefixes, domprefixes, cors, json, load.
 *
 * For more details, visit: http://modernizr.com/download/#-fontface-backgroundsize-borderimage-borderradius-boxshadow-flexbox-hsla-multiplebgs-opacity-rgba-textshadow-cssanimations-csscolumns-generatedcontent-cssgradients-cssreflections-csstransforms-csstransforms3d-csstransitions-applicationcache-canvas-canvastext-draganddrop-hashchange-history-audio-video-indexeddb-input-inputtypes-localstorage-postmessage-sessionstorage-websockets-websqldatabase-webworkers-geolocation-inlinesvg-smil-svg-svgclippaths-touch-webgl-shiv-cssclasses-addtest-prefixed-teststyles-testprop-testallprops-hasevent-prefixes-domprefixes-cors-json-load
 */
/* Ensure global scope is clean before execution. */
; /* Important semicolon for safety */

// Assigning the Modernizr object to the global window scope.
window.Modernizr = (
    // Self-executing anonymous function to encapsulate scope.
    function(
        /* Reference to the global window object. */
        window,
        /* Reference to the global document object. */
        document,
        /* Explicitly undefined to prevent external modification. */
        undefined
    ) {

    // --- Internal variables for Modernizr's operation ---

    var version = '2.6.2'
    ; /* Current version of Modernizr */


    var Modernizr = {}; // The main object to be exposed globally.


    var enableClasses = true; // Flag to enable/disable CSS classes.


    var docElement = document.documentElement; // HTML element reference.


    var mod = 'modernizr', // Base string for IDs/class names.
        modElem = document.createElement(mod), // Dummy element for testing styles.
        mStyle = modElem.style; // Style property of the dummy element.


    var inputElem = document.createElement('input'); // Dummy input element.


    var smile = ':)'; // A simple string for content testing.


    var toString = {}.toString; // Reference to Object.prototype.toString.


    var prefixes = ' -webkit- -moz- -o- -ms- '.split(' '); // Vendor prefixes for CSS.


    // --- Prefix handling for various DOM/CSS properties ---
    var omPrefixes = 'Webkit Moz O ms'; // Capitalized vendor prefixes.


    var cssomPrefixes = omPrefixes.split(' '); // Array of CSSOM prefixes.


    var domPrefixes = omPrefixes.toLowerCase().split(' '); // Array of DOM prefixes (lowercase).


    var ns = {'svg': 'http://www.w3.org/2000/svg'}; // Namespace for SVG.


    var tests = {}; // Object to store feature test results.
    var inputs = {}; // Object to store input type test results.
    var attrs = {}; // Object to store attribute test results.


    var classes = []; // Array to store detected feature classes.


    var slice = classes.slice; // Reference to Array.prototype.slice.


    var featureName; // Variable to hold the name of the current feature being tested.


    // Helper function for injecting elements with styles to test CSS features.
    injectElementWithStyles = function(
        rule,       // The CSS rule string to inject.
        callback,   // Callback function to execute after injection.
        nodes,      // Number of child nodes to create, or false.
        testnames   // Array of IDs for child nodes, if `nodes` is a number.
    ) {

        // Declare local variables.
        var style, ret, node, docOverflow;

        // Create a temporary div element.
        var div = document.createElement('div');

        // Get the document body, or create a temporary one if it doesn't exist yet.
        var body = document.body;
        var fakeBody = body || document.createElement('body');

        // Check if `nodes` is a positive integer.
        if ( parseInt(nodes, 10) ) {
            // Loop to create and append child nodes.
            while ( nodes-- ) {
                node = document.createElement('div');
                node.id = testnames ? testnames[nodes] : mod + (nodes + 1);
                div.appendChild(node);
            } // End of while loop.
        } // End of if `nodes` condition.

        // Construct the style tag with the given CSS rule.
        style = ['&#173;', '<style id="s', mod, '">', rule, '</style>'].join('');
        div.id = mod; // Assign the main ID to the temporary div.

        // Append the style to either the real body or the fake body.
        (body ? div : fakeBody).innerHTML += style;

        // Append the temporary div to the fake body.
        fakeBody.appendChild(div);

        // If a real body didn't exist initially, set up the fake body for testing.
        if ( !body ) {
            fakeBody.style.background = ''; // Clear background.
            fakeBody.style.overflow = 'hidden'; // Hide overflow.
            docOverflow = docElement.style.overflow; // Store original document overflow.
            docElement.style.overflow = 'hidden'; // Hide document overflow.
            docElement.appendChild(fakeBody); // Append fake body to document element.
        }

        // Execute the callback function with the injected div and rule.
        ret = callback(div, rule);

        // Clean up: remove the fake body or the temporary div.
        if ( !body ) {
            fakeBody.parentNode.removeChild(fakeBody); // Remove fake body.
            docElement.style.overflow = docOverflow; // Restore document overflow.
        } else {
            div.parentNode.removeChild(div); // Remove temporary div.
        }

        // Return boolean result of the callback.
        return !!ret;

    }, // End of injectElementWithStyles function.


    // --- Event support detection utility ---
    isEventSupported = (function() { // Immediately Invoked Function Expression for scoping.

        // Mapping of event names to default element types for testing.
        var TAGNAMES = {
            'select': 'input',
            'change': 'input',
            'submit': 'form',
            'reset': 'form',
            'error': 'img',
            'load': 'img',
            'abort': 'img'
        }; // End of TAGNAMES object.

        // Main function to check if an event is supported.
        function isEventSupported(
            eventName, // The name of the event (e.g., 'click', 'hashchange').
            element    // Optional DOM element to test on.
        ) {

            // Use provided element or create a default one based on event type.
            element = element || document.createElement(TAGNAMES[eventName] || 'div');
            eventName = 'on' + eventName; // Prepend 'on' to event name.

            // Check if the event property exists directly on the element.
            var isSupported = eventName in element;

            // If not directly supported, try setting and checking attribute.
            if ( !isSupported ) {
                // If element lacks setAttribute, create a generic div.
                if ( !element.setAttribute ) {
                    element = document.createElement('div');
                }
                // If setAttribute and removeAttribute are available.
                if ( element.setAttribute && element.removeAttribute ) {
                    element.setAttribute(eventName, ''); // Set empty event handler.
                    isSupported = is(element[eventName], 'function'); // Check if it became a function.

                    // Clean up: remove the event handler if it was set.
                    if ( !is(element[eventName], 'undefined') ) {
                        element[eventName] = undefined;
                    }
                    element.removeAttribute(eventName); // Remove the attribute.
                } // End of setAttribute/removeAttribute check.
            } // End of !isSupported branch.

            element = null; // Dereference element to prevent memory leaks.
            return isSupported; // Return the detection result.
        } // End of isEventSupported function.

        return isEventSupported; // Return the inner function.
    })(), // End of IIFE for isEventSupported.


    // --- hasOwnProperty polyfill/wrapper ---
    _hasOwnProperty = ({}).hasOwnProperty; // Cache the native method.
    var hasOwnProp; // Declare the wrapper function.

    // Check if the native hasOwnProperty is available and callable.
    if ( !is(_hasOwnProperty, 'undefined') && !is(_hasOwnProperty.call, 'undefined') ) {
        // Use the native method if it's safe.
        hasOwnProp = function (object, property) {
            return _hasOwnProperty.call(object, property);
        };
    }
    else {
        // Fallback for environments where native hasOwnProperty might be problematic.
        hasOwnProp = function (object, property) {
            // Check if property exists directly on object and not just its prototype.
            return ((property in object) && is(object.constructor.prototype[property], 'undefined'));
        };
    } // End of hasOwnProp definition.


    // --- Polyfill for Function.prototype.bind ---
    if (!Function.prototype.bind) {
        // If bind is not natively available, implement it.
        Function.prototype.bind = function bind(
            that // The `this` context for the bound function.
        ) {

            var target = this; // The original function being bound.

            // Ensure the target is actually a function.
            if (typeof target != "function") {
                throw new TypeError(); // Throw error if not a function.
            }

            // Capture initial arguments passed to bind, excluding `that`.
            var args = slice.call(arguments, 1);

            // Define the bound function.
            var bound = function () {

                // If `bound` is called with `new`, behave like a constructor.
                if (this instanceof bound) {

                    // Create a temporary constructor to inherit prototype.
                    var F = function(){};
                    F.prototype = target.prototype;
                    var self = new F(); // Create new instance inheriting prototype.

                    // Apply the original function as a constructor.
                    var result = target.apply(
                        self,
                        args.concat(slice.call(arguments)) // Combine bind args and call args.
                    );

                    // If the result is an object, return it; otherwise, return `self`.
                    if (Object(result) === result) {
                        return result;
                    }
                    return self;

                } else {
                    // If `bound` is called normally, apply the original function.
                    return target.apply(
                        that, // Use the `that` context provided to `bind`.
                        args.concat(slice.call(arguments)) // Combine bind args and call args.
                    );
                } // End of `this instanceof bound` check.

            }; // End of `bound` function definition.

            return bound; // Return the newly created bound function.
        }; // End of Function.prototype.bind polyfill.
    } // End of bind polyfill check.

    // --- Utility Functions ---

    /**
     * Sets the CSS text on the dummy element's style property.
     * @param {string} str The CSS string to set.
     */
    function setCss( str ) {
        mStyle.cssText = str; // Directly assigns the CSS string.
    } // End of setCss.

    /**
     * Sets CSS text with vendor prefixes.
     * @param {string} str1 The core CSS property and value.
     * @param {string} str2 Optional additional CSS.
     * @returns {void}
     */
    function setCssAll( str1, str2 ) {
        // Joins prefixes with the first string and appends the second.
        return setCss(prefixes.join(str1 + ';') + ( str2 || '' ));
    } // End of setCssAll.

    /**
     * Checks if an object's type matches a given string.
     * @param {*} obj The object to check.
     * @param {string} type The expected type string (e.g., 'function', 'string').
     * @returns {boolean} True if types match, false otherwise.
     */
    function is( obj, type ) {
        return typeof obj === type;
    } // End of is.

    /**
     * Checks if a string contains a substring.
     * @param {string} str The main string.
     * @param {string} substr The substring to look for.
     * @returns {boolean} True if substring is found, false otherwise.
     */
    function contains( str, substr ) {
        // Uses bitwise NOT (~) and logical NOT (!!) for a concise boolean check.
        return !!~('' + str).indexOf(substr);
    } // End of contains.

    /**
     * Tests a list of CSS properties for browser support.
     * @param {Array<string>} props An array of CSS property names.
     * @param {string|boolean} prefixed 'pfx' to return the prefixed property, true/false otherwise.
     * @returns {string|boolean} The supported property name (if 'pfx') or true, otherwise false.
     */
    function testProps( props, prefixed ) {
        for ( var i in props ) { // Iterate through the provided properties.
            var prop = props[i]; // Get the current property name.
            // Check if property contains a hyphen AND if it's defined in mStyle.
            if ( !contains(prop, "-") && mStyle[prop] !== undefined ) {
                // Return the property name if 'pfx' is requested, otherwise true.
                return prefixed == 'pfx' ? prop : true;
            }
        }
        return false; // No supported property found.
    } // End of testProps.

    /**
     * Tests a list of DOM properties for browser support on an object.
     * @param {Array<string>} props An array of DOM property names.
     * @param {object} obj The object to test properties on (e.g., window, navigator).
     * @param {HTMLElement|boolean} elem Optional element for binding, or false to return property name.
     * @returns {string|Function|*} The supported property name, a bound function, or the property value, otherwise false.
     */
    function testDOMProps( props, obj, elem ) {
        for ( var i in props ) { // Iterate through DOM property names.
            var item = obj[props[i]]; // Get the property value from the object.
            if ( item !== undefined) {
                // If `elem` is explicitly false, return the property name.
                if (elem === false) {
                    return props[i];
                }

                // If the item is a function, return it bound to `elem` or `obj`.
                if (is(item, 'function')){
                    return item.bind(elem || obj);
                }

                return item; // Return the property value.
            }
        }
        return false; // No supported property found.
    } // End of testDOMProps.

    /**
     * Tests a CSS or DOM property across all vendor prefixes.
     * @param {string} prop The base property name (e.g., 'flexWrap', 'transform').
     * @param {string|object|boolean} prefixed 'pfx' for CSS prefix detection, an object for DOM, or undefined.
     * @param {HTMLElement} elem Optional element for DOM property binding.
     * @returns {string|boolean|Function|*} The detected property, true/false, or a bound function.
     */
    function testPropsAll( prop, prefixed, elem ) {

        // Capitalize the first letter of the property name.
        var ucProp = prop.charAt(0).toUpperCase() + prop.slice(1);

        // Generate a list of CSS properties with vendor prefixes.
        var props = (prop + ' ' + cssomPrefixes.join(ucProp + ' ') + ucProp).split(' ');

        // If 'prefixed' is a string ('pfx') or undefined, perform CSS property test.
        if (is(prefixed, "string") || is(prefixed, "undefined")) {
            return testProps(props, prefixed);
        }
        // Otherwise, perform DOM property test.
        else {
            // Generate a list of DOM properties with vendor prefixes.
            props = (prop + ' ' + (domPrefixes).join(ucProp + ' ') + ucProp).split(' ');
            return testDOMProps(props, prefixed, elem);
        } // End of 'prefixed' type check.
    } // End of testPropsAll.


    // --- Feature Detection Tests ---

    // Test for CSS Flexible Box Layout module.
    tests['flexbox'] = function() {
        // Checks for the 'flexWrap' property, which is indicative of flexbox support.
        return testPropsAll('flexWrap');
    }; // End of flexbox test.


    // Test for HTML5 Canvas element support.
    tests['canvas'] = function() {
        var elem = document.createElement('canvas'); // Create a dummy canvas element.
        // Return true if getContext exists and can retrieve a '2d' context.
        return !!(elem.getContext && elem.getContext('2d'));
    }; // End of canvas test.

    // Test for HTML5 Canvas Text API support.
    tests['canvastext'] = function() {
        // Depends on canvas support and checks for the 'fillText' method.
        return !!(Modernizr['canvas'] && is(document.createElement('canvas').getContext('2d').fillText, 'function'));
    }; // End of canvastext test.


    // Test for WebGL (Web Graphics Library) support.
    tests['webgl'] = function() {
        // Checks for the global WebGLRenderingContext object.
        return !!window.WebGLRenderingContext;
    }; // End of webgl test.


    // Test for touch events support.
    tests['touch'] = function() {
        var bool; // Variable to store the boolean result.

        // Check for 'ontouchstart' in window or DocumentTouch interface.
        if(('ontouchstart' in window) || (window.DocumentTouch && document instanceof DocumentTouch)) {
            bool = true;
        } else {
            // Fallback for IE10+ touch detection via media queries.
            injectElementWithStyles(
                ['@media (', prefixes.join('touch-enabled),('), mod, ')', '{#modernizr{top:9px;position:absolute}}'].join(''),
                function( node ) {
                    bool = node.offsetTop === 9; // Check if the injected style was applied.
                }
            );
        }

        return bool; // Return the touch support result.
    }; // End of touch test.


    // Test for Geolocation API support.
    tests['geolocation'] = function() {
        // Simple check if 'geolocation' property exists in navigator object.
        return 'geolocation' in navigator;
    }; // End of geolocation test.


    // Test for PostMessage API support.
    tests['postmessage'] = function() {
        // Checks for the presence of window.postMessage.
        return !!window.postMessage;
    }; // End of postmessage test.


    // Test for Web SQL Database API support.
    tests['websqldatabase'] = function() {
        // Checks for the presence of window.openDatabase.
        return !!window.openDatabase;
    }; // End of websqldatabase test.

    // Test for IndexedDB API support.
    tests['indexedDB'] = function() {
        // Uses testPropsAll to check for 'indexedDB' property on the window object.
        return !!testPropsAll("indexedDB", window);
    }; // End of indexedDB test.

    // Test for Hashchange event support.
    tests['hashchange'] = function() {
        // Checks if 'hashchange' event is supported and if documentMode is not problematic for IE.
        return isEventSupported('hashchange', window) && (document.documentMode === undefined || document.documentMode > 7);
    }; // End of hashchange test.

    // Test for History API support (pushState, replaceState).
    tests['history'] = function() {
        // Checks for the presence of window.history and history.pushState.
        return !!(window.history && history.pushState);
    }; // End of history test.

    // Test for Drag and Drop API support.
    tests['draganddrop'] = function() {
        var div = document.createElement('div'); // Create a dummy div.
        // Check for 'draggable' attribute or 'ondragstart' and 'ondrop' events.
        return ('draggable' in div) || ('ondragstart' in div && 'ondrop' in div);
    }; // End of draganddrop test.

    // Test for WebSockets API support.
    tests['websockets'] = function() {
        // Checks for 'WebSocket' or 'MozWebSocket' in the window object.
        return 'WebSocket' in window || 'MozWebSocket' in window;
    }; // End of websockets test.


    // Test for RGBA color support.
    tests['rgba'] = function() {
        // Set a background color with RGBA.
        setCss('background-color:rgba(150,255,150,.5)');

        // Check if the background color contains 'rgba'.
        return contains(mStyle.backgroundColor, 'rgba');
    }; // End of rgba test.

    // Test for HSLA color support.
    tests['hsla'] = function() {
        // Set a background color with HSLA.
        setCss('background-color:hsla(120,40%,100%,.5)');

        // Check if the background color contains 'rgba' or 'hsla'.
        return contains(mStyle.backgroundColor, 'rgba') || contains(mStyle.backgroundColor, 'hsla');
    }; // End of hsla test.

    // Test for Multiple Backgrounds support.
    tests['multiplebgs'] = function() {
        // Set a background with multiple URLs and a color.
        setCss('background:url(https://),url(https://),red url(https://)');

        // Use a regex to check for at least three 'url()' declarations.
        return (/(url\s*\(.*?){3}/).test(mStyle.background);
    }; // End of multiplebgs test.


    // Test for Background Size CSS property support.
    tests['backgroundsize'] = function() {
        // Uses testPropsAll to check for 'backgroundSize'.
        return testPropsAll('backgroundSize');
    }; // End of backgroundsize test.

    // Test for Border Image CSS property support.
    tests['borderimage'] = function() {
        // Uses testPropsAll to check for 'borderImage'.
        return testPropsAll('borderImage');
    }; // End of borderimage test.


    // Test for Border Radius CSS property support.
    tests['borderradius'] = function() {
        // Uses testPropsAll to check for 'borderRadius'.
        return testPropsAll('borderRadius');
    }; // End of borderradius test.

    // Test for Box Shadow CSS property support.
    tests['boxshadow'] = function() {
        // Uses testPropsAll to check for 'boxShadow'.
        return testPropsAll('boxShadow');
    }; // End of boxshadow test.

    // Test for Text Shadow CSS property support.
    tests['textshadow'] = function() {
        // Creates a dummy div and checks if its textShadow style is an empty string.
        return document.createElement('div').style.textShadow === '';
    }; // End of textshadow test.


    // Test for Opacity CSS property support.
    tests['opacity'] = function() {
        // Sets opacity using vendor prefixes.
        setCssAll('opacity:.55');

        // Checks if the opacity value is '0.55'.
        return (/^0.55$/).test(mStyle.opacity);
    }; // End of opacity test.


    // Test for CSS Animations support.
    tests['cssanimations'] = function() {
        // Uses testPropsAll to check for 'animationName'.
        return testPropsAll('animationName');
    }; // End of cssanimations test.


    // Test for CSS Columns support.
    tests['csscolumns'] = function() {
        // Uses testPropsAll to check for 'columnCount'.
        return testPropsAll('columnCount');
    }; // End of csscolumns test.


    // Test for CSS Gradients support.
    tests['cssgradients'] = function() {
        var str1 = 'background-image:', // Base CSS property.
            str2 = 'gradient(linear,left top,right bottom,from(#9f9),to(white));', // Old WebKit gradient syntax.
            str3 = 'linear-gradient(left top,#9f9, white);'; // Modern gradient syntax.

        // Construct and set the CSS background with various gradient syntaxes.
        setCss(
            (str1 + '-webkit- '.split(' ').join(str2 + str1) +
            prefixes.join(str3 + str1)).slice(0, -str1.length)
        );

        // Check if the background image contains 'gradient'.
        return contains(mStyle.backgroundImage, 'gradient');
    }; // End of cssgradients test.


    // Test for CSS Reflections support.
    tests['cssreflections'] = function() {
        // Uses testPropsAll to check for 'boxReflect'.
        return testPropsAll('boxReflect');
    }; // End of cssreflections test.


    // Test for CSS 2D Transforms support.
    tests['csstransforms'] = function() {
        // Uses testPropsAll to check for 'transform'.
        return !!testPropsAll('transform');
    }; // End of csstransforms test.


    // Test for CSS 3D Transforms support.
    tests['csstransforms3d'] = function() {

        var ret = !!testPropsAll('perspective'); // Initial check for 'perspective'.

        // If 'perspective' is supported, perform a more robust 3D transform test.
        if ( ret && 'webkitPerspective' in docElement.style ) {

            // Inject styles with a media query for 3D transforms.
            injectElementWithStyles(
                '@media (transform-3d),(-webkit-transform-3d){#modernizr{left:9px;position:absolute;height:3px;}}',
                function( node, rule ) {
                    // Check if the injected styles (left:9px, height:3px) were applied.
                    ret = node.offsetLeft === 9 && node.offsetHeight === 3;
                }
            );
        }
        return ret; // Return the final 3D transform support result.
    }; // End of csstransforms3d test.


    // Test for CSS Transitions support.
    tests['csstransitions'] = function() {
        // Uses testPropsAll to check for 'transition'.
        return testPropsAll('transition');
    }; // End of csstransitions test.


    // Test for @font-face rule support.
    tests['fontface'] = function() {
        var bool; // Variable to store the boolean result.

        // Inject a dummy @font-face rule.
        injectElementWithStyles(
            '@font-face {font-family:"font";src:url("https://")}',
            function( node, rule ) {
                var style = document.getElementById('smodernizr'), // Get the injected style tag.
                    sheet = style.sheet || style.styleSheet, // Get the CSS style sheet.
                    // Extract the CSS text of the first rule.
                    cssText = sheet ? (sheet.cssRules && sheet.cssRules[0] ? sheet.cssRules[0].cssText : sheet.cssText || '') : '';

                // Check if 'src' is present and the rule starts as expected.
                bool = /src/i.test(cssText) && cssText.indexOf(rule.split(' ')[0]) === 0;
            }
        );

        return bool; // Return the @font-face support result.
    }; // End of fontface test.

    // Test for Generated Content (CSS :before/:after) support.
    tests['generatedcontent'] = function() {
        var bool; // Variable to store the boolean result.

        // Inject styles to test for generated content.
        injectElementWithStyles(
            ['#', mod, '{font:0/0 a}#', mod, ':after{content:"', smile, '";visibility:hidden;font:3px/1 a}'].join(''),
            function( node ) {
                // Check if the generated content (smiley) made the node's height at least 3px.
                bool = node.offsetHeight >= 3;
            }
        );

        return bool; // Return the generated content support result.
    }; // End of generatedcontent test.

    // Test for HTML5 Video element and its codecs support.
    tests['video'] = function() {
        var elem = document.createElement('video'), // Create a dummy video element.
            bool = false; // Initialize boolean result.

        try {
            // Check if canPlayType method exists.
            if ( bool = !!elem.canPlayType ) {
                bool = new Boolean(bool); // Coerce to Boolean object to attach properties.
                // Test for Ogg video codec support.
                bool.ogg = elem.canPlayType('video/ogg; codecs="theora"').replace(/^no$/,'');

                // Test for H.264 video codec support.
                bool.h264 = elem.canPlayType('video/mp4; codecs="avc1.42E01E"').replace(/^no$/,'');

                // Test for WebM video codec support.
                bool.webm = elem.canPlayType('video/webm; codecs="vp8, vorbis"').replace(/^no$/,'');
            }

        } catch(e) { } // Catch any errors during canPlayType calls.

        return bool; // Return the video and codec support result.
    }; // End of video test.

    // Test for HTML5 Audio element and its codecs support.
    tests['audio'] = function() {
        var elem = document.createElement('audio'), // Create a dummy audio element.
            bool = false; // Initialize boolean result.

        try {
            // Check if canPlayType method exists.
            if ( bool = !!elem.canPlayType ) {
                bool = new Boolean(bool); // Coerce to Boolean object to attach properties.
                // Test for Ogg audio codec support.
                bool.ogg = elem.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/,'');
                // Test for MP3 audio codec support.
                bool.mp3 = elem.canPlayType('audio/mpeg;').replace(/^no$/,'');

                // Test for WAV audio codec support.
                bool.wav = elem.canPlayType('audio/wav; codecs="1"').replace(/^no$/,'');
                // Test for M4A (AAC) audio codec support.
                bool.m4a = ( elem.canPlayType('audio/x-m4a;') ||
                             elem.canPlayType('audio/aac;')).replace(/^no$/,'');
            }
        } catch(e) { } // Catch any errors during canPlayType calls.

        return bool; // Return the audio and codec support result.
    }; // End of audio test.


    // Test for Local Storage API support.
    tests['localstorage'] = function() {
        try {
            // Attempt to set and remove an item in localStorage.
            localStorage.setItem(mod, mod);
            localStorage.removeItem(mod);
            return true; // If successful, localStorage is supported.
        } catch(e) {
            return false; // If an error occurs, localStorage is not supported or accessible.
        }
    }; // End of localstorage test.

    // Test for Session Storage API support.
    tests['sessionstorage'] = function() {
        try {
            // Attempt to set and remove an item in sessionStorage.
            sessionStorage.setItem(mod, mod);
            sessionStorage.removeItem(mod);
            return true; // If successful, sessionStorage is supported.
        } catch(e) {
            return false; // If an error occurs, sessionStorage is not supported or accessible.
        }
    }; // End of sessionstorage test.


    // Test for Web Workers API support.
    tests['webworkers'] = function() {
        // Checks for the presence of window.Worker.
        return !!window.Worker;
    }; // End of webworkers test.


    // Test for Application Cache API support.
    tests['applicationcache'] = function() {
        // Checks for the presence of window.applicationCache.
        return !!window.applicationCache;
    }; // End of applicationcache test.

// The rest of the Modernizr build would follow here,
// including running tests, adding classes, and exposing APIs.
// For this Type I clone, we only need to replicate the provided fragment.

// This is the end of the provided code snippet for cloning.
// In a full Modernizr build, there would be more logic to
// run all tests, add classes to the HTML element, and
// expose the Modernizr object with its methods and properties.

/*
 * Modernizr would continue here to:
 * - Loop through tests and set results.
 * - Add classes to document.documentElement.
 * - Define Modernizr.addTest, Modernizr.testStyles, etc.
 * - Return the Modernizr object.
 */

// Since the original code fragment provided does not include
// the final execution logic and return statement for the IIFE,
// we will omit them to ensure the Type I clone is only of the
// *provided* fragment.

// However, to make the IIFE valid, a return statement is needed.
// We will add a placeholder return, as the original code was
// a snippet of a larger IIFE.
    return Modernizr;

})( window, document );
// End of Modernizr IIFE.