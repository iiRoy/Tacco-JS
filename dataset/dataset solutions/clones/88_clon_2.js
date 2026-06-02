let rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Obtain raw input data from standard input stream

const dataRows = rawData.split('\n'); // Divide the complete input into an array of individual lines

let numCases = +dataRows.shift(); // Extract the total number of test cases from the first line

for (let caseIndex = 0; caseIndex < numCases; caseIndex++) { // Iterate through each provided test scenario
  const coordinateStrings = dataRows.shift().split(' '); // Get the current line of coordinates and split it by spaces

  let firstX = +coordinateStrings[0]; // Parse the X-coordinate of the first point
  let firstY = +coordinateStrings[1]; // Parse the Y-coordinate of the first point
  let secondX = +coordinateStrings[2]; // Parse the X-coordinate of the second point
  let secondY = +coordinateStrings[3]; // Parse the Y-coordinate of the second point
  let thirdX = +coordinateStrings[4]; // Parse the X-coordinate of the third point
  let thirdY = +coordinateStrings[5]; // Parse the Y-coordinate of the third point
  let fourthX = +coordinateStrings[6]; // Parse the X-coordinate of the fourth point
  let fourthY = +coordinateStrings[7]; // Parse the Y-coordinate of the fourth point

  // Determine if two line segments are parallel by comparing their slopes using cross-multiplication.
  // (y2 - y1) / (x2 - x1) == (y4 - y3) / (x4 - x3)
  // is equivalent to (y2 - y1) * (x4 - x3) == (y4 - y3) * (x2 - x1)
  // The toFixed(12) is used for precise floating-point comparison.
  if (((secondY - firstY) * (fourthX - thirdX)).toFixed(12) == ((fourthY - thirdY) * (secondX - firstX)).toFixed(12)) {
    console.log('YES'); // Output 'YES' if the line segments are parallel
  } else {
    console.log('NO'); // Output 'NO' if the line segments are not parallel
  }
}
