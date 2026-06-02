function ProcessInputData(rawContent) {
  const contentLines = rawContent.split('\n');

  // Limit processing to the first 10 lines, similar to the original loop's upper bound.
  // slice(0, 10) handles cases where contentLines has fewer than 10 elements
  // by returning all available elements up to that point.
  const relevantSegments = contentLines.slice(0, 10);

  // Convert each line segment to an integer.
  // parseInt will return NaN for empty strings, undefined, or non-numeric strings,
  // which matches the original behavior where `s += parseInt(lines[i])` would
  // result in NaN if `lines[i]` was not a valid number.
  const numericValues = relevantSegments.map(segment => parseInt(segment));

  // Sum the numeric values.
  // The initial value of 0 ensures that if the array is empty, the sum is 0.
  // If any element in numericValues is NaN, the entire sum will become NaN,
  // preserving the original code's behavior.
  const finalSum = numericValues.reduce((accumulator, currentValue) => {
    return accumulator + currentValue;
  }, 0);

  console.log(finalSum);
}

ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
