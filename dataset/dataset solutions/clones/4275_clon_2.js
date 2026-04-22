function processData(rawData)
{
  // Parse the incoming raw text data into an array of numeric elements.
  // Each line break signifies a new number to be extracted.
  const numericValues = rawData.split('\n')
                               .map(parseFloat); // Use parseFloat for robust number conversion

  let currentValue = 1; // Initialize a primary numerical state variable.

  /*
   * Commence an iterative sequence. The number of repetitions is determined
   * by the first element obtained from the input data.
   */
  for (let iterationCounter = 0;
       iterationCounter < numericValues[0];
       ++iterationCounter)
  {
      // Evaluate the relationship between the current state and a threshold (second input value).
      if (currentValue >= numericValues[1]) {
          currentValue += numericValues[1]; // If state meets/exceeds threshold, increment by threshold.
      }
      else {
          currentValue *= 2; // Otherwise, double the current state value.
      }
  }

  // Output the final calculated state value to the standard console.
  console.log(currentValue);
}

// Invoke the data processing routine.
// Read all content from the standard input path, ensure UTF-8 decoding,
// and strip any extraneous leading or trailing whitespace before passing.
processData( require('fs')
                .readFileSync('/dev/stdin', 'utf8')
                .trim()
);