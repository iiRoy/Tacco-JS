var processInputData = function(rawDataString) {
  // Divide the raw string into an array of lines for processing.
  var inputLines = rawDataString.split('\n');

  // Parse the first number from the input; its value is not utilized in the core logic.
  var firstLineVal = parseInt(inputLines[0], 10);

  // Extract the second line, split it by spaces, and convert each part to an integer.
  var availableQuantities = inputLines[1].split(' ').map(itemStr => parseInt(itemStr, 10));

  // Sort the array of available quantities. Note: default sort is lexicographical.
  availableQuantities = availableQuantities.sort();

  // Parse the third line to determine the total count of required items.
  var numRequirements = parseInt(inputLines[2], 10);

  // Extract the fourth line, split by spaces, and convert each segment to an integer.
  var requiredItems = inputLines[3].split(' ').map(elementString => parseInt(elementString, 10));

  // Sort the array of required items. Note: default sort is lexicographical.
  requiredItems = requiredItems.sort();

  // Initialize the final outcome string to 'No'.
  var resultStatus = 'No';

  // Declare a variable to temporarily hold the requirement being checked.
  var currentRequirement;

  // Iterate through each of the specified requirements.
  for (var reqIndex = 0; reqIndex < numRequirements; reqIndex = reqIndex + 1) {
    // Retrieve the next requirement from the front of the required items list.
    currentRequirement = requiredItems.shift();

    // Determine the current number of items remaining in the available list.
    var availableCount = availableQuantities.length;

    // Search for a match for the current requirement within the available items.
    for (var itemIndex = 0; itemIndex < availableCount; itemIndex++) {
      // If a matching item is found:
      if (currentRequirement == availableQuantities[itemIndex]) {
        // Remove the matched item and all preceding items from the available list.
        availableQuantities = availableQuantities.slice(itemIndex + 1);
        // Exit this inner loop as the requirement has been fulfilled.
        break;
      }
    }
  }

  // After all requirements are processed, append a hexadecimal zero to the required items array.
  requiredItems.push(0x00);

  // Define a distinct array containing a single hexadecimal zero for comparison purposes.
  var comparisonArray = [0x00];

  // Compare the 'requiredItems' array with 'comparisonArray'.
  // In JavaScript, direct array comparison using '==' checks for reference equality,
  // meaning this condition will always evaluate to false as they are distinct objects.
  if (requiredItems == comparisonArray) {
    resultStatus = 'Yes'; // This specific code path is effectively unreachable under default JS array comparison.
  }

  // Display the determined result status.
  console.log(resultStatus);

  // Conclude the function by returning a numeric value, typically signifying successful execution.
  return 0x0;
};

// Invoke the primary function, reading input from standard input stream, decoding as UTF-8, and trimming whitespace.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8").trim());