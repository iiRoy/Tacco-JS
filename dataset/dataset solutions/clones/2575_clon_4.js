function ProcessInput(rawData) {
  const inputLines = rawData.split("\n");

  // The original code uses Number(input[0].split(" ")), which for a single number like "5"
  // results in Number(["5"]), which evaluates to 5.
  // For simplicity and equivalent behavior, we parse the first line directly.
  const elementCount = Number(inputLines[0]);

  const alphaSequence = inputLines[1].split(" ").map(Number);
  const betaValues = inputLines[2].split(" ").map(Number);
  const gammaValues = inputLines[3].split(" ").map(Number);

  const finalTally = alphaSequence.reduce((currentAccumulator, currentAlphaElement, currentIndex, fullAlphaArray) => {
    let iterationTally = currentAccumulator;

    // Add the base value from betaValues
    iterationTally += betaValues[currentAlphaElement - 1];

    // Check the conditional bonus
    // The original condition `a[i] === a[i-1]+1` implies `i` must be > 0 for `a[i-1]` to be valid.
    // If `i` is 0, `a[i-1]` is `undefined`, `undefined + 1` is `NaN`, so `a[0] === NaN` is `false`.
    // This behavior is preserved by checking `currentIndex > 0`.
    if (currentIndex > 0 && currentAlphaElement === fullAlphaArray[currentIndex - 1] + 1) {
      iterationTally += gammaValues[currentAlphaElement - 2];
    }

    return iterationTally;
  }, 0); // Initialize the accumulator with 0

  console.log(finalTally);
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
