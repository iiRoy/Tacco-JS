function evaluateRange(sourceText) {
  const numericValues = sourceText.trim().split(" ").reduce((accumulator, currentSegment) => {
    accumulator.push(parseInt(currentSegment, 10));
    return accumulator;
  }, []);

  const valueA = numericValues[0];
  const valueB = numericValues[1];
  const valueC = numericValues[2];

  // The original condition checks if valueC is between valueA and valueB (inclusive).
  // This can be mathematically expressed by checking the sign of the product of differences.
  // If valueC is between valueA and valueB, then (valueC - valueA) and (valueC - valueB)
  // will have opposite signs (or one will be zero), making their product less than or equal to zero.
  // If valueC is outside the range, they will have the same sign, making their product positive.
  const differenceProduct = (valueC - valueA) * (valueC - valueB);

  if (differenceProduct <= 0) {
    console.log("Yes");
  } else {
    console.log("No");
  }
}

evaluateRange(require("fs").readFileSync("/dev/stdin", "utf8"));
