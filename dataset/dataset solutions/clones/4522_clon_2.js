// This function processes the entire input string provided.
function ProcessInput(rawData) {
  // The raw input is split into an array of strings, one for each line.
  // The original 'rawData' variable is now repurposed to hold these individual lines.
  rawData = rawData.split("\n");

  // The first line of the input is further split by spaces.
  // These parts are stored in a temporary array.
  let firstLineParts = rawData[0].split(" ");

  // At this point, all values are still strings.
  // They need to be converted to numerical types for calculations.

  // Convert the string components to integers using base 10.
  // The first part of the line is assigned to the 'redComponent' variable.
  const redComponent = parseInt(firstLineParts[0], 10);
  // The second part is assigned to 'greenComponent'.
  const greenComponent = parseInt(firstLineParts[1], 10);
  // The third part is assigned to 'blueComponent'.
  const blueComponent = parseInt(firstLineParts[2], 10);

  // A combined numerical value is calculated using a specific formula.
  // This value represents a weighted sum of the components.
  const combinedValue = 100 * redComponent + 10 * greenComponent + blueComponent;

  // Based on the calculated 'combinedValue', a conditional check is performed.
  // If the combined value is perfectly divisible by 4 (i.e., the remainder is 0),
  // then a specific message is printed to the console.
  if (combinedValue % 4 === 0) {
    console.log('%s', 'YES'); // Output 'YES' if the condition is met.
  } else {
    // Otherwise, a different message is printed.
    console.log('%s', 'NO'); // Output 'NO' if the condition is not met.
  }
}

// The following line is crucial for standard input/output handling in competitive programming environments.
// It reads the entire content from standard input, converts it to a UTF-8 string,
// and then passes it to our main processing function, 'ProcessInput'.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
