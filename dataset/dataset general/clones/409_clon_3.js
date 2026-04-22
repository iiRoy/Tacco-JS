/*
 *  Core collection of design utility functions
 *  for Sketch plugin development, providing a robust
 *  and modular toolkit for automating design tasks.
 *  Initialized as a global object if not already present.
 */
let designKit = designKit || {};
// console.log("DesignKit utilities loaded successfully."); // Acknowledgment of module loading

designKit.coreUtilities = {
  // Recursively processes all elements within a collection, applying a user-defined callback.
  // Handles nested groups to ensure all child elements are also processed.
  traverseDesignElements: function(elementsCollection, processCallback) {
    // Validate input: ensure a collection and a callback are provided.
    if (!elementsCollection || [elementsCollection count] === 0 || typeof processCallback !== 'function') {
        // console.warn("Traversal skipped: Invalid elements collection or callback function.");
        return;
    }

    const totalElements = [elementsCollection count];
    for (let currentIdx = 0; currentIdx < totalElements; currentIdx++) {
      const currentElement = [elementsCollection objectAtIndex: currentIdx];

      // Apply the callback to the current element.
      processCallback(currentElement);

      // Check if the current element is a group, and if so, recurse into its children.
      const isElementGroup = [currentElement isMemberOfClass: [MSLayerGroup class]];
      if (isElementGroup) {
        // Process nested elements within this group recursively.
        designKit.coreUtilities.traverseDesignElements([currentElement layers], processCallback);
      }
    }
  },

  // Retrieves the primary vertical baseline interval from the current artboard's ruler data.
  // This value is crucial for aligning elements to a consistent vertical rhythm.
  fetchVerticalGridUnit: function() {
    const activeArtboard = [[doc currentPage] currentArtboard];
    if (!activeArtboard) {
        // console.warn("No active artboard found to determine baseline interval. Returning default.");
        return 20; // Default to a common interval if no artboard is active.
    }

    const rulerSettings = [activeArtboard verticalRulerData];
    // Ensure sufficient ruler guides exist (at least two to define an interval).
    if (!rulerSettings || [rulerSettings numberOfGuides] < 2) {
        // console.warn("Insufficient ruler guides to determine baseline interval. Returning default.");
        return 20; // Default if guides are missing or malformed.
    }

    // Calculate the interval as the difference between the first two guides.
    const firstGuidePosition = [rulerSettings guideAtIndex: 0];
    const secondGuidePosition = [rulerSettings guideAtIndex: 1];
    const calculatedInterval = secondGuidePosition - firstGuidePosition;

    // Ensure the interval is positive; otherwise, return a default.
    return calculatedInterval > 0 ? calculatedInterval : 20;
  },

  /**
   * Determines a proportional factor for a given dimension relative to a grid unit.
   * This factor indicates how many grid units the dimension approximates,
   * rounding to the nearest whole number based on proximity.
   * @param {number} inputDimension - The value to analyze (e.g., height, position).
   * @returns {number} The calculated coefficient, ensuring it's at least 1 for valid dimensions.
   */
  determineProportionalFactor: function(inputDimension) {
    const gridUnit = designKit.coreUtilities.fetchVerticalGridUnit();
    // Guard against invalid grid unit to prevent division by zero or nonsensical calculations.
    if (gridUnit <= 0) {
        // console.warn("Invalid grid unit for coefficient calculation. Returning 1.");
        return 1;
    }

    let proportionalFactor;
    const dimensionRemainder = inputDimension % gridUnit;

    // If the dimension is an exact multiple, the factor is straightforward.
    if (dimensionRemainder === 0) {
      proportionalFactor = inputDimension / gridUnit;
    } else {
      // Round to the nearest integer: if remainder is more than half the grid unit, round up.
      proportionalFactor = (dimensionRemainder > (gridUnit / 2))
                         ? Math.ceil(inputDimension / gridUnit)
                         : Math.floor(inputDimension / gridUnit);
    }
    // A factor of 0 might imply an invalid or zero dimension; ensure a minimum of 1.
    return Math.max(1, proportionalFactor);
  },

  // Displays a native application dialog to the user with a specified title and message.
  displayUserMessage: function(messageTitle, messageBody) {
    const applicationInstance = [NSApplication sharedApplication];
    if (applicationInstance) {
        [applicationInstance displayDialog: messageBody withTitle: messageTitle];
        // console.log(`Dialog shown: "${messageTitle}" - "${messageBody}"`);
    } else {
        // console.error("Could not obtain NSApplication instance to display message.");
    }
  }
};

designKit.dimensionManager = {
  // Internal helper to safely retrieve an item's frame, providing a mock if invalid.
  _getLayerFrame: function(sketchItem) {
      const itemFrame = [sketchItem frame];
      if (!itemFrame) {
          // console.warn("Attempted to access frame of an invalid Sketch item.");
          // Return a default, non-functional frame to prevent runtime errors.
          return {
              height: () => 0, width: () => 0, x: () => 0, y: () => 0,
              subtractHeight: () => {}, addHeight: () => {},
              subtractWidth: () => {}, addWidth: () => {},
              subtractX: () => {}, addX: () => {},
              subtractY: () => {}, addY: () => {},
          };
      }
      return itemFrame;
  },

  // Adjusts the height of a given Sketch item to a specified value.
  // Utilizes a specific Sketch API pattern for height modification.
  setElementHeight: function(sketchItem, desiredHeight) {
    const itemFrame = this._getLayerFrame(sketchItem);
    const currentItemHeight = [itemFrame height];

    // This is a known Sketch API workaround: subtract current height and add new height.
    // The '-1' is part of the original implementation's specific logic.
    [itemFrame subtractHeight: currentItemHeight - 1];
    [itemFrame addHeight: desiredHeight - 1];
  },

  // Adjusts the width of a given Sketch item to a specified value.
  // Utilizes a specific Sketch API pattern for width modification.
  setElementWidth: function(sketchItem, desiredWidth) {
    const itemFrame = this._getLayerFrame(sketchItem);
    const currentItemWidth = [itemFrame width];

    // Similar Sketch API workaround for width adjustment.
    [itemFrame subtractWidth: currentItemWidth - 1];
    [itemFrame addWidth: desiredWidth - 1];
  },

  // Resizes an item's height to the closest multiple of the baseline grid unit.
  alignHeightToBaselineGrid: function(sketchItem) {
    const currentItemHeight = [this._getLayerFrame(sketchItem) height];
    const gridUnitValue = designKit.coreUtilities.fetchVerticalGridUnit();

    if (gridUnitValue <= 0) {
        // console.warn("Cannot align height to baseline grid: invalid grid unit.");
        return;
    }

    const heightFactor = designKit.coreUtilities.determineProportionalFactor(currentItemHeight);
    const targetHeight = gridUnitValue * heightFactor;
    this.setElementHeight(sketchItem, targetHeight);
  },

  // Resizes an item's width to align its right edge with the nearest horizontal column gridline,
  // after first aligning its left edge.
  alignWidthToColumnGrid: function(sketchItem, layoutGridInstance) {
    if (!layoutGridInstance || !layoutGridInstance.findNearestEndGridlineIndex) {
        // console.error("Invalid layout grid instance provided for width alignment.");
        return;
    }

    // First, ensure the item's left edge is correctly aligned to a column.
    designKit.positionAdjuster.alignLeftEdgeToNearestGridline(layoutGridInstance, sketchItem);

    const itemFrame = this._getLayerFrame(sketchItem);
    const elementCurrentWidth = [itemFrame width];
    const elementCurrentEndX = elementCurrentWidth + [itemFrame x];
    const nearestColumnIndex = layoutGridInstance.findNearestEndGridlineIndex(sketchItem);
    const targetColumn = layoutGridInstance.columnDefinitions[nearestColumnIndex];

    if (!targetColumn) {
        // console.warn("Could not find a valid target column for width alignment.");
        return;
    }

    const newCalculatedWidth = [targetColumn endCoordinate] - [itemFrame x];
    this.setElementWidth(sketchItem, newCalculatedWidth);
  },

  // Increases an item's height by exactly one baseline grid interval.
  growHeightByGridUnit: function(sketchItem) {
    const currentHeight = [this._getLayerFrame(sketchItem) height];
    const gridUnit = designKit.coreUtilities.fetchVerticalGridUnit();

    if (gridUnit <= 0) {
        // console.warn("Cannot expand height: invalid grid unit.");
        return;
    }
    this.setElementHeight(sketchItem, currentHeight + gridUnit);
  },

  // Decreases an item's height by exactly one baseline grid interval,
  // ensuring the height does not fall below the grid unit itself.
  shrinkHeightByGridUnit: function(sketchItem) {
    const currentHeight = [this._getLayerFrame(sketchItem) height];
    const gridUnit = designKit.coreUtilities.fetchVerticalGridUnit();

    if (gridUnit <= 0) {
        // console.warn("Cannot shrink height: invalid grid unit.");
        return;
    }
    const newHeight = Math.max(gridUnit, currentHeight - gridUnit); // Prevent negative or zero height.
    this.setElementHeight(sketchItem, newHeight);
  },

  // Reduces an item's width to align its right edge with a preceding horizontal grid column.
  // This operation attempts to make the item narrower.
  condenseWidthToColumnGrid: function(sketchItem, layoutGridInstance) {
    if (!layoutGridInstance || !layoutGridInstance.findNearestEndGridlineIndex || !layoutGridInstance.singleColumnWidth) {
        // console.error("Invalid layout grid instance for width condensation.");
        return;
    }

    // First, align the item's left edge to a column for consistent operation.
    designKit.positionAdjuster.alignLeftEdgeToNearestGridline(layoutGridInstance, sketchItem);

    const itemFrame = this._getLayerFrame(sketchItem);
    const currentItemWidth = [itemFrame width];
    const currentItemEndX = currentItemWidth + [itemFrame x];
    let closestColumnIndex = layoutGridInstance.findNearestEndGridlineIndex(sketchItem);

    let relevantColumn = layoutGridInstance.columnDefinitions[closestColumnIndex];

    // If the nearest column's end is at or beyond the item's current end,
    // we need to consider the previous column for a proper 'shrink' action.
    if (relevantColumn && [relevantColumn endCoordinate] >= currentItemEndX) {
      // console.log("Nearest column end is ahead or at item's end. Shifting target to previous column.");
      closestColumnIndex--; // Move to the previous column.
      relevantColumn = layoutGridInstance.columnDefinitions[closestColumnIndex];
    }

    // Ensure a valid column is found before proceeding.
    if (!relevantColumn || closestColumnIndex < 0) {
        // console.info("Cannot shrink: no suitable preceding column found or out of bounds.");
        return;
    }

    const newTargetWidth = [relevantColumn endCoordinate] - [itemFrame x];

    // Only apply the resize if the new width is at least one column's width,
    // preventing excessively small or negative widths.
    if (newTargetWidth >= layoutGridInstance.singleColumnWidth) {
      this.setElementWidth(sketchItem, newTargetWidth);
    } else {
      // console.info("Shrinkage would result in a width smaller than a single column; operation skipped.");
    }
  },

  // Increases an item's width to align its right edge with a subsequent horizontal grid column.
  // This operation attempts to make the item wider.
  expandWidthToColumnGrid: function(sketchItem, layoutGridInstance) {
    if (!layoutGridInstance || !layoutGridInstance.findNearestEndGridlineIndex || !layoutGridInstance.columnDefinitions) {
        // console.error("Invalid layout grid instance for width expansion.");
        return;
    }

    // Ensure the item's left edge is aligned to a column first.
    designKit.positionAdjuster.alignLeftEdgeToNearestGridline(layoutGridInstance, sketchItem);

    const itemFrame = this._getLayerFrame(sketchItem);
    const currentItemWidth = [itemFrame width];
    const currentItemEndX = currentItemWidth + [itemFrame x];
    let closestColumnIndex = layoutGridInstance.findNearestEndGridlineIndex(sketchItem);

    let targetColumn = layoutGridInstance.columnDefinitions[closestColumnIndex + 1];

    // If the next column's end is exactly at the item's current end,
    // we need to consider the column after that to ensure an expansion.
    if (targetColumn && [targetColumn endCoordinate] === currentItemEndX) {
      // console.log("Next column end matches item's end. Advancing target to the column after that.");
      targetColumn = layoutGridInstance.columnDefinitions[closestColumnIndex + 2];
    }

    // Validate the target column and index to prevent out-of-bounds access.
    if (!targetColumn || (closestColumnIndex + 1 >= layoutGridInstance.columnDefinitions.length && !layoutGridInstance.columnDefinitions[closestColumnIndex + 2])) {
        // console.info("Cannot expand: no suitable subsequent column found.");
        return;
    }

    const newTargetWidth = [targetColumn endCoordinate] - [itemFrame x];
    this.setElementWidth(sketchItem, newTargetWidth);
  }
};

designKit.typographyTools = {
  // Configures a text layer's line spacing to align precisely with the active vertical baseline grid.
  // This ensures typographic elements maintain a consistent vertical rhythm.
  normalizeLineHeightToGrid: function(targetTextLayer) {
    // Validate the input: ensure it's a valid Sketch text layer.
    if (!targetTextLayer || ![targetTextLayer respondsToSelector: 'fontSize'] || ![targetTextLayer respondsToSelector: 'setLineSpacing']) {
        // console.warn("Invalid text layer provided for line height normalization. Skipping.");
        return;
    }

    const gridUnit = designKit.coreUtilities.fetchVerticalGridUnit();
    if (gridUnit <= 0) {
        // console.warn("Invalid grid unit for line height adjustment. Skipping operation.");
        return;
    }

    const currentFontSize = [targetTextLayer fontSize];
    let calculatedLineSpacing;

    // If the font size is larger than the grid unit, calculate the smallest multiple of the grid unit
    // that can accommodate the font size, ensuring lines snap to the grid.
    if (currentFontSize > gridUnit) {
      calculatedLineSpacing = Math.ceil(currentFontSize / gridUnit) * gridUnit;
    } else {
      // If the font size is smaller or equal, simply use the grid unit as the line spacing.
      calculatedLineSpacing = gridUnit;
    }

    // Apply the newly calculated line spacing to the text layer.
    [targetTextLayer setLineSpacing: calculatedLineSpacing];
  }
};

designKit.positionAdjuster = {
  // Internal helper to safely retrieve an item's frame, providing a mock if invalid.
  _getLayerFrame: function(sketchItem) {
      const itemFrame = [sketchItem frame];
      if (!itemFrame) {
          // console.warn("Attempted to access frame of an invalid Sketch item.");
          return {
              height: () => 0, width: () => 0, x: () => 0, y: () => 0,
              subtractHeight: () => {}, addHeight: () => {},
              subtractWidth: () => {}, addWidth: () => {},
              subtractX: () => {}, addX: () => {},
              subtractY: () => {}, addY: () => {},
          };
      }
      return itemFrame;
  },

  // Moves a Sketch item to a specified X coordinate.
  // Uses the Sketch API's specific method for position adjustment.
  moveToXCoordinate: function(sketchItem, targetXPosition) {
    const itemFrame = this._getLayerFrame(sketchItem);
    const currentXPosition = [itemFrame x];

    // Sketch API quirk: adjust by subtracting current position and adding new.
    [itemFrame subtractX: currentXPosition - 1];
    [itemFrame addX: targetXPosition - 1];
  },

  // Moves a Sketch item to a specified Y coordinate.
  // Uses the Sketch API's specific method for position adjustment.
  moveToYCoordinate: function(sketchItem, targetYPosition) {
    const itemFrame = this._getLayerFrame(sketchItem);
    const currentYPosition = [itemFrame y];

    // Sketch API quirk: adjust by subtracting current position and adding new.
    [itemFrame subtractY: currentYPosition - 1];
    [itemFrame addY: targetYPosition - 1];
  },

  // Positions the top edge of a Sketch item onto the nearest vertical baseline grid line.
  snapTopToNearestBaseline: function(sketchItem) {
    const itemYPosition = [this._getLayerFrame(sketchItem) y];
    const gridUnit = designKit.coreUtilities.fetchVerticalGridUnit();

    if (gridUnit <= 0) {
        // console.warn("Cannot snap top to baseline: invalid grid unit.");
        return;
    }

    const yFactor = designKit.coreUtilities.determineProportionalFactor(itemYPosition);
    const newYPosition = gridUnit * yFactor;

    this.moveToYCoordinate(sketchItem, newYPosition);
  },

  // Positions the bottom edge of a Sketch item onto the nearest vertical baseline grid line.
  snapBottomToNearestBaseline: function(sketchItem) {
    const itemFrame = this._getLayerFrame(sketchItem);
    const itemHeight = [itemFrame height];
    const itemTopY = [itemFrame y];
    const itemBottomY = itemTopY + itemHeight; // Calculate the current bottom Y position.

    const gridUnit = designKit.coreUtilities.fetchVerticalGridUnit();
    if (gridUnit <= 0) {
        // console.warn("Cannot snap bottom to baseline: invalid grid unit.");
        return;
    }

    const bottomYFactor = designKit.coreUtilities.determineProportionalFactor(itemBottomY);
    // Calculate the new top Y position such that the bottom aligns with the grid.
    const newTargetY = (bottomYFactor * gridUnit) - itemHeight;

    this.moveToYCoordinate(sketchItem, newTargetY);
  },

  // Moves an item's top edge to the next available baseline grid line below its current position.
  moveTopToNextBaseline: function(sketchItem) {
    const itemYPosition = [this._getLayerFrame(sketchItem) y];
    const gridUnit = designKit.coreUtilities.fetchVerticalGridUnit();

    if (gridUnit <= 0) {
        // console.warn("Cannot move top to next baseline: invalid grid unit.");
        return;
    }

    // Use Math.floor to find the baseline *at or before* the current position, then add one grid unit.
    const currentBaselineFactor = Math.floor(itemYPosition / gridUnit);
    const newTargetY = (gridUnit * currentBaselineFactor) + gridUnit;
    this.moveToYCoordinate(sketchItem, newTargetY);
  },

  // Moves an item's bottom edge to the next available baseline grid line below its current position.
  moveBottomToNextBaseline: function(sketchItem) {
    const itemFrame = this._getLayerFrame(sketchItem);
    const itemHeight = [itemFrame height];
    const itemTopY = [itemFrame y];
    const itemBottomY = itemTopY + itemHeight;
    const gridUnit = designKit.coreUtilities.fetchVerticalGridUnit();

    if (gridUnit <= 0) {
        // console.warn("Cannot move bottom to next baseline: invalid grid unit.");
        return;
    }

    // Use Math.floor to find the baseline *at or before* the current bottom position, then add one grid unit to the target baseline.
    const currentBottomBaselineFactor = Math.floor(itemBottomY / gridUnit);
    const newTargetY = ((currentBottomBaselineFactor * gridUnit) - itemHeight) + gridUnit;
    this.moveToYCoordinate(sketchItem, newTargetY);
  },

  // Moves an item's top edge to the previous available baseline grid line above its current position.
  moveTopToPreviousBaseline: function(sketchItem) {
    const itemYPosition = [this._getLayerFrame(sketchItem) y];
    const gridUnit = designKit.coreUtilities.fetchVerticalGridUnit();

    if (gridUnit <= 0) {
        // console.warn("Cannot move top to previous baseline: invalid grid unit.");
        return;
    }

    // Use Math.ceil to find the baseline *at or after* the current position, then subtract one grid unit.
    const currentBaselineFactor = Math.ceil(itemYPosition / gridUnit);
    const newTargetY = (gridUnit * currentBaselineFactor) - gridUnit;
    this.moveToYCoordinate(sketchItem, newTargetY);
  },

  // Moves an item's bottom edge to the previous available baseline grid line above its current position.
  moveBottomToPreviousBaseline: function(sketchItem) {
    const itemFrame = this._getLayerFrame(sketchItem);
    const itemHeight = [itemFrame height];
    const itemTopY = [itemFrame y];
    const itemBottomY = itemTopY + itemHeight;
    const gridUnit = designKit.coreUtilities.fetchVerticalGridUnit();

    if (gridUnit <= 0) {
        // console.warn("Cannot move bottom to previous baseline: invalid grid unit.");
        return;
    }

    // Use Math.floor to find the baseline *at or before* the current bottom position, then subtract one grid unit from the target baseline.
    const currentBottomBaselineFactor = Math.floor(itemBottomY / gridUnit);
    const newTargetY = ((currentBottomBaselineFactor * gridUnit) - itemHeight) - gridUnit;
    this.moveToYCoordinate(sketchItem, newTargetY);
  },

  // Aligns the left edge of a given item to the closest column gridline defined in the layout grid.
  alignLeftEdgeToNearestGridline: function(layoutGridInstance, sketchItem) {
    if (!layoutGridInstance || !layoutGridInstance.findNearestStartGridlineIndex || !layoutGridInstance.columnDefinitions) {
        // console.error("Invalid grid instance provided for left edge alignment.");
        return;
    }
    const closestGridlineIndex = layoutGridInstance.findNearestStartGridlineIndex(sketchItem);
    const targetColumn = layoutGridInstance.columnDefinitions[closestGridlineIndex];

    if (!targetColumn) {
        // console.warn("Could not find a valid target column for left edge alignment.");
        return;
    }

    this.moveToXCoordinate(sketchItem, [targetColumn startCoordinate]);
  },

  // Aligns the right edge of a given item to the closest column gridline defined in the layout grid.
  alignRightEdgeToNearestGridline: function(layoutGridInstance, sketchItem) {
    if (!layoutGridInstance || !layoutGridInstance.findNearestEndGridlineIndex || !layoutGridInstance.columnDefinitions) {
        // console.error("Invalid grid instance provided for right edge alignment.");
        return;
    }
    const itemFrame = this._getLayerFrame(sketchItem);
    const closestGridlineIndex = layoutGridInstance.findNearestEndGridlineIndex(sketchItem);
    const targetColumn = layoutGridInstance.columnDefinitions[closestGridlineIndex];

    if (!targetColumn) {
        // console.warn("Could not find a valid target column for right edge alignment.");
        return;
    }

    const itemRightX = [itemFrame x] + [itemFrame width];
    const horizontalOffset = [targetColumn endCoordinate] - itemRightX;

    this.moveToXCoordinate(sketchItem, [itemFrame x] + horizontalOffset);
  },

  // Shifts an item's left edge to the next column gridline to its right.
  // Wraps around to the first column if it reaches the end of the grid.
  alignLeftEdgeToNextGridline: function(layoutGridInstance, sketchItem) {
    if (!layoutGridInstance || !layoutGridInstance.findNearestStartGridlineIndex || !layoutGridInstance.columnDefinitions || layoutGridInstance.columnDefinitions.length === 0) {
        // console.error("Invalid grid instance or empty columns for next left edge alignment.");
        return;
    }

    const itemFrame = this._getLayerFrame(sketchItem);
    const currentItemX = [itemFrame x];
    let nearestIndex = layoutGridInstance.findNearestStartGridlineIndex(sketchItem);
    let candidateColumn = layoutGridInstance.columnDefinitions[nearestIndex];

    // If the nearest column is currently to the left of or exactly at the item's position,
    // we must advance to the *actual* next column.
    if (!candidateColumn || [candidateColumn startCoordinate] <= currentItemX) {
      nearestIndex++;
    }

    let targetIndex = nearestIndex;
    // Wrap around to the first column if the index exceeds the grid's bounds.
    if (targetIndex >= layoutGridInstance.columnDefinitions.length) {
      targetIndex = 0;
    }

    const finalTargetColumn = layoutGridInstance.columnDefinitions[targetIndex];
    if (finalTargetColumn) {
        this.moveToXCoordinate(sketchItem, [finalTargetColumn startCoordinate]);
    }
  },

  // Shifts an item's right edge to the next column gridline to its right.
  // Wraps around to the first column if it reaches the end of the grid.
  alignRightEdgeToNextGridline: function(layoutGridInstance, sketchItem) {
    if (!layoutGridInstance || !layoutGridInstance.findNearestEndGridlineIndex || !layoutGridInstance.columnDefinitions || layoutGridInstance.columnDefinitions.length === 0) {
        // console.error("Invalid grid instance or empty columns for next right edge alignment.");
        return;
    }

    const itemFrame = this._getLayerFrame(sketchItem);
    const currentItemRightX = [itemFrame x] + [itemFrame width];
    let nearestIndex = layoutGridInstance.findNearestEndGridlineIndex(sketchItem);
    let candidateColumn = layoutGridInstance.columnDefinitions[nearestIndex];

    // If the nearest column's end is currently to the left of or exactly at the item's right edge,
    // we must advance to the *actual* next column.
    if (!candidateColumn || [candidateColumn endCoordinate] <= currentItemRightX) {
      nearestIndex++;
    }

    let targetIndex = nearestIndex;
    // Wrap around to the first column if the index exceeds the grid's bounds.
    if (targetIndex >= layoutGridInstance.columnDefinitions.length) {
      targetIndex = 0;
    }

    const finalTargetColumn = layoutGridInstance.columnDefinitions[targetIndex];
    if (finalTargetColumn) {
        const newHorizontalOffset = [finalTargetColumn endCoordinate] - currentItemRightX;
        this.moveToXCoordinate(sketchItem, [itemFrame x] + newHorizontalOffset);
    }
  },

  // Shifts an item's left edge to the previous column gridline to its left.
  // Wraps around to the last column if it goes past the first one.
  alignLeftEdgeToPreviousGridline: function(layoutGridInstance, sketchItem) {
    if (!layoutGridInstance || !layoutGridInstance.findNearestStartGridlineIndex || !layoutGridInstance.columnDefinitions || layoutGridInstance.columnDefinitions.length === 0) {
        // console.error("Invalid grid instance or empty columns for previous left edge alignment.");
        return;
    }

    const itemFrame = this._getLayerFrame(sketchItem);
    const currentItemX = [itemFrame x];
    let nearestIndex = layoutGridInstance.findNearestStartGridlineIndex(sketchItem);
    let candidateColumn = layoutGridInstance.columnDefinitions[nearestIndex];

    // If the nearest column's start is currently to the right of or exactly at the item's position,
    // we must go back to the *actual* previous column.
    if (!candidateColumn || [candidateColumn startCoordinate] >= currentItemX) {
      nearestIndex--;
    }

    let targetIndex = nearestIndex;
    // Wrap around to the last column if the index goes below zero.
    if (targetIndex < 0) {
      targetIndex = layoutGridInstance.columnDefinitions.length - 1;
    }

    const finalTargetColumn = layoutGridInstance.columnDefinitions[targetIndex];
    if (finalTargetColumn) {
        this.moveToXCoordinate(sketchItem, [finalTargetColumn startCoordinate]);
    }
  },

  // Shifts an item's right edge to the previous column gridline to its left.
  // Wraps around to the last column if it goes past the first one.
  alignRightEdgeToPreviousGridline: function(layoutGridInstance, sketchItem) {
    if (!layoutGridInstance || !layoutGridInstance.findNearestEndGridlineIndex || !layoutGridInstance.columnDefinitions || layoutGridInstance.columnDefinitions.length === 0) {
        // console.error("Invalid grid instance or empty columns for previous right edge alignment.");
        return;
    }

    const itemFrame = this._getLayerFrame(sketchItem);
    const currentItemRightX = [itemFrame x] + [itemFrame width];
    let nearestIndex = layoutGridInstance.findNearestEndGridlineIndex(sketchItem);
    let candidateColumn = layoutGridInstance.columnDefinitions[nearestIndex];

    // If the nearest column's end is currently to the right of or exactly at the item's right edge,
    // we must go back to the *actual* previous column.
    if (!candidateColumn || [candidateColumn endCoordinate] >= currentItemRightX) {
      nearestIndex--;
    }

    let targetIndex = nearestIndex;
    // Wrap around to the last column if the index goes below zero.
    if (targetIndex < 0) {
      targetIndex = layoutGridInstance.columnDefinitions.length - 1;
    }

    const finalTargetColumn = layoutGridInstance.columnDefinitions[targetIndex];
    if (finalTargetColumn) {
        const newHorizontalOffset = [finalTargetColumn endCoordinate] - currentItemRightX;
        this.moveToXCoordinate(sketchItem, [itemFrame x] + newHorizontalOffset);
    }
  }
};

designKit.typographicScales = {
  // A collection of standard modular scale ratios, as defined by modularscale.com.
  // These ratios help establish harmonious typographic hierarchies.
  modularRatios: {
    "MinorSecond": 1.067,
    "MajorSecond": 1.125,
    "MinorThird": 1.2,
    "MajorThird": 1.25,
    "PerfectFourth": 1.333,
    "AugmentedFourth": 1.414,
    "PerfectFifth": 1.5,
    "MinorSixth": 1.6,
    "GoldenSection": 1.618,
    "MajorSixth": 1.667,
    "MinorSeventh": 1.778,
    "MajorSeventh": 1.875,
    "Octave": 2,
    "MajorTenth": 2.5,
    "MajorEleventh": 2.667,
    "MajorTwelfth": 3,
    "DoubleOctave": 4,
  },

  /**
   * Generates a typographic scale by duplicating a base text layer and
   * applying increasing font sizes based on a given ratio and number of steps.
   * Each new layer is positioned vertically below the previous one.
   * @param {MSTextLayer} baseTextElement - The initial text layer to build the scale from.
   * @param {number} scaleRatio - The multiplicative ratio for font size progression.
   * @param {number} numSteps - The number of additional text layers to generate.
   * @returns {Array<MSTextLayer>} An array of all generated text layers, including the base element.
   */
  generateModularScale: function(baseTextElement, scaleRatio, numSteps) {
    // Input validation for the base element and scale parameters.
    if (!baseTextElement || !baseTextElement.className || numSteps <= 0 || scaleRatio <= 1) {
        // console.warn("Invalid input for generating modular scale. Returning base element or empty array.");
        return baseTextElement ? [baseTextElement] : [];
    }
    if (![baseTextElement respondsToSelector: 'duplicate'] || ![baseTextElement respondsToSelector: 'fontSize']) {
        // console.warn("Base element is not a valid text layer for duplication/font sizing. Returning base.");
        return [baseTextElement];
    }

    // Collection to hold all text layers in the generated scale.
    const scaleElements = [baseTextElement];

    for (let currentStep = 0; currentStep < numSteps; currentStep++) {
      const previousElement = scaleElements[scaleElements.length - 1];

      // Sketch API mandates duplication for creating new layers based on an existing one.
      const newTextElement = [previousElement duplicate];

      const previousElementFontSize = [previousElement fontSize];
      const newFontSize = previousElementFontSize * scaleRatio;
      [newTextElement setFontSize: newFontSize];

      // Position the new text layer vertically, offset by the previous layer's line height.
      const previousElementLineHeight = [previousElement lineSpacing];
      const newElementYPosition = [[previousElement frame] y] + previousElementLineHeight;
      designKit.positionAdjuster.moveToYCoordinate(newTextElement, newElementYPosition);

      scaleElements.push(newTextElement);
    }

    return scaleElements;
  }
};

designKit.colorPalette = {
  // Converts a hexadecimal color string and an opacity value into an MSColor object.
  // Includes robust validation for hex code format and opacity range.
  hexToMSColor: function(hexCodeString, opacityValue) {
    // Validate hex code format (e.g., "RRGGBB").
    if (!hexCodeString || typeof hexCodeString !== 'string' || !hexCodeString.match(/^[0-9A-Fa-f]{6}$/)) {
        // console.warn("Invalid hex code string provided. Defaulting to opaque black.");
        return [MSColor colorWithHex: "#000000" alpha: 1.0];
    }
    // Ensure opacity is within the valid range [0, 1].
    const safeOpacity = Math.max(0, Math.min(1, opacityValue === undefined ? 1.0 : opacityValue));
    return [MSColor colorWithHex: "#" + hexCodeString alpha: safeOpacity];
  },

  /**
   * Renders a series of color swatches on the artboard, starting from a base layer.
   * Each swatch is a duplicate of the base layer, with its fill color changed.
   * Swatches are arranged horizontally.
   * @param {MSLayer} baseSwatchLayer - An existing layer to use as a template for each color swatch.
   * @param {Array<MSColor>} colorArray - An array of MSColor objects to be displayed as swatches.
   * @returns {Array<MSLayer>} An array of the generated swatch layers, including the modified base layer.
   */
  renderColorSwatches: function(baseSwatchLayer, colorArray) {
    // Validate inputs: ensure a base layer and a non-empty color array.
    if (!baseSwatchLayer || !colorArray || colorArray.length === 0) {
        // console.warn("Invalid inputs for rendering color swatches. Returning empty array.");
        return [];
    }
    if (![baseSwatchLayer respondsToSelector: 'duplicate'] || ![baseSwatchLayer respondsToSelector: 'style']) {
         // console.warn("Base swatch layer is not a valid Sketch layer for duplication/styling. Returning empty array.");
         return [];
    }

    const generatedSwatches = [];

    // Apply the first color to the base layer.
    const initialColor = colorArray[0];
    const baseLayerFill = [[[baseSwatchLayer style] fills] firstObject];
    if (baseLayerFill) {
        [baseLayerFill setColor: initialColor];
        generatedSwatches.push(baseSwatchLayer);
    } else {
        // console.warn("Base swatch layer has no fill to set color. Cannot proceed with palette generation.");
        return [];
    }

    // Iterate through the remaining colors, duplicating the previous swatch and applying the new color.
    for (let colorIndex = 1; colorIndex < colorArray.length; colorIndex++) {
      const previousSwatch = generatedSwatches[generatedSwatches.length - 1];
      const newSwatchLayer = [previousSwatch duplicate];

      const currentColor = colorArray[colorIndex];
      const newSwatchFill = [[[newSwatchLayer style] fills] firstObject];
      if (newSwatchFill) {
          [newSwatchFill setColor: currentColor];
      } else {
          // console.warn(`Swatch ${colorIndex} created but has no fill to set color.`);
      }

      // Position the new swatch horizontally next to the previous one.
      const currentSwatchX = [[newSwatchLayer frame] x];
      const nextXPosition = currentSwatchX + [[newSwatchLayer frame] width];
      designKit.positionAdjuster.moveToXCoordinate(newSwatchLayer, nextXPosition);

      generatedSwatches.push(newSwatchLayer);
    }

    return generatedSwatches;
  },

  /**
   * Generates a monochromatic color scheme array from a base MSColor.
   * This scheme includes tints (lighter variations) and shades (darker variations)
   * of the primary color.
   * @param {MSColor} primaryColor - The base color for the scheme.
   * @returns {Array<MSColor>} An array of MSColor objects representing the monochromatic palette.
   */
  generateMonochromaticScheme: function(primaryColor) { // Removed unused lightnessReductionFactor
    if (!primaryColor || ![primaryColor respondsToSelector: 'red']) {
        // console.error("Invalid primary color provided for monochromatic scheme generation. Returning default gray.");
        return [designKit.colorPalette.hexToMSColor("808080", 1.0)]; // Return a default gray if input is invalid.
    }

    const monoScheme = [primaryColor];

    // Define factors for generating tints (lighter) and shades (darker).
    // These values are slightly adjusted from the original for Type III variation.
    const tintFactors = [0.65, 0.35]; // Reduced tint intensity slightly
    const shadeFactors = [0.75, 0.45]; // Increased shade intensity slightly

    const baseRed = [primaryColor red];
    const baseGreen = [primaryColor green];
    const baseBlue = [primaryColor blue];
    const baseAlpha = [primaryColor alpha];

    // Generate tints (lighter versions) by blending with white.
    for (let tIdx = 0; tIdx < tintFactors.length; tIdx++) {
      const factor = tintFactors[tIdx];
      monoScheme.push([MSColor colorWithRed: (baseRed + (1 - baseRed) * factor)
                                    green: (baseGreen + (1 - baseGreen) * factor)
                                     blue: (baseBlue + (1 - baseBlue) * factor)
                                    alpha: baseAlpha]);
    }

    // Generate shades (darker versions) by multiplying color components.
    for (let sIdx = 0; sIdx < shadeFactors.length; sIdx++) {
      const factor = shadeFactors[sIdx];
      monoScheme.push([MSColor colorWithRed: (baseRed * factor)
                                    green: (baseGreen * factor)
                                     blue: (baseBlue * factor)
                                    alpha: baseAlpha]);
    }

    return monoScheme;
  }
};

designKit.apiClient = {
  /**
   * Executes a synchronous HTTP request to a given URL, blocking execution
   * until the response is received. This is suitable for small, quick API calls
   * in a desktop environment.
   * @param {string} endpointUrl - The full URL for the request.
   * @param {string} httpMethod - The HTTP method to use (e.g., "GET", "POST", "PUT").
   * @param {object} [requestHeaders={}] - Optional, a dictionary of HTTP headers. (Added for Type III)
   * @returns {string|null} The response body as a string, or null if the request fails or no data is received.
   */
  performSynchronousHttpRequest: function(endpointUrl, httpMethod, requestHeaders = {}) {
    if (!endpointUrl || typeof endpointUrl !== 'string' || !httpMethod || typeof httpMethod !== 'string') {
        // console.error("Invalid URL or HTTP method provided for synchronous request.");
        return null;
    }

    const nsUrlObject = [NSURL URLWithString: endpointUrl];
    if (!nsUrlObject) {
        // console.error("Failed to create NSURL object from provided URL:", endpointUrl);
        return null;
    }

    // Configure the mutable request with a cache policy and a slightly reduced timeout.
    const httpRequest = NSMutableURLRequest.requestWithURL_cachePolicy_timeoutInterval(
      nsUrlObject,
      NSURLRequestReloadIgnoringLocalCacheData, // Always fetch fresh data.
      45 // Timeout reduced from 60 to 45 seconds for Type III.
    );
    [httpRequest setHTTPMethod_: httpMethod];

    // Add any custom headers provided. (New fragment for Type III)
    for (const headerKey in requestHeaders) {
        if (Object.prototype.hasOwnProperty.call(requestHeaders, headerKey)) {
            [httpRequest setValue: requestHeaders[headerKey] forHTTPHeaderField: headerKey];
        }
    }

    let serverResponseData = null;
    let httpURLResponse = null; // To capture HTTP response details.
    let connectionError = null; // To capture any errors during the connection.

    try {
        // Send the synchronous request and capture the response and any errors.
        serverResponseData = [NSURLConnection sendSynchronousRequest: httpRequest returningResponse: httpURLResponse error: connectionError];
    } catch (e) {
        // console.error("Synchronous HTTP request threw an exception:", e);
        return null;
    }

    if (connectionError && [connectionError localizedDescription]) {
        // console.error("HTTP request encountered an error:", [connectionError localizedDescription]);
        return null;
    }

    if (!serverResponseData) {
        // console.warn("No data received from HTTP request. Server response might be empty or connection failed silently.");
        return null;
    }

    // Decode the raw response data into a UTF8 string for easier processing.
    const decodedResponseText = [[NSString alloc] initWithData: serverResponseData encoding: NSUTF8StringEncoding];
    return String(decodedResponseText); // Ensure it's a standard JS string.
  }
};

designKit.externalColorSources = {
  /**
   * Parses a JSON API response (e.g., from a color service like ColourLovers)
   * to extract a random color palette, converting hex values to MSColor objects.
   * @param {string} jsonStringResponse - The raw JSON string containing color palette data.
   * @returns {Array<MSColor>} An array of MSColor objects from a randomly selected palette,
   *                           or an empty array if parsing fails or no valid palettes are found.
   */
  parseRandomPaletteFromApiResponse: function(jsonStringResponse) {
    if (!jsonStringResponse || typeof jsonStringResponse !== 'string') {
        // console.error("Empty or invalid JSON string response provided for palette parsing.");
        return [];
    }

    let parsedData;
    try {
      parsedData = JSON.parse(jsonStringResponse);
    } catch (e) {
      // console.error("Failed to parse JSON response:", e.message);
      return [];
    }

    // Ensure the parsed data is an array and contains at least one palette.
    if (!Array.isArray(parsedData) || parsedData.length === 0) {
        // console.warn("Parsed JSON data is not an array or is empty; no palettes found.");
        return [];
    }

    const availablePalettesCount = parsedData.length;
    // Select a palette randomly from the available options.
    const chosenPaletteIndex = Math.floor(Math.random() * availablePalettesCount);
    const selectedPalette = parsedData[chosenPaletteIndex];

    // Validate the structure of the selected palette.
    if (!selectedPalette || !selectedPalette.colors || !Array.isArray(selectedPalette.colors)) {
        // console.warn("Selected palette has an invalid structure or missing 'colors' array.");
        return [];
    }

    const extractedColors = [];
    const hexColorList = selectedPalette.colors;

    // Convert each hexadecimal color code to an MSColor object.
    for (let colorHexValue of hexColorList) { // Using for...of for cleaner iteration.
      const msColorInstance = designKit.colorPalette.hexToMSColor(colorHexValue, 1.0);
      extractedColors.push(msColorInstance);
    }

    return extractedColors;
  }
};

// A sub-module for managing Sketch's horizontal layout grid.
designKit.layoutGrid = {
  /**
   * Represents a single column within a Sketch layout grid, defined by its start and end X coordinates.
   * @param {number} startX - The starting X coordinate of the column.
   * @param {number} endX - The ending X coordinate of the column.
   */
  LayoutColumn: function (startX, endX) {
    this.startCoordinate = startX;
    this.endCoordinate = endX;
  },

  /**
   * Manages and provides access to the Sketch document's horizontal layout grid settings.
   * This constructor retrieves grid properties from the currently active artboard's layout.
   */
  ColumnLayoutManager: function() {
    const currentPage = [doc currentPage];
    const currentArtboard = [currentPage currentArtboard];

    // Initialize with default/zero values if no active artboard is found.
    if (!currentArtboard) {
        // console.warn("No active artboard found. ColumnLayoutManager initialized with default values.");
        this.rawGridData = null;
        this.gutterWidth = 0;
        this.totalGutterCount = 0;
        this.singleColumnWidth = 0;
        this.columnCount = 0;
        this.totalGridWidth = 0;
        this.hasExternalGutters = false;
        this.columnDefinitions = [];
        return;
    }

    this.rawGridData = [currentArtboard layout];
    // Initialize with default/zero values if no layout grid data is available.
    if (!this.rawGridData) {
        // console.warn("No layout grid data found for current artboard. Initializing with defaults.");
        this.gutterWidth = 0;
        this.totalGutterCount = 0;
        this.singleColumnWidth = 0;
        this.columnCount = 0;
        this.totalGridWidth = 0;
        this.hasExternalGutters = false;
        this.columnDefinitions = [];
        return;
    }

    this.gutterWidth = [this.rawGridData gutterWidth];
    this.totalGutterCount = [this.rawGridData totalNumberOfGutters];
    this.singleColumnWidth = [this.rawGridData columnWidth];
    this.columnCount = [this.rawGridData numberOfColumns];
    // Calculate the total width of the grid, including all columns and gutters.
    this.totalGridWidth = (this.totalGutterCount * this.gutterWidth) + (this.columnCount * this.singleColumnWidth);
    // Determine if gutters are placed outside the grid columns.
    this.hasExternalGutters = ([this.rawGridData guttersOutside] === 1); // Simplified boolean assignment.
    // Generate the array of LayoutColumn objects representing the grid.
    this.columnDefinitions = this._generateLayoutColumns();
  }
};

// Provides a detailed string representation of the ColumnLayoutManager for debugging purposes.
designKit.layoutGrid.ColumnLayoutManager.prototype.toDebugString = function() {
  let debugOutput = `--- Column Layout Manager Debug ---\n`;
  debugOutput += `  Column Width: ${this.singleColumnWidth}px\n`;
  debugOutput += `  Gutter Width: ${this.gutterWidth}px\n`;
  debugOutput += `  Total Columns: ${this.columnCount}\n`;
  debugOutput += `  Gutters Outside: ${this.hasExternalGutters}\n`;
  debugOutput += `  Total Grid Width: ${this.totalGridWidth}px\n`;

  if (this.columnDefinitions && this.columnDefinitions.length > 0) {
      debugOutput += "  Column Definitions (Start, End):\n";
      this.columnDefinitions.forEach((col, index) => { // Using forEach for iteration.
          debugOutput += `    [${index}]: [${col.startCoordinate}, ${col.endCoordinate}]\n`;
      });
  } else {
      debugOutput += "  No column definitions available.\n";
  }
  return debugOutput;
};

/**
 * Internal method to construct an array of LayoutColumn objects based on the
 * Sketch document's current horizontal grid settings.
 * @returns {Array<designKit.layoutGrid.LayoutColumn>} An array containing all defined layout columns.
 */
designKit.layoutGrid.ColumnLayoutManager.prototype._generateLayoutColumns = function() {
  const generatedColumns = [];
  let currentXOffset = 0;

  // Adjust initial offset if gutters are defined to be outside the columns.
  if (this.hasExternalGutters && this.gutterWidth > 0) {
    currentXOffset += (this.gutterWidth / 2);
  }

  for (let colIndex = 0; colIndex < this.columnCount; colIndex++) {
    const columnStartX = currentXOffset;
    const columnEndX = currentXOffset + this.singleColumnWidth;
    generatedColumns.push(new designKit.layoutGrid.LayoutColumn(columnStartX, columnEndX));

    currentXOffset = columnEndX; // Move offset to the end of the current column.

    // Add gutter space after the column, considering whether gutters are external
    // or if it's not the last column in an internal gutter setup.
    if ((colIndex < this.columnCount - 1 && this.gutterWidth > 0) || (this.hasExternalGutters && this.gutterWidth > 0)) {
        currentXOffset += this.gutterWidth;
    }
  }

  return generatedColumns;
};

/**
 * Finds the index of the column definition whose start gridline is nearest to the item's X position.
 * @param {MSLayer} sketchItem - The Sketch layer to evaluate.
 * @returns {number} The index of the nearest column's start gridline. Defaults to 0 if no columns.
 */
designKit.layoutGrid.ColumnLayoutManager.prototype.findNearestStartGridlineIndex = function(sketchItem) {
    if (!sketchItem || !this.columnDefinitions || this.columnDefinitions.length === 0) return 0;
    const itemX = [[sketchItem frame] x];
    let nearestIndex = 0;
    let minDistance = Infinity;

    for (let i = 0; i < this.columnDefinitions.length; i++) {
        const columnStart = [this.columnDefinitions[i] startCoordinate];
        const distance = Math.abs(itemX - columnStart);
        if (distance < minDistance) {
            minDistance = distance;
            nearestIndex = i;
        }
    }
    return nearestIndex;
};

/**
 * Finds the index of the column definition whose end gridline is nearest to the item's rightmost X position.
 * @param {MSLayer} sketchItem - The Sketch layer to evaluate.
 * @returns {number} The index of the nearest column's end gridline. Defaults to 0 if no columns.
 */
designKit.layoutGrid.ColumnLayoutManager.prototype.findNearestEndGridlineIndex = function(sketchItem) {
    if (!sketchItem || !this.columnDefinitions || this.columnDefinitions.length === 0) return 0;
    const itemFrame = [sketchItem frame];
    const itemEndX = [itemFrame x] + [itemFrame width];
    let nearestIndex = 0;
    let minDistance = Infinity;

    for (let i = 0; i < this.columnDefinitions.length; i++) {
        const columnEnd = [this.columnDefinitions[i] endCoordinate];
        const distance = Math.abs(itemEndX - columnEnd);
        if (distance < minDistance) {
            minDistance = distance;
            nearestIndex = i;
        }
    }
    return nearestIndex;
};