;(function(currGlobal, moduleFactory) {
  // Check for AMD loader (e.g., RequireJS)
  if (typeof defineModule === 'function' && defineModule.amd) {
    defineModule(['jquery'], moduleFactory);
  }
  // Check for CommonJS environment (e.g., Node.js, Browserify, Webpack)
  else if (typeof exports === 'object' && typeof module !== 'undefined') {
    module.exports = moduleFactory(fetchModule('jquery'));
  }
  // Fallback to global object (e.g., browser window)
  else {
    moduleFactory(currGlobal.JQueryAlias);
  }
})(this, function(JQueryAlias) {
  'use strict';

  /**
   * Interprets a human-readable string to determine cursor hotspot coordinates.
   * This function processes textual descriptors to derive numerical offsets
   * for cursor positioning.
   *
   * Sample configurations:
   * - 'point: middle': Hotspot is centrally located.
   * - 'point: middle left': Vertically centered, horizontally aligned to the left edge.
   * - 'point: upper right': Positioned at the top-right corner.
   * - 'point: center top': Horizontally centered, vertically aligned to the top edge.
   *
   * @param {string} descString   A string representing the desired hotspot location.
   * @param {number} elementDim   The uniform dimension (width/height) of the cursor graphic.
   * @returns {Array<number>} An array containing two numbers: [horizontal_offset, vertical_offset].
   * @throws {Error} If `descString` is not a string or `elementDim` is not a numeric value.
   */
  var extractCursorPointOffsets = function(descString, elementDim) {
    let horizontalOffset = 0;
    let verticalOffset = 0;

    // Validate inputs with more explicit checks and custom error messages
    if (typeof descString !== 'string' || descString.trim() === '') {
      throw new Error('Input descriptor for cursor point must be a non-empty string.');
    }

    if (typeof elementDim !== 'number' || !Number.isFinite(elementDim) || elementDim < 0) {
      throw new Error('Cursor element dimension must be a positive finite number.');
    }

    // Use a map for common terms for better readability and extensibility
    const alignmentMap = {
      'center': 0.5,
      'middle': 0.5, // Alias for center
      'top': 0,
      'bottom': 1,
      'left': 0,
      'right': 1
    };

    // Split and process parts, handling potential multiple spaces and converting to lowercase
    const parts = descString.toLowerCase().split(/\s+/).filter(Boolean);

    // Introduce flags to track if center was applied, to avoid double application
    let isCenteredVertically = false;
    let isCenteredHorizontally = false;

    for (const segment of parts) {
      const multiplier = alignmentMap[segment];

      if (multiplier !== undefined) {
        if (segment === 'center' || segment === 'middle') {
          if (!isCenteredHorizontally) {
            horizontalOffset = elementDim * multiplier;
            isCenteredHorizontally = true;
          }
          if (!isCenteredVertically) {
            verticalOffset = elementDim * multiplier;
            isCenteredVertically = true;
          }
        } else if (['top', 'bottom'].includes(segment)) {
          verticalOffset = elementDim * multiplier;
          isCenteredVertically = true; // Mark as set
        } else if (['left', 'right'].includes(segment)) {
          horizontalOffset = elementDim * multiplier;
          isCenteredHorizontally = true; // Mark as set
        }
      }
    }

    // Add a slight adjustment for 'bottom' and 'right' to match original behavior (cursorSize - 1)
    if (verticalOffset === elementDim) {
        verticalOffset -= 1;
    }
    if (horizontalOffset === elementDim) {
        horizontalOffset -= 1;
    }

    // Return as an array with rounded values for pixel precision
    return [Math.round(horizontalOffset), Math.round(verticalOffset)];
  };

  /**
   * Generates a new HTML canvas element containing a mirrored version
   * of the input canvas content.
   *
   * @param {HTMLCanvasElement} sourceCanvas The original canvas to be mirrored.
   * @param {string} flipMode  The axis/axes along which to flip. Valid options:
   *                           - 'horiz' (horizontal)
   *                           - 'vert' (vertical)
   *                           - 'both' (both horizontal and vertical)
   * @returns {HTMLCanvasElement} A newly created canvas with the flipped image.
   * @throws {Error} if `flipMode` is invalid.
   */
  function createFlippedCanvas(sourceCanvas, flipMode) {
    const validModes = ['horiz', 'vert', 'both'];
    if (!validModes.includes(flipMode)) {
      throw new Error(`Invalid flip mode specified: '${flipMode}'. Must be one of ${validModes.join(', ')}.`);
    }

    // Create a new canvas element directly
    const outputCanvas = document.createElement('canvas');
    const outputContext = outputCanvas.getContext('2d');

    outputCanvas.width = sourceCanvas.width;
    outputCanvas.height = sourceCanvas.height;

    // Determine scaling factors based on the flip mode
    const scaleX = (flipMode === 'horiz' || flipMode === 'both') ? -1 : 1;
    const scaleY = (flipMode === 'vert' || flipMode === 'both') ? -1 : 1;

    // Apply translations before scaling to ensure content is drawn within bounds
    if (scaleX === -1) {
      outputContext.translate(sourceCanvas.width, 0);
    }
    if (scaleY === -1) {
      outputContext.translate(0, sourceCanvas.height);
    }

    // Apply the determined scaling
    outputContext.scale(scaleX, scaleY);

    // Draw the source image onto the transformed context
    outputContext.drawImage(sourceCanvas, 0, 0, sourceCanvas.width, sourceCanvas.height);

    return outputCanvas;
  }

  /**
   * Calculates the new dimensions and hotspot offset for a rotated square canvas.
   * When a square canvas is rotated, its bounding box expands. This function
   * determines the smallest square that can contain the rotated original,
   * and the necessary adjustment for hotspot coordinates.
   *
   * @param {number} originalSize The original side length of the square canvas.
   * @returns {{newSize: number, hotspotAdjustment: number}} Object containing the new side length
   *          for the canvas and the adjustment value for hotspot coordinates.
   */
  function calculateRotatedCanvasMetrics(originalSize) {
      // The new size needs to accommodate the diagonal of the original square
      const newSize = Math.ceil(Math.sqrt(2 * originalSize * originalSize));
      // The hotspot adjustment is the padding added around the original square
      const hotspotAdjustment = (newSize - originalSize) / 2;
      return { newSize, hotspotAdjustment };
  }

  // Helper function for dynamic CSS class generation
  const generateIconClass = (iconName, template) => {
    if (typeof template === 'string') {
      return template.replace(/%s/g, iconName);
    } else if (typeof template === 'function') {
      return template(iconName);
    }
    return iconName; // Fallback to icon name if no template provided
  };


  // Extend JQueryAlias prototype with our custom cursor function
  JQueryAlias.fn.extend({
    iconPointer: function(symbolIdentifier, customSettings) {
      // Define default options for the custom cursor
      const defaultPointerOptions = {
        fillColor: '#000000',
        nominalSize: 20,
        focusPoint: 'center', // Default hotspot is 'center' as a string
        orientation: '', // No flip by default
        rotationDegrees: 0, // No rotation by default
        borderStyle: null, // No outline by default
        graphicFont: {
          familyAlias: 'IconFont',
          classFormat: 'icon-%s'
        }
      };
      // Deep merge custom settings with defaults
      customSettings = JQueryAlias.extend(true, {}, defaultPointerOptions, customSettings);

      // Validate the icon symbol identifier
      if (typeof symbolIdentifier !== 'string' || symbolIdentifier.trim() === '') {
        throw new Error('The first argument must be a non-empty string representing the icon identifier.');
      }

      // Ensure nominalSize is a valid positive number
      if (typeof customSettings.nominalSize === 'string') {
        const parsedSize = parseInt(customSettings.nominalSize, 10);
        if (isNaN(parsedSize) || parsedSize <= 0) {
            throw new Error('Nominal size must be a positive number.');
        }
        customSettings.nominalSize = parsedSize;
      } else if (typeof customSettings.nominalSize !== 'number' || customSettings.nominalSize <= 0) {
          throw new Error('Nominal size must be a positive number.');
      }

      // Process focusPoint (hotspot) string if provided, using our helper
      if (typeof customSettings.focusPoint === 'string') {
        customSettings.focusPoint = extractCursorPointOffsets(customSettings.focusPoint, customSettings.nominalSize);
      }

      // Clamp focusPoint coordinates within valid bounds (0 to nominalSize - 1)
      customSettings.focusPoint = customSettings.focusPoint.map(coordVal => {
        return Math.min(customSettings.nominalSize - 1, Math.max(0, coordVal));
      });

      // Generate the CSS class for the icon
      const computedCssClass = generateIconClass(symbolIdentifier, customSettings.graphicFont.classFormat);

      // Create a temporary off-screen element to measure the icon's computed style
      const tempMeasurer = document.createElement('i');
      tempMeasurer.className = computedCssClass;
      tempMeasurer.style.cssText = 'position: absolute; visibility: hidden; left: -9999px; top: -9999px;';

      // Append to the body to allow browser to compute styles, then retrieve content
      document.body.appendChild(tempMeasurer);
      let iconUnicodeChar = window.getComputedStyle(tempMeasurer, ':before')
          .getPropertyValue('content');
      tempMeasurer.remove(); // Clean up the temporary element

      // Firefox sometimes wraps unicode values in quotes; remove them
      iconUnicodeChar = iconUnicodeChar.replace(/^"|"$/g, '');

      // Initialize canvas dimensions and hotspot offsets
      let effectiveCanvasDim = customSettings.nominalSize;
      // This array stores additional offsets due to outline or rotation
      let additionalHotspotOffset = [0, 0];

      // Adjust canvas size for outline if enabled
      if (customSettings.borderStyle) {
        effectiveCanvasDim += 2; // +1 pixel border on each side
      }

      // Handle rotation: calculate new canvas size and hotspot adjustment
      if (customSettings.rotationDegrees !== 0) {
        const rotationMetrics = calculateRotatedCanvasMetrics(effectiveCanvasDim);
        effectiveCanvasDim = rotationMetrics.newSize;
        additionalHotspotOffset[0] = rotationMetrics.hotspotAdjustment;
        additionalHotspotOffset[1] = rotationMetrics.hotspotAdjustment;
      }

      // Setup the drawing canvas
      let drawingSurface = document.createElement('canvas');
      drawingSurface.width = effectiveCanvasDim;
      drawingSurface.height = effectiveCanvasDim;
      const renderContext = drawingSurface.getContext('2d');

      // Apply rotation transformation if specified
      if (customSettings.rotationDegrees !== 0) {
        renderContext.save(); // Save current context state
        renderContext.translate(drawingSurface.width / 2, drawingSurface.height / 2);
        renderContext.rotate(customSettings.rotationDegrees * Math.PI / 180); // Convert degrees to radians
        renderContext.translate(-drawingSurface.width / 2, -drawingSurface.height / 2);
      }

      // Draw the icon onto the canvas
      renderContext.fillStyle = customSettings.fillColor;
      renderContext.font = `${customSettings.nominalSize}px ${customSettings.graphicFont.familyAlias}`;
      renderContext.textAlign = 'center';
      renderContext.textBaseline = 'middle';

      const centerX = effectiveCanvasDim / 2;
      const centerY = effectiveCanvasDim / 2;
      renderContext.fillText(iconUnicodeChar, centerX, centerY);

      // Apply outline if specified
      if (customSettings.borderStyle) {
        renderContext.lineWidth = 1; // Set outline thickness to 1px
        renderContext.strokeStyle = customSettings.borderStyle;
        renderContext.strokeText(iconUnicodeChar, centerX, centerY);
      }

      // Restore context if rotation was applied
      if (customSettings.rotationDegrees !== 0) {
        renderContext.restore();
      }

      // Apply flipping if specified, using the helper function
      if (customSettings.orientation && customSettings.orientation !== '') {
        drawingSurface = createFlippedCanvas(drawingSurface, customSettings.orientation);
        // Note: if the canvas object is replaced, the context reference might become stale,
        // but for cursor generation, we only need the final drawingSurface.
      }

      // Calculate the final hotspot coordinates considering all adjustments
      const finalHotspotX = customSettings.focusPoint[0] + additionalHotspotOffset[0];
      const finalHotspotY = customSettings.focusPoint[1] + additionalHotspotOffset[1];

      // Generate Data URL from the canvas
      const generatedDataURL = drawingSurface.toDataURL('image/png');

      // Construct the CSS cursor string
      const cursorCssValue = [
        `url("${generatedDataURL}")`, // Data URL for custom image
        Math.round(finalHotspotX), // X-coordinate of hotspot
        Math.round(finalHotspotY), // Y-coordinate of hotspot
        ',', // Separator
        'auto' // Fallback cursor style
      ].join(' ');

      // Apply the custom cursor to the selected elements
      this.css('cursor', cursorCssValue);

      // Maintain chaining for JQueryAlias methods
      return this;
    }
  });

  // Expose configuration defaults for user modification
  JQueryAlias.fn.iconPointer.configurationDefaults = {
    fillColor: '#000000',
    nominalSize: 20,
    focusPoint: 'center',
    orientation: '',
    rotationDegrees: 0,
    borderStyle: null,
    graphicFont: {
      familyAlias: 'IconFont',
      classFormat: 'icon-%s'
    }
  };
});