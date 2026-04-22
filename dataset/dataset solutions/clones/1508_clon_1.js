/* This function processes the entire input data provided. */
function  Main ( input )

{
  // The input is split by newline characters, with each line accessible via array index.

  input = input.split( "\n" ) ;


  N = parseInt( input[0].split( " " ) ) ;


  var   i   =   0 ; // Initialize loop counter for iterating through lines.


  var   result   =   "No" ;   // Default result is 'No', will be updated if pattern found.


  while ( i < N - 2 )
  {
    // Retrieve the current line (i+1) and split it by spaces.
    var   tmp   =   input[i + 1] . split( " " ) ;

    var   d_i1   =   parseInt( tmp[0] ) ;
    var   d_i2   =   parseInt( tmp[1] ) ;

    // Check if the first two numbers on the current line are equal.
    if ( d_i1 == d_i2 )
    {
      // If they are, check the next line (i+2).
      var   tmp2   =   input[i + 2] . split( " " ) ;

      if ( parseInt( tmp2[0] ) == parseInt( tmp2[1] ) )
      {
        // If the numbers on line (i+2) are also equal, check line (i+3).
        var   tmp3   =   input[i + 3] . split( " " ) ;

        if ( parseInt( tmp3[0] ) == parseInt( tmp3[1] ) )
        {
          // Found three consecutive lines with equal pairs.
          result = "Yes" ;
          break ; // Exit the loop as the pattern is found.
        }
        else
        {
          // Pattern not found on line (i+3), skip ahead by 3 lines.
          i += 3 ;
        } ; // Semicolon here is from original code, must be preserved.
      }
      else
      {
        // Pattern not found on line (i+2), skip ahead by 2 lines.
        i += 2 ;
      }
    }
    else
    {
      // Pattern not found on current line (i+1), move to the next line.
      i ++ ;
    }
  }

  /* Final output of the determined result */
  console.log( result ) ;

}

// DO NOT EDIT THE LINE BELOW: Standard input/output handling for competitive programming.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;