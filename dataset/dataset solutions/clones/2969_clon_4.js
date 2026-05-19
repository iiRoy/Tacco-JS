const createInputReader = (sourceText) => {
    const lineStates = sourceText.trim().split('\n').map(l => ({ original: l, words: null }));
    let currentLineIndex = 0;

    const retrieveValue = (asString) => {
        if (currentLineIndex >= lineStates.length) {
            throw new Error("Input exhausted for single value.");
        }

        const currentLineState = lineStates[currentLineIndex];
        if (!currentLineState.words) {
            currentLineState.words = currentLineState.original.split(' ').reverse();
        }

        if (currentLineState.words.length === 0) {
            currentLineIndex++;
            return retrieveValue(asString);
        }

        const val = currentLineState.words.pop();
        if (currentLineState.words.length === 0) {
            currentLineIndex++;
        }
        return asString ? val : Number(val);
    };

    const fetchLine = (asStrings) => {
        if (currentLineIndex >= lineStates.length) {
            throw new Error("Input exhausted for line.");
        }
        const currentLineState = lineStates[currentLineIndex++];
        const tokens = currentLineState.original.split(' ');
        return asStrings ? tokens : tokens.map(Number);
    };

    const fetchLines = (count, asStrings) => {
        if (currentLineIndex + count > lineStates.length) {
            throw new Error("Input exhausted for multiple lines.");
        }
        const result = [];
        for (let i = 0; i < count; i++) {
            const currentLineState = lineStates[currentLineIndex++];
            const tokens = currentLineState.original.split(' ');
            result.push(asStrings ? tokens : tokens.map(Number));
        }
        return result;
    };

    const fetchRawLines = (count, asStrings) => {
        if (currentLineIndex + count > lineStates.length) {
            throw new Error("Input exhausted for raw lines.");
        }
        const result = [];
        for (let i = 0; i < count; i++) {
            const currentLineState = lineStates[currentLineIndex++];
            const rawLine = currentLineState.original;
            result.push(asStrings ? rawLine : Number(rawLine));
        }
        return result;
    };

    return {
        retrieveValue,
        fetchLine,
        fetchLines,
        fetchRawLines
    };
};

const inputSource = createInputReader(require("fs").readFileSync("/dev/stdin", "utf8"));

const constructMultiDimensionalArray = (initialValue, ...dimensions) => {
    const buildDimension = (currentDimIndex) => {
        if (currentDimIndex === dimensions.length) {
            return initialValue;
        }
        const currentSize = dimensions[currentDimIndex];
        return Array.from({ length: currentSize }, () => buildDimension(currentDimIndex + 1));
    };
    return buildDimension(0);
};

const produceZeroSequence = (dimensionValue) => {
    const sequenceLength = 1 << (dimensionValue + 1);
    return Array.from({ length: sequenceLength }, (_, index) => Math.floor(index / 2)).join(" ");
};

const processSequence = () => {
    const dimensionCount = inputSource.retrieveValue();
    const skipValue = inputSource.retrieveValue();

    if (skipValue >= (1 << dimensionCount)) return -1;
    if (skipValue && dimensionCount === 1) return -1;
    if (skipValue === 0) return produceZeroSequence(dimensionCount);

    const totalElements = 1 << dimensionCount;

    const firstSegment = Array.from({ length: totalElements - 1 }, (_, index) => {
        return index < skipValue ? index : index + 1;
    });

    const secondSegment = Array.from({ length: totalElements - 1 }, (_, index) => {
        let current = totalElements - 1 - index;
        if (current === skipValue) current--;
        return current;
    });

    return firstSegment.concat(skipValue, secondSegment, skipValue).join(" ");
};

console.log(processSequence());
