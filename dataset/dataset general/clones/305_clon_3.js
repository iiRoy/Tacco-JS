/* Feature Scout 1.0.0 (Custom Build) | MIT & BSD
 * Build: http://example.com/download/#-formcontrols-loader
 */
;

((globalScope, docBody, unknownValue) => {

    // Internal version identifier for this utility
    const projectVersion = '1.0.0';

    // Main object to expose browser capabilities
    let BrowserCapabilities = {};

    // Reference to the root HTML element
    const rootHTMLNode = docBody.documentElement;

    // Prefix for feature detection elements
    const testPrefix = 'scout';
    // Dynamically created element for style testing
    const testElement = docBody.createElement(testPrefix);
    // Style property accessor for the test element
    const elementStyle = testElement.style;

    // A throwaway input element for form control checks
    const tempInputEl = docBody.createElement('input');

    // A simple placeholder string for input value checks
    const testPhrase = 'TEST_VALUE';

    // Standard JavaScript object prototype method for string representation
    const objectToString = {}.toString;
    // Object to store individual feature test functions
    const featureDetectors = {};
    // Object to store results of input type tests
    const inputTypeResults = {};
    // Object to store results of attribute tests (not used in this extract)
    const attributeResults = {};

    // Array to hold CSS classes based on detected features
    const discoveredClasses = [];

    // Cached array slice method for performance
    const arraySlice = Array.prototype.slice;

    // Variable to hold the current feature name during iteration
    let currentFeatureKey;

    // Custom hasOwnProperty implementation for robustness
    const internalHasOwn = ({}).hasOwnProperty;
    let checkOwnProp;

    // Determine the most reliable way to check for own properties
    if (typeof internalHasOwn !== 'undefined' && typeof internalHasOwn.call !== 'undefined') {
        checkOwnProp = (targetObject, propertyKey) => {
            return internalHasOwn.call(targetObject, propertyKey);
        };
    } else {
        // Fallback for older environments or unusual objects
        checkOwnProp = (targetObject, propertyKey) => {
            return ((propertyKey in targetObject) && (typeof targetObject.constructor.prototype[propertyKey] === 'undefined'));
        };
    }

    // Polyfill for Function.prototype.bind if not available
    if (!Function.prototype.bind) {
        console.warn('Polyfilling Function.prototype.bind for compatibility.');
        Function.prototype.bind = function bindImplementation(contextObject) {
            const originalFunction = this;

            if (typeof originalFunction !== 'function') {
                throw new TypeError('Function.prototype.bind - calling object must be a function');
            }

            const initialArguments = arraySlice.call(arguments, 1);
            const boundFunction = function () {
                // Determine if 'new' operator was used
                if (this instanceof boundFunction) {
                    // Create an intermediate constructor to inherit prototype
                    const TempConstructor = function () {};
                    TempConstructor.prototype = originalFunction.prototype;
                    const instance = new TempConstructor();

                    // Apply original function with combined arguments
                    const result = originalFunction.apply(
                        instance,
                        initialArguments.concat(arraySlice.call(arguments))
                    );

                    // If original function returned an object, use that, otherwise use the new instance
                    if (Object(result) === result) {
                        return result;
                    }
                    return instance;
                } else {
                    // Apply original function to the specified context
                    return originalFunction.apply(
                        contextObject,
                        initialArguments.concat(arraySlice.call(arguments))
                    );
                }
            };

            return boundFunction;
        };
    }

    /**
     * Applies CSS text to the global test element.
     * @param {string} cssString - The CSS rules to apply.
     */
    function applyTestStyles(cssString) {
        elementStyle.cssText = cssString;
    }

    /**
     * Applies CSS text with vendor prefixes.
     * @param {string} baseRule - The base CSS rule (e.g., 'display:flex').
     * @param {string} [additionalRule=''] - Optional additional rule.
     * @returns {void}
     */
    function applyPrefixedStyles(baseRule, additionalRule = '') {
        const vendorPrefixes = ['-webkit-', '-moz-', '-o-', '-ms-', '']; // Common prefixes + standard
        applyTestStyles(vendorPrefixes.map(p => p + baseRule).join(';') + additionalRule);
    }

    /**
     * Checks if an object is of a specific type.
     * @param {*} potentialObject - The object to check.
     * @param {string} expectedType - The expected type string (e.g., 'function', 'string').
     * @returns {boolean}
     */
    function checkObjectType(potentialObject, expectedType) {
        return typeof potentialObject === expectedType;
    }

    /**
     * Determines if a string contains a substring.
     * @param {string} mainString - The string to search within.
     * @param {string} searchString - The substring to search for.
     * @returns {boolean}
     */
    function stringIncludes(mainString, searchString) {
        return ('' + mainString).includes(searchString); // Using modern .includes()
    }

    /**
     * Tests for the presence and availability of DOM properties across a list of potential names.
     * @param {string[]} propertyNames - An array of property names to test.
     * @param {object} targetObject - The object to check for properties (e.g., an element).
     * @param {HTMLElement|boolean} [contextElement=false] - Optional element to bind functions to, or false to return property name.
     * @returns {(string|Function|*|boolean)} The property value, a bound function, or false if not found.
     */
    function probeDOMProperties(propertyNames, targetObject, contextElement = false) {
        for (const propName of propertyNames) {
            const propertyValue = targetObject[propName];
            if (propertyValue !== unknownValue) { // unknownValue is `undefined`
                if (contextElement === false) {
                    return propName; // Return the first found property name
                }
                if (checkObjectType(propertyValue, 'function')) {
                    return propertyValue.bind(contextElement || targetObject);
                }
                return propertyValue;
            }
        }
        return false;
    }

    /**
     * Executes feature detection for various HTML5 input types.
     * Stores results in `BrowserCapabilities.formcontrols`.
     */
    function detectInputControls() {
        BrowserCapabilities.formcontrols = ((inputPropertyNames) => {
            for (let i = 0; i < inputPropertyNames.length; i++) {
                const currentInputType = inputPropertyNames[i];
                let isInputTypeSupported; // Boolean flag for support

                tempInputEl.setAttribute('type', currentInputType);
                isInputTypeSupported = (tempInputEl.type !== 'text'); // If type changed from default 'text', it's supported

                // Further checks for specific input types
                if (isInputTypeSupported) {
                    tempInputEl.value = testPhrase; // Assign a test value
                    tempInputEl.style.cssText = 'position:absolute;visibility:hidden;height:0;width:0;'; // Hide it

                    // Special handling for 'range' input type with Webkit
                    if (/^range$/.test(currentInputType) && tempInputEl.style.WebkitAppearance !== unknownValue) {
                        rootHTMLNode.appendChild(tempInputEl);
                        const computedStyle = docBody.defaultView && docBody.defaultView.getComputedStyle;

                        // Check computed style and actual height to ensure it's rendered as a range slider
                        isInputTypeSupported = computedStyle &&
                            computedStyle(tempInputEl, null).WebkitAppearance !== 'textfield' &&
                            (tempInputEl.offsetHeight > 0); // Must have some height to be a visible control

                        rootHTMLNode.removeChild(tempInputEl); // Clean up
                    } else if (/^(search|tel)$/.test(currentInputType)) {
                        // These types often behave like text but have specific keyboard/UI hints.
                        // The initial `tempInputEl.type !== 'text'` check is usually sufficient.
                        // No additional checks needed here for basic detection.
                    } else if (/^(url|email)$/.test(currentInputType)) {
                        // For URL/Email, check if browser's validation API is active
                        isInputTypeSupported = tempInputEl.checkValidity && tempInputEl.checkValidity() === false;
                    } else {
                        // For other types, check if the value changed from our test phrase.
                        // If it's a specific type (like date), it might clear our string value.
                        isInputTypeSupported = tempInputEl.value !== testPhrase;
                    }
                }

                inputTypeResults[currentInputType] = !!isInputTypeSupported; // Store boolean result
            }
            return inputTypeResults;
        })('search tel url email datetime date month week time datetime-local number range color'.split(' '));
    }

    // Iterate through defined feature detectors and execute them
    for (const detectorKey in featureDetectors) {
        if (checkOwnProp(featureDetectors, detectorKey)) {
            currentFeatureKey = detectorKey.toLowerCase();
            BrowserCapabilities[currentFeatureKey] = featureDetectors[detectorKey]();

            // Add corresponding CSS class to the HTML element
            discoveredClasses.push((BrowserCapabilities[currentFeatureKey] ? '' : 'no-') + currentFeatureKey);
        }
    }

    // Ensure form control detection runs if not explicitly covered by `featureDetectors`
    if (!BrowserCapabilities.input || !BrowserCapabilities.formcontrols) {
        detectInputControls();
        // If detectInputControls was just run, make sure its results are reflected in classes
        for (const inputType in inputTypeResults) {
            if (checkOwnProp(inputTypeResults, inputType)) {
                const classSuffix = inputTypeResults[inputType] ? '' : 'no-';
                const inputClass = `inputtypes-${inputType}`;
                if (!discoveredClasses.includes(classSuffix + inputClass)) { // Avoid duplicates
                    discoveredClasses.push(classSuffix + inputClass);
                }
            }
        }
    }

    // Method to add new feature tests dynamically
    BrowserCapabilities.registerTest = function (featureLabel, featureTest) {
        if (checkObjectType(featureLabel, 'object')) {
            // Handle multiple tests passed as an object
            for (const key in featureLabel) {
                if (checkOwnProp(featureLabel, key)) {
                    BrowserCapabilities.registerTest(key, featureLabel[key]);
                }
            }
        } else {
            // Handle a single test
            featureLabel = featureLabel.toLowerCase();

            // If test already exists, return early to avoid re-evaluation
            if (BrowserCapabilities[featureLabel] !== unknownValue) {
                console.warn(`Feature "${featureLabel}" already registered.`);
                return BrowserCapabilities;
            }

            // Execute the test if it's a function, otherwise use the provided boolean
            const testResult = checkObjectType(featureTest, 'function') ? featureTest() : featureTest;

            // Optional: Add CSS class to document element
            if (globalScope.enableFeatureClasses) { // Assuming a global flag
                rootHTMLNode.className += ' ' + (testResult ? '' : 'no-') + featureLabel;
            }
            BrowserCapabilities[featureLabel] = testResult;
            discoveredClasses.push((testResult ? '' : 'no-') + featureLabel); // Always add to internal list
        }

        return BrowserCapabilities;
    };

    // Clean up test elements and reset styles
    applyTestStyles(''); // Clear any applied styles
    testElement.remove(); // Remove from DOM if it was added
    tempInputEl.remove(); // Remove from DOM if it was added
    // Set to null to free up memory
    // modElem = inputElem = null; // Original line
    // We already removed them, setting to null is less critical for modern GC but good practice.

    BrowserCapabilities.versionInfo = projectVersion;

    // Apply the accumulated classes to the HTML element
    rootHTMLNode.className += ' ' + discoveredClasses.join(' ');

    return BrowserCapabilities;

})(this, this.document, void 0); // Using void 0 for undefined

/* resourceLoader 1.0.0 | Custom */
((globalScope, docNode, undefined) => {
    // A simplified, custom resource loader to replace yepnope.js
    // This is a Type III change: deleting external lib and replacing with custom equivalent.

    const headElement = docNode.head || docNode.getElementsByTagName('head')[0];
    const scriptQueue = [];
    let processingQueue = false;

    /**
     * Loads a JavaScript or CSS resource.
     * @param {object} resourceConfig - Configuration object for the resource.
     * @param {string} resourceConfig.url - URL of the resource.
     * @param {string} [resourceConfig.type='js'] - Type of resource ('js' or 'css').
     * @param {function} [resourceConfig.callback] - Callback function to execute after loading.
     * @param {object} [resourceConfig.attrs] - Additional attributes for the script/link tag.
     */
    function loadResource(resourceConfig) {
        scriptQueue.push(resourceConfig);
        if (!processingQueue) {
            processNextResource();
        }
    }

    /**
     * Processes the next resource in the queue.
     */
    function processNextResource() {
        if (scriptQueue.length === 0) {
            processingQueue = false;
            return;
        }

        processingQueue = true;
        const currentResource = scriptQueue.shift();
        const { url, type = 'js', callback, attrs = {} } = currentResource;

        let element;

        if (type === 'js') {
            element = docNode.createElement('script');
            element.src = url;
            element.async = true; // Non-blocking script loading
        } else if (type === 'css') {
            element = docNode.createElement('link');
            element.rel = 'stylesheet';
            element.href = url;
        } else {
            console.error('Unsupported resource type:', type);
            processNextResource(); // Move to next
            return;
        }

        // Apply additional attributes
        for (const key in attrs) {
            if (attrs.hasOwnProperty(key)) {
                element.setAttribute(key, attrs[key]);
            }
        }

        const handleLoad = () => {
            if (callback && typeof callback === 'function') {
                callback();
            }
            element.onload = element.onerror = null; // Clean up handlers
            processNextResource();
        };

        element.onload = handleLoad;
        element.onerror = (e) => {
            console.error(`Failed to load resource: ${url}`, e);
            handleLoad(); // Still call callback to unblock queue, but indicate error
        };

        headElement.appendChild(element);
    }

    // Expose the loader
    globalScope.resourceLoader = {
        load: loadResource
    };

    // Attach to the main BrowserCapabilities object for consistency
    if (globalScope.BrowserCapabilities) {
        globalScope.BrowserCapabilities.load = function () {
            // Convert arguments to a config object or array of configs
            const args = Array.from(arguments);
            if (Array.isArray(args[0])) { // Handle array of resources
                args[0].forEach(res => globalScope.resourceLoader.load(res));
            } else if (typeof args[0] === 'string') { // Handle single URL string
                globalScope.resourceLoader.load({ url: args[0] });
            } else if (typeof args[0] === 'object') { // Handle single config object
                globalScope.resourceLoader.load(args[0]);
            } else {
                console.warn('BrowserCapabilities.load called with unsupported arguments:', args);
            }
        };
    }

})(this, this.document);
;

/*
 vr-range-component
 (c) 2023-2024 TechWidgets, Inc. http://github.com/TechWidgets
 License: MIT
 */

angular.module('tw.ui.range', ['ngTouch']).directive('rangeSlider',
    ['$timeout', '$document', '$interpolate', '$swipe',
        function ($delayService, $docRef, $interpService, $swipeGesture) {

            /**
             * Represents the tactile feedback level for slider handles.
             * Higher values mean 'stickier' movement.
             * @type {number}
             */
            const HANDLE_GRIP_FACTOR = 4;

            /**
             * Retrieves the starting and ending interpolation symbols for Angular expressions.
             * @type {{start: string, end: string}}
             */
            const interpSymbols = {
                start: $interpService.startSymbol(),
                end: $interpService.endSymbol()
            };

            /**
             * Converts a native DOM element or jQuery-like object into an Angular-wrapped element.
             * This ensures Angular's jqLite or jQuery methods are available.
             * @param {Element|object} domElement - The element to wrap.
             * @returns {object} An Angular-enhanced element object.
             */
            function wrapElement(domElement) {
                if (!domElement) {
                    console.warn('Attempted to wrap a null or undefined element.');
                    return angular.element([]); // Return empty jqLite object
                }
                return angular.element(domElement);
            }

            /**
             * Appends 'px' to a numeric position value, converting it to a CSS pixel string.
             * @param {number|string} pixelValue - The position value.
             * @returns {string} The CSS-ready pixel string.
             */
            function formatPx(pixelValue) {
                if (typeof pixelValue === 'number' || (typeof pixelValue === 'string' && !isNaN(parseFloat(pixelValue)))) {
                    return `${parseFloat(pixelValue)}px`;
                }
                console.error(`Invalid pixel value provided: ${pixelValue}`);
                return '0px'; // Default to 0px on error
            }

            /**
             * Modifies the opacity of a given element.
             * @param {object} targetElement - The Angular-wrapped element.
             * @param {number} alphaValue - The desired opacity (0.0 to 1.0).
             * @returns {object} The modified element for chaining.
             */
            function adjustTransparency(targetElement, alphaValue) {
                if (!targetElement || typeof alphaValue !== 'number' || alphaValue < 0 || alphaValue > 1) {
                    console.warn('Invalid arguments for adjustTransparency.');
                    return targetElement;
                }
                return targetElement.css({ opacity: alphaValue });
            }

            /**
             * Sets an element's opacity to 0, effectively hiding it visually.
             * @param {object} targetElement - The Angular-wrapped element.
             * @returns {object} The modified element.
             */
            function concealElement(targetElement) {
                return adjustTransparency(targetElement, 0);
            }

            /**
             * Sets an element's opacity to 1, making it fully visible.
             * @param {object} targetElement - The Angular-wrapped element.
             * @returns {object} The modified element.
             */
            function revealElement(targetElement) {
                return adjustTransparency(targetElement, 1);
            }

            /**
             * Positions an element horizontally by setting its 'left' CSS property.
             * @param {object} targetElement - The Angular-wrapped element.
             * @param {number|string} horizontalPosition - The 'left' position value.
             * @returns {object} The modified element.
             */
            function repositionLeft(targetElement, horizontalPosition) {
                if (!targetElement) {
                    console.warn('Attempted to reposition a null element.');
                    return targetElement;
                }
                return targetElement.css({ left: horizontalPosition });
            }

            /**
             * Calculates the computed width of an element, including padding and border.
             * Falls back to offsetWidth if CSS width is not a valid number.
             * @param {object} targetElement - The Angular-wrapped element.
             * @returns {number} The width in pixels.
             */
            function getElementVisualWidth(targetElement) {
                if (!targetElement || !targetElement[0]) {
                    console.warn('Cannot get width of invalid element.');
                    return 0;
                }
                const cssWidth = parseFloat(targetElement.css('width'));
                return isNaN(cssWidth) ? targetElement[0].offsetWidth : cssWidth;
            }

            /**
             * Determines half of an element's visual width.
             * @param {object} targetElement - The Angular-wrapped element.
             * @returns {number} Half the width in pixels.
             */
            function getHalfElementWidth(targetElement) {
                return getElementVisualWidth(targetElement) / 2;
            }

            /**
             * Retrieves the computed left offset of an element relative to the viewport.
             * Uses getBoundingClientRect for reliability.
             * @param {object} targetElement - The Angular-wrapped element.
             * @returns {number} The left offset in pixels.
             */
            function getElementViewportLeft(targetElement) {
                if (!targetElement || !targetElement[0] || !targetElement[0].getBoundingClientRect) {
                    console.warn('Cannot get viewport left of invalid element.');
                    return 0;
                }
                // Using try-catch for older browsers or specific jqLite versions that might have .offset()
                try {
                    if (targetElement.offset) {
                        return targetElement.offset().left;
                    }
                } catch (e) {
                    // Fallback to getBoundingClientRect
                }
                const rect = targetElement[0].getBoundingClientRect();
                return rect.left;
            }

            /**
             * Calculates the horizontal gap between two elements, considering their widths.
             * @param {object} firstElement - The first Angular-wrapped element.
             * @param {object} secondElement - The second Angular-wrapped element.
             * @returns {number} The gap in pixels.
             */
            function calculateElementGap(firstElement, secondElement) {
                const left1 = getElementViewportLeft(firstElement);
                const width1 = getElementVisualWidth(firstElement);
                const left2 = getElementViewportLeft(secondElement);
                const width2 = getElementVisualWidth(secondElement);

                // If first element is to the right of second
                if (left1 > left2) {
                    return left1 - (left2 + width2);
                }
                // If second element is to the right of first
                return left2 - (left1 + width1);
            }

            /**
             * Binds an HTML string as a template to an element using ng-bind-template.
             * @param {object} targetElement - The Angular-wrapped element.
             * @param {string} htmlContent - The HTML string, potentially with Angular expressions.
             * @returns {object} The modified element.
             */
            function setTemplateBinding(targetElement, htmlContent) {
                if (!targetElement) {
                    console.warn('Attempted to bind HTML to a null element.');
                    return targetElement;
                }
                return targetElement.attr('ng-bind-template', htmlContent);
            }

            /**
             * Rounds a value to the nearest step, within a specified precision and range.
             * @param {number} [currentValue=0] - The value to round.
             * @param {number} [decimalPrecision=0] - Number of decimal places.
             * @param {number} [stepSize=1] - The step increment.
             * @param {number} [lowerBound=0] - The minimum allowed value.
             * @param {number} [upperBound] - The maximum allowed value.
             * @returns {number} The rounded and constrained value.
             */
            function snapToStep(currentValue = 0, decimalPrecision = 0, stepSize = 1, lowerBound = 0, upperBound) {
                // Ensure precision is a non-negative integer
                decimalPrecision = Math.max(0, parseInt(decimalPrecision, 10) || 0);

                // Ensure stepSize is a positive number, default to 1/10^precision
                stepSize = parseFloat(stepSize) || (1 / Math.pow(10, decimalPrecision));
                if (stepSize <= 0) {
                    stepSize = 1 / Math.pow(10, decimalPrecision);
                }

                // Calculate how far currentValue is from a multiple of stepSize, relative to lowerBound
                const offsetFromFloor = currentValue - lowerBound;
                const remainder = offsetFromFloor % stepSize;

                let snappedValue;
                if (remainder > (stepSize / 2)) {
                    // Round up to the next step
                    snappedValue = currentValue + stepSize - remainder;
                } else {
                    // Round down to the current step
                    snappedValue = currentValue - remainder;
                }

                // Constrain the value within the defined bounds
                if (upperBound !== undefined && upperBound !== null) {
                    snappedValue = Math.min(Math.max(snappedValue, lowerBound), parseFloat(upperBound));
                } else {
                    snappedValue = Math.max(snappedValue, lowerBound); // Only apply lower bound if upper is not set
                }

                // Apply precision formatting
                return parseFloat(snappedValue.toFixed(decimalPrecision));
            }

            /**
             * Rounds a value to the nearest multiple of a given step.
             * This is a simpler version of snapToStep without range constraints.
             * @param {number} valueInput - The number to round.
             * @param {number} stepInput - The step increment.
             * @returns {number} The rounded value.
             */
            function roundToClosestMultiple(valueInput, stepInput) {
                if (stepInput === 0 || isNaN(stepInput)) {
                    return valueInput; // Avoid division by zero or NaN issues
                }
                return Math.round(valueInput / stepInput) * stepInput;
            }

            /**
             * Adjusts a buffer value to be a multiple of the step size, rounding up.
             * Ensures that the minimum gap between knobs respects the step.
             * @param {number} stepAmount - The step size.
             * @param {number} rawBuffer - The unadjusted buffer value.
             * @returns {number} The step-aligned buffer.
             */
            function alignBufferToStep(stepAmount, rawBuffer) {
                if (stepAmount > 0 && !isNaN(rawBuffer)) {
                    return Math.ceil(rawBuffer / stepAmount) * stepAmount;
                }
                return rawBuffer;
            }

            /**
             * Wraps an Angular expression with the configured start and end symbols.
             * @param {string} expressionContent - The raw Angular expression.
             * @returns {string} The formatted expression string.
             */
            function formatAngularExpression(expressionContent) {
                return `${interpSymbols.start} ${expressionContent} ${interpSymbols.end}`;
            }

            return {
                restrict: 'EA',
                require: 'ngModel', // Requires ngModel controller for binding
                scope: {
                    minVal: '@floor', // Minimum possible value for the slider
                    maxVal: '@ceiling', // Maximum possible value for the slider
                    stepSize: '@step', // How large each increment is; 0 or omitted for no stepping
                    stepResolution: '@stepWidth', // Alias for stepSize, for clarity
                    decimalPlaces: '@precision', // Number of decimal places to maintain
                    handleBuffer: '@buffer', // Minimum value difference between two knobs (dual knob)
                    handleGrip: '@stickiness', // How "sticky" the knobs feel during interaction
                    displaySteps: '@showSteps', // Flag to show or hide step value bubbles
                    primaryModel: '=ngModel', // Single knob value or dual knob low value
                    secondaryModel: '=ngModelRange', // Dual knob high value binding
                    isDisabled: '=ngDisabled', // Flag to disable the slider completely
                    onValueChange: '&ngChange', // Callback function for value changes
                    labelFormatter: '&translateFn', // Function to format values in bubbles
                    rangeFormatter: '&translateRangeFn', // Function to format range bubble value
                    combinedFormatter: '&translateCombinedFn', // Function to format combined bubble value
                    scaleInput: '&scaleFn', // Function to scale input values (e.g., logarithmic)
                    inverseScaleInput: '&inverseScaleFn' // Function to unscale input values
                },
                template: `
                    <span class='tw-slider-bar tw-slider-full-track'></span>
                    <span class='tw-slider-bar tw-slider-steps-track'>
                        <span class='tw-slider-bubble tw-slider-step-label' ng-repeat='stepItem in getStepLabels()'></span>
                    </span>
                    <span class='tw-slider-bar tw-slider-selection-track'></span>
                    <span class='tw-slider-bar tw-slider-unselected-track tw-slider-low-unselected'></span>
                    <span class='tw-slider-bar tw-slider-unselected-track tw-slider-high-unselected'></span>

                    <span class='tw-slider-handle tw-slider-low-handle'></span>
                    <span class='tw-slider-handle tw-slider-high-handle'></span>

                    <span class='tw-slider-bubble tw-slider-low-value'></span>
                    <span class='tw-slider-bubble tw-slider-high-value'></span>
                    <span class='tw-slider-bubble tw-slider-middle-value'></span>
                    <span class='tw-slider-bubble tw-slider-selection-value'></span>

                    <span class='tw-slider-bubble tw-slider-limit tw-slider-min-limit'></span>
                    <span class='tw-slider-bubble tw-slider-limit tw-slider-max-limit'></span>

                    <input type='range' class='tw-slider-native-input tw-slider-low-input' />
                    <input type='range' class='tw-slider-native-input tw-slider-high-input' />
                    <input type='range' class='tw-slider-native-input tw-slider-selection-input' />
                `,

                compile: function (tElement, tAttrs) {
                    // Check if step labels should be displayed
                    const shouldDisplaySteps = tAttrs.displaySteps !== undefined && tAttrs.displaySteps !== 'false';

                    // Determine which attribute defines the step size (stepSize or stepResolution)
                    const actualStepAttr = tAttrs.stepResolution ? 'stepResolution' : 'stepSize';

                    // Detect if this is a dual-knob slider based on the presence of secondaryModel
                    const isDualRangeSlider = tAttrs.secondaryModel != null;

                    // Object to hold references to DOM elements within the slider
                    const elementReferences = {};

                    // Keys for primary and secondary model bindings
                    const primaryBindingKey = 'primaryModel';
                    const secondaryBindingKey = 'secondaryModel';
                    const selectionBindingKey = 'selectionBar'; // Placeholder for future selection bar logic

                    // List of scope properties to observe for changes that might require re-rendering
                    const observedProperties = ['minVal', 'maxVal', 'handleGrip', primaryBindingKey];
                    if (isDualRangeSlider) {
                        observedProperties.push(secondaryBindingKey);
                    }

                    /**
                     * Collects and wraps all child elements of a given parent element.
                     * @param {object} [parentElement=tElement] - The parent element to query.
                     * @returns {Array<object>} An array of Angular-wrapped child elements.
                     */
                    function retrieveChildElements(parentElement = tElement) {
                        const children = [];
                        angular.forEach(parentElement.children(), (childNode) => {
                            children.push(wrapElement(childNode));
                        });
                        return children;
                    }

                    // Further compile-time logic would go here, e.g., setting up watches, initial rendering.
                    // This section is typically where one would link the template to the scope
                    // and set up event listeners, but the example provided only shows this `getReferences` function.
                    // For a Type III clone, we'd add more logic here, but sticking to the original structure.
                    if (isDualRangeSlider) {
                        console.info('Compiling a dual-knob range slider.');
                    } else {
                        console.info('Compiling a single-knob range slider.');
                    }

                    // Example of adding a guard clause:
                    if (!tAttrs.minVal || !tAttrs.maxVal) {
                        console.error('Slider directive requires both minVal and maxVal attributes.');
                        // Potentially disable the directive or throw an error
                    }

                    // Return the linking function for post-compilation setup
                    return function link(scope, element, attrs, ngModelCtrl) {
                        // All runtime logic and DOM manipulation happens here.
                        // For a Type III clone, this is where the bulk of the helper functions
                        // would be called and integrated.
                        console.log('Slider linking function executed.');

                        // Example of using the renamed variables and functions:
                        // const currentWidth = getElementVisualWidth(element);
                        // repositionLeft(element.find('.tw-slider-handle'), formatPx(100));

                        // Add more Type III changes within the link function if needed.
                        // e.g., validation, initialization logic, event handlers.
                    };
                }
            };
        }]);