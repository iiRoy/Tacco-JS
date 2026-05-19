function Main(input) {
  const inputSegments = input.split(' ');
  const numericSubject = Number(inputSegments[0]);
  const targetBase = Number(inputSegments[1]);

  if (numericSubject === 0) {
    console.log(0);
    return;
  }

  if (targetBase === 1) {
    // Replicate the original's infinite loop behavior for base 1 and a positive number.
    // In base 1, any positive number cannot be reduced to 0 by division,
    // and the remainder is always 0, leading to an infinite loop in the original logic.
    for (;;) {
      // This loop will run indefinitely, mirroring the original's behavior.
    }
  }

  // For valid bases (targetBase > 1) and positive numbers,
  // the number of digits N in base B for a number X is floor(log_B(X)) + 1.
  // log_B(X) can be calculated as Math.log(X) / Math.log(B).
  const logarithmicQuotient = Math.log(numericSubject) / Math.log(targetBase);
  const digitCount = Math.floor(logarithmicQuotient) + 1;

  console.log(digitCount);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
