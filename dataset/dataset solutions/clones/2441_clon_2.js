function ProcessInput(val) {
  // This function processes a numerical input value.
  // It determines whether the number is even or odd
  // and performs a specific calculation based on that.

  if (val % 2 === 0.0) {
    // If the value is an even number, perform this calculation.
    console.log((val / 2.0) - 1.0);
  } else {
    // Otherwise, if the value is an odd number, perform this alternative calculation.
    console.log((val / 2.0) - 0.50);
  }
}

// Read the input from standard input and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
