// This function is designed to process a given string of raw input.
function ProcessInput(rawData) {
  // The input string is split by space, and each part is converted into a BigInt.
  // These two BigInt values are then destructured into 'firstNum' and 'secondNum'.
  const [firstNum, secondNum] = rawData.split(" ").map(BigInt);

  // A complex conditional expression is evaluated to determine the final output value.
  // The result of this evaluation is then converted to a string and printed to the console.
  console.log(
    (
      (firstNum === 1n || secondNum === 1n) // Check if either of the numbers is 1n.
        ? ( // If true, execute this block.
            (firstNum === secondNum) // Check if both numbers are equal (implies both are 1n here).
              ? 0n // If both are 1n, the result is 0n.
              : (firstNum === 1n) // If not equal, check if the first number is 1n.
                ? secondNum - 2n // If firstNum is 1n, calculate secondNum - 2n.
                : firstNum - 2n // Otherwise (secondNum is 1n), calculate firstNum - 2n.
          )
        : ( // If neither number is 1n, execute this block.
            firstNum * secondNum - ( // Calculate product minus a complex subtraction.
              (firstNum - 2n) * 2n + (secondNum - 2n) * 2n // This part calculates a specific sum.
            ) - 4n // Subtract a final 4n from the total.
          )
    ).toString() // Convert the final BigInt result to a string.
  );
}

// The program starts by reading the content of standard input.
// It uses Node.js's 'fs' module to read the file '/dev/stdin' with 'utf8' encoding.
// Any leading or trailing whitespace is removed using '.trim()'.
// Finally, the 'ProcessInput' function is called with the prepared input string.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8").trim());
