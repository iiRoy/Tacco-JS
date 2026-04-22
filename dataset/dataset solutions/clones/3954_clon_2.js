// This script processes provided input lines.
function ProcessInputAndCompute(dataLines) {

  // Extract the total count from the first line of the input.
  var totalCount = parseInt(dataLines[0], 10);

  /*
   * Split the second line into an array of coordinate strings,
   * using any sequence of whitespace characters as a delimiter.
   */
  var coordinateStrings = dataLines[1].split(/\s+/);

  // Initialize an array to store differences between consecutive coordinates.
  var segmentDifferences = [];

  // Initialize a variable to accumulate the total absolute differences encountered.
  var totalAbsoluteDifference = 0;

  // Set the starting point or previous coordinate value to zero.
  var previousCoordinate = 0;

  // Iterate through the coordinate strings up to the specified total count.
  for (  var   index   =   0;   index   <   totalCount;   ++index   )   {
    // Parse the current coordinate string from the array into an integer.
    var currentCoordinate = parseInt(coordinateStrings[index], 10);

    // Calculate the difference between the previous and current coordinates and add it to our array.
    segmentDifferences.push(previousCoordinate - currentCoordinate);

    // Add the absolute value of this difference to the running total.
    totalAbsoluteDifference += Math.abs(previousCoordinate - currentCoordinate);

    // Update the previous coordinate for the next iteration of the loop.
    previousCoordinate = currentCoordinate;
  }

  // After the loop, calculate and add the difference from the last coordinate back to zero.
  segmentDifferences.push(previousCoordinate - 0);
  totalAbsoluteDifference += Math.abs(previousCoordinate - 0);

  // Now, iterate again to compute and display results based on the accumulated data.
  for (var elementIndex = 0; elementIndex < totalCount; ++elementIndex) {
    // Output the calculated result to the console directly, using the segment differences.
    console.log(`${totalAbsoluteDifference - Math.abs(segmentDifferences[elementIndex]) - Math.abs(segmentDifferences[elementIndex + 1]) + Math.abs(segmentDifferences[elementIndex] + segmentDifferences[elementIndex + 1])}`);
  }
}
// Do not modify the following section (it handles standard input/output and invokes the main processing function).
ProcessInputAndCompute(require("fs").readFileSync("/dev/stdin", "utf8"));