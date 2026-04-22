// This module provides utilities for parsing input data from a string source.
var INPUT_PROCESSOR = ( function () {
  // Factory function to create a new InputBuffer instance.
  function createInputBuffer(sourceString) {
    return new DataBuffer(sourceString);
  }

  // Constructor for the DataBuffer class.
  function DataBuffer(inputContent) {
    // Store lines of input, trimmed and split by newline.
    this.allLines = inputContent.trim().split("\n");
    // Pointer to the current line being processed.
    this.lineCursor = 0;
  }

  // Method to extract the next individual data element (token).
  // If 'asString' is true, returns as string; otherwise, attempts conversion to number.
  DataBuffer.prototype.extractNextElement = function (asString) {
    var lineSegments = this.allLines,
        currentLineIndex = this.lineCursor,
        extractedToken;

    // If the current line is still a single string, parse it into tokens.
    // It's processed from right to left, so reverse it first.
    if (typeof lineSegments[currentLineIndex] === "string") {
      lineSegments[currentLineIndex] = lineSegments[currentLineIndex].split(" ").reverse();
    }

    // Pop the last token from the current line's array.
    extractedToken = lineSegments[currentLineIndex].pop();

    // If the current line is now empty, advance the line cursor.
    if ( !lineSegments[currentLineIndex].length ) {
      this.lineCursor++;
    }

    // Return the token, either as a string or a number.
    return asString ? extractedToken : Number(extractedToken);
  };

  // Method to read and parse an entire line of data.
  // If 'asStrings' is true, returns array of strings; otherwise, array of numbers.
  DataBuffer.prototype.readLineTokens = function (asStrings) {
    // Increment cursor and split the line.
    var tokensInLine = this.allLines[this.lineCursor++].split(" ");
    // Return tokens, optionally converted to numbers.
    return asStrings ? tokensInLine : tokensInLine.map( val => Number(val) );
  };

  // Method to read and parse multiple lines as a 2D array (matrix).
  // 'numRows' specifies how many lines to read.
  // If 'asStrings' is true, returns 2D array of strings; otherwise, 2D array of numbers.
  DataBuffer.prototype.readMatrixData = function (numRows, asStrings) {
    var collectedRows = this.allLines.slice(this.lineCursor, this.lineCursor += numRows).map( rowStr => rowStr.split(" ") );
    // Return the matrix, optionally with inner elements converted to numbers.
    return asStrings ? collectedRows : collectedRows.map( innerArr => innerArr.map( val => Number(val) ) );
  };

  // Method to read multiple lines as raw string segments.
  // 'numSegments' specifies how many lines to read.
  // If 'asStrings' is true, returns array of strings; otherwise, array of numbers.
  DataBuffer.prototype.readRawSegments = function (numSegments, asStrings) {
    var rawSegments = this.allLines.slice(this.lineCursor, this.lineCursor += numSegments);
    // Return segments, optionally converted to numbers.
    return asStrings ? rawSegments : rawSegments.map( val => Number(val) );
  };

  // The module exposes only the factory function.
  return createInputBuffer;
} )();


// Initialize the input data stream by reading from standard input.
var currentDataStream = INPUT_PROCESSOR(require("fs").readFileSync("/dev/stdin", "utf8"));

// Function to dynamically construct a multi-dimensional array.
// 'initialValue' is the default value for the innermost elements.
// Subsequent arguments define the dimensions of the array.
function createNestedArray(initialValue) {
  var dimensionSpecs = arguments,
      numberOfDimensions = dimensionSpecs.length,
      arrayCreationExpression = `Array(dimensionSpecs[${--numberOfDimensions}]).fill(0).map( _ => { return ${initialValue}; } )`;

  // Build the nested array creation string from outer to inner dimensions.
  while ( --numberOfDimensions ) {
    arrayCreationExpression = `Array(dimensionSpecs[${numberOfDimensions}]).fill(0).map( _ => ${arrayCreationExpression} )`;
  }

  // Evaluate the constructed string to create the array.
  return eval(arrayCreationExpression);
}

// Execute the primary processing logic and print its outcome.
console.log(processScenario());

// The primary function orchestrating the data processing steps.
function processScenario() {
  // Read the initial resource limit or capacity.
  var totalResource = currentDataStream.extractNextElement();
  // Read the first set of item costs/values.
  var itemCostsA = currentDataStream.readLineTokens();
  // Read the second set of item benefits/values.
  var itemBenefitsB = currentDataStream.readLineTokens();

  // Initialize arrays to store filtered items for the first optimization stage.
  var itemsForStageOneCosts = [],
      itemsForStageOneBenefits = [];

  // Populate arrays based on a condition: cost < benefit.
  for ( var itemIndex = 0; itemIndex < 3; itemIndex++ ) {
    if ( itemCostsA[itemIndex] < itemBenefitsB[itemIndex] ) {
      itemsForStageOneCosts.push(itemCostsA[itemIndex]);
      itemsForStageOneBenefits.push(itemBenefitsB[itemIndex]);
    }
  }

  // Perform the first optimization calculation.
  var firstStageResult = calculateMaxGain(totalResource, itemsForStageOneCosts, itemsForStageOneBenefits);

  // Reset arrays for the second optimization stage.
  itemsForStageOneCosts = [];
  itemsForStageOneBenefits = [];

  // Populate arrays based on an inverted condition: benefit < cost.
  for ( var itemIndex = 0; itemIndex < 3; itemIndex++ ) {
    if ( itemBenefitsB[itemIndex] < itemCostsA[itemIndex] ) {
      itemsForStageOneCosts.push(itemBenefitsB[itemIndex]);
      itemsForStageOneBenefits.push(itemCostsA[itemIndex]);
    }
  }

  // Perform the second optimization calculation using the result of the first stage.
  return calculateMaxGain(firstStageResult, itemsForStageOneCosts, itemsForStageOneBenefits);
}

// Function to calculate the maximum gain using dynamic programming.
// 'resourceLimit' is the maximum capacity.
// 'itemCosts' is an array of costs for items.
// 'itemBenefits' is an array of benefits for items.
function calculateMaxGain(resourceLimit, itemCosts, itemBenefits) {
  var numItems = itemCosts.length; // Number of items available.

  // Base case: If no items, no change in resource.
  if ( numItems === 0 ) {
    return resourceLimit;
  }

  // Base case: If only one item, simple greedy calculation.
  if ( numItems === 1 ) {
    var singleCost = itemCosts[0];
    var singleBenefit = itemBenefits[0];
    // Calculate how many times the item can be 'bought'.
    var purchaseCount = Math.floor(resourceLimit / singleCost);
    // Reduce resource by total cost.
    resourceLimit -= purchaseCount * singleCost;
    // Increase resource by total benefit.
    resourceLimit += purchaseCount * singleBenefit;
    return resourceLimit;
  }

  // Initialize a dynamic programming table.
  // 'dynamicProgrammingTable[k]' will store the maximum resource
  // after spending exactly 'k' units of resource.
  var dynamicProgrammingTable = Array(resourceLimit + 1);
  // If 0 resource is spent, the resource limit remains 'resourceLimit'.
  dynamicProgrammingTable[0] = resourceLimit;

  // Iterate through each item.
  for ( var itemIdx = 0; itemIdx < numItems; itemIdx++ ) {
    var currentItemCost = itemCosts[itemIdx],
        currentItemBenefit = itemBenefits[itemIdx];

    // Iterate through capacities from current item's cost up to the total limit.
    // This processes the DP table from left to right for each item.
    for ( var currentCapacity = currentItemCost; currentCapacity <= resourceLimit; currentCapacity++ ) {
      // If the previous state (before spending currentItemCost) is not reachable, skip.
      if ( dynamicProgrammingTable[currentCapacity - currentItemCost] === undefined ) {
        continue;
      }

      // Calculate the potential new resource value if this item is 'bought'.
      var potentialNewResource = dynamicProgrammingTable[currentCapacity - currentItemCost] + currentItemBenefit - currentItemCost;

      // Update the DP table if this path yields a better (higher) resource value
      // or if the current capacity hasn't been reached yet.
      if ( dynamicProgrammingTable[currentCapacity] === undefined || dynamicProgrammingTable[currentCapacity] < potentialNewResource ) {
        dynamicProgrammingTable[currentCapacity] = potentialNewResource;
      }
    }
  }

  // Find the maximum resource value across a relevant range of the DP table.
  // The range is usually from `resourceLimit - some_offset` to `resourceLimit`
  // to account for cases where not all capacity is used.
  var finalMaxGain = resourceLimit; // Initialize with the original limit as a baseline.
  for ( var checkCapacity = Math.max(0, resourceLimit - 5000); checkCapacity <= resourceLimit; checkCapacity++ ) {
    if ( finalMaxGain < dynamicProgrammingTable[checkCapacity] ) {
      finalMaxGain = dynamicProgrammingTable[checkCapacity];
    }
  }

  return finalMaxGain;
}