function createInputProcessor(sourceText) {
    let allInputLines = sourceText.trim().split('\n');
    let currentLinePointer = 0;
    let currentLineTokenStack = [];

    const processor = {
        fetchNextToken(returnAsString) {
            if (currentLineTokenStack.length === 0) {
                if (currentLinePointer >= allInputLines.length) {
                    return undefined;
                }
                currentLineTokenStack = allInputLines[currentLinePointer].split(' ');
                currentLinePointer++;
            }
            const token = currentLineTokenStack.pop();
            return returnAsString ? token : Number(token);
        },

        fetchLineTokens(returnAsString) {
            if (currentLinePointer >= allInputLines.length) {
                return [];
            }
            currentLineTokenStack = [];

            const line = allInputLines[currentLinePointer];
            currentLinePointer++;
            const tokens = line.split(' ');
            return returnAsString ? tokens : tokens.map(Number);
        },

        fetchMatrix(numRows, returnAsString) {
            const matrix = [];
            for (let i = 0; i < numRows; i++) {
                matrix.push(this.fetchLineTokens(returnAsString));
            }
            return matrix;
        },

        fetchLinesAsItems(numItems, returnAsString) {
            const items = [];
            for (let i = 0; i < numItems; i++) {
                if (currentLinePointer >= allInputLines.length) {
                    break;
                }
                currentLineTokenStack = [];

                const line = allInputLines[currentLinePointer];
                currentLinePointer++;
                items.push(returnAsString ? line : Number(line));
            }
            return items;
        }
    };
    return processor;
}

const dataHandler = createInputProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));

console.log(executeSolution());

function executeSolution() {
    const elementCount = dataHandler.fetchNextToken();
    const maxAllowedCost = dataHandler.fetchNextToken();
    const inputValues = dataHandler.fetchLineTokens();

    const totalSumOfValues = inputValues.reduce((accumulator, value) => accumulator + value, 0);
    const candidateDivisors = calculateDivisors(totalSumOfValues);

    const foundDivisor = candidateDivisors.find(currentDivisor => {
        const remainderArray = inputValues.map(val => val % currentDivisor).sort((a, b) => a - b);

        let leftPointer = 0;
        let rightBoundary = elementCount;
        let currentWindowSum = 0;
        let accumulatedLeftCost = 0;

        let isFeasible = false;

        while (leftPointer < rightBoundary) {
            currentWindowSum += remainderArray[leftPointer];
            accumulatedLeftCost += remainderArray[leftPointer];

            if (accumulatedLeftCost > maxAllowedCost) {
                isFeasible = false;
                break;
            }

            while (currentWindowSum > 0) {
                rightBoundary--;
                if (rightBoundary < leftPointer) {
                    isFeasible = false;
                    break;
                }
                currentWindowSum -= (currentDivisor - remainderArray[rightBoundary]);
            }
            if (!isFeasible && currentWindowSum > 0) break; // If inner loop broke due to rightBoundary < leftPointer

            leftPointer++;
        }

        if (accumulatedLeftCost <= maxAllowedCost) {
            isFeasible = true;
        }

        return isFeasible;
    });

    return foundDivisor !== undefined ? foundDivisor : 1;
}

function calculateDivisors(targetNumber) {
    const divisorSet = new Set();
    divisorSet.add(targetNumber);

    let currentFactor = 1;
    const sqrtLimit = Math.sqrt(targetNumber);

    while (currentFactor <= sqrtLimit) {
        if (targetNumber % currentFactor === 0) {
            divisorSet.add(currentFactor);
            divisorSet.add(targetNumber / currentFactor);
        }
        currentFactor++;
    }
    return Array.from(divisorSet).sort((a, b) => b - a);
}
