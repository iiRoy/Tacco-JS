function processInputAndCompute(rawInput) {
    const [countIterations, incrementLimit] = rawInput.trim().split('\n').map(Number);

    const determineFinalResult = (stepsRemaining, currentQuantity, boundaryValue) => {
        if (stepsRemaining === 0) {
            return currentQuantity;
        }
        const nextQuantity = currentQuantity + (currentQuantity <= boundaryValue ? currentQuantity : boundaryValue);
        return determineFinalResult(stepsRemaining - 1, nextQuantity, boundaryValue);
    };

    const initialQuantity = 1;
    const finalOutcome = determineFinalResult(countIterations, initialQuantity, incrementLimit);
    console.log(finalOutcome);
}

processInputAndCompute(require("fs").readFileSync("/dev/stdin", "utf8"));
