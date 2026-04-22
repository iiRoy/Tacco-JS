// This function processes the entire input string provided.
function ProcessCoordinates(rawData)
{
  // Convert the raw input string into an array of individual lines.
  const lineData = rawData.split('\n') ;

  // The first line indicates the total number of coordinate pairs to process.
  const numElements = parseInt(lineData[0], 10);

  // Declare variables for loop indexing, components of points, and the calculated segment length.
  let outerLoopIdx, innerLoopIdx;
  let currentPointComponents, currentX, currentY;
  let comparedPointComponents, comparedX, comparedY;
  let segmentLength;

  // Initialize an accumulator for the sum of all calculated segment lengths.
  let totalLengthAccumulator = 0.0 ;

  // Iterate through each point starting from the first actual data line.
  for ( outerLoopIdx = 1 ; outerLoopIdx <= numElements ; ++outerLoopIdx )
  {
    // Parse the coordinates for the current primary point.
    currentPointComponents = lineData[outerLoopIdx].split(' ');
    // Extract the X-coordinate for the current primary point.
    currentX = parseFloat(currentPointComponents[0]);
    // Extract the Y-coordinate for the current primary point.
    currentY = parseFloat(currentPointComponents[1]);

    // Iterate through all subsequent points to calculate distances with the primary point.
    for ( innerLoopIdx = outerLoopIdx + 1 ; innerLoopIdx <= numElements ; innerLoopIdx++ )
    {
      // Parse the coordinates for the secondary point being compared.
      comparedPointComponents = lineData[innerLoopIdx].split(' ');
      // Extract the X-coordinate for the secondary point.
      comparedX = parseFloat(comparedPointComponents[0]);
      // Extract the Y-coordinate for the secondary point.
      comparedY = parseFloat(comparedPointComponents[1]);

      // Calculate the Euclidean distance between the two points using the distance formula.
      segmentLength = Math.sqrt(
        (currentX - comparedX) * (currentX - comparedX) +
        (currentY - comparedY) * (currentY - comparedY)
      );
      // Add the calculated distance to the running total.
      totalLengthAccumulator += segmentLength;
    }
  }
  // Output the final computed value based on the accumulated distances and the count of elements.
  console.log(totalLengthAccumulator * 2.0 / numElements);
}
// The following section handles standard input/output operations and should not be modified.
ProcessCoordinates(require("fs").readFileSync("/dev/stdin", "utf8"));