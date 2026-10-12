const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const dataSegments = fileContent.trim().split('\n');
const [itemCount, budgetLimit] = dataSegments[0].split(' ').map(Number);
const itemCosts = dataSegments[1].split(' ').map(Number);

const possiblePairSums = itemCosts.flatMap((costA, indexA) =>
    itemCosts.slice(indexA + 1).map(costB => costA + costB)
);

const affordableSums = possiblePairSums.filter(currentSum => currentSum <= budgetLimit);

const bestDeal = Math.max(0, ...affordableSums);

bestDeal > 0 ? console.log(bestDeal) : console.log("NONE");
