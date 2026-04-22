const inputFacility = (rawText) => {
    let lineRegistry = rawText.trim().split('\n');
    let currentLinePointer = 0;
    let currentLineTokensCache = [];
    let currentTokenPointer = 0;

    const ensureTokensLoaded = () => {
        if (currentLineTokensCache.length === currentTokenPointer) {
            if (currentLinePointer >= lineRegistry.length) {
                return false;
            }
            currentLineTokensCache = lineRegistry[currentLinePointer].split(' ');
            currentTokenPointer = 0;
        }
        return true;
    };

    const fetchAtom = (stringDesired = false) => {
        if (!ensureTokensLoaded()) {
            throw new Error("End of input reached while fetching atom.");
        }
        const rawValue = currentLineTokensCache[currentTokenPointer++];
        if (currentTokenPointer >= currentLineTokensCache.length) {
            currentLinePointer++;
            currentLineTokensCache = [];
            currentTokenPointer = 0;
        }
        return stringDesired ? rawValue : Number(rawValue);
    };

    const fetchLineContent = (stringsDesired = false) => {
        if (currentLinePointer >= lineRegistry.length) {
            throw new Error("End of input reached while fetching line content.");
        }
        const lineString = lineRegistry[currentLinePointer];
        currentLinePointer++;
        currentLineTokensCache = [];
        currentTokenPointer = 0;

        const tokens = lineString.split(' ');
        return stringsDesired ? tokens : tokens.map(Number);
    };

    const fetchBlockOfLines = (count, stringsDesired = false) => {
        const block = [];
        for (let i = 0; i < count; i++) {
            block.push(fetchLineContent(stringsDesired));
        }
        return block;
    };

    const fetchSequenceOfAtoms = (count, stringsDesired = false) => {
        const sequence = [];
        for (let i = 0; i < count; i++) {
            sequence.push(fetchAtom(stringsDesired));
        }
        return sequence;
    };

    return {
        getAtom: fetchAtom,
        getLine: fetchLineContent,
        getBlock: fetchBlockOfLines,
        getSequence: fetchSequenceOfAtoms
    };
};

const dataHandler = inputFacility(require("node:fs").readFileSync(0, "utf8"));

const processInputAndCompute = () => {
    const numberOfQueries = dataHandler.getAtom();

    const UPPER_BOUND_PRIME = 100000;
    const isCompositeTracker = new Array(UPPER_BOUND_PRIME + 1).fill(false);
    isCompositeTracker[0] = true;
    isCompositeTracker[1] = true;

    for (let candidate = 2; candidate * candidate <= UPPER_BOUND_PRIME; candidate++) {
        if (!isCompositeTracker[candidate]) {
            for (let multiple = candidate * candidate; multiple <= UPPER_BOUND_PRIME; multiple += candidate) {
                isCompositeTracker[multiple] = true;
            }
        }
    }

    const similarPrimeCounts = new Array(UPPER_BOUND_PRIME + 1).fill(0);

    for (let currentNum = 2; currentNum <= UPPER_BOUND_PRIME; currentNum++) {
        similarPrimeCounts[currentNum] = similarPrimeCounts[currentNum - 1];

        if (!isCompositeTracker[currentNum]) {
            const relatedValue = (currentNum + 1) / 2;

            if (Number.isInteger(relatedValue) && relatedValue >= 1 && relatedValue <= UPPER_BOUND_PRIME) {
                if (!isCompositeTracker[relatedValue]) {
                    similarPrimeCounts[currentNum]++;
                }
            }
        }
    }

    const collectedResults = [];

    for (let queryIndex = 0; queryIndex < numberOfQueries; queryIndex++) {
        const queryRange = dataHandler.getLine();
        const rangeStart = queryRange[0];
        const rangeEnd = queryRange[1];

        const countInInterval = similarPrimeCounts[rangeEnd] - similarPrimeCounts[rangeStart - 1];
        collectedResults.push(countInInterval);
    }

    return collectedResults.join('\n');
};

process.stdout.write(processInputAndCompute());