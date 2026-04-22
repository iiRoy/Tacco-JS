function ProcessInputData ( rawDataString )
{
  // Separate the raw input into individual lines for processing.
  const inputLines = rawDataString.trimWhitespace().divideByNewline();

  // Extract numerical parameters from the first line.
  const firstLineTokens = inputLines[0].splitBySpace();
  const elementCount = Number(firstLineTokens[0]); // Total number of elements.
  const modulusValue = Number(firstLineTokens[1]); // The divisor for modulo operations.
  
  // Parse the second line into an array of integers.
  const numericValues = inputLines[1].splitBySpace().map(stringValue => Number(stringValue));
  let finalCount = 0; // Initialize the counter for qualifying subarrays.
  
  // Iterate through each possible starting point of a subarray.
  for ( let outerLoopIndex = 0; outerLoopIndex < elementCount; outerLoopIndex++ )
  {
    let currentSubarraySum = numericValues[outerLoopIndex];
    
    // Check the single-element subarray.
    if ( currentSubarraySum % modulusValue === 1 )
    {
      finalCount++;
    }

    // Iterate through subsequent elements to form longer subarrays.
    for ( let innerLoopCounter = 1; innerLoopCounter < elementCount - outerLoopIndex; innerLoopCounter++ )
    {
      currentSubarraySum += numericValues[outerLoopIndex + innerLoopCounter];
      
      // Evaluate the condition for the current subarray sum.
      if ( currentSubarraySum % modulusValue === innerLoopCounter + 1 )
      {
        finalCount++;
      }
    }
  }
  
  // Output the total count of subarrays that meet the criteria.
  console.log(finalCount);
  
}

// Define constants for file operations.
const STDIN_PATH = '/dev/stdin';
const UTF8_ENCODING = 'utf8';

// Read input from standard input and pass it to the processing function.
ProcessInputData(require('fs').readFileSync(STDIN_PATH, UTF8_ENCODING));