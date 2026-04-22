// Utility for logging messages to console, with history tracking.
// Adapted from paulirish.com/2009/log-a-lightweight-wrapper-for-consolelog/
window.appLog = function displayAndStoreLogEntry() {
    // Ensure history array exists; initialize if not.
    window.appLog.messageHistory = window.appLog.messageHistory || [];

    // Store the current arguments for later review.
    window.appLog.messageHistory.push(arguments);

    // Check if the browser's console object is available.
    if (this.console) {
        var logArguments = arguments;
        var processedArgs;

        // If the function was called directly, its caller might be useful.
        // Note: arguments.callee is deprecated in strict mode, but this code is old.
        // For a Type III clone, we might remove this or rewrite it significantly.
        // Let's keep it for functional similarity, but make it less direct.
        var invocationContext = logArguments.callee;
        if (invocationContext && invocationContext.caller) {
            // This line is tricky as `callee` is deprecated.
            // For a clone, let's just ensure the arguments are array-like for `slice`.
            // We'll skip setting `callee` on `args` directly as it's problematic.
        }

        // Convert arguments object to a proper array.
        processedArgs = Array.prototype.slice.call(logArguments);

        // Determine the correct way to call console.log.
        // Some older IE versions had console.log as an object, not a function.
        var consoleLogger = console.log;
        if (typeof consoleLogger === 'object' && typeof consoleLogger.apply === 'function') {
            // Specific handling for environments where console.log is an object.
            consoleLogger.apply(console, processedArgs);
        } else if (typeof consoleLogger === 'function') {
            // Standard function call.
            consoleLogger.apply(console, processedArgs);
        } else {
            // Fallback if console.log is not a function or an object with apply.
            // Could simply iterate and print, but original implied single call.
            // For Type III, let's add a robust fallback.
            if (console.warn) {
                console.warn("appLog: console.log not callable, attempting direct print:", processedArgs);
            } else if (console.info) {
                console.info("appLog: console.log not callable, attempting direct print:", processedArgs);
            }
        }
    }
};


// Ensure console methods are always available, even if console object is missing.
(function(consoleObjRef) {
    // A dummy function to replace missing console methods.
    function noopFunc() { /* intentionally empty */ }

    // List of common console methods.
    var consoleMethods = [
        "assert", "count", "debug", "dir", "dirxml", "error", "exception",
        "group", "groupCollapsed", "groupEnd", "info", "log", "markTimeline",
        "profile", "profileEnd", "time", "timeEnd", "trace", "warn"
    ];

    // Iterate through methods and assign noopFunc if they don't exist.
    // Using a while loop with pop for efficiency and variation from original.
    var currentMethod;
    var methodCount = consoleMethods.length; // Cache length for loop condition.
    while (methodCount--) {
        currentMethod = consoleMethods[methodCount];
        if (!consoleObjRef[currentMethod]) {
            consoleObjRef[currentMethod] = noopFunc;
        }
    }
})
// Immediately invoke the wrapper with a safe console object.
((function() {
    var globalConsole = window.console;
    if (globalConsole && typeof globalConsole.log === 'function') {
        try {
            // Test if console.log is functional to avoid errors in some environments.
            globalConsole.log('Console check: OK');
            return globalConsole;
        } catch (e) {
            // If console.log throws an error, return a dummy console.
            return (window.console = {});
        }
    } else {
        // If console is not defined or log is not a function, return a dummy.
        return (window.console = {});
    }
})());


// Store custom jQuery/helper plugins here to reduce HTTP requests.

/**
 * Enhanced Color Palette Selector 1.2
 * © 2008 Steven Wittens (Modified for Type III clone)
 *
 * This software is provided under the terms of the GNU General Public License (GPL),
 * version 2 or later, as published by the Free Software Foundation.
 *
 * It is distributed WITHOUT ANY WARRANTY, expressed or implied,
 * including but not limited to the warranties of MERCHANTABILITY or FITNESS FOR A
 * PARTICULAR PURPOSE. Refer to the GNU GPL for full details.
 *
 * A copy of the GNU GPL should be included with this distribution.
 * If not, please contact the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 */
(function(domUtil) {
domUtil.fn.colorPalette = function (updateHandler) {
    domUtil.colorPalette(this, updateHandler);
    return this; // Allow chaining
};

domUtil.colorPalette = function (targetContainer, updateHandler) {
    var resolvedContainer = domUtil(targetContainer).get(0);
    // Return existing instance or create a new one.
    if (resolvedContainer.paletteInstance) {
        return resolvedContainer.paletteInstance;
    } else {
        var newInstance = new domUtil._ColorPalette(resolvedContainer, updateHandler);
        resolvedContainer.paletteInstance = newInstance;
        return newInstance;
    }
};

domUtil._ColorPalette = function (hostNode, updateHandler) {
    // Reference to the current color palette instance.
    var currentPalette = this;

    // Inject the necessary HTML structure into the host node.
    domUtil(hostNode).html('<div class="color-palette-widget"><div class="color-display"></div><div class="color-wheel"></div><div class="color-overlay"></div><div class="hue-marker marker"></div><div class="sl-marker marker"></div></div>');
    var widgetRoot = domUtil('.color-palette-widget', hostNode);
    currentPalette.wheelElement = domUtil('.color-wheel', hostNode).get(0);

    // Define key dimensions for the color picker geometry.
    const wheelRadius = 84;
    const squareSize = 100;
    const totalWidgetWidth = 194;

    currentPalette.geometry = {
        radius: wheelRadius,
        square: squareSize,
        width: totalWidgetWidth
    };

    // Legacy IE6 background image fix (Type III: simplified filter string, removed check for currentStyle.backgroundImage != 'none')
    // This block is kept but slightly modified for Type III, as removing it entirely might change behavior for old browsers.
    if (navigator.appVersion.match(/MSIE [0-6]\./)) {
        domUtil('*', widgetRoot).each(function () {
            var elementStyle = this.currentStyle;
            // Check if the element has a background image defined.
            if (elementStyle && elementStyle.backgroundImage && elementStyle.backgroundImage !== 'none') {
                var imgPath = elementStyle.backgroundImage.slice(5, -2); // Extract URL from "url(path)".
                domUtil(this).css({
                    'backgroundImage': 'none', // Remove CSS background image.
                    'filter': "progid:DXImageTransform.Microsoft.AlphaImageLoader(enabled='true', sizingMethod='crop', src='" + imgPath + "')"
                });
            }
        });
    }

    /**
     * Establishes a link to an input element(s) or a custom callback function.
     * @param {Function|String|HTMLElement|jQuery} target The element(s) or function to link to.
     */
    currentPalette.associateWith = function (target) {
        // Unbind any previously linked elements to prevent multiple updates.
        if (typeof currentPalette.updateTarget === 'object' && currentPalette.updateTarget.jquery) {
            currentPalette.updateTarget.off('keyup', currentPalette.handleValueChange);
        }

        // Reset the stored color to force an update when a new link is established.
        currentPalette.currentColor = null;

        // Bind the new target.
        if (typeof target === 'function') {
            currentPalette.updateTarget = target;
        } else if (typeof target === 'object' || typeof target === 'string') {
            var linkedElements = domUtil(target);
            if (linkedElements.length > 0) {
                currentPalette.updateTarget = linkedElements;
                currentPalette.updateTarget.on('keyup', currentPalette.handleValueChange);
                // Initialize color from the first linked element's value if available.
                var firstElementValue = linkedElements.eq(0).val();
                if (firstElementValue) {
                    currentPalette.setHexColor(firstElementValue);
                }
            } else {
                console.warn("ColorPalette: No elements found for the provided target:", target);
            }
        }
        return this;
    };

    // Event handler for keyup on linked input fields.
    currentPalette.handleValueChange = function (event) {
        var inputVal = domUtil(this).val();
        if (inputVal && inputVal !== currentPalette.currentColor) {
            currentPalette.setHexColor(inputVal);
        }
    };

    /**
     * Sets the color using an HTML hex string (e.g., "#RRGGBB" or "#RGB").
     * @param {string} hexColor The color in hex format.
     */
    currentPalette.setHexColor = function (hexColor) {
        var unpackedRGB = currentPalette.parseHex(hexColor);
        // Only update if color is new and valid.
        if (currentPalette.currentColor !== hexColor && unpackedRGB) {
            currentPalette.currentColor = hexColor;
            currentPalette.currentRGB = unpackedRGB;
            currentPalette.currentHSL = currentPalette.convertRGBToHSL(currentPalette.currentRGB);
            currentPalette.refreshDisplay();
        }
        return this;
    };

    /**
     * Sets the color using an HSL triplet [hue, saturation, lightness].
     * @param {Array<number>} hslTriplet HSL values, each between 0 and 1.
     */
    currentPalette.setHSLColor = function (hslTriplet) {
        // Validate HSL input, ensure values are within [0, 1] range.
        var validatedHSL = hslTriplet.map(function(val) { return Math.max(0, Math.min(1, val)); });

        currentPalette.currentHSL = validatedHSL;
        currentPalette.currentRGB = currentPalette.convertHSLToRGB(validatedHSL);
        currentPalette.currentColor = currentPalette.formatRGBToHex(currentPalette.currentRGB);
        currentPalette.refreshDisplay();
        return this;
    };

    /////////////////////////////////////////////////////
    // Helper functions for coordinate and event handling.

    /**
     * Calculates event coordinates relative to the widget's center.
     * Accounts for different browser event models (offsetX/Y vs. pageX/Y).
     * @param {Event} evt The DOM event object.
     * @returns {{x: number, y: number}} Coordinates relative to the center.
     */
    currentPalette.getWidgetRelativeCoords = function (evt) {
        var coordX, coordY;
        var eventTarget = evt.target || evt.srcElement;
        var referenceElement = currentPalette.wheelElement;
        var widgetCenterOffset = currentPalette.geometry.width / 2;

        if (typeof evt.offsetX !== 'undefined') {
            // Browser supports offsetX/Y (e.g., IE, Chrome, Safari).
            // Traverse up the offsetParent chain to get cumulative offset.
            var currentPos = { x: evt.offsetX, y: evt.offsetY };
            var elementIterator = eventTarget;
            while (elementIterator) {
                elementIterator._tempMouseX = currentPos.x;
                elementIterator._tempMouseY = currentPos.y;
                currentPos.x += elementIterator.offsetLeft;
                currentPos.y += elementIterator.offsetTop;
                elementIterator = elementIterator.offsetParent;
            }

            // Now traverse down from the reference element to find stored coords.
            elementIterator = referenceElement;
            var accumulatedOffset = { x: 0, y: 0 };
            while (elementIterator) {
                if (typeof elementIterator._tempMouseX !== 'undefined') {
                    coordX = elementIterator._tempMouseX - accumulatedOffset.x;
                    coordY = elementIterator._tempMouseY - accumulatedOffset.y;
                    break;
                }
                accumulatedOffset.x += elementIterator.offsetLeft;
                accumulatedOffset.y += elementIterator.offsetTop;
                elementIterator = elementIterator.offsetParent;
            }

            // Clean up temporary properties.
            elementIterator = eventTarget;
            while (elementIterator) {
                delete elementIterator._tempMouseX;
                delete elementIterator._tempMouseY;
                elementIterator = elementIterator.offsetParent;
            }
        } else {
            // Fallback for browsers without offsetX/Y (e.g., Firefox).
            // Use pageX/Y and calculate absolute position of the reference element.
            var absPos = currentPalette.getAbsolutePosition(referenceElement);
            coordX = (evt.pageX || 0) - absPos.x;
            coordY = (evt.pageY || 0) - absPos.y;
        }
        // Adjust coordinates to be relative to the center of the widget.
        return { x: coordX - widgetCenterOffset, y: coordY - widgetCenterOffset };
    };

    /**
     * Mousedown event handler for the color picker.
     * Initiates dragging and determines if hue or saturation/lightness is being adjusted.
     * @param {Event} evt The mousedown event.
     */
    currentPalette.onMouseDown = function (evt) {
        // Prevent default browser drag behavior.
        evt.preventDefault();

        // If not already dragging, bind mousemove and mouseup to the document.
        if (!document.isColorPickerDragging) {
            domUtil(document).on('mousemove', currentPalette.onMouseMove);
            domUtil(document).on('mouseup', currentPalette.onMouseUp);
            document.isColorPickerDragging = true;
        }

        // Determine if the user clicked on the color wheel (hue) or the saturation/lightness square.
        var clickCoords = currentPalette.getWidgetRelativeCoords(evt);
        var distanceFromCenter = Math.max(Math.abs(clickCoords.x), Math.abs(clickCoords.y));
        currentPalette.isHueDragging = (distanceFromCenter * 2) > currentPalette.geometry.square;

        // Process the initial click as a mousemove.
        currentPalette.onMouseMove(evt);
        return false; // Prevent further event propagation.
    };

    /**
     * Mousemove event handler during dragging.
     * Updates HSL values based on mouse position.
     * @param {Event} evt The mousemove event.
     */
    currentPalette.onMouseMove = function (evt) {
        // Get coordinates relative to the color picker's center.
        var currentCoords = currentPalette.getWidgetRelativeCoords(evt);
        var currentHSL = currentPalette.currentHSL; // Get current HSL values for partial updates.

        // Update HSL parameters based on which area is being dragged.
        if (currentPalette.isHueDragging) {
            // Calculate hue from the angle around the center.
            var newHue = Math.atan2(currentCoords.x, -currentCoords.y) / (2 * Math.PI);
            if (newHue < 0) {
                newHue += 1; // Ensure hue is always positive.
            }
            currentPalette.setHSLColor([newHue, currentHSL[1], currentHSL[2]]);
        } else {
            // Calculate saturation and lightness from position within the square.
            var newSaturation = Math.max(0, Math.min(1, -(currentCoords.x / currentPalette.geometry.square) + 0.5));
            var newLightness = Math.max(0, Math.min(1, -(currentCoords.y / currentPalette.geometry.square) + 0.5));
            currentPalette.setHSLColor([currentHSL[0], newSaturation, newLightness]);
        }
        return false; // Prevent further event propagation.
    };

    /**
     * Mouseup event handler.
     * Cleans up event listeners and resets dragging state.
     */
    currentPalette.onMouseUp = function () {
        // Unbind document-level mousemove and mouseup listeners.
        domUtil(document).off('mousemove', currentPalette.onMouseMove);
        domUtil(document).off('mouseup', currentPalette.onMouseUp);
        document.isColorPickerDragging = false;
    };

    /**
     * Updates the visual display of the color picker (markers, gradients, linked elements).
     */
    currentPalette.refreshDisplay = function () {
        // Calculate marker positions based on current HSL.
        var hueAngle = currentPalette.currentHSL[0] * (2 * Math.PI); // Convert hue to radians.
        var hueMarkerPositionX = Math.round(Math.sin(hueAngle) * currentPalette.geometry.radius + currentPalette.geometry.width / 2);
        var hueMarkerPositionY = Math.round(-Math.cos(hueAngle) * currentPalette.geometry.radius + currentPalette.geometry.width / 2);

        domUtil('.hue-marker', widgetRoot).css({
            left: hueMarkerPositionX + 'px',
            top: hueMarkerPositionY + 'px'
        });

        var slMarkerPositionX = Math.round(currentPalette.geometry.square * (0.5 - currentPalette.currentHSL[1]) + currentPalette.geometry.width / 2);
        var slMarkerPositionY = Math.round(currentPalette.geometry.square * (0.5 - currentPalette.currentHSL[2]) + currentPalette.geometry.width / 2);

        domUtil('.sl-marker', widgetRoot).css({
            left: slMarkerPositionX + 'px',
            top: slMarkerPositionY + 'px'
        });

        // Update the background color of the saturation/lightness square.
        // It should show a gradient from the current hue at full saturation, 50% lightness.
        var baseHueRGB = currentPalette.convertHSLToRGB([currentPalette.currentHSL[0], 1, 0.5]);
        domUtil('.color-display', widgetRoot).css('backgroundColor', currentPalette.formatRGBToHex(baseHueRGB));

        // Update linked elements or invoke the callback function.
        if (typeof currentPalette.updateTarget === 'object' && currentPalette.updateTarget.jquery) {
            // Update background/foreground color of linked jQuery elements.
            currentPalette.updateTarget.css({
                backgroundColor: currentPalette.currentColor,
                color: currentPalette.currentHSL[2] > 0.5 ? '#000' : '#fff' // Text color for contrast.
            });

            // Update the value of linked input fields.
            currentPalette.updateTarget.each(function() {
                var currentInput = domUtil(this);
                if (currentInput.is('input') && currentInput.val() !== currentPalette.currentColor) {
                    currentInput.val(currentPalette.currentColor);
                }
            });
        } else if (typeof currentPalette.updateTarget === 'function') {
            // Invoke the callback function with the new color.
            currentPalette.updateTarget.call(currentPalette, currentPalette.currentColor);
        }
    };

    /**
     * Calculates the absolute position of a DOM element on the page.
     * @param {HTMLElement} element The element to get the position for.
     * @returns {{x: number, y: number}} The absolute x and y coordinates.
     */
    currentPalette.getAbsolutePosition = function (element) {
        var currentOffset = { x: element.offsetLeft, y: element.offsetTop };
        // Recursively add offsets from parent elements.
        if (element.offsetParent) {
            var parentOffset = currentPalette.getAbsolutePosition(element.offsetParent);
            currentOffset.x += parentOffset.x;
            currentOffset.y += parentOffset.y;
        }
        return currentOffset;
    };

    /* --- Color Conversion Utilities --- */

    /**
     * Converts an RGB triplet (0-1 range) to a hex color string.
     * @param {Array<number>} rgb An array [r, g, b] where each is 0-1.
     * @returns {string} Hex color string, e.g., "#RRGGBB".
     */
    currentPalette.formatRGBToHex = function (rgb) {
        var red = Math.round(rgb[0] * 255);
        var green = Math.round(rgb[1] * 255);
        var blue = Math.round(rgb[2] * 255);

        // Helper to convert single color component to two-digit hex.
        var toHex = function(c) {
            var hex = Math.abs(c).toString(16); // Ensure positive, then to hex.
            return hex.length === 1 ? '0' + hex : hex;
        };

        return '#' + toHex(red) + toHex(green) + toHex(blue);
    };

    /**
     * Parses a hex color string ("#RRGGBB" or "#RGB") into an RGB triplet (0-1 range).
     * @param {string} hexCode The hex color string.
     * @returns {Array<number>|null} An array [r, g, b] or null if invalid.
     */
    currentPalette.parseHex = function (hexCode) {
        if (!hexCode || typeof hexCode !== 'string') {
            return null;
        }
        var cleanedHex = hexCode.startsWith('#') ? hexCode.substring(1) : hexCode;
        var r, g, b;

        if (cleanedHex.length === 6) {
            // #RRGGBB format
            r = parseInt(cleanedHex.substring(0, 2), 16) / 255;
            g = parseInt(cleanedHex.substring(2, 4), 16) / 255;
            b = parseInt(cleanedHex.substring(4, 6), 16) / 255;
        } else if (cleanedHex.length === 3) {
            // #RGB shorthand format
            r = parseInt(cleanedHex.charAt(0) + cleanedHex.charAt(0), 16) / 255;
            g = parseInt(cleanedHex.charAt(1) + cleanedHex.charAt(1), 16) / 255;
            b = parseInt(cleanedHex.charAt(2) + cleanedHex.charAt(2), 16) / 255;
        } else {
            // Invalid hex format.
            return null;
        }
        return [r, g, b];
    };

    /**
     * Converts HSL values to RGB values.
     * @param {Array<number>} hsl An array [h, s, l] where each is 0-1.
     * @returns {Array<number>} An array [r, g, b] where each is 0-1.
     */
    currentPalette.convertHSLToRGB = function (hsl) {
        var h = hsl[0], s = hsl[1], l = hsl[2];
        var c = (1 - Math.abs(2 * l - 1)) * s; // Chroma
        var x = c * (1 - Math.abs((h * 6) % 2 - 1)); // Second largest component
        var m = l - c / 2; // Match lightness

        var r = 0, g = 0, b = 0;

        if (0 <= h && h < 1/6) {
            r = c; g = x; b = 0;
        } else if (1/6 <= h && h < 2/6) {
            r = x; g = c; b = 0;
        } else if (2/6 <= h && h < 3/6) {
            r = 0; g = c; b = x;
        } else if (3/6 <= h && h < 4/6) {
            r = 0; g = x; b = c;
        } else if (4/6 <= h && h < 5/6) {
            r = x; g = 0; b = c;
        } else if (5/6 <= h && h < 1) {
            r = c; g = 0; b = x;
        }

        return [r + m, g + m, b + m];
    };

    /**
     * Converts RGB values to HSL values.
     * @param {Array<number>} rgb An array [r, g, b] where each is 0-1.
     * @returns {Array<number>} An array [h, s, l] where each is 0-1.
     */
    currentPalette.convertRGBToHSL = function (rgb) {
        var r = rgb[0], g = rgb[1], b = rgb[2];
        var maxVal = Math.max(r, g, b);
        var minVal = Math.min(r, g, b);
        var h = 0, s = 0, l = (maxVal + minVal) / 2;

        if (maxVal === minVal) {
            // achromatic (no hue, no saturation)
            h = 0;
            s = 0;
        } else {
            var diff = maxVal - minVal;
            s = l > 0.5 ? diff / (2 - maxVal - minVal) : diff / (maxVal + minVal);

            switch (maxVal) {
                case r:
                    h = (g - b) / diff + (g < b ? 6 : 0);
                    break;
                case g:
                    h = (b - r) / diff + 2;
                    break;
                case b:
                    h = (r - g) / diff + 4;
                    break;
            }
            h /= 6;
        }
        return [h, s, l];
    };

    // Attach the main mousedown event handler to the widget root.
    // Using event delegation on the root to catch clicks on any child elements.
    domUtil(widgetRoot).on('mousedown', currentPalette.onMouseDown);

    // Initialize the color to black by default.
    currentPalette.setHexColor('#000000');

    // If an initial callback or target was provided, link to it.
    if (updateHandler) {
        currentPalette.associateWith(updateHandler);
    }
};
}(jQuery));

(function (domUtil) {

    var weekDayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var monthShortNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var monthLongNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];
    var shortMonthNameToNumberMap = {};
    shortMonthNameToNumberMap["Jan"] = "01";
    shortMonthNameToNumberMap["Feb"] = "02";
    shortMonthNameToNumberMap["Mar"] = "03";
    shortMonthNameToNumberMap["Apr"] = "04";
    shortMonthNameToNumberMap["May"] = "05";
    shortMonthNameToNumberMap["Jun"] = "06";
    shortMonthNameToNumberMap["Jul"] = "07";
    shortMonthNameToNumberMap["Aug"] = "08";
    shortMonthNameToNumberMap["Sep"] = "09";
    shortMonthNameToNumberMap["Oct"] = "10";
    shortMonthNameToNumberMap["Nov"] = "11";
    shortMonthNameToNumberMap["Dec"] = "12";

    domUtil.formatter = (function () {
        function getDayName(dayIndex) {
            return weekDayNames[parseInt(dayIndex, 10)] || dayIndex;
        }

        function getMonthShortName(monthIndex) {
            var adjustedIndex = parseInt(monthIndex, 10) - 1;
            return monthShortNames[adjustedIndex] || monthIndex;
        }

        function getMonthLongName(monthIndex) {
            var adjustedIndex = parseInt(monthIndex, 10) - 1;
            return monthLongNames[adjustedIndex] || monthIndex;
        }

        var convertShortMonthToNumber = function (monthName) {
            return shortMonthNameToNumberMap[monthName] || monthName;
        };

        var parseTimeString = function (timeStr) {
            var timeDetails = {
                fullTime: "",
                hour: "",
                minute: "",
                second: "",
                milliseconds: ""
            };
            if (!timeStr || typeof timeStr !== 'string') {
                return timeDetails;
            }

            var workingTime = timeStr;
            var msPart = "";
            var decimalIndex = workingTime.indexOf(".");
            if (decimalIndex !== -1) {
                msPart = workingTime.substring(decimalIndex + 1);
                workingTime = workingTime.substring(0, decimalIndex);
            }

            var timeComponents = workingTime.split(":");

            if (timeComponents.length === 3) {
                timeDetails.fullTime = workingTime;
                timeDetails.hour = timeComponents[0];
                timeDetails.minute = timeComponents[1];
                timeDetails.second = timeComponents[2];
                timeDetails.milliseconds = msPart;
            }
            return timeDetails;
        };

        return {
            date:function (inputVal, outputFormat) {
                // Ensure outputFormat is provided, or use a default.
                outputFormat = outputFormat || "YYYY-MM-DD HH:mm:ss";

                var parsedDate = null;
                var yearVal = null;
                var monthVal = null;
                var dayOfMonthVal = null;
                var dayOfWeekVal = null;
                var timeInfo = null;

                // Handle numeric timestamps (milliseconds since epoch).
                if (typeof inputVal === "number") {
                    return this.date(new Date(inputVal), outputFormat);
                }
                // Handle Date objects directly.
                else if (inputVal instanceof Date && typeof inputVal.getFullYear === "function") {
                    parsedDate = inputVal;
                    yearVal = parsedDate.getFullYear();
                    monthVal = parsedDate.getMonth() + 1; // getMonth() is 0-indexed.
                    dayOfMonthVal = parsedDate.getDate();
                    dayOfWeekVal = parsedDate.getDay();
                    timeInfo = parseTimeString(parsedDate.toTimeString().split(' ')[0]); // Extract time part only.
                }
                // Handle ISO 8601-like strings: YYYY-MM-DDTHH:mm:ss.sss[+-]ZZ:ZZ
                else if (typeof inputVal === 'string' && inputVal.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})?([+-]\d{2}:?\d{2})?$/)) {
                    var isoParts = inputVal.split(/[T+-]/);
                    yearVal = isoParts[0];
                    monthVal = isoParts[1];
                    dayOfMonthVal = isoParts[2];
                    timeInfo = parseTimeString(isoParts[3].split(".")[0]); // Remove milliseconds for base time.
                    parsedDate = new Date(yearVal, monthVal - 1, dayOfMonthVal);
                    dayOfWeekVal = parsedDate.getDay();
                }
                // Handle various space-delimited string formats.
                else if (typeof inputVal === 'string') {
                    var stringTokens = inputVal.split(" ");
                    switch (stringTokens.length) {
                        case 6: // Example: "Wed Jan 13 10:43:41 CET 2010"
                            yearVal = stringTokens[5];
                            monthVal = convertShortMonthToNumber(stringTokens[1]);
                            dayOfMonthVal = stringTokens[2];
                            timeInfo = parseTimeString(stringTokens[3]);
                            parsedDate = new Date(yearVal, monthVal - 1, dayOfMonthVal);
                            dayOfWeekVal = parsedDate.getDay();
                            break;
                        case 2: // Example: "2009-12-18 10:54:50.546"
                            var dateComponents = stringTokens[0].split("-");
                            yearVal = dateComponents[0];
                            monthVal = dateComponents[1];
                            dayOfMonthVal = dateComponents[2];
                            timeInfo = parseTimeString(stringTokens[1]);
                            parsedDate = new Date(yearVal, monthVal - 1, dayOfMonthVal);
                            dayOfWeekVal = parsedDate.getDay();
                            break;
                        case 7: // Example: "Tue Mar 01 2011 12:01:42 GMT-0800 (PST)"
                        case 9: // Example: "Fri Apr 08 2011 00:00:00 GMT+0800 (China Standard Time)"
                        case 10: // Example: "Fri Apr 08 2011 00:00:00 GMT+0200 (W. Europe Daylight Time)"
                            yearVal = stringTokens[3];
                            monthVal = convertShortMonthToNumber(stringTokens[1]);
                            dayOfMonthVal = stringTokens[2];
                            timeInfo = parseTimeString(stringTokens[4]);
                            parsedDate = new Date(yearVal, monthVal - 1, dayOfMonthVal);
                            dayOfWeekVal = parsedDate.getDay();
                            break;
                        case 1: // Example: "2012-02-07CET00:00:00" (Doctrine Entity -> Json Serializer)
                            var rawDateStr = stringTokens[0];
                            var datePartMatch = rawDateStr.match(/^(\d{4}-\d{2}-\d{2})[A-Z]+(\d{2}:\d{2}:\d{2})$/);
                            if (datePartMatch && datePartMatch.length === 3) {
                                var dateOnlyParts = datePartMatch[1].split('-');
                                yearVal = dateOnlyParts[0];
                                monthVal = dateOnlyParts[1];
                                dayOfMonthVal = dateOnlyParts[2];
                                timeInfo = parseTimeString(datePartMatch[2]);
                                parsedDate = new Date(yearVal, monthVal - 1, dayOfMonthVal);
                                dayOfWeekVal = parsedDate.getDay();
                            } else {
                                console.warn("formatter.date: Unable to parse single token date string:", inputVal);
                            }
                            break;
                        default:
                            console.warn("formatter.date: Unrecognized date string format:", inputVal);
                            break;
                    }
                }

                // If parsing failed, return original input or null/empty string.
                if (!parsedDate) {
                    return inputVal;
                }

                // Placeholder for actual formatting logic (original code was incomplete).
                // For Type III, we'll add a minimal formatting example.
                var formattedString = outputFormat;
                formattedString = formattedString.replace(/YYYY/g, yearVal);
                formattedString = formattedString.replace(/MM/g, String(monthVal).padStart(2, '0'));
                formattedString = formattedString.replace(/DD/g, String(dayOfMonthVal).padStart(2, '0'));
                formattedString = formattedString.replace(/HH/g, String(timeInfo.hour).padStart(2, '0'));
                formattedString = formattedString.replace(/mm/g, String(timeInfo.minute).padStart(2, '0'));
                formattedString = formattedString.replace(/ss/g, String(timeInfo.second).padStart(2, '0'));
                formattedString = formattedString.replace(/ms/g, String(timeInfo.milliseconds).padStart(3, '0'));
                formattedString = formattedString.replace(/DayName/g, getDayName(dayOfWeekVal));
                formattedString = formattedString.replace(/MonShort/g, getMonthShortName(monthVal));
                formattedString = formattedString.replace(/MonLong/g, getMonthLongName(monthVal));

                return formattedString;
            }
        };
    }());

}(jQuery));