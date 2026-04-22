"use strict";/*
 * Entry point of the application.
 * Reads data from standard input and passes it to the main processing function.
 */
processInput(require("fs").readFileSync("/dev/stdin", "UTF-8"));

/**
 * Processes the raw input data to count anagram pairs.
 * @param {string} rawData The complete input received as a single string.
 */
function processInput(   rawData   )
{
  // Split the input string into an array of individual lines.
  rawData = rawData.split ( '\n' ) ;

  // Extract the first line, which represents the total count of strings to process.
  const   quantityOfStrings   = Number.parseInt( rawData.shift() )   ;

  // Transform each remaining string: split into characters, sort them, then rejoin.
  // This standardizes strings so anagrams become identical.
  rawData = rawData.map(   ( currentString )   =>
    currentString
      .split  (  ''  )
      .sort ( )
      .join  (  ''  )
  )   ;

  // Initialize a counter for identical (anagram) pairs.
  let matchingPairsCount = 0 ;

  // Iterate through the array of standardized strings with a nested loop.
  // The outer loop picks one string.
  for (   let outerIndex = 0 ;   outerIndex < quantityOfStrings ;   outerIndex++   )
  {
    // The inner loop compares the chosen string with all subsequent strings.
    for (   let innerIndex = outerIndex + 1 ;   innerIndex < quantityOfStrings ;   innerIndex++   )
    {
      // If two standardized strings are identical, increment the pair counter.
      if (   rawData [ outerIndex ]   ===   rawData [ innerIndex ]   )
      {
        matchingPairsCount++;
      }
    }
  }

  // Output the final count of matching (anagram) pairs to the console.
  console.log(   matchingPairsCount   )   ;
}