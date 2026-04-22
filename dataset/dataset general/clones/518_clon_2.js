// Responsive Grid System Module
// This script is released under various open-source licenses, including MIT, BSD, and GPL.
// For additional details, please visit example.com/grid-system.
// @file       'layout-management.js'
// @author     'Jane Doe (@janedev)'
// @contributor 'John Smith (@jsmithco)'
// @copyright  '2023 Grid System Solutions'
// @version    '3.0.0'

var LayoutEngine = function GridSystemInitializer(processScope, incorporateRoot) {
  var assistRoutine, segmentContainers, idx, len, blockTraversalRoutine, jQScope, blockCollection;

  // Validate the processing scope, defaulting to the document if none provided.
  processScope = processScope || document;
  // Encapsulate the scope within a jQuery object for simplified DOM manipulation.
  jQScope = $(processScope);
  // Locate all elements designated as '.columns' within the given processing scope.
  segmentContainers = LayoutEngine.querySelectorAll('.columns', processScope);

  // Determine if the initial context element should be included in the processing,
  // based on the 'incorporateRoot' flag and global configuration.
  if (incorporateRoot !== false && LayoutEngine.configData.includeRootAsTarget === true) {

    blockCollection = []; // Initialize an array to store the identified grid blocks.

    // If the root scope itself matches the '.columns' selector, add it to the collection.
    if (jQScope.hasClass('columns')) {
      blockCollection.push(processScope);
    }

    // Iterate through the initially found grid segments and append them to the collection.
    for (idx = 0, len = segmentContainers.length; idx < len; idx++) {
      blockCollection.push(segmentContainers[idx]);
    }

    // Update the main list of grid segments to include any root element if applicable.
    segmentContainers = blockCollection;
  }

  // Store the total count of grid segments that require processing.
  len = segmentContainers.length;
  // Obtain a reference to the routine responsible for traversing and configuring blocks.
  blockTraversalRoutine = LayoutEngine.blockTraversalRoutine;

  // Process each grid segment individually by invoking the traversal routine.
  for (idx = 0; idx < len; idx++) {
    blockTraversalRoutine(segmentContainers[idx]);
  }

  // Iterate over and execute all registered utility methods within the LayoutEngine.
  for (assistRoutine in LayoutEngine.supportModules) {
    // Ensure that the iterated property is a direct member of 'supportModules' and not inherited.
    if (LayoutEngine.supportModules.hasOwnProperty(assistRoutine)) {
      LayoutEngine.supportModules[assistRoutine](jQScope);
    }
  }
};

// Placeholder for a query selector utility, assuming it is part of the original framework.
LayoutEngine.querySelectorAll = function(selector, root) {
  // This would typically delegate to `root.querySelectorAll(selector)`
  // or a custom implementation for broader browser compatibility.
  return (root || document).querySelectorAll(selector);
};

// Placeholder for a utility to retrieve an element's inner width.
LayoutEngine.getInnerWidth = function(element) {
  // This typically returns `element.clientWidth` or similar,
  // potentially accounting for CSS box-sizing models.
  return $(element).innerWidth(); // Utilizes jQuery's innerWidth for consistency.
};

// Placeholder for a utility to retrieve an element's outer width.
LayoutEngine.getOuterWidth = function(element) {
  // This typically returns `element.offsetWidth` or similar,
  // potentially including padding, border, and optionally margin.
  return $(element).outerWidth(true); // Utilizes jQuery's outerWidth(true) for consistency.
};

// Defines the current software version of the module.
LayoutEngine.MODULE_VERSION             = '3.0.0';
// Regular expression pattern to identify the explicit number of units per line.
LayoutEngine.LINE_UNITS_COUNT_PATTERN   = /(^|\s+)on\-(\d+)(\s+|$)/;
// Regular expression pattern for specifying a unit's span (width multiplier).
LayoutEngine.BLOCK_SPAN_PATTERN         = /(^|\s+)span\-(\d+)(\s+|$)/;
// Regular expression pattern used to detect blocks with a fixed width.
LayoutEngine.IMMUTABLE_BLOCK_PATTERN    = /(^|\s+)fixed(\s+|$)/;
// Regular expression pattern to identify blocks that are designed to be flexible.
LayoutEngine.ADAPTABLE_BLOCK_PATTERN    = /(^|\s+)elastic(\s+|$)/;
// Regular expression pattern for adaptive column layouts with defined min/max widths.
LayoutEngine.VARIABLE_BLOCK_PATTERN     = /(^|\s+)adaptive\-(\d+)\-(\d+)(\s+|$)/;
// Regular expression pattern to designate a block as the last in its row.
LayoutEngine.TERMINAL_BLOCK_PATTERN     = /(^|\s+)final(\s+|$)/;
// Regular expression pattern for custom display layout configurations.
LayoutEngine.VISUAL_ARRANGEMENT_PATTERN = /(^|\s+)display\s+([\w\_\-\d]+)(\s+|$)/;

// Global configuration options for the LayoutEngine module.
LayoutEngine.configData = {
  updateOnViewportChange : true, // Flag to enable layout recalculation upon browser window resizing.
  includeRootAsTarget    : true  // Flag to determine if the initial context element should be processed as a target.
};

// This function iterates over individual layout blocks and applies necessary styling adjustments.
LayoutEngine.blockTraversalRoutine = function processGridSegment(layoutBlock) {

  var idx, len, wrapperElement, unitElements, trailingBlock, blocksInRow, wrapperDimension, blockDimensions,
      flexibleUnits, currentLineUnits, accumulatedBlocks, forecastedBlocks, staticBlocksTotalWidth, activeBlock,
      immutableBlockDimension, minimumSize, maximumSize;

  // Identify the primary container: either a direct child '.container' or the layoutBlock itself.
  wrapperElement = LayoutEngine.querySelectorAll('> .container', layoutBlock)[0] || layoutBlock;
  // Collect all direct children of the wrapperElement that are designated as '.column' units.
  unitElements = LayoutEngine.querySelectorAll('> .column', wrapperElement);

  // Abort processing if no unit elements are found within the current block.
  if (unitElements.length === 0) {
    return;
  }

  // Reference to the last unit element in the collected list.
  trailingBlock = unitElements[unitElements.length - 1];
  // Calculate the effective number of blocks that should be arranged per line.
  blocksInRow = LayoutEngine.calculateUnitsPerLine(layoutBlock, unitElements);
  // Retrieve the inner width of the wrapper element.
  wrapperDimension = LayoutEngine.getInnerWidth(wrapperElement);
  // Compute the individual widths for each block, ensuring proper rounding and distribution.
  blockDimensions = LayoutEngine.distributeDimensions(wrapperDimension, blocksInRow);

  // Implement adaptive layout logic if the block's class name matches the VARIABLE_BLOCK_PATTERN.
  if (LayoutEngine.VARIABLE_BLOCK_PATTERN.test(layoutBlock.className)) {
    minimumSize = Number(RegExp.$2); // Extract the minimum allowed width from the regex match.
    maximumSize = Number(RegExp.$3); // Extract the maximum allowed width from the regex match.

    // Adjust the number of blocks per row if the calculated unit width exceeds the maximum.
    if (blockDimensions[0].width > maximumSize) {
      while (blockDimensions[0].width > maximumSize) {
        blocksInRow = blocksInRow + 1; // Increase blocks per row to make units smaller.
        blockDimensions = LayoutEngine.distributeDimensions(wrapperDimension, blocksInRow);
        // Break if increasing blocks per row causes units to fall below the minimum size.
        if (blockDimensions[0].width < minimumSize) {
          break;
        }
      }
    }

    // Adjust the number of blocks per row if the calculated unit width falls below the minimum.
    if (blockDimensions[0].width < minimumSize) {
      while (blockDimensions[0].width < minimumSize && blocksInRow > 1) {
        blocksInRow = blocksInRow - 1; // Decrease blocks per row to make units larger.
        blockDimensions = LayoutEngine.distributeDimensions(wrapperDimension, blocksInRow);
        // Break if decreasing blocks per row causes units to exceed the maximum size.
        if (blockDimensions[0].width > maximumSize) {
          break;
        }
      }
    }
  }

  flexibleUnits         = [];   // Storage for units marked as flexible (elastic).
  currentLineUnits      = [];   // Buffer for units currently being accumulated for a single line.
  accumulatedBlocks     = 0;    // Running count of block spans in the current line.
  forecastedBlocks      = 0;    // Projected block span count including the next unit.
  staticBlocksTotalWidth = 0;   // Sum of widths of fixed (immutable) blocks within the current line.

  // Iterate over each unit element to determine its type and process its layout.
  for (idx = 0, len = unitElements.length; idx < len; idx++) {
    activeBlock = unitElements[idx];

    // Reset layout-related flags and clear any previous 'elastic-row-last' class.
    activeBlock.isElastic = false;
    activeBlock.isFixed   = false;
    activeBlock.isRegular = false;
    activeBlock.className = activeBlock.className.replace('elastic-row-last', '');

    // Check if the current block is designated as a fixed-width unit.
    if (LayoutEngine.IMMUTABLE_BLOCK_PATTERN.test(activeBlock.className)) {
      immutableBlockDimension = LayoutEngine.getOuterWidth(activeBlock); // Get its full rendered width.
      activeBlock.columnWidth = immutableBlockDimension; // Store this width on the element.
      activeBlock.isFixed     = true; // Mark the unit as fixed.
      staticBlocksTotalWidth += immutableBlockDimension; // Add to the total fixed width for the line.
    }
    // Check if the current block is designated as an elastic (flexible) unit.
    else if (LayoutEngine.ADAPTABLE_BLOCK_PATTERN.test(activeBlock.className)) {
      activeBlock.isElastic = true; // Mark the unit as elastic.
      flexibleUnits.push(activeBlock); // Add to the collection of flexible units.
    }
    // If neither fixed nor elastic, consider it a regular unit.
    else {
      activeBlock.isRegular = true; // Mark the unit as regular.
    }

    // Check if the current block is explicitly marked as the final unit in a row.
    if (LayoutEngine.TERMINAL_BLOCK_PATTERN.test(activeBlock.className)) {
      activeBlock.isFinal = true; // Mark the unit as final.
    }

    // Calculate the total span if the current block were added to the current line.
    forecastedBlocks = accumulatedBlocks + activeBlock.spanWidth;

    // Determine if the current line needs to be processed. This occurs if:
    // 1. The line capacity is reached or exceeded.
    // 2. It is the very last unit in the entire collection.
    // 3. The unit is explicitly marked as 'final'.
    if (forecastedBlocks >= blocksInRow || activeBlock === trailingBlock || activeBlock.isFinal) {
      // If the current block fits within or spans the entire row, add it to the current line's units.
      if (forecastedBlocks <= blocksInRow || activeBlock.spanWidth >= blocksInRow) {
        currentLineUnits.push(activeBlock);
      }
      // Process the accumulated units for the current line's layout.
      LayoutEngine.manageRowUnits(currentLineUnits, wrapperDimension, staticBlocksTotalWidth, flexibleUnits, blockDimensions);

      // If adding the current block caused the line capacity to be exceeded, it implies a new line starts here.
      if (forecastedBlocks > blocksInRow) {
        // Reset the fixed width sum for the new line, considering if the current block is fixed.
        if (activeBlock.isFixed) {
          staticBlocksTotalWidth = immutableBlockDimension;
        } else {
          staticBlocksTotalWidth = 0;
        }
        accumulatedBlocks    = activeBlock.spanWidth; // The current block starts the new line.
        forecastedBlocks     = activeBlock.spanWidth; // Forecast for this new line is just this block.
        // Initialize flexible units for the new line, including the current block if it's flexible.
        if (activeBlock.isElastic) {
          flexibleUnits = [activeBlock];
        } else {
          flexibleUnits = [];
        }
        currentLineUnits = [activeBlock]; // The current block is the sole member of the new line initially.

        // If this overflowed block is also the absolute last block, process this final, single-block line.
        if (activeBlock === trailingBlock) {
          LayoutEngine.manageRowUnits(currentLineUnits, wrapperDimension, staticBlocksTotalWidth, flexibleUnits, blockDimensions);
        }
      }
      // If the line was processed without overflow, prepare for a completely new line.
      else {
        staticBlocksTotalWidth = 0;  // Reset fixed width accumulator.
        accumulatedBlocks      = 0;  // Reset block span counter.
        forecastedBlocks       = 0;  // Reset forecasted count.
        flexibleUnits          = []; // Clear flexible units collection.
        currentLineUnits       = []; // Clear current line units buffer.
      }
      continue; // Proceed to the next unit in the main loop.
    }

    // If the line capacity has not been met, add the current block to the line and update counts.
    currentLineUnits.push(activeBlock);
    accumulatedBlocks += activeBlock.spanWidth;
  }

  return this; // Return the LayoutEngine instance for method chaining.
};

// This function determines the effective number of grid units intended for a single row.
LayoutEngine.calculateUnitsPerLine = function retrieveBlocksInLine(layoutBlock, unitElements) {
  var idx, len, blocksInRow, explicitUnitsPerLine;

  blocksInRow        = unitElements.length; // Default to the total number of elements as a fallback.
  explicitUnitsPerLine = false;           // Flag to track if the blocks per row is explicitly defined.

  // Check if the layoutBlock's class name specifies an explicit number of units per row.
  if (LayoutEngine.LINE_UNITS_COUNT_PATTERN.test(layoutBlock.className)) {
    blocksInRow        = Number(RegExp.$2); // Extract the numerical value from the regex match.
    explicitUnitsPerLine = true;          // Set flag to true as it's explicitly defined.
  }

  // Iterate through all unit elements to determine their individual span widths.
  for (idx = 0, len = unitElements.length; idx < len; idx++) {
    // Check if the current unit has a custom span width defined in its class name.
    if (LayoutEngine.BLOCK_SPAN_PATTERN.test(unitElements[idx].className)) {
      unitElements[idx].spanWidth = Number(RegExp.$2); // Assign the extracted custom span width.
      // If the overall blocks per row was NOT explicitly set, adjust it based on accumulated spans.
      if (explicitUnitsPerLine !== true) {
        blocksInRow += unitElements[idx].spanWidth - 1; // Adjust for the default span of 1.
      }
    }
    // If no custom span is defined, default the unit's span width to 1.
    else {
      unitElements[idx].spanWidth = 1;
    }
  }

  return blocksInRow; // Return the final calculated or explicitly defined number of blocks per row.
};

// This routine processes a given collection of units that constitute a single logical row.
LayoutEngine.manageRowUnits = function handleLineProcessing(units, wrapperDimension, staticBlocksTotalWidth, flexibleUnits, blockDimensions) {

  var activeBlock, accumulatedDimension, blockPosition, overallBlockWidth, trailingBlock, idx, iterJ, len, adaptableBlockWidths, adaptableBlocksTotalWidth;

  // If the total width of fixed blocks already equals or exceeds the wrapper dimension,
  // there's no space left for other blocks, so return early.
  if (staticBlocksTotalWidth >= wrapperDimension) {
    return;
  }

  accumulatedDimension = 0; // Temporary storage for width calculations within the loop.
  blockPosition        = 0; // Index tracker for the 'blockDimensions' array.
  overallBlockWidth    = staticBlocksTotalWidth; // Start with the width taken by fixed blocks.
  trailingBlock        = units[units.length - 1]; // Reference to the last unit in the current row.

  // Apply a special class to the last unit in the row if it's not already present, for styling purposes.
  if (trailingBlock.className.indexOf('elastic-row-last') == -1) {
    trailingBlock.className = trailingBlock.className + ' elastic-row-last';
  }

  // Iterate through each unit within the current row.
  for (idx = 0, len = units.length; idx < len; idx++) {
    activeBlock = units[idx];
    // Process only regular (non-fixed, non-elastic) units.
    if (activeBlock.isRegular) {
      // If a regular unit's span is too large for the available block dimensions,
      // assign it the full wrapper width and skip further calculations for it.
      if (activeBlock.spanWidth >= blockDimensions.length) {
        activeBlock.style.width = wrapperDimension + 'px';
        continue;
      }

      // Sum the widths from 'blockDimensions' corresponding to the current unit's span.
      for (iterJ = blockPosition; iterJ < (blockPosition + activeBlock.spanWidth); iterJ++) {
        accumulatedDimension += blockDimensions[iterJ].width;
      }

      overallBlockWidth     += accumulatedDimension; // Add this unit's calculated width to the row's total width.
      blockPosition         += activeBlock.spanWidth; // Advance the position for the next unit.
      activeBlock.style.width = accumulatedDimension + 'px'; // Set the CSS width property for the unit.
      accumulatedDimension  = 0; // Reset the accumulator for the next unit.
    }
  }

  // If there are flexible units in this row, distribute the remaining width among them.
  if (flexibleUnits.length > 0) {
    adaptableBlocksTotalWidth = 0; // Initialize total width for adaptable blocks.
    // Calculate individual widths for flexible units based on the remaining space.
    adaptableBlockWidths = LayoutEngine.distributeDimensions(wrapperDimension - overallBlockWidth, flexibleUnits.length);

    // Apply the newly calculated widths to each flexible unit.
    for (idx = 0, len = flexibleUnits.length; idx < len; idx++) {
      adaptableBlocksTotalWidth += adaptableBlockWidths[idx].width; // Sum up adaptable block widths.
      flexibleUnits[idx].style.width = adaptableBlockWidths[idx].width + 'px'; // Set CSS width.
    }
  }

  // If the trailing block is marked as 'final', adjust its right margin to fill any remaining space.
  if (trailingBlock.isFinal) {
    trailingBlock.style.marginRight = (wrapperDimension - overallBlockWidth - (adaptableBlocksTotalWidth || 0)) + 'px';
  }

};

// This algorithm meticulously distributes a total dimension (width) into a specified number of blocks,
// ensuring that the sum of rounded block dimensions equals the total dimension.
LayoutEngine.distributeDimensions = function proportionateRounding(totalDimension, numBlocks) {
  var resultCache, idx, currentUnit, blockFraction, blockDimensionsList, standardBlockWidth, aggregateUnitWidth, discrepancy,
      magnitudeDeviation, allocationQuotient, positiveAdjustment, changeVector;

  resultCache = LayoutEngine.distributeDimensions.resultCache; // Access the memoization cache.

  // Check if the result for this specific totalDimension and numBlocks combination is already cached.
  if (resultCache[totalDimension] && resultCache[totalDimension][numBlocks]) {
    return resultCache[totalDimension][numBlocks];
  }

  blockFraction      = 100 / numBlocks; // Calculate the percentage share for each block.
  blockDimensionsList = [];              // Initialize an array to store the calculated widths for each block.
  // Calculate a baseline width for each block, rounded to the nearest whole pixel.
  standardBlockWidth = Math.round(totalDimension * (blockFraction / 100));
  // Compute the sum of these rounded standard widths.
  aggregateUnitWidth = standardBlockWidth * numBlocks;

  // Populate the list with the initial standard width for all blocks.
  for (idx = 0; idx < numBlocks; idx++) {
    blockDimensionsList.push({width:standardBlockWidth});
  }

  // Calculate the difference (discrepancy) between the target total dimension and the aggregated rounded widths.
  discrepancy        = totalDimension - aggregateUnitWidth;
  magnitudeDeviation = Math.abs(discrepancy); // Get the absolute value of this difference.
  // Determine a factor for distributing the discrepancy, aiming for an even spread.
  allocationQuotient = numBlocks / (magnitudeDeviation + 1);
  // A boolean flag: true if widths need to be incremented, false if decremented.
  positiveAdjustment = (discrepancy > 0);
  changeVector       = -1; // Initial direction for applying adjustments (alternates).

  // If there's a non-zero discrepancy, distribute it pixel by pixel.
  if (discrepancy !== 0) {
    for (idx = 1; idx <= (Math.abs(discrepancy)); idx++) {
      // Select a block to adjust based on the current direction and allocation quotient.
      if (changeVector == -1) {
        currentUnit = blockDimensionsList[ blockDimensionsList.length - Math.floor(allocationQuotient * Math.round(idx/2)) ];
      }
      else {
        currentUnit = blockDimensionsList[Math.floor(allocationQuotient * Math.round(idx/2)) - 1];
      }

      // Apply either an increment or a decrement of 1 pixel to the selected block.
      if (positiveAdjustment) {
        currentUnit.width = standardBlockWidth + 1;
      }
      else {
        currentUnit.width = standardBlockWidth - 1;
      }
      changeVector = changeVector * -1; // Reverse the direction for the next adjustment.
    }
  }

  // Store the computed block dimensions in the cache to avoid re-calculation.
  if (!resultCache[totalDimension]) {
    resultCache[totalDimension] = {};
  }
  resultCache[totalDimension][numBlocks] = blockDimensionsList;

  return blockDimensionsList; // Return the array of adjusted block widths.
};

// Initializes the cache object for the 'distributeDimensions' function.
LayoutEngine.distributeDimensions.resultCache = {};

// A collection of supplementary functions designed to assist with various layout adjustments.
LayoutEngine.supportModules = {
  // Utility to make an element occupy the full available width of its parent container.
  'max-dimension'       : function maxDimensionHelper(jQScope, incorporateRoot) {
    var idx, len, jQElement, wrappedElements, collectionSize, collectionList;

    wrappedElements = jQScope.find('.full-width'); // Discover elements marked for 'full-width'.

    // Conditional inclusion of the root context based on configuration.
    if (incorporateRoot !== false && LayoutEngine.configData.includeRootAsTarget === true) {
      collectionList = []; // Initialize a temporary list.

      // If the root scope itself possesses the 'full-width' class, add it to the list.
      if (jQScope.hasClass('full-width')) {
        collectionList.push(jQScope[0]);
      }

      // Append all found elements to the consolidated list.
      for (idx = 0, len = wrappedElements.length; idx < len; idx++) {
        collectionList.push(wrappedElements[idx]);
      }

      wrappedElements = collectionList; // Update the primary list of elements to process.
    }

    collectionSize = wrappedElements.length; // Count of elements requiring width adjustment.

    // Iterate through each element and set its width.
    for (idx = 0; idx < collectionSize; idx++) {
      jQElement = $(wrappedElements[idx]);
      // Calculate width: parent's inner width minus the element's own horizontal padding, border, and margin.
      jQElement.width( jQElement.parent().width() - ( jQElement.outerWidth(true) - jQElement.width() ) );
    }

    return this; // Enable method chaining.
  },
  // Utility to ensure all direct children of a given element share an identical height.
  'equal-dimension'      : function equalDimensionHelper(jQScope, incorporateRoot) {
      var idx, iterJ, iteratedHeight, tallestHeight, wrappedChildUnits, childUnitCount, wrappedElements, collectionSize, collectionList;

    wrappedElements = jQScope.find('.same-height'); // Find containers designated for 'same-height' children.

    // Incorporate the root context if conditions are met.
    if(incorporateRoot !== false && LayoutEngine.configData.includeRootAsTarget === true){
      collectionList = [];

      if(jQScope.hasClass('same-height')){
        collectionList.push(jQScope[0]);
      }

      for(idx = 0, len = wrappedElements.length; idx < len; idx++){
        collectionList.push(wrappedElements[idx]);
      }

      wrappedElements = collectionList;
    }

    collectionSize  = wrappedElements.length; // Number of 'same-height' parent elements.

    // Process each 'same-height' container.
    for(idx = 0; idx < collectionSize; idx++) {
      wrappedChildUnits    = $(wrappedElements[idx]).find('> *'); // Get all immediate children.
      childUnitCount       = wrappedChildUnits.length; // Count of child units.
      tallestHeight        = 0; // Initialize variable to track the maximum height found.

      // Determine the greatest height among the child units.
      for(iterJ = 0; iterJ < childUnitCount; iterJ++){
        iteratedHeight = $(wrappedChildUnits[iterJ]).outerHeight(true); // Get the full computed outer height.
        tallestHeight  = (tallestHeight > iteratedHeight) ? tallestHeight : iteratedHeight; // Update if current is taller.
      }

      // Apply the determined maximum height to all child units.
      for(iterJ = 0; iterJ < childUnitCount; iterJ++) {
        $(wrappedChildUnits[iterJ]).css('height', tallestHeight);
      }
    }

    return this;
  },
  // Utility for adjusting the height of elements within the same logical row to be uniform.
  'equal-line-dimension'  : function (jQScope, incorporateRoot) {
    var idx, iterJ, iterK, iteratedHeight, tallestHeight, wrappedChildUnits, childUnitCount, wrappedElements, collectionSize, collectionList;

    wrappedElements = jQScope.find('.same-row-height'); // Identify elements requiring 'same-row-height' treatment.

    // Handle inclusion of the root context if configured.
    if(incorporateRoot !== false && LayoutEngine.configData.includeRootAsTarget === true){
      collectionList = [];

      if(jQScope.hasClass('same-row-height')){
        collectionList.push(jQScope[0]);
      }

      for(idx = 0, len = wrappedElements.length; idx < len; idx++){
        collectionList.push(wrappedElements[idx]);
      }

      wrappedElements = collectionList;
    }

    collectionSize  = wrappedElements.length; // Total count of 'same-row-height' containers.

    // Iterate through each container.
    for(idx = 0; idx < collectionSize; idx++) {
      wrappedChildUnits    = $(wrappedElements[idx]).find('> *'); // Select immediate children.
      childUnitCount       = wrappedChildUnits.length; // Number of child units.
      tallestHeight        = 0; // Initialize max height for the current row.
      var currentBlockRow  = []; // Buffer to hold units belonging to the current row.

      // Scan through child units to find row boundaries and calculate max height per row.
      for(iterJ = 0; iterJ < childUnitCount; iterJ++){
        iteratedHeight = $(wrappedChildUnits[iterJ]).outerHeight(true); // Get current unit's full height.
        tallestHeight  = (tallestHeight > iteratedHeight) ? tallestHeight : iteratedHeight; // Update row's max height.
        currentBlockRow.push(wrappedChildUnits[iterJ]); // Add unit to the current row buffer.

        // If the current unit is marked as the last in its row.
        if ($(wrappedChildUnits[iterJ]).hasClass('elastic-row-last')) {
          // Apply the calculated tallest height to all units in the completed row.
          for(iterK = 0; iterK < currentBlockRow.length; iterK++) {
            $(currentBlockRow[iterK]).css('height', tallestHeight);
          }
          tallestHeight = 0;      // Reset max height for the next row.
          currentBlockRow = []; // Clear the row buffer for the next iteration.
        }
      }
    }

    return this;
  },
  // Utility to ensure all direct children of an element maintain the same minimum height.
  'equal-min-dimension'  : function equalMinDimensionHelper(jQScope, incorporateRoot) {
    var idx, iterJ, iteratedHeight, tallestHeight, wrappedChildUnits, childUnitCount, wrappedElements, collectionSize, collectionList;

    wrappedElements = jQScope.find('.same-min-height'); // Find elements configured for 'same-min-height'.

    // Apply root context inclusion logic.
    if(incorporateRoot !== false && LayoutEngine.configData.includeRootAsTarget === true){
      collectionList = [];

      if(jQScope.hasClass('same-min-height')){
        collectionList.push(jQScope[0]);
      }

      for(idx = 0, len = wrappedElements.length; idx < len; idx++){
        collectionList.push(wrappedElements[idx]);
      }

      wrappedElements = collectionList;
    }

    collectionSize  = wrappedElements.length; // Number of parent elements to process.

    // Iterate through each 'same-min-height' container.
    for(idx = 0; idx < collectionSize; idx++) {
      wrappedChildUnits    = $(wrappedElements[idx]).find('> *'); // Select immediate children.
      childUnitCount       = wrappedChildUnits.length; // Count of child units.
      tallestHeight        = 0; // Initialize max height for current container.

      // Discover the greatest height among the child units.
      for(iterJ = 0; iterJ < childUnitCount; iterJ++){
        iteratedHeight = $(wrappedChildUnits[iterJ]).outerHeight(true); // Get full outer height.
        tallestHeight  = (tallestHeight > iteratedHeight) ? tallestHeight : iteratedHeight; // Update max height.
      }

      // Apply the determined maximum height as the minimum height for all child units.
      for(iterJ = 0; iterJ < childUnitCount; iterJ++) {
        $(wrappedChildUnits[iterJ]).css('min-height', tallestHeight);
      }
    }

    return this;
  },
  // Utility to expand an element to occupy the full available height of its parent.
  'max-vertical-dimension'  : function maxVerticalDimensionHelper(jQScope, incorporateRoot) {
    var idx, len, jQElement, adjustedDimension, wrappedElements, collectionSize, collectionList;

    var scopeElement = jQScope[0]; // Extract the raw DOM element from the jQuery object.
    var targetItems = LayoutEngine.querySelectorAll('.full-height', scopeElement); // Find elements matching '.full-height'.

    // Conditionally prepend the root scope to the list if it matches and is configured for inclusion.
    if (incorporateRoot !== false && LayoutEngine.configData.includeRootAsTarget === true) {
      if (scopeElement !== document && scopeElement.className.indexOf('full-height') !== -1) {
        targetItems.unshift(scopeElement); // Add the root element to the beginning.
      }
    }

    collectionSize = targetItems.length; // Get the total number of elements to process.

    // Iterate and adjust the height of each target element.
    for (idx = 0; idx < collectionSize; idx++) {
      jQElement = $(targetItems[idx]);
      // Calculate the new height: parent's height minus the element's vertical padding, border, and margin.
      adjustedDimension = jQElement.parent().height() - ( jQElement.outerHeight(true) - jQElement.height() );
      // Apply the height only if the calculated value is valid (non-negative and a number).
      if ( adjustedDimension < 0 || isNaN( Number(adjustedDimension) ) ) {
        continue;
      }
      jQElement.css('height', adjustedDimension);
    }

    return this;
  },
  // Utility to ensure an element takes up the full minimum height of its parent.
  'max-min-vertical-dimension'  : function maxMinVerticalDimensionHelper(jQScope, incorporateRoot) {
    var idx, len, jQElement, adjustedDimension, wrappedElements, collectionSize, collectionList;

    wrappedElements = jQScope.find('.full-min-height'); // Find elements designated for 'full-min-height'.

    // Apply conditional root context inclusion.
    if(incorporateRoot !== false && LayoutEngine.configData.includeRootAsTarget === true){
      collectionList = []; // Initialize a temporary collection.

      if(jQScope.hasClass('full-min-height')){
        collectionList.push(jQScope[0]);
      }

      for(idx = 0, len = wrappedElements.length; idx < len; idx++){
        collectionList.push(wrappedElements[idx]);
      }

      wrappedElements = collectionList; // Update the primary list of elements.
    }

    collectionSize = wrappedElements.length; // Count of elements to be processed.

    // Iterate through each element and apply minimum height adjustment.
    for (idx = 0; idx < collectionSize; idx++) {
        jQElement = $(wrappedElements[idx]);
        // Calculate new minimum height: parent's height minus vertical padding, border, and margin.
        adjustedDimension = jQElement.parent().height() - ( jQElement.outerHeight(true) - jQElement.height() );
        // Only set the min-height if the calculated value is valid.
        if ( adjustedDimension < 0 || isNaN( Number(adjustedDimension) ) ) {
            continue;
        }
        jQElement.css('min-height', adjustedDimension);
    }

    return this;
  }
};