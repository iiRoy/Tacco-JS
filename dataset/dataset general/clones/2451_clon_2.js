(function(jqRef) {

    // Global object reference
    var globalScopeObj = window;

    // Polyfill for Object.keys from MDN if not present
    // Original source: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys
    if (!Object.keys) {
        Object.keys = (function() {
            'use strict';
            var propOwnCheck = Object.prototype.hasOwnProperty,
                enumBugExists = !({toString: null}).propertyIsEnumerable('toString'),
                ignoredProps = [
                    'toString',
                    'toLocaleString',
                    'valueOf',
                    'hasOwnProperty',
                    'isPrototypeOf',
                    'propertyIsEnumerable',
                    'constructor'
                ],
                ignoredCount = ignoredProps.length;

            return function(inputObj) {
                if (typeof inputObj !== 'object' && (typeof inputObj !== 'function' || inputObj === null)) {
                    throw new TypeError('Object.keys invoked on non-object type');
                }

                var collectedKeys = [], currentKey, idx;

                for (currentKey in inputObj) {
                    if (propOwnCheck.call(inputObj, currentKey)) {
                        collectedKeys.push(currentKey);
                    }
                }

                if (enumBugExists) {
                    for (idx = 0; idx < ignoredCount; idx++) {
                        if (propOwnCheck.call(inputObj, ignoredProps[idx])) {
                            collectedKeys.push(ignoredProps[idx]);
                        }
                    }
                }
                return collectedKeys;
            };
        }());
    }

    // Flag for IE8 compatibility, disabling some advanced effects
    var restrictedFuncs = false;
    // Default duration for refresh cycle, in milliseconds
    var updateIntervalMs = 200;

    // Check if development mode is active via URL hash
    var devModeEnabled = (location.hash === "#devmode");
    // Logs messages to console only if dev mode is enabled
    function logIfDebugging(messageContent) {
        if (devModeEnabled) {
            console.log(messageContent);
        }
    }

    // List of all recognized time units
    var allTemporalUnits = ["Days", "Hours", "Minutes", "Seconds"];
    // Mapping for the next larger unit
    var subsequentUnits = {
        Seconds: "Minutes",
        Minutes: "Hours",
        Hours: "Days",
        Days: "Years"
    };
    // Duration of each unit in seconds
    var unitDurationsInSeconds = {
        Seconds: 1,
        Minutes: 60,
        Hours: 3600,
        Days: 86400,
        Months: 2678400,
        Years: 31536000
    };

    /**
     * Transforms a hexadecimal color string into an object containing RGB integer values.
     * This function's source: http://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
     * @param {string} colorHex - The hexadecimal color code (e.g., "#FFF" or "#FFFFFF").
     * @returns {object|null} An object with r, g, b properties, or null if invalid.
     */
    function convertHexToRgb(colorHex) {
        // Expand shorthand hex codes (e.g., "03F" to "0033FF")
        var shortHexPattern = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        colorHex = colorHex.replace(shortHexPattern, function(match, redPart, greenPart, bluePart) {
            return redPart + redPart + greenPart + greenPart + bluePart + bluePart;
        });

        var parsedResult = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(colorHex);
        return parsedResult ? {
            r: parseInt(parsedResult[1], 16),
            g: parseInt(parsedResult[2], 16),
            b: parseInt(parsedResult[3], 16)
        } : null;
    }

    /**
     * Checks if the HTML5 Canvas API is supported by the current browser.
     * @returns {boolean} True if canvas is supported, false otherwise.
     */
    function checkCanvasSupport() {
        var testElement = document.createElement('canvas');
        return !!(testElement.getContext && testElement.getContext('2d'));
    }

    /**
     * Generates a 4-character hexadecimal segment for UUIDs.
     * Function generateSegment() and createUniqueId() are from:
     * http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
     * @returns {string} A random 4-character hex string.
     */
    function generateSegment() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }

    /**
     * Creates a universally unique identifier (UUID/GUID).
     * @returns {string} A unique identifier string.
     */
    function createUniqueId() {
        return generateSegment() + generateSegment() + '-' + generateSegment() + '-' + generateSegment() + '-' +
            generateSegment() + '-' + generateSegment() + generateSegment() + generateSegment();
    }

    /**
     * Array.prototype.indexOf polyfill for older browsers like IE8.
     * @param {Mixed} targetItem - The item to search for.
     * @returns {Number} The index of the item, or -1 if not found.
     */
    if (!Array.prototype.indexOf) {
        Array.prototype.indexOf = function(targetItem /*, startIndex*/)
        {
            var arrayLength = this.length >>> 0;

            var startIndex = Number(arguments[1]) || 0;
            startIndex = (startIndex < 0)
                ? Math.ceil(startIndex)
                : Math.floor(startIndex);
            if (startIndex < 0)
                startIndex += arrayLength;

            for (; startIndex < arrayLength; startIndex++)
            {
                if (startIndex in this &&
                    this[startIndex] === targetItem)
                    return startIndex;
            }
            return -1;
        };
    }

    /**
     * Parses a date string into a Date object. Supports specific formats and falls back to Date.parse.
     * @param {string} dateTimeString - The date string to parse.
     * @returns {Date} A Date object representing the parsed date.
     */
    function decodeDateTime(dateTimeString) {
        var dateMatch = dateTimeString.match(/^[0-9]{4}-[0-9]{2}-[0-9]{2}\s[0-9]{1,2}:[0-9]{2}:[0-9]{2}$/);
        if (dateMatch !== null && dateMatch.length > 0) {
            var stringParts = dateTimeString.split(" ");
            var dateComponents = stringParts[0].split("-");
            var timeComponents = stringParts[1].split(":");
            return new Date(dateComponents[0], dateComponents[1] - 1, dateComponents[2], timeComponents[0], timeComponents[1], timeComponents[2]);
        }
        // Fallback for different date formats if the specific one doesn't match
        var parsedValue = Date.parse(dateTimeString);
        if (!isNaN(parsedValue))
            return parsedValue;
        parsedValue = Date.parse(dateTimeString.replace(/-/g, '/').replace('T', ' '));
        if (!isNaN(parsedValue))
            return parsedValue;
        // If nothing works, return a new Date (current time)
        return new Date();
    }

    /**
     * Calculates time differences and percentages for various units.
     * @param {number} currentDifference - Current time difference in seconds.
     * @param {number} previousDifference - Previous time difference in seconds.
     * @param {number} totalTimeSpan - The total duration in seconds.
     * @param {Array<string>} relevantUnits - Array of unit names to calculate.
     * @param {boolean} roundDown - Whether to floor the unit values.
     * @returns {object} An object containing raw, display, and percentage values for current and previous times.
     */
    function calculateTimeValues(currentDifference, previousDifference, totalTimeSpan, relevantUnits, roundDown) {
        var rawCurrentTimes = {};
        var rawPreviousTimes = {};
        var displayTimes = {};
        var currentPercentages = {};
        var previousPercentages = {};
        var displayOldTimes = {};

        var largerUnit = null;
        for(var unitIndex = 0; unitIndex < relevantUnits.length; unitIndex++) {
            var currentUnit = relevantUnits[unitIndex];
            var maximumUnits;

            if (largerUnit === null) {
                maximumUnits = totalTimeSpan / unitDurationsInSeconds[currentUnit];
            }
            else {
                maximumUnits = unitDurationsInSeconds[largerUnit] / unitDurationsInSeconds[currentUnit];
            }

            var currentUnitValue = (currentDifference / unitDurationsInSeconds[currentUnit]);
            var previousUnitValue = (previousDifference / unitDurationsInSeconds[currentUnit]);

            if(roundDown) {
                if(currentUnitValue > 0) currentUnitValue = Math.floor(currentUnitValue);
                else currentUnitValue = Math.ceil(currentUnitValue);
                if(previousUnitValue > 0) previousUnitValue = Math.floor(previousUnitValue);
                else previousUnitValue = Math.ceil(previousUnitValue);
            }

            if (currentUnit !== "Days") {
                currentUnitValue = currentUnitValue % maximumUnits;
                previousUnitValue = previousUnitValue % maximumUnits;
            }

            rawCurrentTimes[currentUnit] = currentUnitValue;
            displayTimes[currentUnit] = Math.abs(currentUnitValue);
            rawPreviousTimes[currentUnit] = previousUnitValue;
            displayOldTimes[currentUnit] = Math.abs(previousUnitValue);
            currentPercentages[currentUnit] = Math.abs(currentUnitValue) / maximumUnits;
            previousPercentages[currentUnit] = Math.abs(previousUnitValue) / maximumUnits;

            largerUnit = currentUnit;
        }

        return {
            raw_time: rawCurrentTimes,
            raw_old_time: rawPreviousTimes,
            time: displayTimes,
            old_time: displayOldTimes,
            pct: currentPercentages,
            old_pct: previousPercentages
        };
    }

    // Registry for all countdown component instances
    var timerComponentRegistry = {};
    /**
     * Synchronizes the global instance registry across multiple frames/windows if applicable.
     * Also initializes the animation frame handler.
     */
    function syncGlobalRegistry() {
        if(typeof globalScopeObj.timerComponentRegistry !== "undefined") {
            timerComponentRegistry = globalScopeObj.timerComponentRegistry;
        }
        else {
            globalScopeObj.timerComponentRegistry = timerComponentRegistry;
        }
        setupAnimationScheduler(globalScopeObj);
    }

    /**
     * Initializes requestAnimationFrame and cancelAnimationFrame polyfills if not natively supported.
     * @param {Window} windowRef - The window object to set up the handlers on.
     */
    function setupAnimationScheduler(windowRef) {
        var browserPrefixes = ['webkit', 'moz'];
        for (var prefixIndex = 0; prefixIndex < browserPrefixes.length && !windowRef.requestAnimationFrame; ++prefixIndex) {
            windowRef.requestAnimationFrame = windowRef[browserPrefixes[prefixIndex] + 'RequestAnimationFrame'];
            windowRef.cancelAnimationFrame = windowRef[browserPrefixes[prefixIndex] + 'CancelAnimationFrame'];
        }

        if (!windowRef.requestAnimationFrame || !windowRef.cancelAnimationFrame) {
            windowRef.requestAnimationFrame = function(animationCallback, domElement, componentInstance) {
                if (typeof componentInstance === "undefined")
                    componentInstance = {internalState: {lastFrameTime: 0}};
                var currentTimeStamp = new Date().getTime();
                var delayUntilCall = Math.max(0, 16 - (currentTimeStamp - componentInstance.internalState.lastFrameTime));
                var timeoutId = windowRef.setTimeout(function() {
                    animationCallback(currentTimeStamp + delayUntilCall);
                }, delayUntilCall);
                componentInstance.internalState.lastFrameTime = currentTimeStamp + delayUntilCall;
                return timeoutId;
            };
            windowRef.cancelAnimationFrame = function(timeoutId) {
                clearTimeout(timeoutId);
            };
        }
    }

    /**
     * Constructor for a single countdown display component.
     * @param {HTMLElement} targetElement - The DOM element where the component will be rendered.
     * @param {object} options - Configuration options for the component.
     */
    var CountdownComponent = function(targetElement, options) {
        this.targetElement = targetElement;
        this.componentWrapper;
        this.eventSubscribers = null;
        this.internalState = {
            isPaused: false,
            lastFrameTime: 0,
            animFrameHandle: null,
            intervalHandle: null,
            isTimerMode: false,
            totalCountdownDuration: null,
            previousUpdateTime: null,
            renderedUnits: [],
            displayElements: {
                Days: null,
                Hours: null,
                Minutes: null,
                Seconds: null
            },
            renderAttributes: {
                drawingCanvas: null,
                canvasContext: null,
                unitDisplaySize: null,
                circleStrokeWidth: null,
                innerCircleRadius: null,
                outerCircleRadius: null
            },
            dynamicState: {
                unitFadingStatus: {
                    Days: false,
                    Hours: false,
                    Minutes: false,
                    Seconds: false
                }
            }
        };

        this.componentSettings = null;
        this.configureSettings(options);
        this.prepareComponent();
    };

    /**
     * Clears all registered event subscribers for this component.
     */
    CountdownComponent.prototype.resetSubscribers = function() {
        this.eventSubscribers = { all: [], visible: [] };
    };

    /**
     * Adjusts the component's reference date/time by a given number of seconds.
     * @param {number} secondsDelta - The number of seconds to add (can be negative).
     */
    CountdownComponent.prototype.adjustTime = function(secondsDelta) {
        if(this.internalState.renderAttributes.ref_date instanceof Date) {
            var currentRefDate = this.internalState.renderAttributes.ref_date;
            currentRefDate.setSeconds(currentRefDate.getSeconds() + secondsDelta);
        }
        else if(!isNaN(this.internalState.renderAttributes.ref_date)) {
            this.internalState.renderAttributes.ref_date += (secondsDelta * 1000);
        }
    };

    /**
     * Initializes or re-initializes the countdown component, setting up its DOM, canvas, and listeners.
     * @param {boolean} [shouldClearSubscribers=true] - Whether to clear existing listeners.
     */
    CountdownComponent.prototype.prepareComponent = function(shouldClearSubscribers) {
        // Populate the list of units that will be drawn
        this.internalState.renderedUnits = [];
        for(var i = 0; i < Object.keys(this.componentSettings.time).length; i++) {
            var currentUnit = Object.keys(this.componentSettings.time)[i];
            if (this.componentSettings.time[currentUnit].show) {
                this.internalState.renderedUnits.push(currentUnit);
            }
        }

        // Remove any existing wrappers to prevent stacking if re-initialized
        jqRef(this.targetElement).children('div.component_circles').remove();

        if (typeof shouldClearSubscribers === "undefined")
            shouldClearSubscribers = true;
        if (shouldClearSubscribers || this.eventSubscribers === null) {
            this.resetSubscribers();
        }
        this.componentWrapper = jqRef("<div>");
        this.componentWrapper.addClass('component_circles');
        this.componentWrapper.appendTo(this.targetElement);

        // Determine the necessary dimensions for the component
        var containerHeight = this.targetElement.offsetHeight;
        var containerWidth = this.targetElement.offsetWidth;
        if (containerHeight === 0)
            containerHeight = jqRef(this.targetElement).height();
        if (containerWidth === 0)
            containerWidth = jqRef(this.targetElement).width();

        if (containerHeight === 0 && containerWidth > 0)
            containerHeight = containerWidth / this.internalState.renderedUnits.length;
        else if (containerWidth === 0 && containerHeight > 0)
            containerWidth = containerHeight * this.internalState.renderedUnits.length;

        // Create the canvas element and set its size
        var canvasNode = document.createElement('canvas');
        canvasNode.width = containerWidth;
        canvasNode.height = containerHeight;

        // Append the canvas to the component wrapper
        this.internalState.renderAttributes.drawingCanvas = jqRef(canvasNode);
        this.internalState.renderAttributes.drawingCanvas.appendTo(this.componentWrapper);

        // Check for canvas support
        var hasCanvasAPI = checkCanvasSupport();
        // If no native canvas support, check for ExplorerCanvas (IE8 polyfill)
        if(!hasCanvasAPI && typeof G_vmlCanvasManager !== "undefined") {
            G_vmlCanvasManager.initElement(canvasNode);
            restrictedFuncs = true; // Enable limited functionality mode
            hasCanvasAPI = true;
        }
        if(hasCanvasAPI) {
            this.internalState.renderAttributes.canvasContext = canvasNode.getContext('2d');
        }

        // Calculate rendering dimensions
        this.internalState.renderAttributes.unitDisplaySize = Math.min(containerWidth / this.internalState.renderedUnits.length, containerHeight);
        this.internalState.renderAttributes.circleStrokeWidth = this.internalState.renderAttributes.unitDisplaySize * this.componentSettings.fg_width;
        this.internalState.renderAttributes.innerCircleRadius = ((this.internalState.renderAttributes.unitDisplaySize * 0.8) - this.internalState.renderAttributes.circleStrokeWidth) / 2;
        this.internalState.renderAttributes.outerCircleRadius = this.internalState.renderAttributes.innerCircleRadius + 0.5 * Math.max(this.internalState.renderAttributes.circleStrokeWidth, this.internalState.renderAttributes.circleStrokeWidth * this.componentSettings.bg_width);

        // Prepare individual time unit display elements
        var currentUnitIndex = 0;
        for (var unitKey in this.internalState.displayElements) {
            if (!this.componentSettings.time[unitKey].show)
                continue;

            var unitTextWrapper = jqRef("<div>");
            unitTextWrapper.addClass('textWrap_' + unitKey);
            unitTextWrapper.css("top", Math.round(0.35 * this.internalState.renderAttributes.unitDisplaySize));
            unitTextWrapper.css("left", Math.round(currentUnitIndex++ * this.internalState.renderAttributes.unitDisplaySize));
            unitTextWrapper.css("width", this.internalState.renderAttributes.unitDisplaySize);
            unitTextWrapper.appendTo(this.componentWrapper);

            var unitLabelHeader = jqRef("<h4>");
            unitLabelHeader.text(this.componentSettings.time[unitKey].text); // Label from options
            unitLabelHeader.css("font-size", Math.round(this.componentSettings.text_size * this.internalState.renderAttributes.unitDisplaySize));
            unitLabelHeader.css("line-height", Math.round(this.componentSettings.text_size * this.internalState.renderAttributes.unitDisplaySize) + "px");
            unitLabelHeader.appendTo(unitTextWrapper);

            var unitValueSpan = jqRef("<span>");
            unitValueSpan.css("font-size", Math.round(3 * this.componentSettings.text_size * this.internalState.renderAttributes.unitDisplaySize));
            unitValueSpan.css("line-height", Math.round(this.componentSettings.text_size * this.internalState.renderAttributes.unitDisplaySize) + "px");
            unitValueSpan.appendTo(unitTextWrapper);

            this.internalState.displayElements[unitKey] = unitValueSpan;
        }

        this.start(); // Begin the countdown/timer
        if (!this.componentSettings.start) {
            this.internalState.isPaused = true;
        }

        // Set up a fallback interval for updates (less precise than requestAnimationFrame)
        var selfRef = this;
        this.internalState.intervalHandle = globalScopeObj.setInterval(function(){
            selfRef.refreshDisplay.call(selfRef, true);
        }, 100);
    };

    /**
     * Refreshes the display of the countdown component.
     * @param {boolean} [skipDrawing=false] - If true, only updates internal state without redrawing.
     */
    CountdownComponent.prototype.refreshDisplay = function(skipDrawing) {
        if(typeof skipDrawing === "undefined") {
            skipDrawing = false;
        }
        else if(skipDrawing && this.internalState.isPaused) {
            return; // Don't update if paused and only doing a non-drawing update
        }

        // In limited mode (e.g., IE8 with ExplorerCanvas), clear the entire canvas once
        // as per-unit clearing doesn't work well, sacrificing radial fade.
        if(restrictedFuncs) {
            this.internalState.renderAttributes.canvasContext.clearRect(0, 0, this.internalState.renderAttributes.drawingCanvas[0].width, this.internalState.renderAttributes.drawingCanvas[0].height);
        }
        var timeDifference, prevTimeDifference;

        var lastDateChecked = this.internalState.previousUpdateTime;
        var currentDateChecked = new Date();
        this.internalState.previousUpdateTime = currentDateChecked;

        if (lastDateChecked === null)
            lastDateChecked = currentDateChecked;

        // If not counting past zero and current time exceeds reference, draw zeros and stop.
        if (!this.componentSettings.count_past_zero) {
            if (currentDateChecked > this.internalState.renderAttributes.ref_date) {
                for(var idx = 0; idx < this.internalState.renderedUnits.length; idx++) {
                    var timeUnitKey = this.internalState.renderedUnits[idx];

                    // Set text to "0" for the unit
                    this.internalState.displayElements[timeUnitKey].text("0");
                    var drawXCoord = (idx * this.internalState.renderAttributes.unitDisplaySize) + (this.internalState.renderAttributes.unitDisplaySize / 2);
                    var drawYCoord = this.internalState.renderAttributes.unitDisplaySize / 2;
                    var arcColor = this.componentSettings.time[timeUnitKey].color;
                    this.drawArc(drawXCoord, drawYCoord, arcColor, 0); // Draw a full circle (0 percentage of remaining time)
                }
                this.stop(); // Stop the component updates
                return;
            }
        }

        // Calculate difference from reference date in seconds
        timeDifference = (this.internalState.renderAttributes.ref_date - currentDateChecked) / 1000;
        prevTimeDifference = (this.internalState.renderAttributes.ref_date - lastDateChecked) / 1000;

        var roundDownValues = this.componentSettings.animation !== "smooth";

        // Get time values for currently displayed units and all units
        var displayableTimeInfo = calculateTimeValues(timeDifference, prevTimeDifference, this.internalState.totalCountdownDuration, this.internalState.renderedUnits, roundDownValues);
        var fullTimeInfo = calculateTimeValues(timeDifference, prevTimeDifference, unitDurationsInSeconds["Years"], allTemporalUnits, roundDownValues);

        var idx = 0;
        var innerIdx = 0;
        var previousKey = null;

        var currentlyVisible = this.internalState.renderedUnits.slice();
        for (var iKey in allTemporalUnits) {
            var timeUnitKey = allTemporalUnits[iKey];

            // Notify all listeners (for any unit change)
            if (Math.floor(fullTimeInfo.raw_time[timeUnitKey]) !== Math.floor(fullTimeInfo.raw_old_time[timeUnitKey])) {
                this.notifyListeners(timeUnitKey, Math.floor(fullTimeInfo.time[timeUnitKey]), Math.floor(timeDifference), "all");
            }

            if (currentlyVisible.indexOf(timeUnitKey) < 0)
                continue; // Skip if this unit is not configured to be displayed

            // Notify visible listeners (for displayed unit changes)
            if (Math.floor(displayableTimeInfo.raw_time[timeUnitKey]) !== Math.floor(displayableTimeInfo.raw_old_time[timeUnitKey])) {
                this.notifyListeners(timeUnitKey, Math.floor(displayableTimeInfo.time[timeUnitKey]), Math.floor(timeDifference), "visible");
            }

            if(!skipDrawing) {
                // Update the text value for the unit
                this.internalState.displayElements[timeUnitKey].text(Math.floor(Math.abs(displayableTimeInfo.time[timeUnitKey])));
            }