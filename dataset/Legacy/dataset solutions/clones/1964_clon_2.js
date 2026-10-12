function ProcessInput(rawData) {
  // Split the raw input string into individual lines based on newline characters.
  const linesOfData = rawData.split("\n");

  // Parse the first line to get constraint values.
  // It splits the line by spaces and converts each part to an integer.
  const constraints = linesOfData[0].split(" ").map(val => parseInt(val, 10));

  // Parse the second line to get a list of numeric values.
  // It splits the line by spaces and converts each part to an integer.
  const numericValues = linesOfData[1].split(" ").map(item => parseInt(item, 10));

  // Define a helper function to compute the sum of elements in an array.
  var calculateSum = function(dataArray) {
    var currentTotal = 0; // Initialize accumulator for the sum.
    // Iterate over each element in the provided array.
    dataArray.forEach(function(elementValue) {
      currentTotal += elementValue; // Add the current element's value to the total.
    });
    return currentTotal; // Return the computed sum.
  };

  // Calculate the final result by subtracting the sum of numeric values
  // from the first constraint value.
  let finalResult = constraints[0] - calculateSum(numericValues);

  // Output the final result. If it's non-negative, print the result itself;
  // otherwise, print -1.
  console.log(finalResult >= 0 ? finalResult : -1);
}

// Read input from standard input and pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
