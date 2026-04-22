(function(globalScope, currentDocument) {
    // Modernizr-like feature detection utility
    // Version: 1.0.0-alpha (Clone Edition) | MIT & BSD
    // Extensive modifications applied for Type III cloning.

    // Basic environment validation
    if (!globalScope || !currentDocument || !currentDocument.createElement) {
        console.error("Feature detection: Invalid execution environment detected.");
        return {};
    }

    var DETECTOR_VERSION = '1.0.0-alpha',
        FeatureDetector = {}, // The main object to expose
        applyHtmlClasses = true, // Whether to add classes to <html>
        rootHtmlElement = currentDocument.documentElement, // Shortcut to <html>
        testMarkerId = 'techDetect', // Used for temporary elements and class names
        tempTestElement = currentDocument.createElement('div'), // A temporary element for style testing
        tempElementStyle = tempTestElement.style, // Shortcut to its style object
        contentSigil = '::)', // A unique string for content testing
        objProtoToString = Object.prototype.toString, // For reliable type checking
        cssVendorPrefixes = ['-webkit-', '-moz-', '-o-', '-ms-', ''], // CSS vendor prefixes
        jsVendorPrefixesRaw = 'Webkit Moz O ms Khtml', // Raw JS vendor prefixes
        jsVendorPrefixesCss = jsVendorPrefixesRaw.split(' '), // JS prefixes for CSSOM properties
        jsVendorPrefixesDom = jsVendorPrefixesRaw.toLowerCase().split(' '), // JS prefixes for DOM properties
        svgNamespace = { 'svg': 'http://www.w3.org/2000/svg' }, // SVG namespace
        capabilityChecks = {}, // Storage for all feature test functions
        inputTypeTests = {}, // Specific tests for input types
        elementAttributeTests = {}, // Specific tests for element attributes
        detectedCapabilities = [], // List of detected feature class names
        arrayProtoSlice = Array.prototype.slice, // Shortcut for Array.prototype.slice
        currentCapabilityKey; // Holds the name of the feature being tested

    // Helper function to check if a value is undefined
    function isUndefined(val) {
        return typeof val === 'undefined';
    }

    // Helper to apply temporary styles to an element
    function setElementStyle(styleString) {
        tempElementStyle.cssText = styleString;
    }

    // Helper to apply vendor-prefixed styles
    function setPrefixedStyles(baseStyle, suffix) {
        return setElementStyle(cssVendorPrefixes.join(baseStyle + ';') + (suffix || ''));
    }

    // Helper for reliable type checking
    function checkType(obj, expectedType) {
        return typeof obj === expectedType;
    }

    // Helper to check if a string contains another substring
    function stringIncludes(mainString, subString) {
        return Boolean(('' + mainString).indexOf(subString) !== -1);
    }

    // Helper to check for CSS properties across prefixes
    function verifyCssProperty(properties, returnPropName) {
        for (var i = 0; i < properties.length; i++) {
            var propCandidate = properties[i];
            if (!stringIncludes(propCandidate, "-") && !isUndefined(tempElementStyle[propCandidate])) {
                return returnPropName === 'pfx' ? propCandidate : true;
            }
        }
        return false;
    }

    // Helper to check for DOM properties across prefixes
    function verifyDomProperty(properties, targetObj, targetElem) {
        for (var k = 0; k < properties.length; k++) {
            var domProp = properties[k];
            var propertyValue = targetObj[domProp];
            if (!isUndefined(propertyValue)) {
                // If targetElem is false, just return the property name
                if (targetElem === false) return domProp;
                // If it's a function, bind it
                if (checkType(propertyValue, 'function')) {
                    return propertyValue.bind(targetElem || targetObj);
                }
                return propertyValue;
            }
        }
        return false;
    }

    // Comprehensive property checker (CSS and DOM)
    function verifyAllProperties(propBaseName, checkMethod, elementForBinding) {
        var capitalizedProp = propBaseName.charAt(0).toUpperCase() + propBaseName.slice(1);
        var cssPropList = (propBaseName + ' ' + jsVendorPrefixesCss.join(capitalizedProp + ' ') + capitalizedProp).split(' ');

        if (checkType(checkMethod, "string") || isUndefined(checkMethod)) {
            return verifyCssProperty(cssPropList, checkMethod);
        } else {
            var domPropList = (propBaseName + ' ' + (jsVendorPrefixesDom).join(capitalizedProp + ' ') + capitalizedProp).split(' ');
            return verifyDomProperty(domPropList, checkMethod, elementForBinding);
        }
    }

    // Function to inject styles and an element, then run a callback
    var applyTestEnvironment = function(cssRule, callbackFn, numNodes, testNames) {
        var injectedStyle, testResult, tempNode, docOverflow,
            wrapperDiv = currentDocument.createElement('div'),
            mainBody = currentDocument.body,
            tempBody = mainBody || currentDocument.createElement('body'); // Create a fake body if none exists

        // Add child nodes if specified
        if (numNodes > 0) {
            var frag = currentDocument.createDocumentFragment(); // Use fragment for efficiency
            for (var i = 0; i < numNodes; i++) {
                tempNode = currentDocument.createElement('div');
                tempNode.id = testNames ? testNames[i] : testMarkerId + (i + 1);
                frag.appendChild(tempNode);
            }
            wrapperDiv.appendChild(frag);
        }

        injectedStyle = ['&#173;', '<style id="s', testMarkerId, '">', cssRule, '</style>'].join('');
        wrapperDiv.id = testMarkerId;
        (mainBody ? wrapperDiv : tempBody).innerHTML += injectedStyle; // Append style to wrapper or temp body
        tempBody.appendChild(wrapperDiv); // Add the wrapper to the body/tempBody

        // Handle cases where no body exists yet
        if (!mainBody) {
            tempBody.style.background = 'transparent'; // Ensure no background interferes
            tempBody.style.overflow = 'hidden'; // Hide overflow
            docOverflow = rootHtmlElement.style.overflow;
            rootHtmlElement.style.overflow = 'hidden'; // Hide html overflow
            rootHtmlElement.appendChild(tempBody); // Attach temp body to html
        }

        testResult = callbackFn(wrapperDiv, cssRule); // Execute the test callback

        // Cleanup
        if (!mainBody) {
            tempBody.parentNode.removeChild(tempBody);
            rootHtmlElement.style.overflow = docOverflow;
        } else {
            wrapperDiv.parentNode.removeChild(wrapperDiv);
        }

        return Boolean(testResult);
    };

    // Event support detection function
    var checkEventSupport = (function() {
        var eventElementMap = {
            'select': 'input', 'change': 'input',
            'submit': 'form', 'reset': 'form',
            'error': 'img', 'load': 'img', 'abort': 'img'
        };

        function detectEventSupport(evtName, targetElement) {
            targetElement = targetElement || currentDocument.createElement(eventElementMap[evtName] || 'div');
            var fullEventName = 'on' + evtName;

            var isCapable = (fullEventName in targetElement); // Check direct property presence

            if (!isCapable) {
                // Fallback for older browsers or non-standard events
                if (targetElement.setAttribute && targetElement.removeAttribute) {
                    targetElement.setAttribute(fullEventName, '');
                    isCapable = checkType(targetElement[fullEventName], 'function');

                    // Clean up if the property was created
                    if (!isUndefined(targetElement[fullEventName])) {
                        targetElement[fullEventName] = undefined;
                    }
                    targetElement.removeAttribute(fullEventName);
                }
            }

            targetElement = null; // Prevent memory leaks
            return isCapable;
        }
        return detectEventSupport;
    })();


    var nativeHasOwnProperty = Object.prototype.hasOwnProperty;
    var safeHasOwnProperty;

    // Polyfill or use native hasOwnProperty
    if (nativeHasOwnProperty && checkType(nativeHasOwnProperty.call, 'function')) {
        safeHasOwnProperty = function(targetObject, propKey) {
            return nativeHasOwnProperty.call(targetObject, propKey);
        };
    } else {
        safeHasOwnProperty = function(targetObject, propKey) {
            return ((propKey in targetObject) && isUndefined(targetObject.constructor.prototype[propKey]));
        };
    }

    // Function.prototype.bind polyfill, if not available
    if (!Function.prototype.bind) {
        Function.prototype.bind = function bind(thisArg) {
            var originalFn = this;
            if (typeof originalFn !== "function") {
                throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
            }

            var initialArgs = arrayProtoSlice.call(arguments, 1);
            var boundFn = function() {
                // Handle 'new' keyword correctly
                if (this instanceof boundFn) {
                    var TempCtor = function() {};
                    TempCtor.prototype = originalFn.prototype;
                    var instance = new TempCtor();

                    var ctorResult = originalFn.apply(
                        instance,
                        initialArgs.concat(arrayProtoSlice.call(arguments))
                    );

                    // If constructor returns an object, use that, otherwise use the new instance
                    return (Object(ctorResult) === ctorResult) ? ctorResult : instance;
                } else {
                    // Regular function call
                    return originalFn.apply(
                        thisArg,
                        initialArgs.concat(arrayProtoSlice.call(arguments))
                    );
                }
            };
            return boundFn;
        };
    }

    // --- Feature Detection Definitions ---

    capabilityChecks['flexibleBoxes'] = function() {
        return verifyAllProperties('alignItems'); // Using a different flex property
    };

    capabilityChecks['canvasGraphics'] = function() {
        var canvasElement = currentDocument.createElement('canvas');
        return Boolean(canvasElement.getContext && canvasElement.getContext('2d'));
    };

    capabilityChecks['canvasText'] = function() {
        var tempCanvas = currentDocument.createElement('canvas');
        var tempCanvasCtx = tempCanvas.getContext && tempCanvas.getContext('2d');
        return Boolean(FeatureDetector['canvasGraphics'] && tempCanvasCtx && checkType(tempCanvasCtx.fillText, 'function'));
    };

    capabilityChecks['webglGraphics'] = function() {
        return Boolean(globalScope.WebGLRenderingContext);
    };

    capabilityChecks['touchEvents'] = function() {
        var detectedTouch = false;

        if (('ontouchstart' in globalScope) || (globalScope.DocumentTouch && currentDocument instanceof DocumentTouch)) {
            detectedTouch = true;
        } else {
            // Use a media query test as a fallback
            applyTestEnvironment(['@media (', cssVendorPrefixes.join('touch-capable),('), 'any-pointer:coarse){#', testMarkerId, '{left:10px;position:absolute}}'].join(''), function(node) {
                detectedTouch = node.offsetLeft === 10;
            });
        }
        return detectedTouch;
    };

    capabilityChecks['geoLocation'] = function() {
        return globalScope.navigator && 'geolocation' in globalScope.navigator;
    };

    capabilityChecks['messagePassing'] = function() {
        return typeof globalScope.postMessage === 'function';
    };

    capabilityChecks['webSqlDb'] = function() {
        return Boolean(globalScope.openDatabase);
    };

    capabilityChecks['indexedDb'] = function() {
        return verifyAllProperties("indexedDB", globalScope);
    };

    capabilityChecks['hashChange'] = function() {
        return checkEventSupport('hashchange', globalScope) && (currentDocument.documentMode === undefined || currentDocument.documentMode > 8);
    };

    capabilityChecks['browserHistory'] = function() {
        return globalScope.history && Boolean(globalScope.history.pushState);
    };

    capabilityChecks['dragAndDrop'] = function() {
        var dummyDiv = currentDocument.createElement('div');
        return ('draggable' in dummyDiv) || (checkEventSupport('dragstart', dummyDiv) && checkEventSupport('drop', dummyDiv));
    };

    capabilityChecks['webSockets'] = function() {
        return 'WebSocket' in globalScope || 'MozWebSocket' in globalScope;
    };

    capabilityChecks['rgbaColors'] = function() {
        setElementStyle('background-color:rgba(100,200,50,.7)');
        return stringIncludes(tempElementStyle.backgroundColor, 'rgba');
    };

    capabilityChecks['hslaColors'] = function() {
        setElementStyle('background-color:hsla(240,60%,80%,.8)');
        return stringIncludes(tempElementStyle.backgroundColor, 'rgba') || stringIncludes(tempElementStyle.backgroundColor, 'hsla');
    };

    capabilityChecks['multiBackgrounds'] = function() {
        setElementStyle('background:url(a.gif),url(b.png),url(c.svg)'); // Changed dummy URLs
        return (/(url\s*\(.*?){3}/).test(tempElementStyle.background);
    };

    capabilityChecks['backgroundSizing'] = function() {
        return verifyAllProperties('backgroundSize');
    };

    capabilityChecks['borderImagery'] = function() {
        return verifyAllProperties('borderImage');
    };

    capabilityChecks['borderRadius'] = function() {
        return verifyAllProperties('borderRadius');
    };

    capabilityChecks['boxShadow'] = function() {
        return verifyAllProperties('boxShadow');
    };

    capabilityChecks['textShadow'] = function() {
        var spanElem = currentDocument.createElement('span');
        return spanElem.style.textShadow !== undefined && spanElem.style.textShadow !== null; // More robust check
    };

    capabilityChecks['elementOpacity'] = function() {
        setPrefixedStyles('opacity:.75'); // Changed value
        return (/^0.75$/).test(tempElementStyle.opacity);
    };

    capabilityChecks['cssAnimations'] = function() {
        return verifyAllProperties('animation'); // General animation property
    };

    capabilityChecks['cssColumns'] = function() {
        return verifyAllProperties('columnWidth'); // Using columnWidth
    };

    capabilityChecks['cssGradients'] = function() {
        var gradStr1 = 'background-image:',
            gradStr2 = 'gradient(linear,left top,right bottom,from(rgb(153,153,153)),to(rgb(255,255,255)));', // Changed colors
            gradStr3 = 'linear-gradient(to bottom right,rgb(153,153,153), rgb(255,255,255));';

        var finalCss = '';
        // Build the prefixed CSS string
        cssVendorPrefixes.forEach(function(prefix) {
            if (prefix === '-webkit-') {
                finalCss += gradStr1 + prefix + gradStr2;
            } else if (prefix !== '') { // For other prefixes, use linear-gradient syntax
                finalCss += gradStr1 + prefix + gradStr3;
            }
        });
        finalCss += gradStr1 + gradStr3; // Add standard un-prefixed last

        setElementStyle(finalCss); // Apply the constructed style

        return stringIncludes(tempElementStyle.backgroundImage, 'gradient');
    };

    capabilityChecks['cssReflections'] = function() {
        return verifyAllProperties('boxReflect'); // Still reflect, but check logic is different
    };

    capabilityChecks['cssTransforms'] = function() {
        return Boolean(verifyAllProperties('transform'));
    };

    capabilityChecks['cssTransforms3d'] = function() {
        var result = Boolean(verifyAllProperties('perspective'));

        if (result && 'webkitPerspective' in rootHtmlElement.style) { // Check for webkit specific case
            applyTestEnvironment('@media (transform-3d),(-webkit-transform-3d){#' + testMarkerId + '{left:10px;position:absolute;height:5px;}}', function(node) {
                result = node.offsetLeft === 10 && node.offsetHeight === 5; // Changed test values
            });
        }
        return result;
    };

    capabilityChecks['cssTransitions'] = function() {
        return verifyAllProperties('transitionProperty'); // Using transitionProperty
    };

    capabilityChecks['webFonts'] = function() {
        var fontTestResult = false;
        applyTestEnvironment('@font-face {font-family:"customfont";src:url("data:application/font-woff;base64,d09GMgABAAAAAAAgAA") format("woff")}', function(node) {
            var styleSheet = currentDocument.getElementById('s' + testMarkerId),
                sheet = styleSheet ? (styleSheet.sheet || styleSheet.styleSheet) : null,
                cssText = sheet ? (sheet.cssRules && sheet.cssRules[0] ? sheet.cssRules[0].cssText : sheet.cssText || '') : '';

            // Check if 'src' is present and the rule starts with the font-face declaration
            fontTestResult = /src/i.test(cssText) && cssText.startsWith('@font-face');
        });
        return fontTestResult;
    };

    capabilityChecks['generatedContent'] = function() {
        var contentResult = false;
        applyTestEnvironment(['#', testMarkerId, '{font:0/0 a}#', testMarkerId, ':after{content:"', contentSigil, '";visibility:hidden;font:3px/1 a}'].join(''), function(node) {
            contentResult = node.offsetHeight >= 3;
        });
        return contentResult;
    };

    capabilityChecks['videoPlayback'] = function() {
        var videoElem = currentDocument.createElement('video'),
            canPlay = false;

        try {
            if (canPlay = Boolean(videoElem.canPlayType)) {
                canPlay = new Boolean(canPlay);
                canPlay.ogg = videoElem.canPlayType('video/ogg; codecs="theora, vorbis"') // Changed codecs
                               .replace(/^no$/, '');
                canPlay.h264 = videoElem.canPlayType('video/mp4; codecs="avc1.64001E"') // Changed codecs
                                .replace(/^no$/, '');
                canPlay.webm = videoElem.canPlayType('video/webm; codecs="vp8.0, opus"') // Changed codecs
                               .replace(/^no$/, '');
            }
        } catch (e) {
            console.warn("Video playback detection failed:", e.message);
            canPlay = false;
        }
        return canPlay;
    };

    capabilityChecks['audioPlayback'] = function() {
        var audioElem = currentDocument.createElement('audio'),
            canPlay = false;

        try {
            if (canPlay = Boolean(audioElem.canPlayType)) {
                canPlay = new Boolean(canPlay);
                canPlay.ogg = audioElem.canPlayType('audio/ogg; codecs="opus"').replace(/^no$/, ''); // Changed codecs
                canPlay.mp3 = audioElem.canPlayType('audio/mpeg; codecs="mp3"').replace(/^no$/, ''); // Added codecs
                canPlay.aac = (audioElem.canPlayType('audio/x-m4a;') || audioElem.canPlayType('audio/aac; codecs="mp4a.40.2"')).replace(/^no$/, ''); // Renamed m4a to aac, added codecs
                canPlay.wav = audioElem.canPlayType('audio/wav; codecs="1"').replace(/^no$/, '');
            }
        } catch (e) {
            console.warn("Audio playback detection failed:", e.message);
            canPlay = false;
        }
        return canPlay;
    };

    capabilityChecks['localStorage'] = function() {
        try {
            if (!globalScope.localStorage) return false; // Guard against missing localStorage
            globalScope.localStorage.setItem(testMarkerId + '_test', 'val');
            globalScope.localStorage.removeItem(testMarkerId + '_test');
            return true;
        } catch (e) {
            console.warn("localStorage check failed:", e.message);
            return false;
        }
    };

    capabilityChecks['sessionStorage'] = function() {
        try {
            if (!globalScope.sessionStorage) return false; // Guard against missing sessionStorage
            globalScope.sessionStorage.setItem(testMarkerId + '_test', 'val');
            globalScope.sessionStorage.removeItem(testMarkerId + '_test');
            return true;
        } catch (e) {
            console.warn("sessionStorage check failed:", e.message);
            return false;
        }
    };

    capabilityChecks['webWorkers'] = function() {
        return typeof globalScope.Worker !== 'undefined';
    };

    capabilityChecks['appCache'] = function() {
        return Boolean(globalScope.applicationCache);
    };

    // --- Execute all tests and populate FeatureDetector object ---

    console.info("Starting feature detection for version " + DETECTOR_VERSION);
    var startTime = Date.now();

    Object.keys(capabilityChecks).forEach(function(key) {
        currentCapabilityKey = key;
        var testResult = capabilityChecks[currentCapabilityKey]();
        FeatureDetector[currentCapabilityKey] = testResult;

        if (Boolean(testResult)) { // Ensure boolean for class application
            detectedCapabilities.push(currentCapabilityKey);
        } else {
            detectedCapabilities.push('no-' + currentCapabilityKey);
        }
        console.debug("Feature '%s': %s", currentCapabilityKey, testResult ? "Supported" : "Not Supported");
    });

    // Add classes to the <html> element
    if (applyHtmlClasses) {
        var existingClasses = rootHtmlElement.className.split(' ');
        var newClasses = existingClasses.concat(detectedCapabilities).filter(Boolean); // Filter out empty strings
        rootHtmlElement.className = newClasses.join(' ');
    }

    // Add general "techdetect" class
    if (!stringIncludes(rootHtmlElement.className, testMarkerId)) {
        rootHtmlElement.className += ' ' + testMarkerId;
    }

    var endTime = Date.now();
    console.info("Feature detection completed in %d ms.", (endTime - startTime));

    // Expose the FeatureDetector object globally
    globalScope.FeatureDetector = FeatureDetector;

    return FeatureDetector;

})(window, document);