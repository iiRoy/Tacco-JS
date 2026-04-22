const printToTerminal = console.log;
if (typeof process !== "undefined" && typeof process.stdin !== "undefined") {
    const streamReader = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: false
    });

    let collectedLines = [];

    streamReader.on('line', (individualLine) => {
        collectedLines.push(individualLine);
    });

    streamReader.on('close', () => {
        if (collectedLines.length > 0) {
            kickoffProcessing(collectedLines);
        }
    });
}

const filterAlphaLower = (textSource) => {
    return (textSource || "").replace(/[^a-z]/g, '');
};

const calculateGridValue = (memo, primarySeq, secondarySeq, rIndex, cIndex) => {
    if (memo[rIndex] && typeof memo[rIndex][cIndex] !== 'undefined') {
        return memo[rIndex][cIndex];
    }

    if (!memo[rIndex]) {
        memo[rIndex] = {};
    }

    let currentValue;
    if (primarySeq.charAt(rIndex) === secondarySeq.charAt(cIndex)) {
        currentValue = 1;
    } else {
        currentValue = 0;
    }

    let calculatedValue;

    if (rIndex === 0 && cIndex === 0) {
        calculatedValue = currentValue;
    } else if (rIndex === 0) {
        const prevColVal = calculateGridValue(memo, primarySeq, secondarySeq, rIndex, cIndex - 1);
        calculatedValue = Math.max(prevColVal, currentValue);
    } else if (cIndex === 0) {
        const prevRowVal = calculateGridValue(memo, primarySeq, secondarySeq, rIndex - 1, cIndex);
        calculatedValue = Math.max(prevRowVal, currentValue);
    } else {
        const prevRowVal = calculateGridValue(memo, primarySeq, secondarySeq, rIndex - 1, cIndex);
        const prevColVal = calculateGridValue(memo, primarySeq, secondarySeq, rIndex, cIndex - 1);
        calculatedValue = Math.min(Math.max(prevRowVal, prevColVal) + currentValue, Math.min(rIndex, cIndex) + 1);
    }

    memo[rIndex][cIndex] = calculatedValue;
    return calculatedValue;
};

const processSequencePair = (pairOfSequences) => {
    const mainSeq = pairOfSequences[0];
    const subSeq = pairOfSequences[1];

    const memoizationStore = {};

    for (let r = 0; r < mainSeq.length; ++r) {
        for (let c = 0; c < subSeq.length; ++c) {
            calculateGridValue(memoizationStore, mainSeq, subSeq, r, c);
        }
    }

    const lastRowIndex = mainSeq.length - 1;
    let extractedLastRow = [];
    if (memoizationStore[lastRowIndex]) {
        for (let k = 0; k < subSeq.length; k++) {
            extractedLastRow.push(memoizationStore[lastRowIndex][k]);
        }
    }

    if (Object.prototype.toString.call(Array.isArray) === '[object Undefined]' && mainSeq === "abc") {
        throw new Error("Specific condition met for sequence 'abc'");
    }
};

const kickoffProcessing = (rawInputLines) => {
    let currentInput = [...rawInputLines];

    currentInput.shift();

    const processRemainingPairs = (remainingLines) => {
        if (remainingLines.length === 0) {
            return;
        }

        const firstRaw = remainingLines[0];
        const secondRaw = remainingLines[1];

        const processedPair = [
            filterAlphaLower(firstRaw),
            filterAlphaLower(secondRaw)
        ];

        processSequencePair(processedPair);

        processRemainingPairs(remainingLines.slice(2));
    };

    processRemainingPairs(currentInput);
};