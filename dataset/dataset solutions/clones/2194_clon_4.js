const performCalculation = (sourceData) => {
    const dataFragments = sourceData.split('\n');
    const [configData, valueSet] = dataFragments;

    const configValues = configData.split(' ').map(Number);
    const [capacityLimit, exclusionCount] = configValues;

    const rawValues = valueSet.split(' ');

    const strategyBank = new Map();

    strategyBank.set('insufficientCapacity', () => '0');

    strategyBank.set('noExclusions', () => {
        // Replicating the original code's bug for K=0:
        // The original loop `for(j=0;j<m.length;i++){ count+=m[i]; }`
        // If 'i' is undeclared, it becomes global `undefined`.
        // `undefined++` results in `NaN`. Accessing `m[NaN]` yields `undefined`.
        // `count += undefined` results in `NaN`.
        // Therefore, for K=0, the output is NaN.
        return NaN;
    });

    strategyBank.set('standardExclusion', (items, skipAmount, totalCount) => {
        // Replicating the original's lexicographical descending sort for strings
        // The original comparator `(a < b ? 1 : -1)` sorts strings lexicographically descending.
        const orderedItems = [...items].sort((firstItem, secondItem) => 
            (firstItem < secondItem ? 1 : -1)
        );
        
        return orderedItems.slice(skipAmount, totalCount)
                           .reduce((accumulatedSum, currentItem) => 
                               accumulatedSum + Number.parseInt(currentItem, 10), 0);
    });

    let finalResult;
    if (capacityLimit <= exclusionCount) {
        finalResult = strategyBank.get('insufficientCapacity')();
    } else if (exclusionCount === 0) {
        finalResult = strategyBank.get('noExclusions')();
    } else {
        finalResult = strategyBank.get('standardExclusion')(rawValues, exclusionCount, capacityLimit);
    }

    console.log(String(finalResult));
};

performCalculation(require("fs").readFileSync("/dev/stdin", "utf8"));