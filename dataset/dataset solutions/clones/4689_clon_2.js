function CalculateValue(incomingData) {
  // This function computes a specific value based on the provided input.
  // It calculates two components and then finds their difference.

  // First component calculation: incoming data multiplied by a constant factor.
  let firstComponent = incomingData * 800;

  // Second component calculation:
  // The input is divided by 15, floored, and then multiplied by another constant.
  const divisor = 15;
  const multiplier = 200;
  let secondComponent = Math.floor(incomingData / divisor) * multiplier;

  // Output the final result to the console.
  console.log(firstComponent - secondComponent);
}

// Read input from standard input and pass it to the main calculation function.
// The input is expected to be a string, which JavaScript will implicitly convert to a number
// when arithmetic operations are performed.
CalculateValue(require("fs").readFileSync("/dev/stdin", "utf8"));
