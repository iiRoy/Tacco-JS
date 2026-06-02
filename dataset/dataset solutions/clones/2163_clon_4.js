function Main(rawInput) {
  let lines = rawInput.split("\n");
  if (lines[lines.length - 1] === '') {
    lines.pop();
  }

  const targetDigits = lines[0];

  // The accumulator for reduce will hold an array representing the current state:
  // [costIfNoCarryToNextDigit, costIfCarryToNextDigit]
  // This corresponds to the original [down, up] variables.
  // Initial state: [0, 1] corresponds to original down=0, up=1.
  const finalCosts = targetDigits.split('').reduce((currentCosts, digitChar) => {
    const [prevCostNoCarry, prevCostToCarry] = currentCosts;
    const currentDigitValue = parseInt(digitChar, 10);

    // Calculate the cost for the next state where no carry is propagated to the subsequent digit.
    // This is equivalent to the original 'ndown'.
    // ndown = Math.min(10 - N[i] + up, down + (N[i] - 0));
    const nextCostNoCarry = Math.min(
      prevCostToCarry + (10 - currentDigitValue), // Path from 'costIfCarryToNextDigit' state
      prevCostNoCarry + currentDigitValue          // Path from 'costIfNoCarryToNextDigit' state
    );

    // Calculate the cost for the next state where a carry is propagated to the subsequent digit.
    // This is equivalent to the original 'nup'.
    // nup = Math.min(9 - N[i] + up, 1 + down + (N[i] - 0));
    const nextCostToCarry = Math.min(
      prevCostToCarry + (9 - currentDigitValue), // Path from 'costIfCarryToNextDigit' state
      prevCostNoCarry + (1 + currentDigitValue)  // Path from 'costIfNoCarryToNextDigit' state
    );

    return [nextCostNoCarry, nextCostToCarry];
  }, [0, 1]); // Initial accumulator: [down=0, up=1]

  // The final result is the cost when no carry is propagated from the last digit.
  // This corresponds to the original 'down' variable at the end.
  console.log(finalCosts[0]);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
