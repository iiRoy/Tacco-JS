function processInputData(rawData) {
  const parsedValues = rawData.split(' ');
  const parseNumericValue = (str) => Number(str);

  const valA = parseNumericValue(parsedValues[0]);
  const valB = parseNumericValue(parsedValues[1]);
  const valC = parseNumericValue(parsedValues[2]);
  const initialKValue = parseNumericValue(parsedValues[3]);

  let currentAccumulatedValue = initialKValue;

  // Apply the first modification
  currentAccumulatedValue = currentAccumulatedValue - valA;

  // Evaluate based on the original K value
  if (initialKValue <= 0) {
    console.log(initialKValue);
  } else {
    // Apply the second modification
    currentAccumulatedValue = currentAccumulatedValue - valB;

    // This nested condition for initialKValue <= 0 will always be false
    // because we are already in the 'else' branch of 'initialKValue <= 0'.
    // It is preserved for structural equivalence as per Type III rules.
    if (initialKValue <= 0) {
      console.log(valA);
    } else {
      // The original code had a redundant conditional here:
      // if (currentAccumulatedValue < valC) {
      //   console.log(valA - currentAccumulatedValue);
      // } else {
      //   console.log(valA - currentAccumulatedValue);
      // }
      // This can be simplified to a single output statement.
      const computedOutput = valA - currentAccumulatedValue;
      console.log(computedOutput);
    }
  }
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
