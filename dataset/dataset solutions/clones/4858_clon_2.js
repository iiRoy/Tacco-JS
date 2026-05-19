function calculateDifference(valA, valB) {
  // This function computes the absolute difference between two numbers,
  // but returns the first number if they are equal.
  if (valA === valB) {
    return valA; // If values are identical, return one of them.
  } else if (valA > valB) {
    return valA - valB; // If the first is greater, return their difference.
  } else {
    return valB - valA; // Otherwise, return the difference in reverse order.
  }
}

function processInputData(rawDataString) {
  // Initialize the input parsing mechanism with the provided data.
  initializeParser(rawDataString);

  // Read the initial count, which determines the size of the array.
  let countElements = readInteger();
  // The actual size of the array will be 2 raised to the power of this count.
  countElements = Math.pow(2, countElements);

  // Declare an array to store the input values.
  const dataArray = [];
  // Populate the array by reading 'countElements' integers from the input.
  for (let idx = 0; idx < countElements; idx++) {
    dataArray[idx] = readInteger();
  }

  // Initialize a pointer for the left side of the array segment being processed.
  let leftPointer = 0;
  // The main processing loop continues as long as there are at least two elements
  // remaining to be processed from the current 'leftPointer' up to 'countElements'.
  while (countElements - leftPointer > 1) {
    // Extract the two elements to be compared.
    const firstValue = dataArray[leftPointer];
    const secondValue = dataArray[leftPointer + 1];

    // Advance the left pointer by two positions, as these two elements have been processed.
    leftPointer += 2;

    // Calculate the difference using our custom function and append it to the end of the array.
    // The 'countElements' variable is incremented here, effectively extending the array's logical size.
    dataArray[countElements++] = calculateDifference(firstValue, secondValue);
  }
  // After the loop, the last element added to the array (at index countElements - 1)
  // holds the final result of the reduction process.
  printLine(dataArray[countElements - 1]);
}


////////////////////////////////////////////////////////////////////////////////////
// Global variables for managing input parsing state.
let parsedInputTokens;
let currentTokenIndex;

// This function is for debugging purposes, typically called from a web environment.
function runDebugMode() {
  // It retrieves input from a DOM element and passes it to the main processing function.
  processInputData(document.getElementById("input").value);
}

// Initializes the input parsing system.
function initializeParser(rawText) {
  // Replaces all newline characters with spaces to create a single line of tokens.
  parsedInputTokens = rawText.replace(/\n/g, " ");
  // Splits the string by spaces into an array of individual tokens.
  parsedInputTokens = parsedInputTokens.split(" ");
  // Resets the token index to the beginning of the array.
  currentTokenIndex = 0;
}

// Output utility functions.
// Prints a given output to the console without a newline.
const displayOutput = (outputContent) => {
  console.log(outputContent);
};
// Prints a given output to the console followed by a newline.
const printLine = (outputContent) => {
  console.log(outputContent + "\n");
};

// Input utility functions.
// Reads and returns the next string token from the parsed input.
const readStringToken = () => {
  return parsedInputTokens[currentTokenIndex++];
};
// Reads the next string token and parses it as an integer.
const readInteger = () => {
  return parseInt(readStringToken(), 10);
};
// Reads the next string token and parses it as a floating-point number.
const readFloat = () => {
  return parseFloat(readStringToken());
};

// The following line ensures that the Main function is called with input
// read from standard input when executed in a Node.js environment.
// It should not be modified.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
