const fileSystem = require('fs');
const rawInput = fileSystem.readFileSync(process.stdin.fd, 'utf8');
const processedLines = rawInput.trim().split("\n");

const irrelevantNumber = Number(processedLines.shift());
const [initialTerm, progressionDiff] = processedLines.shift().split(" ").map(Number);

const totalOperations = Number(processedLines.shift());
const operationRecords = [];
for (let iter = 0; iter < totalOperations; ++iter) {
    operationRecords.push(processedLines.shift().split(" "));
}

const identifierRepresentations = operationRecords.reduce((currentMapping, currentAction) => {
    const [actionType, primaryId, secondaryId] = currentAction;

    if (!currentMapping.has(primaryId)) {
        currentMapping.set(primaryId, primaryId);
    }
    if (!currentMapping.has(secondaryId)) {
        currentMapping.set(secondaryId, secondaryId);
    }

    const primaryMappedValue = currentMapping.get(primaryId);
    const secondaryMappedValue = currentMapping.get(secondaryId);

    if (actionType === "0") {
        currentMapping.set(primaryId, secondaryMappedValue);
        currentMapping.set(secondaryId, primaryMappedValue);
    } else {
        currentMapping.set(primaryId, secondaryMappedValue);
    }
    return currentMapping;
}, new Map());

let queryTarget = String(Number(processedLines.shift()));

let effectiveTarget;
if (identifierRepresentations.has(queryTarget)) {
    effectiveTarget = identifierRepresentations.get(queryTarget);
} else {
    effectiveTarget = queryTarget;
}

const finalNumericIndex = Number(effectiveTarget);

const computedResult = initialTerm + ((finalNumericIndex - 1) * progressionDiff);

process.stdout.write(String(computedResult) + '\n');