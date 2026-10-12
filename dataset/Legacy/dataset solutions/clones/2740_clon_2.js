// This function serves as the primary entry point for processing input data.
function ProcessInput(rawData) {
  // The raw input string is first split into individual lines.
  var inputLines = rawData.split("\n");

  // The first line contains the integer representing the total count of items.
  var totalItemsCount = parseInt(inputLines[0]);

  // The second line contains space-separated string representations of initial values.
  var initialItemValues = inputLines[1].split(" ");

  // An array is initialized to store the calculated parity for each item.
  // Its size is determined by 'totalItemsCount'.
  var itemParityResults = Array(totalItemsCount);

  // An empty array is prepared to collect the 1-based indices of items
  // that ultimately have a parity of 1.
  var qualifyingItemIndices = [];

  // This loop iterates backward, starting from 'totalItemsCount' down to 1.
  // 'currentItemIndex' represents a 1-based index for the current item being processed.
  for (var currentItemIndex = totalItemsCount; currentItemIndex > 0; currentItemIndex--) {
    // A temporary variable to accumulate the sum of parities from related items.
    var accumulatedParitySum = 0;

    // This inner loop calculates the sum of parities for multiples of the 'currentItemIndex'.
    // 'factor' starts from 2 to consider actual multiples.
    // The condition 'currentItemIndex * factor < totalItemsCount' ensures that
    // the calculated multiple (which is used as a 0-based array index)
    // remains within the valid bounds of 'itemParityResults'.
    for (var factor = 2; currentItemIndex * factor < totalItemsCount; factor++) {
      // Add the parity result of the multiple to the accumulated sum.
      // Note: 'currentItemIndex * factor' is used directly as a 0-based index here.
      accumulatedParitySum += itemParityResults[currentItemIndex * factor];
    }

    // Calculate the parity for the current item.
    // This involves summing the 'accumulatedParitySum' with the integer value
    // of the current item's initial value (accessed using 'currentItemIndex - 1' for 0-based indexing),
    // and then taking the result modulo 2.
    itemParityResults[currentItemIndex - 1] = (accumulatedParitySum + parseInt(initialItemValues[currentItemIndex - 1])) % 2;

    // If the calculated parity for the current item is 1,
    // its 1-based index is added to the list of qualifying items.
    if (itemParityResults[currentItemIndex - 1] === 1) {
      qualifyingItemIndices.push(currentItemIndex);
    }
  }

  // Output the total number of qualifying items found.
  console.log(qualifyingItemIndices.length);

  // If there are any qualifying items, their 1-based indices are joined by spaces
  // and then printed to the console.
  if (qualifyingItemIndices.length) {
    console.log(qualifyingItemIndices.join(" "));
  }
}

// The following line is responsible for reading input from standard input
// and invoking the main processing function. It should not be altered.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
