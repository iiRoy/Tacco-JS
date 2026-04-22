const deriveOperationQuantifier = (initialElements, alterStartElementForFirstMatch, baseQuantity, substitutionMark) => {
    let workingElements = Array.from(initialElements);
    let accumulatedQuantity = baseQuantity;
    let position = 0;
    const limit = workingElements.length - 1;

    while (position < limit) {
        if (workingElements[position] === workingElements[position + 1]) {
            accumulatedQuantity++;
            if (alterStartElementForFirstMatch && position === 0) {
                workingElements[0] = substitutionMark;
            } else {
                workingElements[position + 1] = substitutionMark;
            }
        }
        position++;
    }
    return {
        total: accumulatedQuantity,
        leadingSymbol: workingElements[0],
        trailingSymbol: workingElements[workingElements.length - 1]
    };
};

const processInputData = (inputPayload) => {
    const lines = inputPayload.trim().split("\n");
    const characterSequence = lines[0].split("");
    const repetitionFactor = parseInt(lines[1]);

    if (characterSequence.length === 1) {
        console.log(Math.floor(repetitionFactor / 2));
        return;
    }

    // First pass calculation
    const firstAnalysisOutcome = deriveOperationQuantifier(characterSequence, true, 0, "*");
    const primaryCount = firstAnalysisOutcome.total;
    const initialSymbolAfterAnalysis = firstAnalysisOutcome.leadingSymbol;
    const finalSymbolAfterAnalysis = firstAnalysisOutcome.trailingSymbol;

    // Second pass setup
    let secondarySequence = Array.from(characterSequence);
    let secondaryCountInitial = 0;

    if (initialSymbolAfterAnalysis === finalSymbolAfterAnalysis) {
        secondarySequence[0] = "@";
        secondarySequence[secondarySequence.length - 1] = "@";
        secondaryCountInitial = 2;
    }

    // Second pass calculation
    const secondAnalysisOutcome = deriveOperationQuantifier(secondarySequence, false, secondaryCountInitial, "?");
    const secondaryCount = secondAnalysisOutcome.total;

    let finalResult = 0;
    if (repetitionFactor % 2 === 0) {
        finalResult = (primaryCount + secondaryCount) * (repetitionFactor / 2);
    } else {
        finalResult = (primaryCount * Math.ceil(repetitionFactor / 2)) + (secondaryCount * Math.floor(repetitionFactor / 2));
    }

    console.log(finalResult);
};

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));