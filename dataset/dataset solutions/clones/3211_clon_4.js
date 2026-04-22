"use strict";

const performCalculation = (dataSource) => {
    const dataLines = dataSource.split("\n");
    const countOfNumbers = Number(dataLines[0]);

    const sourceNumbers = dataLines.slice(1, countOfNumbers + 1).map(Number);

    const memoizedCosts = new Map(); // Stores results of subproblems { index -> [costState0, costState1, ...] }

    const extractParityCosts = (valueToProcess) => {
        const costWhenEven = (valueToProcess === 0) ? 2 : (valueToProcess % 2);
        const costWhenOdd = (valueToProcess + 1) % 2;
        return { costWhenEven, costWhenOdd };
    };

    const computePathCost = (currentIndex, currentClassifier) => {
        if (currentIndex === 0) {
            return 0; // Base case: cost is zero before processing any elements
        }

        if (memoizedCosts.has(currentIndex) && memoizedCosts.get(currentIndex)[currentClassifier] !== undefined) {
            return memoizedCosts.get(currentIndex)[currentClassifier];
        }

        const elementAtIndex = sourceNumbers[currentIndex - 1]; // Adjust for zero-based array access
        const { costWhenEven, costWhenOdd } = extractParityCosts(elementAtIndex);

        let resultantCost;

        switch (currentClassifier) {
            case 0:
                resultantCost = computePathCost(currentIndex - 1, 0) + elementAtIndex;
                break;
            case 1:
                resultantCost = Math.min(
                    computePathCost(currentIndex - 1, 0),
                    computePathCost(currentIndex - 1, 1)
                ) + costWhenEven;
                break;
            case 2:
                resultantCost = Math.min(
                    computePathCost(currentIndex - 1, 0),
                    computePathCost(currentIndex - 1, 1),
                    computePathCost(currentIndex - 1, 2)
                ) + costWhenOdd;
                break;
            case 3:
                resultantCost = Math.min(
                    computePathCost(currentIndex - 1, 2),
                    computePathCost(currentIndex - 1, 3)
                ) + costWhenEven;
                break;
            case 4:
                resultantCost = Math.min(
                    computePathCost(currentIndex - 1, 0),
                    computePathCost(currentIndex - 1, 1),
                    computePathCost(currentIndex - 1, 2),
                    computePathCost(currentIndex - 1, 3),
                    computePathCost(currentIndex - 1, 4)
                ) + elementAtIndex;
                break;
            default:
                resultantCost = Infinity; // Should not be reached with valid classifiers
        }

        if (!memoizedCosts.has(currentIndex)) {
            memoizedCosts.set(currentIndex, Array(5).fill(undefined));
        }
        memoizedCosts.get(currentIndex)[currentClassifier] = resultantCost;
        return resultantCost;
    };

    const finalResults = Array(5).fill(0).map((_, classifierIndex) =>
        computePathCost(countOfNumbers, classifierIndex)
    );

    console.log(Math.min(...finalResults));
};

performCalculation(require("fs").readFileSync("/dev/stdin", "utf8"));