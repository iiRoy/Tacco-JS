const commenceProcessing = (sourceMaterial) => {
    const firstLineContent = sourceMaterial.split('\n')[0];
    const numericalSequence = firstLineContent.split(' ').map(Number);

    const elementCount = numericalSequence[0];
    const constraintA = numericalSequence[1];
    const constraintB = numericalSequence[2];

    const primaryOutcome = Math.min(constraintA, constraintB);

    const ensureNonNegative = (val) => Math.max(0, val);

    const calculationGate = (constraintA === 0 || constraintB === 0) ? 0 : 1;

    const divisionResult = Math.floor(elementCount / 2);

    const intermediateTermA = ensureNonNegative(constraintA - divisionResult);
    const intermediateTermB = ensureNonNegative(constraintB - divisionResult);

    const secondaryOutcome = calculationGate * (intermediateTermA + intermediateTermB);

    console.log(`${primaryOutcome} ${secondaryOutcome}`);
};

const utilizeStandardInput = () => {
    const dataSource = require("fs").readFileSync("/dev/stdin", "utf8");
    commenceProcessing(dataSource);
};

utilizeStandardInput();