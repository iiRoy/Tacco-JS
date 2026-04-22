'use strict' ; // Apply strict mode for enhanced error handling

/**
 * Executes the primary logic based on provided input data.
 * This function determines if two input month numbers belong to the same "group"
 * according to a specific set of rules.
 *
 * @param {string} incomingDataString - The raw string input, typically from a file or stdin.
 */
function ProcessInputData ( incomingDataString )
{
  // Parse the input string: split by newline, take the first line, then split by space.
  const tokenizedValues = incomingDataString . split ( "\n" ) [ 0 ] . split ( " " ) ;

  // Convert the first token into an integer, specifying base 10.
  const firstMonthIdentifier = parseInt ( tokenizedValues [ 0 ] , 10 ) ;
  // Convert the second token into an integer, also using base 10.
  const secondMonthIdentifier = parseInt ( tokenizedValues [ 1 ] , 10 ) ;

  // Define a constant array representing months with 31 days (Group 1).
  const daysInMonthSet1 = [ 1 , 3 , 5 , 7 , 8 , 10 , 12 ] ;
  // Define a constant array representing months with 30 days (Group 2).
  const daysInMonthSet2 = [ 4 , 6 , 9 , 11 ] ;

  // Check the conditions:
  // 1. Both month identifiers are 2 (February).
  // 2. Both month identifiers are found in `daysInMonthSet1` (31-day months).
  // 3. Both month identifiers are found in `daysInMonthSet2` (30-day months).
  // If any of these complex conditions are met, it means they share a common property (same number of days, ignoring leap year for Feb).
  if ( ( firstMonthIdentifier === 2 && firstMonthIdentifier === secondMonthIdentifier ) ||
       ( daysInMonthSet1 . indexOf ( firstMonthIdentifier ) >= 0 && daysInMonthSet1 . indexOf ( secondMonthIdentifier ) >= 0 ) ||
       ( daysInMonthSet2 . indexOf ( firstMonthIdentifier ) >= 0 && daysInMonthSet2 . indexOf ( secondMonthIdentifier ) >= 0 ) )
  {
    console . log ( "Yes" ) ; // Output "Yes" if the condition evaluates to true.
  }
  else
  {
    console . log ( "No" ) ; // Otherwise, output "No".
  }
}

// Call the main processing function, providing the content read from standard input.
ProcessInputData (
  require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" )
) ;