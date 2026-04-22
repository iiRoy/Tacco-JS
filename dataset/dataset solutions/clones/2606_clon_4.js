const createSourceReader = (sourceData) => {
    const rawInputLines = sourceData.trim().split('\n');
    let linePointer = 0;
    let currentTokens = []; 
    let tokenPointer = 0;

    const refillTokens = () => {
        if (linePointer >= rawInputLines.length) {
            currentTokens = []; 
            tokenPointer = 0;
            return false;
        }
        // Mimic original `a` method's behavior of reversing and popping
        currentTokens = rawInputLines[linePointer].split(' ').reverse();
        tokenPointer = 0; 
        return true;
    };

    refillTokens(); // Load the first line's tokens initially

    const extractNextItem = (toNumber) => {
        if (tokenPointer >= currentTokens.length) {
            linePointer++; 
            if (!refillTokens()) { 
                throw new Error("Input exhausted: no more items.");
            }
        }
        const item = currentTokens[tokenPointer++];
        return toNumber ? Number(item) : item;
    };

    const extractFullLine = (toNumber) => {
        if (linePointer >= rawInputLines.length) {
            throw new Error("Input exhausted: no more lines.");
        }
        const line = rawInputLines[linePointer];
        linePointer++; 
        // Reset token pointers as this method consumes a full line outside the `extractNextItem` flow
        currentTokens = [];
        tokenPointer = 0;
        const items = line.split(' ');
        return toNumber ? items.map(Number) : items;
    };

    const extractLineBlock = (count, toNumber) => {
        if (linePointer + count > rawInputLines.length) {
            throw new Error("Input exhausted: not enough lines for block.");
        }
        const block = [];
        for (let i = 0; i < count; i++) {
            block.push(extractFullLine(toNumber)); 
        }
        return block;
    };

    const extractRawLineBlock = (count, toNumber) => {
        if (linePointer + count > rawInputLines.length) {
            throw new Error("Input exhausted: not enough lines for raw block.");
        }
        const block = rawInputLines.slice(linePointer, linePointer + count);
        linePointer += count; 
        // Reset token pointers as this method consumes lines outside the `extractNextItem` flow
        currentTokens = [];
        tokenPointer = 0;
        return toNumber ? block.map(Number) : block;
    };

    return {
        one: (asNum) => extractNextItem(asNum),
        line: (asNum) => extractFullLine(asNum),
        matrix: (numRows, asNum) => extractLineBlock(numRows, asNum),
        strings: (numRows, asNum) => extractRawLineBlock(numRows, asNum)
    };
};

const makeFilledMatrix = (initialValue, ...dimensions) => {
    const buildDimension = (dimIndex) => {
        if (dimIndex === dimensions.length - 1) {
            return Array(dimensions[dimIndex]).fill(initialValue);
        } else {
            return Array(dimensions[dimIndex]).fill(null).map(() => buildDimension(dimIndex + 1));
        }
    };
    return buildDimension(0);
};

const inputReader = createSourceReader(require("fs").readFileSync("/dev/stdin", "utf8"));

console.log(performProcess());

function performProcess() {
    const entityCount = inputReader.one(true);
    const rawPrefs = inputReader.matrix(entityCount, true);

    const preferenceLists = new Map();
    for (let i = 0; i < entityCount; i++) {
        preferenceLists.set(i, rawPrefs[i].map(val => val - 1));
    }

    const currentPreferenceIndices = new Map();
    for (let i = 0; i < entityCount; i++) {
        currentPreferenceIndices.set(i, 0);
    }

    let roundCounter = 0;

    const conductRound = (currentActiveParticipants, currentIndices) => {
        if (currentActiveParticipants.size === 0) {
            return; // Base case: no more active participants to process
        }

        roundCounter++;
        const nextActiveParticipants = new Set();
        const processedThisRound = new Set(); 

        Array.from(currentActiveParticipants).forEach(initiator => {
            if (processedThisRound.has(initiator) || currentIndices.get(initiator) === entityCount - 1) {
                return; 
            }

            const initiatorPrefIdx = currentIndices.get(initiator);
            const initiatorPrefs = preferenceLists.get(initiator);
            const target = initiatorPrefs[initiatorPrefIdx];

            const targetPrefIdx = currentIndices.get(target);
            const targetPrefs = preferenceLists.get(target);

            if (targetPrefs[targetPrefIdx] === initiator) {
                currentIndices.set(initiator, initiatorPrefIdx + 1);
                currentIndices.set(target, targetPrefIdx + 1);

                nextActiveParticipants.add(initiator);
                nextActiveParticipants.add(target);
                processedThisRound.add(target); 
            }
        });
        conductRound(nextActiveParticipants, currentIndices);
    };

    let initialActiveParticipants = new Set();
    for (let i = 0; i < entityCount; i++) {
        initialActiveParticipants.add(i);
    }

    conductRound(initialActiveParticipants, currentPreferenceIndices);

    for (let i = 0; i < entityCount; i++) {
        if (currentPreferenceIndices.get(i) !== entityCount - 1) {
            return -1;
        }
    }

    return roundCounter;
}