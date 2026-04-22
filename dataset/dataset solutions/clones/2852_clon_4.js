const makeInputReader = (rawContent) => {
    let lines = rawContent.trim().split('\n');
    let currentLineIndex = 0;

    const fetchNextToken = (asString) => {
        let currentSegments = lines[currentLineIndex];
        if (typeof currentSegments === 'string') {
            lines[currentLineIndex] = currentSegments.split(' ').reverse();
        }
        const token = lines[currentLineIndex].pop();
        if (lines[currentLineIndex].length === 0) {
            currentLineIndex++;
        }
        return asString ? token : Number(token);
    };

    const fetchLineTokens = (asString) => {
        const segments = lines[currentLineIndex++].split(' ');
        return asString ? segments : segments.map(Number);
    };

    const fetchMatrix = (rowCount, asString) => {
        const matrix = [];
        for (let i = 0; i < rowCount; i++) {
            matrix.push(lines[currentLineIndex++].split(' '));
        }
        return asString ? matrix : matrix.map(row => row.map(Number));
    };

    const fetchRows = (rowCount, asString) => {
        const extractedRows = [];
        for (let i = 0; i < rowCount; i++) {
            extractedRows.push(lines[currentLineIndex++]);
        }
        return asString ? extractedRows : extractedRows.map(Number);
    };

    return {
        grabToken: fetchNextToken,
        grabLine: fetchLineTokens,
        grabBlock: fetchMatrix,
        grabLines: fetchRows,
    };
};

const makeMultiDimArray = (initialValue, ...dimensions) => {
    if (dimensions.length === 0) {
        return initialValue;
    }
    const currentDimSize = dimensions[0];
    const remainingDims = dimensions.slice(1);
    const result = new Array(currentDimSize);
    for (let i = 0; i < currentDimSize; i++) {
        result[i] = makeMultiDimArray(initialValue, ...remainingDims);
    }
    return result;
};

const calculateOptimalValue = (initialFunds, costs, profits) => {
    const itemCount = costs.length;

    switch (itemCount) {
        case 0:
            return initialFunds;
        case 1:
            {
                const itemCost = costs[0];
                const itemProfit = profits[0];
                const maxItemsToBuy = Math.floor(initialFunds / itemCost);
                let finalFunds = initialFunds - (maxItemsToBuy * itemCost);
                finalFunds += (maxItemsToBuy * itemProfit);
                return finalFunds;
            }
        case 3:
            {
                const valueTable = makeMultiDimArray(-1, initialFunds + 1);
                valueTable[0] = initialFunds;

                costs.forEach((currentCost, index) => {
                    const currentProfit = profits[index];
                    for (let capacity = currentCost; capacity <= initialFunds; capacity++) {
                        if (valueTable[capacity - currentCost] !== -1) {
                            valueTable[capacity] = Math.max(valueTable[capacity], valueTable[capacity - currentCost] + currentProfit);
                        }
                    }
                });
                return Math.max(...valueTable);
            }
        case 2:
            {
                const [c1, c2] = costs;
                const [p1, p2] = profits;

                let bestItemCost, bestItemProfit, otherItemCost, otherItemProfit;

                if ((p2 - c2) / c2 < (p1 - c1) / c1) {
                    bestItemCost = c1;
                    bestItemProfit = p1;
                    otherItemCost = c2;
                    otherItemProfit = p2;
                } else {
                    bestItemCost = c2;
                    bestItemProfit = p2;
                    otherItemCost = c1;
                    otherItemProfit = p1;
                }

                let maxBestItems = Math.floor(initialFunds / bestItemCost);
                let overallMaxResult = 0;

                for (let sacrificeCount = 0; sacrificeCount <= Math.min(5000, maxBestItems); sacrificeCount++) {
                    const currentBestItemCount = maxBestItems - sacrificeCount;
                    let remainingCash = initialFunds - (currentBestItemCount * bestItemCost);
                    
                    const currentOtherItemCount = Math.floor(remainingCash / otherItemCost);
                    remainingCash -= (currentOtherItemCount * otherItemCost);
                    
                    let currentTotalValue = remainingCash;
                    currentTotalValue += (currentBestItemCount * bestItemProfit);
                    currentTotalValue += (currentOtherItemCount * otherItemProfit);
                    
                    if (currentTotalValue > overallMaxResult) {
                        overallMaxResult = currentTotalValue;
                    }
                }
                return overallMaxResult;
            }
        default:
            return initialFunds;
    }
};

const processScenario = (dataStream) => {
    const initialAmount = dataStream.grabToken();
    const firstSet = dataStream.grabLine();
    const secondSet = dataStream.grabLine();

    const filterAndPair = (conditionFn) => {
        const firstFiltered = [];
        const secondFiltered = [];
        firstSet.forEach((valA, idx) => {
            const valB = secondSet[idx];
            if (conditionFn(valA, valB)) {
                firstFiltered.push(valA);
                secondFiltered.push(valB);
            }
        });
        return [firstFiltered, secondFiltered];
    };

    const [smallerValues, largerValues] = filterAndPair((vA, vB) => vA < vB);
    const intermediateResult = calculateOptimalValue(initialAmount, smallerValues, largerValues);

    const [otherSmallerValues, otherLargerValues] = filterAndPair((vA, vB) => vB < vA);
    return calculateOptimalValue(intermediateResult, otherSmallerValues, otherLargerValues);
};

const inputSource = makeInputReader(require("fs").readFileSync("/dev/stdin","utf8"));
console.log(processScenario(inputSource));