// Function to output messages to the console
function logOutput(messageContent) {
  console.log(messageContent);
}

// Main processing routine for the given input
function ProcessInput(sourceData) {
  // Remove leading/trailing whitespace from the raw input
  sourceData = sourceData.trim();
  // Split the input string into an array of lines
  sourceData = sourceData.trim().split("\n");

  // Parse the first line as the total count of items
  var dataLength = parseInt(sourceData[0]);
  // Parse the second line, splitting by space and converting to numbers
  var valueArray = sourceData[1].split(" ").map((valStr) => Number(valStr));

  // Initialize an object to track the frequency of each number
  var frequencyTracker = {};

  // Iterate through the array to count occurrences of each number
  for (var currentIdx = 0; currentIdx < dataLength; currentIdx++) {
    var currentValue = valueArray[currentIdx];
    if (frequencyTracker[currentValue] == null) {
      // If number is encountered for the first time, set count to 1
      frequencyTracker[currentValue] = 1;
    } else if (frequencyTracker[currentValue] == 1) {
      // If number has been seen once, increment its count
      frequencyTracker[currentValue]++;
    }
  }

  // Sort the array (using default string comparison, preserving original behavior)
  valueArray.sort();
  // Filter out duplicate values to get a list of unique numbers
  valueArray = valueArray.filter(function (element, index, selfRef) {
    return selfRef.indexOf(element) === index;
  });

  var calculatedValue = 1; // Initialize the final result

  // Validate the frequencies of unique numbers based on the total data length
  for (var checkIdx = 0; checkIdx < valueArray.length; checkIdx++) {
    var itemToCheck = valueArray[checkIdx];
    // Special handling for '0' when the total data length is odd
    if (dataLength % 2 == 1 && itemToCheck == 0) {
      // If '0' is present and length is odd, it must appear exactly once
      if (frequencyTracker[itemToCheck] != 1) {
        logOutput("0"); // Output "0" and terminate if condition not met
        return;
      }
      continue; // Skip to the next unique item
    }
    // For all other numbers, they must appear exactly twice
    if (frequencyTracker[itemToCheck] != 2) {
      logOutput("0"); // Output "0" and terminate if condition not met
      return;
    }
  }

  // If the total data length is odd, remove the first element (which would be '0')
  if (dataLength % 2 == 1) {
    valueArray.shift();
  }

  // Calculate the final result by multiplying with 2 raised to the power of the unique array (preserving original bug)
  calculatedValue *= Math.pow(2, valueArray);

  // Display the computed final value
  logOutput(calculatedValue);
}

// Read input from standard input and pass it to the main processing function
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
