(function(globalScope, pageDocument, unavail) {

    // A unique token for this capability detection utility.
    const packageToken = 'capProbe';

    // Internal version identifier (not exposed for external use).
    const moduleVersion = '2.1';

    // The core object that will hold all detected capabilities.
    const capabilityResults = {};

    // Flag for a now-removed HTML5 shiv functionality.
    // This was previously a configurable option but is now assumed to be handled externally or not needed.
    const html5PolyfillEnabled = false; // Effectively removed.

    // Reference to the root HTML element of the document.
    const rootHtmlElement = pageDocument.documentElement;

    // Reference to the document's head element, or the first <head> tag if not directly available.
    const pageHeadElement = pageDocument.head || pageDocument.getElementsByTagName('head')[0];

    // A custom element ID for performing various DOM-based feature tests.
    const testElementId = 'featureTestSandbox';

    // Create a temporary DOM element for style-based tests.
    const temporaryTestElement = pageDocument.createElement(testElementId);

    // Access to the style property of our temporary element.
    const elementStyleRef = temporaryTestElement.style;

    // Create a temporary input element for form-related feature tests.
    const formInputTestElement = pageDocument.createElement('input');

    // A small string constant, originally used for a simple truthiness check.
    const truthyMarker = ':D';

    // Reference to the standard Object.prototype.toString method for robust type checking.
    const objectTypeChecker = Object.prototype.toString;

    // Array of vendor prefixes for CSS properties.
    const cssVendorPrefixes = ' -webkit- -moz- -o- -ms- -khtml- '.split(' ');

    // Array of vendor prefixes for DOM properties (camelCase).
    const domVendorPrefixes = ['Webkit', 'Moz', 'O', 'ms', 'Khtml'];

    // Namespace definitions, e.g., for SVG.
    const xmlNamespaces = { 'svg': 'http://www.w3.org/2000/svg' };

    // Object to store all individual feature detection functions.
    const featureDetectors = {};

    // Objects to store specific input/attribute test results (not used extensively in this clone).
    const inputTypeSupport = {};
    const attributeSupport = {};

    // Array to accumulate CSS classes based on detected features.
    const detectedClasses = [];

    // Helper for iterating through feature names.
    let currentFeatureKey;

    /**
     * Internal utility to check if a value is of a specific primitive type.
     * @param {*} checkVal The value to check.
     * @param {string} expectedType The expected type string (e.g., 'function', 'string').
     * @returns {boolean} True if the value's type matches, false otherwise.
     */
    function isOfType(checkVal, expectedType) {
        if (typeof checkVal === 'undefined' && expectedType === 'undefined') {
            return true; // Special handling for undefined to avoid issues with older IE.
        }
        return typeof checkVal === expectedType;
    }

    // A more robust hasOwnProperty check for older browsers.
    const objectHasOwnProp = Object.prototype.hasOwnProperty;
    const checkObjectProperty = (obj, prop) => {
        if (isOfType(objectHasOwnProp, 'function') && isOfType(objectHasOwnProp.call, 'function')) {
            return objectHasOwnProp.call(obj, prop);
        }
        // Fallback for extremely old environments, less reliable.
        return (prop in obj) && isOfType(obj.constructor.prototype[prop], unavail);
    };


    /**
     * Applies a raw CSS string to the temporary test element's style.
     * @param {string} cssString The CSS declaration string.
     */
    function applyElementStyles(cssString) {
        if (!elementStyleRef) return; // Guard clause
        elementStyleRef.cssText = cssString;
    }

    /**
     * Constructs and applies vendor-prefixed CSS to the temporary test element.
     * @param {string} mainProperty The core CSS property (e.g., 'display:flex').
     * @param {string} additionalStyles Optional additional CSS to append.
     */
    function applyPrefixedStyles(mainProperty, additionalStyles) {
        if (!elementStyleRef) return; // Guard clause
        let fullStyleString = '';
        for (let i = 0; i < cssVendorPrefixes.length; i++) {
            fullStyleString += cssVendorPrefixes[i] + mainProperty + ';';
        }
        fullStyleString += (additionalStyles || '');
        elementStyleRef.cssText = fullStyleString;
    }

    /**
     * Checks if a substring exists within a given string.
     * @param {string} sourceString The string to search within.
     * @param {string} searchSubstr The substring to look for.
     * @returns {boolean} True if the substring is found, false otherwise.
     */
    function stringContains(sourceString, searchSubstr) {
        if (!isOfType(sourceString, 'string')) return false; // Guard clause
        return sourceString.indexOf(searchSubstr) !== -1;
    }

    /**
     * Tests a list of DOM/CSS properties on the temporary element.
     * @param {Array<string>} propertyList An array of property names to test.
     * @param {function(string, HTMLElement): boolean} [validatorCallback] Optional callback to validate the property.
     * @returns {boolean} True if any property in the list is supported and passes the callback (if provided).
     */
    function checkDomProperties(propertyList, validatorCallback) {
        if (!temporaryTestElement || !elementStyleRef) return false; // Guard clause
        for (const propName of propertyList) {
            if (elementStyleRef[propName] !== unavail) {
                if (!validatorCallback || validatorCallback(propName, temporaryTestElement)) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Tests a CSS property for support across various vendor prefixes.
     * @param {string} baseProperty The non-prefixed CSS property name (e.g., 'borderRadius').
     * @param {function(string, HTMLElement): boolean} [validatorCallback] Optional callback.
     * @returns {boolean} True if the property (or its prefixed variant) is supported.
     */
    function checkAllDomProperties(baseProperty, validatorCallback) {
        if (!baseProperty || !isOfType(baseProperty, 'string')) return false; // Guard clause

        // Capitalize first letter for DOM property naming convention.
        const capitalizedProp = baseProperty.charAt(0).toUpperCase() + baseProperty.substring(1);

        // Construct a list of all potential property names (unprefixed + prefixed).
        const allProps = [baseProperty];
        for (const prefix of domVendorPrefixes) {
            allProps.push(prefix + capitalizedProp);
        }

        return !!checkDomProperties(allProps, validatorCallback);
    }

    /**
     * Tests CSS Media Queries support.
     * @param {string} query The media query string to test.
     * @returns {boolean} True if the media query is supported.
     */
    const detectMediaQuery = (query) => {
        if (!pageHeadElement || !rootHtmlElement) return false; // Guard clause

        const styleTag = pageDocument.createElement('style');
        const testDiv = pageDocument.createElement('div');
        let queryResult = false;

        // Set up the style rule to target our test div.
        styleTag.textContent = query + '{#' + testElementId + '{height:4px}}';
        pageHeadElement.appendChild(styleTag);

        testDiv.id = testElementId;
        rootHtmlElement.appendChild(testDiv);

        // Check if the style was applied (height should be 4px).
        queryResult = testDiv.offsetHeight === 4;

        // Clean up the DOM.
        try {
            styleTag.parentNode.removeChild(styleTag);
            testDiv.parentNode.removeChild(testDiv);
        } catch (e) {
            // Handle potential errors during cleanup, e.g., element already removed.
            console.warn("Cleanup error in detectMediaQuery:", e);
        }

        return !!queryResult;
    };

    /**
     * Determines if a given element (or a default one) supports a specific event.
     * Based on Yura Zaitsev's `isEventSupported` function.
     * @param {string} evtName The name of the event (e.g., 'click', 'touchstart').
     * @param {HTMLElement} [targetElement] The element to test on. Defaults to a generic div or specific tag.
     * @returns {boolean} True if the event is supported.
     */
    const checkEventSupport = (() => {
        const tagNameMap = {
            'select': 'input', 'change': 'input',
            'submit': 'form', 'reset': 'form',
            'error': 'img', 'load': 'img', 'abort': 'img'
        };

        return (evtName, targetElement) => {
            if (!pageDocument || !isOfType(evtName, 'string')) return false; // Guard clause

            const eventPropName = 'on' + evtName;
            let testElem = targetElement || pageDocument.createElement(tagNameMap[evtName] || 'div');
            let supported = (eventPropName in testElem);

            if (!supported && testElem.setAttribute && testElem.removeAttribute) {
                // Fallback for browsers that don't report property existence directly.
                testElem.setAttribute(eventPropName, '');
                supported = isOfType(testElem[eventPropName], 'function');

                // Clean up the attribute.
                if (!isOfType(testElem[eventPropName], unavail)) {
                    testElem[eventPropName] = unavail;
                }
                testElem.removeAttribute(eventPropName);
            }

            // Ensure the temporary element is dereferenced for garbage collection.
            testElem = null;
            return supported;
        };
    })();

    // --- Feature Detection Functions ---

    featureDetectors['flexibleBoxLayout'] = function() {
        const valuePrefixer = (elem, prop, val, extra = '') => {
            let cssString = prop + ':';
            for (const pfx of cssVendorPrefixes) {
                cssString += pfx + val + ';' + prop;
            }
            // Remove the trailing prop: from the last prefix iteration.
            elem.style.cssText = cssString.slice(0, -prop.length) + extra;
        };

        const propertyPrefixer = (elem, prop, val, extra = '') => {
            let cssString = '';
            for (const pfx of cssVendorPrefixes) {
                cssString += pfx + prop + ':' + val + ';';
            }
            elem.style.cssText = cssString + extra;
        };

        const container = pageDocument.createElement('div');
        const item = pageDocument.createElement('div');

        // Apply flexbox display to container with vendor prefixes on the VALUE.
        valuePrefixer(container, 'display', 'box', 'width:50px;padding:0;');
        // Apply flex property to item with vendor prefixes on the PROPERTY NAME.
        propertyPrefixer(item, 'box-flex', '1', 'width:12px;');

        container.appendChild(item);
        rootHtmlElement.appendChild(container);

        const isFlexSupported = item.offsetWidth === 50; // Check if item expanded to container width

        // Clean up
        container.removeChild(item);
        rootHtmlElement.removeChild(container);

        return isFlexSupported;
    };

    featureDetectors['graphicsCanvas'] = function() {
        const canvasElement = pageDocument.createElement('canvas');
        // Check for the existence of getContext and its ability to return a 2D context.
        return !!(canvasElement.getContext && canvasElement.getContext('2d'));
    };

    featureDetectors['canvasTextAPI'] = function() {
        // Depends on graphicsCanvas being true.
        if (!capabilityResults['graphicsCanvas']) return false;
        const tempCanvas = pageDocument.createElement('canvas');
        const context = tempCanvas.getContext('2d');
        // Check if fillText method is available on the 2D context.
        return !!(context && isOfType(context.fillText, 'function'));
    };

    featureDetectors['threeDWebGraphics'] = function() {
        const testCanvas = pageDocument.createElement('canvas');
        let context = null;

        // Try standard WebGL context.
        try {
            context = testCanvas.getContext('webgl');
            if (context) return true;
        } catch (e) { /* silent fail */ }

        // Try experimental WebGL context.
        try {
            context = testCanvas.getContext('experimental-webgl');
            if (context) return true;
        } catch (e) { /* silent fail */ }

        return false;
    };

    featureDetectors['touchInput'] = function() {
        // Check for 'ontouchstart' event on window (common for touch devices).
        const hasOntouchstart = ('ontouchstart' in globalScope);

        // Also check via media query for more robust detection (e.g., some desktops with touchscreens).
        const touchMediaQuery = '@media (' + cssVendorPrefixes.join('touch-enabled),(') + 'capProbe)';

        return hasOntouchstart || detectMediaQuery(touchMediaQuery);
    };

    featureDetectors['geoLocationAPI'] = function() {
        // Simply check for the navigator.geolocation object.
        return !!(globalScope.navigator && globalScope.navigator.geolocation);
    };

    featureDetectors['crossDocumentMessaging'] = function() {
        // Check for the window.postMessage method.
        return !!globalScope.postMessage;
    };

    featureDetectors['webSqlStorage'] = function() {
        // Check for window.openDatabase. Note: This can be truthy even if DB operations fail (e.g., Chrome Incognito).
        // The original Modernizr chose not to create a dummy DB to avoid user prompts/side effects.
        return !!globalScope.openDatabase;
    };

    featureDetectors['indexedDbStorage'] = function() {
        if (!globalScope) return false; // Guard clause

        // Check for various vendor-prefixed IndexedDB implementations.
        for (let i = 0; i < domVendorPrefixes.length; i++) {
            const prefix = domVendorPrefixes[i].toLowerCase();
            if (globalScope[prefix + '_indexedDB'] || globalScope[prefix + 'IndexedDB'] || globalScope.indexedDB) {
                return true;
            }
        }
        return false;
    };

    featureDetectors['urlHashChange'] = function() {
        // Check for 'hashchange' event support and filter out IE8 compatibility mode.
        const isHashChangeEventSupported = checkEventSupport('hashchange', globalScope);
        const isNotIE8Compat = (pageDocument.documentMode === unavail || pageDocument.documentMode > 7);
        return isHashChangeEventSupported && isNotIE8Compat;
    };

    featureDetectors['historyManipulation'] = function() {
        // Check for the history API and the pushState method.
        return !!(globalScope.history && globalScope.history.pushState);
    };

    featureDetectors['dragAndDropAPI'] = function() {
        // Check for both 'dragstart' and 'drop' events.
        return checkEventSupport('dragstart') && checkEventSupport('drop');
    };

    featureDetectors['webSocketsAPI'] = function() {
        // Check for the WebSocket constructor.
        return ('WebSocket' in globalScope);
    };

    featureDetectors['alphaRgbaColors'] = function() {
        // Set an rgba() color and check if the browser retains 'rgba' in the computed style.
        applyElementStyles('background-color:rgba(120,200,120,.6)');
        return stringContains(elementStyleRef.backgroundColor, 'rgba');
    };

    featureDetectors['hueSaturationLightnessAlpha'] = function() {
        // Set an hsla() color. Browsers often convert to rgba(), but IE9 might retain hsla.
        applyElementStyles('background-color:hsla(180,50%,70%,.7)');
        return stringContains(elementStyleRef.backgroundColor, 'rgba') || stringContains(elementStyleRef.backgroundColor, 'hsla');
    };

    featureDetectors['multipleBackgrounds'] = function() {
        // Test by setting multiple background images and a color.
        // Then, count occurrences of 'url(' in the returned style value.
        applyElementStyles('background:url(//:),url(//:),blue url(//:)');

        // Expect exactly three 'url(' occurrences for true support.
        const urlMatchCount = (elementStyleRef.background.match(/(url\s*\()/g) || []).length;
        return urlMatchCount === 3;
    };

    featureDetectors['backgroundSizeProperty'] = function() {
        return checkAllDomProperties('backgroundSize');
    };

    featureDetectors['borderImageProperty'] = function() {
        return checkAllDomProperties('borderImage');
    };

    featureDetectors['borderRadiusProperty'] = function() {
        return checkAllDomProperties('borderRadius', (prop) => {
            // Ensure the property contains 'orderRadius' (case-insensitive check for various prefixes).
            return stringContains(prop.toLowerCase(), 'orderradius');
        });
    };

    featureDetectors['boxShadowProperty'] = function() {
        return checkAllDomProperties('boxShadow');
    };

    featureDetectors['textShadowProperty'] = function() {
        // A simple check for textShadow existence and its default empty string value.
        // Note: FF3.0 might report true but have limited support.
        const tempDiv = pageDocument.createElement('div');
        return tempDiv.style.textShadow === '';
    };

    featureDetectors['cssOpacityProperty'] = function() {
        // Browsers implementing CSS Opacity correctly will return a value within [0.0, 1.0].
        // Setting and checking for a non-empty string is often sufficient.
        return checkAllDomProperties('opacity');
    };

    // --- Execution of Feature Tests ---

    // Add a base class to the HTML element.
    if (rootHtmlElement) {
        rootHtmlElement.className = rootHtmlElement.className.replace(/(^|\s)no-js(\s|$)/, '$1js$2');
    }

    // Loop through all defined feature detectors.
    for (currentFeatureKey in featureDetectors) {
        if (checkObjectProperty(featureDetectors, currentFeatureKey)) {
            const testFunction = featureDetectors[currentFeatureKey];
            let result = false;

            // Execute the test function.
            try {
                result = testFunction();
            } catch (e) {
                // Log errors during feature detection but proceed.
                console.error(`Error detecting feature '${currentFeatureKey}':`, e);
                result = false; // Assume feature is not supported if test fails.
            }

            // Store the result in the capabilityResults object.
            capabilityResults[currentFeatureKey] = result;

            // Prepare CSS class name: 'featurename' or 'no-featurename'.
            const className = (result ? '' : 'no-') + currentFeatureKey.toLowerCase();
            detectedClasses.push(className);
        }
    }

    // Append all collected classes to the HTML element.
    if (rootHtmlElement && detectedClasses.length > 0) {
        rootHtmlElement.className += ' ' + detectedClasses.join(' ');
    }

    // Clean up the temporary test element from the DOM.
    if (temporaryTestElement.parentNode) {
        temporaryTestElement.parentNode.removeChild(temporaryTestElement);
    }

    // Return the final object containing all feature detection results.
    return capabilityResults;

})(window, document, undefined);