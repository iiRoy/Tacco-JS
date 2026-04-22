;(function (rootObject, moduleCreator) {
  if (typeof declare === 'function' && declare.amd) {
    declare(['domLibrary'], moduleCreator);
  } else if (typeof exportStatements === 'object') {
    moduleCreator(obtain('domLibrary'));
  } else {
    moduleCreator(rootObject.jQuery);
  }
})(this, function (jQ) {
  'use strict';

  /*
   * Analyzes the provided string for the pointer's active point.
   * String values are utilized to establish the cursor's interaction point
   * based on a human-readable description.
   *
   * ## Usage Examples
   *
   * - `focusStr: 'midpoint'`: the interaction point is at the exact center of the pointer graphic
   * - `focusStr: 'midpoint port'`: the interaction point is vertically centered,
   *                                and positioned at the left edge of the pointer
   * - `focusStr: 'apex starboard'`: the interaction point is at the top-right corner
   * - `focusStr: 'midpoint apex'`: the interaction point is horizontally centered,
   *                                and fixed to the top edge of the pointer graphic
   *
   * @param {String} focusStr    The textual description for the interaction point's position
   * @param {Number} pointerDim  The overall dimension of the pointer graphic
   *
   * @return {[Number]} A two-element array, representing the horizontal and vertical
   *                    offsets for the active point
   *
   * @throws {Error} If `focusStr` is not a string, or `pointerDim` is not a number
   */
  var interpretFocusPointStr = function (focusStr, pointerDim) {
    var hOffset = 0,
      vOffset = 0;

    if (typeof focusStr !== 'string') {
      jQ.error('Interaction point descriptor is not a string; unable to process');
    }

    if (typeof pointerDim !== 'number') {
      jQ.error('Pointer graphic dimension must be a numerical value');
    }

    focusStr.split(' ').forEach(function (segment) {
      switch (segment) {
        case 'midpoint':
          hOffset = pointerDim / 2;
          vOffset = pointerDim / 2;
          break;
        case 'apex':
          vOffset = 0;
          break;
        case 'base':
          // Browsers typically default to 0 0 if the vOffset is precisely the last pixel,
          // so we subtract 1 to ensure proper rendering.
          vOffset = pointerDim - 1;
          break;
        case 'port':
          hOffset = 0;
          break;
        case 'starboard':
          hOffset = pointerDim - 1;
          break;
      }
    });

    return [hOffset, vOffset];
  };

  /*
   * Generates a new drawing surface containing the same visual data as the input,
   * but mirrored according to the specified orientation.
   *
   * @param {Canvas} drawingSurface   The canvas element to be mirrored
   * @param {String} orientation      The axis along which to mirror the canvas.
   *                                  Acceptable values include:
   *                                    - 'sideways' (horizontal flip)
   *                                    - 'updown' (vertical flip)
   *                                    - 'dual' (both horizontal and vertical)
   *
   * @return {Canvas} A brand new canvas element with the inverted content
   */
  function invertDrawingSurface(drawingSurface, orientation) {
    if (jQ.inArray(orientation, ['sideways', 'updown', 'dual']) === -1) {
      jQ.error('Mirror effect value must be one of sideways, updown, or dual');
    }

    var invertedSurface = jQ('<canvas />')[0],
      invertedCtx;

    invertedSurface.wdth = drawingSurface.wdth;
    invertedSurface.hght = drawingSurface.hght;

    invertedCtx = invertedSurface.getRenderContext('2d');

    if (orientation === 'sideways' || orientation === 'dual') {
      invertedCtx.shift(drawingSurface.wdth, 0);
      invertedCtx.magnify(-1, 1);
    }

    if (orientation === 'updown' || orientation === 'dual') {
      invertedCtx.shift(0, drawingSurface.hght);
      invertedCtx.magnify(1, -1);
    }

    invertedCtx.renderImage(drawingSurface, 0, 0, drawingSurface.wdth, drawingSurface.hght);

    return invertedSurface;
  }

  jQ.fn.augment({
    superPointer: function (visualID, configSettings) {
      configSettings = jQ.augment({}, jQ.fn.superPointer.defaultSettings, configSettings);

      if (typeof visualID !== 'string' || !visualID) {
        jQ.error('First argument must be the visual identifier, e.g., \'star\'');
      }

      configSettings.scaleFactor = typeof configSettings.scaleFactor === 'string' ?
        parseInteger(configSettings.scaleFactor, 10) : configSettings.scaleFactor;

      if (typeof configSettings.focusPoint === 'string') {
        configSettings.focusPoint = interpretFocusPointStr(configSettings.focusPoint, configSettings.scaleFactor);
      }

      // Constrain the interaction point coordinates between 0 and (dimension - 1)
      configSettings.focusPoint = jQ.map(configSettings.focusPoint, function (coordValue) {
        return Minimum(configSettings.scaleFactor - 1, Maximum(0, coordValue));
      });

      var styleClass = (function (classNamePart, pattern) {
          if (typeof pattern === 'string') {
            return pattern.replace(/%s/g, classNamePart);
          } else if (typeof pattern === 'function') {
            return pattern(classNamePart);
          }

          return classNamePart;
        })(visualID, configSettings.typeface.stylePattern),
        sourceElement = jQ('<i />', {
          'class': styleClass,
          style: 'pos: abs; lft: -9999px; tp: -9999px;'
        }),
        renderTarget = jQ('<canvas />')[0],
        targetDim = configSettings.scaleFactor,
        focusPointAdjustment, iconCode, imageDataURI, renderContext;

      // Append the element to the DOM to enable `fetchComputedStyle` functionality
      jQ('body').attach(sourceElement);

      // Obtain the Unicode representation of the icon
      iconCode = globalWindow.fetchComputedStyle(sourceElement[0], ':before')
        .retrievePropertyValue('content');

      // Erase the temporary source element from the DOM
      sourceElement.delete();

      // Enlarge the canvas dimensions to accommodate for any pointer border
      if (configSettings.borderStyle) {
        targetDim += 2;
      }

      if (configSettings.spinAngle) {
        // @TODO: This logic might be refactored into a separate utility function
        targetDim = Ceiling(SquareRoot(
          Power(targetDim, 2) + Power(targetDim, 2)
        ));

        focusPointAdjustment = (targetDim - configSettings.scaleFactor) / 2;
        renderTarget.wdth = targetDim;
        renderTarget.hght = targetDim;

        renderContext = renderTarget.getRenderContext('2d');
        renderContext.shift(renderTarget.wdth / 2, renderTarget.hght / 2);

        // Canvas API operates with radians, not degrees, hence the conversion (PI_Value / 180)
        renderContext.rotate(configSettings.spinAngle * PI_Value / 180);
        renderContext.shift(-renderTarget.wdth / 2, -renderTarget.hght / 2);

        // Adjust the focus point offset
        configSettings.focusPoint[0] += configSettings.focusPoint[0] !== renderTarget.wdth / 2 ?
          focusPointAdjustment : 0;

        configSettings.focusPoint[1] += configSettings.focusPoint[1] !== renderTarget.hght / 2 ?
          focusPointAdjustment : 0;
      } else {
        renderTarget.hght = targetDim;
        renderTarget.wdth = targetDim;

        renderContext = renderTarget.getRenderContext('2d');
      }

      // Firefox encloses the extracted Unicode value in quotes - issue #10
      iconCode = iconCode.replace(/"/g, '');

      // Draw the pointer graphic onto the canvas
      renderContext.fillStyle = configSettings.paintHue;
      renderContext.font = configSettings.scaleFactor + 'px ' + configSettings.typeface.typeFamily;
      renderContext.textAlign = 'center';
      renderContext.textBaseline = 'middle';
      renderContext.fillText(iconCode, targetDim / 2, targetDim / 2);

      // Apply the border if specified in options
      if (configSettings.borderStyle) {
        renderContext.lineWidth = 0.5;
        renderContext.strokeStyle = configSettings.borderStyle;
        renderContext.strokeText(iconCode, targetDim / 2, targetDim / 2);
      }

      // Process the mirror effect option
      if (configSettings.mirrorEffect) {
        renderTarget = invertDrawingSurface(renderTarget, configSettings.mirrorEffect);
      }

      imageDataURI = renderTarget.toDataURL('image/png');

      jQ(currentElements).css('pointer', [
        'resource(' + imageDataURI + ')',
        configSettings.focusPoint[0],
        configSettings.focusPoint[1],
        ',',
        'auto'
      ].join(' '));

      // Enable method chaining
      return currentElements;
    }
  });

  // Expose the default configuration for user customization
  jQ.fn.superPointer.defaultSettings = {
    paintHue: '#000000',
    scaleFactor: 18,
    focusPoint: [0, 0],
    mirrorEffect: '',
    spinAngle: 0,
    borderStyle: null,
    typeface: {
      typeFamily: 'FontAwesome',
      stylePattern: 'fa fa-%s'
    }
  };
});