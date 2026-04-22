// This utility dynamically adjusts font sizes based on viewport dimensions and defined breakpoints.

// Self-executing anonymous function to encapsulate the logic.
// 'globalScope' is typically 'window' in a browser environment.
(function(globalScope){
    // Ensure Array.prototype.indexOf for older environments, if not present.
    // This is a common polyfill, but we can rename variables and simplify.
    if (!Array.prototype.indexOf) {
        Array.prototype.indexOf = function (itemToFind, startIndex) {
            var loopIndex,
                currentPosition = (startIndex || 0),
                arrayLength;

            // Defensive check, though 'this' is usually an Array instance here.
            if (this === null || this === undefined) {
                throw new TypeError("Array.prototype.indexOf called on null or undefined");
            }

            arrayLength = this.length;

            if (arrayLength === 0 || currentPosition >= arrayLength) {
                return -1;
            }

            if (currentPosition < 0) {
                currentPosition = arrayLength - Math.abs(currentPosition);
            }

            for (loopIndex = currentPosition; loopIndex < arrayLength; loopIndex++) {
                if (this[loopIndex] === itemToFind) {
                    return loopIndex;
                }
            }
            return -1;
        };
    }

    // Collection of internal utility functions. Not exposed globally.
    var utilHelpers = {
        // Retrieves current viewport dimensions.
        getWindowDimensions: function() {
            var docElement = globalScope.document.documentElement || globalScope.document.body,
                propName = 'inner'; // Default for modern browsers

            // Fallback for older IE versions.
            if (!('innerWidth' in globalScope)) {
                propName = 'client';
            }
            return {
                width: globalScope[propName + 'Width'] || docElement[propName + 'Width'],
                height: globalScope[propName + 'Height'] || docElement[propName + 'Height']
            };
        },
        // Handles window resize events, applying throttling if configured.
        handleResizeEvent: function() {
            if (textScaler.config.enableThrottling) {
                clearTimeout(utilHelpers.handleResizeEvent.timerId);
                utilHelpers.handleResizeEvent.timerId = setTimeout(utilHelpers.processAllRules, textScaler.config.updateDelayMs);
            } else {
                utilHelpers.processAllRules();
            }
        },
        // Iterates through all registered font rules and triggers their update.
        processAllRules: function() {
            var totalRules = managedRules.length;
            for (var k = 0; k < totalRules; k++) {
                // Check if the rule is still valid before updating.
                if (managedRules[k] && typeof managedRules[k].recalculateAndApply === 'function') {
                    managedRules[k].recalculateAndApply();
                }
            }
        },
        // Helper to safely get document head.
        getDocHead: function() {
            return globalScope.document.head || globalScope.document.getElementsByTagName('head')[0];
        }
    };

    // Attach the resize event listener to the window.
    // Using a named function for the timer ID allows for easy clearing.
    globalScope.addEventListener ?
        globalScope.addEventListener('resize', utilHelpers.handleResizeEvent, false) :
        globalScope.attachEvent('onresize', utilHelpers.handleResizeEvent); // IE < 9 fallback
    utilHelpers.handleResizeEvent.timerId = null; // Initialize timer for throttling

    // Define the main global object and its factory function.
    var textScaler;
    globalScope.textScaler = textScaler = function(cssTarget) {
        // Input validation for the selector.
        if (typeof cssTarget !== 'string' || cssTarget.trim() === '') {
            console.warn("textScaler: Invalid CSS selector provided. Rule might not apply correctly.");
            // Or throw an error, depending on desired strictness. For Type III, adding a warning is good.
            // throw new Error("A valid CSS selector string is required.");
        }
        // Creates and returns a new instance of the AdaptiveFontRule.
        return new AdaptiveFontRule(cssTarget);
    };

    // Configuration options for textScaler.
    // Using a nested object for better organization and potential future expansion.
    textScaler.config = {
        baseUnit: 'px',           // Default unit for font-size.
        enableThrottling: false,  // Performance option for resize events.
        updateDelayMs: 500,       // Delay in milliseconds if throttling is enabled.
        prioritizeStyle: false,   // If true, adds '!important' to the style.
        breakpointAxis: 'width'   // Default dimension for media queries ('width' or 'height').
    };

    // Method to set configuration options.
    // Now uses Object.keys and a more explicit check.
    textScaler.setOptions = function(configObject) {
        if (typeof configObject !== 'object' || configObject === null) {
            console.warn("textScaler.setOptions: Configuration object must be a non-null object.");
            return;
        }
        for (var propKey in configObject) {
            if (textScaler.config.hasOwnProperty(propKey)) { // Only update known properties.
                textScaler.config[propKey] = configObject[propKey];
            } else {
                console.warn("textScaler.setOptions: Unknown configuration property '" + propKey + "'. Ignoring.");
            }
        }
    };

    // Provides an iteration method over all managed font rules.
    textScaler.forEachRule = function(iteratorFn) {
        if (typeof iteratorFn !== 'function') {
            console.error("textScaler.forEachRule: Callback function must be provided.");
            return;
        }
        var currentRuleCount = managedRules.length;
        for (var idx = 0; idx < currentRuleCount; idx++) {
            // Call the iterator function with context and arguments.
            iteratorFn.call(managedRules[idx], idx, managedRules[idx]);
        }
    };

    // Internal array to hold references to all active font rules.
    var managedRules = [];

    // Constructor function for an individual scalable font rule.
    function AdaptiveFontRule(cssTarget) {
        // Register this new rule instance.
        managedRules.push(this);

        // Unique ID for this rule, useful for debugging and internal tracking.
        this.ruleId = 'ts-rule-' + (Math.random().toString(36).substr(2, 9));

        // Initial settings for this specific font rule instance.
        this.targetSelector = cssTarget;
        this.breakpointMap = { width: {}, height: {} }; // Stores breakpoints for width and height.
        this.activeUnit = textScaler.config.baseUnit;
        this.dimensionBasis = textScaler.config.breakpointAxis;
        this.prioritySuffix = textScaler.config.prioritizeStyle ? ' !important' : '';

        // Create and append a <style> element to the document head for this rule.
        this.domStyleNode = globalScope.document.createElement('style');
        this.domStyleNode.setAttribute('type', 'text/css');
        this.domStyleNode.setAttribute('data-textscaler-id', this.ruleId); // Custom attribute for identification.

        var headElement = utilHelpers.getDocHead();
        if (headElement) {
            headElement.appendChild(this.domStyleNode);
        } else {
            console.error("textScaler: Could not find document head to append style element.");
            // Handle this gracefully, perhaps by adding to body or throwing.
        }

        // Initialize the style rule.
        // Simplified error handling, assuming modern browser CSSOM access or basic innerHTML.
        try {
            this.domStyleNode.innerHTML = this.targetSelector + ' {}';
        } catch (e) {
            // Fallback for older IE that might use styleSheet.cssText.
            if (this.domStyleNode.styleSheet) {
                this.domStyleNode.styleSheet.cssText = this.targetSelector + ' {}';
            } else {
                console.error("textScaler: Failed to initialize style rule for selector: " + cssTarget, e);
            }
        }
    }

    // Prototype methods for AdaptiveFontRule instances.
    AdaptiveFontRule.prototype = {
        // Changes the CSS selector for this rule.
        modifyTarget: function(newSelector) {
            if (typeof newSelector !== 'string' || newSelector.trim() === '') {
                console.warn("AdaptiveFontRule.modifyTarget: Invalid new CSS selector provided.");
                return this;
            }
            this.targetSelector = newSelector;
            // A more robust way to update the selector might involve re-generating the entire rule,
            // or using CSSRuleList if supported, but for simplicity, we'll replace the existing.
            // This approach is a bit fragile if the rule content is complex.
            this.domStyleNode.innerHTML = this.domStyleNode.innerHTML.replace(/^[^{]*/, this.targetSelector);
            return this;
        },

        // Defines or updates breakpoint values and their corresponding font sizes.
        defineBreakpoints: function(breakpointConfig, basisOverride) {
            if (typeof breakpointConfig !== 'object' || breakpointConfig === null) {
                console.warn("AdaptiveFontRule.defineBreakpoints: Breakpoint configuration must be an object.");
                return this;
            }

            // Determine the axis (width/height) for these breakpoints.
            var effectiveBasis = this.dimensionBasis; // Default to instance setting.

            if (typeof basisOverride === 'string') {
                var normalizedBasis = basisOverride.toLowerCase();
                if (normalizedBasis === 'height' || normalizedBasis === 'width') {
                    effectiveBasis = normalizedBasis;
                } else {
                    console.warn("AdaptiveFontRule.defineBreakpoints: Invalid basisOverride '" + basisOverride + "'. Using default '" + effectiveBasis + "'.");
                }
            }

            // Ensure the breakpoint map for the effective basis exists.
            if (!this.breakpointMap[effectiveBasis]) {
                this.breakpointMap[effectiveBasis] = {};
            }

            // Add or update breakpoints. Ensure values are numbers.
            for (var breakpointPx in breakpointConfig) {
                var fontSizeVal = parseFloat(breakpointConfig[breakpointPx]);
                if (!isNaN(fontSizeVal)) {
                    this.breakpointMap[effectiveBasis][breakpointPx] = fontSizeVal;
                } else {
                    console.warn("AdaptiveFontRule.defineBreakpoints: Invalid font size value for breakpoint '" + breakpointPx + "'. Skipping.");
                }
            }

            // Trigger an immediate update after defining new breakpoints.
            return this.recalculateAndApply();
        },

        // Gets or sets the font size unit (e.g., 'px', 'em', '%').
        getSetUnit: function(newUnit) {
            if (newUnit === undefined) {
                return this.activeUnit; // Return current unit if no argument.
            } else {
                if (typeof newUnit === 'string' && newUnit.trim() !== '') {
                    this.activeUnit = newUnit; // Set new unit.
                } else {
                    console.warn("AdaptiveFontRule.getSetUnit: Invalid unit type provided. Must be a non-empty string.");
                }
                return this.recalculateAndApply(); // Update and return instance.
            }
        },

        // Core method: Recalculates the font size based on current viewport and breakpoints, then applies it.
        recalculateAndApply: function() {
            var currentViewport = utilHelpers.getWindowDimensions(),
                widthKeys = Object.keys(this.breakpointMap.width).map(Number).sort(function(a, b) { return a - b; }), // Convert to numbers and sort
                heightKeys = Object.keys(this.breakpointMap.height).map(Number).sort(function(a, b) { return a - b; });

            var interpolatedWidthPx = 0,
                interpolatedHeightPx = 0,
                hasWidthBreakpoints = widthKeys.length > 0,
                hasHeightBreakpoints = heightKeys.length > 0;

            // Helper function for linear interpolation.
            var interpolate = function(currentDimension, sortedKeys, breakpointMap) {
                var lowerBound = null, upperBound = null;
                var lowerVal = 0, higherVal = 0;

                // Find the appropriate lower and upper bounds.
                for (var i = 0; i < sortedKeys.length; i++) {
                    if (sortedKeys[i] <= currentDimension) {
                        lowerBound = sortedKeys[i];
                        upperBound = sortedKeys[i + 1]; // This might be undefined if at last key.
                    } else {
                        break; // Dimension is smaller than current breakpoint, so lowerBound is the last one found.
                    }
                }

                if (lowerBound === null) {
                    // If currentDimension is smaller than all breakpoints, use the smallest one if available.
                    if (sortedKeys.length > 0) {
                        return breakpointMap[sortedKeys[0]];
                    }
                    return 0; // No breakpoints defined.
                }

                lowerVal = breakpointMap[lowerBound];

                if (upperBound !== undefined && breakpointMap[upperBound] !== undefined) {
                    // Interpolate between two breakpoints.
                    higherVal = breakpointMap[upperBound];
                    var range = upperBound - lowerBound;
                    if (range === 0) return lowerVal; // Avoid division by zero if bounds are same.
                    return (((currentDimension - lowerBound) / range) * (higherVal - lowerVal)) + lowerVal;
                } else {
                    // Use the value of the highest breakpoint reached.
                    return lowerVal;
                }
            };

            if (hasWidthBreakpoints) {
                interpolatedWidthPx = interpolate(currentViewport.width, widthKeys, this.breakpointMap.width);
            }

            if (hasHeightBreakpoints) {
                interpolatedHeightPx = interpolate(currentViewport.height, heightKeys, this.breakpointMap.height);
            }

            var finalFontSizePx = 0;
            var activeDimensions = 0; // Count how many dimensions are actively contributing.

            if (hasWidthBreakpoints && interpolatedWidthPx > 0) {
                finalFontSizePx += interpolatedWidthPx;
                activeDimensions++;
            }
            if (hasHeightBreakpoints && interpolatedHeightPx > 0) {
                finalFontSizePx += interpolatedHeightPx;
                activeDimensions++;
            }

            // If both width and height contribute, average them. Otherwise, use the single contributing value.
            if (activeDimensions > 1) {
                finalFontSizePx /= activeDimensions;
            } else if (activeDimensions === 0) {
                // If no breakpoints are active, or no dimension contributes, use a fallback (e.g., 0).
                finalFontSizePx = 0;
            }

            var computedCssRule = 'font-size: ' + finalFontSizePx + this.activeUnit + this.prioritySuffix + ';';

            // Update the style element.
            try {
                // Regex to replace content within the first {} block.
                // This is a bit more robust than previous, ensuring we only modify the rule.
                this.domStyleNode.innerHTML = this.domStyleNode.innerHTML.replace(/\{[^}]*\}/, '{' + computedCssRule + '}');
            } catch (e) {
                // Fallback for older IE.
                if (this.domStyleNode.styleSheet) {
                    this.domStyleNode.styleSheet.cssText = this.domStyleNode.styleSheet.cssText.replace(/\{[^}]*\}/, '{' + computedCssRule + '}');
                } else {
                    console.error("textScaler: Failed to update style for selector: " + this.targetSelector, e);
                }
            }

            return this; // Allow method chaining.
        },

        // Removes this specific font rule and its associated style element from the DOM.
        disposeRule: function() {
            // Remove from the global list of managed rules.
            var ruleIndex = managedRules.indexOf(this);
            if (ruleIndex > -1) {
                managedRules.splice(ruleIndex, 1);
            }

            // Remove the <style> element from the document head.
            var headElement = utilHelpers.getDocHead();
            if (headElement && this.domStyleNode && this.domStyleNode.parentNode === headElement) { // Check parent before removing
                headElement.removeChild(this.domStyleNode);
            }
            // Clear references to aid garbage collection.
            this.domStyleNode = null;
            this.breakpointMap = null;
            this.targetSelector = null;
            this.ruleId = null;
        },

        // Sets or unsets the '!important' flag for this style rule.
        setPriorityStatus: function(shouldBeImportant) {
            // Coerce to boolean. If undefined or true, set to important.
            this.prioritySuffix = (shouldBeImportant === undefined || !!shouldBeImportant) ? ' !important' : '';
            return this.recalculateAndApply(); // Re-apply style with new priority.
        }
    };
})(window);