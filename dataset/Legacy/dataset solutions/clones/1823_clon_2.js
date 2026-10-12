console.log((inputData => {
  // Process the raw input string to extract numerical data.
  // The first line provides the total count, and subsequent lines contain pairs of numbers.
  const [[countElements], ...dataMatrix] = inputData
    .trim()
    .split('\n')
    .map(rowStr => rowStr.split(' ').map(valStr => valStr | 0));

  // Declare two separate arrays to hold the first and second components of each pair.
  const firstValues = [];
  const secondValues = [];

  // Iterate through the parsed data to populate the two arrays.
  for (let idx = 0; idx < countElements; idx++) {
    firstValues.push(dataMatrix[idx][0]);
    secondValues.push(dataMatrix[idx][1]);
  }

  // Sort both arrays numerically in ascending order to prepare for median calculations.
  firstValues.sort((elemA, elemB) => elemA - elemB);
  secondValues.sort((elemA, elemB) => elemA - elemB);

  // Apply different calculation logic based on whether the total count is odd or even.
  if (countElements % 2 !== 0) { // Check if countElements is odd
    // If the count is odd, use the single middle element for calculation.
    const medianIdx = (countElements - 1) / 2;
    return secondValues[medianIdx] - firstValues[medianIdx] + 1;
  } else {
    // If the count is even, use the two middle elements for calculation.
    const medianIdx = countElements / 2;
    return secondValues[medianIdx] + secondValues[medianIdx - 1] - firstValues[medianIdx] - firstValues[medianIdx - 1] + 1;
  }
})(require('fs').readFileSync('/dev/stdin', 'utf8')));
