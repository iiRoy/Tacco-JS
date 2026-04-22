(function () {
  "use strict"; // Enforce stricter parsing and error handling in the script.

  // Module dependencies for content and utility functions.
  const contentBank = require('./cliches'); // Imports a collection of pre-defined phrases or "cliches".
  const arrayRandomizer = require('./fisher-yates'); // Imports a utility function for shuffling array elements.

  // Configuration for the grid generation process.
  const bonusSquareText = "I affirm the truth of the Gospel (FREE)"; // The specific text for the central bonus square.
  const desiredSquareCount = 25; // The total number of squares to be generated for the grid.

  /**
   * Orchestrates the creation of a grid by populating its individual squares.
   * It shuffles the available content and places a special item in the center.
   * @param {function(string, number?)} renderSquareFn - A callback function responsible
   *        for rendering each individual square. It receives the square's content
   *        and optionally its sequential index.
   * @returns {void}
   */
  function constructGridSegments(renderSquareFn) {
    // Input validation: Ensure the provided rendering function is actually a function.
    if (typeof renderSquareFn !== 'function') {
      // If the callback is invalid, log an error and terminate the operation.
      console.error("Error: A valid function is required to render grid squares.");
      return;
    }

    // Determine the index for the central, special square (e.g., 12 for a 25-square grid).
    const centralItemIdx = Math.floor(desiredSquareCount / 2);

    // Create a shuffled version of the content bank.
    // Using a spread operator ensures the original `contentBank` array remains immutable.
    let randomizedContent = arrayRandomizer([...contentBank]);

    // Iterate through each desired square position to populate the grid.
    for (let currentPosition = 0; currentPosition < desiredSquareCount; currentPosition++) {
      let squareContent; // Variable to hold the text for the current square.

      // Check if the current position corresponds to the central bonus square.
      if (currentPosition === centralItemIdx) {
        squareContent = bonusSquareText; // Assign the special bonus text.
      } else {
        // For other squares, pull content from the randomized list.
        // Include a fallback string in case the randomizedContent array is unexpectedly short.
        squareContent = randomizedContent[currentPosition] || "[N/A]";
      }

      // Invoke the provided callback function to render the square with its determined content and index.
      renderSquareFn(squareContent, currentPosition);
    }
  }

  // Export the primary function to make it accessible to other modules.
  // This function serves as the entry point for generating the grid layout.
  module.exports.constructGridSegments = constructGridSegments;
}());