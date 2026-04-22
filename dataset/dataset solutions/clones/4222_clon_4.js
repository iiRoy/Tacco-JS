function determineTargetSum(charSequence) {
    const numericComponents = Array.from(charSequence.substring(0, 4)).map(Number);

    const operatorOptions = ['+', '-'];
    const operatorArrangements = [];

    for (const firstOp of operatorOptions) {
        for (const secondOp of operatorOptions) {
            for (const thirdOp of operatorOptions) {
                operatorArrangements.push([firstOp, secondOp, thirdOp]);
            }
        }
    }

    for (const currentOps of operatorArrangements) {
        let currentEvaluation = numericComponents[0];
        let currentFormula = String(numericComponents[0]);

        if (currentOps[0] === '+') {
            currentEvaluation += numericComponents[1];
        } else {
            currentEvaluation -= numericComponents[1];
        }
        currentFormula += currentOps[0] + String(numericComponents[1]);

        if (currentOps[1] === '+') {
            currentEvaluation += numericComponents[2];
        } else {
            currentEvaluation -= numericComponents[2];
        }
        currentFormula += currentOps[1] + String(numericComponents[2]);

        if (currentOps[2] === '+') {
            currentEvaluation += numericComponents[3];
        } else {
            currentEvaluation -= numericComponents[3];
        }
        currentFormula += currentOps[2] + String(numericComponents[3]);

        if (currentEvaluation === 7) {
            return currentFormula + '=7';
        }
    }

    return "No valid combination found.";
}

const ioManager = require("fs");

const executeSolverWithStdin = () => {
    const rawInputContent = ioManager.readFileSync("/dev/stdin", "utf8");
    return determineTargetSum(rawInputContent.trim());
};

console.log(executeSolverWithStdin());