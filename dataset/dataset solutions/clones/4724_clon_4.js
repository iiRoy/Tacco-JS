function myin() {
    return require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
}

function myout(t) {
    console.log(t);
}

function myerr(t) {
    console.error(t);
}

let inputSourceLines;
let currentInputPointer = 0;

function initializeInputSystem() {
    inputSourceLines = myin();
}

function retrieveNextInputLine() {
    if (currentInputPointer >= inputSourceLines.length) {
        throw new Error("Input stream exhausted.");
    }
    return inputSourceLines[currentInputPointer++];
}

const inputTransformers = {
    1: (val) => parseInt(val, 10),
    2: (val) => val.split(" "),
    4: (val) => val.split(" ").map(Number),
    6: (val) => val.split(""),
    7: (val) => val.split("").map(Number),
    8: (arr) => arr.join(" "),
    9: (arr) => arr.join("\n"),
    0: (arr) => arr.join(""),
};

function processInputConversion(value, conversionType) {
    try {
        const handler = inputTransformers[conversionType];
        if (handler) {
            return handler(value);
        }
        return value;
    } catch (e) {
        return value;
    }
}

function obtainInteger() {
    return processInputConversion(retrieveNextInputLine(), 1);
}

function obtainStringArray() {
    return processInputConversion(retrieveNextInputLine(), 2);
}

function obtainIntegerArray() {
    return processInputConversion(retrieveNextInputLine(), 4);
}

function obtainCharacterArray() {
    return processInputConversion(retrieveNextInputLine(), 6);
}

function ExecuteSolution() {
    initializeInputSystem();

    const initialParams = obtainIntegerArray();
    const totalItemsCount = initialParams[0];
    const targetA = initialParams[1];
    const targetB = initialParams[2];

    const itemData = [];
    for (let i = 0; i < totalItemsCount; i++) {
        itemData.push(obtainIntegerArray());
    }

    const maxDimension = 151;
    const unreachableCost = 1e9 + 7;

    let previousIterationCosts = Array(maxDimension).fill(0).map(() => Array(maxDimension).fill(unreachableCost));
    previousIterationCosts[0][0] = 0;

    for (const currentItem of itemData) {
        const [itemA, itemB, itemCost] = currentItem;
        let currentIterationCosts = Array(maxDimension).fill(0).map(() => Array(maxDimension).fill(unreachableCost));

        for (let j = 0; j < maxDimension; j++) {
            for (let k = 0; k < maxDimension; k++) {
                currentIterationCosts[j][k] = Math.min(currentIterationCosts[j][k], previousIterationCosts[j][k]);

                if (previousIterationCosts[j][k] !== unreachableCost) {
                    const nextA = j + itemA;
                    const nextB = k + itemB;

                    if (nextA < maxDimension && nextB < maxDimension) {
                        const newTotalCost = previousIterationCosts[j][k] + itemCost;
                        currentIterationCosts[nextA][nextB] = Math.min(currentIterationCosts[nextA][nextB], newTotalCost);
                    }
                }
            }
        }
        previousIterationCosts = currentIterationCosts;
    }

    let minimumOverallCost = unreachableCost;
    let scalingFactor = 1;

    while (true) {
        const scaledTargetA = targetA * scalingFactor;
        const scaledTargetB = targetB * scalingFactor;

        if (scaledTargetA < maxDimension && scaledTargetB < maxDimension) {
            if (previousIterationCosts[scaledTargetA][scaledTargetB] !== unreachableCost) {
                minimumOverallCost = Math.min(minimumOverallCost, previousIterationCosts[scaledTargetA][scaledTargetB]);
            }
        } else {
            break;
        }
        scalingFactor++;
    }

    if (minimumOverallCost === unreachableCost) {
        myout(-1);
    } else {
        myout(minimumOverallCost);
    }
}

ExecuteSolution();
