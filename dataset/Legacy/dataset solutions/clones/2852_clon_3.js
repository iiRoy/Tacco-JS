var InputReaderFactory = (function () {
    function createReader(inputString) {
        return new InputReader(inputString);
    }

    function InputReader(inputString) {
        this.inputLines = inputString.trim().split("\n");
        this.currentLineIndex = 0;
    }

    function convertToNumberIfApplicable(valueString, asString) {
        return asString ? valueString : +valueString;
    }

    InputReader.prototype.readSingleValue = function (asString) {
        let currentLineContent = this.inputLines[this.currentLineIndex];
        if (typeof currentLineContent === "string") {
            this.inputLines[this.currentLineIndex] = currentLineContent.split(" ").reverse();
        }
        let extractedValue = this.inputLines[this.currentLineIndex].pop();
        if (!this.inputLines[this.currentLineIndex].length) {
            this.currentLineIndex++;
        }
        return convertToNumberIfApplicable(extractedValue, asString);
    };

    InputReader.prototype.readLineValues = function (asString) {
        const lineContent = this.inputLines[this.currentLineIndex++];
        const values = lineContent.split(" ");
        return asString ? values : values.map(val => +val);
    };

    InputReader.prototype.readMatrix = function (numRows, asString) {
        const matrixRows = this.inputLines.slice(this.currentLineIndex, this.currentLineIndex += numRows);
        return asString ? matrixRows.map(row => row.split(" ")) : matrixRows.map(row => row.split(" ").map(val => +val));
    };

    InputReader.prototype.readLines = function (numLines, asString) {
        const lines = this.inputLines.slice(this.currentLineIndex, this.currentLineIndex += numLines);
        return asString ? lines : lines.map(val => +val);
    };

    return createReader;
})();

const inputData = InputReaderFactory(require("fs").readFileSync("/dev/stdin", "utf8"));

function createMultiDimArray(initialValue) {
    const args = arguments;
    const numDimensions = args.length;
    let arrayCreationExpression = `Array(args[${numDimensions - 1}]).fill(0).map(x=>{return initialValue;})`;
    for (let i = numDimensions - 2; i >= 1; i--) {
        arrayCreationExpression = `Array(args[${i}]).fill(0).map(x=>${arrayCreationExpression})`;
    }
    return eval(arrayCreationExpression);
}

console.log(processInput());

function processInput() {
    const initialValue = inputData.readSingleValue();
    const firstArray = inputData.readLineValues();
    const secondArray = inputData.readLineValues();

    function filterAndGroupPairs(arrA, arrB, comparisonFn) {
        const filteredLesser = [];
        const filteredGreater = [];
        for (let i = 0; i < 3; i++) {
            if (comparisonFn(arrA[i], arrB[i])) {
                filteredLesser.push(arrA[i]);
                filteredGreater.push(arrB[i]);
            }
        }
        return { lesser: filteredLesser, greater: filteredGreater };
    }

    let { lesser: lesserValues, greater: greaterValues } = filterAndGroupPairs(firstArray, secondArray, (a, b) => a < b);
    let intermediateResult = calculateMaxProfit(initialValue, lesserValues, greaterValues);

    ({ lesser: lesserValues, greater: greaterValues } = filterAndGroupPairs(secondArray, firstArray, (b, a) => b < a));
    return calculateMaxProfit(intermediateResult, lesserValues, greaterValues);
}

function calculateMaxProfit(currentN, costs, profits) {
    const numPairs = costs.length;

    if (numPairs === 0) {
        return currentN;
    }

    if (numPairs === 1) {
        const itemCost = costs[0];
        const itemProfit = profits[0];
        const numItems = Math.floor(currentN / itemCost);
        currentN -= numItems * itemCost;
        currentN += numItems * itemProfit;
        return currentN;
    }

    if (numPairs === 3) {
        const maxProfitDP = Array.from({ length: currentN + 1 }, () => -1);
        maxProfitDP[0] = currentN;

        for (let i = 0; i < 3; i++) {
            const currentItemCost = costs[i];
            const currentItemProfit = profits[i];
            for (let currentCapacity = currentItemCost; currentCapacity <= currentN; currentCapacity++) {
                if (maxProfitDP[currentCapacity - currentItemCost] !== -1) {
                    maxProfitDP[currentCapacity] = Math.max(maxProfitDP[currentCapacity], maxProfitDP[currentCapacity - currentItemCost] + currentItemProfit);
                }
            }
        }
        return Math.max(...maxProfitDP);
    }

    // Case for numPairs === 2
    const getProfitRatio = (cost, profit) => (profit - cost) / cost;

    let item1Cost, item1Profit, item2Cost, item2Profit;

    const ratioForPair0 = getProfitRatio(costs[0], profits[0]);
    const ratioForPair1 = getProfitRatio(costs[1], profits[1]);

    if (ratioForPair0 < ratioForPair1) {
        item1Cost = costs[1];
        item1Profit = profits[1];
        item2Cost = costs[0];
        item2Profit = profits[0];
    } else {
        item1Cost = costs[0];
        item1Profit = profits[0];
        item2Cost = costs[1];
        item2Profit = profits[1];
    }

    const maxPossibleItem1Count = Math.floor(currentN / item1Cost);
    let maxAchievedProfit = 0;

    const calculateProfitForCombination = (numItem1, totalCapacity, costA, profitA, costB, profitB) => {
        let remainingCapacity = totalCapacity - numItem1 * costA;
        const numItem2 = Math.floor(remainingCapacity / costB);
        remainingCapacity -= numItem2 * costB;
        remainingCapacity += numItem1 * profitA;
        remainingCapacity += numItem2 * profitB;
        return remainingCapacity;
    };

    const loopUpperLimit = Math.min(5000, maxPossibleItem1Count);
    for (let item1CountDecrement = 0; item1CountDecrement <= loopUpperLimit; item1CountDecrement++) {
        const currentNumItem1 = maxPossibleItem1Count - item1CountDecrement;
        const currentProfit = calculateProfitForCombination(currentNumItem1, currentN, item1Cost, item1Profit, item2Cost, item2Profit);
        if (maxAchievedProfit < currentProfit) {
            maxAchievedProfit = currentProfit;
        }
    }
    return maxAchievedProfit;
}
