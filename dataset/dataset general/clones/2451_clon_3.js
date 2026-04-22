/**
 * New introductory comments, reflecting the renamed classes and concepts.
 * This module provides a flexible display component for countdowns or elapsed time.
 * It exposes a public interface, `CountdownDisplay`, which acts as a manager for
 * multiple `DisplayModule` instances, one per target DOM element.
 *
 * When you initialize it, e.g.:
 *      let myCountdown = $(".timer-element").CountdownDisplay();
 *
 * `myCountdown` will be an instance of the `CountdownDisplay` class.
 * The `CountdownDisplay` class is designed to delegate actions to individual
 * `DisplayModule` instances associated with each element in its collection.
 * Refer to the project documentation for advanced usage and chaining options.
 **/
(function($) {

    const executionContext = window; // Renamed from useWindow

    // Removed Object.keys polyfill - assuming modern browser support (ES5+)

    // Renamed and simplified global flags/settings
    let legacyCanvasMode = false; // Used to disable some features on older/limited canvas environments
    const animationFrameInterval = 200; // in milliseconds, for fallback interval
    
    const isDebugging = (location.hash === "#debug-enabled"); // Renamed debug flag
    function consoleLogIfDebug(message) { // Renamed debug_log
        if (isDebugging) {
            console.log("[CountdownDisplay Debug]:", message);
        }
    }

    // Renamed time unit definitions
    const timeGranularities = ["Days", "Hours", "Minutes", "Seconds"];
    const nextGranularity = {
        Seconds: "Minutes",
        Minutes: "Hours",
        Hours: "Days",
        Days: "Years" // Arbitrary large unit for 'Days' boundary
    };
    const secondsPerGranularity = { // Renamed secondsIn
        Seconds: 1,
        Minutes: 60,
        Hours: 3600,
        Days: 86400,
        Months: 2678400, // Added Months for completeness, though not used in default display
        Years: 31536000
    };

    /**
     * Converts a hexadecimal color string to an RGB object.
     * Original source: http://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
     * @param {string} hexColor - The hex color code (e.g., "#RRGGBB" or "RRGGBB").
     * @returns {object|null} An object with 'r', 'g', 'b' properties, or null if invalid.
     */
    function convertHexToRgb(hexColor) { // Renamed hexToRgb
        // Ensure hexColor is a string and handle optional '#' prefix
        if (typeof hexColor !== 'string') return null;
        let processedHex = hexColor.startsWith('#') ? hexColor.slice(1) : hexColor;

        // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
        const shorthandPattern = /^([a-f\d])([a-f\d])([a-f\d])$/i;
        processedHex = processedHex.replace(shorthandPattern, (match, r, g, b) => r + r + g + g + b + b);

        const fullHexPattern = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i;
        const matchResult = fullHexPattern.exec(processedHex);

        return matchResult ? {
            r: parseInt(matchResult[1], 16),
            g: parseInt(matchResult[2], 16),
            b: parseInt(matchResult[3], 16)
        } : null;
    }
    
    /**
     * Checks if the browser environment supports HTML5 Canvas.
     * @returns {boolean} True if canvas is supported, false otherwise.
     */
    function checkCanvasSupport() { // Renamed isCanvasSupported
        const testCanvas = document.createElement('canvas');
        return !!(testCanvas.getContext && testCanvas.getContext('2d'));
    }

    /**
     * Generates a random 4-character hex segment.
     * Part of a UUID generation strategy.
     */
    function generateRandomSegment() { // Renamed s4
        return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
    }

    /**
     * Creates a unique identifier string (UUID-like).
     * @returns {string} A unique ID.
     */
    function createUniqueId() { // Renamed guid
        return generateRandomSegment() + generateRandomSegment() + '-' + generateRandomSegment() + '-' + generateRandomSegment() + '-' +
               generateRandomSegment() + '-' + generateRandomSegment() + generateRandomSegment() + generateRandomSegment();
    }

    // Removed Array.prototype.indexOf polyfill - assuming modern browser support (ES5+)

    /**
     * Attempts to parse a date string into a Date object.
     * Supports "YYYY-MM-DD HH:MM:SS" and common Date.parse formats.
     * @param {string} dateString - The date string to parse.
     * @returns {Date} A Date object representing the parsed date, or a new Date() if parsing fails.
     */
    function parseInputDate(dateString) { // Renamed parse_date
        if (typeof dateString !== 'string' || !dateString) {
            consoleLogIfDebug("Invalid date string provided for parsing.");
            return new Date(); // Return current date for invalid input
        }

        // Attempt to parse "YYYY-MM-DD HH:MM:SS" format
        const preciseFormatMatch = dateString.match(/^(\d{4})-(\d{2})-(\d{2})\s(\d{1,2}):(\d{2}):(\d{2})$/);
        if (preciseFormatMatch && preciseFormatMatch.length === 7) {
            // Note: Month is 0-indexed in Date constructor, so subtract 1
            return new Date(
                parseInt(preciseFormatMatch[1]), // Year
                parseInt(preciseFormatMatch[2]) - 1, // Month
                parseInt(preciseFormatMatch[3]), // Day
                parseInt(preciseFormatMatch[4]), // Hour
                parseInt(preciseFormatMatch[5]), // Minute
                parseInt(preciseFormatMatch[6])  // Second
            );
        }
        
        // Fallback for different date formats using Date.parse
        let parsedTimestamp = Date.parse(dateString);
        if (!isNaN(parsedTimestamp)) return new Date(parsedTimestamp);

        // Try replacing hyphens with slashes and 'T' with space for better cross-browser parsing
        parsedTimestamp = Date.parse(dateString.replace(/-/g, '/').replace('T', ' '));
        if (!isNaN(parsedTimestamp)) return new Date(parsedTimestamp);

        // If all parsing attempts fail, return the current date
        consoleLogIfDebug(`Failed to parse date string: "${dateString}". Returning current date.`);
        return new Date();
    }

    /**
     * Calculates time components (raw, absolute, percentage) for given time differences.
     * @param {number} currentDiffSeconds - Current time difference in seconds.
     * @param {number} previousDiffSeconds - Previous time difference in seconds.
     * @param {number} totalDurationSeconds - The total duration for percentage calculation.
     * @param {Array<string>} unitsToProcess - An array of time unit names (e.g., "Days", "Hours").
     * @param {boolean} shouldFloorValues - Whether to floor or ceil values based on sign.
     * @returns {object} An object containing raw, absolute, and percentage time components.
     */
    function calculateTimeComponents(currentDiffSeconds, previousDiffSeconds, totalDurationSeconds, unitsToProcess, shouldFloorValues) { // Renamed parse_times
        const rawCurrentTime = {};
        const rawPreviousTime = {};
        const absoluteCurrentTime = {};
        const absolutePreviousTime = {};
        const currentPercentage = {};
        const previousPercentage = {};

        let currentLargerUnit = null; // Renamed greater_unit

        for (const unitName of unitsToProcess) { // Changed for loop to for...of
            let maxUnitValue;

            if (currentLargerUnit === null) {
                maxUnitValue = totalDurationSeconds / secondsPerGranularity[unitName];
            } else {
                maxUnitValue = secondsPerGranularity[currentLargerUnit] / secondsPerGranularity[unitName];
            }

            let currentUnits = currentDiffSeconds / secondsPerGranularity[unitName];
            let previousUnits = previousDiffSeconds / secondsPerGranularity[unitName];
            
            if (shouldFloorValues) {
                currentUnits = currentUnits > 0 ? Math.floor(currentUnits) : Math.ceil(currentUnits);
                previousUnits = previousUnits > 0 ? Math.floor(previousUnits) : Math.ceil(previousUnits);
            }
            
            // The "Days" unit is usually not modulo'd against a larger unit like "Years" in this context
            if (unitName !== "Days") { 
                currentUnits %= maxUnitValue;
                previousUnits %= maxUnitValue;
            }

            rawCurrentTime[unitName] = currentUnits;
            absoluteCurrentTime[unitName] = Math.abs(currentUnits);
            rawPreviousTime[unitName] = previousUnits;
            absolutePreviousTime[unitName] = Math.abs(previousUnits);
            currentPercentage[unitName] = Math.abs(currentUnits) / maxUnitValue;
            previousPercentage[unitName] = Math.abs(previousUnits) / maxUnitValue;

            currentLargerUnit = unitName;
        }

        return {
            rawCurrentTime,
            rawPreviousTime,
            absoluteCurrentTime,
            absolutePreviousTime,
            currentPercentage,
            previousPercentage
        };
    }

    // Central registry for all active DisplayModule instances
    let activeDisplayModules = {}; // Renamed TC_Instance_List

    /**
     * Synchronizes the internal registry with the global execution context's registry.
     * Ensures all DisplayModule instances are accessible globally or locally.
     */
    function syncExecutionContext() { // Renamed updateUsedWindow
        if (typeof executionContext.activeDisplayModules !== "undefined") {
            activeDisplayModules = executionContext.activeDisplayModules;
        } else {
            executionContext.activeDisplayModules = activeDisplayModules;
        }
        setupAnimationFramePolyfill(executionContext);
    };
    
    /**
     * Initializes or polyfills requestAnimationFrame and cancelAnimationFrame for smooth animations.
     * @param {Window} win - The window object to apply the polyfill to.
     */
    function setupAnimationFramePolyfill(win) { // Renamed initializeAnimationFrameHandler
        const vendors = ['webkit', 'moz'];
        for (let i = 0; i < vendors.length && !win.requestAnimationFrame; ++i) {
            win.requestAnimationFrame = win[vendors[i] + 'RequestAnimationFrame'];
            win.cancelAnimationFrame = win[vendors[i] + 'CancelAnimationFrame'];
        }

        // Polyfill if native requestAnimationFrame is not available
        if (!win.requestAnimationFrame || !win.cancelAnimationFrame) {
            consoleLogIfDebug("Polyfilling requestAnimationFrame and cancelAnimationFrame.");
            let lastFrameTime = 0; // Moved this inside the scope of the polyfill function

            win.requestAnimationFrame = function(callback) {
                const currentTime = Date.now();
                const timeToCall = Math.max(0, 16 - (currentTime - lastFrameTime)); // Aim for ~60fps
                const frameId = win.setTimeout(() => {
                    callback(currentTime + timeToCall);
                }, timeToCall);
                lastFrameTime = currentTime + timeToCall; // Update lastFrameTime for next call
                return frameId;
            };
            win.cancelAnimationFrame = function(id) {
                win.clearTimeout(id);
            };
        }
    };
    
    // Default configuration options for a DisplayModule instance
    const defaultModuleOptions = {
        start: true, // Auto-start the countdown
        count_past_zero: true, // Continue counting into negative numbers
        animation: "smooth", // "smooth" or "ticks"
        fg_width: 0.1, // Foreground line width ratio
        bg_width: 1.2, // Background line width ratio
        text_size: 0.2, // Text size ratio
        total_duration: secondsPerGranularity.Years, // Default to a very long duration
        time: { // Configuration for each time unit
            Days: { show: true, text: "Days", color: "#FF0000" },
            Hours: { show: true, text: "Hours", color: "#00FF00" },
            Minutes: { show: true, text: "Minutes", color: "#0000FF" },
            Seconds: { show: true, text: "Seconds", color: "#FFFF00" }
        }
    };

    /**
     * Represents a single countdown display module, handling rendering and logic for one element.
     * @param {HTMLElement} targetElement - The DOM element this module is attached to.
     * @param {object} options - Configuration options for this module.
     */
    const DisplayModule = function(targetElement, options) { // Renamed TC_Instance
        this.targetElement = targetElement; // Renamed element
        this.wrapperContainer = null; // Renamed container
        this.eventListeners = { all: [], visible: [] }; // Renamed listeners, initialized directly
        this.moduleData = { // Renamed data
            isPaused: false, // Renamed paused
            lastFrameTimestamp: 0, // Renamed last_frame
            animationFrameId: null, // Renamed animation_frame
            intervalFallbackId: null, // Renamed interval_fallback
            isTimerRunning: false, // Renamed timer (more descriptive)
            totalTimeDuration: null, // Renamed total_duration
            previousUpdateTime: null, // Renamed prev_time
            displayedGranularities: [], // Renamed drawn_units
            granularityTextElements: { // Renamed text_elements
                Days: null,
                Hours: null,
                Minutes: null,
                Seconds: null
            },
            canvasAttributes: { // Renamed attributes
                canvasElementRef: null, // Renamed canvas
                drawingContext: null, // Renamed context
                granularityItemSize: null, // Renamed item_size
                lineWidth: null, // Renamed line_width
                innerRadius: null, // Renamed radius
                outerRadius: null, // Renamed outer_radius
                referenceDateTime: null // Added ref_date here for clarity
            },
            currentDisplayState: { // Renamed state
                isFading: { // Renamed fading
                    Days: false,
                    Hours: false,
                    Minutes: false,
                    Seconds: false
                }
            }
        };

        this.moduleConfiguration = $.extend(true, {}, defaultModuleOptions, options); // Renamed config, deep merge
        this.initializeModule(); // Renamed initialize
    };

    DisplayModule.prototype.clearEventListeners = function() { // Renamed clearListeners
        this.eventListeners = { all: [], visible: [] };
    };
    
    /**
     * Adjusts the reference date/time by adding or subtracting seconds.
     * @param {number} secondsToAdd - Number of seconds to add (can be negative).
     */
    DisplayModule.prototype.adjustReferenceTime = function(secondsToAdd) { // Renamed addTime
        const refDate = this.moduleData.canvasAttributes.referenceDateTime;
        if (refDate instanceof Date) {
            refDate.setSeconds(refDate.getSeconds() + secondsToAdd);
        } else if (typeof refDate === 'number' && !isNaN(refDate)) { // Handle timestamp
            this.moduleData.canvasAttributes.referenceDateTime += (secondsToAdd * 1000);
        } else {
            consoleLogIfDebug("Reference date is not a valid Date object or timestamp. Cannot adjust time.");
        }
    };
    
    /**
     * Initializes or re-initializes the display module, setting up DOM elements and canvas.
     * @param {boolean} [resetListeners=true] - Whether to clear existing event listeners.
     */
    DisplayModule.prototype.initializeModule = function(resetListeners = true) { // Renamed initialize, added default param
        // Populate displayed granularities based on configuration
        this.moduleData.displayedGranularities = Object.keys(this.moduleConfiguration.time.timeUnitsConfig).filter(
            unit => this.moduleConfiguration.time.timeUnitsConfig[unit].show
        );

        // Remove any previously created elements to prevent stacking
        $(this.targetElement).children('div.time_circles_wrapper').remove(); // Changed class name
        $(this.targetElement).empty(); // Ensure the target element is clean

        if (resetListeners || !this.eventListeners) {
            this.clearEventListeners();
        }

        this.wrapperContainer = $("<div>").addClass('time_circles_wrapper').appendTo(this.targetElement); // Renamed class

        // Determine the needed width and height of the display area
        let containerHeight = this.targetElement.offsetHeight || $(this.targetElement).height(); // Renamed height
        let containerWidth = this.targetElement.offsetWidth || $(this.targetElement).width(); // Renamed width

        // Handle cases where only one dimension is specified or both are zero
        if (containerHeight === 0 && containerWidth > 0) {
            containerHeight = containerWidth / this.moduleData.displayedGranularities.length;
        } else if (containerWidth === 0 && containerHeight > 0) {
            containerWidth = containerHeight * this.moduleData.displayedGranularities.length;
        } else if (containerHeight === 0 && containerWidth === 0) {
            // Fallback if no dimensions are explicitly set, assume a default for calculation
            containerWidth = 200 * this.moduleData.displayedGranularities.length;
            containerHeight = 200;
            consoleLogIfDebug("Target element has zero dimensions; using default fallback size for canvas.");
        }
        
        // Create our canvas element and set its dimensions
        const canvasHtmlElement = document.createElement('canvas'); // Renamed canvasElement
        canvasHtmlElement.width = containerWidth;
        canvasHtmlElement.height = containerHeight;
        
        // Append canvas to the container
        this.moduleData.canvasAttributes.canvasElementRef = $(canvasHtmlElement);
        this.moduleData.canvasAttributes.canvasElementRef.appendTo(this.wrapperContainer);
        
        // Check for canvas support
        let hasCanvasSupport = checkCanvasSupport(); // Renamed canvasSupported
        // If no native support, check for ExplorerCanvas (IE8 polyfill)
        if (!hasCanvasSupport && typeof G_vmlCanvasManager !== "undefined") {
            G_vmlCanvasManager.initElement(canvasHtmlElement);
            legacyCanvasMode = true; // Set global flag
            hasCanvasSupport = true;
            consoleLogIfDebug("ExplorerCanvas detected and initialized for legacy browser support.");
        }

        if (hasCanvasSupport) {
            this.moduleData.canvasAttributes.drawingContext = canvasHtmlElement.getContext('2d');
        } else {
            console.error("Canvas is not supported in this browser, and no polyfill was found.");
            // Potentially add a fallback message or alternative display here
            return; 
        }

        // Calculate drawing dimensions
        this.moduleData.canvasAttributes.granularityItemSize = Math.min(containerWidth / this.moduleData.displayedGranularities.length, containerHeight);
        this.moduleData.canvasAttributes.lineWidth = this.moduleData.canvasAttributes.granularityItemSize * this.moduleConfiguration.fg_width;
        this.moduleData.canvasAttributes.innerRadius = ((this.moduleData.canvasAttributes.granularityItemSize * 0.8) - this.moduleData.canvasAttributes.lineWidth) / 2;
        this.moduleData.canvasAttributes.outerRadius = this.moduleData.canvasAttributes.innerRadius + 0.5 * Math.max(this.moduleData.canvasAttributes.lineWidth, this.moduleData.canvasAttributes.lineWidth * this.moduleConfiguration.bg_width);

        // Prepare text elements for each granularity
        let currentLeftPosition = 0; // Renamed i
        for (const unitName of timeGranularities) { // Changed loop
            const unitConfig = this.moduleConfiguration.time.timeUnitsConfig[unitName];
            if (!unitConfig || !unitConfig.show) {
                continue;
            }

            const textWrapperDiv = $("<div>").addClass(`display_text_wrapper display_text_${unitName.toLowerCase()}`); // Renamed textElement, changed class name
            textWrapperDiv.css({
                "top": Math.round(0.35 * this.moduleData.canvasAttributes.granularityItemSize),
                "left": Math.round(currentLeftPosition * this.moduleData.canvasAttributes.granularityItemSize),
                "width": this.moduleData.canvasAttributes.granularityItemSize
            }).appendTo(this.wrapperContainer);

            const headerLabel = $("<h4>").text(unitConfig.text); // Renamed headerElement
            headerLabel.css({
                "font-size": Math.round(this.moduleConfiguration.text_size * this.moduleData.canvasAttributes.granularityItemSize),
                "line-height": Math.round(this.moduleConfiguration.text_size * this.moduleData.canvasAttributes.granularityItemSize) + "px"
            }).appendTo(textWrapperDiv);

            const numberValueSpan = $("<span>"); // Renamed numberElement
            numberValueSpan.css({
                "font-size": Math.round(3 * this.moduleConfiguration.text_size * this.moduleData.canvasAttributes.granularityItemSize),
                "line-height": Math.round(this.moduleConfiguration.text_size * this.moduleData.canvasAttributes.granularityItemSize) + "px"
            }).appendTo(textWrapperDiv);

            this.moduleData.granularityTextElements[unitName] = numberValueSpan;
            currentLeftPosition++;
        }

        this.startDisplay(); // Renamed start
        if (!this.moduleConfiguration.start) {
            this.moduleData.isPaused = true;
        }
        
        // Set up interval fallback if requestAnimationFrame is not used or to ensure updates
        const selfRef = this; // Renamed _this
        this.moduleData.intervalFallbackId = executionContext.setInterval(() => {
            selfRef.updateDisplay(true); // Call update with skipDrawing true for interval
        }, animationFrameInterval);
    };

    /**
     * Draws an arc on the canvas for a specific time unit.
     * This is a new helper function extracted from the original update logic.
     * @param {number} centerX - X coordinate of the arc's center.
     * @param {number} centerY - Y coordinate of the arc's center.
     * @param {string} color - Hex or RGB color string for the arc.
     * @param {number} percentage - The fill percentage of the arc (0.0 to 1.0).
     * @param {number} unitIndex - The index of the unit being drawn (for positioning).
     */
    DisplayModule.prototype.drawTimeArc = function(centerX, centerY, color, percentage, unitIndex) {
        const ctx = this.moduleData.canvasAttributes.drawingContext;
        const radius = this.moduleData.canvasAttributes.innerRadius;
        const lineWidth = this.moduleData.canvasAttributes.lineWidth;
        const itemSize = this.moduleData.canvasAttributes.granularityItemSize;
        const bgWidthRatio = this.moduleConfiguration.bg_width;
        const fgWidthRatio = this.moduleConfiguration.fg_width;

        const startAngle = -0.5 * Math.PI; // Top center
        const endAngle = startAngle + (percentage * 2 * Math.PI);

        // Clear previous arc for this unit if not in legacy mode
        if (!legacyCanvasMode) {
            ctx.clearRect(unitIndex * itemSize, 0, itemSize, itemSize);
        }

        // Draw background arc
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
        ctx.lineWidth = lineWidth * bgWidthRatio;
        const rgbColor = convertHexToRgb(color);
        if (rgbColor) {
            ctx.strokeStyle = `rgba(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}, 0.2)`; // Use RGBA for transparency
        } else {
            ctx.strokeStyle = `rgba(0,0,0,0.2)`; // Fallback
        }
        ctx.stroke();

        // Draw foreground arc
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, startAngle, endAngle, false);
        ctx.lineWidth = lineWidth * fgWidthRatio;
        ctx.strokeStyle = color;
        ctx.stroke();
    };

    /**
     * Updates the display, calculates time differences, and draws on the canvas.
     * @param {boolean} [skipDrawing=false] - If true, skips canvas drawing, useful for internal interval calls.
     */
    DisplayModule.prototype.updateDisplay = function(skipDrawing = false) { // Renamed update, added default param
        if (skipDrawing && this.moduleData.isPaused) {
            return; // Skip drawing and calculations if paused and only called for interval fallback
        }
        
        // In legacy mode, clear the entire canvas once per update cycle
        if (legacyCanvasMode) {
            const canvasRef = this.moduleData.canvasAttributes.canvasElementRef[0];
            this.moduleData.canvasAttributes.drawingContext.clearRect(0, 0, canvasRef.width, canvasRef.height);
        }

        let timeDifferenceSeconds, prevTimeDifferenceSeconds; // Renamed diff, old_diff

        const lastDateChecked = this.moduleData.previousUpdateTime; // Renamed prevDate
        const currentDateChecked = new Date(); // Renamed curDate
        this.moduleData.previousUpdateTime = currentDateChecked;

        if (lastDateChecked === null) {
            // This should ideally be handled by startDisplay setting previousUpdateTime
            // but as a safety, if somehow updateDisplay is called first, we initialize and return.
            // This prevents a huge initial diff calculation.
            this.moduleData.previousUpdateTime = new Date();
            return; 
        }

        // Check if countdown has reached zero and if counting past zero is disabled
        if (!this.moduleConfiguration.count_past_zero) {
            if (currentDateChecked > this.moduleData.canvasAttributes.referenceDateTime) {
                // If past zero, draw all zeros and stop
                this.moduleData.displayedGranularities.forEach((unitName, index) => {
                    this.moduleData.granularityTextElements[unitName].text("0");
                    const centerX = (index * this.moduleData.canvasAttributes.granularityItemSize) + (this.moduleData.canvasAttributes.granularityItemSize / 2);
                    const centerY = this.moduleData.canvasAttributes.granularityItemSize / 2;
                    const unitColor = this.moduleConfiguration.time.timeUnitsConfig[unitName].color;
                    this.drawTimeArc(centerX, centerY, unitColor, 0, index); // Draw empty arc
                });
                this.stopDisplay(); // Renamed stop
                return;
            }
        }

        // Calculate time differences in seconds
        timeDifferenceSeconds = (this.moduleData.canvasAttributes.referenceDateTime - currentDateChecked) / 1000;
        prevTimeDifferenceSeconds = (this.moduleData.canvasAttributes.referenceDateTime - lastDateChecked) / 1000;

        const shouldFloorValues = this.moduleConfiguration.animation !== "smooth"; // Renamed floor

        const visibleTimeBreakdown = calculateTimeComponents( // Renamed visible_times
            timeDifferenceSeconds,
            prevTimeDifferenceSeconds,
            this.moduleData.totalTimeDuration,
            this.moduleData.displayedGranularities,
            shouldFloorValues
        );
        const fullTimeBreakdown = calculateTimeComponents( // Renamed all_times
            timeDifferenceSeconds,
            prevTimeDifferenceSeconds,
            secondsPerGranularity.Years, // Use a very large duration for 'allUnits'
            timeGranularities, // Renamed allUnits
            shouldFloorValues
        );

        // Notify listeners for all units
        timeGranularities.forEach(unitName => {
            if (Math.floor(fullTimeBreakdown.rawCurrentTime[unitName]) !== Math.floor(fullTimeBreakdown.rawPreviousTime[unitName])) {
                this.notifyEventListeners(unitName, Math.floor(fullTimeBreakdown.absoluteCurrentTime[unitName]), Math.floor(timeDifferenceSeconds), "all");
            }
        });

        // Iterate through displayed units to update text and draw arcs
        this.moduleData.displayedGranularities.forEach((unitName, index) => {
            // Notify listeners for visible units
            if (Math.floor(visibleTimeBreakdown.rawCurrentTime[unitName]) !== Math.floor(visibleTimeBreakdown.rawPreviousTime[unitName])) {
                this.notifyEventListeners(unitName, Math.floor(visibleTimeBreakdown.absoluteCurrentTime[unitName]), Math.floor(timeDifferenceSeconds), "visible");
            }
            
            if (!skipDrawing) {
                // Set the text value
                this.moduleData.granularityTextElements[unitName].text(Math.floor(Math.abs(visibleTimeBreakdown.absoluteCurrentTime[unitName])));

                // Calculate center coordinates for drawing
                const centerX = (index * this.moduleData.canvasAttributes.granularityItemSize) + (this.moduleData.canvasAttributes.granularityItemSize / 2);
                const centerY = this.moduleData.canvasAttributes.granularityItemSize / 2;
                const unitColor = this.moduleConfiguration.time.timeUnitsConfig[unitName].color;

                // Draw the arc for the current unit
                this.drawTimeArc(centerX, centerY, unitColor, visibleTimeBreakdown.currentPercentage[unitName], index);
            }
        });
    };

    /**
     * Starts the animation loop for the display module.
     * Will use requestAnimationFrame if available, otherwise relies on interval fallback.
     */
    DisplayModule.prototype.startDisplay = function() { // Renamed start
        if (this.moduleData.isTimerRunning) return;

        this.moduleData.isTimerRunning = true;
        this.moduleData.isPaused = false;
        this.moduleData.previousUpdateTime = new Date(); // Reset previous time to avoid large jumps on resume

        // Set the total duration for percentage calculations based on the largest visible unit
        const largestVisibleUnit = this.moduleData.displayedGranularities[0];
        this.moduleData.totalTimeDuration = secondsPerGranularity[largestVisibleUnit];

        // Ensure referenceDateTime is set (can be a Date object or a timestamp)
        if (!this.moduleData.canvasAttributes.referenceDateTime) {
            // Default to 1 year from now if not explicitly set
            const defaultRefDate = new Date();
            defaultRefDate.setFullYear(defaultRefDate.getFullYear() + 1);
            this.moduleData.canvasAttributes.referenceDateTime = defaultRefDate;
        }

        const animate = () => {
            if (this.moduleData.isTimerRunning && !this.moduleData.isPaused) {
                this.updateDisplay();
                this.moduleData.animationFrameId = executionContext.requestAnimationFrame(animate);
            }
        };
        this.moduleData.animationFrameId = executionContext.requestAnimationFrame(animate);
    };

    /**
     * Pauses the animation and updates.
     */
    DisplayModule.prototype.pauseDisplay = function() { // New method: pause
        if (!this.moduleData.isTimerRunning) return;
        this.moduleData.isPaused = true;
        if (this.moduleData.animationFrameId) {
            executionContext.cancelAnimationFrame(this.moduleData.animationFrameId);
            this.moduleData.animationFrameId = null;
        }
        consoleLogIfDebug("Display module paused.");
    };

    /**
     * Resumes the animation and updates if paused.
     */
    DisplayModule.prototype.resumeDisplay = function() { // New method: resume
        if (this.moduleData.isTimerRunning && this.moduleData.isPaused) {
            this.moduleData.isPaused = false;
            this.moduleData.previousUpdateTime = new Date(); // Reset to prevent jumps
            this.startDisplay();
            consoleLogIfDebug("Display module resumed.");
        }
    };

    /**
     * Stops the animation loop and resets internal state.
     */
    DisplayModule.prototype.stopDisplay = function() { // Renamed stop
        this.moduleData.isTimerRunning = false;
        this.moduleData.isPaused = true;
        if (this.moduleData.animationFrameId) {
            executionContext.cancelAnimationFrame(this.moduleData.animationFrameId);
            this.moduleData.animationFrameId = null;
        }
        if (this.moduleData.intervalFallbackId) {
            executionContext.clearInterval(this.moduleData.intervalFallbackId);
            this.moduleData.intervalFallbackId = null;
        }
        consoleLogIfDebug("Display module stopped.");
    };

    /**
     * Destroys the display module, removing its DOM elements and cleaning up.
     */
    DisplayModule.prototype.destroyModule = function() { // New method: destroy
        this.stopDisplay();
        $(this.targetElement).removeData('countdown-display-module'); // Remove stored data
        if (this.wrapperContainer) {
            this.wrapperContainer.remove(); // Remove all generated DOM elements
        }
        this.clearEventListeners();
        delete activeDisplayModules[this.targetElement.id || this.targetElement.dataset.countdownId]; // Remove from global registry
        consoleLogIfDebug(`Display module for element ${this.targetElement.id || this.targetElement.className} destroyed.`);
    };

    /**
     * Notifies registered event listeners for a specific unit and event type.
     * @param {string} unitName - The name of the time unit (e.g., "Seconds").
     * @param {number} value - The current integer value of the unit.
     * @param {number} totalSeconds - The total time difference in seconds.
     * @param {string} eventType - "all" or "visible" to specify which listeners to notify.
     */
    DisplayModule.prototype.notifyEventListeners = function(unitName, value, totalSeconds, eventType) { // Renamed notifyListeners
        const listeners = this.eventListeners[eventType];
        if (listeners && listeners.length > 0) {
            listeners.forEach(listener => {
                // Ensure listener is a function before calling
                if (typeof listener === 'function') {
                    listener(unitName, value, totalSeconds);
                }
            });
        }
    };

    /**
     * Adds an event listener.
     * @param {string} eventType - "all" or "visible".
     * @param {function} listenerFunction - The callback function.
     */
    DisplayModule.prototype.addEventListener = function(eventType, listenerFunction) { // New method: addEventListener
        if (this.eventListeners[eventType] && typeof listenerFunction === 'function') {
            this.eventListeners[eventType].push(listenerFunction);
        } else {
            console.warn(`Invalid event type "${eventType}" or listener function provided.`);
        }
    };

    /**
     * Sets or updates the configuration options for the display module.
     * @param {object} options - New configuration options.
     */
    DisplayModule.prototype.setOptions = function(options) { // Renamed setOptions, kept name as it's common
        if (typeof options === 'object' && options !== null) {
            this.moduleConfiguration = $.extend(true, {}, this.moduleConfiguration, options);
            // Re-initialize if significant options changed that affect rendering
            this.initializeModule(false); // Do not clear listeners on option change
        } else {
            console.warn("Attempted to set options with an invalid object.");
        }
    };

    /**
     * Sets the reference date/time for the countdown.
     * @param {Date|string|number} newRefDate - The new reference date. Can be Date object, string, or timestamp.
     */
    DisplayModule.prototype.setReferenceDate = function(newRefDate) { // New method: setReferenceDate
        let parsedDate;
        if (newRefDate instanceof Date) {
            parsedDate = newRefDate;
        } else if (typeof newRefDate === 'string') {
            parsedDate = parseInputDate(newRefDate);
        } else if (typeof newRefDate === 'number' && !isNaN(newRefDate)) {
            parsedDate = new Date(newRefDate);
        } else {
            console.error("Invalid reference date provided. Must be Date, string, or timestamp.");
            return;
        }
        this.moduleData.canvasAttributes.referenceDateTime = parsedDate;
        this.moduleData.previousUpdateTime = new Date(); // Reset to prevent jumps
        this.updateDisplay(); // Force an immediate update
    };

    // Public interface for jQuery plugin
    // This is the 'TC_Class' from the original comments, now 'CountdownDisplay'
    $.fn.CountdownDisplay = function(methodOrOptions) {
        syncExecutionContext(); // Ensure global context is synchronized on first call

        // Handle method calls (e.g., $(".elem").CountdownDisplay("start"))
        if (typeof methodOrOptions === 'string') {
            const args = Array.prototype.slice.call(arguments, 1);
            let results = [];

            this.each(function() {
                const moduleInstance = $(this).data('countdown-display-module');
                if (moduleInstance && typeof moduleInstance[methodOrOptions] === 'function') {
                    // Call the method on the instance and collect results
                    results.push(moduleInstance[methodOrOptions].apply(moduleInstance, args));
                } else if (!moduleInstance) {
                    console.warn(`CountdownDisplay: No instance found for element. Cannot call "${methodOrOptions}".`);
                } else {
                    console.warn(`CountdownDisplay: Method "${methodOrOptions}" does not exist on instance.`);
                }
            });
            // Return results if any, otherwise return the jQuery object for chaining
            return results.length > 0 ? (results.length === 1 ? results[0] : results) : this;
        }

        // Handle initialization (e.g., $(".elem").CountdownDisplay({ options }))
        const options = methodOrOptions || {};
        return this.each(function() {
            let moduleInstance = $(this).data('countdown-display-module');

            // If an instance already exists, update its options
            if (moduleInstance) {
                moduleInstance.setOptions(options);
            } else {
                // Create a new instance
                moduleInstance = new DisplayModule(this, options);
                // Assign a unique ID if element doesn't have one, for registry lookup
                if (!this.id) {
                    this.dataset.countdownId = createUniqueId();
                }
                activeDisplayModules[this.id || this.dataset.countdownId] = moduleInstance;
                $(this).data('countdown-display-module', moduleInstance); // Store instance on the element
            }
        });
    };

    // Expose the DisplayModule constructor for advanced usage if needed
    // $.fn.CountdownDisplay.DisplayModule = DisplayModule; // This would expose it, but let's keep it private as per original intent

})(jQuery);