const obtainRawContents = () => require('node:fs').readFileSync(0, 'utf8');

const processRawData = (sourceText) => {
    const lines = sourceText.trim().split('\n');
    const sequenceCount = Number(lines[0]);
    if (isNaN(sequenceCount) || lines.length !== sequenceCount + 1) {
        throw new Error("Corrupted input structure detected.");
    }
    return lines.slice(1);
};

const determineBalanceMetrics = (charSequence) => {
    const initialData = { currentLevel: 0, deepestDescent: 0 };
    const processedData = Array.from(charSequence).reduce((accumulator, charElement) => {
        const subsequentLevel = accumulator.currentLevel + (charElement === '(' ? 1 : -1);
        return {
            currentLevel: subsequentLevel,
            deepestDescent: Math.min(accumulator.deepestDescent, subsequentLevel)
        };
    }, initialData);
    return {
        minimalPathValue: processedData.deepestDescent,
        terminalPathValue: processedData.currentLevel
    };
};

const performValidityCheck = (collectionOfSequences) => {
    const analyzedFragments = collectionOfSequences.map(determineBalanceMetrics);

    const totalTerminalValue = analyzedFragments.reduce((sum, fragment) => sum + fragment.terminalPathValue, 0);
    if (totalTerminalValue !== 0) {
        return "NotPossible";
    }

    const fragmentsWithPositiveTerminal = analyzedFragments.filter(f => f.terminalPathValue > 0);
    const fragmentsWithNonPositiveTerminal = analyzedFragments.filter(f => f.terminalPathValue <= 0);

    let currentAvailablePositiveCredit = fragmentsWithPositiveTerminal.reduce((sum, f) => sum + f.terminalPathValue, 0);

    fragmentsWithNonPositiveTerminal.sort((a, b) => a.minimalPathValue - b.minimalPathValue);

    for (const fragment of fragmentsWithNonPositiveTerminal) {
        if (fragment.minimalPathValue < -currentAvailablePositiveCredit) {
            return "NotPossible";
        }
        currentAvailablePositiveCredit += fragment.terminalPathValue;
    }

    return "Permissible";
};

const initiateProcess = () => {
    try {
        const rawContent = obtainRawContents();
        const inputFragments = processRawData(rawContent);
        return performValidityCheck(inputFragments);
    } catch (err) {
        return "ExecutionFailure: " + err.message;
    }
};

console.log(initiateProcess());