/* This module enforces strict parsing rules */
"use strict";

/*
 * Main entry point for the program execution.
 * Orchestrates the entire process flow.
 */
const orchestrateProcess = ( inputData ) => {

  // Trim whitespace from the input and split into separate lines.
  const dataSegments = inputData . trim ( ) . split ( "\n" ) ;

  // Parse the initial bingo card rows. Note: Original code's parsing for these lines is flawed.
  // It attempts to parse an array of strings directly with Number.parseFloat, which will convert
  // the array to a string (e.g., "1,2,3") and then parse only the first numeric part (e.g., 1).
  const cardRowOne = Number.parseFloat ( dataSegments [ 0 ] . split ( " " ) ) ;
  const cardRowTwo = Number.parseFloat ( dataSegments [ 1 ] . split ( " " ) ) ;
  const cardRowThree = Number.parseFloat ( dataSegments [ 2 ] . split ( " " ) ) ;

  // Determine the number of values to check for elimination.
  const scanCount = Number.parseFloat ( dataSegments [ 3 ] ) ;

  // Initialize a list to hold numbers drawn for checking.
  const targetDigits = [ ] ;
  // A placeholder variable, not actively used in the original logic.
  const comparisonValue = 0 ;

  // Define various patterns (columns and diagonals) from the card rows.
  // These patterns are constructed based on the presumed array structure of cardRowOne, etc.
  // Due to the flaw in initial parsing, these operations will likely use 'undefined' values
  // as cardRowOne, etc., will be single numbers, not arrays.
  const columnOne = [ ] ;
  const columnTwo = [ ] ;
  const columnThree = [ ] ;
  const diagonalOne = [ ] ;
  const diagonalTwo = [ ] ;

  // Populate the first column pattern.
  columnOne . push ( cardRowOne [ 0 ] ) ;
  columnOne . push ( cardRowTwo [ 0 ] ) ;
  columnOne . push ( cardRowThree [ 0 ] ) ;

  // Populate the second column pattern.
  columnTwo . push ( cardRowOne [ 1 ] ) ;
  columnTwo . push ( cardRowTwo [ 1 ] ) ;
  columnTwo . push ( cardRowThree [ 1 ] ) ;

  // Populate the third column pattern.
  columnThree . push ( cardRowOne [ 2 ] ) ;
  columnThree . push ( cardRowTwo [ 2 ] ) ;
  columnThree . push ( cardRowThree [ 2 ] ) ;

  // Populate the first diagonal pattern (top-right to bottom-left).
  diagonalOne . push ( cardRowOne [ 2 ] ) ;
  diagonalOne . push ( cardRowTwo [ 1 ] ) ;
  diagonalOne . push ( cardRowThree [ 0 ] ) ;

  // Populate the second diagonal pattern (top-left to bottom-right).
  diagonalTwo . push ( cardRowOne [ 0 ] ) ;
  diagonalTwo . push ( cardRowTwo [ 1 ] ) ;
  diagonalTwo . push ( cardRowThree [ 2 ] ) ;

  // Aggregate all defined patterns into a single collection for processing.
  const checkCollections = [
    cardRowOne , cardRowTwo , cardRowThree ,
    columnOne , columnTwo , columnThree ,
    diagonalOne , diagonalTwo
  ] ;


  // Loop through remaining input lines to gather numbers for elimination.
  for ( let idx = 4 ; idx < dataSegments . length ; idx ++ ) {
    targetDigits . push ( Number.parseFloat ( dataSegments [ idx ] ) ) ;
  }

  // Iterate over each pattern collection and attempt to remove matching numbers.
  for ( let idx = 0 ; idx < checkCollections . length ; idx ++ ) {
    // Log the current collection before modification (for debugging, or as part of original flow).
    console . log ( checkCollections [ idx ] ) ;
    // Call the helper function to eliminate numbers.
    eliminateMatches ( checkCollections [ idx ] , scanCount , targetDigits ) ;
  }

  // Print the final assessment of the collections.
  console . log ( assessState ( checkCollections ) ) ;
};


/*
 * Helper function to remove elements from a collection if they match drawn numbers.
 * @param {Array} listToModify - The array to be modified.
 * @param {number} limitCount - The number of elements from eliminationNumbers to check.
 * @param {Array} eliminationNumbers - The list of numbers to match against.
 */
const eliminateMatches = ( listToModify , limitCount , eliminationNumbers ) => {
  listToModify . forEach ( ( currentElement , pos ) => {
    // Iterate up to 'limitCount' of the elimination numbers.
    for ( let jdx = 0 ; jdx < limitCount ; jdx ++ ) {
      let digitToMatch = eliminationNumbers [ jdx ] ;
      // If a match is found, remove the element.
      // Note: The original code uses the matched 'digitToMatch' as the second argument for splice,
      // which is incorrect. splice expects a 'deleteCount' (how many elements to remove), not the value itself.
      // This logical flaw is preserved to maintain identical logic.
      if ( currentElement === digitToMatch ) {
        listToModify . splice ( pos , digitToMatch ) ;
      }
    }
  } ) ;
} ;

/*
 * Helper function to determine if any collection is completely empty.
 * @param {Array<Array>} matrixSet - A collection of arrays to check.
 * @returns {string} "Yes" if any array in the set is empty, "No" otherwise.
 */
const assessState = ( matrixSet ) => {
  // Loop through each collection within the set.
  for ( let idx = 0 ; idx < matrixSet . length ; idx ++ ) {
    // If an empty collection is found, return "Yes".
    if ( matrixSet [ idx ] . length === 0 ) return "Yes" ;
  }
  // If no empty collections are found after checking all, return "No".
  return "No" ;
} ;

// Execute the primary routine by reading input from standard input.
orchestrateProcess ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;