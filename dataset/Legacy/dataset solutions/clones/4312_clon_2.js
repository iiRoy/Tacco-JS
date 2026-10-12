var processInput = function (rawData) {
  // Split the entire input string into individual lines.
  var lineSegments = rawData.split('\n');

  // Parse the first line as an integer, though it's not used in the core logic.
  var unusedCount = parseInt(lineSegments[0]);

  // Process the second line: split by space, then convert each part to an integer.
  var availableItems = lineSegments[1].split(' ').map(itemStr => parseInt(itemStr));
  // Sort the array of available items in ascending order.
  availableItems.sort();

  // Parse the third line as an integer, representing the count of target items.
  var requiredCount = parseInt(lineSegments[2]);

  // Process the fourth line: split by space, then convert each part to an integer.
  var targetItems = lineSegments[3].split(' ').map(itemStr => parseInt(itemStr));
  // Sort the array of target items in ascending order.
  targetItems.sort();

  // Initialize the final outcome string to 'No'.
  var finalResult = 'No';
  // Declare a variable to hold the current target item being processed.
  var currentItem;

  // Iterate through the target items based on the 'requiredCount'.
  for (var outerIdx = 0; outerIdx < requiredCount; outerIdx++) {
    // Remove and retrieve the first element from the 'targetItems' array.
    currentItem = targetItems.shift();
    // Get the current length of the 'availableItems' array.
    var currentLength = availableItems.length;

    // Iterate through the 'availableItems' to find a match for 'currentItem'.
    for (var innerIdx = 0; innerIdx < currentLength; innerIdx++) {
      // If a match is found,
      if (currentItem === availableItems[innerIdx]) {
        // Remove the matched item and all preceding items from 'availableItems'.
        availableItems = availableItems.slice(innerIdx + 1);
        // Exit the inner loop as the current target item has been processed.
        break;
      }
    }
  }

  // After the main processing loop, add a zero to the 'targetItems' array.
  targetItems.push(0);
  // Create a new array containing only the number zero for comparison.
  var comparisonArray = [0];

  // Check if the 'targetItems' array is strictly equal (same reference) to 'comparisonArray'.
  // Due to JavaScript's array comparison by reference, this condition will typically be false
  // unless 'targetItems' somehow becomes the exact same object as 'comparisonArray'.
  if (targetItems === comparisonArray) {
    finalResult = 'Yes'; // This line is practically unreachable under normal circumstances.
  }

  // Output the determined final result to the console.
  console.log(finalResult);

  // The function returns 0, indicating successful execution.
  return 0;
};

// Read input from standard input, decode as UTF-8, and remove leading/trailing whitespace.
processInput(require("fs").readFileSync("/dev/stdin", "utf8").trim());
