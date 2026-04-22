/*!
 * Modernizr v1.6
 * http://www.modernizr.com
 *
 * Developed by:
 *   - Faruk Ates  http://farukat.es/
 *   - Paul Irish  http://paulirish.com/
 *
 * Copyright (c) 2009-2010
 * Dual-licensed under the BSD or MIT licenses.
 * http://www.modernizr.com/license/
 *
 * This file is part of the Modernizr project.
 * Please keep the license and copyright information intact.
 */


/*
 * Modernizr: a JavaScript library to detect HTML5 and CSS3 features in the user's browser.
 *
 * Modernizr works by creating new elements (or using existing ones) and testing for
 * specific properties or methods. It then exposes the results in a global `Modernizr`
 * object and adds classes to the `<html>` element.
 *
 * If a feature is supported, a class like "cssgradients" is added.
 * If not, the class "no-cssgradients" is added.
 * This allows for conditional CSS based on feature support.
 *
 * @author        Faruk Ates
 * @author        Paul Irish
 * @copyright     (c) 2009-2010 Faruk Ates. All rights reserved.
 * @contributor   Ben Alman (for various improvements)
 */

window.Modernizr = ( function ( window , document , undefined )
{

    var version = '1.6'
        ; // Current Modernizr version string

    var ret = {}
        ; // The public Modernizr object, which will contain all test results

    /**
     * !! DEPRECATED !!
     *
     * `enableHTML5` is a private property intended for advanced use only.
     * When enabled (which is the default), Modernizr.init() will iterate through
     * a brief while() loop. During this loop, it dynamically creates all
     * HTML5 elements in the DOM. This is a workaround for Internet Explorer,
     * which does not recognize or allow styling of any non-HTML4 elements
     * unless they are explicitly created in the DOM.
     *
     * `enableHTML5` is ON by default.
     *
     * Note: The `enableHTML5` toggle option is DEPRECATED as of version 1.6.
     * It is slated for removal in version 2.0, to be replaced by a more modular
     * and configurable approach.
     */
    var enableHTML5 = true
        ; // Flag to enable or disable HTML5 element creation for IE.

    // Get the root HTML element and the document head.
    var docElement = document.documentElement
        ; // Reference to the <html> element

    var docHead = document.head || document.getElementsByTagName('head')[0]
        ; // Reference to the <head> element

    /**
     * Create our "modernizr" element, which is primarily used for most feature tests.
     * This element is temporary and removed after tests.
     */
    var mod = 'modernizr'
        ; // Base string for the Modernizr element ID

    var modElem = document.createElement( mod )
        ; // The temporary DOM element for testing

    var m_style = modElem.style
        ; // A reference to the style object of the temporary element

    /**
     * Create a temporary input element specifically for various Web Forms feature tests.
     */
    var inputElem = document.createElement( 'input' )
        ; // Temporary input element for form-related tests

    // Simple string literal used in some tests.
    var smile = ':)'
        ; // A short string literal

    // Reference to the native Object.prototype.toString method.
    var tostring = Object.prototype.toString
        ; // For robust type checking

    // List of vendor prefixes to apply for CSS property tests. See ticket #21 for context.
    var prefixes = ' -webkit- -moz- -o- -ms- -khtml- '.split(' ')
        ; // Array of CSS vendor prefixes

    // Following the W3C spec, vendor-specific style properties should be exposed as:
    //   elem.style.WebkitBorderRadius
    // The following would be incorrect:
    //   elem.style.webkitBorderRadius

    // Webkit browsers tend to ghost their properties in lowercase,
    // while Opera and Mozilla do not.
    // Microsoft browsers (<= IE8) forego prefixes entirely.
    // IE9 appears to use a lowercase `ms` instead of the correct `Ms`.

    // More details and discussion: http://github.com/Modernizr/Modernizr/issues/issue/21
    var domPrefixes = 'Webkit Moz O ms Khtml'.split(' ')
        ; // Array of DOM property vendor prefixes

    // Namespace definitions, e.g., for SVG.
    var ns = {'svg': 'http://www.w3.org/2000/svg'}
        ; // XML namespaces

    // Objects to store test results and configurations.
    var tests = {}
        ; // Stores functions for each feature test

    var inputs = {}
        ; // Stores results for input types (e.g., input[type="date"])

    var attrs = {}
        ; // Stores results for input attributes (e.g., placeholder)

    var classes = []
        ; // Array of classes to be added to the <html> element

    var featurename
        ; // Variable used in the testing loop to hold the current feature name

    // todo: consider using http://javascript.nwbox.com/CSSSupport/css-support.js instead for media query tests
    /**
     * Helper function to test CSS media queries.
     * @param {string} mq The media query string to test.
     * @returns {boolean} True if the media query matches, false otherwise.
     */
    var testMediaQuery = function ( mq ) {

        var st = document.createElement('style')
            ; // Temporary style element

        var div = document.createElement('div')
            ; // Temporary div for testing

        var ret
            ; // Return value

        st.textContent = mq + '{#modernizr{height:3px}}'
            ; // Set CSS rule for the media query

        docHead.appendChild(st)
            ; // Append style to head

        div.id = 'modernizr'
            ; // Set ID for the test div

        docElement.appendChild(div)
            ; // Append div to document element

        ret = div.offsetHeight === 3
            ; // Check if the height was applied

        st.parentNode.removeChild(st)
            ; // Clean up style element

        div.parentNode.removeChild(div)
            ; // Clean up test div

        return !!ret
            ; // Return boolean result
    }
        ; // End of testMediaQuery function


    /**
     * `isEventSupported` determines if a given element supports a specified event.
     * This function is adapted from http://yura.thinkweb2.com/isEventSupported/
     * @returns {function(string, Element): boolean} A function that checks event support.
     */
    var isEventSupported = ( function () {

        var TAGNAMES = {
            'select':'input',
            'change':'input',
            'submit':'form',
            'reset':'form',
            'error':'img',
            'load':'img',
            'abort':'img'
        }
            ; // Mappings for event types to specific HTML elements

        function isEventSupported ( eventName , element ) {

            // Use provided element or create a default one based on event type.
            element = element || document.createElement( TAGNAMES[eventName] || 'div' )
                ;

            eventName = 'on' + eventName
                ; // Prefix event name with 'on'

            // When using `setAttribute`, IE skips "unload", WebKit skips "unload" and "resize".
            // The `in` operator, however, "catches" these.
            var isSupported = ( eventName in element )
                ;

            if ( !isSupported ) {
                // If the element doesn't have `setAttribute` (i.e., not a Node interface),
                // try with a generic div.
                if ( !element.setAttribute ) {
                    element = document.createElement('div')
                        ;
                }
                // If it has setAttribute, try setting and checking for a function value.
                if ( element.setAttribute && element.removeAttribute ) {
                    element.setAttribute( eventName , '' )
                        ;
                    isSupported = is( element[eventName] , 'function' )
                        ;

                    // If the property was created, remove it by setting its value to `undefined`.
                    if ( !is( element[eventName] , undefined ) ) {
                        element[eventName] = undefined
                            ;
                    }
                    element.removeAttribute( eventName )
                        ;
                }
            }

            element = null
                ; // Clean up the element to prevent memory leaks.
            return isSupported
                ;
        }
        return isEventSupported
            ;
    } )()
        ; // End of isEventSupported IIFE


    // `hasOwnProperty` shim by kangax, needed for Safari 2.0 support.
    var _hasOwnProperty = ( {} ).hasOwnProperty
        ; // Reference to the native method

    var hasOwnProperty
        ; // Our polyfilled or native hasOwnProperty

    if ( !is( _hasOwnProperty , undefined ) && !is( _hasOwnProperty.call , undefined ) ) {
        // If native hasOwnProperty is available and callable, use it.
        hasOwnProperty = function ( object , property ) {
            return _hasOwnProperty.call( object , property )
                ;
        }
            ;
    }
    else {
        // Fallback for older browsers (e.g., Safari 2.0)
        hasOwnProperty = function ( object , property ) {
            /*
             * Yes, this can sometimes yield false positives/negatives in edge cases,
             * but for the general use cases here, it's sufficient.
             */
            return ( ( property in object ) && is( object.constructor.prototype[property] , undefined ) )
                ;
        }
            ;
    }

    /**
     * `set_css` applies a given CSS string to the Modernizr DOM node's style.
     * This is used for temporary CSS property testing.
     * @param {string} str The CSS string to apply.
     */
    function set_css ( str ) {
        m_style.cssText = str
            ;
    }

    /**
     * `set_css_all` extrapolates and applies all vendor-specific CSS strings.
     * It uses the `prefixes` array to generate prefixed versions of a CSS property.
     * @param {string} str1 The base CSS property and value (e.g., 'display:box').
     * @param {string=} str2 Optional additional CSS to append (e.g., 'width:42px').
     * @returns {string} The combined CSS text that was set.
     */
    function set_css_all ( str1 , str2 ) {
        return set_css( prefixes.join(str1 + ';') + ( str2 || '' ) )
            ;
    }

    /**
     * `is` checks if the typeof an object is exactly the specified type.
     * @param {*} obj The object to check.
     * @param {string} type The expected type string (e.g., 'function', 'object', 'undefined').
     * @returns {boolean} True if the type matches, false otherwise.
     */
    function is ( obj , type ) {
        return typeof obj === type
            ;
    }

    /**
     * `contains` checks if a substring is found within a string.
     * Converts the input string to ensure it's a string type before checking.
     * @param {string} str The string to search within.
     * @param {string} substr The substring to search for.
     * @returns {boolean} True if the substring is found, false otherwise.
     */
    function contains ( str , substr ) {
        return ( '' + str ).indexOf( substr ) !== -1
            ;
    }

    /**
     * `test_props` is a generic CSS / DOM property test.
     * It returns true if any of the provided properties are supported by the browser.
     * A supported CSS property returns an empty string when not yet set,
     * whereas an unsupported one returns `undefined`.
     * @param {Array<string>} props An array of property names to test.
     * @param {function(string, HTMLElement): boolean=} callback An optional callback function
     *   to perform additional checks on a supported property.
     * @returns {boolean} True if any property is supported (and passes callback, if provided).
     */
    function test_props ( props , callback ) {
        for ( var i in props ) {
            if ( m_style[ props[i] ] !== undefined && ( !callback || callback( props[i] , modElem ) ) ) {
                return true
                    ;
            }
        }
        return false
            ; // No supported properties found
    }

    /**
     * `test_props_all` tests a list of DOM properties, including vendor-prefixed versions.
     * It constructs a comprehensive list of all possible (known and/or likely) properties
     * on the element, including the non-vendor prefixed one, for forward-compatibility.
     * @param {string} prop The base property name (e.g., 'borderRadius').
     * @param {function(string, HTMLElement): boolean=} callback An optional callback function.
     * @returns {boolean} True if any prefixed or unprefixed version of the property is supported.
     */
    function test_props_all ( prop , callback ) {

        var uc_prop = prop.charAt(0).toUpperCase() + prop.substr(1)
            ; // Uppercase first letter for DOM property naming conventions

        var props   = (prop + ' ' + domPrefixes.join(uc_prop + ' ') + uc_prop).split(' ')
            ; // Generate all prefixed versions

        return !!test_props( props , callback )
            ; // Return boolean result
    }


    /**
     * =========================================================================
     *  Begin Feature Tests
     * =========================================================================
     */

    // Test for Flexbox layout model.
    tests['flexbox'] = function () {
        /**
         * `set_prefixed_value_css` sets a CSS property, applying vendor prefixes
         * to the VALUE of the property.
         * @param {HTMLElement} element The element to apply styles to.
         * @param {string} property The property name (e.g., 'display'). This will NOT be prefixed.
         * @param {string} value The value of the property (e.g., 'box'). This WILL be prefixed.
         * @param {string=} extra Additional CSS to append unmodified.
         */
        function set_prefixed_value_css ( element , property , value , extra ) {
            property += ':'
                ;
            element.style.cssText = (property + prefixes.join(value + ';' + property)).slice(0, -property.length) + (extra || '')
                ;
        }

        /**
         * `set_prefixed_property_css` sets a CSS property, applying vendor prefixes
         * to the NAME of the property.
         * @param {HTMLElement} element The element to apply styles to.
         * @param {string} property The property name (e.g., 'box-flex'). This WILL be prefixed.
         * @param {string} value The value of the property (e.g., '1'). This will NOT be prefixed.
         * @param {string=} extra Additional CSS to append unmodified.
         */
        function set_prefixed_property_css ( element , property , value , extra ) {
            element.style.cssText = prefixes.join(property + ':' + value + ';') + (extra || '')
                ;
        }

        var c = document.createElement('div')
            ; // Container div for flexbox test

        var elem = document.createElement('div')
            ; // Child div for flexbox test

        // Apply prefixed display:box to container.
        set_prefixed_value_css(c, 'display', 'box', 'width:42px;padding:0;')
            ;

        // Apply prefixed box-flex:1 to child.
        set_prefixed_property_css(elem, 'box-flex', '1', 'width:10px;')
            ;

        c.appendChild(elem)
            ; // Append child to container

        docElement.appendChild(c)
            ; // Append container to document for layout calculation

        var ret = elem.offsetWidth === 42
            ; // Check if the child took up the full width due to flex

        c.removeChild(elem)
            ; // Clean up child element

        docElement.removeChild(c)
            ; // Clean up container element

        return ret
            ; // Return the result of the flexbox test
    }
        ; // End of flexbox test

    // Canvas feature detection.
    // On the S60 and BB Storm, getContext exists, but always returns undefined.
    // See: http://github.com/Modernizr/Modernizr/issues/issue/97/
    tests['canvas'] = function () {
        var elem = document.createElement( 'canvas' )
            ; // Create a canvas element
        return !!( elem.getContext && elem.getContext('2d') )
            ; // Check if getContext exists and returns a 2D rendering context
    }
        ; // End of canvas test

    // Canvas Text feature detection.
    tests['canvastext'] = function () {
        return !!( ret['canvas'] && is( document.createElement( 'canvas' ).getContext('2d').fillText , 'function' ) )
            ; // Check if canvas is supported and fillText method exists
    }
        ; // End of canvastext test


    // WebGL (3D Canvas) feature detection.
    tests['webgl'] = function () {

        var elem = document.createElement( 'canvas' )
            ; // Create a canvas element for WebGL test

        try {
            if ( elem.getContext('webgl') ) {
                return true
                    ; // Check for standard WebGL context
            }
        } catch ( e ) {
            // Ignore errors
        }

        try {
            if ( elem.getContext('experimental-webgl') ) {
                return true
                    ; // Check for experimental WebGL context
            }
        } catch ( e ) {
            // Ignore errors
        }

        return false
            ; // WebGL not supported
    }
        ; // End of webgl test

    /*
     * The Modernizr.touch test only indicates if the browser supports
     * touch events, which does not necessarily reflect a touchscreen
     * device. Examples include tablets running Windows 7 or the Palm Pre / WebOS phones.
     *
     * Additionally, Chrome (desktop) used to incorrectly report touch support,
     * but this has since been rectified: http://crbug.com/36415
     *
     * This test also includes a check for Firefox 4 Multitouch Support.
     *
     * For more information, please refer to: http://modernizr.github.com/Modernizr/touch.html
     */

    tests['touch'] = function () {

        // Check for 'ontouchstart' event in window object or a media query for touch-enabled devices.
        return ( 'ontouchstart' in window ) || testMediaQuery( '@media (' + prefixes.join('touch-enabled),(') + 'modernizr)' )
            ;

    }
        ; // End of touch test


    /**
     * `geolocation` tests for the new Geolocation API specification.
     * This test is a standards-compliant-only test. For more complete
     * testing, including a Google Gears fallback, please see:
     *   http://code.google.com/p/geo-location-javascript/
     * or view a fallback solution using Google's Geo API:
     *   http://gist.github.com/366184
     */
    tests['geolocation'] = function () {
        return !!navigator.geolocation
            ; // Check if navigator.geolocation object exists
    }
        ; // End of geolocation test

    // Per 1.6:
    // This used to be Modernizr.crosswindowmessaging, but the longer
    // name has been deprecated in favor of a shorter, property-matching one.
    // The old API is still available in 1.6, but as of 2.0 will throw a warning,
    // and in the first release thereafter, it will disappear entirely.
    tests['postmessage'] = function () {
        return !!window.postMessage
            ; // Check for window.postMessage support
    }
        ; // End of postmessage test

    // Web SQL database detection is tricky:

    // In Chrome incognito mode, `openDatabase` is truthy, but using it will
    // throw an exception: http://crbug.com/42380
    // We can create a dummy database, but there is no way to delete it afterwards.

    // Meanwhile, Safari users can get prompted on any database creation.
    // If they do, any page with Modernizr will give them a prompt:
    // http://github.com/Modernizr/Modernizr/issues/closed#issue/113

    // We have chosen to allow the Chrome incognito false positive, so that Modernizr
    // doesn't clutter the web with these test databases. As a developer, you'll have
    // to account for this gotcha yourself.
    tests['websqldatabase'] = function () {
        var result = !!window.openDatabase
            ; // Check for window.openDatabase support
        /*
        if (result){
          try {
            result = !!openDatabase( mod + "testdb", "1.0", mod + "testdb", 2e4);
          } catch(e) {
          }
        }
        */
        return result
            ; // Return the result
    }
        ; // End of websqldatabase test

    // Vendors have inconsistent prefixing with the experimental Indexed DB:
    // - Firefox ships indexedDB in FF4 as moz_indexedDB
    // - Webkit's implementation is accessible through webkitIndexedDB
    // We test both styles.
    tests['indexedDB'] = function () {
        for ( var i = -1 , len = domPrefixes.length ; ++i < len ; ) {
            var prefix = domPrefixes[i].toLowerCase()
                ;
            if ( window[prefix + '_indexedDB'] || window[prefix + 'IndexedDB'] ) {
                return true
                    ; // Found a prefixed or unprefixed IndexedDB implementation
            }
        }
        return false
            ; // IndexedDB not found
    }
        ; // End of indexedDB test

    // `documentMode` logic from YUI to filter out IE8 Compat Mode,
    // which gives false positives for hashchange.
    tests['hashchange'] = function () {
        return isEventSupported('hashchange', window) && ( document.documentMode === undefined || document.documentMode > 7 )
            ; // Check for hashchange event support and IE document mode
    }
        ; // End of hashchange test

    // Per 1.6:
    // This used to be Modernizr.historymanagement, but the longer
    // name has been deprecated in favor of a shorter, property-matching one.
    // The old API is still available in 1.6, but as of 2.0 will throw a warning,
    // and in the first release thereafter, it will disappear entirely.
    tests['history'] = function () {
        return !!( window.history && history.pushState )
            ; // Check for window.history and history.pushState support
    }
        ; // End of history test

    // Drag and Drop API feature detection.
    tests['draganddrop'] = function () {
        return isEventSupported('dragstart') && isEventSupported('drop')
            ; // Check for both dragstart and drop events
    }
        ; // End of draganddrop test

    // WebSockets API feature detection.
    tests['websockets'] = function () {
        return ( 'WebSocket' in window )
            ; // Check if WebSocket constructor exists in window
    }
        ; // End of websockets test


    // RGBA color support detection.
    // See: http://css-tricks.com/rgba-browser-support/
    tests['rgba'] = function () {
        // Set an rgba() color and check the returned value in the style property.

        set_css( 'background-color:rgba(150,255,150,.5)' )
            ; // Apply a transparent RGBA background

        return contains( m_style.backgroundColor , 'rgba' )
            ; // Check if 'rgba' is present in the computed style
    }
        ; // End of rgba test

    // HSLA color support detection.
    tests['hsla'] = function () {
        // Similar to rgba(). Browsers typically re-map hsla() to rgba() internally,
        // with the exception of IE9, which retains it as hsla.

        set_css('background-color:hsla(120,40%,100%,.5)' )
            ; // Apply a transparent HSLA background

        return contains( m_style.backgroundColor , 'rgba' ) || contains( m_style.backgroundColor , 'hsla' )
            ; // Check for 'rgba' or 'hsla' in the computed style
    }
        ; // End of hsla test

    // Multiple Backgrounds support detection.
    tests['multiplebgs'] = function () {
        // Setting multiple images AND a color on the background shorthand property,
        // then querying the `style.background` property value for the number of
        // occurrences of "url(" is a reliable method for detecting ACTUAL support for this!

        set_css( 'background:url(//:),url(//:),red url(//:)' )
            ; // Apply multiple background images and a color

        // If the UA supports multiple backgrounds, there should be three occurrences
        // of the string "url(" in the return value for `elem_style.background`.

        return new RegExp("(url\\s*\\(.*?){3}").test(m_style.background)
            ; // Use regex to count 'url(' occurrences
    }
        ; // End of multiplebgs test


    // In testing support for a given CSS property, it's legitimate to test:
    //    elem.style[styleName] !== undefined
    // If the property is supported, it will return an empty string.
    // If unsupported, it will return undefined.
    // We'll take advantage of this quick test and skip setting a style
    // on our modernizr element, instead just testing for `undefined` versus `empty string`.
    // The legacy `set_css_all` calls will remain in the source
    // (however, commented out) for clarity, yet functionally they are
    // no longer strictly needed for these specific property tests.


    // Background Size CSS property detection.
    tests['backgroundsize'] = function () {
        return test_props_all( 'backgroundSize' )
            ; // Test for 'backgroundSize' property (with prefixes)
    }
        ; // End of backgroundsize test

    // Border Image CSS property detection.
    tests['borderimage'] = function () {
        //  set_css_all( 'border-image:url(m.png) 1 1 stretch' ); // Legacy call, functionally not needed now.
        return test_props_all( 'borderImage' )
            ; // Test for 'borderImage' property (with prefixes)
    }
        ; // End of borderimage test


    // Super comprehensive table about all the unique implementations of
    // border-radius: http://muddledramblings.com/table-of-css3-border-radius-compliance
    // Border Radius CSS property detection.
    tests['borderradius'] = function () {
        //  set_css_all( 'border-radius:10px' ); // Legacy call, functionally not needed now.
        return test_props_all( 'borderRadius' , function ( prop ) {
            return contains( prop , 'orderRadius' )
                ; // Custom callback to ensure it's a border-radius property
        } )
            ; // Test for 'borderRadius' property (with prefixes)
    }
        ; // End of borderradius test


    // Box Shadow CSS property detection.
    tests['boxshadow'] = function () {
        //  set_css_all( 'box-shadow:#000 1px 1px 3px' ); // Legacy call, functionally not needed now.
        return test_props_all( 'boxShadow' )
            ; // Test for 'boxShadow' property (with prefixes)
    }
        ; // End of boxshadow test

    // Text Shadow CSS property detection.
    // Note: FF3.0 will false positive on this test.
    tests['textshadow'] = function () {
        return document.createElement('div').style.textShadow === ''
            ; // Check if textShadow style property exists (returns empty string if supported)
    }
        ; // End of textshadow test

    // Opacity CSS property detection.
    tests['opacity'] = function () {
        // Browsers that actually have CSS Opacity implemented have done so
        // according to spec, which means their return values are within the
        // range of [0.0, 1.0] - including the leading zero.
        // We'll perform a test for this.
        // ... (rest of the test would go here)