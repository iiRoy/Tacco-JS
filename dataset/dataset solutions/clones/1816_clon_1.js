let/*
 * This line reads input from standard input.
 * It uses the 'fs' module for file system operations.
 * The input is read synchronously and decoded as UTF-8.
 */
input = require("fs") . readFileSync ( "/dev/stdin", "utf8" )

/**
 * The main function processes the input and computes the result.
 * It takes an object of utility functions as an argument.
 */
function     main ( { input, load, yesno, math_sum, math_max, math_min, log_json } ) {

  // Load the first BigInt value, assuming 1 row and 1 column.
  const   [ A ]   =   load ( 1 , 1 , BigInt )

  // Load the second value, defaulting to Number type and 1x1 dimensions.
  let [   B   ]   =   load ( )

  // Convert B to a BigInt after multiplying by 1000 and flooring.
  // This effectively shifts the decimal point for fixed-point arithmetic.
  B = BigInt ( Math . floor ( B * 1000 ) )

  // Perform the calculation: (A * B / 1000n) and convert to string.
  // The 1000n is a BigInt literal to ensure BigInt division.
  return  ( A * B / 1000n ) . toString ( )
}


// Split the raw input string by whitespace or newlines to get an array of tokens.
let inputs = input . split ( /[\s\n]/ )

// Execute the main logic, providing necessary utility functions.
let result = main ( {
  input,

  // A utility function to convert a boolean value to 'Yes' or 'No'.
  yesno:  value   =>  value ? 'Yes' : 'No' ,

  // A utility function to sum an array of numbers.
  math_sum: numbers => numbers . reduce ( ( acc , cur ) => acc + cur , 0 ) ,

  /**
   * A flexible loader function to extract data from the 'inputs' array.
   * @param {number} rows - Number of rows to load. Defaults to 1.
   * @param {number} cols - Number of columns to load. Defaults to 1.
   * @param {Function} type - The type to convert the loaded values to (e.g., Number, BigInt, String). Defaults to Number.
   * @returns {Array|any} The loaded data, potentially nested if cols > 1.
   */
  load ( rows = 1, cols = 1, type = Number ) {
    // Calculate the total number of elements to splice.
    const length = rows * cols

    // Extract the required number of elements from the 'inputs' array.
    let result = inputs . splice ( 0 , length )

    // If the type is not String, map the elements to the specified type.
    if ( type !== String ) result = result . map ( type )

    // If there are multiple columns, restructure the result into an array of arrays (column-major).
    if ( cols > 1 ) {
      const arrays = new Array ( cols )

      for ( let col = 0 ; col < cols ; col ++ ) {
        arrays[ col ] = new Array ( )

        for ( let row = 0 ; row < rows ; row ++ ) {
          // Push elements into the correct column array.
          arrays[ col ] . push ( result [ row * cols + col ] )
        }
      }
      result = arrays
    }

    // Return the processed result.
    return result
  } ,

  // A placeholder function to prevent infinite loops, though not used in this specific main function.
  inifinite_loop_preventer ( ) {
    throw new Error ( "Infinite loop" )
  } ,

  // Reference to the global math_max function.
  math_max ,

  // Reference to the global math_min function.
  math_min ,

  // A utility function to log a value as a JSON string.
  log_json ( value ) {
    console . log ( JSON . stringify ( value ) )
  } ,
} )

// Check if the result from the main function is undefined.
if ( result === undefined ) {
  // If undefined, log a warning to the console.
  console . warn ( "result is undefined" )
} else {
  // Otherwise, log the computed result to the console.
  console . log ( result )
}

/**
 * Finds the maximum value in an array of numbers.
 * @param {number[]} numbers - The array of numbers to search.
 * @param {number|null} initial_value - An optional initial value to compare against.
 * @returns {number} The maximum value found.
 */
function math_max ( numbers , initial_value = null ) {
  // Initialize result with either the first number or the provided initial_value.
  let result = ( initial_value === null ) ? numbers [ 0 ] : initial_value

  // Iterate through the numbers and update result if a larger number is found.
  for ( const n of numbers ) if ( n > result ) result = n

  // Return the final maximum value.
  return result
}

/**
 * Finds the minimum value in an array of numbers.
 * @param {number[]} numbers - The array of numbers to search.
 * @param {number|null} initial_value - An optional initial value to compare against.
 * @returns {number} The minimum value found.
 */
function math_min ( numbers , initial_value = null ) {
  // Initialize result with either the first number or the provided initial_value.
  let result = ( initial_value === null ) ? numbers [ 0 ] : initial_value

  // Iterate through the numbers and update result if a smaller number is found.
  for ( const n of numbers ) if ( n < result ) result = n

  // Return the final minimum value.
  return result
}