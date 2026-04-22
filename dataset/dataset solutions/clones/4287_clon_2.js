function obtainDataStream() {
  return require("fs").readFileSync("/dev/stdin", "utf8").trim();
}

function displayResult(val) {
  console.log(val); // Write the computed value to the standard output console.
}

function reportError(msg) {
  console.error(msg); // Output an error message to the standard error stream.
}

// This utility function handles various forms of data conversion.
//   Transformation Codes:
//   0: Return the input data without any modifications.
//   1: Parse the input string into an integer.
//   2: Divide the input string by single spaces.
//   3: Divide the input string by newline characters.
//   4: Divide by spaces, then convert each resulting part to a number.
//   5: Divide by newlines, then convert each resulting part to a number.
//   6: Break the input string into an array of individual characters.
//   7: Break into characters, then convert each character to a number.
function convertData(item, option) {
  switch (option) {
    case 0:
      return item;
    case 1:
      return parseInt(item);
    case 2:
      return item.split(" ");
    case 3:
      return item.split("\n");
    case 4:
      return item.split(" ").map((element) => Number(element));
    case 5:
      return item.split("\n").map((element) => Number(element));
    case 6:
      return item.split("");
    case 7:
      return item.split("").map((element) => Number(element));
    default:
      return item;
  }
}

// The primary function orchestrating the data processing.
function processMainData(initialInput) {
  initialInput = convertData(initialInput, 3); // First, split the entire input into lines.

  let countVal = convertData(initialInput[0], 1); // Get the first line and parse it as an integer.
  const dataArray = convertData(initialInput[1], 4); // Get the second line, split by spaces, and convert to numbers.

  let finalResult = Math.pow(3, countVal); // Compute 3 raised to the power of the numeric count.
  let evenProduct = 1; // Initialize a variable to track products related to even numbers.

  // Loop through the processed data array.
  for (let k = 0; k < countVal; k++) {
    if (dataArray[k] % 2 === 0) { // Check if the current array element is an even number.
      evenProduct *= 2; // If even, multiply the 'evenProduct' by 2.
    }
  }

  displayResult(finalResult - evenProduct); // Output the final calculated difference.
}

// Begin the application by fetching the input and passing it to the main processing function.
processMainData(obtainDataStream());