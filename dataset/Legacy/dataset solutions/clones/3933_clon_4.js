function processInput(inputString) {
  const countValue = parseInt(inputString);

  let sumOfRelevantProducts = 0;
  let middleSegment = [];

  // Generate the middle elements (i * 2) and accumulate their sum.
  // The original loop runs for i from 2 up to n - 2 (inclusive).
  // This range is non-empty only if n - 2 >= 2, i.e., n >= 4.
  if (countValue >= 4) {
    middleSegment = Array.from({ length: countValue - 3 }, (_, index) => {
      const currentMultiplier = index + 2; // Maps 0-indexed to 2, 3, ...
      const elementValue = currentMultiplier * 2;
      sumOfRelevantProducts += elementValue;
      return elementValue;
    });
  }

  // Calculate the value for the last element (a[n-1] in original).
  // Original formula: Math.ceil(b / 30) * 30 - b % 30 + 22
  // Equivalent: b + (b % 30 === 0 ? 0 : (30 - 2 * (b % 30))) + 22
  const remainderValue = sumOfRelevantProducts % 30;
  const adjustedSumForLastElement = sumOfRelevantProducts + (remainderValue === 0 ? 0 : (30 - 2 * remainderValue));
  const finalElementComputedValue = adjustedSumForLastElement + 22;

  let finalSequence;

  // Handle array construction based on countValue to match original behavior.
  // The original code initializes `a = [3, 5]` and then modifies it.
  // If n=0, a[-1] is set, which adds a property but doesn't change array elements. Output: "3 5"
  // If n=1, a[0] is set. Output: "22 5"
  // If n=2, a[1] is set. Output: "3 22"
  // If n=3, a[2] is set. Output: "3 5 22"
  // If n>=4, a[0], a[1], middle elements, and a[n-1] are all distinct.
  if (countValue === 0) {
    finalSequence = [3, 5];
  } else if (countValue === 1) {
    finalSequence = [finalElementComputedValue, 5];
  } else if (countValue === 2) {
    finalSequence = [3, finalElementComputedValue];
  } else if (countValue === 3) {
    finalSequence = [3, 5, finalElementComputedValue];
  } else { // countValue >= 4
    finalSequence = [3, 5].concat(middleSegment);
    finalSequence.push(finalElementComputedValue);
  }

  console.log(finalSequence.join(" "));
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
