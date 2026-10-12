function* lineReader(text) {
    const lines = text.trim().split("\n");
    for (const line of lines) {
        yield line;
    }
}

const processMapping = (currentMappings, operationType, primaryKey, secondaryKey) => {
    const primaryExists = currentMappings.has(primaryKey);
    const secondaryExists = currentMappings.has(secondaryKey);

    const primaryValue = primaryExists ? currentMappings.get(primaryKey) : undefined;
    const secondaryValue = secondaryExists ? currentMappings.get(secondaryKey) : undefined;

    if (operationType === "1") {
        const actionDispatch = {
            "false_false": () => {
                currentMappings.set(primaryKey, secondaryKey);
                currentMappings.set(secondaryKey, primaryKey);
            },
            "true_false": () => {
                currentMappings.set(secondaryKey, primaryValue);
                currentMappings.set(primaryKey, secondaryKey);
            },
            "false_true": () => {
                currentMappings.set(primaryKey, secondaryValue);
                currentMappings.set(secondaryKey, primaryKey);
            },
            "true_true": () => {
                currentMappings.set(primaryKey, secondaryValue);
                currentMappings.set(secondaryKey, primaryValue);
            }
        };
        actionDispatch[`${primaryExists}_${secondaryExists}`]();
    } else {
        currentMappings.set(primaryKey, secondaryExists ? secondaryValue : secondaryKey);
    }
};

const rawInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const inputIterator = lineReader(rawInputContent);

inputIterator.next();

const [initialTerm, commonDifference] = inputIterator.next().value.split(" ").map(Number);
const numberOfOperations = Number(inputIterator.next().value);

const aliasRegistry = new Map();

for (let operationIndex = 0; operationIndex < numberOfOperations; operationIndex++) {
    const [operationKind, firstIdentifier, secondIdentifier] = inputIterator.next().value.split(" ");
    processMapping(aliasRegistry, operationKind, firstIdentifier, secondIdentifier);
}

let finalIdentifier = inputIterator.next().value;

if (aliasRegistry.has(finalIdentifier)) {
    finalIdentifier = aliasRegistry.get(finalIdentifier);
}

const finalNumericValue = Number(finalIdentifier);

console.log(initialTerm + ((finalNumericValue - 1) * commonDifference));
