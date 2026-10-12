function processInput(dataString) {
    const numericValues = dataString.trim().split(" ").map(Number);
    const paramA = numericValues[0];
    const paramB = numericValues[1];
    const paramC = numericValues[2];

    const difference = paramC - paramB;

    const adjustment = (difference % 2 === 0)
        ? Math.max(0, difference / 2 - 1)
        : Math.max(0, (difference - 1) / 2);

    const primaryValue = paramA - paramB - adjustment;
    const secondaryValue = paramC - 1 - adjustment;

    const intermediateOutcome = Math.min(primaryValue, secondaryValue);

    const finalOutcome = (difference % 2 === 0)
        ? Math.min(difference / 2, intermediateOutcome)
        : intermediateOutcome;

    console.log(finalOutcome);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
