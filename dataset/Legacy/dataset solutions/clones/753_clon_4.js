const inputLines = require('node:fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');

function* lineIteratorGenerator(lines) {
    let currentLineIndex = 0;
    while (currentLineIndex < lines.length) {
        yield lines[currentLineIndex++];
    }
}

const lineStream = lineIteratorGenerator(inputLines);

const initialValuePlaceholder = Number(lineStream.next().value);

const [firstTerm, commonDifference] = lineStream.next().value.split(' ').map(Number);

const aliasRegistry = new Map();

const ensureAndRetrieveAlias = (registryMap, keyIdentifier) => {
    if (!registryMap.has(keyIdentifier)) {
        registryMap.set(keyIdentifier, keyIdentifier);
    }
    return registryMap.get(keyIdentifier);
};

const operationCount = Number(lineStream.next().value);

const operationInstructions = Array.from({ length: operationCount }, () => lineStream.next().value);

operationInstructions.forEach(instructionLine => {
    const [operationCode, primaryIdentifier, secondaryIdentifier] = instructionLine.split(' ');

    const currentPrimaryAlias = ensureAndRetrieveAlias(aliasRegistry, primaryIdentifier);
    const currentSecondaryAlias = ensureAndRetrieveAlias(aliasRegistry, secondaryIdentifier);

    if (operationCode === '0') {
        aliasRegistry.set(primaryIdentifier, currentSecondaryAlias);
        aliasRegistry.set(secondaryIdentifier, currentPrimaryAlias);
    } else {
        aliasRegistry.set(primaryIdentifier, currentSecondaryAlias);
    }
});

let targetIndex = Number(lineStream.next().value);

const targetIndexString = String(targetIndex);
if (aliasRegistry.has(targetIndexString)) {
    targetIndex = Number(aliasRegistry.get(targetIndexString));
}

console.log(firstTerm + ((targetIndex - 1) * commonDifference));
