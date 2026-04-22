// Color Crafter Widget v2.0.0-alpha.1
(function (jQ) {

  // A flag for internal debugging messages.
  var _debugMode = false;

  // Extend jQuery prototype to enable direct initialization on elements.
  jQ.fn.colorCrafter = function (setupOpts) {
    jQ.colorCrafter(this, setupOpts);
    return this;
  };

  // Main factory function for the color picker.
  jQ.colorCrafter = function (targetNode, setupOpts) {
    var hostElement = jQ(targetNode)[0];
    // Return existing instance or create a new one if not present.
    return hostElement.colorCrafter || (hostElement.colorCrafter = new jQ._colorCrafter(hostElement, setupOpts));
  };

  // Core ColorCrafter constructor and methods.
  jQ._colorCrafter = function (hostElement, setupOpts) {
    var cc = this;

    // Utility methods and properties for color manipulation.
    /////////////////////////////////////////////////////////////////////////

    /**
     * Associates the color picker with an input element or a custom callback function.
     * @param {HTMLElement|Function|string} handler - The element(s) or function to link.
     */
    cc.connectTo = function (handler) {
      // Detach any previously bound keyboard event listeners.
      if (typeof cc.actionHandler == 'object') {
        jQ(cc.actionHandler).unbind('keyUpEvent', cc.refreshInput);
      }

      // Reset the internal color state.
      cc.currentHexColor = null;

      // Establish the new link: either a function or an element(s).
      if (typeof handler == 'function') {
        cc.actionHandler = handler;
      }
      else if (typeof handler == 'object' || typeof handler == 'string') {
        cc.actionHandler = jQ(handler);
        // Bind keyup for immediate input value changes.
        cc.actionHandler.bind('keyUpEvent', cc.refreshInput);
        // If the linked element has a value, initialize the picker with it.
        if (cc.actionHandler[0].value) {
          cc.setHexColor(cc.actionHandler[0].value);
        }
      }
      return this;
    };

    // Callback for linked input elements on keyup event.
    cc.refreshInput = function (eventObj) {
      if (this.value && this.value != cc.currentHexColor) {
        cc.setHexColor(this.value);
      }
    };

    /**
     * Sets the color using a standard HTML hex string (e.g., #RRGGBB).
     * @param {string} hexCode - The hex color string.
     */
    cc.setHexColor = function (hexCode) {
      var unpackedRgb = cc.parseHex(hexCode);
      if (cc.currentHexColor != hexCode && unpackedRgb) {
        cc.currentHexColor = hexCode;
        cc.rgbValues = unpackedRgb;
        cc.hslValues = cc.convertRgbToHsl(cc.rgbValues);
        cc.renderInterface();
      }
      return this;
    };

    /**
     * Sets the color using an HSL triplet array [0..1, 0..1, 0..1].
     * @param {number[]} hslArray - HSL values, each from 0 to 1.
     */
    cc.setHslValues = function (hslArray) {
      cc.hslValues = hslArray;
      cc.rgbValues = cc.convertHslToRgb(hslArray);
      cc.currentHexColor = cc.formatHex(cc.rgbValues);
      cc.renderInterface();
      return this;
    };

    // Initialization and rendering of the UI components.
    /////////////////////////////////////////////////////////////////////////

    /**
     * Constructs and displays the visual components of the color picker.
     */
    cc.initializeComponent = function () {
      // Define dimensions for the widget elements.
      var sizeProps = {
        width: setupOpts.componentWidth,
        height: setupOpts.componentWidth
      };

      // Inject the HTML structure for the color picker.
      jQ(hostElement)
        .html(
          '<div class="color-crafter-widget" style="position: relative">' +
            '<div class="color-crafter-solid-panel"></div>' +
            '<canvas class="color-crafter-mask-layer"></canvas>' +
            '<canvas class="color-crafter-overlay-layer"></canvas>' +
          '</div>'
        )
        // Apply dimensions to all child elements and set absolute positioning.
        .find('*').attr(sizeProps).css(sizeProps).end()
        .find('div > *').css('position', 'absolute');

      // IE Compatibility Fix: Recreate canvas elements using document.createElement
      // for ExplorerCanvas library support.
      jQ.browser.msie || false && jQ('canvas', hostElement).each(function () {
        // Store original attributes.
        var elemAttributes = { 'class': jQ(this).attr('class'), style: this.getAttribute('style') },
            newCanvasElem = document.createElement('canvas');
        // Replace the existing canvas with the newly created one.
        jQ(this).before(jQ(newCanvasElem).attr(elemAttributes)).remove();
        // Initialize with ExplorerCanvas if available.
        VMLCanvasManager && VMLCanvasManager.initElement(newCanvasElem);
        // Set dimensions and positioning for the new element.
        jQ(newCanvasElem).attr(sizeProps).css(sizeProps).css('position', 'absolute')
          .find('*').attr(sizeProps).css(sizeProps);
      });

      // Calculate key layout dimensions.
      cc.outerRadius = (setupOpts.componentWidth - setupOpts.outerRingWidth) / 2 - 1;
      cc.squareSide = Math.floor((cc.outerRadius - setupOpts.outerRingWidth / 2) * 0.7) - 1;
      cc.centerCoordinate = Math.floor(setupOpts.componentWidth / 2);
      cc.indicatorSize = setupOpts.outerRingWidth * 0.3;

      // Configure the solid color display panel.
      cc.hueDisplayElement = jQ('.color-crafter-solid-panel', hostElement).css({
        width: cc.squareSide * 2 - 1,
        height: cc.squareSide * 2 - 1,
        left: cc.centerCoordinate - cc.squareSide,
        top: cc.centerCoordinate - cc.squareSide
      });

      // Get canvas elements and their 2D rendering contexts.
      cc.maskCanvasElem = jQ('.color-crafter-mask-layer', hostElement);
      cc.maskContext = cc.maskCanvasElem[0].getContext('2d');
      cc.overlayCanvasElem = jQ('.color-crafter-overlay-layer', hostElement);
      cc.overlayContext = cc.overlayCanvasElem[0].getContext('2d');

      // Translate contexts to the center of the widget.
      cc.maskContext.translate(cc.centerCoordinate, cc.centerCoordinate);
      cc.overlayContext.translate(cc.centerCoordinate, cc.centerCoordinate);

      // Render the static base layers of the widget.
      cc.drawColorWheel();
      cc.drawSaturationLuminanceMask();
    };

    /**
     * Renders the circular hue selector wheel.
     */
    cc.drawColorWheel = function () {
      var startTime = +(new Date());
      // Create a hue circle using a series of gradient-filled Bezier curves.
      // Direct gradient-stroked arcs are not reliably supported across browsers.
      var segmentCount = 24,
          currentRadius = cc.outerRadius,
          currentWidth = setupOpts.outerRingWidth,
          overlapAdjust = 8 / currentRadius / segmentCount * Math.PI, // Small adjustment for smooth seams.
          drawingContext = cc.maskContext,
          startAngle = 0, firstColor, pos1;

      drawingContext.save();
      drawingContext.lineWidth = currentWidth / currentRadius;
      drawingContext.scale(currentRadius, currentRadius);

      // Iterate to draw each segment of the wheel.
      for (var i = 0; i <= segmentCount; ++i) {
        var pos2 = i / segmentCount,
            endAngle = pos2 * Math.PI * 2,
            // Calculate segment endpoints.
            startX = Math.sin(startAngle), startY = -Math.cos(startAngle);
            endX = Math.sin(endAngle), endY = -Math.cos(endAngle),
            // Determine midpoint for Bezier curve, ensuring tangency to the circle.
            midAngle = (startAngle + endAngle) / 2,
            tangentVal = 1 / Math.cos((endAngle - startAngle) / 2),
            midX = Math.sin(midAngle) * tangentVal, midY = -Math.cos(midAngle) * tangentVal,
            // Calculate the color for the end of the current segment.
            secondColor = cc.formatHex(cc.convertHslToRgb([pos2, 1, 0.5]));

        if (i > 0) {
          if (jQ.browser.msie || false) {
            // IE's gradient rendering can be problematic; apply a correction.
            var correctionFactor = (1 + Math.min(Math.abs(Math.tan(startAngle)), Math.abs(Math.tan(Math.PI / 2 - startAngle)))) / segmentCount;
            firstColor = cc.formatHex(cc.convertHslToRgb([pos1 - 0.15 * correctionFactor, 1, 0.5]));
            secondColor = cc.formatHex(cc.convertHslToRgb([pos2 + 0.15 * correctionFactor, 1, 0.5]));
            // Create a linear gradient for the segment fill.
            var linearGradient = drawingContext.createLinearGradient(startX, startY, endX, endY);
            linearGradient.addColorStop(0, firstColor);
            linearGradient.addColorStop(1, secondColor);
            drawingContext.fillStyle = linearGradient;
            // Draw the quadratic curve segment as a filled shape.
            var innerRadiusRatio = (currentRadius + currentWidth / 2) / currentRadius,
                outerRadiusRatio = (currentRadius - currentWidth / 2) / currentRadius;
            drawingContext.beginPath();
            drawingContext.moveTo(startX * innerRadiusRatio, startY * innerRadiusRatio);
            drawingContext.quadraticCurveTo(midX * innerRadiusRatio, midY * innerRadiusRatio, endX * innerRadiusRatio, endY * innerRadiusRatio);
            drawingContext.lineTo(endX * outerRadiusRatio, endY * outerRadiusRatio);
            drawingContext.quadraticCurveTo(midX * outerRadiusRatio, midY * outerRadiusRatio, startX * outerRadiusRatio, startY * outerRadiusRatio);
            drawingContext.fill();
          }
          else {
            // Standard Canvas: create a linear gradient for the stroke.
            var linearGradient = drawingContext.createLinearGradient(startX, startY, endX, endY);
            linearGradient.addColorStop(0, firstColor);
            linearGradient.addColorStop(1, secondColor);
            drawingContext.strokeStyle = linearGradient;
            // Draw the quadratic curve segment as a stroke.
            drawingContext.beginPath();
            drawingContext.moveTo(startX, startY);
            drawingContext.quadraticCurveTo(midX, midY, endX, endY);
            drawingContext.stroke();
          }
        }
        // Adjust start angle for the next segment, avoiding rendering artifacts.
        startAngle = endAngle - overlapAdjust; firstColor = secondColor; pos1 = pos2;
      }
      drawingContext.restore();
      _debugMode && jQ('body').append('<div>renderWheelTime ' + (+(new Date()) - startTime) + 'ms');
    };

    /**
     * Draws the square saturation/luminance selection area.
     */
    cc.drawSaturationLuminanceMask = function () {
      var startTime = +(new Date());

      // Helper function to calculate pixel values for the mask.
      var areaDimension = cc.squareSide * 2, halfSide = cc.squareSide;
      function computePixelValues(gridWidth, gridHeight, setPixelData) {
        var invGridWidth = 1 / gridWidth, invGridHeight = 1 / gridHeight;
        for (var y = 0; y <= gridHeight; ++y) {
          var luminosity = 1 - y * invGridHeight;
          for (var x = 0; x <= gridWidth; ++x) {
            var saturation = 1 - x * invGridWidth;
            // Convert saturation/luminosity to alpha and grayscale color components.
            var alphaVal = 1 - 2 * Math.min(luminosity * saturation, (1 - luminosity) * saturation);
            var colorVal = (alphaVal > 0) ? ((2 * luminosity - 1 + alphaVal) * .5 / alphaVal) : 0;
            setPixelData(x, y, colorVal, alphaVal);
          }
        }
      }

      // Method 1: Using direct pixel manipulation with getImageData (for modern Canvas).
      if (cc.maskContext.getImageData) {
        // Create a temporary canvas buffer at half resolution.
        var bufferSize = Math.floor(areaDimension / 2);
        var tempCanvasBuffer = document.createElement('canvas');
        tempCanvasBuffer.width = tempCanvasBuffer.height = bufferSize + 1;
        var bufferContext = tempCanvasBuffer.getContext('2d');
        var imageDataFrame = bufferContext.getImageData(0, 0, bufferSize + 1, bufferSize + 1);

        var pixelIndex = 0;
        computePixelValues(bufferSize, bufferSize, function (x, y, c, a) {
          imageDataFrame.data[pixelIndex++] = imageDataFrame.data[pixelIndex++] = imageDataFrame.data[pixelIndex++] = c * 255;
          imageDataFrame.data[pixelIndex++] = a * 255;
        });

        bufferContext.putImageData(imageDataFrame, 0, 0);
        cc.maskContext.drawImage(tempCanvasBuffer, 0, 0, bufferSize + 1, bufferSize + 1, -halfSide, -halfSide, halfSide * 2, halfSide * 2);
      }
      // Method 2: Drawing commands for older Canvas implementations (non-IE).
      else if (!(jQ.browser.msie || false)) {
        // Render directly at half-resolution.
        var bufferSize = Math.floor(areaDimension / 2);
        computePixelValues(bufferSize, bufferSize, function (x, y, c, a) {
          c = Math.round(c * 255);
          cc.maskContext.fillStyle = 'rgba(' + c + ', ' + c + ', ' + c + ', ' + a + ')';
          cc.maskContext.fillRect(x * 2 - halfSide - 1, y * 2 - halfSide - 1, 2, 2);
        });
      }
      // Method 3: Vertical DXImageTransform gradients for Internet Explorer.
      else {
        var prevRowCache, currentRowCache, stripWidth = 6; // Each gradient strip is 6 pixels wide.
        var stripCount = Math.floor(areaDimension / stripWidth);
        // Compute mask data for 6 vertical gradient pieces per strip.
        computePixelValues(stripCount, 6, function (x, y, c, a) {
          if (x == 0) {
            prevRowCache = currentRowCache;
            currentRowCache = [];
          }
          c = Math.round(c * 255);
          a = Math.round(a * 255);
          // Gradients can only be applied once two rows of pixel data are available.
          if (y > 0) {
            var prevColorComponent = prevRowCache[x][0],
                prevAlphaComponent = prevRowCache[x][1],
                startFilterColor = cc.formatDxFilterColor(prevColorComponent, prevAlphaComponent),
                endFilterColor = cc.formatDxFilterColor(c, a),
                startPxY = Math.round(cc.centerCoordinate + ((y - 1) * .333 - 1) * halfSide),
                endPxY = Math.round(cc.centerCoordinate + (y * .333 - 1) * halfSide);

            jQ('<div>').css({
              position: 'absolute',
              filter: "progid:DXImageTransform.Microsoft.Gradient(StartColorStr=" + startFilterColor + ", EndColorStr=" + endFilterColor + ", GradientType=0)",
              top: startPxY,
              height: endPxY - startPxY,
              // Adjust width for the last strip to prevent overflow.
              left: cc.centerCoordinate + (x * stripWidth - halfSide - 1),
              width: stripWidth - (x == stripCount ? Math.round(stripWidth / 2) : 0)
            }).appendTo(cc.maskCanvasElem);
          }
          currentRowCache.push([c, a]);
        });
      }
      _debugMode && jQ('body').append('<div>maskRenderTime ' + (+(new Date()) - startTime) + 'ms');
    };

    /**
     * Draws the circular selection indicators on the overlay canvas.
     */
    cc.renderSelectionIndicators = function () {
      // Calculate marker dimensions.
      var widgetSize = setupOpts.componentWidth,
          lineWidthVal = Math.ceil(cc.indicatorSize / 4),
          indicatorRadius = cc.indicatorSize - lineWidthVal + 1;

      var hueAngle = cc.hslValues[0] * 6.28,
          hueIndicatorX = Math.sin(hueAngle) * cc.outerRadius,
          hueIndicatorY = -Math.cos(hueAngle) * cc.outerRadius,
          satLumIndicatorX = 2 * cc.squareSide * (.5 - cc.hslValues[1]),
          satLumIndicatorY = 2 * cc.squareSide * (.5 - cc.hslValues[2]),
          markerColor1 = cc.shouldInvertLabels ? '#fff' : '#000',
          markerColor2 = cc.shouldInvertLabels ? '#000' : '#fff';

      var indicatorCircles = [
        { xCoord: hueIndicatorX, yCoord: hueIndicatorY, radius: indicatorRadius,         strokeColor: '#000', strokeWidth: lineWidthVal + 1 },
        { xCoord: hueIndicatorX, yCoord: hueIndicatorY, radius: cc.indicatorSize,        strokeColor: '#fff', strokeWidth: lineWidthVal },
        { xCoord: satLumIndicatorX, yCoord: satLumIndicatorY, radius: indicatorRadius,   strokeColor: markerColor2, strokeWidth: lineWidthVal + 1 },
        { xCoord: satLumIndicatorX, yCoord: satLumIndicatorY, radius: cc.indicatorSize,  strokeColor: markerColor1, strokeWidth: lineWidthVal },
      ];

      // Clear the overlay and draw the new markers.
      cc.overlayContext.clearRect(-cc.centerCoordinate, -cc.centerCoordinate, widgetSize, widgetSize);
      for (var k = 0; k < indicatorCircles.length; k++) {
        var currentCircle = indicatorCircles[k];
        cc.overlayContext.lineWidth = currentCircle.strokeWidth;
        cc.overlayContext.strokeStyle = currentCircle.strokeColor;
        cc.overlayContext.beginPath();
        cc.overlayContext.arc(currentCircle.xCoord, currentCircle.yCoord, currentCircle.radius, 0, Math.PI * 2, true);
        cc.overlayContext.stroke();
      }
    };

    /**
     * Refreshes the visual display of the color picker, including markers and linked elements.
     */
    cc.renderInterface = function () {
      // Determine if text/markers should be inverted for better contrast.
      cc.shouldInvertLabels = (cc.rgbValues[0] * 0.3 + cc.rgbValues[1] * .59 + cc.rgbValues[2] * .11) <= 0.6;

      // Update the background color of the solid panel.
      cc.hueDisplayElement.css('backgroundColor', cc.formatHex(cc.convertHslToRgb([cc.hslValues[0], 1, 0.5])));

      // Redraw the selection indicators.
      cc.renderSelectionIndicators();

      // Update linked elements or trigger the callback function.
      if (typeof cc.actionHandler == 'object') {
        // Apply background and foreground colors to linked elements.
        jQ(cc.actionHandler).css({
          backgroundColor: cc.currentHexColor,
          color: cc.shouldInvertLabels ? '#fff' : '#000'
        });

        // Update the value property of linked input fields.
        jQ(cc.actionHandler).each(function() {
          if ((typeof this.value == 'string') && this.value != cc.currentHexColor) {
            this.value = cc.currentHexColor;
          }
        }).change(); // Trigger change event.
      }
      else if (typeof cc.actionHandler == 'function') {
        // Invoke the callback with the current hex color.
        cc.actionHandler.call(cc, cc.currentHexColor);
      }
    };

    /**
     * Calculates coordinates relative to the center of the widget.
     * @param {Event} eventObj - The DOM event object.
     * @returns {object} An object with x and y coordinates.
     */
    cc.getRelativeCoordinates = function (eventObj) {
      return {
        x: eventObj.pageX - cc.widgetOffset.left - cc.centerCoordinate,
        y: eventObj.pageY - cc.widgetOffset.top - cc.centerCoordinate
      };
    };

    /**
     * Event handler for mouse button press.
     * @param {Event} eventObj - The mouse event.
     */
    cc.handleMouseDown = function (eventObj) {
      // Capture mouse events globally to track dragging.
      if (!jQ._colorCrafter.isDragging) {
        jQ(document).bind('mouseMovement', cc.handleMouseMove).bind('mouseRelease', cc.handleMouseUp);
        jQ._colorCrafter.isDragging = true;
      }

      // Store the current offset of the widget.
      cc.widgetOffset = jQ(hostElement).offset();

      // Determine if the drag started on the color wheel or the saturation/luminance square.
      var currentPosition = cc.getRelativeCoordinates(eventObj);
      cc.isDraggingWheel = Math.max(Math.abs(currentPosition.x), Math.abs(currentPosition.y)) > (cc.squareSide + 2);

      // Immediately process the mouse position.
      cc.handleMouseMove(eventObj);
      return false; // Prevent default drag behavior.
    };

    /**
     * Event handler for mouse movement during a drag operation.
     * @param {Event} eventObj - The mouse event.
     */
    cc.handleMouseMove = function (eventObj) {
      // Get coordinates relative to the picker's center.
      var currentPosition = cc.getRelativeCoordinates(eventObj);

      // Update HSL parameters based on drag location.
      if (cc.isDraggingWheel) {
        var hueValue = Math.atan2(currentPosition.x, -currentPosition.y) / 6.28;
        cc.setHslValues([(hueValue + 1) % 1, cc.hslValues[1], cc.hslValues[2]]);
      }
      else {
        var saturationValue = Math.max(0, Math.min(1, -(currentPosition.x / cc.squareSide / 2) + .5));
        var luminanceValue = Math.max(0, Math.min(1, -(currentPosition.y / cc.squareSide / 2) + .5));
        cc.setHslValues([cc.hslValues[0], saturationValue, luminanceValue]);
      }
      return false; // Prevent default text selection.
    };

    /**
     * Event handler for mouse button release, ending a drag.
     */
    cc.handleMouseUp = function () {
      // Release global mouse event capture.
      jQ(document).unbind('mouseMovement', cc.handleMouseMove);
      jQ(document).unbind('mouseRelease', cc.handleMouseUp);
      jQ._colorCrafter.isDragging = false;
    };

    /* Assorted color conversion and formatting functions */

    /**
     * Converts a decimal number to a two-digit hexadecimal string.
     * @param {number} decimalVal - The decimal value.
     * @returns {string} The hex string.
     */
    cc.decimalToHex = function (decimalVal) {
      return (decimalVal < 16 ? '0' : '') + decimalVal.toString(16);
    };

    /**
     * Formats color for IE's DXImageTransform filter (ARGB hex).
     * @param {number} colorComponent - Color value (0-255).
     * @param {number} alphaComponent - Alpha value (0-255).
     * @returns {string} ARGB hex string.
     */
    cc.formatDxFilterColor = function (colorComponent, alphaComponent) {
      return '#' + cc.decimalToHex(alphaComponent) + cc.decimalToHex(colorComponent) + cc.decimalToHex(colorComponent) + cc.decimalToHex(colorComponent);
    };

    /**
     * Converts an RGB array [R, G, B] (0-1) to an HTML hex color string.
     * @param {number[]} rgbArray - RGB values.
     * @returns {string} Hex color string like #RRGGBB.
     */
    cc.formatHex = function (rgbArray) {
      var redVal = Math.round(rgbArray[0] * 255);
      var greenVal = Math.round(rgbArray[1] * 255);
      var blueVal = Math.round(rgbArray[2] * 255);
      return '#' + cc.decimalToHex(redVal) + cc.decimalToHex(greenVal) + cc.decimalToHex(blueVal);
    };

    /**
     * Parses an HTML hex color string (#RGB or #RRGGBB) into an RGB array (0-1).
     * @param {string} hexCode - The hex color string.
     * @returns {number[]|undefined} RGB array or undefined if invalid.
     */
    cc.parseHex = function (hexCode) {
      if (hexCode.length == 7) {
        function extractComponent(startIndex) {
          return parseInt(hexCode.substring(startIndex, startIndex + 2), 16) / 255;
        }
        return [ extractComponent(1), extractComponent(3), extractComponent(5) ];
      }
      else if (hexCode.length == 4) {
        function extractComponent(startIndex) {
          return parseInt(hexCode.substring(startIndex, startIndex + 1), 16) / 15;
        }
        return [ extractComponent(1), extractComponent(2), extractComponent(3) ];
      }
    };

    /**
     * Converts an HSL color array to an RGB color array.
     * @param {number[]} hslArray - HSL values [h, s, l], each 0-1.
     * @returns {number[]} RGB values [r, g, b], each 0-1.
     */
    cc.convertHslToRgb = function (hslArray) {
      var tempM1, tempM2;
      var hueComp = hslArray[0], satComp = hslArray[1], lumComp = hslArray[2];

      tempM2 = (lumComp <= 0.5) ? lumComp * (satComp + 1) : lumComp + satComp - lumComp * satComp;
      tempM1 = lumComp * 2 - tempM2;

      return [
        this.convertHueToRgbComponent(tempM1, tempM2, hueComp + 0.33333),
        this.convertHueToRgbComponent(tempM1, tempM2, hueComp),
        this.convertHueToRgbComponent(tempM1, tempM2, hueComp - 0.33333)
      ];
    };

    /**
     * Helper function to convert a hue component to an RGB value.
     * @private
     * @param {number} m1 - Intermediate value.
     * @param {number} m2 - Intermediate value.
     * @param {number} hueFragment - Hue component (normalized).
     * @returns {number} RGB component value.
     */
    cc.convertHueToRgbComponent = function (m1, m2, hueFragment) {
      hueFragment = (hueFragment + 1) % 1;
      if (hueFragment * 6 < 1) return m1 + (m2 - m1) * hueFragment * 6;
      if (hueFragment * 2 < 1) return m2;
      if (hueFragment * 3 < 2) return m1 + (m2 - m1) * (0.66666 - hueFragment) * 6;
      return m1;
    };

    /**
     * Converts an RGB color array to an HSL color array.
     * @param {number[]} rgbArray - RGB values [r, g, b], each 0-1.
     * @returns {number[]} HSL values [h, s, l], each 0-1.
     */
    cc.convertRgbToHsl = function (rgbArray) {
      var redVal = rgbArray[0], greenVal = rgbArray[1], blueVal = rgbArray[2],
          minRgbVal = Math.min(redVal, greenVal, blueVal),
          maxRgbVal = Math.max(redVal, greenVal, blueVal),
          rgbDelta = maxRgbVal - minRgbVal,
          hueComp = 0,
          satComp = 0,
          lumComp = (minRgbVal + maxRgbVal) / 2;

      if (lumComp > 0 && lumComp < 1) {
        satComp = rgbDelta / (lumComp < 0.5 ? (2 * lumComp) : (2 - 2 * lumComp));
      }
      if (rgbDelta > 0) {
        if (maxRgbVal == redVal && maxRgbVal != greenVal) hueComp += (greenVal - blueVal) / rgbDelta;
        if (maxRgbVal == greenVal && maxRgbVal != blueVal) hueComp += (2 + (blueVal - redVal) / rgbDelta);
        if (maxRgbVal == blueVal && maxRgbVal != redVal) hueComp += (4 + (redVal - greenVal) / rgbDelta);
        hueComp /= 6;
      }
      return [hueComp, satComp, lumComp];
    };

    // Process initial configuration settings.
    if (!setupOpts.onColorChange) {
      setupOpts = { onColorChange: setupOpts };
    }
    setupOpts = jQ.extend({
      componentWidth: 300,
      outerRingWidth: (setupOpts.componentWidth || 300) / 10,
      onColorChange: null
    }, setupOpts);

  }; // End of jQ._colorCrafter constructor.

})(jQuery); // Pass jQuery object.