console.log((sourceData => {
    const inputParts = sourceData.trim().split(/\s+/);
    const primaryValue = Number(inputParts[0]);
    const secondaryValue = Number(inputParts[1]);

    const processingLogic = new Map();

    processingLogic.set(true, (arg1, arg2) => {
        const remainingCapacity = arg2 - (2 * arg1);
        return arg1 + Math.floor(remainingCapacity / 4);
    });

    processingLogic.set(false, (arg1, arg2) => {
        return Math.floor(arg2 / 2);
    });

    const evaluationCondition = (primaryValue * 2 <= secondaryValue);
    const finalOutcome = processingLogic.get(evaluationCondition)(primaryValue, secondaryValue);

    return finalOutcome.toString();

})(require('node:fs').readFileSync('/dev/stdin', 'utf8')));