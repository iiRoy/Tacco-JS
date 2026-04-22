/*
 * This file contains logic for displaying a dynamic scale indicator
 * within an OpenSeadragon viewer instance. It supports various
 * display styles and unit systems.
 *
 * This code is provided for educational purposes and may be
 * freely adapted.
 */
(function(OSD) {

    // Basic validation for the OpenSeadragon library version
    if (!OSD.version || OSD.version.major < 1) {
        throw new Error('OSD.VisualScale requires OpenSeadragon version 1.0.0 or greater.');
    }

    /**
     * Extends the OpenSeadragon.Viewer prototype to add a convenient method
     * for managing the visual scale indicator.
     * @param {object} displayConfig - Configuration options for the scale indicator.
     */
    OSD.Viewer.prototype.displayScale = function(displayConfig) {
        // If no scale indicator exists yet, create one.
        // Otherwise, update the existing one with new configurations.
        if (!this._activeScaleElement) {
            const initialConfig = displayConfig || {};
            initialConfig.hostViewer = this; // Attach the current viewer instance
            this._activeScaleElement = new OSD.VisualScale(initialConfig);
        } else {
            this._activeScaleElement.recalculateAndDisplay(displayConfig);
        }
    };

    /**
     * Defines distinct types of visual scale rendering styles.
     * @enum {number}
     */
    OSD.IndicatorType = {
        DISABLED: 0, // No indicator displayed
        MICROSCOPY_STYLE: 1, // Simple line-based indicator common in microscopy
        MAP_STYLE: 2 // Box-based indicator common in mapping applications
    };

    /**
     * Defines preferred placement options for the visual scale indicator
     * within the viewer's viewport.
     * @enum {number}
     */
    OSD.PlacementOption = {
        NONE: 0, // No specific placement, effectively disabled
        UPPER_LEFT_CORNER: 1,
        UPPER_RIGHT_CORNER: 2,
        LOWER_RIGHT_CORNER: 3,
        LOWER_LEFT_CORNER: 4
    };

    /**
     * @class VisualScale
     * @param {object} settings - Configuration object for the scale indicator.
     * @param {OpenSeadragon.Viewer} settings.hostViewer - The OSD viewer instance.
     * @param {OSD.IndicatorType} [settings.styleType=OSD.IndicatorType.MICROSCOPY_STYLE] - The visual style.
     * @param {number} [settings.basePixelsPerUnit=null] - Pixels per unit at original image size. If null, indicator is hidden.
     * @param {string} [settings.minimumWidthCSS="150px"] - Minimum width of the scale bar as a CSS string.
     * @param {OSD.PlacementOption} [settings.positionSetting=OSD.PlacementOption.LOWER_LEFT_CORNER] - Location within the viewer.
     * @param {number} [settings.horizontalPadding=5] - Horizontal offset from the edge.
     * @param {number} [settings.verticalPadding=5] - Vertical offset from the edge.
     * @param {boolean} [settings.constrainToBounds=true] - Keep indicator within image bounds when zoomed out.
     * @param {string} [settings.primaryColor="black"] - Main color of the scale bar.
     * @param {string} [settings.labelColor="black"] - Color of the text label.
     * @param {string} [settings.fillColor="none"] - Background color of the indicator.
     * @param {string} [settings.textSize=""] - Font size for the label.
     * @param {number} [settings.lineWeight=2] - Thickness of the bar lines in pixels.
     * @param {function} [settings.labelGenerator=OSD.ScaleValueFormatter.LENGTH_METRIC_STANDARD] - Function to format the scale value and size.
     */
    OSD.VisualScale = function(settings) {
        // Ensure settings object exists
        if (!settings || typeof settings !== 'object') {
            throw new Error("VisualScale constructor requires a valid settings object.");
        }
        if (!settings.hostViewer) {
            throw new Error("A hostViewer must be specified for OSD.VisualScale.");
        }
        this.hostViewer = settings.hostViewer;

        // Create the DOM element for the scale indicator
        this.displayContainer = document.createElement("div");
        this.hostViewer.container.appendChild(this.displayContainer);
        Object.assign(this.displayContainer.style, {
            position: "absolute", // Changed from relative to absolute for precise positioning
            margin: "0",
            pointerEvents: "none", // Ensure it doesn't interfere with viewer interactions
            boxSizing: "border-box" // Include padding and border in the element's total width and height
        });

        // Initialize core properties
        this.setMinimumDisplayWidth(settings.minimumWidthCSS || "150px");
        this.updateRenderStrategy(settings.styleType || OSD.IndicatorType.MICROSCOPY_STYLE);

        // Apply visual and positioning configurations
        this.primaryColor = settings.primaryColor || "black";
        this.labelColor = settings.labelColor || "black";
        this.fillColor = settings.fillColor || "none";
        this.textSize = settings.textSize || "";
        this.lineWeight = settings.lineWeight || 2;
        this.basePixelsPerUnit = settings.basePixelsPerUnit || null;
        this.positionSetting = settings.positionSetting || OSD.PlacementOption.LOWER_LEFT_CORNER;
        this.horizontalPadding = settings.horizontalPadding || 5;
        this.verticalPadding = settings.verticalPadding || 5;
        this.constrainToBounds = OSD.isNotNullish(settings.constrainToBounds) ?
            settings.constrainToBounds : true;
        this.labelGenerator = settings.labelGenerator ||
            OSD.ScaleValueFormatter.LENGTH_METRIC_STANDARD;

        // Reference to 'this' for event handlers
        const _thisScope = this;

        // Attach event handlers to refresh the scale indicator on viewer changes
        this.hostViewer.addHandler("open", function() {
            _thisScope.recalculateAndDisplay();
        });
        this.hostViewer.addHandler("animation", function() {
            _thisScope.recalculateAndDisplay();
        });
        this.hostViewer.addHandler("resize", function() {
            _thisScope.recalculateAndDisplay();
        });
    };

    /**
     * Prototype methods for the VisualScale class.
     */
    OSD.VisualScale.prototype = {
        /**
         * Applies new configuration settings to the scale indicator.
         * @param {object} newSettings - New configuration options.
         */
        applySettings: function(newSettings) {
            if (!newSettings || typeof newSettings !== 'object') {
                // If no new settings, or invalid, simply return.
                return;
            }

            // Iterate through potential settings and update if defined.
            // Using a helper function to avoid repetition.
            const updateProperty = (propName, handler = val => val) => {
                if (OSD.isNotNullish(newSettings[propName])) {
                    this[propName] = handler(newSettings[propName]);
                }
            };

            updateProperty('styleType', val => this.updateRenderStrategy(val));
            updateProperty('minimumWidthCSS', val => this.setMinimumDisplayWidth(val));
            updateProperty('primaryColor');
            updateProperty('labelColor');
            updateProperty('fillColor');
            updateProperty('textSize');
            updateProperty('lineWeight');
            updateProperty('basePixelsPerUnit');
            updateProperty('positionSetting');
            updateProperty('horizontalPadding');
            updateProperty('verticalPadding');
            updateProperty('constrainToBounds');
            updateProperty('labelGenerator');
        },

        /**
         * Sets the function responsible for drawing the scale bar based on the provided type.
         * @param {OSD.IndicatorType} styleType - The desired rendering style.
         */
        updateRenderStrategy: function(styleType) {
            switch (styleType) {
                case OSD.IndicatorType.MAP_STYLE:
                    this.renderStrategy = this.renderMapLayout;
                    break;
                case OSD.IndicatorType.MICROSCOPY_STYLE:
                    this.renderStrategy = this.renderMicroscopyLayout;
                    break;
                case OSD.IndicatorType.DISABLED: // Fall-through to null
                case OSD.PlacementOption.NONE: // If location is NONE, treat as disabled
                default:
                    this.renderStrategy = null; // No rendering function, effectively hides the bar
                    break;
            }
        },

        /**
         * Sets the minimum display width for the scale indicator.
         * This value is used to calculate the actual scale length.
         * @param {string} cssWidth - The minimum width as a CSS string (e.g., "100px", "1em").
         */
        setMinimumDisplayWidth: function(cssWidth) {
            this.displayContainer.style.width = cssWidth;
            // Temporarily ensure the element is visible to accurately get its offsetWidth
            const originalDisplay = this.displayContainer.style.display;
            this.displayContainer.style.display = "";
            this.minimumWidthPixels = this.displayContainer.offsetWidth;
            this.displayContainer.style.display = originalDisplay; // Restore original display state
        },

        /**
         * Recalculates and updates the visual representation of the scale indicator.
         * This method is called on viewer events like zoom, pan, or resize.
         * @param {object} [newSettings] - Optional new settings to apply before refreshing.
         */
        recalculateAndDisplay: function(newSettings) {
            this.applySettings(newSettings);

            // Hide the scale indicator if conditions for display are not met.
            const viewerReady = this.hostViewer.isOpen();
            const hasRenderingMethod = typeof this.renderStrategy === 'function';
            const hasScaleFactor = OSD.isNotNullish(this.basePixelsPerUnit);
            const hasValidPlacement = this.positionSetting !== OSD.PlacementOption.NONE && this.positionSetting !== OSD.IndicatorType.DISABLED;

            if (!(viewerReady && hasRenderingMethod && hasScaleFactor && hasValidPlacement)) {
                this.displayContainer.style.display = "none";
                return;
            }

            // Ensure the container is visible if all conditions pass.
            this.displayContainer.style.display = "block"; // Changed from "" to "block" for clarity.

            // Retrieve current viewport state
            const currentView = this.hostViewer.viewport;
            // Calculate effective pixels per unit at the current zoom level
            const currentZoomLevel = currentView.viewportToImageZoom(currentView.getZoom(true));
            const effectivePPU = currentZoomLevel * this.basePixelsPerUnit;

            // Use the configured label generator to get scale size and text
            const formattedDimensions = this.labelGenerator(effectivePPU, this.minimumWidthPixels);

            // Render the scale bar and position it
            this.renderStrategy(formattedDimensions.size, formattedDimensions.text);
            const elementPlacement = this.determineDisplayPosition();
            Object.assign(this.displayContainer.style, {
                left: `${elementPlacement.x}px`,
                top: `${elementPlacement.y}px`
            });
        },

        /**
         * Renders the scale indicator in a microscopy-like style (bottom line with text).
         * @param {number} pixelWidth - The calculated width of the scale bar in pixels.
         * @param {string} labelText - The text label for the scale bar.
         */
        renderMicroscopyLayout: function(pixelWidth, labelText) {
            Object.assign(this.displayContainer.style, {
                fontSize: this.textSize,
                textAlign: "center",
                color: this.labelColor,
                border: "none", // Ensure no other borders are present
                borderBottom: `${this.lineWeight}px solid ${this.primaryColor}`,
                backgroundColor: this.fillColor,
                width: `${pixelWidth}px`,
                height: 'auto', // Allow height to adjust to content
                padding: `${this.lineWeight * 1.5}px 0` // Added padding for text above the line
            });
            this.displayContainer.innerHTML = labelText;
        },

        /**
         * Renders the scale indicator in a map-like style (box with text).
         * @param {number} pixelWidth - The calculated width of the scale bar in pixels.
         * @param {string} labelText - The text label for the scale bar.
         */
        renderMapLayout: function(pixelWidth, labelText) {
            Object.assign(this.displayContainer.style, {
                fontSize: this.textSize,
                textAlign: "center",
                color: this.labelColor,
                border: `${this.lineWeight}px solid ${this.primaryColor}`,
                borderTop: "none", // Specific styling for map type
                backgroundColor: this.fillColor,
                width: `${pixelWidth}px`,
                height: 'auto',
                padding: `${this.lineWeight * 1.5}px` // Uniform padding
            });
            this.displayContainer.innerHTML = labelText;
        },

        /**
         * Computes the absolute pixel coordinates for positioning the scale indicator.
         * @returns {OpenSeadragon.Point} The calculated position (x, y) in pixels.
         */
        determineDisplayPosition: function() {
            const indicatorWidth = this.displayContainer.offsetWidth;
            const indicatorHeight = this.displayContainer.offsetHeight;
            const viewerHost = this.hostViewer.container;
            const viewerWidth = viewerHost.offsetWidth;
            const viewerHeight = viewerHost.offsetHeight;
            const viewport = this.hostViewer.viewport;
            const aspectRatio = this.hostViewer.source.aspectRatio;

            // Default coordinates
            let posX = 0;
            let posY = 0;

            // Adjust coordinates based on placement option
            switch (this.positionSetting) {
                case OSD.PlacementOption.UPPER_LEFT_CORNER:
                    posX = this.horizontalPadding;
                    posY = this.verticalPadding;
                    if (this.constrainToBounds) {
                        const viewPortPixel = viewport.pixelFromPoint(new OSD.Point(0, 0), true);
                        if (!this.hostViewer.wrapHorizontal) {
                            posX = Math.max(posX, viewPortPixel.x);
                        }
                        if (!this.hostViewer.wrapVertical) {
                            posY = Math.max(posY, viewPortPixel.y);
                        }
                    }
                    break;

                case OSD.PlacementOption.UPPER_RIGHT_CORNER:
                    posX = viewerWidth - indicatorWidth - this.horizontalPadding;
                    posY = this.verticalPadding;
                    if (this.constrainToBounds) {
                        const viewPortPixel = viewport.pixelFromPoint(new OSD.Point(1, 0), true);
                        if (!this.hostViewer.wrapHorizontal) {
                            posX = Math.min(posX, viewPortPixel.x - indicatorWidth);
                        }
                        if (!this.hostViewer.wrapVertical) {
                            posY = Math.max(posY, viewPortPixel.y);
                        }
                    }
                    break;

                case OSD.PlacementOption.LOWER_RIGHT_CORNER:
                    posX = viewerWidth - indicatorWidth - this.horizontalPadding;
                    posY = viewerHeight - indicatorHeight - this.verticalPadding;
                    if (this.constrainToBounds) {
                        const viewPortPixel = viewport.pixelFromPoint(new OSD.Point(1, 1 / aspectRatio), true);
                        if (!this.hostViewer.wrapHorizontal) {
                            posX = Math.min(posX, viewPortPixel.x - indicatorWidth);
                        }
                        if (!this.hostViewer.wrapVertical) {
                            posY = Math.min(posY, viewPortPixel.y - indicatorHeight);
                        }
                    }
                    break;

                case OSD.PlacementOption.LOWER_LEFT_CORNER:
                default: // Default to bottom left if unhandled or NONE
                    posX = this.horizontalPadding;
                    posY = viewerHeight - indicatorHeight - this.verticalPadding;
                    if (this.constrainToBounds) {
                        const viewPortPixel = viewport.pixelFromPoint(new OSD.Point(0, 1 / aspectRatio), true);
                        if (!this.hostViewer.wrapHorizontal) {
                            posX = Math.max(posX, viewPortPixel.x);
                        }
                        if (!this.hostViewer.wrapVertical) {
                            posY = Math.min(posY, viewPortPixel.y - indicatorHeight);
                        }
                    }
                    break;
            }
            return new OSD.Point(posX, posY);
        }
    };

    /**
     * Provides a collection of functions to determine the appropriate
     * scale bar size and text label based on current zoom and minimum display width.
     * @namespace ScaleValueFormatter
     */
    OSD.ScaleValueFormatter = {
        /**
         * Formats scale for metric lengths (e.g., nm, µm, mm, m, km).
         */
        LENGTH_METRIC_STANDARD: function(effectivePPU, minimumWidthPx) {
            return OSD.computeMetricScaleDetails(effectivePPU, minimumWidthPx, "m");
        },

        /**
         * Formats scale for imperial lengths (e.g., thou, in, ft, mi).
         */
        LENGTH_IMPERIAL_STANDARD: function(effectivePPU, minimumWidthPx) {
            const maxDisplayWidth = minimumWidthPx * 2;
            const pixelsPerInch = effectivePPU * 0.0254; // 1 inch = 0.0254 meters

            if (maxDisplayWidth < pixelsPerInch * 12) { // Less than 1 foot
                if (maxDisplayWidth < pixelsPerInch) { // Less than 1 inch
                    const pixelsPerThou = pixelsPerInch / 1000;
                    return OSD.calculateScaleLabelAndSize(pixelsPerThou, minimumWidthPx, "th", false);
                }
                return OSD.calculateScaleLabelAndSize(pixelsPerInch, minimumWidthPx, "in", false);
            }

            const pixelsPerFoot = pixelsPerInch * 12;
            if (maxDisplayWidth < pixelsPerFoot * 2000) { // Less than approx 0.4 miles (2000 feet)
                return OSD.calculateScaleLabelAndSize(pixelsPerFoot, minimumWidthPx, "ft", false);
            }

            const pixelsPerMile = pixelsPerFoot * 5280; // 1 mile = 5280 feet
            return OSD.calculateScaleLabelAndSize(pixelsPerMile, minimumWidthPx, "mi", false);
        },

        /**
         * Formats scale for standard time durations (e.g., s, min, hr, day, yr).
         */
        TIME_DURATION_STANDARD: function(pixelsPerSecond, minimumWidthPx) {
            const maxDisplayWidth = minimumWidthPx * 2;
            if (maxDisplayWidth < pixelsPerSecond * 60) { // Less than 1 minute
                return OSD.computeMetricScaleDetails(pixelsPerSecond, minimumWidthPx, "s"); // Use metric logic for seconds
            }

            const pixelsPerMinute = pixelsPerSecond * 60;
            if (maxDisplayWidth < pixelsPerMinute * 60) { // Less than 1 hour
                return OSD.calculateScaleLabelAndSize(pixelsPerMinute, minimumWidthPx, "minute", true);
            }

            const pixelsPerHour = pixelsPerMinute * 60;
            if (maxDisplayWidth < pixelsPerHour * 24) { // Less than 1 day
                return OSD.calculateScaleLabelAndSize(pixelsPerHour, minimumWidthPx, "hour", true);
            }

            const pixelsPerDay = pixelsPerHour * 24;
            if (maxDisplayWidth < pixelsPerDay * 365.25) { // Less than 1 year
                return OSD.calculateScaleLabelAndSize(pixelsPerDay, minimumWidthPx, "day", true);
            }

            const pixelsPerYear = pixelsPerDay * 365.25;
            return OSD.calculateScaleLabelAndSize(pixelsPerYear, minimumWidthPx, "year", true);
        },

        /**
         * A generic metric unit formatter. Can be used for custom units.
         * Example: `function(ppeV, minSize) { return OSD.ScaleValueFormatter.METRIC_UNIT_GENERIC(ppeV, minSize, "eV"); }`
         */
        METRIC_UNIT_GENERIC: OSD.computeMetricScaleDetails
    };

    /**
     * Helper function to calculate the display size and text for a scale bar.
     * @param {number} pixelsPerUnit - The number of pixels representing one unit at current zoom.
     * @param {number} minimumDisplayWidth - The minimum desired pixel width for the scale bar.
     * @param {string} unitSymbol - The base unit symbol (e.g., "m", "in").
     * @param {boolean} [addPlural=false] - Whether to add 's' for plural units.
     * @returns {{size: number, text: string}} Object with pixel width and label.
     */
    OSD.calculateScaleLabelAndSize = function(pixelsPerUnit, minimumDisplayWidth, unitSymbol, addPlural = false) {
        const normalizedVal = OSD.adjustMagnitudeForDisplay(pixelsPerUnit, minimumDisplayWidth);
        const displayFactor = OSD.roundToSignificantFigures(normalizedVal / pixelsPerUnit * minimumDisplayWidth, 3);
        const pixelWidth = normalizedVal * minimumDisplayWidth;
        const pluralSuffix = addPlural && displayFactor > 1 ? "s" : "";

        return {
            size: pixelWidth,
            text: `${displayFactor} ${unitSymbol}${pluralSuffix}`
        };
    };

    /**
     * Helper function specifically for metric units, applying standard prefixes.
     * @param {number} pixelsPerUnit - Pixels per unit at current zoom.
     * @param {number} minimumDisplayWidth - Minimum desired pixel width.
     * @param {string} unitSymbol - Base unit symbol (e.g., "m", "s").
     * @returns {{size: number, text: string}} Object with pixel width and label.
     */
    OSD.computeMetricScaleDetails = function(pixelsPerUnit, minimumDisplayWidth, unitSymbol) {
        const normalizedVal = OSD.adjustMagnitudeForDisplay(pixelsPerUnit, minimumDisplayWidth);
        const displayFactor = OSD.roundToSignificantFigures(normalizedVal / pixelsPerUnit * minimumDisplayWidth, 3);
        const pixelWidth = normalizedVal * minimumDisplayWidth;
        const formattedLabel = OSD.formatValueWithMetricPrefix(displayFactor, unitSymbol);

        return {
            size: pixelWidth,
            text: formattedLabel
        };
    };

    /**
     * Adjusts a value to a 'nice' number for display on a scale bar (e.g., 1, 2, 5, 10, 20, 50...).
     * @param {number} value - The current pixels per unit.
     * @param {number} minSize - The minimum pixel width for the scale bar.
     * @returns {number} An adjusted 'nice' number.
     */
    OSD.adjustMagnitudeForDisplay = function(value, minSize) {
        const valMantissa = OSD.getMantissa(value);
        const minMantissa = OSD.getMantissa(minSize);
        let result = OSD.getMantissa(valMantissa / minMantissa);

        // Normalize to 1, 2, or 5
        if (result >= 5) {
            result /= 5;
        } else if (result >= 4) { // Added intermediate step: if >= 4, divide by 4.
            result /= 4;
        } else if (result >= 2) {
            result /= 2;
        }
        return result;
    };

    /**
     * Extracts the mantissa (significand) of a number, i.e., the part
     * without the power of 10. For example, for 1230, it returns 1.23. For 0.0456, it returns 4.56.
     * @param {number} inputVal - The number to process.
     * @returns {number} The mantissa.
     */
    OSD.getMantissa = function(inputVal) {
        if (inputVal === 0) return 0; // Handle zero case
        return inputVal * Math.pow(10, Math.ceil(-OSD.logBase10(inputVal)));
    };

    /**
     * Rounds a number to a specified number of significant figures.
     * @param {number} num - The number to round.
     * @param {number} sigFigs - The number of significant figures.
     * @returns {number} The rounded number.
     */
    OSD.roundToSignificantFigures = function(num, sigFigs) {
        if (num === 0) return 0; // Avoid issues with log10(0)

        const exponent = -Math.ceil(-OSD.logBase10(Math.abs(num))); // Original exponent of the number
        const power = sigFigs - exponent; // Power to shift decimal for rounding
        const shiftedNum = num * Math.pow(10, power);

        // Round and then shift back. Use Math.abs for rounding to handle negative numbers correctly.
        const roundedShiftedNum = Math.round(shiftedNum);

        // If 'power' is negative, it means we rounded an integer part, so multiply by 10^-power.
        // If 'power' is positive, it means we rounded a fractional part, so divide by 10^power.
        if (power < 0) {
            return roundedShiftedNum * Math.pow(10, -power);
        }
        return roundedShiftedNum / Math.pow(10, power);
    };

    /**
     * Computes the base-10 logarithm of a number.
     * @param {number} numVal - The number.
     * @returns {number} log10(numVal).
     */
    OSD.logBase10 = function(numVal) {
        return Math.log(numVal) / Math.log(10);
    };

    /**
     * Formats a numeric value by applying appropriate metric prefixes (n, µ, m, k)
     * and appending a unit symbol.
     * @param {number} numericVal - The numeric value to format.
     * @param {string} unitSymbol - The base unit symbol (e.g., "m", "s").
     * @returns {string} The formatted string (e.g., "5 µm", "10 km").
     */
    OSD.formatValueWithMetricPrefix = function(numericVal, unitSymbol) {
        if (numericVal < 0.000001) { // Nano (10^-9)
            return `${numericVal * 1000000000} n${unitSymbol}`;
        }
        if (numericVal < 0.001) { // Micro (10^-6)
            return `${numericVal * 1000000} µ${unitSymbol}`;
        }
        if (numericVal < 1) { // Milli (10^-3)
            return `${numericVal * 1000} m${unitSymbol}`;
        }
        if (numericVal >= 1000) { // Kilo (10^3)
            return `${numericVal / 1000} k${unitSymbol}`;
        }
        return `${numericVal} ${unitSymbol}`; // Base unit
    };

    /**
     * Checks if a variable is neither undefined nor null.
     * @param {*} inputVar - The variable to check.
     * @returns {boolean} True if the variable has a defined value, false otherwise.
     */
    OSD.isNotNullish = function(inputVar) {
        return inputVar !== undefined && inputVar !== null;
    };

}(OpenSeadragon));