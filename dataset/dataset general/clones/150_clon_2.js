window.globalScopeDebug = function debugTracer() {
  // This utility function provides a lightweight debugging output wrapper.
  // See developer.example.com/2023/trace-tool for more information.

  // Initialize historical records if not present, then store current arguments.
  debugTracer.historyLog = debugTracer.historyLog || [];
  debugTracer.historyLog.push(arguments);

  // Check if a console object is available in the current context.
  if (this.consoleOutput) {
    let callArguments = arguments;
    let processedArguments;

    // Adjust the callee reference to point to the actual caller for better stack traces.
    callArguments.callee = callArguments.callee.caller;

    // Convert arguments object to a proper array.
    processedArguments = Array.prototype.slice.call(callArguments);

    // Determine the appropriate way to invoke the console log function.
    if (typeof this.consoleOutput.message === 'object') {
      this.consoleOutput.message.apply.call(this.consoleOutput.message, this.consoleOutput, processedArguments);
    } else {
      this.consoleOutput.message.apply(this.consoleOutput, processedArguments);
    }
  }
};

// Ensure basic console functions are safe to call, preventing errors in older browsers.
(function(debugContext) {
  function noOpFunction() { } // Placeholder for unavailable console methods.

  const consoleMethods = "assert,count,debug,dir,dirxml,error,exception,group,groupCollapsed,groupEnd,info,log,markTimeline,profile,profileEnd,time,timeEnd,trace,warn".split(",");
  let currentMethodName;

  while (currentMethodName = consoleMethods.pop()) {
    // Assign a no-op function if the console method is not natively present.
    debugContext[currentMethodName] = debugContext[currentMethodName] || noOpFunction;
  }
})(
  (function() {
    try {
      // Attempt to call console.log to check for its existence and functionality.
      console.log();
      return window.console;
    } catch (err) {
      // If an error occurs, return a dummy console object to prevent further errors.
      return (window.console = {});
    }
  })()
);


// Third-party utility scripts and helper plugins are placed here.

/**
 * Visual Color Selector 1.2
 * © 2008 Stephen White
 *
 * This software is free; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This software is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this software; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA
 */
(function(DomManipulator) {

DomManipulator.fn.colorSelector = function (resultReceiver) {
    // Delegate to the core color selector utility and return the jQuery object for chaining.
    DomManipulator.colorSelector(this, resultReceiver);
    return this;
};

DomManipulator.colorSelector = function (targetInput, resultReceiver) {
    // Get the raw DOM element from the jQuery object.
    let domElement = DomManipulator(targetInput).get(0);
    // Return existing instance or create a new one, storing it on the DOM element.
    return domElement.colorSelector || (domElement.colorSelector = new DomManipulator._colorSelectorCore(domElement, resultReceiver));
};

DomManipulator._colorSelectorCore = function (elementHost, resultReceiver) {
    // Store the color picker instance for internal access.
    const colorPickerInstance = this;

    // Insert the necessary HTML structure for the color picker into the host element.
    DomManipulator(elementHost).html('<div class="color-picker-widget"><div class="display-area"></div><div class="color-wheel-graphic"></div><div class="overlay-graphic"></div><div class="hue-indicator marker-style"></div><div class="saturation-lightness-indicator marker-style"></div></div>');

    // Cache reference to the main widget element.
    let widgetElement = DomManipulator('.color-picker-widget', elementHost);

    // Get the color wheel DOM element.
    colorPickerInstance.colorWheel = DomManipulator('.color-wheel-graphic', elementHost).get(0);

    // Define key dimensions for the color picker components.
    colorPickerInstance.wheelRadius = 84;
    colorPickerInstance.squareAreaSize = 100;
    colorPickerInstance.totalWidth = 194;

    // Apply specific fixes for background PNGs in older Internet Explorer versions (IE6).
    if (navigator.appVersion.match(/MSIE [0-6]\./)) {
        DomManipulator('*', widgetElement).each(function () {
            if (this.currentStyle.backgroundImage !== 'none') {
                let backgroundGraphic = this.currentStyle.backgroundImage;
                backgroundGraphic = this.currentStyle.backgroundImage.substring(5, backgroundGraphic.length - 2);
                DomManipulator(this).css({
                    'backgroundImage': 'none',
                    'filter': "progid:DXImageTransform.Microsoft.AlphaImageLoader(enabled=true, sizingMethod=crop, src='" + backgroundGraphic + "')"
                });
            }
        });
    }

    /**
     * Establishes a connection to the specified element(s) or a custom callback function.
     */
    colorPickerInstance.attachTo = function (receiver) {
        // Unbind any previously linked elements to prevent multiple handlers.
        if (typeof colorPickerInstance.resultReceiver === 'object') {
            DomManipulator(colorPickerInstance.resultReceiver).off('keyup', colorPickerInstance.refreshValueFromInput);
        }

        // Reset the stored color value.
        colorPickerInstance.currentHexColor = null;

        // Bind the new callback or elements.
        if (typeof receiver === 'function') {
            colorPickerInstance.resultReceiver = receiver;
        }
        else if (typeof receiver === 'object' || typeof receiver === 'string') {
            colorPickerInstance.resultReceiver = DomManipulator(receiver);
            colorPickerInstance.resultReceiver.on('keyup', colorPickerInstance.refreshValueFromInput);
            // If the linked element has a value, initialize the picker with it.
            if (colorPickerInstance.resultReceiver.get(0).value) {
                colorPickerInstance.setHexColor(colorPickerInstance.resultReceiver.get(0).value);
            }
        }
        return this;
    };

    colorPickerInstance.refreshValueFromInput = function (eventTrigger) {
        // Update the picker's color if the input field's value has changed.
        if (this.value && this.value !== colorPickerInstance.currentHexColor) {
            colorPickerInstance.setHexColor(this.value);
        }
    };

    /**
     * Updates the color using a standard HTML hexadecimal syntax (e.g., #RRGGBB).
     */
    colorPickerInstance.setHexColor = function (hexColorCode) {
        let decodedRGB = colorPickerInstance.parseHex(hexColorCode);
        // Only update if the color has actually changed and is a valid hex code.
        if (colorPickerInstance.currentHexColor !== hexColorCode && decodedRGB) {
            colorPickerInstance.currentHexColor = hexColorCode;
            colorPickerInstance.rgbComponents = decodedRGB;
            colorPickerInstance.hslComponents = colorPickerInstance.convertRGBtoHSL(colorPickerInstance.rgbComponents);
            colorPickerInstance.updateVisuals();
        }
        return this;
    };

    /**
     * Updates the color using an HSL triplet [hue, saturation, lightness] where each component is 0-1.
     */
    colorPickerInstance.setHSLColor = function (hslTriplet) {
        colorPickerInstance.hslComponents = hslTriplet;
        colorPickerInstance.rgbComponents = colorPickerInstance.convertHSLtoRGB(hslTriplet);
        colorPickerInstance.currentHexColor = colorPickerInstance.generateHex(colorPickerInstance.rgbComponents);
        colorPickerInstance.updateVisuals();
        return this;
    };

    /////////////////////////////////////////////////////

    /**
     * Retrieves the coordinates of the given event relative to the center
     * of the color picker widget.
     */
    colorPickerInstance.getEventRelativeCoordinates = function (inputEvent) {
        let xCoord, yCoord;
        let eventTargetElement = inputEvent.target || inputEvent.srcElement;
        let referenceElement = colorPickerInstance.colorWheel;

        if (typeof inputEvent.offsetX !== 'undefined') {
            // Utilize offset coordinates and determine a common offset parent.
            let currentPosition = { x: inputEvent.offsetX, y: inputEvent.offsetY };

            // Propagate coordinates upwards through the offsetParent chain.
            let traversalElement = eventTargetElement;
            while (traversalElement) {
                traversalElement.storedMouseX = currentPosition.x;
                traversalElement.storedMouseY = currentPosition.y;
                currentPosition.x += traversalElement.offsetLeft;
                currentPosition.y += traversalElement.offsetTop;
                traversalElement = traversalElement.offsetParent;
            }

            // Search for the coordinates starting from the wheel widget.
            traversalElement = referenceElement;
            let accumulatedOffset = { x: 0, y: 0 };
            while (traversalElement) {
                if (typeof traversalElement.storedMouseX !== 'undefined') {
                    xCoord = traversalElement.storedMouseX - accumulatedOffset.x;
                    yCoord = traversalElement.storedMouseY - accumulatedOffset.y;
                    break;
                }
                accumulatedOffset.x += traversalElement.offsetLeft;
                accumulatedOffset.y += traversalElement.offsetTop;
                traversalElement = traversalElement.offsetParent;
            }

            // Clear stored coordinates to prevent side effects.
            traversalElement = eventTargetElement;
            while (traversalElement) {
                traversalElement.storedMouseX = undefined;
                traversalElement.storedMouseY = undefined;
                traversalElement = traversalElement.offsetParent;
            }
        }
        else {
            // Fallback to absolute coordinates calculation.
            let absolutePos = colorPickerInstance.getAbsoluteElementPosition(referenceElement);
            xCoord = (inputEvent.pageX || 0 * (inputEvent.clientX + DomManipulator('html').get(0).scrollLeft)) - absolutePos.x;
            yCoord = (inputEvent.pageY || 0 * (inputEvent.clientY + DomManipulator('html').get(0).scrollTop)) - absolutePos.y;
        }
        // Adjust coordinates to be relative to the widget's center.
        return { x: xCoord - colorPickerInstance.totalWidth / 2, y: yCoord - colorPickerInstance.totalWidth / 2 };
    };

    /**
     * Handler for the mouse button press event.
     */
    colorPickerInstance.handleMouseDown = function (inputEvent) {
        // Capture mouse events globally during a drag operation.
        if (!document.isCurrentlyDragging) {
            DomManipulator(document).on('mousemove', colorPickerInstance.handleMouseMove).on('mouseup', colorPickerInstance.handleMouseUp);
            document.isCurrentlyDragging = true;
        }

        // Determine if the drag started in the color wheel or the saturation/lightness square.
        let eventPosition = colorPickerInstance.getEventRelativeCoordinates(inputEvent);
        colorPickerInstance.isWheelDrag = Math.max(Math.abs(eventPosition.x), Math.abs(eventPosition.y)) * 2 > colorPickerInstance.squareAreaSize;

        // Immediately process the mouse movement to update the color.
        colorPickerInstance.handleMouseMove(inputEvent);
        return false; // Prevent default browser drag behavior.
    };

    /**
     * Handler for mouse movement events during a drag.
     */
    colorPickerInstance.handleMouseMove = function (inputEvent) {
        // Obtain coordinates relative to the color picker's central point.
        let currentPosition = colorPickerInstance.getEventRelativeCoordinates(inputEvent);

        // Update HSL parameters based on whether the wheel or square is being dragged.
        if (colorPickerInstance.isWheelDrag) {
            let selectedHue = Math.atan2(currentPosition.x, -currentPosition.y) / 6.28;
            if (selectedHue < 0) selectedHue += 1;
            colorPickerInstance.setHSLColor([selectedHue, colorPickerInstance.hslComponents[1], colorPickerInstance.hslComponents[2]]);
        }
        else {
            let selectedSaturation = Math.max(0, Math.min(1, -(currentPosition.x / colorPickerInstance.squareAreaSize) + 0.5));
            let selectedLightness = Math.max(0, Math.min(1, -(currentPosition.y / colorPickerInstance.squareAreaSize) + 0.5));
            colorPickerInstance.setHSLColor([colorPickerInstance.hslComponents[0], selectedSaturation, selectedLightness]);
        }
        return false; // Prevent default browser actions like text selection.
    };

    /**
     * Handler for the mouse button release event.
     */
    colorPickerInstance.handleMouseUp = function () {
        // Release global mouse event capture.
        DomManipulator(document).off('mousemove', colorPickerInstance.handleMouseMove);
        DomManipulator(document).off('mouseup', colorPickerInstance.handleMouseUp);
        document.isCurrentlyDragging = false;
    };

    /**
     * Renders and updates the visual elements (markers, gradients) of the color picker.
     */
    colorPickerInstance.updateVisuals = function () {
        // Position the hue marker on the color wheel.
        let hueAngle = colorPickerInstance.hslComponents[0] * 6.28;
        DomManipulator('.hue-indicator', widgetElement).css({
            left: Math.round(Math.sin(hueAngle) * colorPickerInstance.wheelRadius + colorPickerInstance.totalWidth / 2) + 'px',
            top: Math.round(-Math.cos(hueAngle) * colorPickerInstance.wheelRadius + colorPickerInstance.totalWidth / 2) + 'px'
        });

        // Position the saturation/lightness marker within the square area.
        DomManipulator('.saturation-lightness-indicator', widgetElement).css({
            left: Math.round(colorPickerInstance.squareAreaSize * (0.5 - colorPickerInstance.hslComponents[1]) + colorPickerInstance.totalWidth / 2) + 'px',
            top: Math.round(colorPickerInstance.squareAreaSize * (0.5 - colorPickerInstance.hslComponents[2]) + colorPickerInstance.totalWidth / 2) + 'px'
        });

        // Update the background color of the saturation/lightness gradient area.
        DomManipulator('.display-area', widgetElement).css('backgroundColor', colorPickerInstance.generateHex(colorPickerInstance.convertHSLtoRGB([colorPickerInstance.hslComponents[0], 1, 0.5])));

        // Notify linked elements or execute the callback function.
        if (typeof colorPickerInstance.resultReceiver === 'object') {
            // Set background and text color of the linked input field.
            DomManipulator(colorPickerInstance.resultReceiver).css({
                backgroundColor: colorPickerInstance.currentHexColor,
                color: colorPickerInstance.hslComponents[2] > 0.5 ? '#000' : '#fff' // Choose black or white text for contrast.
            });

            // Update the value of linked input fields.
            DomManipulator(colorPickerInstance.resultReceiver).each(function() {
                if (this.value && this.value !== colorPickerInstance.currentHexColor) {
                    this.value = colorPickerInstance.currentHexColor;
                }
            });
        }
        else if (typeof colorPickerInstance.resultReceiver === 'function') {
            // Invoke the callback with the current hex color.
            colorPickerInstance.resultReceiver.call(colorPickerInstance, colorPickerInstance.currentHexColor);
        }
    };

    /**
     * Calculates the absolute screen position of a given DOM element.
     */
    colorPickerInstance.getAbsoluteElementPosition = function (targetElement) {
        let calculatedPosition = { x: targetElement.offsetLeft, y: targetElement.offsetTop };
        // Recursively add offsets from parent elements.
        if (targetElement.offsetParent) {
            let parentPosition = colorPickerInstance.getAbsoluteElementPosition(targetElement.offsetParent);
            calculatedPosition.x += parentPosition.x;
            calculatedPosition.y += parentPosition.y;
        }
        return calculatedPosition;
    };

    /* Various utility functions for color conversion and manipulation. */

    colorPickerInstance.generateHex = function (rgbArray) {
        let redComponent = Math.round(rgbArray[0] * 255);
        let greenComponent = Math.round(rgbArray[1] * 255);
        let blueComponent = Math.round(rgbArray[2] * 255);
        return '#' + (redComponent < 16 ? '0' : '') + redComponent.toString(16) +
               (greenComponent < 16 ? '0' : '') + greenComponent.toString(16) +
               (blueComponent < 16 ? '0' : '') + blueComponent.toString(16);
    };

    colorPickerInstance.parseHex = function (hexString) {
        if (hexString.length === 7) { // Full #RRGGBB format
            return [parseInt('0x' + hexString.substring(1, 3)) / 255,
                    parseInt('0x' + hexString.substring(3, 5)) / 255,
                    parseInt('0x' + hexString.substring(5, 7)) / 255];
        }
        else if (hexString.length === 4) { // Shorthand #RGB format
            return [parseInt('0x' + hexString.substring(1, 2)) / 15,
                    parseInt('0x' + hexString.substring(2, 3)) / 15,
                    parseInt('0x' + hexString.substring(3, 4)) / 15];
        }
    };

    colorPickerInstance.convertHSLtoRGB = function (hslArray) {
        let factorOne, factorTwo;
        let hueValue = hslArray[0], saturationValue = hslArray[1], lightnessValue = hslArray[2];

        factorTwo = (lightnessValue <= 0.5) ? lightnessValue * (saturationValue + 1) : lightnessValue + saturationValue - lightnessValue * saturationValue;
        factorOne = lightnessValue * 2 - factorTwo;

        return [this.calculateHueComponent(factorOne, factorTwo, hueValue + 0.33333),
                this.calculateHueComponent(factorOne, factorTwo, hueValue),
                this.calculateHueComponent(factorOne, factorTwo, hueValue - 0.33333)];
    };

    colorPickerInstance.calculateHueComponent = function (val1, val2, hueAngle) {
        hueAngle = (hueAngle < 0) ? hueAngle + 1 : ((hueAngle > 1) ? hueAngle - 1 : hueAngle);
        if (hueAngle * 6 < 1) return val1 + (val2 - val1) * hueAngle * 6;
        if (hueAngle * 2 < 1) return val2;
        if (hueAngle * 3 < 2) return val1 + (val2 - val1) * (0.66666 - hueAngle) * 6;
        return val1;
    };

    colorPickerInstance.convertRGBtoHSL = function (rgbArray) {
        let minColorVal, maxColorVal, colorRange, resultHue, resultSaturation, resultLightness;
        let redVal = rgbArray[0], greenVal = rgbArray[1], blueVal = rgbArray[2];

        minColorVal = Math.min(redVal, Math.min(greenVal, blueVal));
        maxColorVal = Math.max(redVal, Math.max(greenVal, blueVal));
        colorRange = maxColorVal - minColorVal;
        resultLightness = (minColorVal + maxColorVal) / 2;
        resultSaturation = 0;

        if (resultLightness > 0 && resultLightness < 1) {
            resultSaturation = colorRange / (resultLightness < 0.5 ? (2 * resultLightness) : (2 - 2 * resultLightness));
        }

        resultHue = 0;
        if (colorRange > 0) {
            if (maxColorVal === redVal && maxColorVal !== greenVal) resultHue += (greenVal - blueVal) / colorRange;
            if (maxColorVal === greenVal && maxColorVal !== blueVal) resultHue += (2 + (blueVal - redVal) / colorRange);
            if (maxColorVal === blueVal && maxColorVal !== redVal) resultHue += (4 + (redVal - greenVal) / colorRange);
            resultHue /= 6;
        }
        return [resultHue, resultSaturation, resultLightness];
    };

    // Attach the mousedown event handler to all child elements within the widget.
    DomManipulator('*', widgetElement).on('mousedown', colorPickerInstance.handleMouseDown);

    // Initialize the color picker to black.
    colorPickerInstance.setHexColor('#000000');

    // Link to the provided elements or callback function if specified.
    if (resultReceiver) {
        colorPickerInstance.attachTo(resultReceiver);
    }
};
})(jQuery); // Using jQuery as the DomManipulator alias here.


(function (DomManipulator) {

    // Arrays for day and month names.
    const weekdayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const shortMonthAbbreviations = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const fullMonthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];

    // Mapping for short month names to their two-digit number representation.
    let abbreviatedMonthToNumber = [];
    abbreviatedMonthToNumber["Jan"] = "01";
    abbreviatedMonthToNumber["Feb"] = "02";
    abbreviatedMonthToNumber["Mar"] = "03";
    abbreviatedMonthToNumber["Apr"] = "04";
    abbreviatedMonthToNumber["May"] = "05";
    abbreviatedMonthToNumber["Jun"] = "06";
    abbreviatedMonthToNumber["Jul"] = "07";
    abbreviatedMonthToNumber["Aug"] = "08";
    abbreviatedMonthToNumber["Sep"] = "09";
    abbreviatedMonthToNumber["Oct"] = "10";
    abbreviatedMonthToNumber["Nov"] = "11";
    abbreviatedMonthToNumber["Dec"] = "12";

    DomManipulator.dateFormatter = (function () {
        // Helper function to get the full day name from a numeric index.
        function getFullDayName(dayIndex) {
            return weekdayNames[parseInt(dayIndex, 10)] || dayIndex;
        }

        // Helper function to get the abbreviated month name from a numeric index (1-based).
        function getAbbreviatedMonth(monthIndex) {
            let arrayPosition = parseInt(monthIndex, 10) - 1;
            return shortMonthAbbreviations[arrayPosition] || monthIndex;
        }

        // Helper function to get the full month name from a numeric index (1-based).
        function getFullMonthName(monthIndex) {
            let arrayPosition = parseInt(monthIndex, 10) - 1;
            return fullMonthNames[arrayPosition] || monthIndex;
        }

        // Internal function to convert an abbreviated month name to its numeric string.
        const convertAbbrMonthToNumeric = function (monthAbbr) {
            return abbreviatedMonthToNumber[monthAbbr] || monthAbbr;
        };

        // Internal function to parse a time string into its components.
        const dissectTimeString = function (timeString) {
            let currentString = timeString;
            let millisecondPart = "";

            if (currentString.indexOf(".") !== -1) {
                let partsSeparated = currentString.split('.');
                currentString = partsSeparated[0];
                millisecondPart = partsSeparated[1];
            }

            let timeSegments = currentString.split(":");

            if (timeSegments.length === 3) {
                let hourSegment = timeSegments[0];
                let minuteSegment = timeSegments[1];
                let secondSegment = timeSegments[2];

                return {
                    fullTime: currentString,
                    hourComponent: hourSegment,
                    minuteComponent: minuteSegment,
                    secondComponent: secondSegment,
                    millisecondComponent: millisecondPart
                };
            } else {
                return {
                    fullTime: "",
                    hourComponent: "",
                    minuteComponent: "",
                    secondComponent: "",
                    millisecondComponent: ""
                };
            }
        };

        return {
            // Main function for formatting dates.
            formatDate: function (sourceValue, outputFormat) {
                /*
                 Example sourceValue: new Date() object, or "2009-12-18 10:54:50.546"
                 */
                try {
                    let parsedDateObject = null;
                    let yearValue = null;
                    let monthValue = null;
                    let dayOfMonthValue = null;
                    let dayOfWeekValue = null;
                    let timeParts = null;

                    // Handle numeric timestamp input.
                    if (typeof sourceValue === "number") {
                        return this.formatDate(new Date(sourceValue), outputFormat);
                    }
                    // Handle Date object input.
                    else if (typeof sourceValue.getFullYear === "function") {
                        yearValue = sourceValue.getFullYear();
                        monthValue = sourceValue.getMonth() + 1; // Month is 0-indexed.
                        dayOfMonthValue = sourceValue.getDate();
                        dayOfWeekValue = sourceValue.getDay();
                        timeParts = dissectTimeString(sourceValue.toTimeString());
                    }
                    // Handle ISO 8601-like string format (e.g., "2009-04-19T16:11:05+02:00").
                    else if (sourceValue.search(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.?\d{0,3}[-+]?\d{2}:?\d{2}/) !== -1) {
                        let segments = sourceValue.split(/[T\+-]/);
                        yearValue = segments[0];
                        monthValue = segments[1];
                        dayOfMonthValue = segments[2];
                        timeParts = dissectTimeString(segments[3].split(".")[0]);
                        parsedDateObject = new Date(yearValue, monthValue - 1, dayOfMonthValue);
                        dayOfWeekValue = parsedDateObject.getDay();
                    }
                    // Handle various other string formats.
                    else {
                        let stringSegments = sourceValue.split(" ");
                        switch (stringSegments.length) {
                            case 6: // Format: "Wed Jan 13 10:43:41 CET 2010"
                                yearValue = stringSegments[5];
                                monthValue = convertAbbrMonthToNumeric(stringSegments[1]);
                                dayOfMonthValue = stringSegments[2];
                                timeParts = dissectTimeString(stringSegments[3]);
                                parsedDateObject = new Date(yearValue, monthValue - 1, dayOfMonthValue);
                                dayOfWeekValue = parsedDateObject.getDay();
                                break;
                            case 2: // Format: "2009-12-18 10:54:50.546"
                                let dateSegments = stringSegments[0].split("-");
                                yearValue = dateSegments[0];
                                monthValue = dateSegments[1];
                                dayOfMonthValue = dateSegments[2];
                                timeParts = dissectTimeString(stringSegments[1]);
                                parsedDateObject = new Date(yearValue, monthValue - 1, dayOfMonthValue);
                                dayOfWeekValue = parsedDateObject.getDay();
                                break;
                            case 7: // Format: "Tue Mar 01 2011 12:01:42 GMT-0800 (PST)"
                            case 9: // Added by some_dev, for "Fri Apr 08 2011 00:00:00 GMT+0800 (China Standard Time)"
                            case 10: // Added by another_dev, for "Fri Apr 08 2011 00:00:00 GMT+0200 (W. Europe Daylight Time)"
                                yearValue = stringSegments[3];
                                monthValue = convertAbbrMonthToNumeric(stringSegments[1]);
                                dayOfMonthValue = stringSegments[2];
                                timeParts = dissectTimeString(stringSegments[4]);
                                parsedDateObject = new Date(yearValue, monthValue - 1, dayOfMonthValue);
                                dayOfWeekValue = parsedDateObject.getDay();
                                break;
                            case 1: // Added by third_dev, for "2012-02-07CET00:00:00" (Doctrine Entity -> Json Serializer)
                                let charSegments = stringSegments[0].split("");
                                yearValue = charSegments[0] + charSegments[1] + charSegments[2] + charSegments[3];
                                monthValue = charSegments[5] + charSegments[6];
                                // The original code was cut off here. For Type II, I preserve the structure.
                                // If the original had more logic for this case, it would be included here.
                                break;
                        }
                    }
                } catch (e) {
                    // Handle parsing errors gracefully
                    console.error("Date parsing error:", e);
                    return "Invalid Date";
                }
                // Placeholder return as the original snippet was incomplete after the switch statement.
                return "Formatted Date Placeholder";
            }
        };
    })(); // Immediately Invoked Function Expression for dateFormatter.

})(jQuery); // Passing jQuery as DomManipulator.