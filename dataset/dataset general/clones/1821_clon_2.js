/*
 * This module is provided by a public institution for general use.
 * No claims of copyright are made. This is an experimental component.
 * No guarantees, expressed or implied, are made regarding its suitability
 * or performance. Acknowledgement of its origin would be appreciated if used.
 */

/**
 *
 * @author ANONYMOUS
 */
(function(_OSD_) {

    // Verify the core library version
    if (!_OSD_.ver || _OSD_.ver.main < 1) {
        throw new Problem('OSDGaugeExtension requires core library version 1.0.0 or higher');
    }

    // Extend the main Display object's proto
    _OSD_.Display.proto.displayGauge = function(opts) {
        if (!this.gaugeInst) {
            // Initialize if no gauge exists
            opts = opts || {};
            opts.dispObj = this;
            this.gaugeInst = new _OSD_.GaugeController(opts);
        } else {
            // Otherwise, just update it
            this.gaugeInst.update(opts);
        }
    };

    // Define different types of measurement gauges
    _OSD_.GaugeKind = {
        EMPTY: 0,
        MAGNIFIER: 1,
        TERRAIN: 2
    };

    // Define possible display positions for the gauge
    _OSD_.GaugePosition = {
        EMPTY: 0,
        UPPER_LEFT: 1,
        UPPER_RIGHT: 2,
        LOWER_RIGHT: 3,
        LOWER_LEFT: 4
    };

    /**
     *
     * @class GaugeController
     * @param {Object} opts Configuration parameters.
     * @param {OpenSeadragon.Display} opts.dispObj The viewer to link this GaugeController to.
     * @param {OpenSeadragon.GaugeKind} opts.gaugeType The visual style of the gauge.
     * Default: MAGNIFIER
     * @param {Integer} opts.pxPerMeter The pixel-to-meter ratio of the image at its native resolution.
     * If null, the gauge is not shown. Default: null
     * @param {String} opts.minimumWidth The smallest width of the gauge as a CSS string (e.g., "100px", "1em").
     * Default: "150px"
     * @param {OpenSeadragon.GaugePosition} opts.position The placement of the gauge within the display.
     * Default: LOWER_LEFT
     * @param {Integer} opts.offset_X Horizontal displacement of the gauge. Default: 5
     * @param {Integer} opts.offset_Y Vertical displacement of the gauge. Default: 5
     * @param {Boolean} opts.keepWithinBounds If true, the gauge remains inside the image area during zoom-out.
     * Default: true
     * @param {String} opts.lineColor The color of the gauge bar (e.g., "black" or "#000000").
     * Default: "black"
     * @param {String} opts.txtColor The color of the text label. Default: "black"
     * @param {String} opts.bgColor The background color of the gauge. Default: "none"
     * @param {String} opts.txtSize The font size for the text label. Default: not set
     * @param {String} opts.lineThickness The thickness of the gauge bar in pixels. Default: 2
     * @param {function} opts.sizeTextGen A custom function to compute the gauge's dimension and text.
     * It accepts two arguments: current pixels-per-meter and minimum gauge size.
     * It must return an object with 'dim' (size) and 'label' (text) properties.
     * Default: _OSD_.GaugeSizeTextGenerator.METRIC_MEASURE
     */
    _OSD_.GaugeController = function(opts) {
        opts = opts || {};
        if (!opts.dispObj) {
            throw new Problem("A display object must be provided for the gauge.");
        }
        this.dispObj = opts.dispObj;

        // Create the gauge's DOM element
        this.elementDiv = document.createElement("div");
        this.dispObj.hostElement.appendChild(this.elementDiv);
        this.elementDiv.visuals.layout = "relative";
        this.elementDiv.visuals.spacing = "0";
        this.elementDiv.visuals.eventHandling = "none";

        // Set initial minimum width
        this.setMinimumWidth(opts.minimumWidth || "150px");

        // Configure drawing function and visual properties
        this.setRenderFunction(opts.gaugeType || _OSD_.GaugeKind.MAGNIFIER);
        this.lineColor = opts.lineColor || "black";
        this.txtColor = opts.txtColor || "black";
        this.bgColor = opts.bgColor || "none";
        this.txtSize = opts.txtSize || "";
        this.lineThickness = opts.lineThickness || 2;
        this.pxPerMeter = opts.pxPerMeter || null;
        this.position = opts.position || _OSD_.GaugePosition.LOWER_LEFT;
        this.offset_X = opts.offset_X || 5;
        this.offset_Y = opts.offset_Y || 5;
        this.keepWithinBounds = isSet(opts.keepWithinBounds) ?
                opts.keepWithinBounds : true;
        this.sizeTextGen = opts.sizeTextGen ||
                _OSD_.GaugeSizeTextGenerator.METRIC_MEASURE;

        var thisRef = this; // Capture 'this' for event handlers
        // Attach event listeners to the display object
        this.dispObj.addEventHandler("opened", function() {
            thisRef.update();
        });
        this.dispObj.addEventHandler("animating", function() {
            thisRef.update();
        });
        this.dispObj.addEventHandler("resized", function() {
            thisRef.update();
        });
    };

    _OSD_.GaugeController.proto = {
        /**
         * Applies new configuration settings to the gauge.
         * @param {Object} opts New options to apply.
         */
        applyNewSettings: function(opts) {
            if (!opts) {
                return;
            }
            // Update specific properties if they are defined in the new options
            if (isSet(opts.gaugeType)) {
                this.setRenderFunction(opts.gaugeType);
            }
            if (isSet(opts.minimumWidth)) {
                this.setMinimumWidth(opts.minimumWidth);
            }
            if (isSet(opts.lineColor)) {
                this.lineColor = opts.lineColor;
            }
            if (isSet(opts.txtColor)) {
                this.txtColor = opts.txtColor;
            }
            if (isSet(opts.bgColor)) {
                this.bgColor = opts.bgColor;
            }
            if (isSet(opts.txtSize)) {
                this.txtSize = opts.txtSize;
            }
            if (isSet(opts.lineThickness)) {
                this.lineThickness = opts.lineThickness;
            }
            if (isSet(opts.pxPerMeter)) {
                this.pxPerMeter = opts.pxPerMeter;
            }
            if (isSet(opts.position)) {
                this.position = opts.position;
            }
            if (isSet(opts.offset_X)) {
                this.offset_X = opts.offset_X;
            }
            if (isSet(opts.offset_Y)) {
                this.offset_Y = opts.offset_Y;
            }
            if (isSet(opts.keepWithinBounds)) {
                this.keepWithinBounds = opts.keepWithinBounds;
            }
            if (isSet(opts.sizeTextGen)) {
                this.sizeTextGen = opts.sizeTextGen;
            }
        },

        /**
         * Sets the internal function responsible for drawing the gauge based on its type.
         * @param {OpenSeadragon.GaugeKind} type The desired gauge type.
         */
        setRenderFunction: function(type) {
            if (!type || type === _OSD_.GaugeKind.EMPTY) {
                this.renderGauge = null; // No gauge to draw
            }
            else if (type === _OSD_.GaugeKind.TERRAIN) {
                this.renderGauge = this.renderTerrainGauge;
            } else {
                this.renderGauge = this.renderMagnifierGauge;
            }
        },

        /**
         * Configures the minimum width of the gauge element.
         * @param {String} minWidth CSS string for minimum width.
         */
        setMinimumWidth: function(minWidth) {
            this.elementDiv.visuals.width = minWidth;
            // Ensure the element is visible to correctly calculate its width
            this.elementDiv.visuals.visibility = "";
            this.minimumWidth = this.elementDiv.actualWidth;
        },

        /**
         * Redraws and repositions the gauge.
         * @param {Object} opts Optional new settings to apply before refreshing.
         */
        update: function(opts) {
            this.applyNewSettings(opts);

            // Hide the gauge if conditions for display are not met
            if (!this.dispObj.isReady() ||
                    !this.renderGauge ||
                    !this.pxPerMeter ||
                    !this.position) {
                this.elementDiv.visuals.visibility = "none";
                return;
            }
            this.elementDiv.visuals.visibility = ""; // Make visible

            var viewPort = this.dispObj.viewPort;
            var currentZoom = viewPort.portToImageZoom(viewPort.getCurrentZoom(true));
            var currentPxPerM = currentZoom * this.pxPerMeter;
            var properties = this.sizeTextGen(currentPxPerM, this.minimumWidth);

            this.renderGauge(properties.dim, properties.label);
            var gaugePosition = this.calculateGaugePosition();
            this.elementDiv.visuals.coordX = gaugePosition.x + "px";
            this.elementDiv.visuals.coordY = gaugePosition.y + "px";
        },

        /**
         * Renders the gauge in a microscopy-style format.
         * @param {Number} dim The calculated dimension (width) for the gauge.
         * @param {String} label The text label to display on the gauge.
         */
        renderMagnifierGauge: function(dim, label) {
            this.elementDiv.visuals.txtSize = this.txtSize;
            this.elementDiv.visuals.textAlignment = "center";
            this.elementDiv.visuals.txtColor = this.txtColor;
            this.elementDiv.visuals.edge = "none";
            this.elementDiv.visuals.bottomEdge = this.lineThickness + "px solid " + this.lineColor;
            this.elementDiv.visuals.bgColor = this.bgColor;
            this.elementDiv.contentHTML = label;
            this.elementDiv.visuals.width = dim + "px";
        },

        /**
         * Renders the gauge in a map-style format.
         * @param {Number} dim The calculated dimension (width) for the gauge.
         * @param {String} label The text label to display on the gauge.
         */
        renderTerrainGauge: function(dim, label) {
            this.elementDiv.visuals.txtSize = this.txtSize;
            this.elementDiv.visuals.textAlignment = "center";
            this.elementDiv.visuals.txtColor = this.txtColor;
            this.elementDiv.visuals.edge = this.lineThickness + "px solid " + this.lineColor;
            this.elementDiv.visuals.topEdge = "none"; // Map style has no top border
            this.elementDiv.visuals.bgColor = this.bgColor;
            this.elementDiv.contentHTML = label;
            this.elementDiv.visuals.width = dim + "px";
        },

        /**
         * Computes the absolute pixel coordinates for positioning the gauge.
         * @returns {OpenSeadragon.Coord} The {x, y} coordinates for the gauge's top-left corner.
         */
        calculateGaugePosition: function() {
            var gaugeWidth = this.elementDiv.actualWidth;
            var gaugeHeight = this.elementDiv.offsetHeight;
            var hostElement = this.dispObj.hostElement;
            var xPos, yPos;

            // Determine position based on the configured location
            if (this.position === _OSD_.GaugePosition.UPPER_LEFT) {
                xPos = 0;
                yPos = 0;
                if (this.keepWithinBounds) {
                    var pixel_UL = this.dispObj.viewPort.getPixelFromPoint(
                            new _OSD_.Coord(0, 0), true);
                    if (!this.dispObj.wrapHoriz) {
                        xPos = Math.max(pixel_UL.x, 0);
                    }
                    if (!this.dispObj.wrapVert) {
                        yPos = Math.max(pixel_UL.y, 0);
                    }
                }
                return new _OSD_.Coord(xPos + this.offset_X, yPos + this.offset_Y);
            }

            if (this.position === _OSD_.GaugePosition.UPPER_RIGHT) {
                xPos = hostElement.offsetWidth - gaugeWidth;
                yPos = 0;
                if (this.keepWithinBounds) {
                    var pixel_UR = this.dispObj.viewPort.getPixelFromPoint(
                            new _OSD_.Coord(1, 0), true);
                    if (!this.dispObj.wrapHoriz) {
                        xPos = Math.min(xPos, pixel_UR.x - gaugeWidth);
                    }
                    if (!this.dispObj.wrapVert) {
                        yPos = Math.max(yPos, pixel_UR.y);
                    }
                }
                return new _OSD_.Coord(xPos - this.offset_X, yPos + this.offset_Y);
            }

            if (this.position === _OSD_.GaugePosition.LOWER_RIGHT) {
                xPos = hostElement.offsetWidth - gaugeWidth;
                yPos = hostElement.offsetHeight - gaugeHeight;
                if (this.keepWithinBounds) {
                    var pixel_LR = this.dispObj.viewPort.getPixelFromPoint(
                            new _OSD_.Coord(1, 1 / this.dispObj.src.ratio),
                            true);
                    if (!this.dispObj.wrapHoriz) {
                        xPos = Math.min(xPos, pixel_LR.x - gaugeWidth);
                    }
                    if (!this.dispObj.wrapVert) {
                        yPos = Math.min(yPos, pixel_LR.y - gaugeHeight);
                    }
                }
                return new _OSD_.Coord(xPos - this.offset_X, yPos - this.offset_Y);
            }

            if (this.position === _OSD_.GaugePosition.LOWER_LEFT) {
                xPos = 0;
                yPos = hostElement.offsetHeight - gaugeHeight;
                if (this.keepWithinBounds) {
                    var pixel_LL = this.dispObj.viewPort.getPixelFromPoint(
                            new _OSD_.Coord(0, 1 / this.dispObj.src.ratio),
                            true);
                    if (!this.dispObj.wrapHoriz) {
                        xPos = Math.max(xPos, pixel_LL.x);
                    }
                    if (!this.dispObj.wrapVert) {
                        yPos = Math.min(yPos, pixel_LL.y - gaugeHeight);
                    }
                }
                return new _OSD_.Coord(xPos + this.offset_X, yPos - this.offset_Y);
            }
        }
    };

    // --- Static Utility for Gauge Size and Text Rendering ---
    _OSD_.GaugeSizeTextGenerator = {
        /**
         * Metric measure. Generates text and size for units from nanometers to kilometers.
         */
        METRIC_MEASURE: function(ppu, minDim) {
            return getGaugeDimTextForMetric(ppu, minDim, "m");
        },

        /**
         * Imperial measure. Selects the most appropriate unit from thou, inch, foot, and mile.
         */
        IMPERIAL_MEASURE: function(ppu, minDim) {
            var maxDim = minDim * 2;
            var ppu_inch = ppu * 0.0254; // Pixels per inch
            if (maxDim < ppu_inch * 12) {
                if (maxDim < ppu_inch) {
                    var ppu_thou = ppu_inch / 1000; // Pixels per thou
                    return getGaugeDimText(ppu_thou, minDim, "th", false);
                }
                return getGaugeDimText(ppu_inch, minDim, "in", false);
            }
            var ppu_foot = ppu_inch * 12; // Pixels per foot
            if (maxDim < ppu_foot * 2000) {
                return getGaugeDimText(ppu_foot, minDim, "ft", false);
            }
            var ppu_mile = ppu_foot * 5280; // Pixels per mile
            return getGaugeDimText(ppu_mile, minDim, "mi", false);
        },

        /**
         * Standard timing. Chooses the best unit from second (and metric divisions),
         * minute, hour, day, and year.
         */
        STANDARD_TIMING: function(ppu_sec, minDim) {
            var maxDim = minDim * 2;
            if (maxDim < ppu_sec * 60) {
                return getGaugeDimTextForMetric(ppu_sec, minDim, "s", false);
            }
            var ppu_min = ppu_sec * 60; // Pixels per minute
            if (maxDim < ppu_min * 60) {
                return getGaugeDimText(ppu_min, minDim, "minute", true);
            }
            var ppu_hr = ppu_min * 60; // Pixels per hour
            if (maxDim < ppu_hr * 24) {
                return getGaugeDimText(ppu_hr, minDim, "hour", true);
            }
            var ppu_day = ppu_hr * 24; // Pixels per day
            if (maxDim < ppu_day * 365.25) {
                return getGaugeDimText(ppu_day, minDim, "day", true);
            }
            var ppu_yr = ppu_day * 365.25; // Pixels per year
            return getGaugeDimText(ppu_yr, minDim, "year", true);
        },

        /**
         * Generic metric unit renderer. Useful for creating custom metric scales.
         * Example for energy levels:
         * function(ppeV, minDim) {
         *   return OpenSeadragon.GaugeSizeTextGenerator.METRIC_GENERAL(
         *           ppeV, minDim, "eV");
         * }
         */
        METRIC_GENERAL: getGaugeDimTextForMetric
    };

    /**
     * Calculates the gauge dimension and text for standard units.
     * @param {Number} ppu Pixels per unit.
     * @param {Number} minDim Minimum allowed dimension for the gauge.
     * @param {String} unitStr The unit string (e.g., "m", "ft").
     * @param {Boolean} allowPlural If true, adds 's' for plural units.
     * @returns {Object} An object with 'dim' (size) and 'label' (text).
     */
    function getGaugeDimText(ppu, minDim, unitStr, allowPlural) {
        var val = standardizeValue(ppu, minDim);
        var mult = roundMantissa(val / ppu * minDim, 3);
        var dim = val * minDim;
        var isPlural = allowPlural && mult > 1 ? "s" : "";
        return {
            dim: dim,
            label: mult + " " + unitStr + isPlural
        };
    }

    /**
     * Calculates the gauge dimension and text for metric units, including prefixes.
     * @param {Number} ppu Pixels per unit.
     * @param {Number} minDim Minimum allowed dimension for the gauge.
     * @param {String} unitStr The base unit string (e.g., "m", "s").
     * @returns {Object} An object with 'dim' (size) and 'label' (text).
     */
    function getGaugeDimTextForMetric(ppu, minDim, unitStr) {
        var val = standardizeValue(ppu, minDim);
        var mult = roundMantissa(val / ppu * minDim, 3);
        var dim = val * minDim;
        var formattedUnit = formatWithUnit(mult, unitStr);
        return {
            dim: dim,
            label: formattedUnit
        };
    }

    /**
     * Normalizes a value based on a minimum size to fit a typical scale.
     * @param {Number} val The value to normalize (e.g., current pixels per unit).
     * @param {Number} minSize The minimum size (e.g., minimum gauge width in pixels).
     * @returns {Number} The normalized value.
     */
    function standardizeValue(val, minSize) {
        var mantissaVal = getMantissa(val);
        var mantissaMin = getMantissa(minSize);
        var result = getMantissa(mantissaVal / mantissaMin);
        // Adjust to common scale factors (1, 2, 4, 5)
        if (result >= 5) {
            result /= 5;
        }
        if (result >= 4) {
            result /= 4;
        }
        if (result >= 2) {
            result /= 2;
        }
        return result;
    }

    /**
     * Extracts the mantissa (significant digits) of a number.
     * @param {Number} num The number.
     * @returns {Number} The mantissa.
     */
    function getMantissa(num) {
        return num * Math.pow(10, Math.ceil(-base10Log(num)));
    }

    /**
     * Rounds the mantissa of a number to a specified number of decimal places.
     * @param {Number} num The number to round.
     * @param {Integer} decimalPlaces The number of decimal places.
     * @returns {Number} The rounded number.
     */
    function roundMantissa(num, decimalPlaces) {
        var expVal = -Math.ceil(-base10Log(num));
        var powVal = decimalPlaces - expVal;
        var mantissa = num * Math.pow(10, powVal);
        // Operate with integers to avoid floating point inaccuracies
        if (powVal < 0) {
            return Math.round(mantissa) * Math.pow(10, -powVal);
        }
        return Math.round(mantissa) / Math.pow(10, powVal);
    }

    /**
     * Computes the base-10 logarithm of a number.
     * @param {Number} num The number.
     * @returns {Number} log10(num).
     */
    function base10Log(num) {
        return Math.log(num) / Math.log(10);
    }

    /**
     * Formats a value with appropriate metric prefixes (n, µ, m, k).
     * @param {Number} val The numerical value.
     * @param {String} unitStr The base unit string.
     * @returns {String} The formatted string with unit and prefix.
     */
    function formatWithUnit(val, unitStr) {
        if (val < 0.000001) {
            return val * 1000000000 + " n" + unitStr;
        }
        if (val < 0.001) {
            return val * 1000000 + " μ" + unitStr;
        }
        if (val < 1) {
            return val * 1000 + " m" + unitStr;
        }
        if (val >= 1000) {
            return val / 1000 + " k" + unitStr;
        }
        return val + " " + unitStr;
    }

    /**
     * Checks if a variable is defined (not undefined).
     * @param {*} variable The variable to check.
     * @returns {Boolean} True if defined, false otherwise.
     */
    function isSet(variable) {
        return typeof (variable) !== "undefined";
    }

}(OpenSeadragon));