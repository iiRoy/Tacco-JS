/*
 * This function processes raw string input data to identify specific numerical patterns.
 * It's designed to find points in a sequence that are either local maxima (peaks)
 * or local minima (valleys) relative to their immediate neighbors.
 */
function ProcessInput ( rawData )
{
  // First, split the entire provided raw string input into an array of lines.
  // Each line is separated by a newline character.
  var linesArray = rawData.split ( '\n' ) ;

  // The first element of the 'linesArray' is expected to be a string
  // representing the total number of elements to consider in the sequence.
  // We parse this string into an integer for numerical operations.
  var totalElements = parseInt(linesArray[0]);

  // The second element of 'linesArray' contains the actual sequence of numbers,
  // which are space-separated. We split this string into an array of string values.
  var numericValues = linesArray[1].split(' ');

  // Initialize a counter to keep track of the number of identified patterns (peaks/valleys).
  var peakCount = 0;

  // Begin the first iteration loop:
  // This loop's purpose is to convert each string element within the 'numericValues' array
  // into its corresponding integer representation.
  for (  var idx = 0  ;  idx < numericValues.length  ;  idx++  )
  {
    numericValues[idx] = parseInt(numericValues[idx]) ;
  }

  // Begin the second iteration loop:
  // This loop iterates through the 'numericValues' array to detect specific "peak" or "valley" patterns.
  // We start from the second element (index 1) and end before the last element (totalElements - 1)
  // because each check requires access to a preceding element (currentIdx - 1) and a succeeding element (currentIdx + 1).
  for ( var currentIdx = 1 ; currentIdx < ( totalElements - 1 ) ; currentIdx++ )
  {
    // Check condition for a "peak":
    // If the current number is strictly greater than its left neighbor AND strictly less than its right neighbor.
    if  (  (  numericValues[currentIdx]  >  numericValues[currentIdx - 1]  )  &&  (  numericValues[currentIdx]  <  numericValues[currentIdx + 1]  )  )
    {
      peakCount++; // Increment the counter if a peak is found.
    }
    // Else, check condition for a "valley":
    // If the current number is strictly less than its left neighbor AND strictly greater than its right neighbor.
    else if  (  (  numericValues[currentIdx]  <  numericValues[currentIdx - 1]  )  &&  (  numericValues[currentIdx]  >  numericValues[currentIdx + 1]  )  )
    {
      peakCount++; // Increment the counter if a valley is found.
    }
  }

  // After processing all relevant elements, display the final tally of identified patterns.
  console.log(peakCount);
}

// The program's entry point:
// It reads the entire content of standard input as a UTF-8 encoded string,
// and then passes this string to the 'ProcessInput' function for execution.
ProcessInput(require('node:fs').readFileSync('/dev/stdin', 'utf8'));