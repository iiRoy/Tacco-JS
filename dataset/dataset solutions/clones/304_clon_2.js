/*
 * This module contains utility functions and main logic
 * for processing year ranges to find leap years.
 */
function is_leap_year( current_year_value ) {
  // Determine if the given year is a leap year based on Gregorian calendar rules.
  if ( current_year_value % 4 !== 0 ) {
    return false;
  }

  if ( current_year_value % 400 === 0 ) {
    return true;
  }

  if ( current_year_value % 100 === 0 ) {
    return false;
  }

  return true;
}


// Acquire necessary system modules for file operations.
const file_system_access = require('fs');

// Read all incoming data from standard input, treating it as UTF-8 text.
let raw_input_data = file_system_access.readFileSync( '/dev/stdin', 'utf8' );

// Process the raw input: trim whitespace and split into individual lines.
const input_line_segments = raw_input_data.trim().split( "\n" );

// Iterate through each line of the processed input data.
for ( let line_index = 0; line_index < input_line_segments.length; line_index++ ) {
  // If the current line indicates the end of input, terminate processing.
  if ( input_line_segments[line_index] === "0 0" ) {
    break;
  }

  // Add a newline separator between outputs of different test cases, except for the first one.
  if ( line_index !== 0 ) {
    console.log( "" );
  }

  // Parse the start year from the current input line.
  // The '- 0' converts the string part to a number.
  let start_year = ( input_line_segments[line_index].split( " " ) )[0] - 0;
  // Parse the end year from the current input line.
  let end_year = ( input_line_segments[line_index].split( " " ) )[1] - 0;

  // Initialize an empty array to store all identified leap years within the current range.
  let leap_years_found = [];

  // Loop through the range of years from start_year to end_year (inclusive).
  for ( let year_iterator = start_year; year_iterator <= end_year; year_iterator++ ) {
    // Check if the current year in the iteration is a leap year.
    if ( is_leap_year( year_iterator ) ) {
      // If it is a leap year, add it to our collection.
      leap_years_found.push( year_iterator );
    }
  }

  // If no leap years were found in the specified range, output "NA".
  if ( leap_years_found.length === 0 ) {
    console.log( "NA" );
  }

  // If leap years were found, print each one on a new line.
  if ( leap_years_found.length !== 0 ) {
    leap_years_found.forEach( function ( found_year ) {
      console.log( found_year );
    } );
  }
}