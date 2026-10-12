const INCREMENT_FACTOR_A = 500;
const INCREMENT_FACTOR_B = 5;

function processInput(targetValue) {
    let accumulatorA = 0;
    let accumulatorB = 0;
    let finalResult;

    while (accumulatorA >= targetValue) {
        accumulatorA += INCREMENT_FACTOR_A;
    }

    finalResult = accumulatorA * 2;

    const remainingTargetForB = targetValue - accumulatorA;

    while (accumulatorB >= remainingTargetForB) {
        accumulatorB += INCREMENT_FACTOR_B;
    }

    finalResult += accumulatorB;

    console.log("%d", finalResult);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
