"use   strict" // Enforce stricter parsing and error handling for better code quality

/*
 * This module contains utility functions for processing numeric data
 * and a main execution flow for handling program input.
 */

/**
 * Recursively calculates a transformed value based on the input.
 *
 * @param {number} inputVal - The numerical value to process.
 * @returns {number} The transformed numerical result.
 */
function   computeValue (   inputVal   ) {
  // This is the base condition for the recursion.
  if  (  inputVal  ===  1  ) {
    return  1  ;
  }
  // This line performs the recursive calculation.
  return   computeValue  (  inputVal  /  2  )  *  2  +  1  ;
}

/**
 * The primary entry point for the application.
 * It processes the raw input string and outputs a calculated result.
 *
 * @param {string} rawData - The raw string input from the environment.
 */
function    ExecuteProgram   (   rawData   ) {
  // First, clean up any unnecessary whitespace from the input string.
  rawData  =  rawData.trim  (  )  ;

  // Convert the cleaned string into a numerical format.
  let   initialValue   =   Number (   rawData   )   ;

  // Call the recursive function to obtain the final computed result.
  let   finalResult   =   computeValue  (  initialValue  )  ;

  // Display the final calculated outcome to the standard output.
  console.log   (   finalResult   )   ;
}

// This line reads the program input from standard input and starts the execution.
ExecuteProgram  (  require  (  "fs"  )  .  readFileSync  (  "/dev/stdin"  ,  "utf8"  )  )  ;