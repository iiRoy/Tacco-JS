const dataStream = require('fs').readFileSync('/dev/stdin', 'utf8');

const processInputLines = (textData) => {
    const segmentedLines = textData.trim().split("\n");

    const discardedQuantity = Number(segmentedLines.shift()); // Corresponds to `n`
    const [initialTerm, commonDifference] = segmentedLines.shift().split(" ").map(Number); // Corresponds to `a`, `d`
    const operationTotal = Number(segmentedLines.shift()); // Corresponds to `m`

    const operationalInstructions = segmentedLines.slice(0, operationTotal).map(line => {
        const [activityType, primaryIdentifier, secondaryIdentifier] = line.split(" ");
        return { activityType, primaryIdentifier, secondaryIdentifier };
    });

    const terminalReference = segmentedLines.slice(operationTotal).shift(); // Corresponds to `k`

    return { initialTerm, commonDifference, operationalInstructions, terminalReference };
};

const executeOperation = (currentMappings, instruction) => {
    const { activityType, primaryIdentifier, secondaryIdentifier } = instruction;

    const primaryExists = currentMappings.has(primaryIdentifier);
    const secondaryExists = currentMappings.has(secondaryIdentifier);
    const primaryAssociatedValue = primaryExists ? currentMappings.get(primaryIdentifier) : null;
    const secondaryAssociatedValue = secondaryExists ? currentMappings.get(secondaryIdentifier) : null;

    if (activityType === "0") { // Symmetric association or swap
        if (!primaryExists && !secondaryExists) {
            currentMappings.set(primaryIdentifier, secondaryIdentifier);
            currentMappings.set(secondaryIdentifier, primaryIdentifier);
        } else if (primaryExists && !secondaryExists) {
            currentMappings.set(secondaryIdentifier, primaryAssociatedValue);
            currentMappings.set(primaryIdentifier, secondaryIdentifier);
        } else if (!primaryExists && secondaryExists) {
            currentMappings.set(primaryIdentifier, secondaryAssociatedValue);
            currentMappings.set(secondaryIdentifier, primaryIdentifier);
        } else { // Both exist, perform swap
            currentMappings.set(primaryIdentifier, secondaryAssociatedValue);
            currentMappings.set(secondaryIdentifier, primaryAssociatedValue);
        }
    } else { // activityType === "1" - Asymmetric assignment
        currentMappings.set(primaryIdentifier, secondaryExists ? secondaryAssociatedValue : secondaryIdentifier);
    }
    return currentMappings;
};

const applicationParameters = processInputLines(dataStream);
const { initialTerm, commonDifference, operationalInstructions, terminalReference } = applicationParameters;

const finalMappingRegistry = operationalInstructions.reduce(executeOperation, new Map());

let effectiveKey = terminalReference;
if (finalMappingRegistry.has(terminalReference)) {
    effectiveKey = finalMappingRegistry.get(terminalReference);
}

const finalKeyAsNumber = Number(effectiveKey);
const finalComputedValue = initialTerm + ((finalKeyAsNumber - 1) * commonDifference);

console.log(finalComputedValue);