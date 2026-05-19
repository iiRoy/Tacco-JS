const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
const parsedLines = rawData.trim().split('\n');

const COLOR_SET = ['r', 'g', 'b'];

const deriveNextPatterns = (currentIdentifier) => {
    const patternChars = Array.from(currentIdentifier);
    const nextPatternIdentifiers = [];

    for (let i = 0; i < patternChars.length - 1; i++) {
        const charA = patternChars[i];
        const charB = patternChars[i + 1];

        if (charA === charB) {
            continue;
        }

        const replacementColor = COLOR_SET.find(c => c !== charA && c !== charB);

        const modifiedPatternChars = [
            ...patternChars.slice(0, i),
            replacementColor, replacementColor,
            ...patternChars.slice(i + 2)
        ];
        nextPatternIdentifiers.push(modifiedPatternChars.join(''));
    }
    return nextPatternIdentifiers;
};

const findTerminalState = (initialPattern) => {
    const visitedLevels = new Map();
    const pendingPatterns = [];

    visitedLevels.set(initialPattern, 0);
    pendingPatterns.push(initialPattern);

    while (pendingPatterns.length > 0) {
        const currentPattern = pendingPatterns.shift();
        const currentLevel = visitedLevels.get(currentPattern);

        const successorPatterns = deriveNextPatterns(currentPattern);

        if (successorPatterns.length === 0) {
            return { identifier: currentPattern, level: currentLevel };
        }

        for (const nextPattern of successorPatterns) {
            if (!visitedLevels.has(nextPattern)) {
                visitedLevels.set(nextPattern, currentLevel + 1);
                pendingPatterns.push(nextPattern);
            }
        }
    }

    return undefined;
};

const displayExploredStates = (stateMap) => {
    // This function is never called in the original logic,
    // so its implementation is a placeholder to mirror the unused method.
    if (stateMap instanceof Map) {
        for (const [key, value] of stateMap.entries()) {
            // console.log(`Pattern: ${key}, Level: ${value}`); // Example of what it *could* do
        }
    }
};

parsedLines.forEach(inputPattern => {
    if (inputPattern === '0') {
        return;
    }

    const finalState = findTerminalState(inputPattern);

    console.log(finalState ? finalState.level : 'NA');
});
