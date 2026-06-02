function ProcessInput(rawData) {
  // This function takes raw input, processes it, and prints a calculated value.
  // It first splits the input string by spaces and converts each segment into a floating-point number.
  let parsedNumbers = rawData.split(' ').map(val => parseFloat(val));

  // Then, it calculates the product of the first two numbers obtained from the input.
  let calculationResult = parsedNumbers[0] * parsedNumbers[1];

  // Finally, it outputs the smallest integer greater than or equal to the calculated product.
  console.log(Math.ceil(calculationResult));
}

// The program initiates by reading the content from standard input,
// decoding it as UTF-8, and then passing it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
