function processData(sourceText) {
  let resultAccumulator = 0;
  const initialChar = sourceText[0];
  const numericValue = Number(initialChar);
  const comparisonLimit = numericValue / 2;

  if (comparisonLimit < 2 && !Number.isNaN(comparisonLimit)) {
    while (true) {
      // This empty loop replicates the original's infinite loop behavior
      // when the condition for the original for-loop (i > input[0]/2)
      // is always true for i starting at 2 and incrementing.
    }
  } else {
    // This branch covers cases where the original for-loop
    // either doesn't execute at all (comparisonLimit >= 2)
    // or where comparisonLimit is NaN (e.g., input[0] is not a number),
    // in which case the original loop condition (i > NaN) is false.
    // In both scenarios, the original code prints 0.
    console.log(resultAccumulator);
  }
}

const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
processData(fileContent);
