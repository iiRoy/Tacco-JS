function readInputData() {
  return require("fs").readFileSync("/dev/stdin", "utf8").trim();
}

function displayResult(res) {
  console.log(res);
}

function logErrorMsg(errText) {
  console.error(errText);
}

// Input transformation options:
// 0: No change
// 1: Convert to integer
// 2: Split by space
// 3: Split by newline
// 4: Split by space, then convert to number array
// 5: Split by newline, then convert to number array
// 6: Split into individual characters
// 7: Split into individual characters, then convert to number array
function transformInput(inputValue, conversionType) {
  switch (conversionType) {
    case 0:
      return inputValue;
    case 1:
      return parseInt(inputValue);
    case 2:
      return inputValue.split(" ");
    case 3:
      return inputValue.split("\n");
    case 4:
      return inputValue.split(" ").map((elementStr) => Number(elementStr));
    case 5:
      return inputValue.split("\n").map((elementStr) => Number(elementStr));
    case 6:
      return inputValue.split("");
    case 7:
      return inputValue.split("").map((elementStr) => Number(elementStr));
  }
}

function processMainLogic(rawData) {
  // Convert the raw input string into an array of numbers, split by spaces.
  rawData = transformInput(rawData, 4);

  // Extract the starting and ending values from the processed input.
  let startVal = rawData[0];
  let endVal = rawData[1];

  // Initialize a counter for palindromic numbers.
  let finalCount = 0;

  // Iterate through the range of numbers from startVal to endVal (inclusive).
  for (let currentNum = startVal; currentNum <= endVal; currentNum++) {
    // Convert the current number to a string, then split it into an array of characters.
    let digitArray = transformInput(currentNum.toString(), 6);

    // Check if the number is a palindrome (specifically, a 5-digit palindrome).
    // This condition checks if the first digit matches the last, and the second matches the fourth.
    if (digitArray[0] == digitArray[4] && digitArray[1] == digitArray[3]) {
      finalCount++; // Increment the counter if it's a palindrome.
    }
  }

  // Display the total count of palindromic numbers found.
  displayResult(finalCount);
}

// Execute the main logic by first reading input from stdin.
processMainLogic(readInputData());
