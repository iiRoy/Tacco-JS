function ProcessInput(rawData) {
  // Split the raw input string into an array of lines.
  var linesArray = rawData.split("\n");

  // Parse the first line to extract two integer values.
  // The first value represents the total number of items (K).
  var totalItems = parseInt(linesArray[0].split(" ")[0]);
  // The second value represents the maximum number of types (T).
  var maxTypes = parseInt(linesArray[0].split(" ")[1]);

  // Process the second line: split by space, then convert each part to an integer.
  // This creates an array of item counts for each type.
  var itemCounts = linesArray[1].split(" ").map((elementValue, indexPosition) => {
    return parseInt(elementValue);
  });

  // Sort the array of item counts in descending order.
  // The comparison function `a < b` effectively sorts in descending order for numbers.
  itemCounts.sort((valA, valB) => {
    return valA < valB;
  });

  // Calculate the result based on the largest item count and total items.
  // Then, print the maximum of this calculated value and zero to the console.
  console.log(Math.max.apply(null, [itemCounts[0] - 1 - (totalItems - itemCounts[0]), 0]));
}

// Read input from standard input and pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
