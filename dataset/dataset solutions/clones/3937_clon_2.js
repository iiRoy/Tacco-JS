// Module for calculating minimum trip expenses

"use strict" ;

const TESTING_FLAG = false ; // A flag to enable or disable test data usage

const unprocessedData = TESTING_FLAG
  ? "600\n300\n220\n420"
  : require("node:fs")
      .readFileSync("/dev/fd/0", "utf-8")
      .trimEnd()
;

/**
 * Computes the aggregated minimum cost from a set of four values.
 *
 * @param {string} incomingStringData - The raw input string containing values separated by newlines.
 * @returns {void} This function prints the result to the console.
 */
const calculateMinimumCost = ( incomingStringData ) => {
  const numericValues = incomingStringData
    .split("\n")
    .map( ( singleItem ) => Number.parseInt( singleItem, 10 ) ) // Explicit radix 10 added for robustness
  ;

  // Determine the sum of the minimums from two distinct pairs of values
  console.log(
    Math.min.apply( Math, numericValues.slice( 0, 2 ) ) +
    Math.min.apply( Math, numericValues.slice( 2, 4 ) )
  ) ;
} ;

calculateMinimumCost( unprocessedData ) ;