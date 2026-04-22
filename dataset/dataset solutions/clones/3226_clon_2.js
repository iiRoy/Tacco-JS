// This function processes raw string data to compute a specific sum.
function processInput(rawData) {
  // Split the entire input string into an array of individual lines.
  const lines = rawData.split('\n');

  // Extract the number of segments from the first line.
  // The first number in the first line determines how many segments are considered.
  const numSegments = lines[0]
                         .split(" ")
                         .map(Number)[0];

  // Parse the coordinate points from the second line, clean whitespace, convert to numbers, and sort them.
  const pointLocations = lines[1]
                           .trim()
                           .split(" ")
                           .map(Number)
                           .sort((valA, valB) => valA - valB);

  // Initialize an array to store the distances or 'gaps' between consecutive points.
  let gaps = [];

  // Iterate through the sorted point locations to calculate the distances between adjacent points.
  pointLocations.forEach((currentPoint, idx) => {
    if (idx > 0) { // Ensure we are not at the very first point, as there's no preceding point.
      gaps.push(currentPoint - pointLocations[idx - 1]); // Add the difference to the gaps array.
    }
  });

  // Sort the calculated gaps in ascending order.
  // Then, select a specific subset of these gaps: all but the 'numSegments - 1' largest gaps.
  // This effectively removes the 'numSegments - 1' largest gaps, keeping the smallest ones.
  gaps = gaps.sort((valA, valB) => valA - valB)
             .slice(0, gaps.length - numSegments + 1);

  // Calculate the total sum of the remaining (smallest) gaps and print it to the console.
  console.log(gaps.reduce((accumulator, currentValue) => accumulator + currentValue, 0));
}

// Read the input from standard input and pass it to the main processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));