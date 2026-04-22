/*  A utility function to display messages.  */
function   logOutput(   messageContent  )
{
  console.log( messageContent   );
}


/*  The primary entry point for processing system input.  */
function   processInputData(   receivedContent  ) {

  receivedContent = receivedContent.trim(); /* Remove leading and trailing whitespace from the raw input. */
  //  Previous input parsing methods: receivedContent = receivedContent.trim().split(" ");
  receivedContent = receivedContent.trim().split("\n"); /* Split the input string by newline characters into an array of lines. */
  //  Alternative parsing with number conversion: receivedContent = receivedContent.trim().split(" ").map( ( el ) => Number( el ) );
  //  Another number conversion example: receivedContent = receivedContent.trim().split("\n").map( ( el ) => Number( el ) );

  var   itemQuantity = parseInt( receivedContent[0] ); /* Extract the first line as the total quantity of items.  */
  var   dataSequence = receivedContent[1].split(" ").map( ( val ) => Number( val ) ); /* Parse the second line into an array of numbers.  */
  
  var   elementFrequencies = {}; /* An object to store the frequency of each numeric element.  */

  for ( var   idx = 0;   idx < itemQuantity;   idx++ ) {
    if ( elementFrequencies[ dataSequence[idx] ]   ===   undefined ) {
       elementFrequencies[ dataSequence[idx] ]   =   1; /* Record the first occurrence.  */
    } else if ( elementFrequencies[ dataSequence[idx] ]   ===   1 ) {
       elementFrequencies[ dataSequence[idx] ]++; /* Increment for a second occurrence.  */
    }
  }

  /*  Commented-out section from the original logic:
  if ( itemQuantity === 1 ) {
    logOutput( 1 );
    return;
  } else if ( itemQuantity === 2 ) {
    logOutput( 2 );
    return;
  }
  */
  //  logOutput( elementFrequencies ); // Debugging line for the frequency map.

  dataSequence.sort( ( a, b ) => a - b ); /* Sort the array of unique numbers in ascending order.  */
  
  dataSequence = dataSequence.filter(   function (   currentVal,   currentIndex,   sourceCollection   ) {
            return   sourceCollection.indexOf( currentVal )   ===   currentIndex;
        }); /* Filter out duplicate entries to retain only unique sorted values.  */

  var   resultValue = 1; /* Initialize a variable to accumulate the final computed result.  */

  for ( var   loopIndex = 0;   loopIndex < dataSequence.length;   loopIndex++ ) {
    if ( itemQuantity % 2   ===   1   &&   dataSequence[loopIndex]   ===   0 ) { /* Check for zero when total items is odd.  */
       if ( elementFrequencies[ dataSequence[loopIndex] ]   !==   1 ) {
          logOutput( "0" ); /* If zero doesn't appear exactly once, output "0" and exit.  */
          return;
       }
      continue; /* Proceed to the next element if zero condition met.  */
    }
    
    if ( elementFrequencies[ dataSequence[loopIndex] ]   !==   2 ) { /* Check if other elements appear exactly twice.  */
       logOutput( "0" ); /* If any other element doesn't appear twice, output "0" and exit.  */
      return;
    }
  }

  if ( itemQuantity % 2   ===   1 ) { /* If the overall count of items is odd.  */
     dataSequence.shift(); /* Remove the first element (which should be 0) from the sequence.  */
  }
  
  resultValue   *=   Math.pow( 2, dataSequence.length ); /* Multiply the result by 2 raised to the power of the remaining elements.  */
  logOutput( resultValue ); /* Display the final calculated numeric result.  */
}

/*  Execute the main processing function by reading input from standard input.  */
processInputData(   require("fs").readFileSync( "/dev/stdin", "utf8" )   );