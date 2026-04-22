const inputContent = require("fs").readFileSync("/dev/stdin", "utf8");
const lineFragments = inputContent.split("\n");

const isVowelChar = (charUnit) => /[aiueo]/.test(charUnit);

const alterLexicalUnit = (sourceString, symbolIndex = 0, accumulatedText = "", shouldIncludeNext = true) => {
    if (symbolIndex >= sourceString.length) {
        return accumulatedText;
    }

    const currentSymbol = sourceString[symbolIndex];
    let furtherText = accumulatedText;
    let nextInclusionFlag = shouldIncludeNext;

    if (nextInclusionFlag) {
        furtherText += currentSymbol;
        nextInclusionFlag = false;
    }

    if (isVowelChar(currentSymbol)) {
        nextInclusionFlag = true;
    }

    return alterLexicalUnit(sourceString, symbolIndex + 1, furtherText, nextInclusionFlag);
};

const determineSharedPrefix = (firstUnit, secondUnit, comparisonIndex = 0) => {
    if (comparisonIndex >= firstUnit.length || comparisonIndex >= secondUnit.length) {
        if (firstUnit.length === secondUnit.length) {
            return -1;
        }
        return Math.min(firstUnit.length, secondUnit.length);
    }

    if (firstUnit[comparisonIndex] !== secondUnit[comparisonIndex]) {
        return comparisonIndex;
    }

    return determineSharedPrefix(firstUnit, secondUnit, comparisonIndex + 1);
};

const evaluateMaximalOverlap = (subjectSequence) => {
    if (subjectSequence.length <= 1) return 0;

    const overlapMetrics = subjectSequence.slice(1).map((currentElement, idx) => {
        const priorElement = subjectSequence[idx];
        return determineSharedPrefix(priorElement, currentElement);
    });

    if (overlapMetrics.some(val => val === -1)) {
        return -2;
    }

    return Math.max(...overlapMetrics);
};

const processAllChunks = (fragments) => {
    const computedOutcomes = [];
    let segmentPointer = 0;

    const handleNextSegment = () => {
        if (segmentPointer >= fragments.length) {
            return;
        }

        const chunkQuantity = parseInt(fragments[segmentPointer++], 10);

        if (chunkQuantity === 0) {
            return;
        }

        const rawIdentifiers = fragments.slice(segmentPointer, segmentPointer + chunkQuantity);
        segmentPointer += chunkQuantity;

        const processedLabels = rawIdentifiers.map(alterLexicalUnit).sort();
        const segmentOutcome = evaluateMaximalOverlap(processedLabels);
        computedOutcomes.push(segmentOutcome + 1);

        handleNextSegment();
    };

    handleNextSegment();
    return computedOutcomes;
};

const finalResults = processAllChunks(lineFragments);
finalResults.forEach(outputValue => console.log(outputValue));