/*
 * This JavaScript module is designed to process sequential input data,
 * interpreting lines to perform specific mathematical calculations.
 * It's structured to handle streaming data from standard input,
 * terminating processing upon encountering a specific sentinel character.
 */

// It is crucial to ensure the standard input stream remains active
// to allow continuous data reception.
process . stdin . resume ( ) ;

// Explicitly set the character encoding for the standard input stream.
// 'utf8' is a common and robust choice for text data.
process . stdin . setEncoding ( 'utf8' ) ;

// Register an asynchronous event listener for 'data' events on stdin.
// This function will be executed whenever a chunk of data is received.
process . stdin . on ( 'data' ,
  function ( chunk )
  {
    // Declare all local variables at the beginning of the function scope
    // for clarity and adherence to some coding conventions.
    var line ,                                     // Stores the current line being processed.
        lines = chunk . split ( "\n" ) ,           // An array of individual lines parsed from the input chunk.
        i ,                                        // Loop counter for iterating through the 'lines' array.
        len = lines . length ,                     // Caches the total number of lines in the current chunk.
        j ,                                        // Loop counter for iterating through characters of a 'line'.
        jLen ,                                     // Stores the length of the current 'line'.
        deg ,                                      // Represents the calculated degree value.
        pow ,                                      // Used as an exponent in power calculations.
        max ;                                      // Defines the maximum possible degree value for a given line.


    // Begin iterating through each line extracted from the received data chunk.
    for ( i = 0 ;  i < len ;  i ++ )
    {
      // Assign the current line from the 'lines' array to the 'line' variable.
      line = lines [ i ] ;

      // Check if the current line is the termination signal.
      if ( line == "#" )
      {
        // If the sentinel character is found, exit the loop immediately,
        // stopping further processing of lines in this chunk.
        break ;
      }

      // Perform string replacements to convert directional words into numerical values.
      // 'north' is mapped to '0' globally within the line.
      line = line . replace ( /north/g , 0 ) ;
      // 'west' is mapped to '1' globally within the line.
      line = line . replace ( /west/g , 1 ) ;

      // Initialize the 'deg' variable to zero before starting calculations for the current line.
      deg = 0 ;

      // Capture the length of the modified line for the inner loop.
      jLen = line . length ;
      // Calculate the initial power value, which is one less than the line's length.
      pow = line . length - 1 ;
      // Determine the maximum possible degree value based on the initial power.
      max = 90 * Math . pow ( 2 , pow ) ;

      // Iterate over each character in the processed 'line'.
      for ( j = 0 ;  j < jLen ;  j ++ )
      {
        // Convert the character to a number and evaluate its truthiness.
        // If the character is '1' (or any non-zero number), this condition is true.
        if ( line [ j ] * 1 )
        {
          // If the character indicates an 'increase' condition, and 'deg' is within bounds,
          // add a calculated value to 'deg'.
          if ( deg < max )
          {
            deg += 90 * Math . pow ( 2 , pow - j ) ;
          }
        }
        else // This block executes if the character is '0'.
        {
          // If the character indicates a 'decrease' condition, and 'deg' is positive,
          // subtract a calculated value from 'deg'.
          if ( deg > 0 )
          {
            deg -= 90 * Math . pow ( 2 , pow - j ) ;
          }
        }
      } // End of the character iteration loop.

      // This loop simplifies the resulting fraction (deg / Math.pow(2, pow))
      // by repeatedly dividing both 'deg' and the base of 'pow' by 2
      // as long as 'deg' is even and 'pow' is greater than zero.
      while ( pow > 0 && deg % 2 === 0 )
      {
        deg = deg / 2 ; // Halve the degree value.
        pow -- ;        // Decrement the exponent.
      }

      // Output the final calculated result to the console.
      if ( pow > 0 )
      {
        // If 'pow' is still greater than zero, output the result as a fraction.
        console . log ( deg + "/" + Math . pow ( 2 , pow ) ) ;
      }
      else
      {
        // Otherwise, if 'pow' is zero or less, output only the simplified degree.
        console . log ( deg ) ;
      }
    } // End of the line iteration loop.
  } // End of the 'data' event handler function.
) ;