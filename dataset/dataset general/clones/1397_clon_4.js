;(function(globalScope, moduleCreator) {
  if (typeof define === 'function' && define.amd) {
    define(['jquery'], moduleCreator);
  } else if (typeof exports === 'object') {
    moduleCreator(require('jquery'));
  } else {
    moduleCreator(globalScope.jQuery);
  }
})(this, function(jq) {
  'use strict';

  const derivePointerOffsets = (descriptorText, dimensionVal) => {
    if (typeof descriptorText !== 'string') {
      throw new TypeError('Descriptor for pointer location must be a string.');
    }
    if (typeof dimensionVal !== 'number' || isNaN(dimensionVal)) {
      throw new TypeError('Dimension value must be a number.');
    }

    const offsetAdjusters = {
      'center': (currentX, currentY, size) => [size / 2, size / 2],
      'top': (currentX, currentY, size) => [currentX, 0],
      'bottom': (currentX, currentY, size) => [currentX, size - 1],
      'left': (currentX, currentY, size) => [0, currentY],
      'right': (currentX, currentY, size) => [size - 1, currentY]
    };

    const finalOffsets = descriptorText.split(/\s+/).reduce((accumulatedOffsets, partKey) => {
      const handlerFn = offsetAdjusters[partKey];
      return handlerFn ? handlerFn(accumulatedOffsets[0], accumulatedOffsets[1], dimensionVal) : accumulatedOffsets;
    }, [0, 0]);

    return finalOffsets;
  };

  const transformDrawingSurface = (inputSurface, orientationKey) => {
    const validOrientations = new Set(['horizontal', 'vertical', 'both']);
    if (!validOrientations.has(orientationKey)) {
      throw new Error(`Invalid orientation key: '${orientationKey}'. Must be one of 'horizontal', 'vertical', or 'both'.`);
    }

    const outputSurface = document.createElement('canvas');
    const surfaceWidth = inputSurface.width;
    const surfaceHeight = inputSurface.height;

    outputSurface.width = surfaceWidth;
    outputSurface.height = surfaceHeight;

    const renderingAgent = outputSurface.getContext('2d');

    const transformationMatrices = {
      'horizontal': [
        -1, 0,
        0, 1,
        surfaceWidth, 0
      ],
      'vertical': [
        1, 0,
        0, -1,
        0, surfaceHeight
      ],
      'both': [
        -1, 0,
        0, -1,
        surfaceWidth, surfaceHeight
      ]
    };

    const matrix = transformationMatrices[orientationKey];
    renderingAgent.setTransform(...matrix);

    renderingAgent.drawImage(inputSurface, 0, 0, surfaceWidth, surfaceHeight);

    return outputSurface;
  };

  const prepareRenderSurface = (config, initialSize) => {
    let currentSurfaceSize = initialSize;
    let adjustedFocalPoint = [...config.focalPoint];

    if (config.outlineThickness) {
      currentSurfaceSize += 2;
    }

    const outputCanvas = document.createElement('canvas');
    const drawingContext = outputCanvas.getContext('2d');

    if (config.rotationDegrees) {
      const rotatedDimension = Math.ceil(Math.SQRT2 * currentSurfaceSize);
      const sizeDifference = (rotatedDimension - currentSurfaceSize) / 2;

      outputCanvas.width = rotatedDimension;
      outputCanvas.height = rotatedDimension;

      drawingContext.translate(rotatedDimension / 2, rotatedDimension / 2);
      drawingContext.rotate(config.rotationDegrees * Math.PI / 180);
      drawingContext.translate(-rotatedDimension / 2, -rotatedDimension / 2);

      if (currentSurfaceSize > 0) {
        adjustedFocalPoint[0] += (adjustedFocalPoint[0] !== currentSurfaceSize / 2) ? sizeDifference : 0;
        adjustedFocalPoint[1] += (adjustedFocalPoint[1] !== currentSurfaceSize / 2) ? sizeDifference : 0;
      }
    } else {
      outputCanvas.width = currentSurfaceSize;
      outputCanvas.height = currentSurfaceSize;
    }

    return {
      canvas: outputCanvas,
      context: drawingContext,
      logicalContentSize: currentSurfaceSize,
      adjustedFocalPoint: adjustedFocalPoint
    };
  };

  jq.fn.visualPointer = function(symbolIdentifier, configurationObj) {
    const activeConfig = Object.assign({}, jq.fn.visualPointer.defaultSettings, configurationObj);

    if (typeof symbolIdentifier !== 'string' || !symbolIdentifier) {
      throw new Error('First argument must be a non-empty string representing the icon symbol.');
    }

    activeConfig.indicatorDimension = typeof activeConfig.indicatorDimension === 'string' ?
      parseInt(activeConfig.indicatorDimension, 10) : activeConfig.indicatorDimension;

    if (typeof activeConfig.focalPointDescriptor === 'string') {
      activeConfig.focalPoint = derivePointerOffsets(activeConfig.focalPointDescriptor, activeConfig.indicatorDimension);
    }

    activeConfig.focalPoint = activeConfig.focalPoint.map(coordinate =>
      Math.min(activeConfig.indicatorDimension - 1, Math.max(0, coordinate))
    );

    const iconClass = (function(name, template) {
      if (typeof template === 'string') {
        return template.replace(/%s/g, name);
      } else if (typeof template === 'function') {
        return template(name);
      }
      return name;
    })(symbolIdentifier, activeConfig.visualFont.classPattern);

    const tempElement = document.createElement('i');
    tempElement.className = iconClass;
    tempElement.style.cssText = 'position: absolute; left: -9999px; top: -9999px;';

    document.body.appendChild(tempElement);

    let iconCharacter = window.getComputedStyle(tempElement, ':before').getPropertyValue('content');
    tempElement.remove();

    iconCharacter = iconCharacter.replace(/"/g, '');

    let {
      canvas: renderSurface,
      context: drawingAgent,
      logicalContentSize,
      adjustedFocalPoint: finalFocalPoint
    } = prepareRenderSurface(activeConfig, activeConfig.indicatorDimension);

    drawingAgent.fillStyle = activeConfig.renderColor;
    drawingAgent.font = `${activeConfig.indicatorDimension}px ${activeConfig.visualFont.fontFamily}`;
    drawingAgent.textAlign = 'center';
    drawingAgent.textBaseline = 'middle';
    drawingAgent.fillText(iconCharacter, renderSurface.width / 2, renderSurface.height / 2);

    if (activeConfig.outlineThickness) {
      drawingAgent.lineWidth = 0.5;
      drawingAgent.strokeStyle = activeConfig.outlineThickness;
      drawingAgent.strokeText(iconCharacter, renderSurface.width / 2, renderSurface.height / 2);
    }

    if (activeConfig.orientationFlip) {
      renderSurface = transformDrawingSurface(renderSurface, activeConfig.orientationFlip);
    }

    const imageDataURL = renderSurface.toDataURL('image/png');

    this.each(function() {
      this.style.cursor = `url(${imageDataURL}) ${finalFocalPoint[0]} ${finalFocalPoint[1]}, auto`;
    });

    return this;
  };

  jq.fn.visualPointer.defaultSettings = {
    renderColor: '#000000',
    indicatorDimension: 18,
    focalPoint: [0, 0],
    focalPointDescriptor: '',
    orientationFlip: '',
    rotationDegrees: 0,
    outlineThickness: null,
    visualFont: {
      fontFamily: 'FontAwesome',
      classPattern: 'fa fa-%s'
    }
  };
});