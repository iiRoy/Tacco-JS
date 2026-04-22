// This function orchestrates the primary data processing workflow.
function  ProcessInput (  rawData  ) {

  // Split the entire raw input string into an array, where each element is a line.
  let linesArray = rawData.split ( "\n" ) ;

  // The very first line contains general configuration parameters, separated by spaces.
  let firstLineTokens = linesArray[0].split(" ");

  // The second line holds individual data points, also space-separated.
  let secondLineValues = linesArray[1].split(" ");


  /*
   *  Extract and convert necessary numerical values from the parsed tokens.
   *  'participantCount' represents the total number of entries to process.
   *  'heightThreshold' defines the minimum value for a specific condition.
   */
  const participantCount = parseInt( firstLineTokens[0], 10 );
  const heightThreshold = parseInt( firstLineTokens[1], 10 );

  // Initialize a counter for elements that meet a certain condition.
  let exceedingCount = 0 ;

  // Loop through each individual data point based on the total participant count.
  for ( let idx = 0 ; idx < participantCount ; idx++ ) {
    // Check if the current individual's value is greater than or equal to the defined threshold.
    if ( heightThreshold <= parseInt(secondLineValues[idx], 10) ) {
      // If the condition is satisfied, increment the counter.
      exceedingCount ++ ;
    }
  }

  // Display the final calculated count to the standard output.
  console.log(exceedingCount);
}

// Do not alter the following section. It is responsible for reading standard input and initiating the processing.
ProcessInput( require("fs").readFileSync("/dev/stdin", "utf8") );