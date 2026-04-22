function PerformCalculations(inputString) {
  // Process the raw input string: split by space and convert to numerical values.
  var numberSequence = inputString.split(" ").map(Number);

  // Calculate an intermediate quantity based on elements from the sequence.
  // The operation is equivalent to: -first_element + second_element + third_element.
  var derivedQuantity = -numberSequence[0] + numberSequence[1] + numberSequence[2];

  // Ensure the derived quantity is not negative; set to zero if it is.
  if (derivedQuantity <= 0) {
    derivedQuantity = 0;
  }

  // Output the minimum of the second and third elements,
  // followed by a space and the final derived quantity.
  console.log(Math.min(numberSequence[1], numberSequence[2]) + " " + derivedQuantity);
}

// Read input from standard input, decode as UTF-8, remove leading/trailing whitespace,
// and then invoke the main processing function with this cleaned string.
PerformCalculations(
  require("fs").readFileSync("/dev/stdin", "utf8").trim()
);