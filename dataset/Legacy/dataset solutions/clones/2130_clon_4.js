function Main(input) {
  const parsedParts = input.split(' ');
  const initialNumber = +parsedParts[0];
  const targetBase = +parsedParts[1];

  let finalLength;

  if (initialNumber === 0) {
    // Original behavior for initialNumber = 0:
    // If targetBase is 1 or less (e.g., 0, -2), result is empty, length 0.
    // If targetBase is greater than 1 (e.g., 2, 10), result is "0", length 1.
    finalLength = (targetBase > 1) ? 1 : 0;
  } else { // initialNumber > 0
    if (targetBase <= 1) {
      // Original behavior for initialNumber > 0 and targetBase <= 1:
      // If targetBase is 0 or 1, the original `while` loop becomes infinite.
      // If targetBase is negative, the original loop performs a specific calculation.
      if (targetBase === 0 || targetBase === 1) {
        // Replicate infinite loop behavior
        for (;;) { /* intentionally infinite loop */ }
      } else { // targetBase < 0
        // For negative bases, the original code builds a string by concatenating
        // (value % digit).toString() results. We need to sum these lengths recursively.
        finalLength = (function calculateNegativeBaseLength(currentVal, base) {
          if (currentVal === 0) {
            return 0;
          }
          const remainderString = (currentVal % base).toString();
          const nextVal = Math.floor(currentVal / base);
          return remainderString.length + calculateNegativeBaseLength(nextVal, base);
        })(initialNumber, targetBase);
      }
    } else { // initialNumber > 0 and targetBase > 1
      // For standard bases (positive and > 1), the length can be calculated using logarithms.
      // The length of a number N in base B is floor(log_B(N)) + 1.
      // log_B(N) = log_e(N) / log_e(B)
      finalLength = Math.floor(Math.log(initialNumber) / Math.log(targetBase)) + 1;
    }
  }

  console.log(finalLength);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
