/*
 *   Modernizr 2.7.1 (Custom Build) - A JavaScript library for detecting HTML5 and CSS3 features.
 *   This particular build focuses on input types.
 *   For more information and to customize your own build, visit: http://modernizr.com/download/#-inputtypes-load
 *   Licensed under both the MIT and BSD licenses.
 */


;
( function( window, document, undefined ) {

    // Internal version number for this specific Modernizr-like implementation within AngularSlider.
    var version = '2.7.1';

    // The global object that will be exposed, containing feature detection results.
    var AngularSlider = {};


    // A quick reference to the root element of the document (<html> tag).
    var docElement = document.documentElement;

    // The string "modernizr" used as a class name and for element creation.
    var mod = 'modernizr';
    // Create a dummy DOM element to test CSS properties.
    var modElem = document.createElement( mod );
    // Get the style property of the dummy element for applying CSS tests.
    var mStyle = modElem.style;

    // Create an input element, specifically for testing HTML5 input types.
    var inputElem = document.createElement( 'input' );

    // A simple string constant, used in input type detection logic.
    var smile = ':)',

    // Cached reference to the native Object.prototype.toString method for robust type checking.
        toString = {}.toString,
    // An object to store feature test functions.
        tests = {},
    // An object to store the boolean results of input type detections.
        inputs = {},
    // An object for attribute-related tests (not extensively used in this specific build).
        attrs = {},

    // An array to accumulate CSS class names representing detected features (e.g., 'no-inputtypes', 'inputtypes').
        classes = [],

    // A cached reference to Array.prototype.slice for converting arguments objects to arrays.
        slice = classes.slice,

    // A temporary variable to hold the current feature name during iteration.
        featureName;


    // --- Core Utility Functions for Feature Detection ---

    // Cache the native `hasOwnProperty` method from `Object.prototype`.
    var _hasOwnProperty = ( {} ).hasOwnProperty;
    // Declare a variable to hold our robust `hasOwnProp` function.
    var hasOwnProp;

    // Check if `hasOwnProperty` itself and its `call` method are defined and callable.
    if ( !is( _hasOwnProperty, 'undefined' ) && !is( _hasOwnProperty.call, 'undefined' ) ) {
        // If they are, use the more reliable `_hasOwnProperty.call` method.
        hasOwnProp = function ( object, property ) {
            return _hasOwnProperty.call( object, property );
        };
    }
    else {
        // Fallback for environments where `hasOwnProperty` might be overridden or problematic.
        hasOwnProp = function ( object, property ) {
            // This checks if the property exists directly on the object (not its prototype).
            return ( ( property in object ) && is( object.constructor.prototype[property], 'undefined' ) );
        };
    }


    // --- Polyfill for `Function.prototype.bind` ---

    // Check if the native `bind` method is not available.
    if ( !Function.prototype.bind ) {
        // Implement a basic polyfill for `Function.prototype.bind`.
        Function.prototype.bind = function bind( that ) {

            // The function on which `bind` was called.
            var target = this;

            // Ensure `bind` is called on a function.
            if ( typeof target != "function" ) {
                throw new TypeError();
            }

            // Capture any arguments passed to `bind` after the `this` context.
            var args = slice.call( arguments, 1 ),
                // This is the new bound function that will be returned.
                bound = function () {

                    // If the bound function is called with `new` (as a constructor).
                    if ( this instanceof bound ) {

                        // Create a temporary constructor.
                        var F = function(){};
                        // Inherit the prototype of the original function.
                        F.prototype = target.prototype;
                        // Create a new instance using the temporary constructor.
                        var self = new F();

                        // Apply the original function with the new instance and combined arguments.
                        var result = target.apply(
                            self,
                            args.concat( slice.call( arguments ) ) // Combine bind-time and call-time arguments.
                        );
                        // If the original function returned an object, use that; otherwise, return the new instance.
                        if ( Object( result ) === result ) {
                            return result;
                        }
                        return self;

                    } else {
                        // If the bound function is called normally.
                        // Apply the original function with the specified `that` context and combined arguments.
                        return target.apply(
                            that,
                            args.concat( slice.call( arguments ) )
                        );

                    }

                };

            return bound; // Return the new bound function.
        };
    }

    // --- Helper Functions for CSS and Type Checking ---

    /**
     * Sets the `cssText` property of the Modernizr dummy element's style.
     * @param {string} str - The CSS string to apply.
     */
    function setCss( str ) {
        mStyle.cssText = str;
    }

    /**
     * Applies a CSS string, automatically prepending vendor prefixes.
     * (Note: The `prefixes` array is assumed to be defined elsewhere in a full Modernizr build).
     * @param {string} str1 - The base CSS property/value string.
     * @param {string} [str2] - Optional additional CSS.
     * @returns {void}
     */
    function setCssAll( str1, str2 ) {
        // This function relies on a global `prefixes` array, which is not in this snippet.
        // For Type I cloning, the expression must remain identical, so `prefixes` is left as-is.
        return setCss( prefixes.join( str1 + ';' ) + ( str2 || '' ) );
    }

    /**
     * Checks if a given object's `typeof` result matches a specified type string.
     * @param {*} obj - The object to check.
     * @param {string} type - The expected type string (e.g., 'function', 'string', 'number').
     * @returns {boolean} `true` if types match, `false` otherwise.
     */
    function is( obj, type ) {
        return typeof obj === type;
    }

    /**
     * Determines if a string contains a specific substring.
     * @param {string} str - The string to search within.
     * @param {string} substr - The substring to search for.
     * @returns {boolean} `true` if `substr` is found, `false` otherwise.
     */
    function contains( str, substr ) {
        return !!~( '' + str ).indexOf( substr );
    }


    /**
     * Tests for the existence of specific DOM properties across an object or element.
     * @param {Array<string>} props - An array of property names to test for.
     * @param {object} obj - The object or prototype to check for properties.
     * @param {HTMLElement|boolean} [elem=false] - An optional element to bind a found function to, or `false` to return the property name.
     * @returns {*} The found property's value, the property name (if `elem` is `false`), or `false` if no property is found.
     */
    function testDOMProps( props, obj, elem ) {
        for ( var i in props ) {
            var item = obj[ props[i] ];
            if ( item !== undefined ) {

                // If `elem` is explicitly `false`, we just want the name of the supported property.
                if ( elem === false ) return props[i];

                // If the property is a function, bind it to the provided `elem` or `obj`.
                if ( is( item, 'function' ) ) {
                    return item.bind( elem || obj );
                }

                // Otherwise, return the property's value directly.
                return item;
            }
        }
        return false; // No matching property found.
    }

    /**
     * Performs feature detection for various HTML5 input types and stores the results.
     */
    function webforms() {
        AngularSlider['inputtypes'] = ( function( props ) {

            // Iterate through each input type in the provided array.
            for ( var i = 0, bool, inputElemType, defaultView, len = props.length; i < len; i++ ) {

                // Set the type attribute of our dummy input element.
                inputElem.setAttribute( 'type', inputElemType = props[i] );
                // The primary check: does the browser *actually* render it as the requested type,
                // or does it fall back to 'text' (indicating no support)?
                bool = inputElem.type !== 'text';

                // For types where the initial 'type' attribute check might be insufficient,
                // perform more specific tests.
                if ( bool ) {

                    // Set a known value and hide the input to avoid visual interference.
                    inputElem.value         = smile;
                    inputElem.style.cssText = 'position:absolute;visibility:hidden;';

                    // Special handling for `range` input type, particularly for Webkit browsers.
                    if ( /^range$/.test( inputElemType ) && inputElem.style.WebkitAppearance !== undefined ) {

                        // Temporarily append the input to the document to get computed styles.
                        docElement.appendChild( inputElem );
                        defaultView = document.defaultView; // Get the window object.

                        // Check if computed styles are available and if the Webkit appearance is not 'textfield',
                        // and if the element has a non-zero offset height (indicating it's rendered).
                        bool =  defaultView.getComputedStyle &&
                                defaultView.getComputedStyle( inputElem, null ).WebkitAppearance !== 'textfield' &&
                                ( inputElem.offsetHeight !== 0 );

                        // Remove the input element from the DOM.
                        docElement.removeChild( inputElem );

                    } else if ( /^(search|tel)$/.test( inputElemType ) ) {
                        // For 'search' and 'tel', the initial `inputElem.type !== 'text'` check is usually sufficient.
                        // No further visual tests are typically required for these.
                    } else if ( /^(url|email)$/.test( inputElemType ) ) {
                        // For 'url' and 'email', check if `checkValidity` API exists and reports an invalid state
                        // with our default `smile` value (which is not a valid URL/email).
                        bool = inputElem.checkValidity && inputElem.checkValidity() === false;

                    } else {
                        // For other input types, if the browser doesn't support the type, it might
                        // normalize the value. We check if the value is still our `smile` string.
                        bool = inputElem.value != smile;
                    }
                }

                // Store the final boolean result for the current input type.
                inputs[ props[i] ] = !!bool;
            }
            return inputs; // Return the object containing all input type support results.
        })( 'search tel url email datetime date month week time datetime-local number range color'.split(' ') );
    }

    // --- Main Loop to Run All Registered Tests ---

    // Iterate over each feature defined in the `tests` object.
    for ( var feature in tests ) {
        // Ensure the feature belongs directly to the `tests` object, not its prototype chain.
        if ( hasOwnProp( tests, feature ) ) {
            // Normalize the feature name to lowercase for consistency.
            featureName  = feature.toLowerCase();
            // Execute the test function and store its result on the `AngularSlider` object.
            AngularSlider[featureName] = tests[feature]();

            // Add a corresponding CSS class to the document's root element.
            // If the feature is supported, add `featureName` (e.g., 'inputtypes').
            // If not supported, add `no-featureName` (e.g., 'no-inputtypes').
            classes.push( ( AngularSlider[featureName] ? '' : 'no-' ) + featureName );
        }
    }

    // If no specific 'input' tests were registered (i.e., `AngularSlider.input` is falsy),
    // then explicitly run the `webforms` detection. This ensures input types are always checked.
    AngularSlider.input || webforms();


    // --- Public API: `addTest` Method ---

    /**
     * Allows external code to add new feature tests or update existing ones.
     * @param {string|object} feature - The name of the feature (string) or an object where keys are feature names and values are test functions/booleans.
     * @param {*} [test] - The test function to execute or a boolean result, required if `feature` is a string.
     * @returns {object} The `AngularSlider` object, allowing for method chaining.
     */
    AngularSlider.addTest = function ( feature, test ) {
        // Handle cases where an object of features is passed.
        if ( typeof feature == 'object' ) {
            for ( var key in feature ) {
                if ( hasOwnProp( feature, key ) ) {
                    AngularSlider.addTest( key, feature[ key ] );
                }
            }
        } else {
            // Process a single feature test.
            feature = feature.toLowerCase(); // Normalize feature name.

            // If the feature has already been tested, skip it to prevent re-running.
            if ( AngularSlider[feature] !== undefined ) {
                return AngularSlider;
            }

            // Execute the test if it's a function; otherwise, use the value directly.
            test = typeof test == 'function' ? test() : test;

            // If a global `enableClasses` flag is set, add the appropriate CSS class to the document.
            // This flag is expected to be defined externally.
            if ( typeof enableClasses !== "undefined" && enableClasses ) {
                docElement.className += ' ' + ( test ? '' : 'no-' ) + feature;
            }
            // Store the result of the feature test.
            AngularSlider[feature] = test;

        }

        return AngularSlider; // Return `this` for chaining.
    };


    // --- Finalization and Cleanup ---

    // Clear any lingering CSS from the dummy element.
    setCss( '' );
    // Dereference the dummy elements to free up memory.
    modElem = inputElem = null;


    // Attach the version number to the public `AngularSlider` object.
    AngularSlider._version = version;


    // Return the `AngularSlider` object, making it globally available.
    return AngularSlider;

} )( this, this.document );


/*
 *   yepnope.js - A fast and flexible asynchronous conditional resource loader.
 *   Version: 1.5.4 (minified)
 *   License: WTFPL (Do What The Fuck You Want To Public License) - http://www.wtfpl.net/
 *   This minified block is included as-is to maintain structural integrity.
 */
(function(a,b,c){function d(a){return"[object Function]"==o.call(a)}function e(a){return"string"==typeof a}function f(){}function g(a){return!a||"loaded"==a||"complete"==a||"uninitialized"==a}function h(){var a=p.shift();q=1,a?a.t?m(function(){("c"==a.t?B.injectCss:B.injectJs)(a.s,0,a.a,a.x,a.e,1)},0):(a(),h()):q=0}function i(a,c,d,e,f,i,j){function k(b){if(!o&&g(l.readyState)&&(u.r=o=1,!q&&h(),l.onload=l.onreadystatechange=null,b)){"img"!=a&&m(function(){t.removeChild(l)},50);for(var d in y[c])y[c].hasOwnProperty(d)&&y[c][d].onload()}}var j=j||B.errorTimeout,l=b.createElement(a),o=0,r=0,u={t:d,s:c,e:f,a:i,x:j};1===y[c]&&(r=1,y[c]=[]),"object"==a?l.data=c:(l.src=c,l.type=a),l.width=l.height="0",l.onerror=l.onload=l.onreadystatechange=function(){k.call(this,r)},p.splice(e,0,u),"img"!=a&&(r||2===y[c]?(t.insertBefore(l,s?null:n),m(k,j)):y[c].push(l))}function j(a,b,c,d,f){return q=0,b=b||"j",e(a)?i("c"==b?v:u,a,b,this.i++,c,d,f):(p.splice(this.i++,0,a),1==p.length&&h()),this}function k(){var a=B;return a.loader={load:j,i:0},a}var l=b.documentElement,m=a.setTimeout,n=b.getElementsByTagName("script")[0],o={}.toString,p=[],q=0,r="MozAppearance"in l.style,s=r&&!!b.createRange().compareNode,t=s?l:n.parentNode,l=a.opera&&"[object Opera]"==o.call(a.opera),l=!!b.attachEvent&&!l,u=r?"object":l?"script":"img",v=l?"script":u,w=Array.isArray||function(a){return"[object Array]"==o.call(a)},x=[],y={},z={timeout:function(a,b){return b.length&&(a.timeout=b[0]),a}},A,B;B=function(a){function b(a){var a=a.split("!"),b=x.length,c=a.pop(),d=a.length,c={url:c,origUrl:c,prefixes:a},e,f,g;for(f=0;f<d;f++)g=a[f].split("="),(e=z[g.shift()])&&(c=e(c,g));for(f=0;f<b;f++)c=x[f](c);return c}function g(a,e,f,g,h){var i=b(a),j=i.autoCallback;i.url.split(".").pop().split("?").shift(),i.bypass||(e&&(e=d(e)?e:e[a]||e[g]||e[a.split("/").pop().split("?")[0]]),i.instead?i.instead(a,e,f,g,h):(y[i.url]?i.noexec=!0:y[i.url]=1,f.load(i.url,i.forceCSS||!i.forceJS&&"css"==i.url.split(".").pop().split("?").shift()?"c":c,i.noexec,i.attrs,i.timeout),(d(e)||d(j))&&f.load(function(){k(),e&&e(i.origUrl,h,g),j&&j(i.origUrl,h,g),y[i.url]=2})))}function h(a,b){function c(a,c){if(a){if(e(a))c||(j=function(){var a=[].slice.call(arguments);k.apply(this,a),l()}),g(a,j,b,0,h);else if(Object(a)===a)for(n in m=function(){var b=0,c;for(c in a)a.hasOwnProperty(c)&&b++;return b}(),a)a.hasOwnProperty(n)&&(!c&&!--m&&(d(j)?j=function(){var a=[].slice.call(arguments);k.apply(this,a),l()}:j[n]=function(a){return function(){var b=[].slice.call(arguments);a&&a.apply(this,b),l()}}(k[n])),g(a[n],j,b,n,h))}else!c&&l()}var h=!!a.test,i=a.load||a.both,j=a.callback||f,k=j,l=a.complete||f,m,n;c(h?a.yep:a.nope,!!i),i&&c(i)}var i,j,l=this.yepnope.loader;if(e(a))g(a,0,l,0);else if(w(a))for(i=0;i<a.length;i++)j=a[i],e(j)?g(j,0,l,0):w(j)?B(j):Object(j)===j&&h(j,l);else Object(a)===a&&h(a,l)},B.addPrefix=function(a,b){z[a]=b},B.addFilter=function(a){x.push(a)},B.errorTimeout=1e4,null==b.readyState&&b.addEventListener&&(b.readyState="loading",b.addEventListener("DOMContentLoaded",A=function(){b.removeEventListener("DOMContentLoaded",A,0),b.readyState="complete"},0)),a.yepnope=k(),a.yepnope.executeStack=h,a.yepnope.injectJs=function(a,c,d,e,i,j){var k=b.createElement("script"),l,o,e=e||B.errorTimeout;k.src=a;for(o in d)k.setAttribute(o,d[o]);c=j?h:c||f,k.onreadystatechange=k.onload=function(){!l&&g(k.readyState)&&(l=1,c(),k.onload=k.onreadystatechange=null)},m(function(){l||(l=1,c(1))},e),i?k.onload():n.parentNode.insertBefore(k,n)},a.yepnope.injectCss=function(a,c,d,e,g,i){var e=b.createElement("link"),j,c=i?h:c||f;e.href=a,e.rel="stylesheet",e.type="text/css";for(j in d)e.setAttribute(j,d[j]);g||(n.parentNode.insertBefore(e,n),m(c,0))}})(this,document);

// Integrate yepnope into AngularSlider as a loader.
AngularSlider.load = function() {
    yepnope.apply( window, [].slice.call( arguments, 0 ) );
};
; // An additional semicolon for visual distinction.

/*
 *   angular-slider: A robust and highly customizable range slider directive for AngularJS.
 *   Developed by Venturocket, Inc. (c) 2013-2014.
 *   Find the project on GitHub: http://github.com/Venturocket
 *   Distributed under the MIT License - Free to use, modify, and distribute.
 */

angular.module( 'vr.directives.slider', [ 'ngTouch' ] )
    .directive( 'slider',
        [ '$timeout', '$document', '$interpolate', '$swipe',
            function( $timeout, $document, $interpolate, $swipe ) {

                /**
                 * Defines the "stickiness" or resistance level of the slider knobs.
                 * A higher value makes the knobs feel more anchored.
                 * @type {number}
                 */
                var KNOB_STICKINESS = 3;

                /**
                 * Retrieves the start interpolation symbol configured for AngularJS.
                 * This allows the directive to correctly parse expressions within its template.
                 * @type {string}
                 */
                var startSymbol = $interpolate.startSymbol();
                /**
                 * Retrieves the end interpolation symbol configured for AngularJS.
                 * @type {string}
                 */
                var endSymbol = $interpolate.endSymbol();

                /**
                 * Converts a raw DOM element into an AngularJS-wrapped element.
                 * This provides access to jQuery-like methods (if jQuery is loaded) or AngularJS's jqLite methods.
                 * @param {object} element - The DOM element to convert.
                 * @returns {object} The AngularJS element.
                 */
                function angularize( element ) {
                    return angular.element( element );
                }

                /**
                 * Appends the 'px' unit to a numeric position value, creating a valid CSS pixel string.
                 * @param {(string|Number)} position - The numerical position.
                 * @returns {string} The CSS position string (e.g., "100px").
                 */
                function pixelize( position ) {
                    return "" + position + "px";
                }

                /**
                 * Sets the CSS `opacity` property for a given element.
                 * @param {object} element - The AngularJS element target.
                 * @param {Number} opacity - The desired opacity value (0.0 to 1.0).
                 * @returns {object} The modified element.
                 */
                function setOpacity( element, opacity ) {
                    return element.css( {
                        opacity: opacity
                    } );
                }

                /**
                 * Hides an element by setting its opacity to 0.
                 * @param {object} element - The AngularJS element to hide.
                 * @returns {object} The hidden element.
                 */
                function hide( element ) {
                    return setOpacity( element, 0 );
                }

                /**
                 * Makes an element visible by setting its opacity to 1.
                 * @param {object} element - The AngularJS element to show.
                 * @returns {object} The visible element.
                 */
                function show( element ) {
                    return setOpacity( element, 1 );
                }

                /**
                 * Sets the `left` CSS property of an element to position it horizontally.
                 * @param {object} element - The AngularJS element to offset.
                 * @param {Number|string} position - The desired left position (e.g., "50px" or 50).
                 * @returns {object} The modified element.
                 */
                function offset( element, position ) {
                    return element.css( {
                        left: position
                    } );
                }

                /**
                 * Calculates the effective width of an element. It prioritizes the CSS `width` property,
                 * falling back to `offsetWidth` if CSS width is not a valid number.
                 * @param {object} element - The AngularJS element.
                 * @returns {number} The computed width in pixels.
                 */
                function width( element ) {
                    var width = parseFloat( element.css( 'width' ) );
                    return isNaN( width ) ? element[0].offsetWidth : width;
                }

                /**
                 * Determines half the width of a given element.
                 * @param {object} element - The AngularJS element.
                 * @returns {number} Half of the element's width.
                 */
                function halfWidth( element ) {
                    return width( element ) / 2;
                }

                /**
                 * Calculates the left offset of an element relative to the viewport.
                 * It attempts to use jQuery's `offset().left` if available, otherwise falls back
                 * to `getBoundingClientRect().left`.
                 * @param {object} element - The AngularJS element.
                 * @returns {Number} The left offset in pixels.
                 */
                function offsetLeft( element ) {
                    try {
                        return element.offset().left;
                    } catch( e ) {
                        // Fallback for environments without full jQuery or where .offset() is not available
                        // (e.g., jqLite in some test setups).
                    }
                    return element[0].getBoundingClientRect().left; // + scrollX; // scrollX is not needed for viewport-relative.
                }

                /**
                 * Computes the horizontal distance (gap) between two elements.
                 * @param {object} element1 - The first AngularJS element.
                 * @param {object} element2 - The second AngularJS element.
                 * @returns {number} The pixel gap between the elements.
                 */
                function gap( element1, element2 ) {
                    if ( offsetLeft( element1 ) > offsetLeft( element2 ) ) {
                        return offsetLeft( element1 ) - offsetLeft( element2 ) - width( element2 );
                    }
                    return offsetLeft( element2 ) - offsetLeft( element1 ) - width( element1 );
                }

                /**
                 * Binds an HTML string to an element using `ng-bind-template`.
                 * This allows the element's inner HTML to be dynamically updated with an expression.
                 * @param {object} element - The AngularJS element.
                 * @param {string} html - The HTML string (possibly containing expressions) to bind.
                 * @returns {object} The element with the `ng-bind-template` attribute applied.
                 */
                function bindHtml( element, html ) {
                    return element.attr( 'ng-bind-template', html );
                }

                /**
                 * Rounds a given value to the nearest step, considering a defined precision, floor, and ceiling.
                 * This function ensures that the value snaps to valid points on the slider.
                 * @param {Number} [value = 0] - The input value to round.
                 * @param {Number} [precision = 0] - The number of decimal places to maintain.
                 * @param {Number} [step = 1/Math.pow(10, precision)] - The size of each step. If 0 or undefined, a default is calculated.
                 * @param {Number} [floor = 0] - The minimum allowed value.
                 * @param {Number} [ceiling] - The maximum allowed value. If undefined, defaults to the rounded value.
                 * @returns {Number} The value rounded to the nearest step and clamped within the floor/ceiling.
                 */
                function roundToStep( value, precision, step, floor, ceiling ) {

                    // Initialize `precision` if not provided or invalid.
                    if ( angular.isUndefined( precision ) || !precision ) {
                        precision = 0;
                    }

                    // Initialize `step` if not provided or invalid.
                    if ( angular.isUndefined( step ) || !step || step == 0 ) {
                        step = 1 / Math.pow( 10, precision );
                    }

                    // Initialize `floor` if not provided or invalid.
                    if ( angular.isUndefined( floor ) || !floor ) {
                        floor = 0;
                    }

                    // Initialize `value` if not provided or invalid.
                    if ( angular.isUndefined( value ) || !value ) {
                        value = 0;
                    }

                    // Calculate the remainder when `value` is divided by `step` (relative to `floor`).
                    var remainder = ( value - floor ) % step;

                    // Round `value` to the nearest `step`.
                    var roundedValue = remainder > ( step / 2 ) ? value + step - remainder : value - remainder;

                    // Initialize `ceiling` if not provided or invalid, defaulting to `roundedValue`.
                    if ( angular.isUndefined( ceiling ) || !ceiling ) {
                        ceiling = roundedValue;
                    }

                    // Ensure the `roundedValue` stays within the `floor` and `ceiling` bounds.
                    roundedValue = Math.min( Math.max( roundedValue, floor ), ceiling );

                    // Return the final value, fixed to the specified precision.
                    return parseFloat( roundedValue.toFixed( precision ) );
                }

                /**
                 * Rounds a given numerical value to the nearest multiple of a specified step.
                 * @param {number} value - The number to round.
                 * @param {number} step - The increment to round to.
                 * @returns {number} The rounded number.
                 */
                function roundTo( value, step ) {
                    return Math.floor( ( value / step ) + 0.5 ) * step;
                }

                /**
                 * Adjusts a buffer value to be an even multiple of the given step, rounding up.
                 * Useful for ensuring minimum gaps align with step increments.
                 * @param {Number} step - The step size.
                 * @param {Number} buffer - The buffer value to adjust.
                 * @returns {Number} The adjusted buffer value.
                 */
                function stepBuffer( step, buffer ) {
                    if ( step > 0 && !isNaN( buffer ) ) {
                        return Math.ceil( buffer / step ) * step;
                    }
                    return buffer;
                }

                /**
                 * Wraps an expression string with the configured AngularJS interpolation symbols.
                 * This prepares a string to be evaluated as an AngularJS expression within a template.
                 * @param {string} exp - The raw expression string (e.g., "value").
                 * @returns {string} The interpolated expression string (e.g., "{{ value }}").
                 */
                function expression( exp ) {
                    return startSymbol + " " + exp + " " + endSymbol;
                }

                return {
                    restrict:   'EA',         // The directive can be used as an Element (`<slider>`) or an Attribute (`<div slider>`).
                    require:    'ngModel',    // Requires `ngModel` to allow two-way data binding to the slider's value(s).
                    scope:      {             // Defines an isolated scope for the directive.
                        floor            	: '@',   // Minimum possible value (read as string attribute).
                        ceiling          	: '@',   // Maximum possible value (read as string attribute).
                        step             	: '@',   // The increment size for values (read as string attribute).
                        stepWidth        	: '@',   // An alias for 'step' to prevent naming conflicts (read as string attribute).
                        precision        	: '@',   // Number of decimal places for values (read as string attribute).
                        buffer           	: '@',   // Minimum distance between knobs in a dual-knob slider (read as string attribute).
                        stickiness       	: '@',   // How much resistance the knobs have to movement (read as string attribute).
                        showSteps        	: '@',   // Boolean flag to display step value bubbles (read as string attribute).
                        ngModel          	: '=',   // Two-way binding for the primary (low) slider value.
                        ngModelRange     	: '=',   // Two-way binding for the secondary (high) slider value, used in dual-knob mode.
                        ngDisabled       	: '=',   // Two-way binding to disable/enable the slider.
                        ngChange         	: '&',   // Callback expression executed when the slider's value changes.
                        translateFn      	: '&',   // Function to translate the displayed value of the primary knob.
                        translateRangeFn   	: '&',   // Function to translate the displayed value of the secondary knob.
                        translateCombinedFn	: '&',   // Function to translate the displayed value for the combined range.
                        scaleFn          	: '&',   // Function to scale numerical values (e.g., for logarithmic scales).
                        inverseScaleFn   	: '&'    // Function to inverse-scale values back (e.g., from logarithmic to linear).
                    },
                    template: // The HTML template for the slider's visual components.
                        "<span class='bar full'></span>" + // Full background bar.
                        "<span class='bar steps'>" +        // Container for step indicator bubbles.
                            "<span class='bubble step' ng-repeat='step in stepBubbles()'></span>" + // Individual step bubble, repeated.
                        "</span>" +
                        "<span class='bar selection'></span>" + // Bar representing the selected range.
                        "<span class='bar unselected low'></span>" + // Unselected portion of the bar to the left of the low knob.
                        "<span class='bar unselected high'></span>" +// Unselected portion of the bar to the right of the high knob.
                        "<span class='pointer low'></span>" +       // The low value slider knob.
                        "<span class='pointer high'></span>" +      // The high value slider knob (for dual-knob).
                        "<span class='bubble low'></span>" +        // Bubble displaying the low value.
                        "<span class='bubble high'></span>" +       // Bubble displaying the high value.
                        "<span class='bubble middle'></span>" +     // Bubble for single-knob value or combined middle value.
                        "<span class='bubble selection'></span>" +  // Bubble displaying the selected range value.
                        "<span class='bubble limit floor'></span>" +// Bubble displaying the minimum limit (floor).
                        "<span class='bubble limit ceiling'></span>" +// Bubble displaying the maximum limit (ceiling).
                        "<input type='range' class='input low' />" + // Hidden HTML5 range input for low value (for browser compatibility/accessibility).
                        "<input type='range' class='input high' />" +// Hidden HTML5 range input for high value.
                        "<input type='range' class='input selection' />", // Hidden HTML5 range input for selection.

                    compile: function( element, attributes ) {
                        // Determine whether to display step bubbles based on the `showSteps` attribute.
                        var showSteps = attributes.showSteps;

                        // Check if `stepWidth` attribute is used; otherwise, default to `step`.
                        var stepWidth = attributes.stepWidth ? 'stepWidth' : 'step';

                        // Check if the slider is configured for two knobs by looking for `ngModelRange`.
                        var isDualKnob = attributes.ngModelRange != null;

                        // Initialize an empty object to store references to internal elements.
                        var refs = {};

                        // Define the names of the model properties for low, high, and selection.
                        var refLow = 'ngModel',
                            refHigh = 'ngModelRange',
                            refSel = 'selectBar';

                        // An array of scope properties to watch for changes that necessitate recalculations or UI updates.
                        var watchables = [ 'floor', 'ceiling', 'stickiness', refLow ];

                        /**
                         * Helper function to get all immediate children of an element and wrap them as AngularJS elements.
                         * @param {object} [el=element] - The parent element whose children are to be retrieved. Defaults to the directive's root element.
                         * @returns {Array<object>} An array of AngularJS-wrapped child elements.
                         */
                        function getReferences( el ) {
                            if ( !el ) {
                                el = element;
                            }
                            var refs = [];
                            angular.forEach( el.children(), function( elChild ) {
                                refs.push( angularize( elChild ) );
                            } );
                            return refs;
                        }

                        // ... (the rest of the compile function would follow here) ...