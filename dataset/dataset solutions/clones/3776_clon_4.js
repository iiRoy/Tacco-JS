if (!String.prototype.repeat) {
    String.prototype.repeat = function (count) {
        'use strict';
        if (this == null) {
            throw new TypeError('can\'t convert ' + this + ' to object');
        }
        var str = '' + this;
        count = +count;
        if (count != count) {
            count = 0;
        }
        if (count < 0) {
            throw new RangeError('repeat count must be non-negative');
        }
        if (count == Infinity) {
            throw new RangeError('repeat count must be less than infinity');
        }
        count = Math.floor(count);
        if (str.length == 0 || count == 0) {
            return '';
        }
        if (str.length * count >= 1 << 28) {
            throw new RangeError('repeat count must not overflow maximum string size');
        }
        var rpt = '';
        for (;;) {
            if ((count & 1) == 1) {
                rpt += str;
            }
            count >>>= 1;
            if (count == 0) {
                break;
            }
            str += str;
        }
        return rpt;
    };
}

function checkObjectEquivalence(firstObj, secondObj) {
    const firstKeys = Object.getOwnPropertyNames(firstObj);
    const secondKeys = Object.getOwnPropertyNames(secondObj);

    if (firstKeys.length !== secondKeys.length) {
        return false;
    }

    return firstKeys.every(propName => firstObj[propName] === secondObj[propName]);
}

const powerBaseSixes = Array.from({ length: 6 }, (_, idx) => Math.pow(6, 6 - idx));
const powerBaseNines = Array.from({ length: 5 }, (_, idx) => Math.pow(9, 5 - idx));

const maxCountableValue = 10000;
const minimumStepsCache = new Array(maxCountableValue + 1);

for (let currentVal = 0; currentVal <= maxCountableValue; currentVal++) {
    if (currentVal < 6) {
        minimumStepsCache[currentVal] = currentVal;
    } else if (currentVal < 9) {
        minimumStepsCache[currentVal] = 1 + (currentVal - 6);
    } else {
        minimumStepsCache[currentVal] = Infinity;
    }
}

for (let currentVal = 9; currentVal <= maxCountableValue; currentVal++) {
    let currentMinSteps = Infinity;

    for (const pwr6 of powerBaseSixes) {
        if (currentVal - pwr6 >= 0) {
            currentMinSteps = Math.min(currentMinSteps, minimumStepsCache[currentVal - pwr6] + 1);
        }
    }

    for (const pwr9 of powerBaseNines) {
        if (currentVal - pwr9 >= 0) {
            currentMinSteps = Math.min(currentMinSteps, minimumStepsCache[currentVal - pwr9] + 1);
        }
    }
    minimumStepsCache[currentVal] = currentMinSteps;
}

function calculateMinOperations(targetNumber) {
    if (targetNumber < 6) {
        return targetNumber;
    }
    if (targetNumber > maxCountableValue) {
        return Infinity;
    }
    return minimumStepsCache[targetNumber];
}

function processColorGrid(inputData) {
    const inputLines = inputData.split("\n");

    const firstLineParts = inputLines[0].split(" ").map(val => Number.parseInt(val, 10));
    const gridRows = firstLineParts[0];
    const distinctColors = firstLineParts[1];

    let remainingLines = inputLines.slice(1);

    const costMatrix = Array.from({ length: distinctColors }, (_, rowIdx) =>
        remainingLines.shift().split(" ").map(val => Number.parseInt(val, 10))
    );

    const colorGrid = Array.from({ length: gridRows }, (_, rowIdx) =>
        remainingLines.shift().split(" ").map(val => Number.parseInt(val, 10))
    );

    const groupColorTallies = Array.from({ length: 3 }, () =>
        Array.from({ length: distinctColors }, () => 0)
    );

    for (let r = 0; r < gridRows; r++) {
        for (let col = 0; col < gridRows; col++) {
            const cellColor = colorGrid[r][col];
            const groupIndex = (r + col) % 3;
            groupColorTallies[groupIndex][cellColor - 1]++;
        }
    }

    const groupTransformationCosts = Array.from({ length: 3 }, (_, groupIdx) => {
        const currentGroupTallies = groupColorTallies[groupIdx];
        return Array.from({ length: distinctColors }, (_, targetColorIdx) => {
            let totalCostForTarget = 0;
            for (let sourceColorIdx = 0; sourceColorIdx < distinctColors; sourceColorIdx++) {
                if (sourceColorIdx !== targetColorIdx) {
                    totalCostForTarget += currentGroupTallies[sourceColorIdx] * costMatrix[sourceColorIdx][targetColorIdx];
                }
            }
            return totalCostForTarget;
        });
    });

    let overallMinimumCost = Infinity;
    const availableColorIndices = Array.from({ length: distinctColors }, (_, idx) => idx);

    overallMinimumCost = availableColorIndices.reduce((currentMinOverall, colorForGroup0) => {
        return availableColorIndices.reduce((currentMinForGroup1, colorForGroup1) => {
            if (colorForGroup0 === colorForGroup1) {
                return currentMinForGroup1;
            }
            return availableColorIndices.reduce((currentMinForGroup2, colorForGroup2) => {
                if (colorForGroup2 === colorForGroup0 || colorForGroup2 === colorForGroup1) {
                    return currentMinForGroup2;
                }
                const currentCombinationTotal =
                    groupTransformationCosts[0][colorForGroup0] +
                    groupTransformationCosts[1][colorForGroup1] +
                    groupTransformationCosts[2][colorForGroup2];
                return Math.min(currentMinForGroup2, currentCombinationTotal);
            }, currentMinForGroup1);
        }, currentMinOverall);
    }, Infinity);

    console.log(overallMinimumCost);
}

processColorGrid(require("fs").readFileSync("/dev/stdin", "utf8"));
