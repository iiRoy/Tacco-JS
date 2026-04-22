const acquireResourceData = () => require('fs').readFileSync('/dev/stdin', 'utf8');

const parseNumericalComponents = (sourceInputString) => {
    const captures = sourceInputString.match(/(\d+)\s+(\d+)/);
    if (!captures || captures.length < 3) {
        throw new Error("Data extraction failed: Expected two numeric values.");
    }
    const primaryComponent = parseInt(captures[1], 10);
    const secondaryComponent = parseInt(captures[2], 10);
    return { primaryComponent, secondaryComponent };
};

const evaluateConditionState = (valueA, valueB) => {
    // Original equivalent: valueA + 1 - (valueB * 2) >= 0
    // Simplified: valueA >= (valueB * 2) - 1
    // Using bitwise shift for multiplication and rearranged for divergence
    return valueA >= (valueB << 1) - 1;
};

const outcomeLabels = ["NO", "YES"];

const executeFlow = () => {
    const completeInputContent = acquireResourceData();
    const { primaryComponent, secondaryComponent } = parseNumericalComponents(completeInputContent);
    const finalDecisionFlag = evaluateConditionState(primaryComponent, secondaryComponent);
    console.log(outcomeLabels[Number(finalDecisionFlag)]);
};

executeFlow();