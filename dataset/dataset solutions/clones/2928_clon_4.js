const processData = (inputString) => {
    const numericalComponents = inputString.split(' ').map(segment => parseInt(segment, 10));
    const primaryValue = numericalComponents[0];
    const secondaryValue = numericalComponents[1];

    const calculationMatrix = [
        { conditionCheck: (x) => x >= 13, outputTransform: (y) => y },
        { conditionCheck: (x) => x <= 6, outputTransform: (y) => y / 2 },
        { conditionCheck: (x) => x <= 5, outputTransform: () => 0 }
    ];

    const finalOutcome = calculationMatrix.reduce((currentResult, ruleEntry) => {
        if (ruleEntry.conditionCheck(primaryValue)) {
            return ruleEntry.outputTransform(secondaryValue);
        }
        return currentResult;
    }, undefined);

    console.log(finalOutcome);
};

processData(require("fs").readFileSync("/dev/stdin", "utf8"));