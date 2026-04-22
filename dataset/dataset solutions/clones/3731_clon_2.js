function ProcessInput ( entryData )
{
  // The input text is split into an array of lines.
  entryData = entryData.split ( "\n" );

  let maxIterations = entryData[0]; // Retrieve the primary iteration count.
  let currentSegmentLen = 1;        // Initialize the length of the numeric part.
  let activeValue = 1;              // Start with the initial numeric value.

  // Iterate a specific number of times as defined by the input.
  for ( let primaryLoopIdx = 0; primaryLoopIdx < maxIterations; primaryLoopIdx++ )
  {
    let generatedPart = "";     // String builder for the current output.
    generatedPart += activeValue; // Append the current numeric value.

    // If the segment length is more than one, append '9's as padding.
    if ( currentSegmentLen > 1 )
    {
      for ( let paddingCounter = 0; paddingCounter < currentSegmentLen - 1; paddingCounter++ )
      {
        generatedPart += "9"; // Add a '9' for padding.
      }
    }
    // Print the assembled string for this iteration.
    console.log( '%s', generatedPart );

    activeValue++; // Increment the numeric value for the next cycle.

    // Check if the active value has exceeded 9; if so, reset and increase segment length.
    if ( activeValue > 9 )
    {
      activeValue = 1;
      currentSegmentLen++;
    }
  }
}

// The following line is crucial for standard input/output operations and should not be altered.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));