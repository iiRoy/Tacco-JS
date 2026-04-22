function readInputData () {
  return require("fs") . readFileSync("/dev/stdin" , "utf8") . trim();
}

/**
 * Sends the computed value to the standard output.
 * @param {any} outputValue - The data to be displayed.
 */
function displayResult(outputValue) {
  console.log(outputValue);
}

// Utility function to process and transform input data based on a specified type.
// Transformation options for 'transformationType':
// 0: Returns the input string without modification.
// 1: Converts the input string to an integer.
// 2: Splits the input string by a single space character.
// 3: Splits the input string by newline characters.
// 4: Splits by space, then converts each resulting part to a number.
// 5: Splits by newline, then converts each resulting part to a number.
// 6: Splits the input string into an array of individual characters.
// 7: Splits into individual characters, then converts each character to a number.
function transformData(inputString, transformationType) {
  switch (transformationType) {
    case 0:
      return inputString;
    case 1:
      return parseInt(inputString, 10);
    case 2:
      return inputString.split(" ");
    case 3:
      return inputString.split("\n");
    case 4:
      return inputString.split(" ").map((element) => Number(element));
    case 5:
      return inputString.split("\n").map((element) => Number(element));
    case 6:
      return inputString.split("");
    case 7:
      return inputString.split("").map((element) => Number(element));
    default:
      return inputString;
  }
}

function ExecuteLogic(rawInput) {
  // First, process the raw input by splitting it into lines.
  const processedInput = transformData(rawInput, 3);

  // Extract the total count of elements from the first line of the processed input.
  const countElements = transformData(processedInput[0], 1);

  // Retrieve the main sequence of data from the second line, parsing each part as a number.
  const dataSequence = transformData(processedInput[1], 4);

  // Initialize an array to hold boolean-like indicators, all set to zero initially.
  let indicatorArray = Array.from({ length: countElements }, () => 0);

  // Populate the indicator array: set an indicator to 1 if a data point matches its expected index.
  for (let idx = 0; idx < countElements; idx++) {
    if (dataSequence[idx] === idx + 1) {
      indicatorArray[idx] = 1;
    }
  }

  // Initialize a counter for the final computed result.
  let finalResult = 0;

  // Iterate through the indicator array to calculate the final result based on adjacent values.
  for (let idx = 1; idx < countElements; idx++) {
    const previousIndicator = indicatorArray[idx - 1];
    const currentIndicator = indicatorArray[idx];

    // Apply specific logic for incrementing the result, differentiating between the first and subsequent pairs.
    if (idx !== 1 && previousIndicator === 0 && currentIndicator === 1) {
      finalResult++;
    }
    else if (idx === 1 && (currentIndicator === 1 || previousIndicator === 1)) {
      finalResult++;
    }
  }

  // The following line is typically used for debugging purposes to inspect the intermediate indicator array.
  // displayResult(indicatorArray);

  // Output the final calculated value.
  displayResult(finalResult);
}

// Begin the program execution by reading input from stdin and passing it to the main logic function.
ExecuteLogic(readInputData());