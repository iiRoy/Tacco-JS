function compareObjects(objA, objB) {
    const propNamesA = Object.keys(objA);
    const propNamesB = Object.keys(objB);

    if (propNamesA.length !== propNamesB.length) {
        return false;
    }

    return propNamesA.every(keyIdentifier => objA[keyIdentifier] === objB[keyIdentifier]);
}

function parseIntegerVal(strValue) {
    return Number(strValue);
}

const firstSeriesPowers = Array.from({ length: 6 }, (_, index) => Math.pow(6, 6 - index));
const secondSeriesPowers = Array.from({ length: 5 }, (_, index) => Math.pow(9, 5 - index));

function determineMinSteps(val) {
    if (val < 6) {
        return val;
    }
    if (val < 9) {
        return 1 + (val - 6);
    }

    let largestPowerFromFirst = 0;
    for (const pwr of firstSeriesPowers) {
        if (pwr <= val) {
            largestPowerFromFirst = pwr;
            break;
        }
    }

    let largestPowerFromSecond = 0;
    for (const pwr of secondSeriesPowers) {
        if (pwr <= val) {
            largestPowerFromSecond = pwr;
            break;
        }
    }
    
    return Math.min(
        determineMinSteps(val - largestPowerFromFirst) + 1,
        determineMinSteps(val - largestPowerFromSecond) + 1
    );
}

function processInputData(rawDataSet) {
    const lineSegments = rawDataSet.split("\n");
    let currentLineIndex = 0;

    const getParsedLine = () => lineSegments[currentLineIndex++].split(" ").map(parseIntegerVal);

    const [gridDim, colorCount] = getParsedLine();

    const costMatrix = [];
    for (let rowIdx = 0; rowIdx < colorCount; rowIdx++) {
        costMatrix.push(getParsedLine());
    }

    const initialGrid = [];
    for (let rowIdx = 0; rowIdx < gridDim; rowIdx++) {
        initialGrid.push(getParsedLine());
    }

    const modulusColorStats = Array.from({ length: 3 }, () => Array(colorCount).fill(0));

    for (let rowIdx = 0; rowIdx < gridDim; rowIdx++) {
        for (let colIdx = 0; colIdx < gridDim; colIdx++) {
            modulusColorStats[(rowIdx + colIdx) % 3][initialGrid[rowIdx][colIdx] - 1]++;
        }
    }

    const modulusScoreMatrix = Array(3);
    for (let modGroupIdx = 0; modGroupIdx < 3; modGroupIdx++) {
        const currentStatBlock = modulusColorStats[modGroupIdx];
        const debugMatrixForMod = Array(colorCount); // To replicate the inner console.log structure
        modulusScoreMatrix[modGroupIdx] = Array(colorCount);

        for (let targetColorIdx = 0; targetColorIdx < colorCount; targetColorIdx++) {
            let currentTotalScore = 0;
            const tempScoresForDebugRow = Array(colorCount); // For each targetColorIdx

            for (let sourceColorIdx = 0; sourceColorIdx < colorCount; sourceColorIdx++) {
                const colorFrequency = currentStatBlock[sourceColorIdx];
                const individualScore = (sourceColorIdx === targetColorIdx)
                    ? 0
                    : colorFrequency * costMatrix[sourceColorIdx][targetColorIdx];
                currentTotalScore += individualScore;
                tempScoresForDebugRow[sourceColorIdx] = individualScore;
            }
            debugMatrixForMod[targetColorIdx] = tempScoresForDebugRow;
            modulusScoreMatrix[modGroupIdx][targetColorIdx] = currentTotalScore;
        }
        console.log(debugMatrixForMod); // Replicate the first console.log
    }

    let overallMinimumCost = Number.POSITIVE_INFINITY;

    for (let firstChoice = 0; firstChoice < colorCount; firstChoice++) {
        for (let secondChoice = 0; secondChoice < colorCount; secondChoice++) {
            if (firstChoice === secondChoice) {
                continue;
            }
            for (let thirdChoice = 0; thirdChoice < colorCount; thirdChoice++) {
                if (secondChoice === thirdChoice || firstChoice === thirdChoice) {
                    continue;
                }
                const currentCombinationCost =
                    modulusScoreMatrix[0][firstChoice] +
                    modulusScoreMatrix[1][secondChoice] +
                    modulusScoreMatrix[2][thirdChoice];

                if (overallMinimumCost <= currentCombinationCost) { // Replicate the specific debug condition
                    console.log(firstChoice, secondChoice, thirdChoice);
                }
                overallMinimumCost = Math.min(overallMinimumCost, currentCombinationCost);
            }
        }
    }

    console.log(rawDataSet, modulusColorStats, modulusScoreMatrix, overallMinimumCost);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));