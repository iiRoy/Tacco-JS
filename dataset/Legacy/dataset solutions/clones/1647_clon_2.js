/*
 * This script processes numerical input to determine a specific condition.
 * It reads two lines of data, performs transformations, and then checks an ordering.
 */

function processInput(rawData) {
  // Clean up the raw input string by removing leading/trailing whitespace.
  rawData = rawData.trim();

  // Split the input into lines and extract the first and second lines.
  let firstLineData = rawData.split("\n")[0];
  let secondLineData = rawData.split("\n")[1];

  // Parse the numerical values from the first line.
  let redVal = parseInt(firstLineData.split(" ")[0]);
  let greenVal = parseInt(firstLineData.split(" ")[1]);
  let blueVal = parseInt(firstLineData.split(" ")[2]);

  // Parse the iteration count from the second line.
  let iterationsCount = parseInt(secondLineData);

  // Define a helper function to check if the values are in ascending order.
  function checkOrder() {
    return (redVal < greenVal && greenVal < blueVal);
  }

  // Define a function to apply transformations based on current values.
  function transformValues() {
    if (redVal >= greenVal) {
      greenVal = greenVal * 2; // Double the green value if red is greater or equal.
    } else if (greenVal >= blueVal) {
      blueVal = blueVal * 2; // Double the blue value if green is greater or equal.
    }
  }

  // Apply the transformation function 'iterationsCount' times.
  for (let idx = 0; idx < iterationsCount; idx++) {
    transformValues();
  }

  // Determine the final outcome based on the ordered check.
  let finalResult = "";
  if (checkOrder() === true) {
    finalResult = "Yes";
  } else {
    finalResult = "No";
  }

  // Output the final result to the console.
  console.log(finalResult);
}

// The following line reads input from standard input in a Node.js environment.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
