function processInput (rawData) {
  const lines = rawData.split('\n');
  const firstLineParts = lines[0].split(' ');
  const numItems = Number(firstLineParts[0]);
  const selectionCount = Number(firstLineParts[1]);

  const signConfigurations = [
    [1, 1, 1], [1, 1, -1], [1, -1, 1], [1, -1, -1],
    [-1, 1, 1], [-1, -1, 1], [-1, 1, -1], [-1, -1, -1]
  ];

  const allConfigSums = Array.from({ length: signConfigurations.length }, () => []);

  for (let idx = 0; idx < numItems; idx++) {
    const currentLineParts = lines[idx + 1].split(' ');
    const xVal = Number(currentLineParts[0]);
    const yVal = Number(currentLineParts[1]);
    const zVal = Number(currentLineParts[2]);

    for (let configIdx = 0; configIdx < signConfigurations.length; configIdx++) {
      const currentConfig = signConfigurations[configIdx];
      const currentSum = (xVal * currentConfig[0]) + (yVal * currentConfig[1]) + (zVal * currentConfig[2]);
      allConfigSums[configIdx].push(currentSum);
    }
  }

  const finalResults = [];
  for (const configSumList of allConfigSums) {
    finalResults.push(calculateTopMSum(configSumList, selectionCount));
  }

  const maxOverallSum = finalResults.sort((valA, valB) => valA - valB).pop();

  console.log(String(maxOverallSum));
}

function calculateTopMSum(valueList, countToSelect) {
  const sortedList = valueList.sort((valA, valB) => valB - valA);
  const topElements = sortedList.slice(0, countToSelect);
  const totalSum = topElements.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
  return totalSum;
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
