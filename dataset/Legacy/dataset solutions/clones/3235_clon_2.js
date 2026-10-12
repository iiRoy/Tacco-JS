// This function is designed to process incoming textual data.
function ProcessInput(rawData) {
  // The provided string is divided into an array of substrings using a space as the delimiter.
  let parsedData = rawData.split(" ");

  // Each relevant part of the parsed data is converted from a string to an integer.
  let firstValue = parseInt(parsedData[0]);
  let secondValue = parseInt(parsedData[1]);
  let thirdValue = parseInt(parsedData[2]);

  // A secondary calculation is performed:
  // If the difference (firstValue - secondValue - thirdValue) is positive, the result is zero.
  // Otherwise, the absolute value of this difference is taken.
  let calculatedResult = (firstValue - secondValue - thirdValue > 0) ? 0 : Math.abs(firstValue - secondValue - thirdValue);

  // The final output consists of two integer values:
  // The minimum of secondValue and thirdValue, followed by the calculatedResult.
  console.log('%d %d', Math.min(secondValue, thirdValue), calculatedResult);
}

// The following line is responsible for reading input from standard input and invoking the primary processing function.
// It should not be altered.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
