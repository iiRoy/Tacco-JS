if (!String.prototype.repeat) {
    String.prototype.repeat = function (repeatCount) {
        'use strict';
        const currentContext = this;
        if (currentContext === null || currentContext === undefined) {
            throw new TypeError('Cannot convert ' + currentContext + ' to object for string repetition');
        }
        let baseString = String(currentContext);
        let numRepeats = Number(repeatCount);

        if (Number.isNaN(numRepeats)) {
            numRepeats = 0;
        }
        if (numRepeats < 0) {
            throw new RangeError('Repeat count must be non-negative');
        }
        if (numRepeats === Infinity) {
            throw new RangeError('Repeat count must be less than infinity');
        }
        
        numRepeats = Math.floor(numRepeats);

        if (baseString.length === 0 || numRepeats === 0) {
            return '';
        }

        const maxStringLength = 1 << 28;
        if (baseString.length * numRepeats >= maxStringLength) {
            throw new RangeError('Resulting string size would exceed maximum limit');
        }

        let resultAccumulator = '';
        while (numRepeats > 0) {
            if ((numRepeats & 1) === 1) {
                resultAccumulator += baseString;
            }
            baseString += baseString;
            numRepeats >>>= 1;
        }
        return resultAccumulator;
    };
}

function areObjectsShallowlyEqual(objA, objB) {
    const propNamesA = Object.keys(objA);
    const propNamesB = Object.keys(objB);

    if (propNamesA.length !== propNamesB.length) {
        return false;
    }

    const allPropsMatch = propNamesA.every(propName => {
        return objA[propName] === objB[propName];
    });

    return allPropsMatch;
}

const parseDecimalInteger = (textValue) => Number.parseInt(textValue, 10);

const generatePowersArray = (base, maxExponent) => {
    const powers = [];
    for (let exp = maxExponent; exp >= 1; exp--) {
        powers.push(Math.pow(base, exp));
    }
    return powers;
};

const powersOfBaseSix = generatePowersArray(6, 6);
const powersOfBaseNine = generatePowersArray(9, 5);

function calculateMinSteps(currentValue) {
    if (currentValue < 6) {
        return currentValue;
    }
    if (currentValue < 9) {
        return 1 + (currentValue - 6);
    }

    const subtractSixOption = calculateMinSteps(currentValue - powersOfBaseSix.find(power => power <= currentValue)) + 1;
    const subtractNineOption = calculateMinSteps(currentValue - powersOfBaseNine.find(power => power <= currentValue)) + 1;

    return Math.min(subtractSixOption, subtractNineOption);
}

function processGridColoringProblem(problemInput) {
    const inputLines = problemInput.split("\n");

    const firstLineTokens = inputLines.shift().split(" ").map(parseDecimalInteger);
    const gridSizeN = firstLineTokens[0];
    const numColorsC = firstLineTokens[1];

    const parseMatrix = (lineCount) => {
        const matrixLines = inputLines.splice(0, lineCount);
        return matrixLines.map(line => line.split(" ").map(parseDecimalInteger));
    };

    const costMatrixD = parseMatrix(numColorsC);
    const initialGridC = parseMatrix(gridSizeN);

    const colorCountsByMod = Array.from({ length: 3 }, () => Array(numColorsC).fill(0));

    initialGridC.forEach((row, rowIdx) => {
        row.forEach((cellColor, colIdx) => {
            const modGroup = (rowIdx + colIdx) % 3;
            const actualColorIndex = cellColor - 1;
            colorCountsByMod[modGroup][actualColorIndex]++;
        });
    });

    const scorePerModAndTargetColor = colorCountsByMod.map(modGroupStats => {
        return Array.from({ length: numColorsC }, (_, targetColorIdx) => {
            let currentModGroupCost = 0;
            modGroupStats.forEach((countOfOriginalColor, originalColorIdx) => {
                if (originalColorIdx !== targetColorIdx) {
                    currentModGroupCost += countOfOriginalColor * costMatrixD[originalColorIdx][targetColorIdx];
                }
            });
            return currentModGroupCost;
        });
    });

    let overallMinCost = Infinity;

    for (let targetColor0 = 0; targetColor0 < numColorsC; targetColor0++) {
        for (let targetColor1 = 0; targetColor1 < numColorsC; targetColor1++) {
            if (targetColor0 === targetColor1) {
                continue;
            }
            for (let targetColor2 = 0; targetColor2 < numColorsC; targetColor2++) {
                if (targetColor2 === targetColor0 || targetColor2 === targetColor1) {
                    continue;
                }

                const currentCombinationCost =
                    scorePerModAndTargetColor[0][targetColor0] +
                    scorePerModAndTargetColor[1][targetColor1] +
                    scorePerModAndTargetColor[2][targetColor2];

                overallMinCost = Math.min(overallMinCost, currentCombinationCost);
            }
        }
    }
    console.log(overallMinCost);
}

processGridColoringProblem(require("fs").readFileSync("/dev/stdin", "utf8"));
