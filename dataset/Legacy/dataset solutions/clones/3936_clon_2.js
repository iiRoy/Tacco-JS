// This function processes the given input string to generate a sequence of numbers.
function ProcessInput(rawData) {
  // Parse the input string into an integer, representing the desired count.
  const countVal = parseInt(rawData);

  // Initialize an empty array to store the resulting numbers.
  var resultArray = [];

  // Check for a specific edge case where the count is exactly 3.
  if (countVal === 3) {
    // If count is 3, populate the array with a predefined set of values.
    resultArray = [2, 3, 25];
  } else {
    // For other counts, generate a larger set of numbers.
    // The outer loop iterates a fixed number of times based on a constant division.
    for (var outerIdx = 0; outerIdx < 30000 / 12; outerIdx++) {
      // The inner loop iterates over a predefined set of offset values.
      for (var innerVal of [2, 4, 3, 9, 8, 10, 6, 12]) {
        // Calculate and add a new number to the result array.
        resultArray.push(outerIdx * 12 + innerVal);
      }
    }

    // Trim the array to the desired length specified by 'countVal'.
    // This removes elements from the 'countVal' index up to the end.
    resultArray.splice(countVal, resultArray.length - countVal);

    // If the final count is an odd number, modify the last element.
    if (countVal % 2 === 1) {
      // Replace the last element with a specific large number.
      resultArray[countVal - 1] = 30000;
    }
  }

  // Output the elements of the result array, joined by spaces, to the console.
  console.log(resultArray.join(" "));
}

// Read input from standard input and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
