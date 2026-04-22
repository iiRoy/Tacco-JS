// This function processes a given string to ascertain a specific festive period announcement.
function determineHolidayGreeting( inputStringData ) {

  /*
   * Parses the incoming string data into an integer.
   * The radix of 10 ensures the number is interpreted in base-10.
   */
  const numericDayIndicator = parseInt( inputStringData, 10 ) ;
  
  // Evaluate the numerical indicator to output the appropriate holiday message.
  if ( numericDayIndicator === 25 )
  {
    console.log( 'Christmas' ) ; // The primary holiday.
  }
  else if ( numericDayIndicator === 24 )
  {
    console.log( 'Christmas Eve' ) ; // The day immediately preceding the holiday.
  }
  else if ( numericDayIndicator === 23 )
  {
    console.log( 'Christmas Eve Eve' ) ; // Two days prior to the holiday.
  }
  else
  {
    // Default message for any other numerical input.
    console.log( 'Christmas Eve Eve Eve' ) ;
  }

} // End of the determineHolidayGreeting procedure.


// Execute the holiday determination process using data sourced from standard input.
determineHolidayGreeting(
  require( 'fs' )
    .readFileSync( '/dev/stdin', 'utf8' )
) ;