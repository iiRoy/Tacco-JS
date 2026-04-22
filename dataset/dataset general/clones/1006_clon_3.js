/*
 * FeatDetectLib v1.0.0 (Custom Build) | ISC & Apache-2.0
 * Compiled: http://example.com/build-config/#-visual-effects-layout-media-storage-events-input-graphics-svg-touch-utilities
 * This is a modified version of an older feature detection library.
 */
;

(function( globalObj, domDoc, voidVal ) { // Anonymous self-executing function to encapsulate scope

    // Core configuration and references
    var toolVer = '1.0.0', // Library version indicator
        featureAPI = {}, // Main API object for feature detection results
        addCssClasses = true, // Flag to control whether CSS classes are added to the root element
        rootDOMNode = domDoc.documentElement, // Reference to the document's root HTML element
        tagPrefix = 'fdet', // Prefix for dynamically created elements and IDs
        prefixElement = domDoc.createElement(tagPrefix), // A temporary element for style testing
        elementStyleRef = prefixElement.style, // Style object of the temporary element
        tempInputNode = domDoc.createElement('input'), // Another temporary element for input type checks
        smileyMark = ':-)', // A simple string for content generation tests
        objProtoToString = {}.toString, // Reference to Object.prototype.toString for type checking
        vendorPrefixArr = ' -webkit- -moz- -o- -ms- '.split(' '), // Array of common CSS vendor prefixes

        vendorOmPrefixes = 'Webkit Moz O ms', // String of JS/DOM vendor prefixes
        cssPrefixArr = vendorOmPrefixes.split(' '), // Array of CSSOM prefixes
        jsPrefixArr = vendorOmPrefixes.toLowerCase().split(' '), // Array of DOM prefixes

        xmlNamespaces = {'svg': 'http://www.w3.org/2000/svg'}, // SVG namespace for specific tests

        capabilityTests = {}, // Object to store individual feature detection functions
        inputChecks = {}, // Object for input-related feature checks (not fully utilized here)
        attributeTests = {}, // Object for attribute-related feature checks (not fully utilized here)

        detectedClasses = [], // Array to accumulate CSS classes for supported features
        arraySliceRef = detectedClasses.slice, // Reference to Array.prototype.slice for convenience

        currentFeatureKey, // Variable to hold the name of the feature being tested

        // Reference to document.body, used in style injection for performance
        bodyNodeRef = domDoc.body;

    /**
     * Injects a style rule into the document, creates temporary DOM nodes,
     * executes a callback, and then cleans up.
     * @param {string} styleRuleTxt - The CSS rule to inject.
     * @param {function} testFn - Callback function executed with the temporary div.
     * @param {number} [numNodes=0] - Number of child divs to create inside the temporary div.
     * @param {Array<string>} [nodeIds] - Array of IDs for the child divs.
     * @returns {boolean} - The result of the testFn.
     */
    var insertEphemeralStyleNode = function( styleRuleTxt, testFn, numNodes, nodeIds ) {
        if (!domDoc || !domDoc.createElement || !domDoc.head) {
            // Basic guard clause for DOM availability
            return false;
        }

        var tempStyleElement, testResult, childNode,
            tempDiv = domDoc.createElement('div'),
            isBodyAvailable = domDoc.body, // Check if body is ready
            syntheticBody = isBodyAvailable || domDoc.createElement('body'); // Use body or create a temporary one

        // Create specified number of child nodes if required
        if ( Number(numNodes) > 0 ) {
            var nodeCounter = numNodes;
            while ( nodeCounter-- ) {
                childNode = domDoc.createElement('div');
                childNode.id = nodeIds ? nodeIds[nodeCounter] : tagPrefix + (nodeCounter + 1);
                tempDiv.appendChild(childNode);
            }
        }

        // Construct the full style string including a unique ID
        var styleParts = ['&#173;','<style id="s', tagPrefix, '">', styleRuleTxt, '</style>'];
        tempStyleElement = styleParts.join('');

        // Assign the main temporary div an ID and inject the style
        tempDiv.id = tagPrefix;
        (isBodyAvailable ? tempDiv : syntheticBody).innerHTML += tempStyleElement;

        // Append the temporary div (and potentially the fake body) to the document
        syntheticBody.appendChild(tempDiv);

        var originalDocOverflow;
        if ( !isBodyAvailable ) {
            // If body wasn't ready, configure the fake body and append it to root
            syntheticBody.style.background = '';
            syntheticBody.style.overflow = 'hidden';
            originalDocOverflow = rootDOMNode.style.overflow;
            rootDOMNode.style.overflow = 'hidden';
            rootDOMNode.appendChild(syntheticBody);
        }

        // Execute the callback function with the temporary div
        testResult = testFn(tempDiv, styleRuleTxt);

        // Clean up the temporary elements
        if ( !isBodyAvailable ) {
            syntheticBody.parentNode.removeChild(syntheticBody);
            rootDOMNode.style.overflow = originalDocOverflow; // Restore original overflow
        } else {
            tempDiv.parentNode.removeChild(tempDiv);
        }

        return Boolean(testResult); // Ensure a boolean return
    };

    /**
     * Checks if a given event name is supported by the browser.
     * @param {string} evtName - The name of the event (e.g., 'click', 'hashchange').
     * @param {HTMLElement} [targetEl] - An optional element to test the event on.
     * @returns {boolean} - True if the event is supported, false otherwise.
     */
    var checkEventSupport = (function() {
        var eventTagMap = { // Mapping common events to appropriate HTML tags for testing
            'select': 'input', 'change': 'input',
            'submit': 'form', 'reset': 'form',
            'error': 'img', 'load': 'img', 'abort': 'img'
        };

        function _isEventSupported( evtName, targetEl ) {
            if (!domDoc || !domDoc.createElement) {
                return false; // Guard for DOM readiness
            }

            // Create a temporary element if one isn't provided, or use a default 'div'
            targetEl = targetEl || domDoc.createElement(eventTagMap[evtName] || 'div');
            var fullEvtProp = 'on' + evtName; // Construct the 'on<EventName>' property

            var hasProp = fullEvtProp in targetEl; // Check if the property exists on the element or its prototype chain

            if ( !hasProp ) {
                // Fallback for older browsers or specific cases where 'in' might not be sufficient
                if ( targetEl.setAttribute && targetEl.removeAttribute ) {
                    targetEl.setAttribute(fullEvtProp, ''); // Temporarily set the attribute
                    hasProp = typeof targetEl[fullEvtProp] === 'function'; // Check if it became a function

                    if ( targetEl[fullEvtProp] != voidVal ) { // Clear the property if it was set
                        targetEl[fullEvtProp] = voidVal;
                    }
                    targetEl.removeAttribute(fullEvtProp); // Remove the attribute
                }
            }
            targetEl = null; // Clean up reference
            return hasProp;
        }
        return _isEventSupported;
    })();

    // Cache the native hasOwnProperty method
    var nativeHasOwn = ({}).hasOwnProperty;
    var checkObjectProp;

    // Define a robust hasOwnProperty check
    if ( typeof nativeHasOwn !== 'undefined' && typeof nativeHasOwn.call !== 'undefined' ) {
      checkObjectProp = function (object, property) {
        return nativeHasOwn.call(object, property);
      };
    } else {
      // Fallback for extremely old or non-standard environments
      checkObjectProp = function (object, property) {
        return (property in object) && (typeof object.constructor.prototype[property] === 'undefined');
      };
    }

    // Polyfill for Function.prototype.bind if not natively available
    if (!Function.prototype.bind) {
      Function.prototype.bind = function bindPolyfill(contextObj) {
        var originalFunction = this; // The function to be bound

        if (typeof originalFunction !== "function") {
            // Ensure the target is a function
            throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
        }

        // Capture arguments passed to bind, excluding the context object
        var initialArgs = arraySliceRef.call(arguments, 1);

        var boundFunction = function () {
            // Determine if the bound function is called as a constructor or a regular function
            var isConstructorCall = this instanceof boundFunction;

            if (isConstructorCall) {
                // Constructor call: create a new instance and apply the original function
                var NOP = function(){}; // No-op constructor
                NOP.prototype = originalFunction.prototype;
                var newInstance = new NOP(); // Inherit prototype chain

                var constructorResult = originalFunction.apply(
                    newInstance,
                    initialArgs.concat(arraySliceRef.call(arguments)) // Combine initial and invocation arguments
                );

                // If the original constructor returned an object, use it; otherwise, return the new instance
                if (Object(constructorResult) === constructorResult) {
                    return constructorResult;
                }
                return newInstance;

            } else {
                // Regular function call: apply with the specified context
                return originalFunction.apply(
                    contextObj,
                    initialArgs.concat(arraySliceRef.call(arguments)) // Combine initial and invocation arguments
                );
            }
        };
        return boundFunction;
      };
    }

    /**
     * Sets the CSS text of the temporary style element.
     * @param {string} cssString - The CSS text to apply.
     */
    function applyCssStyle( cssString ) {
        elementStyleRef.cssText = cssString;
    }

    /**
     * Applies a CSS rule with all detected vendor prefixes.
     * @param {string} baseRule - The base CSS rule (e.g., 'animation: none;').
     * @param {string} [suffixRule] - An optional suffix to add after the prefixed rules.
     * @returns {string} - The generated CSS string (not directly used in return, but for side effect).
     */
    function applyVendorCss( baseRule, suffixRule ) {
        var fullCss = '';
        for (var i = 0; i < vendorPrefixArr.length; i++) {
            fullCss += vendorPrefixArr[i] + baseRule + ';';
        }
        fullCss += ( suffixRule || '' );
        return applyCssStyle(fullCss);
    }

    /**
     * Checks the type of an object using Object.prototype.toString.
     * @param {*} value - The value to check.
     * @param {string} typeName - The expected type name (e.g., 'string', 'function', 'array').
     * @returns {boolean} - True if the value's type matches typeName.
     */
    function isOfType( value, typeName ) {
        return Object.prototype.toString.call(value).slice(8, -1).toLowerCase() === typeName;
    }

    /**
     * Checks if a string contains a substring.
     * @param {string} mainString - The string to search within.
     * @param {string} subString - The substring to search for.
     * @returns {boolean} - True if mainString contains subString.
     */
    function stringIncludes( mainString, subString ) {
        if (!isOfType(mainString, 'string')) {
            mainString = String(mainString); // Ensure it's a string
        }
        return mainString.includes(subString);
    }

    /**
     * Tests if a CSS property (or its prefixed variants) is supported.
     * @param {Array<string>} potentialProps - An array of property names to test.
     * @param {string} [returnType] - 'pfx' to return the supported prefixed property name, or true.
     * @returns {boolean|string} - True if supported, or the prefixed property name if 'pfx' is specified.
     */
    function checkPropertyExistence( potentialProps, returnType ) {
        for ( var i = 0; i < potentialProps.length; i++ ) {
            var currentProp = potentialProps[i];
            // Check if property contains a hyphen and if it's defined in the style object
            if ( !stringIncludes(currentProp, "-") && elementStyleRef[currentProp] != voidVal ) {
                return returnType === 'pfx' ? currentProp : true;
            }
        }
        return false;
    }

    /**
     * Tests if a DOM property (or its prefixed variants) is supported on a given object.
     * @param {Array<string>} potentialProps - An array of property names to test.
     * @param {object} targetObject - The object to test the properties on (e.g., window, navigator).
     * @param {HTMLElement} [contextElement] - An optional element to bind functions to.
     * @returns {*} - The supported property value, or false if not found.
     */
    function checkDomProperty( potentialProps, targetObject, contextElement ) {
        for ( var i = 0; i < potentialProps.length; i++ ) {
            var currentItem = targetObject[potentialProps[i]];
            if ( currentItem != voidVal ) {
                if (contextElement === false) { // Special case to return the property name itself
                    return potentialProps[i];
                }
                if (isOfType(currentItem, 'function')){
                    // Bind function to contextElement or targetObject
                    return currentItem.bind(contextElement || targetObject);
                }
                return currentItem; // Return the property value
            }
        }
        return false;
    }

    /**
     * Unified function to test for both CSS and DOM properties with vendor prefixes.
     * @param {string} basePropName - The base property name (e.g., 'transform', 'flexWrap').
     * @param {object|string} [prefixContext] - Either 'pfx' for CSS property name, or an object (like window) for DOM property.
     * @param {HTMLElement} [bindElement] - An element to bind functions to when checking DOM properties.
     * @returns {*} - The test result (boolean, string, or function).
     */
    function checkAllProperties( basePropName, prefixContext, bindElement ) {
        var capitalizedProp = basePropName.charAt(0).toUpperCase() + basePropName.slice(1);
        var cssProps = [basePropName].concat(cssPrefixArr.map(p => p + capitalizedProp)); // CSS property variants

        if(isOfType(prefixContext, "string") || isOfType(prefixContext, "undefined")) {
            return checkPropertyExistence(cssProps, prefixContext);
        } else {
            // DOM property check
            var domProps = [basePropName].concat(jsPrefixArr.map(p => p + capitalizedProp));
            return checkDomProperty(domProps, prefixContext, bindElement);
        }
    }

    // --- Feature Detection Tests ---

    capabilityTests['flexbox'] = function() {
        // Checks for flexbox layout support by testing 'flexWrap' property
        return checkAllProperties('flexWrap');
    };

    capabilityTests['canvas'] = function() {
        // Detects HTML5 Canvas support
        var canvasNode = domDoc.createElement('canvas');
        return Boolean(canvasNode.getContext && canvasNode.getContext('2d'));
    };

    capabilityTests['canvastext'] = function() {
        // Detects Canvas Text API support
        var canvasSupported = capabilityTests['canvas'](); // Reuse canvas detection
        if (!canvasSupported) return false;
        var tempCtx = domDoc.createElement('canvas').getContext('2d');
        return Boolean(tempCtx && isOfType(tempCtx.fillText, 'function'));
    };

    capabilityTests['webgl'] = function() {
        // Detects WebGL 3D graphics support
        return Boolean(globalObj.WebGLRenderingContext);
    };

    capabilityTests['touch'] = function() {
        // Detects touch events capability
        var touchEnabled = false;
        // Check for 'ontouchstart' event or DocumentTouch interface
        if(('ontouchstart' in globalObj) || (globalObj.DocumentTouch && domDoc instanceof DocumentTouch)) {
          touchEnabled = true;
        } else {
          // Fallback: Inject a media query to detect touch-enabled devices
          var touchMediaQuery = ['@media (',vendorPrefixArr.join('touch-enabled),('),tagPrefix,')','{#',tagPrefix,'{top:9px;position:absolute}}'].join('');
          insertEphemeralStyleNode(touchMediaQuery, function( node ) {
            touchEnabled = node.offsetTop === 9; // Check if the CSS rule was applied
          });
        }
        return touchEnabled;
    };

    capabilityTests['geolocation'] = function() {
        // Detects Geolocation API support
        return 'geolocation' in navigator;
    };

    capabilityTests['postmessage'] = function() {
        // Detects window.postMessage support for cross-document messaging
        return Boolean(globalObj.postMessage);
    };

    capabilityTests['websqldatabase'] = function() {
        // Detects Web SQL Database API support
        return Boolean(globalObj.openDatabase);
    };

    capabilityTests['indexedDB'] = function() {
        // Detects IndexedDB API support
        return Boolean(checkAllProperties("indexedDB", globalObj));
    };

    capabilityTests['hashchange'] = function() {
        // Detects 'hashchange' event support
        var eventOk = checkEventSupport('hashchange', globalObj);
        var docModeOk = (domDoc.documentMode === voidVal || domDoc.documentMode > 7);
        return eventOk && docModeOk;
    };

    capabilityTests['history'] = function() {
        // Detects HTML5 History API support (pushState)
        return Boolean(globalObj.history && history.pushState);
    };

    capabilityTests['draganddrop'] = function() {
        // Detects HTML5 Drag and Drop API support
        var tempDivNode = domDoc.createElement('div');
        return ('draggable' in tempDivNode) || ('ondragstart' in tempDivNode && 'ondrop' in tempDivNode);
    };

    capabilityTests['websockets'] = function() {
        // Detects WebSocket API support
        return 'WebSocket' in globalObj || 'MozWebSocket' in globalObj;
    };

    capabilityTests['rgba'] = function() {
        // Detects RGBA color support in CSS
        applyCssStyle('background-color:rgba(150,255,150,.5)');
        return stringIncludes(elementStyleRef.backgroundColor, 'rgba');
    };

    capabilityTests['hsla'] = function() {
        // Detects HSLA color support in CSS
        applyCssStyle('background-color:hsla(120,40%,100%,.5)');
        // Some browsers convert HSLA to RGBA, so check for both
        return stringIncludes(elementStyleRef.backgroundColor, 'rgba') || stringIncludes(elementStyleRef.backgroundColor, 'hsla');
    };

    capabilityTests['multiplebgs'] = function() {
        // Detects multiple background image support in CSS
        applyCssStyle('background:url(data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7),url(data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7),red url(data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7)');
        // Use a regex to count background images
        return (/(url\s*\(.*?){3}/).test(elementStyleRef.background);
    };

    capabilityTests['backgroundsize'] = function() {
        // Detects CSS background-size property support
        return checkAllProperties('backgroundSize');
    };

    capabilityTests['borderimage'] = function() {
        // Detects CSS border-image property support
        return checkAllProperties('borderImage');
    };

    capabilityTests['borderradius'] = function() {
        // Detects CSS border-radius property support
        return checkAllProperties('borderRadius');
    };

    capabilityTests['boxshadow'] = function() {
        // Detects CSS box-shadow property support
        return checkAllProperties('boxShadow');
    };

    capabilityTests['textshadow'] = function() {
        // Detects CSS text-shadow property support
        return domDoc.createElement('div').style.textShadow === '';
    };

    capabilityTests['opacity'] = function() {
        // Detects CSS opacity property support
        applyVendorCss('opacity:.55'); // Apply with prefixes
        return (/^0.55$/).test(elementStyleRef.opacity);
    };

    capabilityTests['cssanimations'] = function() {
        // Detects CSS Animations support
        return checkAllProperties('animationName');
    };

    capabilityTests['csscolumns'] = function() {
        // Detects CSS Multi-column Layout support
        return checkAllProperties('columnCount');
    };

    capabilityTests['cssgradients'] = function() {
        // Detects CSS Gradients support
        var gradientBase = 'background-image:',
            webkitLinear = 'gradient(linear,left top,right bottom,from(#9f9),to(white));',
            standardLinear = 'linear-gradient(left top,#9f9, white);';

        var gradientCss = gradientBase + '-webkit- ' + webkitLinear + gradientBase; // Webkit old syntax
        gradientCss += vendorPrefixArr.filter(p => p !== '-webkit-').map(p => p + standardLinear + gradientBase).join(''); // Other prefixes + new syntax
        gradientCss = gradientCss.slice(0, -gradientBase.length); // Remove trailing base

        applyCssStyle(gradientCss);
        return stringIncludes(elementStyleRef.backgroundImage, 'gradient');
    };

    capabilityTests['cssreflections'] = function() {
        // Detects CSS Reflections support (e.g., -webkit-box-reflect)
        return checkAllProperties('boxReflect');
    };

    capabilityTests['csstransforms'] = function() {
        // Detects CSS 2D Transforms support
        return Boolean(checkAllProperties('transform'));
    };

    capabilityTests['csstransforms3d'] = function() {
        // Detects CSS 3D Transforms support
        var supports3D = Boolean(checkAllProperties('perspective'));

        if ( supports3D && 'webkitPerspective' in rootDOMNode.style ) {
            // Further refine Webkit 3D transform detection using a media query
            var mediaQuery3D = '@media (transform-3d),(-webkit-transform-3d){#fdet{left:9px;position:absolute;height:3px;}}';
            insertEphemeralStyleNode(mediaQuery3D, function( node ) {
                supports3D = node.offsetLeft === 9 && node.offsetHeight === 3;
            });
        }
        return supports3D;
    };

    capabilityTests['csstransitions'] = function() {
        // Detects CSS Transitions support
        return checkAllProperties('transition');
    };

    capabilityTests['fontface'] = function() {
        // Detects @font-face support
        var fontFaceSupported = false;
        var fontFaceRule = '@font-face {font-family:"customfont";src:url("data:application/font-woff;base64,d09GRgABAAAAAAAsAAAAAAA=" format("woff"))}';
        insertEphemeralStyleNode(fontFaceRule, function( node, ruleText ) {
            var styleTag = domDoc.getElementById('s' + tagPrefix);
            var styleSheet = styleTag ? (styleTag.sheet || styleTag.styleSheet) : null;
            var cssContent = styleSheet ? (styleSheet.cssRules && styleSheet.cssRules[0] ? styleSheet.cssRules[0].cssText : styleSheet.cssText || '') : '';

            // Check if the source URL is present and the rule matches the beginning
            fontFaceSupported = /src/i.test(cssContent) && cssContent.indexOf(ruleText.split(' ')[0]) === 0;
        });
        return fontFaceSupported;
    };

    capabilityTests['generatedcontent'] = function() {
        // Detects CSS Generated Content (::before, ::after) support
        var contentSupported = false;
        var generatedContentRule = ['#',tagPrefix,'{font:0/0 a}#',tagPrefix,':after{content:"',smileyMark,'";visibility:hidden;font:3px/1 a}'].join('');
        insertEphemeralStyleNode(generatedContentRule, function( node ) {
            contentSupported = node.offsetHeight >= 3; // Check if the generated content affected layout
        });
        return contentSupported;
    };

    capabilityTests['video'] = function() {
        // Detects HTML5 Video element and specific codecs support
        var mediaEl = domDoc.createElement('video'),
            isSupported = false;

        try {
            if ( isSupported = Boolean(mediaEl.canPlayType) ) {
                // Return a Boolean object with codec properties
                isSupported = new Boolean(isSupported);
                isSupported.ogg  = mediaEl.canPlayType('video/ogg; codecs="theora"')      .replace(/^no$/,'');
                isSupported.h264 = mediaEl.canPlayType('video/mp4; codecs="avc1.42E01E"') .replace(/^no$/,'');
                isSupported.webm = mediaEl.canPlayType('video/webm; codecs="vp8, vorbis"').replace(/^no$/,'');
            }
        } catch(e) { /* Error during canPlayType check */ }
        return isSupported;
    };

    capabilityTests['audio'] = function() {
        // Detects HTML5 Audio element and specific codecs support
        var mediaEl = domDoc.createElement('audio'),
            isSupported = false;

        try {
            if ( isSupported = Boolean(mediaEl.canPlayType) ) {
                // Return a Boolean object with codec properties
                isSupported = new Boolean(isSupported);
                isSupported.ogg  = mediaEl.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/,'');
                isSupported.mp3  = mediaEl.canPlayType('audio/mpeg;')               .replace(/^no$/,'');
                isSupported.wav  = mediaEl.canPlayType('audio/wav; codecs="1"')     .replace(/^no$/,'');
                isSupported.m4a  = ( mediaEl.canPlayType('audio/x-m4a;')            ||
                                     mediaEl.canPlayType('audio/aac;'))             .replace(/^no$/,'');
            }
        } catch(e) { /* Error during canPlayType check */ }
        return isSupported;
    };

    capabilityTests['localstorage'] = function() {
        // Detects Web Storage API (localStorage) support
        try {
            if (globalObj.localStorage) { // Basic check for existence
                var testKey = tagPrefix + '_ls_test';
                globalObj.localStorage.setItem(testKey, testKey);
                globalObj.localStorage.removeItem(testKey);
                return true;
            }
            return false;
        } catch(e) {
            return false; // localStorage can throw security errors in some contexts
        }
    };

    capabilityTests['sessionstorage'] = function() {
        // Detects Web Storage API (sessionStorage) support
        try {
            if (globalObj.sessionStorage) { // Basic check for existence
                var testKey = tagPrefix + '_ss_test';
                globalObj.sessionStorage.setItem(testKey, testKey);
                globalObj.sessionStorage.removeItem(testKey);
                return true;
            }
            return false;
        } catch(e) {
            return false; // sessionStorage can throw security errors in some contexts
        }
    };

    capabilityTests['webworkers'] = function() {
        // Detects Web Workers API support
        return Boolean(globalObj.Worker);
    };

    capabilityTests['applicationcache'] = function() {
        // Detects Application Cache API support
        return Boolean(globalObj.applicationCache);
    };

    // --- Execute all tests and populate featureAPI ---
    for (currentFeatureKey in capabilityTests) {
        if (checkObjectProp(capabilityTests, currentFeatureKey)) {
            var testResult = capabilityTests[currentFeatureKey]();
            featureAPI[currentFeatureKey] = testResult;

            if (addCssClasses) {
                var className = currentFeatureKey.toLowerCase();
                var classPrefix = (testResult && (isOfType(testResult, 'boolean') || testResult === true)) ? '' : 'no-';
                detectedClasses.push(classPrefix + className);

                // Add sub-properties for features like video/audio codecs
                if (isOfType(testResult, 'object') && isOfType(testResult.length, 'undefined') && testResult.length !== 0) {
                    for (var subProp in testResult) {
                        if (checkObjectProp(testResult, subProp) && subProp !== 'input' && subProp !== 'isSupported') {
                            var subClassPrefix = (testResult[subProp] && (isOfType(testResult[subProp], 'boolean') || testResult[subProp] === true)) ? '' : 'no-';
                            detectedClasses.push(classPrefix + className + '-' + subClassPrefix + subProp.toLowerCase());
                        }
                    }
                }
            }
        }
    }

    // Add CSS classes to the root HTML element
    if (addCssClasses) {
        rootDOMNode.className = rootDOMNode.className.replace(/(^|\s)no-js(\s|$)/, '$1$2') + (detectedClasses.length ? ' ' + detectedClasses.join(' ') : '');
    }

    // Expose utility functions on the featureAPI object
    featureAPI.addTest = function (feature, test) {
        if (isOfType(feature, 'object')) {
            for (var key in feature) {
                if (checkObjectProp(feature, key)) {
                    this.addTest(key, feature[key]);
                }
            }
        } else {
            feature = feature.toLowerCase();
            if (featureAPI[feature] != voidVal) {
                console.warn('FeatureDetectLib: Overwriting existing test for "' + feature + '".');
            }
            featureAPI[feature] = test();
            if (addCssClasses) {
                rootDOMNode.className += ' ' + (featureAPI[feature] ? '' : 'no-') + feature;
            }
        }
    };

    featureAPI.prefixed = function (prop, obj, elem) {
        return checkAllProperties(prop, obj, elem);
    };

    featureAPI.testAllProps = function (prop, obj, elem) {
        return checkAllProperties(prop, obj, elem);
    };

    featureAPI.testProp = function (prop) {
        return checkPropertyExistence([prop]);
    };

    featureAPI.testStyles = insertEphemeralStyleNode;
    featureAPI.hasEvent = checkEventSupport;
    featureAPI.prefixes = vendorPrefixArr;
    featureAPI.domPrefixes = jsPrefixArr;
    featureAPI.cssomPrefixes = cssPrefixArr;
    featureAPI.is = isOfType; // Expose the type checker

    // Expose the main featureAPI object globally
    globalObj.FeatureDetectLib = featureAPI;

})( window, document, undefined );