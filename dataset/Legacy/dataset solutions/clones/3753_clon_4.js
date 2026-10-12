const processInput = (rawData) => {
  const lines = rawData.split('\n');
  const itemCount = Number(lines[0]);
  const allNumericValues = lines[1].split(' ').map(Number);

  const valuesToEvaluate = allNumericValues.slice(0, itemCount);

  const containsZero = valuesToEvaluate.some(val => val === 0);

  if (containsZero) {
    while (true) {
      // Replicate the original code's infinite loop behavior if a zero value is encountered.
    }
  }

  const totalDivisions = valuesToEvaluate.reduce((accumulator, currentVal) => {
    // For any non-zero integer, Math.log2(currentVal & -currentVal)
    // determines the count of factors of 2. This is equivalent to finding
    // the 0-indexed position of the least significant bit.
    // Example: 12 (binary 1100) -> (12 & -12) = 4 (binary 0100). Math.log2(4) = 2.
    // Example: 7 (binary 0111) -> (7 & -7) = 1 (binary 0001). Math.log2(1) = 0.
    // This method correctly handles both positive and negative non-zero integers.
    return accumulator + Math.log2(currentVal & -currentVal);
  }, 0);

  console.log(totalDivisions);
  return 0;
};

processInput(require("fs").readFileSync("/dev/stdin", "utf8").trim());
