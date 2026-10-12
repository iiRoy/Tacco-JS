function checkEquivalence(firstObj, secondObj) {
    const firstPropNames = Object.getOwnPropertyNames(firstObj);
    const secondPropNames = Object.getOwnPropertyNames(secondObj);

    if (firstPropNames.length !== secondPropNames.length) {
        return false;
    }

    return firstPropNames.every(propName =>
        Object.prototype.hasOwnProperty.call(secondObj, propName) && firstObj[propName] === secondObj[propName]
    );
}

function convertToNumber(inputString) {
    return Number(inputString);
}

const powerSixValues = Array.from({ length: 6 }, (_, idx) => Math.pow(6, 6 - idx));
const powerNineValues = Array.from({ length: 5 }, (_, idx) => Math.pow(9, 5 - idx));

const memoizedCounts = new Map();
function calculateCount(val) {
    if (memoizedCounts.has(val)) {
        return memoizedCounts.get(val);
    }

    let result;
    switch (true) {
        case val < 6:
            result = val;
            break;
        case val < 9:
            result = 1 + (val - 6);
            break;
        default:
            let bestSix = 0;
            for (const sVal of powerSixValues) {
                if (sVal <= val) {
                    bestSix = sVal;
                    break;
                }
            }
            let bestNine = 0;
            for (const nVal of powerNineValues) {
                if (nVal <= val) {
                    bestNine = nVal;
                    break;
                }
            }
            result = Math.min(calculateCount(val - bestSix) + 1, calculateCount(val - bestNine) + 1);
            break;
    }
    memoizedCounts.set(val, result);
    return result;
}

function processInputData(rawData) {
    const inputLines = rawData.split("\n");
    let currentLineIndex = 0;

    const [numN, numC] = inputLines[currentLineIndex++].split(" ").map(convertToNumber);
    
    const costMatrix = Array.from({ length: numC }, (_, rowIdx) =>
        inputLines[currentLineIndex + rowIdx].split(" ").map(convertToNumber)
    );
    currentLineIndex += numC;

    const colorGrid = Array.from({ length: numN }, (_, rowIdx) =>
        inputLines[currentLineIndex + rowIdx].split(" ").map(convertToNumber)
    );

    const colorDistributionByMod = Array.from({ length: 3 }, () => Array(numC).fill(0));
    
    for (let rowIdx = 0; rowIdx < numN; ++rowIdx) {
        for (let colIdx = 0; colIdx < numN; ++colIdx) {
            const colorValue = colorGrid[rowIdx][colIdx];
            colorDistributionByMod[(rowIdx + colIdx) % 3][colorValue - 1]++;
        }
    }

    const calculatedScores = [];
    for (const currentStat of colorDistributionByMod) {
        const debugOutputRow = [];
        const scoresForMod = [];

        for (let targetColor = 0; targetColor < numC; ++targetColor) {
            let currentSum = 0;
            const debugOutputInner = [];

            for (let sourceColor = 0; sourceColor < numC; ++sourceColor) {
                const cost = (sourceColor === targetColor) ? 0 : currentStat[sourceColor] * costMatrix[sourceColor][targetColor];
                currentSum += cost;
                debugOutputInner.push(cost);
            }
            scoresForMod.push(currentSum);
            debugOutputRow.push(debugOutputInner);
        }
        console.log(debugOutputRow);
        calculatedScores.push(scoresForMod);
    }

    let overallMinScore = Infinity;
    const colorIndices = Array.from({ length: numC }, (_, i) => i);

    colorIndices.forEach(firstColor => {
        colorIndices.forEach(secondColor => {
            if (firstColor === secondColor) {
                return;
            }
            colorIndices.forEach(thirdColor => {
                if (secondColor === thirdColor || firstColor === thirdColor) {
                    return;
                }

                const currentCombinationScore = calculatedScores[0][firstColor] +
                                                calculatedScores[1][secondColor] +
                                                calculatedScores[2][thirdColor];

                if (overallMinScore <= currentCombinationScore) {
                    console.log(firstColor, secondColor, thirdColor);
                }
                overallMinScore = Math.min(overallMinScore, currentCombinationScore);
            });
        });
    });
    console.log(rawData, colorDistributionByMod, calculatedScores, overallMinScore);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
