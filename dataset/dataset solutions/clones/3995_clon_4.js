function ExecuteCalculation(dataString) {
    const [upperLimit, lowerRemainder] = dataString.split('\n')[0].split(' ').map(Number);

    const iterationStart = lowerRemainder === 0 ? 1 : lowerRemainder;

    const sequenceElements = Array.from({ length: upperLimit - iterationStart + 1 }, (_, idx) => iterationStart + idx);

    const finalTally = sequenceElements.reduce((outerAccumulator, primaryOperand) => {
        return outerAccumulator + sequenceElements.reduce((innerAccumulator, secondaryOperand) => {
            const conditionMet = primaryOperand < secondaryOperand || (primaryOperand % secondaryOperand) >= lowerRemainder;
            return innerAccumulator + (conditionMet ? 1 : 0);
        }, 0);
    }, 0);

    console.log(finalTally);
}

ExecuteCalculation(require("fs").readFileSync("/dev/stdin", "utf8"));