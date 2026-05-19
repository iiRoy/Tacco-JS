function getInputData() {
  return require("fs").readFileSync("/dev/stdin", "utf8").trim();
}

/**
 * Helper function to convert input strings based on a specified type.
 * @param {string} inputString - The string to convert.
 * @param {number} conversionType - The type of conversion to apply.
 *   0: No conversion, return as is.
 *   1: Convert to integer.
 *   2: Split by space.
 *   3: Split by newline.
 *   4: Split by space and convert elements to numbers.
 *   5: Split by newline and convert elements to numbers.
 *   6: Split into individual characters.
 *   7: Split into individual characters and convert to numbers.
 * @returns {any} The converted value.
 */
function processInput(inputString, conversionType) {
  switch (conversionType) {
    case 0:
      return inputString;
    case 1:
      return parseInt(inputString, 10);
    case 2:
      return inputString.split(" ");
    case 3:
      return inputString.split("\n");
    case 4:
      return inputString.split(" ").map((elementValue) => Number(elementValue));
    case 5:
      return inputString.split("\n").map((elementValue) => Number(elementValue));
    case 6:
      return inputString.split("");
    case 7:
      return inputString.split("").map((elementValue) => Number(elementValue));
    default:
      return inputString;
  }
}

/**
 * Main program execution logic.
 * Calculates the total number of chocolates eaten.
 * @param {string} rawData - The raw input string from stdin.
 */
function executeProgram(rawData) {
  // Process the raw input, splitting it by newlines
  let processedLines = processInput(rawData, 3);

  // Extract numItems, maxDays, and initialCount from the processed input
  const numItems = processInput(processedLines[0], 1);
  const dayData = processInput(processedLines[1], 4);
  const maxDays = dayData[0];
  const initialCount = dayData[1];

  let totalChocolates = 0;

  // Remove the first two lines which contained numItems, maxDays, and initialCount
  processedLines.shift();
  processedLines.shift();

  // Convert the remaining lines (representing item consumption days) to numbers
  const itemConsumptionDays = processedLines.map((elementValue) => Number(elementValue));

  // Iterate through each item to calculate chocolates eaten
  for (let itemIndex = 0; itemIndex < numItems; itemIndex++) {
    let currentDay = 1;
    // Loop while the current day is within the maximum allowed days
    while (currentDay <= maxDays) {
      totalChocolates++;
      currentDay += itemConsumptionDays[itemIndex];
    }
  }

  // Output the final result: total chocolates from items + initial count
  console.log(totalChocolates + initialCount);
}

// Execute the main program with input from stdin
executeProgram(getInputData());
