const config = { input: '/dev/stdin', newline: '\n' };

const fileSystemModule = require('fs');

let rawInputContent;
try {
  rawInputContent = fileSystemModule.readFileSync(config.input, 'utf8');
} catch (error) {
  process.exit(1);
}

const numericalSequence = rawInputContent
  .split(/\D+/)
  .filter(Boolean)
  .map(Number);

const uniqueValues = [...new Set(numericalSequence)].sort((a, b) => a - b);
const valueToRankMap = new Map();
uniqueValues.forEach((val, idx) => valueToRankMap.set(val, idx));

const maxRank = uniqueValues.length;

const bitStructure = Array(maxRank + 1).fill(0);

const updateBit = (idx, val) => {
  for (let k = idx + 1; k <= maxRank; k += k & -k) {
    bitStructure[k] += val;
  }
};

const queryBit = (idx) => {
  let currentSum = 0;
  for (let k = idx + 1; k > 0; k -= k & -k) {
    currentSum += bitStructure[k];
  }
  return currentSum;
};

let totalInversions = 0;

for (let i = 0; i < numericalSequence.length; i++) {
  const currentNumber = numericalSequence[i];
  const currentRank = valueToRankMap.get(currentNumber);

  totalInversions += i - queryBit(currentRank);

  updateBit(currentRank, 1);
}

console.log(totalInversions);
