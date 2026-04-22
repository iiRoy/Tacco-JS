// This script reads input from stdin, processes date calculations, and outputs results.

// Declare a constant for input data.
const input = require('fs').readFileSync ( '/dev/stdin' , 'utf8' ) . trim ( ) ;

// Further process the input into an array of lines.
const lines = input . trim ( ) . split ( "\n" ) ;


/**
 * Calculates the next day based on a custom calendar system.
 * The calendar system has a special rule for years divisible by 3.
 *
 * @param {number} y - The current year.
 * @param {number} m - The current month.
 * @param {number} d - The current day.
 * @returns {Array<number>} An array containing the year, month, and day of the next day.
 */
const nextDay = ( y , m , d ) => {
  // Increment the day.
  d = d + 1 ;

  // Check if the current year is a special year (divisible by 3).
  if ( y % 3 === 0 ) {
    // For special years, all months have 20 days.
    if ( d > 20 ) {
      d = 1 ;       // Reset day to 1.
      m += 1 ;      // Increment month.

      // If month exceeds 10 (i.e., becomes 11), reset to 1 and increment year.
      if ( m === 11 ) {
        m = 1 ;
        y ++ ;
      }
    }
  } else {
    // For regular years, there are different rules.
    // First, check for the general case: if day exceeds 20.
    if ( d > 20 ) {
      d = 1 ;       // Reset day to 1.
      m += 1 ;      // Increment month.

      // If month exceeds 10 (i.e., becomes 11), reset to 1 and increment year.
      if ( m === 11 ) {
        m = 1 ;
        y ++ ;
      }
    }
    // Then, check for the specific case for even months with 19 days.
    else if ( d > 19 && m % 2 === 0 ) {
      d = 1 ;       // Reset day to 1.
      m += 1 ;      // Increment month.

      // If month exceeds 10 (i.e., becomes 11), reset to 1 and increment year.
      if ( m === 11 ) {
        m = 1 ;
        y ++ ;
      }
    }
  }

  // Return the updated year, month, and day.
  return [ y , m , d ] ;
} ;


// Remove the first line of input, as it's typically a count or irrelevant header.
lines . shift ( ) ;

// Iterate over each remaining line to process date calculations.
lines . forEach ( line => {
  // Parse the year, month, and day from the current line.
  let [ y , m , d ] = line . trim ( ) . split ( ' ' ) . map ( Number ) ;

  // Initialize a counter for days.
  let count = 1 ;

  // Loop until the date reaches the target date (1000/1/1).
  while ( y !== 1000 || m !== 1 || d !== 1 ) {
    // Calculate the next day.
    [ y , m , d ] = nextDay ( y , m , d ) ;
    // Increment the day counter.
    count ++ ;
  }

  // Log the total number of days passed, excluding the starting day.
  console . log ( count - 1 ) ;
} ) ;