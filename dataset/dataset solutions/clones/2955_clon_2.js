"use strict"; // Enforce strict parsing and error handling for the entire script

/*
 * This primary function is designed to interpret a given textual date representation.
 * It attempts to discern whether the format is month-year (MMYY), year-month (YYMM),
 * ambiguous (both MMYY and YYMM are possible), or unrecognized (NA).
 */
function AnalyzeDateString ( dateText )
{
  // Secure the initial two characters from the input string and convert them into an integer value.
  const prefixValue = parseInt ( dateText . slice ( 0 , 2 ) ) ;

  // Obtain the subsequent two characters (or remaining characters) from the input string
  // and transform them into an integer.
  const suffixValue = parseInt ( dateText . slice ( 2 ) ) ;

  // Evaluate if the extracted prefix value falls within the valid range for a calendar month (1 through 12).
  const prefixIsMonth = ( prefixValue > 0 && prefixValue < 13 ) ;

  // Evaluate if the extracted suffix value falls within the valid range for a calendar month (1 through 12).
  const suffixIsMonth = ( suffixValue > 0 && suffixValue < 13 ) ;

  // Proceed with conditional checks to categorize the date string based on month validity.
  if ( prefixIsMonth && suffixIsMonth )
  {
    // If both segments could represent a month, the format is deemed unclear.
    console . log ( 'AMBIGUOUS' ) ;
    return ; // Terminate execution after output.
  }
  else if ( prefixIsMonth )
  {
    // If only the leading segment is a valid month, it implies a MMYY format.
    console . log ( 'MMYY' ) ;
    return ; // Terminate execution after output.
  }
  else if ( suffixIsMonth )
  {
    // If only the trailing segment is a valid month, it implies a YYMM format.
    console . log ( 'YYMM' ) ;
    return ; // Terminate execution after output.
  }
  
  // Should none of the above conditions be met, the format is not identifiable.
  console . log ( 'NA' ) ;
}

// Retrieve the data from standard input using Node.js file system module
// and then invoke the primary analysis function with the obtained string.
AnalyzeDateString ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;