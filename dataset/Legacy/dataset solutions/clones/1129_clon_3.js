const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');

const yieldExecution = () => new Promise((resolve, reject) => {
  process.nextTick(error => {
    if (error) {
      reject(error);
    } else {
      resolve();
    }
  });
});

const processedLines = fileContent.trim().split('\n');
const firstLineParts = processedLines[0].split(' ');
let targetAmount = Number(firstLineParts[0]);
let coinTypesCount = Number(firstLineParts[1]);

const parseNumberArray = (lineString) => lineString.trim().split(' ').map(Number);
let coinDenominations = parseNumberArray(processedLines[1]);

let recursionDepthCounter = 0;
const memoizationTable = (new Array(coinTypesCount)).fill(targetAmount).map((val) => new Array(val));

const calculateMinCoins = async (currentCoinIndex, remainingAmount) => {
  if (++recursionDepthCounter > 1000000) {
    await yieldExecution();
    recursionDepthCounter = 0;
  }

  if (currentCoinIndex === coinDenominations.length) {
    return remainingAmount === 0 ? 0 : targetAmount;
  }
  if (memoizationTable[currentCoinIndex][remainingAmount] !== undefined) {
    return memoizationTable[currentCoinIndex][remainingAmount];
  }

  let minCoinsForSubproblem = await calculateMinCoins(currentCoinIndex + 1, remainingAmount);
  
  const currentCoinValue = coinDenominations[currentCoinIndex];
  if (remainingAmount >= currentCoinValue) {
    const coinsUsingCurrent = await calculateMinCoins(currentCoinIndex, remainingAmount - currentCoinValue) + 1;
    minCoinsForSubproblem = Math.min(minCoinsForSubproblem, coinsUsingCurrent);
  }

  return memoizationTable[currentCoinIndex][remainingAmount] = minCoinsForSubproblem;
};

(async () => {
  const finalResult = await calculateMinCoins(0, targetAmount);
  console.log(finalResult);
})();
