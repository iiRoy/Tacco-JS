function ProcessInput(rawData) {
  // This function takes raw input, processes it, and prints a calculated value.
  // First, parse the input string into an integer.
  rawData = parseInt(rawData.trim().split(" "));

  // Calculate an initial base value.
  var baseValue = 800 * rawData;

  // Determine a discount amount based on a specific condition.
  var discountAmount = 200 * Math.floor(rawData / 15);

  // Output the final result after applying the discount.
  console.log(baseValue - discountAmount);
}

// Read the input from standard input and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
