const designToolkit = {};

const createBoundingBox = (xCoord, yCoord, widthDim, heightDim) => ({ x: xCoord, y: yCoord, width: widthDim, height: heightDim });
const createLayoutElement = (uniqueId, elementType, boundingBox, childElements = [], extraProps = {}) => ({
  identifier: uniqueId,
  kind: elementType,
  box: boundingBox,
  children: childElements,
  properties: extraProps
});

const outputMessage = console.log;

designToolkit.elementProcessor = (() => {
  function* elementTreeIterator(elementCollection) {
    const processQueue = [...elementCollection];
    while (processQueue.length > 0) {
      const currentItem = processQueue.shift();
      yield currentItem;
      if (currentItem.kind === 'group' && currentItem.children && currentItem.children.length > 0) {
        processQueue.push(...currentItem.children);
      }
    }
  }

  const applyOperationToElements = (elements, processingHandler) => {
    for (const currentItem of elementTreeIterator(elements)) {
      outputMessage(`Processing element: ${currentItem.identifier} (${currentItem.kind})`);
      processingHandler(currentItem);
    }
  };

  return {
    applyOperationToElements
  };
})();

designToolkit.globalConfig = (() => {
  let currentDesignEnvironment = {
    page: {
      artboard: {
        verticalRulers: {
          guides: [0, 20, 40]
        },
        layoutSettings: {
          gutterWidth: () => 10,
          columnWidth: () => 60,
          numberOfColumns: () => 12,
          guttersOutside: () => 1
        }
      }
    }
  };

  const retrieveGridUnit = () => {
    const rulerGuides = currentDesignEnvironment.page.artboard.verticalRulers.guides;
    return rulerGuides[1] || 20;
  };

  const updateDesignEnvironment = (environment) => {
    currentDesignEnvironment = environment;
  };

  return {
    retrieveGridUnit,
    updateDesignEnvironment,
    getLayoutConfiguration: () => currentDesignEnvironment.page.artboard.layoutSettings
  };
})();

designToolkit.mathHelpers = (() => {
  const determineScaleFactor = (dimensionValue) => {
    const baseUnit = designToolkit.globalConfig.retrieveGridUnit();
    return Math.max(1, Math.round(dimensionValue / baseUnit));
  };

  return {
    determineScaleFactor
  };
})();

designToolkit.dimensionAdjuster = (() => {
  const adjustHeightOfElement = (targetElement, newHeightValue) => {
    const currentBox = targetElement.box;
    const newBox = createBoundingBox(currentBox.x, currentBox.y, currentBox.width, newHeightValue);
    return { ...targetElement, box: newBox };
  };

  const adjustWidthOfElement = (targetElement, newWidthValue) => {
    const currentBox = targetElement.box;
    const newBox = createBoundingBox(currentBox.x, currentBox.y, newWidthValue, currentBox.height);
    return { ...targetElement, box: newBox };
  };

  const fitToBaselineGrid = (targetElement) => {
    const currentHeight = targetElement.box.height;
    const gridUnit = designToolkit.globalConfig.retrieveGridUnit();
    const heightFactor = designToolkit.mathHelpers.determineScaleFactor(currentHeight);
    const alignedHeight = gridUnit * heightFactor;
    return adjustHeightOfElement(targetElement, alignedHeight);
  };

  const growByGridUnit = (targetElement) => {
    const currentHeight = targetElement.box.height;
    const gridUnit = designToolkit.globalConfig.retrieveGridUnit();
    return adjustHeightOfElement(targetElement, currentHeight + gridUnit);
  };

  const shrinkByGridUnit = (targetElement) => {
    const currentHeight = targetElement.box.height;
    const gridUnit = designToolkit.globalConfig.retrieveGridUnit();
    return adjustHeightOfElement(targetElement, currentHeight - gridUnit);
  };

  return {
    adjustHeightOfElement,
    adjustWidthOfElement,
    fitToBaselineGrid,
    growByGridUnit,
    shrinkByGridUnit
  };
})();

designToolkit.positioningService = (() => {
  const repositionXCoordinate = (targetElement, newXCoord) => {
    const currentBox = targetElement.box;
    const newBox = createBoundingBox(newXCoord, currentBox.y, currentBox.width, currentBox.height);
    return { ...targetElement, box: newBox };
  };

  const repositionYCoordinate = (targetElement, newYCoord) => {
    const currentBox = targetElement.box;
    const newBox = createBoundingBox(currentBox.x, newYCoord, currentBox.width, currentBox.height);
    return { ...targetElement, box: newBox };
  };

  const alignTopToGridline = (targetElement) => {
    const elementY = targetElement.box.y;
    const gridUnit = designToolkit.globalConfig.retrieveGridUnit();
    const yFactor = designToolkit.mathHelpers.determineScaleFactor(elementY);
    const alignedY = gridUnit * yFactor;
    outputMessage("_____________________________________");
    outputMessage(`Grid Unit: ${gridUnit}`);
    outputMessage(`Y Factor: ${yFactor}`);
    outputMessage(`Current element y position: ${elementY}`);
    outputMessage(`New y position: ${alignedY}`);
    return repositionYCoordinate(targetElement, alignedY);
  };

  const alignBottomToGridline = (targetElement) => {
    const elementHeight = targetElement.box.height;
    const elementY1 = targetElement.box.y;
    const elementY2 = elementY1 + elementHeight;

    const gridUnit = designToolkit.globalConfig.retrieveGridUnit();
    const y2Factor = designToolkit.mathHelpers.determineScaleFactor(elementY2);
    const newY1 = (y2Factor * gridUnit) - elementHeight;
    return repositionYCoordinate(targetElement, newY1);
  };

  const shiftTopToNextGridline = (targetElement) => {
    const elementY = targetElement.box.y;
    const gridUnit = designToolkit.globalConfig.retrieveGridUnit();
    const nextAlignedY = Math.floor(elementY / gridUnit) * gridUnit + gridUnit;
    return repositionYCoordinate(targetElement, nextAlignedY);
  };

  const shiftBottomToNextGridline = (targetElement) => {
    const elementHeight = targetElement.box.height;
    const elementY1 = targetElement.box.y;
    const elementY2 = elementY1 + elementHeight;
    const gridUnit = designToolkit.globalConfig.retrieveGridUnit();

    const nextAlignedY2 = Math.floor(elementY2 / gridUnit) * gridUnit + gridUnit;
    const newY1 = nextAlignedY2 - elementHeight;
    return repositionYCoordinate(targetElement, newY1);
  };

  const shiftTopToPreviousGridline = (targetElement) => {
    const elementY = targetElement.box.y;
    const gridUnit = designToolkit.globalConfig.retrieveGridUnit();
    const prevAlignedY = Math.ceil(elementY / gridUnit) * gridUnit - gridUnit;
    return repositionYCoordinate(targetElement, prevAlignedY);
  };

  const shiftBottomToPreviousGridline = (targetElement) => {
    const elementHeight = targetElement.box.height;
    const elementY1 = targetElement.box.y;
    const elementY2 = elementY1 + elementHeight;
    const gridUnit = designToolkit.globalConfig.retrieveGridUnit();

    const prevAlignedY2 = Math.ceil(elementY2 / gridUnit) * gridUnit - gridUnit;
    const newY1 = prevAlignedY2 - elementHeight;
    return repositionYCoordinate(targetElement, newY1);
  };

  return {
    repositionXCoordinate,
    repositionYCoordinate,
    alignTopToGridline,
    alignBottomToGridline,
    shiftTopToNextGridline,
    shiftBottomToNextGridline,
    shiftTopToPreviousGridline,
    shiftBottomToPreviousGridline
  };
})();

designToolkit.typographyTools = (() => {
  const adjustLineSpacingToGrid = (textElement) => {
    const gridUnit = designToolkit.globalConfig.retrieveGridUnit();
    const currentFontSize = textElement.properties.fontSize;
    const newLineSpacing = (currentFontSize > gridUnit)
      ? Math.ceil(currentFontSize / gridUnit) * gridUnit
      : gridUnit;

    return {
      ...textElement,
      properties: { ...textElement.properties, lineSpacing: newLineSpacing }
    };
  };

  return {
    adjustLineSpacingToGrid
  };
})();

designToolkit.colorManager = (() => {
  const generateColorFromHex = (hexCode, transparencyValue) => {
    const cleanedHex = hexCode.startsWith('#') ? hexCode.slice(1) : hexCode;
    const redVal = parseInt(cleanedHex.substring(0, 2), 16);
    const greenVal = parseInt(cleanedHex.substring(2, 4), 16);
    const blueVal = parseInt(cleanedHex.substring(4, 6), 16);
    return { red: redVal / 255, green: greenVal / 255, blue: blueVal / 255, alpha: transparencyValue, hex: cleanedHex };
  };

  const produceMonochromaticScheme = (primaryColor, reductionFactor) => {
    const scheme = [primaryColor];
    const tintFactors = [0.8, 0.4];
    const shadeFactors = [0.6, 0.3];

    const { red, green, blue, alpha } = primaryColor;

    const tints = tintFactors.map(factor => ({
      red: red + (1 - red) * factor,
      green: green + (1 - green) * factor,
      blue: blue + (1 - blue) * factor,
      alpha: alpha
    }));

    const shades = shadeFactors.map(factor => ({
      red: red * factor,
      green: green * factor,
      blue: blue * factor,
      alpha: alpha
    }));

    return [...scheme, ...tints, ...shades];
  };

  return {
    generateColorFromHex,
    produceMonochromaticScheme
  };
})();

designToolkit.dataFetcher = (() => {
  const performNetworkRequest = async (resourceURL, methodType) => {
    try {
      const response = await fetch(resourceURL, { method: methodType });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return await response.text();
    } catch (error) {
      outputMessage(`Network request failed: ${error}`);
      return null;
    }
  };

  return {
    performNetworkRequest
  };
})();

designToolkit.thirdPartyIntegrations = (() => {
  const extractPaletteFromJSON = (jsonData) => {
    const parsedData = JSON.parse(jsonData);
    const paletteCount = parsedData.length;

    if (paletteCount === 0) return [];

    const selectedPaletteIndex = Math.floor(Math.random() * paletteCount);
    const chosenPalette = parsedData[selectedPaletteIndex];

    const colors = chosenPalette.colors.map(hex =>
      designToolkit.colorManager.generateColorFromHex(hex, 1.0)
    );

    return colors;
  };

  return {
    extractPaletteFromJSON
  };
})();

designToolkit.layoutGrid = (() => {
  const createGridColumn = (startCoord, endCoord) => ({
    startCoordinate: startCoord,
    endCoordinate: endCoord
  });

  const createGridSystem = (layoutConfiguration) => {
    const gutterDimension = layoutConfiguration.gutterWidth();
    const columnDimension = layoutConfiguration.columnWidth();
    const columnCount = layoutConfiguration.numberOfColumns();
    const hasExternalGutters = layoutConfiguration.guttersOutside() === 1;

    const generateColumns = () => {
      const generatedColumns = [];
      let currentX = 0;
      if (hasExternalGutters) {
        currentX += gutterDimension / 2;
      }

      for (let i = 0; i < columnCount; i++) {
        const columnStart = currentX;
        const columnEnd = currentX + columnDimension;
        generatedColumns.push(createGridColumn(columnStart, columnEnd));
        currentX = columnEnd + gutterDimension;
      }
      return generatedColumns;
    };

    const columns = generateColumns();
    const totalGridWidth = columns.reduce((acc, col) => acc + (col.endCoordinate - col.startCoordinate), 0)
                                + (columns.length > 1 ? (columns.length - 1) * gutterDimension : 0)
                                + (hasExternalGutters ? gutterDimension : 0);

    const gridConfiguration = {
      gutterDimension,
      columnDimension,
      columnCount,
      hasExternalGutters,
      allColumns: columns,
      totalDimension: totalGridWidth,
      displayInfo: () => {
        let info = `Column Width: ${columnDimension} || Gutter Width: ${gutterDimension} `;
        columns.forEach(col => {
          info += `{S:${col.startCoordinate},E:${col.endCoordinate}}`;
        });
        info += ` External Gutters: ${hasExternalGutters}`;
        return info;
      },
      findClosestStartLineIndex: (elementBox) => {
        const elementX = elementBox.x;
        let closestIndex = -1;
        let minDiff = Infinity;
        for (let i = 0; i < columns.length; i++) {
          const diff = Math.abs(columns[i].startCoordinate - elementX);
          if (diff < minDiff) {
            minDiff = diff;
            closestIndex = i;
          }
        }
        return closestIndex;
      },
      findClosestEndLineIndex: (elementBox) => {
        const elementX2 = elementBox.x + elementBox.width;
        let closestIndex = -1;
        let minDiff = Infinity;
        for (let i = 0; i < columns.length; i++) {
          const diff = Math.abs(columns[i].endCoordinate - elementX2);
          if (diff < minDiff) {
            minDiff = diff;
            closestIndex = i;
          }
        }
        return closestIndex;
      }
    };

    return gridConfiguration;
  };

  const alignStartEdgeToNearestGridline = (gridConfig, targetElement) => {
    const nearestIndex = gridConfig.findClosestStartLineIndex(targetElement.box);
    if (nearestIndex === -1) return targetElement;
    const targetStart = gridConfig.allColumns[nearestIndex].startCoordinate;
    return designToolkit.positioningService.repositionXCoordinate(targetElement, targetStart);
  };

  const alignEndEdgeToNearestGridline = (gridConfig, targetElement) => {
    const nearestIndex = gridConfig.findClosestEndLineIndex(targetElement.box);
    if (nearestIndex === -1) return targetElement;
    const elementRight = targetElement.box.x + targetElement.box.width;
    const targetEnd = gridConfig.allColumns[nearestIndex].endCoordinate;
    const xOffset = targetEnd - elementRight;
    return designToolkit.positioningService.repositionXCoordinate(targetElement, targetElement.box.x + xOffset);
  };

  const alignStartEdgeToNextGridline = (gridConfig, targetElement) => {
    const currentX = targetElement.box.x;
    let nextIndex = gridConfig.findClosestStartLineIndex(targetElement.box);
    if (nextIndex === -1 || gridConfig.allColumns[nextIndex].startCoordinate <= currentX) {
      nextIndex = (nextIndex + 1) % gridConfig.allColumns.length;
    }
    const targetStart = gridConfig.allColumns[nextIndex].startCoordinate;
    return designToolkit.positioningService.repositionXCoordinate(targetElement, targetStart);
  };

  const alignEndEdgeToNextGridline = (gridConfig, targetElement) => {
    const elementRight = targetElement.box.x + targetElement.box.width;
    let nextIndex = gridConfig.findClosestEndLineIndex(targetElement.box);
    if (nextIndex === -1 || gridConfig.allColumns[nextIndex].endCoordinate <= elementRight) {
      nextIndex = (nextIndex + 1) % gridConfig.allColumns.length;
    }
    const targetEnd = gridConfig.allColumns[nextIndex].endCoordinate;
    const xOffset = targetEnd - elementRight;
    return designToolkit.positioningService.repositionXCoordinate(targetElement, targetElement.box.x + xOffset);
  };

  const alignStartEdgeToPreviousGridline = (gridConfig, targetElement) => {
    const currentX = targetElement.box.x;
    let prevIndex = gridConfig.findClosestStartLineIndex(targetElement.box);
    if (prevIndex === -1 || gridConfig.allColumns[prevIndex].startCoordinate >= currentX) {
      prevIndex = (prevIndex - 1 + gridConfig.allColumns.length) % gridConfig.allColumns.length;
    }
    const targetStart = gridConfig.allColumns[prevIndex].startCoordinate;
    return designToolkit.positioningService.repositionXCoordinate(targetElement, targetStart);
  };

  const alignEndEdgeToPreviousGridline = (gridConfig, targetElement) => {
    const elementRight = targetElement.box.x + targetElement.box.width;
    let prevIndex = gridConfig.findClosestEndLineIndex(targetElement.box);
    if (prevIndex === -1 || gridConfig.allColumns[prevIndex].endCoordinate >= elementRight) {
      prevIndex = (prevIndex - 1 + gridConfig.allColumns.length) % gridConfig.allColumns.length;
    }
    const targetEnd = gridConfig.allColumns[prevIndex].endCoordinate;
    const xOffset = targetEnd - elementRight;
    return designToolkit.positioningService.repositionXCoordinate(targetElement, targetElement.box.x + xOffset);
  };

  return {
    createGridSystem,
    alignStartEdgeToNearestGridline,
    alignEndEdgeToNearestGridline,
    alignStartEdgeToNextGridline,
    alignEndEdgeToNextGridline,
    alignStartEdgeToPreviousGridline,
    alignEndEdgeToPreviousGridline
  };
})();

designToolkit.userInteraction = {
  displayNotification: (messageContent, messageTitle) => {
    outputMessage(`NOTIFICATION: ${messageTitle} - ${messageContent}`);
  }
};

const mockDocumentInterface = {
  currentPage: () => ({
    currentArtboard: () => ({
      verticalRulerData: {
        guideAtIndex: (idx) => [0, 20, 40][idx]
      },
      layout: designToolkit.globalConfig.getLayoutConfiguration()
    })
  })
};

designToolkit.globalConfig.updateDesignEnvironment({
  page: {
    artboard: {
      verticalRulers: {
        guides: [
          mockDocumentInterface.currentPage().currentArtboard().verticalRulerData.guideAtIndex(0),
          mockDocumentInterface.currentPage().currentArtboard().verticalRulerData.guideAtIndex(1)
        ]
      },
      layoutSettings: mockDocumentInterface.currentPage().currentArtboard().layout
    }
  }
});