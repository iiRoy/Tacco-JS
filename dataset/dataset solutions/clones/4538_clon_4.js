const determineOutcome = (incomingDataPayload) => {
    const { alpha: firstOperand, beta: secondOperand } = ((data) => {
        const primaryLine = data.split('\n').find(l => l.trim().length > 0) || "";
        const parts = primaryLine.split(' ').slice(0, 2);
        const [numA = NaN, numB = NaN] = parts.map(val => Number(val.trim()));
        return { alpha: numA, beta: numB };
    })(incomingDataPayload);

    const summationResult = firstOperand + secondOperand;

    const decisionMap = new Map([
        [true, "error"],
        [false, String(summationResult)]
    ]);

    return decisionMap.get(summationResult > 9);
};

process.stdout.write(determineOutcome(require("node:fs").readFileSync(0, "utf8")));