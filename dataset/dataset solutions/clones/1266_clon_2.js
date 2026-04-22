function ProcessInput(sourceData)
{
  // This function takes raw input and processes it to generate patterns.
  const parsedEntries = sourceData.trim().split("\n") ;

  let totalEntries = parsedEntries.length; // Get the total count of input lines.

  // Loop through each line of the input data.
  for (let currentLineIdx = 0; currentLineIdx < totalEntries; currentLineIdx++)
  {
    // Split the line by space and convert each part to an integer.
    let currentValues = parsedEntries[currentLineIdx]
      .split(" ")
      .map( (element) => parseInt(element, 10) );

    // Assign the first value as the height dimension.
    let firstDimension = currentValues[0] ;
    // Assign the second value as the width dimension.
    let secondDimension = currentValues[1] ;

    // Check for the termination condition: both dimensions are zero.
    if (firstDimension === 0 && secondDimension === 0) {
      break; // Exit the loop if the termination condition is met.
    }

    // Initialize two pattern strings.
    let hashDotPattern = ''; // For patterns starting with '#'.
    let dotHashPattern = ''; // For patterns starting with '.'.

    // Build the two base patterns based on the 'secondDimension' (width).
    for (let charIndex = 0; charIndex < secondDimension; charIndex++)
    {
      if (charIndex % 2 === 0)
      {
        hashDotPattern += '#'; // Add '#' to the first pattern.
        dotHashPattern += '.'; // Add '.' to the second pattern.
      }
      else
      {
        hashDotPattern += '.'; // Add '.' to the first pattern.
        dotHashPattern += '#'; // Add '#' to the second pattern.
      }
    }

    // Print the generated patterns based on the 'firstDimension' (height).
    for (let displayRowIdx = 0; displayRowIdx < firstDimension; displayRowIdx++)
    {
      if (displayRowIdx % 2 === 0)
      {
        console.log(hashDotPattern); // Output the pattern starting with '#'.
      }
      else
      {
        console.log(dotHashPattern); // Output the pattern starting with '.'.
      }
    }
    // Print an empty line to separate outputs for different sets of dimensions.
    console.log();
  }
}

// Execute the processing function by reading input from standard input.
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));