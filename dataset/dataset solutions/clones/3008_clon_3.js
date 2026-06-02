const parseNumericArrayLine = (lineContent) => {
  return lineContent.split(' ').map(strNum => parseInt(strNum, 10));
};

function processInput(rawData) {
  const inputLines = rawData.split('\n');

  const elementCount = parseInt(inputLines[0], 10);

  const valueItems = parseNumericArrayLine(inputLines[1]);
  const costItems = parseNumericArrayLine(inputLines[2]);

  let accumulatedProfit = 0;

  for (let currentIdx = 0; currentIdx < elementCount; currentIdx++) {
    const itemValue = valueItems[currentIdx];
    const itemCost = costItems[currentIdx];

    const profitCandidate = itemValue - itemCost;

    if (profitCandidate >= 0) {
      accumulatedProfit += profitCandidate;
    }
  }

  console.log(accumulatedProfit);
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
