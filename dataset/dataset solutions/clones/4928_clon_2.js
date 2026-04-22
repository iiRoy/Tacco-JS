/* This function processes a character sequence to calculate a final score based on specific rules. */
function ComputeScore ( sourceText )
{
  // The initial input string is first broken down into an array of individual characters.
  sourceText = sourceText . split ( "" ) ;

  // A variable to accumulate the final score or outcome value.
  var totalPoints = 0 ;

  // A counter representing the capacity or available slots for one type of item (e.g., 'g' items).
  var availableSlots = 0 ;

  // A counter representing the currently occupied slots or progress for another type of item (e.g., 'p' items).
  var occupiedSlots = 0 ;

  // Iterate through each character in the processed sequence to apply scoring logic.
  sourceText . forEach ( function ( segmentType )
  {
    // A conditional block to handle different character types encountered.
    switch ( segmentType )
    {
      case "g" : // Case for when the current character is 'g'.
        // Check if the number of occupied slots is less than the available capacity.
        if ( occupiedSlots < availableSlots )
        {
          // If there's capacity, increment the score and mark one slot as occupied.
          totalPoints ++ ;
          occupiedSlots ++ ;
        }
        else
        {
          // If no capacity, simply increase the available slots.
          availableSlots ++ ;
        }
        break ; // Exit the switch for 'g'.

      case "p" : // Case for when the current character is 'p'.
        // Check if the number of occupied slots is less than the available capacity.
        if ( occupiedSlots < availableSlots )
        {
          // If there's capacity, mark one slot as occupied without affecting the score.
          occupiedSlots ++ ;
        }
        else
        {
          // If no capacity, increase available slots but decrement the score.
          availableSlots ++ ;
          totalPoints -- ;
        }
        break ; // Exit the switch for 'p'.
    }
  } ) ;

  // Display the final computed score to the standard output.
  console . log ( totalPoints ) ;
}

// Initiate the processing by reading input from standard input,
// removing any leading/trailing whitespace, and passing it to the function.
ComputeScore (
  require ( "fs" )
    . readFileSync ( "/dev/stdin" , "utf8" ) // Read the content of /dev/stdin as a UTF-8 string.
    . trim ( ) // Remove any whitespace from the beginning and end of the input string.
) ;