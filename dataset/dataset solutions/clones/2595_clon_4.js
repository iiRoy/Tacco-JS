const processInput = (rawInput) => {
  const [initialValueStr, targetValueStr] = rawInput.split(" ");

  if (targetValueStr === '1') {
    console.log("0");
    return;
  }

  const initialNumeric = Number(initialValueStr);
  const targetNumeric = Number(targetValueStr);

  const incrementAmount = initialNumeric - 1;

  // The original code enters an infinite loop if the value
  // does not increase (or decreases) and is still less than the target.
  // This occurs when incrementAmount <= 0 AND initialNumeric < targetNumeric.
  if (incrementAmount <= 0 && initialNumeric < targetNumeric) {
    // Replicate the infinite loop behavior.
    while (true) {
      // Intentionally loop indefinitely without producing output.
    }
  }

  // If the initial value is already sufficient (greater than or equal to target),
  // the original loop does not execute, and the count remains 1.
  if (initialNumeric >= targetNumeric) {
    console.log(1);
    return;
  }

  // At this point, we know:
  // 1. incrementAmount > 0 (not an infinite loop scenario)
  // 2. initialNumeric < targetNumeric (not the base case where count is 1)
  // Therefore, at least one increment is needed.

  // Calculate the number of times 'incrementAmount' must be added to 'initialNumeric'
  // to reach or exceed 'targetNumeric'.
  // We are looking for the smallest integer 'N' such that:
  // initialNumeric + N * incrementAmount >= targetNumeric
  // N * incrementAmount >= targetNumeric - initialNumeric
  // N >= (targetNumeric - initialNumeric) / incrementAmount
  // Since N must be an integer, we use Math.ceil to find the smallest such N.
  const necessaryAdditions = Math.ceil((targetNumeric - initialNumeric) / incrementAmount);

  // In the original code, the 'count' variable starts at 1.
  // It increments once for each iteration of the 'while' loop.
  // If 'N' additions are necessary, the loop runs 'N' times.
  // Thus, the final 'count' will be 1 + N.
  const finalResult = 1 + necessaryAdditions;

  console.log(finalResult);
};

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
