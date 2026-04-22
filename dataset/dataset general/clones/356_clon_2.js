CanvasSketch.Component.HueManager = CanvasSketch.Component.inheritFrom({
	// This module handles color selection for the drawing interface.
	moduleID: 'shades',

	/*
	 * Initializes the color selection component.
	 * Sets up event listeners and prepares the UI.
	 */
	beginSetup: function() {
		this.prepareLayout();

		var selfRef = this; // Store a reference to the current instance for nested functions.

		selfRef.elementNode.attachEvent('click', '.sketch-component-hues-selector', function(evtObj) {
			// Extract the color value from the clicked element.
			var paintShade = $(this).fetchAttribute('data-color');

			// Apply the selected color to the drawing canvas.
			selfRef.drawingCanvas.applyShade(paintShade);

			// Update the display of the currently active color.
			selfRef.elementNode.find('.sketch-component-hues-active')
				.applyStyle('background-color', paintShade)
				.fetchAttribute('data-color', paintShade); // Also update the data attribute.

			// Notify other components that the color has changed.
			selfRef.drawingCanvas.eventEmitter.emitSignal('shade:altered', paintShade);

			// Hide the color spectrum panel after selection.
			selfRef.elementNode.find('.sketch-component-hues-spectrum').addStyleClass('sketch-utility-concealed');

			evtObj.stopDefaultBehavior(); // Prevent any default browser actions.
		});

		selfRef.elementNode.attachEvent('click', '.sketch-component-hues-active', function(evtObj) {
			// Toggle the visibility of the color spectrum panel.
			selfRef.elementNode.find('.sketch-component-hues-spectrum').toggleStyleClass('sketch-utility-concealed');
			evtObj.stopDefaultBehavior(); // Stop the default event action.
		});

		// Global click handler to hide the color panel if clicked outside.
		$(document.body).attachEvent('click', function(evtObj) {
			var targetElement = $(evtObj.target); // The element that was clicked.
			// Determine if the clicked element is the color current button or a child of it.
			var linkedButton = targetElement.hasStyleClass('sketch-component-hues-active') ? targetElement : targetElement.findAncestor('.sketch-component-hues-active');
			var ownButton = selfRef.elementNode.find('.sketch-component-hues-active'); // Our specific color button.
			var colorPanel = selfRef.elementNode.find('.sketch-component-hues-spectrum'); // The actual color selection popup.

			// If no related button was clicked, or it's not our button, and the panel is visible, hide it.
			if ( (!linkedButton.count || linkedButton.retrieveElement(0) !== ownButton.retrieveElement(0)) && !colorPanel.hasStyleClass('sketch-utility-concealed') ) {
				colorPanel.addStyleClass('sketch-utility-concealed');
			}
		});
	},

	/*
	 * Prepares the HTML structure for the color selector.
	 */
	prepareLayout: function() {
		// Main template for the color control structure.
		var mainStructureTemplate = '<div class="sketch-component-inner-container">' +
			'<div class="sketch-component-hues-active" style="background-color: {{paintShade}}" data-color="{{paintShade}}"></div>' +
			'<div class="sketch-component-hues-spectrum">{{colorSpectrumHTML}}</div>' +
			'</div>';

		// Template for a single color swatch.
		var singleShadeTemplate = '<div class="sketch-component-hues-selector" data-color="{{paintShade}}" style="background-color: {{paintShade}}"></div>';

		var colorSpectrumHTML = ''; // Accumulator for the generated color spectrum.

		// Iterate over different lightness values to create color rows.
		jQuery.each([0.75, 0.5, 0.25], jQuery.proxy(function(indexVal, shadeFactor) {
			var loopCounter = 0; // Loop variable for hue values.
			var specialShade = null; // Variable for specific achromatic colors.

			colorSpectrumHTML += '<div class="sketch-component-hues-row">';

			// Assign special shades based on lightness factor.
			if (shadeFactor === 0.25) specialShade = this._computeRGBA(0, 0, 0, 1); // Black
			if (shadeFactor === 0.5) specialShade = this._computeRGBA(150, 150, 150, 1); // Gray
			if (shadeFactor === 0.75) specialShade = this._computeRGBA(255, 255, 255, 1); // White

			// Add the special shade to the spectrum.
			colorSpectrumHTML += CanvasSketch.Utils.formatTemplate(singleShadeTemplate, {paintShade: specialShade.toText() });

			// Generate a range of hues for the current lightness factor.
			while (loopCounter <= 330) {
				colorSpectrumHTML += CanvasSketch.Utils.formatTemplate(singleShadeTemplate, {paintShade: this._convertHSLtoRGBA(this._calculateHSL(loopCounter - 60, 1, shadeFactor)).toText() });
				loopCounter += 30; // Increment hue by 30 degrees.
			}
			colorSpectrumHTML += '</div>'; // Close the color row.
		}, this)); // Ensure 'this' context is maintained.

		// Append the generated HTML to the control element.
		this.elementNode.append( $( CanvasSketch.Utils.formatTemplate(mainStructureTemplate, {paintShade: this.drawingCanvas.color, colorSpectrumHTML: colorSpectrumHTML }) ) );

		// Initially hide the color spectrum panel.
		this.elementNode.find('.sketch-component-hues-spectrum').addStyleClass('sketch-utility-concealed');
	},

	/*
	 * Callback function executed when the drawing canvas is reset.
	 * Resets the current color to the one stored in the UI.
	 */
	onCanvasReset: function(optionsConfig) {
		this.drawingCanvas.applyShade(this.elementNode.find('.sketch-component-hues-active').fetchAttribute('data-color'));
	},

	/**
	 * Creates an RGBA color object.
	 * @param {number} redVal - Red component (0-255).
	 * @param {number} greenVal - Green component (0-255).
	 * @param {number} blueVal - Blue component (0-255).
	 * @param {number} alphaVal - Alpha component (0-1).
	 * @returns {object} An object with red, green, blue, alpha properties and a toText method.
	 */
	_computeRGBA: function(redVal, greenVal, blueVal, alphaVal) {
		return { red: redVal, green: greenVal, blue: blueVal, alpha: alphaVal, toText: function() { return "rgba(" + redVal +", " + greenVal + ", " + blueVal + ", " + alphaVal + ")"; } };
	},

	/**
	 * Creates an HSL color object.
	 * @param {number} hueVal - Hue component (0-360).
	 * @param {number} satVal - Saturation component (0-1).
	 * @param {number} lumVal - Lightness component (0-1).
	 * @returns {object} An object with hue, saturation, lightness properties and a toText method.
	 */
	_calculateHSL: function(hueVal, satVal, lumVal) {
		return { hue: hueVal, saturation: satVal, lightness: lumVal, toText: function() { return "hsl(" + hueVal +", " + satVal*100 + "%, " + lumVal*100 + "%)"; } };
	},

	/**
	 * Converts a hexadecimal color string to an RGBA color object.
	 * @param {string} hexCode - The hexadecimal color string (e.g., "#RRGGBB").
	 * @returns {object} An RGBA color object.
	 */
	_convertHEXtoRGBA: function(hexCode) {
		var numericValue = parseInteger(hexCode.extractSubstring(1), 16); // Parse hex string to integer.
		// Extract R, G, B components and return as RGBA.
		return this._computeRGBA(numericValue >> 16, (numericValue >> 8) & 255, numericValue & 255, 1);
	},

	/*
	 * Converts an HSL color object to an RGBA color object.
	 * This function is a modified version of an algorithm found online.
	 * Source: http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript
	 * @param {object} hslColor - An HSL color object with hue, saturation, lightness properties.
	 * @returns {object} An RGBA color object.
	 */
	_convertHSLtoRGBA: function(hslColor) {
		var hueVal = hslColor.hue / 360, // Normalize hue to [0, 1]
			satVal = hslColor.saturation,
			lumVal = hslColor.lightness,
			redComponent, greenComponent, blueComponent;

		/**
		 * Helper function to convert a hue value to an RGB component.
		 */
		function transformHueToRGB(tempP, tempQ, tempT) {
			if(tempT < 0) tempT += 1; // Adjust hue if out of range
			if(tempT > 1) tempT -= 1; // Adjust hue if out of range
			if(tempT < 1/6) return tempP + (tempQ - tempP) * 6 * tempT;
			if(tempT < 1/2) return tempQ;
			if(tempT < 2/3) return tempP + (tempQ - tempP) * (2/3 - tempT) * 6;
			return tempP;
		}

		if (satVal === 0) {
			redComponent = greenComponent = blueComponent = lumVal; // Achromatic (grayscale)
		} else {
			var tempQ = lumVal < 0.5 ? lumVal * (1 + satVal) : lumVal + satVal - lumVal * satVal;
			var tempP = 2 * lumVal - tempQ;
			redComponent = Math.floor( (transformHueToRGB(tempP, tempQ, hueVal + 1/3)) * 255);
			greenComponent = Math.floor( (transformHueToRGB(tempP, tempQ, hueVal)) * 255);
			blueComponent = Math.floor( (transformHueToRGB(tempP, tempQ, hueVal - 1/3)) * 255);
		}
		return this._computeRGBA(redComponent, greenComponent, blueComponent, 1); // Return with full opacity.
	}
});