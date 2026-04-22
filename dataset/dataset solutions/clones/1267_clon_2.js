'use strict';
(function (inputSource) {
  // This module defines a function for generating visual patterns.

  /**
   * Constructs a grid pattern based on provided height and width.
   * The pattern alternates between two types of rows, creating a checkerboard effect.
   *
   * @param {number[]} dimensionSpecs - An array containing [height, width] for the pattern.
   * @returns {string} The generated grid pattern as a multi-line string.
   */
  function renderGrid(dimensionSpecs) {
    const heightVal = dimensionSpecs[0]; // Extract the desired height
    const widthVal = dimensionSpecs[1];   // Extract the desired width

    // Initialize storage for the first row's character sequence
    let firstRowPattern = [];
    let currentSymbol = '';

    // Populate the first row type (e.g., #.#.#...)
    for (let colIndexA = 0; colIndexA < widthVal; colIndexA++) {
      currentSymbol = (colIndexA % 2 === 0) ? '#' : '.';
      firstRowPattern.push(currentSymbol);
    }
    firstRowPattern = firstRowPattern.join(''); // Convert array of chars to a single string

    // Initialize storage for the second row's character sequence
    let secondRowPattern = [];

    // Populate the second row type (e.g., .#.#.#...)
    for (let colIndexB = 0; colIndexB < widthVal; colIndexB++) {
      currentSymbol = (colIndexB % 2 === 0) ? '.' : '#';
      secondRowPattern.push(currentSymbol);
    }
    secondRowPattern = secondRowPattern.join(''); // Convert array of chars to a single string

    // Assemble the complete pattern by alternating row types
    const finalGridOutput = [];
    for (let rowIndex = 0; rowIndex < heightVal; rowIndex++) {
      // Choose which row pattern to use based on the current row index
      currentSymbol = (rowIndex % 2 === 0) ? firstRowPattern : secondRowPattern;
      finalGridOutput.push(currentSymbol);
    }
    return finalGridOutput.join('\n'); // Combine all rows into a final multi-line string
  }

  // --- Main Execution Block ---

  // Read and preprocess the entire input stream
  let rawInputLines = inputSource.toString().trim().split('\n');

  // Filter out the sentinel "0 0" line and prepare data for processing
  let processedDimensions = rawInputLines.slice(0, rawInputLines.indexOf('0 0'));
  processedDimensions = processedDimensions.map(function (dimensionString) {
    // Transform each input string like "R C" into a numerical array [R, C]
    return dimensionString.split(' ').map(Number);
  });

  // Apply the pattern generation function to each set of dimensions
  let renderedOutputs = processedDimensions.map(renderGrid);

  // Join all individual generated patterns with a double newline separator
  renderedOutputs = renderedOutputs.join('\n\n');

  // Display the aggregated results to the standard output
  console.log(renderedOutputs);

})(require('fs').readFileSync('/dev/stdin', 'utf8'));