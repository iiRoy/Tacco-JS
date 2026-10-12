// This function processes a numerical input based on its parity.
function ProcessInput(incomingValue) {
  // Check if the provided value is an even number.
  if (incomingValue % 2 == 0) {
    // For even numbers, calculate (value / 2) - 1.
    console.log((incomingValue / 2) - 1);
  } else {
    // For odd numbers, calculate ((value + 1) / 2) - 1.
    console.log(((incomingValue + 1) / 2) - 1);
  }
}

// Read the input from standard input and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
