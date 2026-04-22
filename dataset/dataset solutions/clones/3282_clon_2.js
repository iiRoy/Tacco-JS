function ProcessContent(sourceContent) {
  // This function processes multi-line input data to categorize numeric values.
  const linesArray = sourceContent.split("\n"); // Divide the full input string into an array of lines.

  var totalItems = parseInt(linesArray[0]); // Extract the total count of items from the first line.
  var firstBound = parseInt(linesArray[1].split(" ")[0]); // Parse the first threshold value from the second line.
  var secondBound = parseInt(linesArray[1].split(" ")[1]); // Parse the second threshold value from the second line.

  let categoryOne = [];   // Initialize an array for numbers less than or equal to the first threshold.
  let categoryTwo = [];   // Initialize an array for numbers between the two thresholds (exclusive of first, inclusive of second).
  let categoryThree = []; // Initialize an array for numbers greater than the second threshold.

  const itemStrings = linesArray[2].split(" "); // Split the third line into an array of number strings.

  for (var idx = 0; idx < totalItems; idx++) { // Iterate through each individual item.
    let currentValue = parseInt(itemStrings[idx]); // Convert the current item string to an integer.

    if (currentValue <= firstBound) {     // Check if the number belongs to the first category.
      categoryOne.push(currentValue);
    } else if (currentValue <= secondBound) { // Check if the number belongs to the second category.
      categoryTwo.push(currentValue);
    } else {                              // Otherwise, it falls into the third category.
      categoryThree.push(currentValue);
    }
  }

  var finalResult = Math.min(
    categoryOne.length,    // Get the count of elements in the first category.
    categoryTwo.length,    // Get the count of elements in the second category.
    categoryThree.length   // Get the count of elements in the third category.
  ); // Determine the minimum number of elements across all three categories.

  console.log('%s', finalResult); // Print the calculated minimum value to the console.
}


// Utility function for local testing, typically triggered by a UI element.
function performTest() {
  const testData = document.getElementById("input").value; // Retrieve sample input from a web page element.
  ProcessContent(testData); // Execute the main logic with the provided test data.
}

// Execute the primary data processing function using content read from the standard input file.
ProcessContent(require("fs").readFileSync("/dev/stdin", "utf8"));