function logToConsole(message) {
  // This utility function handles standard output operations.
  console.log(message);
}

function ProcessInput(rawData) {
  // First, clean up the raw input string by trimming whitespace.
  rawData = rawData.trim();

  // Split the input into lines to process individual data points.
  rawData = rawData.trim().split("\n");

  // Parse the first line to get the length of the array.
  let arrayLength = parseInt(rawData[0]);

  // Parse the second line, split by spaces, and convert elements to numbers.
  let numberArray = rawData[1].split(" ").map((val) => Number(val));

  // Initialize an object to store the frequency of each number.
  const frequencyMap = {};

  // Iterate through the number array to populate the frequency map.
  for (let idx = 0; idx < arrayLength; idx++) {
    // If the number is encountered for the first time, set its count to 1.
    if (frequencyMap[numberArray[idx]] === undefined) {
      frequencyMap[numberArray[idx]] = 1;
    }
    // If the number has been seen once, increment its count to 2.
    else if (frequencyMap[numberArray[idx]] === 1) {
      frequencyMap[numberArray[idx]]++;
    }
  }

  // Sort the array numerically.
  numberArray.sort((a, b) => a - b);

  // Filter out duplicate elements to get a unique sorted list.
  numberArray = numberArray.filter(function (currentElement, index, originalArray) {
    return originalArray.indexOf(currentElement) === index;
  });

  // Initialize the result variable for calculations.
  let resultValue = 1;

  // Iterate through the unique sorted numbers to validate conditions.
  for (let idx = 0; idx < numberArray.length; idx++) {
    // Special handling for the number 0 if the array length is odd.
    if (arrayLength % 2 === 1 && numberArray[idx] === 0) {
      // If 0 does not appear exactly once, output "0" and exit.
      if (frequencyMap[numberArray[idx]] !== 1) {
        logToConsole("0");
        return;
      }
      // Continue to the next element if 0 is valid.
      continue;
    }
    // For all other numbers, they must appear exactly twice.
    if (frequencyMap[numberArray[idx]] !== 2) {
      // If not, output "0" and exit.
      logToConsole("0");
      return;
    }
  }

  // If the original array length was odd, remove the first element (which must have been 0).
  if (arrayLength % 2 === 1) {
    numberArray.shift();
  }

  // Calculate the final result by multiplying by 2 for each remaining unique number,
  // applying modulo to keep the number within bounds.
  for (let idx = 0; idx < numberArray.length; idx++) {
    resultValue = (resultValue * 2) % 1000000007;
  }

  // Output the final calculated result.
  logToConsole(resultValue);
}

// Read input from standard input and pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
