SketchCanvas.Tool.Palette = SketchCanvas.Tool.extend({
    // Descriptive name for this color selection component
    toolName: 'colorSelector',

    // Main initialization method for the palette control
    initialize: function() {
        // First, construct and inject the component's visual elements
        this.setupVisuals();

        // Capture a reference to the current instance for use within event handlers
        const selfRef = this;

        // Define a constant for the hidden CSS class to maintain consistency
        const hideElementClass = 'util-visibility-hidden';

        // Event handler for clicks on individual color swatches within the palette grid
        this.$el.on('click', '.palette-swatch-item', function(evt) {
            // Extract the selected color string from the clicked element's data attribute
            const selectedPaintColor = $(this).attr('data-color');

            // Update the main drawing board's active color
            selfRef.board.setActiveColor(selectedPaintColor);

            // Visually update the 'current color' display to reflect the new selection
            selfRef.$el.find('.palette-active-color-display')
                .css('background-color', selectedPaintColor)
                .attr('data-active-color', selectedPaintColor);

            // Trigger a custom event on the board's event bus, notifying listeners of the color change
            selfRef.board.eventBus.emit('activeColorSet', selectedPaintColor);

            // Immediately hide the color selection grid after a color has been chosen
            selfRef.$el.find('.palette-color-grid').addClass(hideElementClass);

            // Prevent any default browser action that might occur from the click
            evt.preventDefault();
        });

        // Event handler for clicking on the active color display button
        // This action toggles the visibility of the full color palette grid
        this.$el.on('click', '.palette-active-color-display', function(evt) {
            // Toggle the visibility class on the color grid container
            selfRef.$el.find('.palette-color-grid').toggleClass(hideElementClass);
            evt.preventDefault();
        });

        // Global event listener on the document body to handle clicks outside the palette
        // This ensures the palette automatically closes if the user clicks elsewhere on the page
        $('body').on('click', function(evt) {
            const $eventTarget = $(evt.target); // The element that was clicked
            const $controlRoot = selfRef.$el;   // The root jQuery element of this color control
            const $colorGrid = selfRef.$el.find('.palette-color-grid'); // The color grid popup

            // Check if the color grid is currently visible AND the click occurred outside the entire control
            const isGridVisible = !$colorGrid.hasClass(hideElementClass);
            const isClickOutsideControl = !$controlRoot.is($eventTarget) && $controlRoot.has($eventTarget).length === 0;

            if (isGridVisible && isClickOutsideControl) {
                // If both conditions are true, hide the color grid
                $colorGrid.addClass(hideElementClass);
            }
        });
    },

    // Method responsible for generating and appending the HTML structure of the color palette
    setupVisuals: function() {
        // Primary HTML template for the color control's layout
        const mainLayoutMarkup = `
            <div class="canvas-tool-container">
                <div class="palette-active-color-display" style="background-color: {{activeColor}}" data-active-color="{{activeColor}}"></div>
                <div class="palette-color-grid">{{generatedSwatches}}</div>
            </div>`;
        // Template for an individual color swatch item within the grid
        const colorSwatchMarkup = '<div class="palette-swatch-item" data-color="{{colorValue}}" style="background-color: {{colorValue}}"></div>';

        let colorGridContent = ''; // String accumulator for all generated color swatch HTML

        // Define a set of lightness levels for generating color rows (e.g., light, medium, dark)
        const lightnessLevelsConfig = [0.75, 0.5, 0.25];

        // Iterate through each defined lightness level to build a row of colors
        lightnessLevelsConfig.forEach(currentLightnessFactor => {
            colorGridContent += '<div class="palette-color-row">'; // Start a new row for this lightness

            let baseAchromaticShade; // Variable for special achromatic colors (black, grey, white)

            // Assign a specific achromatic color based on the current lightness factor
            switch (currentLightnessFactor) {
                case 0.25: // Dark shades row
                    baseAchromaticShade = this._createRgbaObject(0, 0, 0, 1); // Black
                    break;
                case 0.5:  // Medium shades row
                    baseAchromaticShade = this._createRgbaObject(150, 150, 150, 1); // Mid-grey
                    break;
                case 0.75: // Light shades row
                    baseAchromaticShade = this._createRgbaObject(255, 255, 255, 1); // White
                    break;
                default:
                    // Fallback for unexpected lightness values, defaults to transparent
                    baseAchromaticShade = this._createRgbaObject(0, 0, 0, 0);
            }
            // Add the achromatic swatch to the current row
            colorGridContent += SketchCanvas.Utils.fillTemplate(colorSwatchMarkup, { colorValue: baseAchromaticShade.toRgbaString() });

            // Generate a spectrum of hues for the current lightness factor
            // The loop generates colors from a specific hue range with a fixed step
            for (let hueAngle = -60; hueAngle <= 270; hueAngle += 30) {
                const currentHsl = this._buildHslObject(hueAngle, 1, currentLightnessFactor); // Full saturation
                const currentRgba = this._transformHslToRgba(currentHsl); // Convert HSL to RGBA
                colorGridContent += SketchCanvas.Utils.fillTemplate(colorSwatchMarkup, { colorValue: currentRgba.toRgbaString() });
            }
            colorGridContent += '</div>'; // Close the current color row
        });

        // Determine the initial color to display, using a fallback if not set on the board
        const initialDisplayColor = this.board.color || 'rgba(0,0,0,1)';

        // Insert the complete HTML structure into the control's root element
        this.$el.append( $( SketchCanvas.Utils.fillTemplate(mainLayoutMarkup, { activeColor: initialDisplayColor, generatedSwatches: colorGridContent }) ) );

        // Ensure the entire color palette grid is hidden by default when the control loads
        this.$el.find('.palette-color-grid').addClass('util-visibility-hidden');
    },

    // Callback method invoked when the main drawing board undergoes a reset operation
    onBoardReset: function(resetOptions) {
        // Retrieve the currently active color from the display element within the palette control
        const storedActiveColor = this.$el.find('.palette-active-color-display').attr('data-active-color');

        // Only attempt to set the board's color if a valid color string was found
        if (storedActiveColor) {
            this.board.setActiveColor(storedActiveColor);
        } else {
            // Log a warning if no active color could be retrieved, indicating a potential issue
            console.warn("Palette control could not find an active color to restore on board reset.");
        }
    },

    // Utility function to construct an RGBA color object
    // Includes a method to output the color as a CSS-compatible rgba() string
    _createRgbaObject: function(redVal, greenVal, blueVal, alphaVal) {
        // Robust input validation to ensure color component values are within acceptable ranges
        if (typeof redVal !== 'number' || isNaN(redVal) || redVal < 0 || redVal > 255) redVal = 0;
        if (typeof greenVal !== 'number' || isNaN(greenVal) || greenVal < 0 || greenVal > 255) greenVal = 0;
        if (typeof blueVal !== 'number' || isNaN(blueVal) || blueVal < 0 || blueVal > 255) blueVal = 0;
        if (typeof alphaVal !== 'number' || isNaN(alphaVal) || alphaVal < 0 || alphaVal > 1) alphaVal = 1;

        return {
            r: Math.round(redVal), // Ensure integer values for R, G, B
            g: Math.round(greenVal),
            b: Math.round(blueVal),
            a: alphaVal,
            // Method to return the CSS rgba() string representation
            toRgbaString: function() {
                return `rgba(${this.r}, ${this.g}, ${this.b}, ${this.a})`;
            }
        };
    },

    // Utility function to construct an HSL color object
    // Includes a method to output the color as a CSS-compatible hsl() string
    _buildHslObject: function(hueVal, satVal, lumVal) {
        // Input validation for HSL components
        if (typeof hueVal !== 'number' || isNaN(hueVal)) hueVal = 0;
        if (typeof satVal !== 'number' || isNaN(satVal) || satVal < 0 || satVal > 1) satVal = 0;
        if (typeof lumVal !== 'number' || isNaN(lumVal) || lumVal < 0 || lumVal > 1) lumVal = 0;

        return {
            h: hueVal,
            s: satVal,
            l: lumVal,
            // Method to return the CSS hsl() string representation
            toHslString: function() {
                // Convert saturation and lightness to percentage format for CSS
                return `hsl(${this.h}, ${Math.round(this.s * 100)}%, ${Math.round(this.l * 100)}%)`;
            }
        };
    },

    // Utility function to convert a hexadecimal color string (e.g., "#RRGGBB" or "#RGB") to an RGBA object
    _parseHexToRgba: function(hexString) {
        // Validate the input string format
        if (!hexString || typeof hexString !== 'string' || !/^#([A-Fa-f0-9]{3}){1,2}$/.test(hexString)) {
            console.warn("Invalid hex color string provided for conversion:", hexString);
            return this._createRgbaObject(0, 0, 0, 0); // Return transparent black on invalid input
        }

        let processedHex = hexString.slice(1); // Remove the leading '#'

        // Expand shorthand hex (e.g., #F00 to #FF0000)
        if (processedHex.length === 3) {
            processedHex = processedHex.split('').map(char => char + char).join('');
        }

        const numericValue = parseInt(processedHex, 16);
        const redComponent = (numericValue >> 16) & 255;
        const greenComponent = (numericValue >> 8) & 255;
        const blueComponent = numericValue & 255;

        return this._createRgbaObject(redComponent, greenComponent, blueComponent, 1); // Full opacity for hex colors
    },

    // Comprehensive conversion function from HSL color space to RGBA color space
    // This algorithm is based on standard color conversion principles.
    _transformHslToRgba: function(hslObj) {
        const hueNormalized = hslObj.h / 360; // Normalize hue to a [0, 1] range
        const saturation = hslObj.s;
        const lightness = hslObj.l;

        let redComponent, greenComponent, blueComponent; // Will hold normalized RGB values

        // Inner helper function to calculate an individual RGB component from hue, saturation, and lightness
        const calculateHueSegment = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };

        if (saturation === 0) {
            redComponent = greenComponent = blueComponent = lightness; // Achromatic color (grayscale)
        } else {
            const tempQ = lightness < 0.5 ? lightness * (1 + saturation) : lightness + saturation - lightness * saturation;
            const tempP = 2 * lightness - tempQ;

            // Apply the hue segment calculation to each RGB channel
            redComponent = Math.floor(calculateHueSegment(tempP, tempQ, hueNormalized + 1 / 3) * 255);
            greenComponent = Math.floor(calculateHueSegment(tempP, tempQ, hueNormalized) * 255);
            blueComponent = Math.floor(calculateHueSegment(tempP, tempQ, hueNormalized - 1 / 3) * 255);
        }
        return this._createRgbaObject(redComponent, greenComponent, blueComponent, 1); // Full opacity
    }
});