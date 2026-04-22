// A modern and refactored color selection utility, based on classic principles.
(function (jq) {

var _globalDebugFlag = false; // Internal flag for conditional debugging output.

// Extends jQuery's prototype to provide a convenient plugin interface for initialization.
jq.fn.chromaPicker = function (configuration) {
  jq.createChromaPicker(this, configuration);
  return this; // Allows for jQuery method chaining.
};

// Factory function responsible for creating or retrieving a ChromaPicker instance.
jq.createChromaPicker = function (domElementRef, configuration) {
  // Ensure we're working with a raw DOM element from the jQuery selection.
  var actualDomElement = jq(domElementRef).get(0);

  // Guard clause: If no valid DOM element is found, log a warning and exit.
  if (!actualDomElement) {
    console.warn("ChromaPicker: Target DOM element for initialization was not found.");
    return null;
  }

  // If an instance already exists on this element, return it to prevent duplicates.
  if (actualDomElement.chromaPickerInstance) {
    return actualDomElement.chromaPickerInstance;
  } else {
    // Otherwise, create a new instance and store it on the DOM element.
    var newInstance = new jq._chromaPickerCore(actualDomElement, configuration);
    actualDomElement.chromaPickerInstance = newInstance;
    return newInstance;
  }
};

// The core constructor function for the ChromaPicker.
jq._chromaPickerCore = function (targetDomElement, userConfiguration) {
  var cpInst = this; // Self-reference for clarity, commonly used for instance properties.

  // --- Internal State Management ---
  // Encapsulates all dynamic properties of the picker instance.
  cpInst._runtimeState = {
    currentHexColorValue: null,     // The currently selected color in #RRGGBB hex format.
    currentRgbComponents: null,     // RGB array [0-1, 0-1, 0-1].
    currentHslComponents: null,     // HSL array [0-1, 0-1, 0-1].
    isDraggingActive: false,        // True if a drag operation is currently in progress for this instance.
    isColorWheelDrag: false,        // True if the current drag originated on the color wheel.
    widgetOffsetPosition: null,     // Cached offset position of the widget container.
    associatedCallbackHandler: null, // Function or jQuery object linked for updates.
    needsTextColorInversion: false  // Flag to determine if text should be light or dark.
  };

  // --- Configuration Settings ---
  // Defines default and user-overridable settings for the picker.
  var defaultConfiguration = {
    panelDimension: 300,          // Width and height of the entire picker panel.
    wheelStrokeWidth: null,       // Thickness of the color wheel (calculated if null).
    updateNotificationTarget: null // Initial target for color updates (function or selector).
  };

  // Handle legacy single-argument callback option for backward compatibility.
  if (userConfiguration && typeof userConfiguration !== 'object') {
    userConfiguration = { updateNotificationTarget: userConfiguration };
  }
  // Merge user-provided settings with defaults.
  cpInst.configOptions = jq.extend({}, defaultConfiguration, userConfiguration);

  // Calculate dependent configuration options.
  if (cpInst.configOptions.wheelStrokeWidth === null) {
    cpInst.configOptions.wheelStrokeWidth = cpInst.configOptions.panelDimension / 10;
  }

  // --- Color Conversion Utilities (Encapsulated) ---
  // A collection of static helper methods for color space conversions.
  var _colorConversion = {
    // Converts a decimal number (0-255) to a two-character hex string.
    toHexDigit: function (numericVal) {
      return (numericVal < 16 ? '0' : '') + Math.round(numericVal).toString(16);
    },

    // Converts an RGB array [0-1] to a hex color string (#RRGGBB).
    rgbToHexString: function (rgbArr) {
      var r = rgbArr[0] * 255;
      var g = rgbArr[1] * 255;
      var b = rgbArr[2] * 255;
      return '#' + this.toHexDigit(r) + this.toHexDigit(g) + this.toHexDigit(b);
    },

    // Parses a hex color string (#RGB or #RRGGBB) into an RGB array [0-1].
    hexStringToRgb: function (hexString) {
      if (!hexString || typeof hexString !== 'string') {
        return null; // Invalid input.
      }
      hexString = hexString.trim();
      var parsedRgbArray = null;

      if (hexString.length === 7) { // Format: #RRGGBB
        parsedRgbArray = [
          parseInt(hexString.substring(1, 3), 16) / 255,
          parseInt(hexString.substring(3, 5), 16) / 255,
          parseInt(hexString.substring(5, 7), 16) / 255
        ];
      } else if (hexString.length === 4) { // Format: #RGB (shorthand)
        parsedRgbArray = [
          parseInt(hexString.substring(1, 2), 16) / 15,
          parseInt(hexString.substring(2, 3), 16) / 15,
          parseInt(hexString.substring(3, 4), 16) / 15
        ];
      }
      return parsedRgbArray;
    },

    // Converts HSL components [0-1] to RGB components [0-1].
    hslToRgb: function (hslArr) {
      var hue = hslArr[0], saturation = hslArr[1], lightness = hslArr[2];
      var temporary1, temporary2, redComp, greenComp, blueComp;

      temporary2 = (lightness <= 0.5) ? lightness * (saturation + 1) : lightness + saturation - lightness * saturation;
      temporary1 = lightness * 2 - temporary2;

      redComp = this.calculateColorComponent(temporary1, temporary2, hue + 1/3);
      greenComp = this.calculateColorComponent(temporary1, temporary2, hue);
      blueComp = this.calculateColorComponent(temporary1, temporary2, hue - 1/3);

      return [redComp, greenComp, blueComp];
    },

    // Helper for HSL to RGB conversion, calculates a single color channel.
    calculateColorComponent: function (t1, t2, h) {
      h = (h + 1) % 1; // Normalize hue to be within [0, 1).
      if (h * 6 < 1) return t1 + (t2 - t1) * h * 6;
      if (h * 2 < 1) return t2;
      if (h * 3 < 2) return t1 + (t2 - t1) * (2/3 - h) * 6;
      return t1;
    },

    // Converts RGB components [0-1] to HSL components [0-1].
    rgbToHsl: function (rgbArr) {
      var r = rgbArr[0], g = rgbArr[1], b = rgbArr[2];
      var minVal = Math.min(r, g, b);
      var maxVal = Math.max(r, g, b);
      var delta = maxVal - minVal;
      var hue = 0, saturation = 0, lightness = (minVal + maxVal) / 2;

      if (lightness > 0 && lightness < 1) {
        saturation = delta / (lightness < 0.5 ? (2 * lightness) : (2 - 2 * lightness));
      }

      if (delta > 0) {
        if (maxVal === r) {
          hue = (g - b) / delta + (g < b ? 6 : 0);
        } else if (maxVal === g) {
          hue = (b - r) / delta + 2;
        } else { // maxVal === b
          hue = (r - g) / delta + 4;
        }
        hue /= 6;
      }
      return [hue, saturation, lightness];
    },

    // Specific utility for IE's DXImageTransform gradients (ARGB format).
    packDxColorForIE: function (colorComponent, alphaComponent) {
      return '#' + this.toHexDigit(alphaComponent) + this.toHexDigit(colorComponent) + this.toHexDigit(colorComponent) + this.toHexDigit(colorComponent);
    }
  };

  // --- Public API Methods ---

  /**
   * Links the color picker to an external element(s) or a custom callback function.
   * @param {Function|String|jQuery} target - The function to call, or a selector/jQuery object.
   * @returns {object} The current ChromaPicker instance for method chaining.
   */
  cpInst.linkToUpdateTarget = function (target) {
    // Unbind any previously linked event handlers from jQuery objects.
    if (cpInst._runtimeState.associatedCallbackHandler && (typeof cpInst._runtimeState.associatedCallbackHandler === 'object' || cpInst._runtimeState.associatedCallbackHandler instanceof jq)) {
      jq(cpInst._runtimeState.associatedCallbackHandler).off('input keyup change', cpInst.handleLinkedElementChange);
    }

    // Reset the internal color state as we might be linking to a new color source.
    cpInst._runtimeState.currentHexColorValue = null;

    // Establish new link based on target type.
    if (typeof target === 'function') {
      cpInst._runtimeState.associatedCallbackHandler = target;
    } else if (typeof target === 'object' || typeof target === 'string') {
      cpInst._runtimeState.associatedCallbackHandler = jq(target);
      // Bind to multiple input events for comprehensive updates.
      cpInst._runtimeState.associatedCallbackHandler.on('input keyup change', cpInst.handleLinkedElementChange);

      // If the linked element has a value, initialize the picker with it.
      if (cpInst._runtimeState.associatedCallbackHandler.length > 0 && cpInst._runtimeState.associatedCallbackHandler[0].value) {
        cpInst.setHexColor(cpInst._runtimeState.associatedCallbackHandler[0].value);
      }
    }
    return this;
  };

  /**
   * Callback function executed when a linked input element's value changes.
   * @param {Event} event - The DOM event that triggered the change.
   */
  cpInst.handleLinkedElementChange = function (event) {
    var updatedValue = this.value;
    // Only update the picker if the new value is different from the current picker color.
    if (updatedValue && updatedValue !== cpInst._runtimeState.currentHexColorValue) {
      cpInst.setHexColor(updatedValue);
    }
  };

  /**
   * Sets the color of the picker using an HTML hex color string.
   * @param {string} hexColorString - The new color, e.g., "#FF0000".
   * @returns {object} The current ChromaPicker instance.
   */
  cpInst.setHexColor = function (hexColorString) {
    var rgbComponents = _colorConversion.hexStringToRgb(hexColorString);
    // Proceed only if the hex string is valid and represents a new color.
    if (rgbComponents && cpInst._runtimeState.currentHexColorValue !== hexColorString) {
      cpInst._runtimeState.currentHexColorValue = hexColorString;
      cpInst._runtimeState.currentRgbComponents = rgbComponents;
      cpInst._runtimeState.currentHslComponents = _colorConversion.rgbToHsl(cpInst._runtimeState.currentRgbComponents);
      cpInst.updateVisualsAndNotifications();
    }
    return this;
  };

  /**
   * Sets the color of the picker using an HSL triplet array.
   * @param {number[]} hslArray - An array [hue, saturation, lightness], all values 0-1.
   * @returns {object} The current ChromaPicker instance.
   */
  cpInst.setHslComponents = function (hslArray) {
    // Basic validation for the HSL array input.
    if (!Array.isArray(hslArray) || hslArray.length !== 3 || hslArray.some(isNaN)) {
        console.warn("ChromaPicker: Invalid HSL array provided.", hslArray);
        return this;
    }
    cpInst._runtimeState.currentHslComponents = hslArray;
    cpInst._runtimeState.currentRgbComponents = _colorConversion.hslToRgb(hslArray);
    cpInst._runtimeState.currentHexColorValue = _colorConversion.rgbToHexString(cpInst._runtimeState.currentRgbComponents);
    cpInst.updateVisualsAndNotifications();
    return this;
  };

  // --- Widget Rendering and Event Handling ---

  /**
   * Initializes the DOM structure, canvases, and drawing contexts for the picker.
   */
  cpInst.initializeDomStructure = function () {
    var panelSize = cpInst.configOptions.panelDimension;
    var elementDimensions = {
      width: panelSize,
      height: panelSize
    };

    // Construct the HTML markup using a template literal for readability.
    var widgetHtml = `
      <div class="chroma-picker-wrapper" style="position: relative;">
        <div class="chroma-picker-color-swatch"></div>
        <canvas class="chroma-picker-hue-mask"></canvas>
        <canvas class="chroma-picker-selection-overlay"></canvas>
      </div>`;

    jq(targetDomElement)
      .html(widgetHtml) // Inject the HTML structure.
      .find('*').attr(elementDimensions).css(elementDimensions).end() // Apply dimensions to all children.
      .find('div > *').css('position', 'absolute'); // Ensure canvases are absolutely positioned.

    // Legacy IE compatibility for canvas elements, using excanvas.js if available.
    // This is a simplified approach compared to the original's complex IE gradient handling.
    if (typeof G_vmlCanvasManager !== 'undefined') { // Check for the global excanvas manager.
        jq('canvas', targetDomElement).each(function () {
            var oldCanvas = jq(this);
            var canvasAttributes = { 'class': oldCanvas.attr('class'), style: this.getAttribute('style') };
            var newCanvas = document.createElement('canvas');

            oldCanvas.before(jq(newCanvas).attr(canvasAttributes)).remove(); // Replace old with new.
            G_vmlCanvasManager.initElement(newCanvas); // Initialize new canvas with excanvas.

            // Reapply dimensions and positioning.
            jq(newCanvas).attr(elementDimensions).css(elementDimensions).css('position', 'absolute')
                .find('*').attr(elementDimensions).css(elementDimensions);
        });
    }

    // Calculate dynamic layout dimensions based on panel size and wheel thickness.
    cpInst.wheelExternalRadius = (panelSize - cpInst.configOptions.wheelStrokeWidth) / 2 - 1;
    cpInst.saturationSquareSize = Math.floor((cpInst.wheelExternalRadius - cpInst.configOptions.wheelStrokeWidth / 2) * 0.7) - 1;
    cpInst.widgetCenter = Math.floor(panelSize / 2);
    cpInst.markerDotSize = cpInst.configOptions.wheelStrokeWidth * 0.3;

    // Position and size the solid color swatch element.
    cpInst.colorSwatchElement = jq('.chroma-picker-color-swatch', targetDomElement).css({
      width: cpInst.saturationSquareSize * 2 - 1,
      height: cpInst.saturationSquareSize * 2 - 1,
      left: cpInst.widgetCenter - cpInst.saturationSquareSize,
      top: cpInst.widgetCenter - cpInst.saturationSquareSize
    });

    // Obtain references to the canvas elements and their 2D rendering contexts.
    cpInst.hueMaskCanvas = jq('.chroma-picker-hue-mask', targetDomElement);
    cpInst.hueMaskContext = cpInst.hueMaskCanvas[0].getContext('2d');
    cpInst.selectionOverlayCanvas = jq('.chroma-picker-selection-overlay', targetDomElement);
    cpInst.selectionOverlayContext = cpInst.selectionOverlayCanvas[0].getContext('2d');

    // Translate contexts to the center of the widget for simplified drawing coordinates.
    cpInst.hueMaskContext.translate(cpInst.widgetCenter, cpInst.widgetCenter);
    cpInst.selectionOverlayContext.translate(cpInst.widgetCenter, cpInst.widgetCenter);

    // Draw the static background layers of the picker.
    cpInst.drawColorWheel();
    cpInst.drawSaturationLuminanceMask();
  };

  /**
   * Draws the hue color wheel onto the mask canvas.
   */
  cpInst.drawColorWheel = function () {
    var TWO_PI = Math.PI * 2;
    var totalSegments = 24; // Number of segments to approximate the circle.
    var wheelRadius = cpInst.wheelExternalRadius;
    var strokeThickness = cpInst.configOptions.wheelStrokeWidth;
    var drawingContext = cpInst.hueMaskContext;
    var angleOverlap = TWO_PI / (wheelRadius * totalSegments * 2); // Small overlap to hide seams.

    drawingContext.save();
    drawingContext.lineWidth = strokeThickness / wheelRadius; // Scale line width relative to radius.
    drawingContext.scale(wheelRadius, wheelRadius); // Scale the context for easier coordinate calculations.

    var previousAngle = 0;
    var previousColor;

    // Iterate through segments to draw the gradient wheel.
    for (var i = 0; i <= totalSegments; ++i) {
      var currentHueFraction = i / totalSegments;
      var currentAngle = currentHueFraction * TWO_PI;

      // Calculate start and end points for the current segment.
      var startX = Math.sin(previousAngle), startY = -Math.cos(previousAngle);
      var endX = Math.sin(currentAngle), endY = -Math.cos(currentAngle);

      // Calculate midpoint for quadratic curve, ensuring tangency to the circle.
      var midAngle = (previousAngle + currentAngle) / 2;
      var tangentScalingFactor = 1 / Math.cos((currentAngle - previousAngle) / 2);
      var midPointX = Math.sin(midAngle) * tangentScalingFactor;
      var midPointY = -Math.cos(midAngle) * tangentScalingFactor;

      // Determine the color for the end of this segment.
      var nextSegmentColor = _colorConversion.rgbToHexString(_colorConversion.hslToRgb([currentHueFraction, 1, 0.5]));

      if (i > 0) {
        // Create a linear gradient across the segment.
        var segmentGradient = drawingContext.createLinearGradient(startX, startY, endX, endY);
        segmentGradient.addColorStop(0, previousColor);
        segmentGradient.addColorStop(1, nextSegmentColor);
        drawingContext.strokeStyle = segmentGradient;

        // Draw the segment as a quadratic curve.
        drawingContext.beginPath();
        drawingContext.moveTo(startX, startY);
        drawingContext.quadraticCurveTo(midPointX, midPointY, endX, endY);
        drawingContext.stroke();
      }

      previousAngle = currentAngle - angleOverlap; // Adjust for smooth transition.
      previousColor = nextSegmentColor;
    }
    drawingContext.restore(); // Restore context to original state.
  };

  /**
   * Draws the saturation and luminance mask (the inner square).
   */
  cpInst.drawSaturationLuminanceMask = function () {
    var squareDimensions = cpInst.saturationSquareSize * 2;
    var halfSquare = cpInst.saturationSquareSize;
    var maskDrawingContext = cpInst.hueMaskContext;

    // Inner helper function to determine mask pixel properties.
    var _calculateMaskPixelProperties = function (xNormalized, yNormalized) {
      var lightness = 1 - yNormalized; // Y-axis from top (0) to bottom (1) for lightness.
      var saturation = 1 - xNormalized; // X-axis from right (0) to left (1) for saturation.

      // Alpha value for the grayscale mask.
      var alphaComponent = 1 - 2 * Math.min(lightness * saturation, (1 - lightness) * saturation);
      // Grayscale component.
      var grayValue = (alphaComponent > 0) ? ((2 * lightness - 1 + alphaComponent) * 0.5 / alphaComponent) : 0;
      return { gray: grayValue, alpha: alphaComponent };
    };

    // Preferred method: Direct pixel manipulation using getImageData for modern canvas.
    if (maskDrawingContext.getImageData) {
      // Create a smaller buffer canvas to draw at half-resolution, then scale up.
      var bufferCanvasSize = Math.floor(squareDimensions / 2);
      var tempBufferCanvas = document.createElement('canvas');
      tempBufferCanvas.width = tempBufferCanvas.height = bufferCanvasSize + 1;
      var tempBufferContext = tempBufferCanvas.getContext('2d');
      var imageData = tempBufferContext.createImageData(bufferCanvasSize + 1, bufferCanvasSize + 1);
      var pixelDataArray = imageData.data;
      var currentPixelIndex = 0;

      for (var y = 0; y <= bufferCanvasSize; ++y) {
        for (var x = 0; x <= bufferCanvasSize; ++x) {
          var pixelProperties = _calculateMaskPixelProperties(x / bufferCanvasSize, y / bufferCanvasSize);
          pixelDataArray[currentPixelIndex++] = Math.round(pixelProperties.gray * 255); // Red channel.
          pixelDataArray[currentPixelIndex++] = Math.round(pixelProperties.gray * 255); // Green channel.
          pixelDataArray[currentPixelIndex++] = Math.round(pixelProperties.gray * 255); // Blue channel.
          pixelDataArray[currentPixelIndex++] = Math.round(pixelProperties.alpha * 255); // Alpha channel.
        }
      }
      tempBufferContext.putImageData(imageData, 0, 0);
      // Draw the buffered image scaled up onto the main mask canvas.
      maskDrawingContext.drawImage(tempBufferCanvas, 0, 0, bufferCanvasSize + 1, bufferCanvasSize + 1, -halfSquare, -halfSquare, squareDimensions, squareDimensions);
    }
    // Fallback method: Drawing small rectangles for older canvas implementations.
    else {
      var drawStep = 2; // Draw in 2x2 pixel blocks for performance.
      var halfDrawStep = drawStep / 2;
      for (var y = 0; y <= squareDimensions; y += drawStep) {
        for (var x = 0; x <= squareDimensions; x += drawStep) {
          var pixelProperties = _calculateMaskPixelProperties(x / squareDimensions, y / squareDimensions);
          var grayComponentValue = Math.round(pixelProperties.gray * 255);
          maskDrawingContext.fillStyle = 'rgba(' + grayComponentValue + ', ' + grayComponentValue + ', ' + grayComponentValue + ', ' + pixelProperties.alpha +')';
          maskDrawingContext.fillRect(x - halfSquare - halfDrawStep, y - halfSquare - halfDrawStep, drawStep, drawStep);
        }
      }
    }
    // Note: The original implementation included highly specific and complex logic for IE's
    // DXImageTransform gradients. For a Type III clone, this intricate, browser-specific
    // rendering is omitted to simplify and focus on modern canvas capabilities, while
    // still maintaining the general functional outcome for the mask.
  };

  /**
   * Updates and redraws the selection markers (hue wheel marker and sat/lum square marker).
   */
  cpInst.updateSelectionMarkers = function () {
    var panelDimension = cpInst.configOptions.panelDimension;
    var overlayDrawingContext = cpInst.selectionOverlayContext;
    var markerBaseRadius = cpInst.markerDotSize;
    var markerBorderWidth = Math.ceil(markerBaseRadius / 4); // Defines the thickness of the marker's border.

    var currentHsl = cpInst._runtimeState.currentHslComponents;
    var currentHueAngle = currentHsl[0] * Math.PI * 2; // Convert hue [0-1] to radians for circular positioning.

    // Calculate position for the hue marker on the color wheel.
    var hueMarkerCoordX = Math.sin(currentHueAngle) * cpInst.wheelExternalRadius;
    var hueMarkerCoordY = -Math.cos(currentHueAngle) * cpInst.wheelExternalRadius;

    // Calculate position for the saturation/luminance marker within the inner square.
    // The original mapping: sat = -(pos.x / square / 2) + .5; lum = -(pos.y / square / 2) + .5;
    // So, pos.x = (0.5 - sat) * square * 2; pos.y = (0.5 - lum) * square * 2;
    var satLumMarkerCoordX = 2 * cpInst.saturationSquareSize * (0.5 - currentHsl[1]); // Saturation maps to X.
    var satLumMarkerCoordY = 2 * cpInst.saturationSquareSize * (0.5 - currentHsl[2]); // Luminance maps to Y.

    // Dynamically determine marker colors for optimal contrast against the background.
    var markerOuterStrokeColor = cpInst._runtimeState.needsTextColorInversion ? '#fff' : '#000';
    var markerInnerFillColor = cpInst._runtimeState.needsTextColorInversion ? '#000' : '#fff';

    // Define the properties for each marker to be drawn.
    var markerDescriptions = [
      // Hue marker (outer wheel) - typically a dark border with a white interior.
      { x: hueMarkerCoordX, y: hueMarkerCoordY, radius: markerBaseRadius, strokeColor: '#000', lineWidth: markerBorderWidth + 1 },
      { x: hueMarkerCoordX, y: hueMarkerCoordY, radius: markerBaseRadius - markerBorderWidth, strokeColor: '#fff', lineWidth: markerBorderWidth },
      // Saturation/Luminance marker (inner square) - dynamic colors for contrast.
      { x: satLumMarkerCoordX, y: satLumMarkerCoordY, radius: markerBaseRadius, strokeColor: markerInnerFillColor, lineWidth: markerBorderWidth + 1 },
      { x: satLumMarkerCoordX, y: satLumMarkerCoordY, radius: markerBaseRadius - markerBorderWidth, strokeColor: markerOuterStrokeColor, lineWidth: markerBorderWidth }
    ];

    // Clear the previous markers from the overlay canvas before redrawing.
    overlayDrawingContext.clearRect(-cpInst.widgetCenter, -cpInst.widgetCenter, panelDimension, panelDimension);
    // Draw each defined marker.
    markerDescriptions.forEach(function (marker) {
      overlayDrawingContext.lineWidth = marker.lineWidth;
      overlayDrawingContext.strokeStyle = marker.strokeColor;
      overlayDrawingContext.beginPath();
      overlayDrawingContext.arc(marker.x, marker.y, marker.radius, 0, Math.PI * 2, true);
      overlayDrawingContext.stroke();
    });
  };

  /**
   * Triggers a comprehensive update: redraws all visual elements and notifies linked targets.
   */
  cpInst.updateVisualsAndNotifications = function () {
    // Calculate luminance to decide if text/markers should invert for readability.
    // Standard formula for perceived luminance.
    var currentRgb = cpInst._runtimeState.currentRgbComponents;
    var perceivedLuminance = (currentRgb[0] * 0.299 + currentRgb[1] * 0.587 + currentRgb[2] * 0.114);
    cpInst._runtimeState.needsTextColorInversion = perceivedLuminance <= 0.6; // Threshold for switching text color.

    // Update the background color of the solid color swatch.
    // This swatch typically shows the full saturation/half lightness version of the current hue.
    cpInst.colorSwatchElement.css('backgroundColor', _colorConversion.rgbToHexString(_colorConversion.hslToRgb([cpInst._runtimeState.currentHslComponents[0], 1, 0.5])));

    // Redraw the dynamic selection markers.
    cpInst.updateSelectionMarkers();

    // Notify any linked elements or callback functions about the color change.
    var notificationTarget = cpInst._runtimeState.associatedCallbackHandler;
    if (notificationTarget) {
      if (typeof notificationTarget === 'object' || notificationTarget instanceof jq) {
        // For jQuery-wrapped elements: update background, text color, and input value.
        notificationTarget.css({
          backgroundColor: cpInst._runtimeState.currentHexColorValue,
          color: cpInst._runtimeState.needsTextColorInversion ? '#fff' : '#000'
        });

        notificationTarget.each(function () {
          // Update the value property only if it exists (e.g., for input fields).
          if (this.value !== undefined && this.value !== cpInst._runtimeState.currentHexColorValue) {
            this.value = cpInst._runtimeState.currentHexColorValue;
          }
        });
        // Explicitly trigger a 'change' event for linked elements that might need it.
        notificationTarget.trigger('change');
      } else if (typeof notificationTarget === 'function') {
        // For callback functions: invoke with the current hex color value.
        notificationTarget.call(cpInst, cpInst._runtimeState.currentHexColorValue);
      }
    }
  };

  // --- Pointer (Mouse/Touch) Event Handlers ---

  /**
   * Calculates coordinates relative to the widget's central point.
   * @param {Event} event - The pointer (mouse/touch) event object.
   * @returns {{x: number, y: number}} Coordinates relative to the center.
   */
  cpInst.getCenteredCoordinates = function (event) {
    // Lazily update widget offset position to ensure accuracy during drag.
    if (!cpInst._runtimeState.widgetOffsetPosition) {
        cpInst._runtimeState.widgetOffsetPosition = jq(targetDomElement).offset();
    }
    // Deduct widget's top-left offset and then the center point.
    return {
      x: event.pageX - cpInst._runtimeState.widgetOffsetPosition.left - cpInst.widgetCenter,
      y: event.pageY - cpInst._runtimeState.widgetOffsetPosition.top - cpInst.widgetCenter
    };
  };

  /**
   * Handles the pointer down event (mousedown or touchstart).
   * @param {Event} event - The pointer event.
   * @returns {boolean} False to prevent default browser actions like text selection.
   */
  cpInst.onPointerStart = function (event) {
    // Prevent multiple ChromaPicker instances from being dragged simultaneously.
    if (jq._chromaPickerCore.globalDragLock) {
        return false;
    }

    // Bind global event handlers for movement and release.
    // Using namespaced events to prevent conflicts and allow easy unbinding.
    jq(document).on('mousemove.chromaPicker touchmove.chromaPicker', cpInst.onPointerMovement)
                .on('mouseup.chromaPicker touchend.chromaPicker', cpInst.onPointerEnd);
    jq._chromaPickerCore.globalDragLock = true; // Set global lock.
    cpInst._runtimeState.isDraggingActive = true; // Mark this instance as active.

    // Update the cached offset of the widget in case it moved.
    cpInst._runtimeState.widgetOffsetPosition = jq(targetDomElement).offset();

    // Determine if the drag began on the color wheel or the saturation/luminance square.
    var pointerCoordinates = cpInst.getCenteredCoordinates(event);
    cpInst._runtimeState.isColorWheelDrag = Math.max(Math.abs(pointerCoordinates.x), Math.abs(pointerCoordinates.y)) > (cpInst.saturationSquareSize + 2);

    // Immediately process the initial pointer position.
    cpInst.onPointerMovement(event);
    return false;
  };

  /**
   * Handles the pointer move event (mousemove or touchmove).
   * @param {Event} event - The pointer event.
   * @returns {boolean} False to prevent default browser actions.
   */
  cpInst.onPointerMovement = function (event) {
    // If this instance is not actively dragging, do nothing.
    if (!cpInst._runtimeState.isDraggingActive) {
        return true; // Allow default behavior.
    }

    var pointerCoordinates = cpInst.getCenteredCoordinates(event);
    var currentHsl = cpInst._runtimeState.currentHslComponents;

    if (cpInst._runtimeState.isColorWheelDrag) {
      // Calculate new hue based on the angle from the center.
      var newHueValue = Math.atan2(pointerCoordinates.x, -pointerCoordinates.y) / (Math.PI * 2);
      cpInst.setHslComponents([(newHueValue + 1) % 1, currentHsl[1], currentHsl[2]]);
    } else {
      // Calculate new saturation and lightness based on position within the square.
      var newSaturationValue = Math.max(0, Math.min(1, -(pointerCoordinates.x / cpInst.saturationSquareSize / 2) + 0.5));
      var newLightnessValue = Math.max(0, Math.min(1, -(pointerCoordinates.y / cpInst.saturationSquareSize / 2) + 0.5));
      cpInst.setHslComponents([currentHsl[0], newSaturationValue, newLightnessValue]);
    }
    return false;
  };

  /**
   * Handles the pointer up event (mouseup or touchend).
   */
  cpInst.onPointerEnd = function () {
    // Unbind the global event handlers for movement and release.
    jq(document).off('mousemove.chromaPicker touchmove.chromaPicker', cpInst.onPointerMovement)
                .off('mouseup.chromaPicker touchend.chromaPicker', cpInst.onPointerEnd);
    jq._chromaPickerCore.globalDragLock = false; // Release global lock.
    cpInst._runtimeState.isDraggingActive = false; // Mark this instance as inactive.
  };

  /**
   * Public method to clean up and destroy the ChromaPicker instance.
   */
  cpInst.destroy = function() {
    cpInst.onPointerEnd(); // Ensure global event handlers are unbound.
    jq(targetDomElement).off('mousedown.chromaPicker touchstart.chromaPicker', cpInst.onPointerStart);
    // Unbind handlers from any linked notification target.
    if (cpInst._runtimeState.associatedCallbackHandler && (typeof cpInst._runtimeState.associatedCallbackHandler === 'object' || cpInst._runtimeState.associatedCallbackHandler instanceof jq)) {
        jq(cpInst._runtimeState.associatedCallbackHandler).off('input keyup change', cpInst.handleLinkedElementChange);
    }
    jq(targetDomElement).empty(); // Clear the DOM content of the picker.
    delete targetDomElement.chromaPickerInstance; // Remove the instance reference from the DOM element.
    console.log("ChromaPicker instance successfully destroyed for element:", targetDomElement);
  };

  // --- Initial Setup Sequence ---
  cpInst.initializeDomStructure();
  cpInst.linkToUpdateTarget(cpInst.configOptions.updateNotificationTarget);

  // Set an initial default color if no linked element provided one.
  if (!cpInst._runtimeState.currentHexColorValue) {
      cpInst.setHexColor('#808080'); // Default to a medium gray.
  }

  // Bind the initial pointer down event to the picker container.
  jq(targetDomElement).on('mousedown.chromaPicker touchstart.chromaPicker', cpInst.onPointerStart);
};

// Static property on the core constructor to manage a global drag lock.
// This prevents multiple ChromaPicker instances from being dragged simultaneously.
jq._chromaPickerCore.globalDragLock = false;

})(jQuery);