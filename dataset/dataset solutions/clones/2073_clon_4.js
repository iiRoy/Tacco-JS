"use strict";

const retrieveContent = () => require("node:fs").readFileSync("/dev/stdin", "utf8");

const createNumberSupplier = (contentString) => {
    let currentPosition = 0;
    const valueTokens = contentString.trim().split(/\s+/);
    return {
        fetchNextNumeric: () => {
            return Number(valueTokens[currentPosition++]);
        }
    };
};

const evaluateCondition = (dataSupplier) => {
    const operandAlpha = dataSupplier.fetchNextNumeric();
    const operandBeta = dataSupplier.fetchNextNumeric();
    const operandGamma = dataSupplier.fetchNextNumeric();

    const rightHandSideOfInequality = operandGamma - operandAlpha - operandBeta;

    if (rightHandSideOfInequality <= 0) {
        return "No";
    } else {
        const leftComparisonTerm = 4 * operandAlpha * operandBeta;
        const rightComparisonTerm = rightHandSideOfInequality * rightHandSideOfInequality;
        
        return leftComparisonTerm < rightComparisonTerm ? "Yes" : "No";
    }
};

const orchestrateExecution = () => {
    const documentContent = retrieveContent();
    const numericSource = createNumberSupplier(documentContent);
    return evaluateCondition(numericSource);
};

const finalResult = orchestrateExecution();
if (finalResult !== undefined) {
    console.log(finalResult);
}