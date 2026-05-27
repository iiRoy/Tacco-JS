var findValueInSortedArray = (targetValue, arrayLength, sortedArray) => {
  let lowIndex = 0;
  let highIndex = arrayLength;

  while (lowIndex < highIndex) {
    let sumOfIndices = lowIndex + highIndex;
    let middleIndex = Math.floor(sumOfIndices / 2);

    let currentValue = sortedArray[middleIndex];

    if (currentValue === targetValue) {
      return true;
    } else if (targetValue < currentValue) {
      highIndex = middleIndex;
    } else {
      lowIndex = middleIndex + 1;
    }
  }

  return false;
};

(function(inputData) {
  const STD_IN_FILE_PATH = '/dev/stdin';

  let trimmedInputContent = inputData.trim();
  let inputLines = trimmedInputContent.split('\n');

  let rawSearchableNumbersString = inputLines[1];
  let searchableStringParts = rawSearchableNumbersString.split(" ");
  let searchableNumbers = searchableStringParts.map(Number);

  let rawTargetNumbersString = inputLines[3];
  let targetStringParts = rawTargetNumbersString.split(" ");
  let targetNumbers = targetStringParts.map(Number);

  let foundCount = 0;
  const numberOfTargets = targetNumbers.length;

  targetNumbers.forEach(currentSearchTarget => {
    foundCount += findValueInSortedArray(currentSearchTarget, searchableNumbers.length, searchableNumbers);
  });

  console.log(foundCount);
})(require('fs').readFileSync('/dev/stdin', 'utf8'));
