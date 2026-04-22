( function( ) {
  "use strict" ;

  // Retrieve necessary utility modules and define key constants for this component
  var platitudes = require( './platitudes' ) ; // A collection of common expressions
  var scramble = require( './rearrange-elements' ) ; // Function to randomize an array's order
  var bonusPhrase = "The Good News is True (COMPLIMENTARY)" ; // The special item for the center slot
  var upperBound = 25 ; // The total number of squares to be generated

  /**
   * Populates a grid-like structure with various phrases.
   * @param {Function} placeEntry - A callback function to add an item to the grid.
   */
  function fillGrid ( placeEntry ) {
    var idx = 0 ; // Initialize loop counter for grid positions

    // Randomize the order of the platitudes to ensure variety
    platitudes = scramble( platitudes ) ;

    // Iterate through each position to populate the grid
    for ( idx ; idx < upperBound ; idx += 1 ) {
      // Check if the current position is the designated center square
      if ( 12 === idx ) {
        placeEntry( bonusPhrase ) ; // Place the special bonus phrase in the center
        continue ; // Move to the next iteration, skipping the regular phrase placement
      }
      // For all other positions, place a platitude from the randomized list
      placeEntry( platitudes[ idx ] , idx ) ;
    }
  }

  // Expose the main grid population function for use by other modules
  module.exports . fillGrid = fillGrid ;

} ( ) ) ;