const parseNum = (item) => {
  // Helper function to convert a string to an integer
  return parseInt(item, 10);
};

const parseNumArray = (inputArray) => inputArray.map((item) => parseNum(item)); // Transforms an array of strings into an array of integers

const absoluteValue = (item) => (item > 0 ? item : -item); // Computes the absolute value of a given number

function findMinimum() {
  // Finds the smallest value among the provided arguments
  const argsList = arguments;
  let currentMinMax = argsList[0];
  for (let idx = 1; idx < argsList.length; idx++) {
    if (argsList[idx] < currentMinMax) {
      currentMinMax = argsList[idx];
    }
  }
  return currentMinMax;
}

function findMaximum() {
  // Determines the largest value from a list of arguments
  const argsList = arguments;
  let currentMinMax = argsList[0];
  for (let idx = 1; idx < argsList.length; idx++) {
    if (argsList[idx] > currentMinMax) {
      currentMinMax = argsList[idx];
    }
  }
  return currentMinMax;
}

// Entry point for processing the standard input
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));

function ProcessInput(rawData) {
  // Splits the raw input string into an array of strings based on space delimiter
  const parsedData = rawData.split(' ');

  // Converts the first element of the parsed data to an integer
  const firstVal = parseNum(parsedData[0]);

  // Converts the second element of the parsed data to an integer
  const secondVal = parseNum(parsedData[1]);

  // Determines the output symbol based on specific conditions
  // If sum is 15, result is '+'. If product is 15, result is '*'. Otherwise, 'x'.
  let resultSymbol = (firstVal + secondVal === 15) ? '+' : (firstVal * secondVal === 15) ? '*' : 'x';

  // Prints the final determined symbol to the console
  console.log(resultSymbol);
}
