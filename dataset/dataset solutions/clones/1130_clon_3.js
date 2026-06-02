const rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');

const processedLines = rawInputData.trim().split('\n');

const firstLineParts = processedLines[0].split(' ');
let targetSum = Number(firstLineParts[0]);
let componentCount = Number(firstLineParts[1]);

const rawComponentStrings = processedLines[1].trim().split(' ');
const availableComponents = rawComponentStrings.map(valStr => Number(valStr));

const memoizationTable = new Map();
memoizationTable.set(0, 0);
const largeValue = Infinity;

console.log(memoizationTable);
console.log(memoizationTable.get(targetSum));

for (let currentAmount = 0; currentAmount <= targetSum; ++currentAmount) {
  if (!memoizationTable.has(currentAmount)) {
    let minimumComponents = largeValue;

    for (let compIdx = 0; compIdx < componentCount; ++compIdx) {
      const previousAmount = currentAmount - availableComponents[compIdx];

      const isPreviousAmountValid = previousAmount >= 0;
      const isPreviousAmountComputable = memoizationTable.has(previousAmount);

      if (isPreviousAmountValid && isPreviousAmountComputable) {
        const countFromPrevious = memoizationTable.get(previousAmount);
        minimumComponents = Math.min(countFromPrevious, minimumComponents);
      }
    }

    if (minimumComponents < largeValue) {
      const finalCountForCurrent = minimumComponents + 1;
      memoizationTable.set(currentAmount, finalCountForCurrent);
    }
  }
}

console.log(memoizationTable.get(targetSum));
