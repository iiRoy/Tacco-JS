function ProcessInput(rawData) {
  "use strict"; // Enforce strict parsing and error handling.

  // Split the raw input string into an array of lines.
  const temporaryLines = rawData.split("\n");

  // Extract the first line, parse it as an integer.
  // Although 'countOfElements' is not used later, its declaration is preserved.
  const countOfElements = parseInt(temporaryLines.shift());

  // Extract the next line, split by space, and convert each part to an integer.
  const coordinateValues = temporaryLines.shift().split(" ").map(val => parseInt(val));

  // Initialize a variable to store the minimum deviation found, starting with a very large number.
  let lowestDeviation = Infinity;

  // Iterate through possible target points from 1 to 100 (inclusive).
  for (let currentPoint = 1; currentPoint <= 100; currentPoint++) {
    // Calculate the sum of squared differences for the current target point.
    // For each coordinate value, subtract the current target point, square the result,
    // and then sum all these squared differences.
    const currentDeviation = coordinateValues.map(val => (val - currentPoint) * (val - currentPoint)).reduce((accumulator, currentValue) => accumulator + currentValue);

    // Update the minimum deviation if the current deviation is smaller.
    lowestDeviation = Math.min(lowestDeviation, currentDeviation);
  }

  // Output the calculated minimum deviation to the console.
  console.log(lowestDeviation);
}

// The following line handles standard input/output and calls the main processing function.
// It should not be modified to ensure compatibility with the execution environment.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
