function processInput(rawData) {
    const cleanedInput = rawData.trim();
    const targetValue = parseInt(cleanedInput);

    let valA = 0;
    let foundB = 0;
    const EXPONENT_VALUE = 5;

    const isResultInteger = (numberToCheck) => Number.isInteger(numberToCheck);

    for (let currentB = -100; currentB < 100000000; currentB++) {
        const currentBPowFive = Math.pow(currentB, EXPONENT_VALUE);
        const sumTargetAndBPowFive = targetValue + currentBPowFive;
        valA = Math.pow(sumTargetAndBPowFive, 1 / EXPONENT_VALUE);
        
        if (isResultInteger(valA)) {
            foundB = currentB;
            break;
        }
    }

    console.log(valA + " " + foundB);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
