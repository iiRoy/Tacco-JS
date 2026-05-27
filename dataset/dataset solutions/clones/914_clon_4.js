const processIdentifier = (sourceIdentifier) => {
    const vowelSet = new Set(['a', 'i', 'u', 'e', 'o']);
    const { finalForm } = Array.from(sourceIdentifier).reduce((accumulator, currentSymbol) => {
        if (accumulator.appendCurrent) {
            accumulator.finalForm += currentSymbol;
            accumulator.appendCurrent = false;
        }
        if (vowelSet.has(currentSymbol)) {
            accumulator.appendCurrent = true;
        }
        return accumulator;
    }, { finalForm: '', appendCurrent: true });
    return finalForm;
};

const findCommonPrefixLength = (firstTerm, secondTerm) => {
    const commonSpan = Math.min(firstTerm.length, secondTerm.length);
    const divergencePoint = Array.from({ length: commonSpan }, (_, k) => k)
        .find(pos => firstTerm[pos] !== secondTerm[pos]);

    if (divergencePoint !== undefined) {
        return divergencePoint;
    } else {
        if (firstTerm.length === secondTerm.length) {
            return -1;
        } else {
            return commonSpan;
        }
    }
};

const determineMaxCommonality = (processedIdentifiers) => {
    if (processedIdentifiers.length <= 1) {
        return 0;
    }

    const adjacentPairs = processedIdentifiers.slice(1).map((identifier, idx) => [processedIdentifiers[idx], identifier]);

    const prefixResults = adjacentPairs.map(([prevIdentifier, currentIdentifier]) =>
        findCommonPrefixLength(prevIdentifier, currentIdentifier)
    );

    if (prefixResults.some(val => val === -1)) {
        return -2;
    }

    return Math.max(0, ...prefixResults);
};

function* generateInputSets(allLines) {
    let currentLineIndex = 0;
    while (currentLineIndex < allLines.length) {
        const entryCount = +allLines[currentLineIndex++];
        if (entryCount === 0) break;

        const currentSetOfNames = [];
        for (let k = 0; k < entryCount; k++) {
            currentSetOfNames.push(allLines[currentLineIndex++]);
        }
        yield currentSetOfNames;
    }
}

const rawLines = require("fs").readFileSync("/dev/stdin", "utf8").split("\n");

for (const originalNames of generateInputSets(rawLines)) {
    const processedIdentifiers = originalNames
        .map(processIdentifier)
        .sort();

    const maxCommonality = determineMaxCommonality(processedIdentifiers);

    console.log(maxCommonality + 1);
}
