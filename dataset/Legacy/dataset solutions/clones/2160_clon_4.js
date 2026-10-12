class BaseSolver {}

function* obtainSpaceIterator(textInput, valueMapper) {
    const parts = textInput.split(/\s+/).filter(Boolean);
    for (const part of parts) {
        yield valueMapper(part);
    }
}

class ProblemSolver extends BaseSolver {
    processInput(problemData) {
        const totalElements = problemData.elementCount;
        const targetRank = problemData.rank;
        const numberArray = problemData.values;

        numberArray.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));

        const countProductsStrictlyLessThan = (threshold, arr) => {
            let currentPairCount = 0n;

            const negativeNumbers = [];
            const zeroNumbers = [];
            const positiveNumbers = [];

            for (const num of arr) {
                if (num < 0n) negativeNumbers.push(num);
                else if (num === 0n) zeroNumbers.push(num);
                else positiveNumbers.push(num);
            }

            const numNeg = BigInt(negativeNumbers.length);
            const numZero = BigInt(zeroNumbers.length);
            const numPos = BigInt(positiveNumbers.length);

            if (threshold > 0n) {
                currentPairCount += numZero * (numNeg + numPos) + numZero * (numZero - 1n) / 2n;
            }

            if (threshold > 0n) {
                let rightPointer = negativeNumbers.length - 1;
                for (let leftPointer = 0; leftPointer < negativeNumbers.length; ++leftPointer) {
                    while (rightPointer > leftPointer && negativeNumbers[leftPointer] * negativeNumbers[rightPointer] >= threshold) {
                        rightPointer--;
                    }
                    currentPairCount += BigInt(rightPointer - leftPointer);
                }
            }

            if (threshold > 0n) {
                let rightPointer = positiveNumbers.length - 1;
                for (let leftPointer = 0; leftPointer < positiveNumbers.length; ++leftPointer) {
                    while (rightPointer > leftPointer && positiveNumbers[leftPointer] * positiveNumbers[rightPointer] >= threshold) {
                        rightPointer--;
                    }
                    currentPairCount += BigInt(rightPointer - leftPointer);
                }
            }

            let posPointer = positiveNumbers.length - 1;
            for (let negPointer = 0; negPointer < negativeNumbers.length; ++negPointer) {
                while (posPointer >= 0 && negativeNumbers[negPointer] * positiveNumbers[posPointer] >= threshold) {
                    posPointer--;
                }
                currentPairCount += BigInt(posPointer + 1);
            }

            return currentPairCount;
        };

        let searchLowerBound = -1000000000n * 1000000000n - 5n;
        let searchUpperBound = 1000000000n * 1000000000n + 5n;
        
        let finalResult = searchLowerBound; 

        while (searchLowerBound <= searchUpperBound) {
            const midPoint = searchLowerBound + (searchUpperBound - searchLowerBound) / 2n;
            const countBelowMid = countProductsStrictlyLessThan(midPoint, numberArray);

            if (countBelowMid < targetRank) {
                finalResult = midPoint;
                searchLowerBound = midPoint + 1n;
            } else {
                searchUpperBound = midPoint - 1n;
            }
        }

        return { finalAnswer: finalResult };
    }

    parseInput(rawInputText) {
        const dataIterator = obtainSpaceIterator(rawInputText, BigInt);
        const countN = dataIterator.next().value;
        const rankK = dataIterator.next().value;
        const valuesA = [];
        for (let idx = 0; idx < countN; idx++) {
            valuesA.push(dataIterator.next().value);
        }
        return { elementCount: countN, rank: rankK, values: valuesA };
    }

    displayOutput(outputData) {
        console.log(outputData.finalAnswer.toString());
    }
}

const fileSystem = require("fs");

fileSystem.readFile("/dev/stdin", "utf8", (readError, fileContent) => {
    if (readError) {
        throw readError;
    }
    const mainApplication = new ProblemSolver();
    const inputData = mainApplication.parseInput(fileContent);
    const solutionOutput = mainApplication.processInput(inputData);
    mainApplication.displayOutput(solutionOutput);
});
