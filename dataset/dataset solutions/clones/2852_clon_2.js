/*
 * This module provides a utility for parsing structured input.
 * It's designed to read data line by line or in blocks.
 */
var INPUT_PARSER = ( function ( ) {
  /**
   * Creates a new instance of the input parser.
   * @param {string} inputString - The raw string data to parse.
   * @returns {ParserInstance} A new parser object.
   */
  function createParser ( inputString ) {
    return new ParserInstance( inputString ) ;
  }

  /**
   * Represents an instance of the input parser, managing its internal state.
   * @class
   * @param {string} sourceText - The full text input.
   */
  function ParserInstance ( sourceText ) {
    // Stores the input text split into individual lines.
    this._lines = sourceText.trim( ).split( '\n' ) ;
    // Keeps track of the current line index being processed.
    this._currentLineIndex = 0 ;
  }

  /**
   * Reads and extracts a single value from the current line.
   * If the current line is not yet split, it will be split by spaces in reverse order.
   * @param {boolean} [returnAsString=false] - If true, returns the value as a string; otherwise, as a number.
   * @returns {string|number} The extracted value.
   */
  ParserInstance.prototype.readSingleValue = function ( returnAsString ) {
    var currentLines = this._lines ,
        lineIdx = this._currentLineIndex ,
        extractedValue ;

    // If the current line hasn't been processed into a reversed array yet, do so.
    if ( typeof currentLines[ lineIdx ] === 'string' ) {
      currentLines[ lineIdx ] = currentLines[ lineIdx ].split( ' ' ).reverse( ) ;
    }

    // Pop the last element (which is the first in the original order due to reverse).
    extractedValue = currentLines[ lineIdx ].pop( ) ;

    // If the current line is now empty, advance to the next line.
    if ( ! currentLines[ lineIdx ].length ) {
      this._currentLineIndex ++ ;
    }

    // Return the value, either as a string or converted to a number.
    return returnAsString ? extractedValue : Number( extractedValue ) ;
  } ;

  /**
   * Reads an entire line and processes its values.
   * Increments the line index after reading.
   * @param {boolean} [keepStrings=false] - If true, returns values as strings; otherwise, as numbers.
   * @returns {Array<string|number>} An array of values from the line.
   */
  ParserInstance.prototype.readNextLine = function ( keepStrings ) {
    var lineValues = this._lines[ this._currentLineIndex ++ ].split( ' ' ) ;
    // Map values to numbers if not keeping them as strings.
    return keepStrings ? lineValues : lineValues.map( ( val ) => Number( val ) ) ;
  } ;

  /**
   * Reads a block of 'numRows' lines, treating each as a row in a matrix.
   * Each row is split by spaces.
   * @param {number} numRows - The number of rows to read.
   * @param {boolean} [returnStrings=false] - If true, returns matrix elements as strings; otherwise, as numbers.
   * @returns {Array<Array<string|number>>} A 2D array representing the matrix.
   */
  ParserInstance.prototype.readMatrix = function ( numRows, returnStrings ) {
    // Extract the specified number of rows and split each into elements.
    var matrixData = this._lines.slice( this._currentLineIndex, this._currentLineIndex += numRows ).map( ( rowStr ) => rowStr.split( ' ' ) ) ;

    // Convert elements to numbers if required.
    return returnStrings ? matrixData : matrixData.map( ( row ) => row.map( ( item ) => Number( item ) ) ) ;
  } ;

  /**
   * Reads a specified count of raw lines.
   * @param {number} count - The number of lines to read.
   * @param {boolean} [outputAsStrings=false] - If true, returns lines as strings; otherwise, attempts to convert to numbers.
   * @returns {Array<string|number>} An array of lines.
   */
  ParserInstance.prototype.readRawRows = function ( count, outputAsStrings ) {
    var extractedRows = this._lines.slice( this._currentLineIndex, this._currentLineIndex += count ) ;
    // Convert elements to numbers if required.
    return outputAsStrings ? extractedRows : extractedRows.map( ( line ) => Number( line ) ) ;
  } ;

  return createParser ;

} ) ( ) ;

// Initialize the data processor by reading from standard input.
var dataProcessor = INPUT_PARSER( require( 'node:fs' ).readFileSync( '/dev/stdin', 'utf-8' ) ) ;

/**
 * Dynamically creates a multi-dimensional array with a specified initial value.
 * @param {*} initialValue - The value to fill the array elements with.
 * @param {...number} dimensions - The dimensions of the array (e.g., dim1, dim2, dim3).
 * @returns {Array} The created multi-dimensional array.
 */
function createMultiDimArray ( initialValue ) {
  var args = arguments ,
      lengthCounter = args.length ,
      // Build the string representation of the array creation logic.
      arrayCreationString = "Array(args[" + --lengthCounter + "]).fill(0).map(_ => { return " + initialValue + "; })" ;

  // Wrap the array creation string for each additional dimension.
  while ( --lengthCounter ) {
    arrayCreationString = "Array(args[" + lengthCounter + "]).fill(0).map(_ => " + arrayCreationString + ")" ;
  }

  // Evaluate the constructed string to create the array.
  return eval( arrayCreationString ) ;
}

// Log the result of the main execution function to the console.
console.log( executeMainLogic( ) ) ;

/**
 * Orchestrates the primary logic of the program.
 * Reads input, processes it through 'calculateSolution', and returns the final result.
 * @returns {number} The final computed result.
 */
function executeMainLogic ( ) {
  // Read an initial integer value.
  var initialValueN = dataProcessor.readSingleValue( ) ;
  // Read two arrays of integers from subsequent lines.
  var firstInputArr = dataProcessor.readNextLine( ) ;
  var secondInputArr = dataProcessor.readNextLine( ) ;

  // Initialize temporary arrays for sorting values.
  var smallerValues = [ ] ,
      largerValues = [ ] ;

  // Populate temporary arrays based on comparison of elements from firstInputArr and secondInputArr.
  // This loop runs for a fixed count of 3 iterations.
  for ( var loopIndex = 0 ; loopIndex < 3 ; loopIndex ++ ) {
    if ( firstInputArr[ loopIndex ] < secondInputArr[ loopIndex ] ) {
      smallerValues.push( firstInputArr[ loopIndex ] ) ;
      largerValues.push( secondInputArr[ loopIndex ] ) ;
    }
  }

  // Calculate an intermediate result using the sorted values.
  var intermediateResult = calculateSolution( initialValueN, smallerValues, largerValues ) ;

  // Clear temporary arrays for the next processing stage.
  smallerValues = [ ] ;
  largerValues = [ ] ;

  // Repopulate temporary arrays, reversing the comparison logic.
  for ( var loopIndex = 0 ; loopIndex < 3 ; loopIndex ++ ) {
    if ( secondInputArr[ loopIndex ] < firstInputArr[ loopIndex ] ) {
      smallerValues.push( secondInputArr[ loopIndex ] ) ;
      largerValues.push( firstInputArr[ loopIndex ] ) ;
    }
  }

  // Return the final result after another call to calculateSolution.
  return calculateSolution( intermediateResult, smallerValues, largerValues ) ;
}

/**
 * Solves a specific optimization problem based on the provided parameters.
 * The logic adapts based on the number of elements in 'arrA'.
 * @param {number} currentN - The current budget or total value.
 * @param {Array<number>} arrA - An array of 'costs' or 'initial values'.
 * @param {Array<number>} arrB - An array of 'benefits' or 'replacement values'.
 * @returns {number} The optimized result.
 */
function calculateSolution ( currentN, arrA, arrB ) {
  var arrayLength = arrA.length ;

  // Base case: If no items, return currentN as is.
  if ( arrayLength === 0 ) {
    return currentN ;
  }

  // Case: Only one item type.
  if ( arrayLength === 1 ) {
    // Calculate how many times the item can be taken.
    var numItems = currentN / arrA[ 0 ] | 0 ; // Integer division.
    // Subtract cost and add benefit for the chosen items.
    currentN -= numItems * arrA[ 0 ] ;
    currentN += numItems * arrB[ 0 ] ;
    return currentN ;
  }

  // Case: Three item types (dynamic programming approach).
  if ( arrayLength === 3 ) {
    // Initialize DP array with -1 (indicating not reachable) up to currentN.
    var dynamicProgrammingArray = createMultiDimArray( -1, currentN + 1 ) ;
    // Base case: 0 cost yields initial N.
    dynamicProgrammingArray[ 0 ] = currentN ;

    // Iterate through each item type.
    for ( var itemTypeIndex = 0 ; itemTypeIndex < 3 ; itemTypeIndex ++ ) {
      var itemCost = arrA[ itemTypeIndex ] ,
          itemBenefit = arrB[ itemTypeIndex ] ;

      // Iterate backwards from currentN down to the itemCost.
      // This ensures each item is considered multiple times without affecting previous calculations within the same item type.
      for ( var currentSum = itemCost ; currentSum <= currentN ; currentSum ++ ) {
        // If the state (currentSum - itemCost) is not reachable, skip.
        if ( dynamicProgrammingArray[ currentSum - itemCost ] === -1 ) {
          continue ;
        }
        // Update the DP array: either keep current value or update with new benefit.
        dynamicProgrammingArray[ currentSum ] = Math.max( dynamicProgrammingArray[ currentSum ], dynamicProgrammingArray[ currentSum - itemCost ] + itemBenefit ) ;
      }
    }
    // Return the maximum value found in the DP array.
    return Math.max( ...dynamicProgrammingArray ) ;
  }

  // Case: Two item types (brute force with optimization for one item).
  var firstCost, firstBenefit, secondCost, secondBenefit ;

  // Determine which item type has a better "profit ratio" (benefit - cost) / cost.
  // The item with the higher ratio is considered 'first' for optimization.
  if ( ( arrB[ 0 ] - arrA[ 0 ] ) / arrA[ 0 ] < ( arrB[ 1 ] - arrA[ 1 ] ) / arrA[ 1 ] ) {
    firstCost = arrA[ 1 ] ;
    firstBenefit = arrB[ 1 ] ;
    secondCost = arrA[ 0 ] ;
    secondBenefit = arrB[ 0 ] ;
  } else {
    firstCost = arrA[ 0 ] ;
    firstBenefit = arrB[ 0 ] ;
    secondCost = arrA[ 1 ] ;
    secondBenefit = arrB[ 1 ] ;
  }

  // Calculate the maximum possible number of the 'first' item type.
  var maxFirstItems = currentN / firstCost | 0 ,
      maximizedResult = 0 ; // Initialize the maximum profit found.

  // Iterate a limited number of times for the 'first' item type.
  // The upper bound `5000` is a heuristic or problem constraint.
  for ( var iterationCount = 0 ; iterationCount <= 5000 && iterationCount <= maxFirstItems ; iterationCount ++ ) {
    var firstItemCount = maxFirstItems - iterationCount ; // Try different counts for the first item.
    var remainingN = currentN - firstItemCount * firstCost ; // Remaining budget after buying 'first' items.
    var secondItemCount = remainingN / secondCost | 0 ; // How many 'second' items can be bought.

    // Calculate the total profit for this combination.
    remainingN -= secondItemCount * secondCost ; // Subtract cost of 'second' items.
    remainingN += firstItemCount * firstBenefit ; // Add benefit of 'first' items.
    remainingN += secondItemCount * secondBenefit ; // Add benefit of 'second' items.

    // Update the maximum profit if a better one is found.
    if ( maximizedResult < remainingN ) {
      maximizedResult = remainingN ;
    }
  }
  return maximizedResult ;
}