var ChronometerForge = (function() {
    var globalContext = window;

    // Alternative Object.keys implementation
    function retrieveObjectKeys(inputObject) {
        if (typeof inputObject !== 'object' && typeof inputObject !== 'function' || inputObject === null) {
            throw new TypeError('Key extraction called on non-object');
        }
        var collectedKeys = [];
        for (var propertyKey in inputObject) {
            if (Object.prototype.hasOwnProperty.call(inputObject, propertyKey)) {
                collectedKeys.push(propertyKey);
            }
        }
        return collectedKeys;
    }

    // Alternative Array.prototype.indexOf implementation
    function locateInArray(targetArray, searchElement, fromIndex) {
        var arrayLength = targetArray.length >>> 0;
        var startIndex = Number(fromIndex) || 0;
        startIndex = (startIndex < 0) ? Math.ceil(startIndex) : Math.floor(startIndex);
        if (startIndex < 0) startIndex += arrayLength;

        for (; startIndex < arrayLength; startIndex++) {
            if (startIndex in targetArray && targetArray[startIndex] === searchElement) {
                return startIndex;
            }
        }
        return -1;
    }

    // Ensure modern JS features or provide alternatives
    if (!Object.keys) Object.keys = retrieveObjectKeys;
    if (!Array.prototype.indexOf) Array.prototype.indexOf = function(element, start) { return locateInArray(this, element, start); };

    var renderingFallback = false; // Indicates if canvas rendering is limited
    var refreshInterval = 200; // Milliseconds for non-animation frame updates

    var tracingEnabled = (globalContext.location.hash === "#monitor"); // Debugging flag
    function traceLog(message) {
        if (tracingEnabled) {
            console.log(message);
        }
    }

    var availableUnits = ["Days", "Hours", "Minutes", "Seconds"];
    var unitRelations = {
        Seconds: "Minutes",
        Minutes: "Hours",
        Hours: "Days",
        Days: "Years" // A conceptual larger unit
    };
    var unitConversions = { // Seconds in each unit
        Seconds: 1,
        Minutes: 60,
        Hours: 3600,
        Days: 86400,
        Months: 2678400,
        Years: 31536000
    };

    /**
     * Transforms hex color string to RGB object.
     * @param {string} hexCode - The hex color string (e.g., "#FFF" or "#FFFFFF").
     * @returns {object|null} An object with r, g, b properties, or null if invalid.
     */
    function convertHexToRgb(hexCode) {
        var shortHexPattern = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hexCode = hexCode.replace(shortHexPattern, function(match, r, g, b) {
            return r + r + g + g + b + b;
        });

        var fullHexPattern = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i;
        var matchResult = fullHexPattern.exec(hexCode);
        return matchResult ? {
            r: parseInt(matchResult[1], 16),
            g: parseInt(matchResult[2], 16),
            b: parseInt(matchResult[3], 16)
        } : null;
    }

    function checkCanvasSupport() {
        var testElement = document.createElement('canvas');
        return !!(testElement.getContext && testElement.getContext('2d'));
    }

    /**
     * Generates a random hexadecimal segment.
     * @returns {string} A 4-character hex string.
     */
    function generateHexSegment() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }

    /**
     * Creates a unique identifier string.
     * @returns {string} A UUID-like string.
     */
    function createUniqueId() {
        return generateHexSegment() + generateHexSegment() + '-' + generateHexSegment() + '-' + generateHexSegment() + '-' +
            generateHexSegment() + '-' + generateHexSegment() + generateHexSegment() + generateHexSegment();
    }

    function parseInputDate(dateString) {
        var formalMatch = dateString.match(/^[0-9]{4}-[0-9]{2}-[0-9]{2}\s[0-9]{1,2}:[0-9]{2}:[0-9]{2}$/);
        if (formalMatch && formalMatch.length > 0) {
            var parts = dateString.split(" ");
            var dateParts = parts[0].split("-");
            var timeParts = parts[1].split(":");
            return new Date(dateParts[0], dateParts[1] - 1, dateParts[2], timeParts[0], timeParts[1], timeParts[2]);
        }
        var parsedAttempt = Date.parse(dateString);
        if (!isNaN(parsedAttempt)) return parsedAttempt;
        parsedAttempt = Date.parse(dateString.replace(/-/g, '/').replace('T', ' '));
        if (!isNaN(parsedAttempt)) return parsedAttempt;
        return new Date(); // Fallback to current date
    }

    /**
     * Calculates time components (raw, absolute, percentage) for given difference.
     * @param {number} currentDiffSeconds - Current time difference in seconds.
     * @param {number} previousDiffSeconds - Previous time difference in seconds.
     * @param {number} totalDurationSeconds - Total duration for the top-level unit.
     * @param {Array<string>} activeUnits - Units to calculate (e.g., ["Days", "Hours"]).
     * @param {boolean} roundDown - Whether to floor or ceil unit values.
     * @returns {object} An object containing various time representations.
     */
    function calculateTimeComponents(currentDiffSeconds, previousDiffSeconds, totalDurationSeconds, activeUnits, roundDown) {
        var rawValues = {};
        var rawOldValues = {};
        var absoluteValues = {};
        var absoluteOldValues = {};
        var currentPercentages = {};
        var oldPercentages = {};

        var enclosingUnit = null;
        for (var i = 0; i < activeUnits.length; i++) {
            var unitKey = activeUnits[i];
            var maxUnitValue;

            if (enclosingUnit === null) {
                maxUnitValue = totalDurationSeconds / unitConversions[unitKey];
            } else {
                maxUnitValue = unitConversions[enclosingUnit] / unitConversions[unitKey];
            }

            var currentUnitVal = (currentDiffSeconds / unitConversions[unitKey]);
            var previousUnitVal = (previousDiffSeconds / unitConversions[unitKey]);

            if (roundDown) {
                currentUnitVal = (currentUnitVal > 0) ? Math.floor(currentUnitVal) : Math.ceil(currentUnitVal);
                previousUnitVal = (previousUnitVal > 0) ? Math.floor(previousUnitVal) : Math.ceil(previousUnitVal);
            }

            // Apply modulo for all units except the largest displayed unit
            if (activeUnits.length > 0 && unitKey !== activeUnits[0]) {
                currentUnitVal %= maxUnitValue;
                previousUnitVal %= maxUnitValue;
            }

            rawValues[unitKey] = currentUnitVal;
            absoluteValues[unitKey] = Math.abs(currentUnitVal);
            rawOldValues[unitKey] = previousUnitVal;
            absoluteOldValues[unitKey] = Math.abs(previousUnitVal);
            currentPercentages[unitKey] = Math.abs(currentUnitVal) / maxUnitValue;
            oldPercentages[unitKey] = Math.abs(previousUnitVal) / maxUnitValue;

            enclosingUnit = unitKey;
        }

        return {
            rawPeriods: rawValues,
            rawPriorPeriods: rawOldValues,
            displayPeriods: absoluteValues,
            priorDisplayPeriods: absoluteOldValues,
            progressRatios: currentPercentages,
            priorProgressRatios: oldPercentages
        };
    }

    var timerInstancesMap = {}; // Registry for all VisualTimer instances

    function setupAnimationScheduler(targetWindow) {
        var vendorPrefixes = ['webkit', 'moz'];
        for (var i = 0; i < vendorPrefixes.length && !targetWindow.requestAnimationFrame; ++i) {
            targetWindow.requestAnimationFrame = targetWindow[vendorPrefixes[i] + 'RequestAnimationFrame'];
            targetWindow.cancelAnimationFrame = targetWindow[vendorPrefixes[i] + 'CancelAnimationFrame'];
        }

        if (!targetWindow.requestAnimationFrame || !targetWindow.cancelAnimationFrame) {
            targetWindow.requestAnimationFrame = function(callbackFunction, domElement, timerRef) {
                if (!timerRef || !timerRef.internalState) timerRef = { internalState: { lastRenderTimestamp: 0 } };
                var currentTime = new Date().getTime();
                var timeToNextCall = Math.max(0, 16 - (currentTime - timerRef.internalState.lastRenderTimestamp));
                var timerId = targetWindow.setTimeout(function() {
                    callbackFunction(currentTime + timeToNextCall);
                }, timeToNextCall);
                timerRef.internalState.lastRenderTimestamp = currentTime + timeToNextCall;
                return timerId;
            };
            targetWindow.cancelAnimationFrame = function(id) {
                targetWindow.clearTimeout(id);
            };
        }
    }

    // Initialize once for the global context
    setupAnimationScheduler(globalContext);

    // The core timer visualization class
    var VisualTimer = function(domElement, customOptions) {
        this.targetElement = domElement;
        this.visualContainer = null; // Main container div
        this.eventSubscribers = null; // Listener storage
        this.internalState = {
            isDormant: false, // Paused state
            lastRenderTimestamp: 0,
            animationHandle: null,
            fallbackTimerId: null,
            countdownActive: false, // Is timer running
            totalSpanSeconds: null, // Total duration of the largest unit
            previousUpdateTime: null,
            displayedUnits: [], // Units configured to be shown
            unitLabelElements: { // References to DOM elements for unit numbers
                Days: null,
                Hours: null,
                Minutes: null,
                Seconds: null
            },
            renderingProps: { // Canvas related attributes
                drawingSurface: null, // Canvas element
                renderContext: null, // Canvas 2D context
                unitSegmentSize: null,
                arcThickness: null,
                innerRadius: null,
                outerRingRadius: null,
                referenceDate: null // The target date for countdown
            },
            unitFadeStatus: { // State for fading effects
                Days: false,
                Hours: false,
                Minutes: false,
                Seconds: false
            }
        };

        this.displaySettings = null; // Merged configuration
        this.configureDisplay(customOptions);
        this.setupVisuals();
    };

    VisualTimer.prototype.resetSubscriptions = function() {
        this.eventSubscribers = { all: [], visible: [] };
    };

    VisualTimer.prototype.adjustReferenceTime = function(secondsToAdd) {
        if (this.internalState.renderingProps.referenceDate instanceof Date) {
            this.internalState.renderingProps.referenceDate.setSeconds(this.internalState.renderingProps.referenceDate.getSeconds() + secondsToAdd);
        } else if (!isNaN(this.internalState.renderingProps.referenceDate)) {
            this.internalState.renderingProps.referenceDate += (secondsToAdd * 1000);
        }
    };

    VisualTimer.prototype.configureDisplay = function(options) {
        // Default settings for the countdown display
        var defaultSettings = {
            start: true,
            circle_bg_color: "#60686F",
            fg_width: 0.1,
            bg_width: 1.2,
            text_color: "#ffffff",
            time: {
                Days: { show: true, text: "Days", color: "#FFAD4E" },
                Hours: { show: true, text: "Hours", color: "#91BF4F" },
                Minutes: { show: true, text: "Minutes", color: "#84B6F7" },
                Seconds: { show: true, text: "Seconds", color: "#EA4C46" }
            },
            refresh_interval: 0.1, // In seconds
            count_past_zero: true,
            animation: "smooth", // "smooth" or "ticks"
            bg_unit: "Days", // Background circle for which unit (e.g. Days or Hours)
            use_background: true,
            allow_set_time: true,
            display_unique_id: null,
            text_size: 0.07 // Percentage of item_size
        };

        // Deep merge options
        this.displaySettings = JSON.parse(JSON.stringify(defaultSettings)); // Clone default
        if (options) {
            for (var key in options) {
                if (Object.prototype.hasOwnProperty.call(options, key)) {
                    if (typeof options[key] === 'object' && options[key] !== null && !Array.isArray(options[key])) {
                        this.displaySettings[key] = this.displaySettings[key] || {}; // Ensure target exists
                        for (var subKey in options[key]) {
                            if (Object.prototype.hasOwnProperty.call(options[key], subKey)) {
                                this.displaySettings[key][subKey] = options[key][subKey];
                            }
                        }
                    } else {
                        this.displaySettings[key] = options[key];
                    }
                }
            }
        }

        // Set the reference date based on data attribute or options
        var dataDate = this.targetElement.getAttribute("data-date");
        var dataTimer = this.targetElement.getAttribute("data-timer");

        if (dataDate) {
            this.internalState.renderingProps.referenceDate = parseInputDate(dataDate);
        } else if (dataTimer) {
            this.internalState.renderingProps.referenceDate = new Date().getTime() + parseInt(dataTimer) * 1000;
        } else if (this.displaySettings.ref_date) {
            this.internalState.renderingProps.referenceDate = parseInputDate(this.displaySettings.ref_date);
        } else {
            this.internalState.renderingProps.referenceDate = new Date(); // Default to now
        }

        if (this.displaySettings.display_unique_id === null) {
            this.displaySettings.display_unique_id = createUniqueId();
        }
    };

    VisualTimer.prototype.setupVisuals = function(clearExistingListeners) {
        // Determine which units to display
        this.internalState.displayedUnits = [];
        var unitKeys = Object.keys(this.displaySettings.time);
        for (var i = 0; i < unitKeys.length; i++) {
            var unit = unitKeys[i];
            if (this.displaySettings.time[unit].show) {
                this.internalState.displayedUnits.push(unit);
            }
        }

        // Remove any previous visual containers
        var existingVisuals = this.targetElement.querySelector('div.visual_chronometer');
        if (existingVisuals) {
            this.targetElement.removeChild(existingVisuals);
        }

        if (typeof clearExistingListeners === "undefined") clearExistingListeners = true;
        if (clearExistingListeners || this.eventSubscribers === null) {
            this.resetSubscriptions();
        }

        this.visualContainer = document.createElement("div");
        this.visualContainer.className = 'visual_chronometer';
        this.targetElement.appendChild(this.visualContainer);

        // Determine dimensions
        var elementHeight = this.targetElement.offsetHeight;
        var elementWidth = this.targetElement.offsetWidth;
        if (elementHeight === 0) elementHeight = parseFloat(getComputedStyle(this.targetElement).height);
        if (elementWidth === 0) elementWidth = parseFloat(getComputedStyle(this.targetElement).width);

        if (elementHeight === 0 && elementWidth > 0) elementHeight = elementWidth / this.internalState.displayedUnits.length;
        else if (elementWidth === 0 && elementHeight > 0) elementWidth = elementHeight * this.internalState.displayedUnits.length;

        // Create canvas
        var canvasElement = document.createElement('canvas');
        canvasElement.width = elementWidth;
        canvasElement.height = elementHeight;

        this.internalState.renderingProps.drawingSurface = canvasElement;
        this.visualContainer.appendChild(canvasElement);

        var canvasSupportDetected = checkCanvasSupport();
        if (!canvasSupportDetected && typeof G_vmlCanvasManager !== "undefined") {
            G_vmlCanvasManager.initElement(canvasElement);
            renderingFallback = true;
            canvasSupportDetected = true;
        }

        if (canvasSupportDetected) {
            this.internalState.renderingProps.renderContext = canvasElement.getContext('2d');
        }

        this.internalState.renderingProps.unitSegmentSize = Math.min(elementWidth / this.internalState.displayedUnits.length, elementHeight);
        this.internalState.renderingProps.arcThickness = this.internalState.renderingProps.unitSegmentSize * this.displaySettings.fg_width;
        this.internalState.renderingProps.innerRadius = ((this.internalState.renderingProps.unitSegmentSize * 0.8) - this.internalState.renderingProps.arcThickness) / 2;
        this.internalState.renderingProps.outerRingRadius = this.internalState.renderingProps.innerRadius + 0.5 * Math.max(this.internalState.renderingProps.arcThickness, this.internalState.renderingProps.arcThickness * this.displaySettings.bg_width);

        // Prepare text elements for units
        var currentXOffset = 0;
        for (var key in this.internalState.unitLabelElements) {
            if (!this.displaySettings.time[key].show) continue;

            var textWrapper = document.createElement("div");
            textWrapper.className = 'label_wrapper_' + key.toLowerCase();
            textWrapper.style.position = 'absolute'; // Explicitly set position
            textWrapper.style.top = Math.round(0.35 * this.internalState.renderingProps.unitSegmentSize) + 'px';
            textWrapper.style.left = Math.round(currentXOffset) + 'px';
            textWrapper.style.width = this.internalState.renderingProps.unitSegmentSize + 'px';
            this.visualContainer.appendChild(textWrapper);

            var headerLabel = document.createElement("h4");
            headerLabel.textContent = this.displaySettings.time[key].text;
            headerLabel.style.fontSize = Math.round(this.displaySettings.text_size * this.internalState.renderingProps.unitSegmentSize) + 'px';
            headerLabel.style.lineHeight = Math.round(this.displaySettings.text_size * this.internalState.renderingProps.unitSegmentSize) + 'px';
            textWrapper.appendChild(headerLabel);

            var numberDisplay = document.createElement("span");
            numberDisplay.style.fontSize = Math.round(3 * this.displaySettings.text_size * this.internalState.renderingProps.unitSegmentSize) + 'px';
            numberDisplay.style.lineHeight = Math.round(this.displaySettings.text_size * this.internalState.renderingProps.unitSegmentSize) + 'px';
            textWrapper.appendChild(numberDisplay);

            this.internalState.unitLabelElements[key] = numberDisplay;
            currentXOffset += this.internalState.renderingProps.unitSegmentSize;
        }

        this.beginCycle();
        if (!this.displaySettings.start) {
            this.internalState.isDormant = true;
        }

        // Setup interval fallback for older browsers or if animation frame is not used
        var self = this;
        this.internalState.fallbackTimerId = globalContext.setInterval(function() {
            self.refreshDisplay(true); // true indicates a nodraw update
        }, refreshInterval);
    };

    /**
     * Draws a circular arc segment on the canvas.
     * @param {number} centerX - X coordinate of the arc center.
     * @param {number} centerY - Y coordinate of the arc center.
     * @param {string} color - Color of the arc.
     * @param {number} progressRatio - Value from 0 to 1 representing filled portion.
     * @param {number} radius - Radius of the arc.
     * @param {number} thickness - Line thickness of the arc.
     * @param {boolean} clockwise - Direction of drawing.
     */
    VisualTimer.prototype.renderArcSegment = function(centerX, centerY, color, progressRatio, radius, thickness, clockwise) {
        var ctx = this.internalState.renderingProps.renderContext;
        if (!ctx) return;

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, Math.PI * 1.5, Math.PI * 1.5 + (Math.PI * 2 * progressRatio), !clockwise);
        ctx.lineWidth = thickness;
        ctx.strokeStyle = color;
        ctx.stroke();
    };

    VisualTimer.prototype.refreshDisplay = function(noDrawing) {
        if (typeof noDrawing === "undefined") noDrawing = false;
        else if (noDrawing && this.internalState.isDormant) return;

        var ctx = this.internalState.renderingProps.renderContext;
        var canvas = this.internalState.renderingProps.drawingSurface;

        if (renderingFallback && ctx) {
            // Clear entire canvas for IE8 fallback, as per-unit clearing is problematic
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }

        var currentDifference, priorDifference;
        var currentTime = new Date();
        var previousTime = this.internalState.previousUpdateTime || currentTime;
        this.internalState.previousUpdateTime = currentTime;

        // If not counting past zero and target is already past, draw zero and stop
        if (!this.displaySettings.count_past_zero) {
            if (currentTime > this.internalState.renderingProps.referenceDate) {
                var xPos = 0;
                for (var i = 0; i < this.internalState.displayedUnits.length; i++) {
                    var unitKey = this.internalState.displayedUnits[i];
                    this.internalState.unitLabelElements[unitKey].textContent = "0";
                    var currentUnitCenterX = (xPos * this.internalState.renderingProps.unitSegmentSize) + (this.internalState.renderingProps.unitSegmentSize / 2);
                    var currentUnitCenterY = this.internalState.renderingProps.unitSegmentSize / 2;
                    var unitColor = this.displaySettings.time[unitKey].color;
                    this.renderArcSegment(currentUnitCenterX, currentUnitCenterY, unitColor, 0, this.internalState.renderingProps.innerRadius, this.internalState.renderingProps.arcThickness, false);
                    xPos++;
                }
                this.haltCycle();
                return;
            }
        }

        currentDifference = (this.internalState.renderingProps.referenceDate - currentTime) / 1000;
        priorDifference = (this.internalState.renderingProps.referenceDate - previousTime) / 1000;

        var applyRounding = this.displaySettings.animation !== "smooth";

        var currentDisplayData = calculateTimeComponents(currentDifference, priorDifference, this.internalState.totalSpanSeconds, this.internalState.displayedUnits, applyRounding);
        var allUnitsDisplayData = calculateTimeComponents(currentDifference, priorDifference, unitConversions["Years"], availableUnits, applyRounding);

        var currentUnitIndex = 0;
        var largestUnitKey = this.internalState.displayedUnits[0];

        // Ensure totalSpanSeconds is correctly set for the largest displayed unit
        if (this.internalState.totalSpanSeconds === null) {
            this.internalState.totalSpanSeconds = unitConversions[largestUnitKey];
        }

        // Iterate through all possible units for notifications
        for (var k = 0; k < availableUnits.length; k++) {
            var unit = availableUnits[k];
            // Notify all listeners
            if (Math.floor(allUnitsDisplayData.rawPeriods[unit]) !== Math.floor(allUnitsDisplayData.rawPriorPeriods[unit])) {
                this.dispatchUpdateEvent(unit, Math.floor(allUnitsDisplayData.displayPeriods[unit]), Math.floor(currentDifference), "all");
            }
        }

        if (!noDrawing) {
            var xOffset = 0;
            for (var j = 0; j < this.internalState.displayedUnits.length; j++) {
                var unitKey = this.internalState.displayedUnits[j];

                // Notify visible listeners
                if (Math.floor(currentDisplayData.rawPeriods[unitKey]) !== Math.floor(currentDisplayData.rawPriorPeriods[unitKey])) {
                    this.dispatchUpdateEvent(unitKey, Math.floor(currentDisplayData.displayPeriods[unitKey]), Math.floor(currentDifference), "visible");
                }

                // Update text
                this.internalState.unitLabelElements[unitKey].textContent = Math.floor(Math.abs(currentDisplayData.displayPeriods[unitKey]));

                var unitCenterX = (xOffset * this.internalState.renderingProps.unitSegmentSize) + (this.internalState.renderingProps.unitSegmentSize / 2);
                var unitCenterY = this.internalState.renderingProps.unitSegmentSize / 2;
                var unitColor = this.displaySettings.time[unitKey].color;

                // Clear previous arc only for non-fallback mode
                if (ctx && !renderingFallback) {
                    ctx.clearRect(unitCenterX - this.internalState.renderingProps.outerRingRadius,
                        unitCenterY - this.internalState.renderingProps.outerRingRadius,
                        this.internalState.renderingProps.outerRingRadius * 2,
                        this.internalState.renderingProps.outerRingRadius * 2);
                }

                // Draw background circle
                if (this.displaySettings.use_background) {
                    this.renderArcSegment(unitCenterX, unitCenterY, this.displaySettings.circle_bg_color, 1, this.internalState.renderingProps.outerRingRadius, this.internalState.renderingProps.arcThickness * this.displaySettings.bg_width, false);
                }

                // Draw foreground arc
                var currentProgress = currentDisplayData.progressRatios[unitKey];
                this.renderArcSegment(unitCenterX, unitCenterY, unitColor, currentProgress, this.internalState.renderingProps.innerRadius, this.internalState.renderingProps.arcThickness, false);

                xOffset++;
            }
        }
    };

    VisualTimer.prototype.beginCycle = function() {
        if (this.internalState.countdownActive) return;
        var instanceRef = this;
        this.internalState.countdownActive = true;
        this.internalState.isDormant = false;

        function animationLoop() {
            if (instanceRef.internalState.isDormant || !instanceRef.internalState.countdownActive) {
                globalContext.cancelAnimationFrame(instanceRef.internalState.animationHandle);
                return;
            }
            instanceRef.refreshDisplay();
            instanceRef.internalState.animationHandle = globalContext.requestAnimationFrame(animationLoop, instanceRef.targetElement, instanceRef);
        }
        this.internalState.animationHandle = globalContext.requestAnimationFrame(animationLoop, this.targetElement, this);
    };

    VisualTimer.prototype.haltCycle = function() {
        this.internalState.countdownActive = false;
        this.internalState.isDormant = true;
        globalContext.cancelAnimationFrame(this.internalState.animationHandle);
        globalContext.clearInterval(this.internalState.fallbackTimerId);
    };

    VisualTimer.prototype.suspendCycle = function() {
        this.internalState.isDormant = true;
    };

    VisualTimer.prototype.resumeCycle = function() {
        this.internalState.isDormant = false;
        this.beginCycle();
    };

    VisualTimer.prototype.dispatchUpdateEvent = function(unit, value, totalSeconds, scope) {
        if (this.eventSubscribers[scope]) {
            for (var i = 0; i < this.eventSubscribers[scope].length; i++) {
                this.eventSubscribers[scope][i](unit, value, totalSeconds);
            }
        }
    };

    VisualTimer.prototype.onUpdate = function(callback, scope) {
        if (typeof scope === "undefined") scope = "visible";
        if (!this.eventSubscribers[scope]) this.eventSubscribers[scope] = [];
        this.eventSubscribers[scope].push(callback);
    };

    // Public API for ChronometerForge
    var PublicForge = function(selectorOrElement, options) {
        var elements = [];
        if (typeof selectorOrElement === 'string') {
            elements = Array.prototype.slice.call(document.querySelectorAll(selectorOrElement));
        } else if (selectorOrElement instanceof HTMLElement) {
            elements = [selectorOrElement];
        } else if (Array.isArray(selectorOrElement) || selectorOrElement instanceof NodeList) {
            elements = Array.prototype.slice.call(selectorOrElement);
        }

        var instanceCollection = [];
        for (var i = 0; i < elements.length; i++) {
            var element = elements[i];
            var instanceId = element.getAttribute('data-timer-id') || createUniqueId();
            element.setAttribute('data-timer-id', instanceId);

            var existingInstance = timerInstancesMap[instanceId];
            if (existingInstance) {
                existingInstance.configureDisplay(options);
                existingInstance.setupVisuals();
                instanceCollection.push(existingInstance);
            } else {
                var newInstance = new VisualTimer(element, options);
                timerInstancesMap[instanceId] = newInstance;
                instanceCollection.push(newInstance);
            }
        }

        // Return a proxy object for managing the collection
        return {
            instances: instanceCollection,
            start: function() {
                this.instances.forEach(function(inst) { inst.resumeCycle(); });
                return this;
            },
            stop: function() {
                this.instances.forEach(function(inst) { inst.haltCycle(); });
                return this;
            },
            pause: function() {
                this.instances.forEach(function(inst) { inst.suspendCycle(); });
                return this;
            },
            addTime: function(seconds) {
                this.instances.forEach(function(inst) { inst.adjustReferenceTime(seconds); inst.refreshDisplay(); });
                return this;
            },
            setOptions: function(newOptions) {
                this.instances.forEach(function(inst) { inst.configureDisplay(newOptions); inst.setupVisuals(); });
                return this;
            },
            onUpdate: function(callback, scope) {
                this.instances.forEach(function(inst) { inst.onUpdate(callback, scope); });
                return this;
            }
        };
    };

    return PublicForge;
})();

// To use it similarly to the original jQuery plugin:
// var myTimers = ChronometerForge(".timer", { /* options */ });
// myTimers.start();
// myTimers.onUpdate(function(unit, value, total) { console.log(unit + ": " + value); });