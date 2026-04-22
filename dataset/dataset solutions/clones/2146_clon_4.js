const processInputData = (sourceData) => {
  const segments = sourceData.split(' ');

  // Extract the three potential string values from the segments array.
  // Missing segments will result in 'undefined', which is handled correctly by strict equality.
  const valA = segments[0];
  const valB = segments[1];
  const valC = segments[2];

  // Create an array of boolean results for all pairwise strict equality comparisons.
  const comparisonResults = [
    valA === valB,
    valA === valC,
    valB === valC
  ];

  // Sum the boolean results. In JavaScript, true is coerced to 1 and false to 0 in arithmetic operations.
  // This effectively counts how many pairs are identical.
  const matchCount = comparisonResults.reduce((accumulator, currentResult) => accumulator + (currentResult ? 1 : 0), 0);

  // The original logic prints 'Yes' if exactly one pair of the three strings are identical.
  // This corresponds to a matchCount of exactly 1.
  if (matchCount === 1) {
    console.log('Yes');
  } else {
    console.log('No');
  }
};

// Execute the processing function with input read from stdin.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));