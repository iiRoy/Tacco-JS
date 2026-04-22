function ProcessString( incomingData )
{

  // Initial data sanitization: remove leading/trailing blank spaces.
  incomingData  =  incomingData.trim() ;

  // Initialize a counter for specific character occurrences.
  let oneCount = 0 ;


  // Traverse through each individual character within the provided string.
  for
  (
    let charIndex = 0 ; // Begin the iteration from the first character (index 0).

    charIndex < incomingData.length ; // Loop continues as long as the current index is within the string's bounds.

    charIndex++ // Advance to the subsequent character in each iteration.
  )
  {
    // Evaluate if the character at the current position is numerically equivalent to '1'.
    if
    (
      incomingData.charAt(charIndex) === "1"
    )
    {
      // If the condition is met, increment the occurrence counter.
      oneCount++ ;
    }
  }

  // Output the final computed count to the standard information stream.
  console.info(oneCount);
}

// --- Program Execution Entry Point ---

// Obtain the raw data from the standard input stream.
// Ensure the data is interpreted as UTF-8 encoded text.
// Subsequently, invoke the primary processing function with this acquired data.
ProcessString(
  require("fs")
    .readFileSync("/dev/stdin", "utf8")
);