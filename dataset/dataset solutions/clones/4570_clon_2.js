// This program processes input data to determine a specific minimum value based on geometric properties.
function ProcessInput(rawData) {
  // Divide the incoming string of data into individual lines.
  let parsedLines = rawData.split("\n");

  // Extract the numerical height and width values from the first line of input.
  // The '- 0' idiom converts the string parts to numbers.
  const heightVal = parsedLines[0].split(' ')[0] - 0;
  const widthVal = parsedLines[0].split(' ')[1] - 0;

  // Initialize a variable to track the smallest difference found, starting with an infinitely large value.
  var minimumDifference = Infinity;

  // Check for a special condition: if either dimension is perfectly divisible by three.
  // In such a case, the minimum difference is zero, and no further calculations are needed.
  if (heightVal % 3 === 0 || widthVal % 3 === 0) {
    console.log(0); // Output the result for this special case.
    return; // Exit the function immediately.
  }

  // Set the initial minimum difference to the smaller of the two dimensions.
  minimumDifference = Math.min(heightVal, widthVal);

  // Evaluate potential minimum differences based on the parity of the height.
  if (heightVal % 2 === 0) {
    // If the height is an even number, consider half of the height as a candidate for the minimum.
    minimumDifference = Math.min(minimumDifference, heightVal / 2);
  } else {
    // If the height is an odd number, calculate a specific value involving both dimensions.
    // This calculation represents a particular division strategy.
    minimumDifference = Math.min(minimumDifference, heightVal / 2 + widthVal / 3 - 1 / 6);
  }

  // Evaluate potential minimum differences based on the parity of the width.
  if (widthVal % 2 === 0) {
    // If the width is an even number, consider half of the width as a candidate for the minimum.
    minimumDifference = Math.min(minimumDifference, widthVal / 2);
  } else {
    // If the width is an odd number, calculate another specific value involving both dimensions.
    // This calculation mirrors the logic for odd height, but with dimensions swapped.
    minimumDifference = Math.min(minimumDifference, widthVal / 2 + heightVal / 3 - 1 / 6);
  }

  // Output the final calculated minimum difference, rounded to the nearest whole number.
  console.log(Math.round(minimumDifference));
}

// The following line is responsible for reading input from the standard input stream
// and passing it to the main processing function. It is part of the execution environment setup.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
