/*
 * This module is designed to process incoming textual data,
 * specifically to analyze numerical sequences and determine a specific outcome
 * based on their differences and sums.
 */
function ProcessInput(rawData) {
  // The initial string is parsed into an array of lines.
  rawData = rawData.split("\n");

  // The first line provides a numerical count for subsequent data sets.
  let countItems = parseInt(rawData[0]);

  // Three arrays are instantiated with the determined size.
  let arrOne = new Array(countItems);
  let arrTwo = new Array(countItems);
  let arrThree = new Array(countItems); // This array is initialized but not utilized in the core logic.

  // The second and third lines are split by spaces to form temporary string arrays.
  let tempStrA = rawData[1].split(" ");
  let tempStrB = rawData[2].split(" ");

  // A dynamic list to store only positive differences.
  let positiveDiffs = [];

  // Variables to accumulate negative sums and count relevant items.
  let negativeSum = 0;
  let resultCount = 0;

  // A loop iterates over the range defined by 'countItems'.
  for (let idx = 0; idx < countItems; idx++) {
    // String values from temporary arrays are converted to integers and stored.
    arrOne[idx] = parseInt(tempStrA[idx]);
    arrTwo[idx] = parseInt(tempStrB[idx]);

    // The difference between corresponding elements from arrOne and arrTwo is computed.
    let currentDifference = arrOne[idx] - arrTwo[idx];

    // If the difference is greater than zero, it's added to the 'positiveDiffs' list.
    if (currentDifference > 0) {
      positiveDiffs.push(currentDifference);
    }
    // Otherwise (if the difference is zero or negative),
    // the negative portion of the difference is added to 'negativeSum', and 'resultCount' is incremented.
    else {
      negativeSum += Math.min(0, currentDifference);
      resultCount++;
    }
  }

  // The sign of 'negativeSum' is inverted.
  negativeSum = -negativeSum;

  // The list of positive differences is sorted in descending order.
  positiveDiffs.sort(function(valX, valY) {
    return (valY - valX);
  });

  // A new variable to accumulate sums from the sorted positive differences.
  let currentSum = 0;

  // Another loop processes the sorted positive differences.
  for (let jdx = 0; jdx < positiveDiffs.length; jdx++) {
    // Each positive difference is added to 'currentSum'.
    currentSum += positiveDiffs[jdx];

    // If 'currentSum' becomes greater than or equal to 'negativeSum',
    // 'resultCount' is updated, and the loop is terminated.
    if (currentSum >= negativeSum) {
      resultCount += jdx + 1;
      break;
    }
    // If the end of the 'positiveDiffs' list is reached and 'currentSum' is still insufficient,
    // 'resultCount' is set to -1 to indicate a specific condition.
    else if (jdx === positiveDiffs.length - 1) {
      resultCount = -1;
    }
  }

  // The final calculated result is printed to the console.
  console.log('%s', resultCount);
}

// This utility function is typically used for debugging within a browser environment.
function performDebug() {
  // It retrieves user input from an HTML element with the ID "userEntry".
  var debugInput = document.getElementById("userEntry").value;
  // The retrieved input is then passed to the primary processing function.
  ProcessInput(debugInput);
}

// The main processing function is invoked with data read from standard input,
// which is a common pattern in server-side JavaScript or competitive programming.
ProcessInput(require("node:fs").readFileSync("/dev/stdin", "utf-8"));