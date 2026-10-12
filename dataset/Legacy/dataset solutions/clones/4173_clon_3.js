const parseNumbersFromString = (str) => str.split(' ').map(Number);

function processInputData(rawData) {
  const inputLines = rawData.split('\n');

  const [totalElements, maxUniqueGroups] = parseNumbersFromString(inputLines[0]);
  const initialArray = parseNumbersFromString(inputLines[1]).sort((a, b) => a - b);

  const groupCounts = [];
  let finalSum = 0;

  if (initialArray.length === 0) {
    console.log(finalSum);
    return;
  }

  let currentValue = initialArray[0];
  let currentCount = 1;

  for (let idx = 1; idx < initialArray.length; idx++) {
    if (initialArray[idx] === currentValue) {
      currentCount++;
    } else {
      groupCounts.push(currentCount);
      currentValue = initialArray[idx];
      currentCount = 1;
    }
  }
  groupCounts.push(currentCount);

  groupCounts.sort((a, b) => a - b);

  const groupsToEliminateCount = groupCounts.length - maxUniqueGroups;

  if (groupsToEliminateCount <= 0) {
    console.log(finalSum);
    return;
  }

  for (let idx = 0; idx < groupsToEliminateCount; idx++) {
    finalSum += groupCounts[idx];
  }

  console.log(finalSum);
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
