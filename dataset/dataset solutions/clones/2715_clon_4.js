const acquireData = (inputContent) => {
    let currentInputLines = inputContent.trim().split('\n');
    let lineCursor = 0;

    const fetchNextToken = (asString = false) => {
        if (lineCursor >= currentInputLines.length) return undefined;

        let currentLine = currentInputLines[lineCursor];
        let tokens = currentLine.split(' ').filter(t => t !== '');

        if (tokens.length === 0) {
            lineCursor++;
            return fetchNextToken(asString);
        }

        const value = tokens[0];
        currentInputLines[lineCursor] = tokens.slice(1).join(' ');

        if (tokens.length === 1) {
            lineCursor++;
        }
        return asString ? value : parseInt(value, 10);
    };

    const fetchNextLineTokens = (asStrings = false) => {
        if (lineCursor >= currentInputLines.length) return undefined;
        const lineContent = currentInputLines[lineCursor++];
        const tokens = lineContent.split(' ').filter(t => t !== '');
        return asStrings ? tokens : tokens.map(Number);
    };

    const fetchMatrix = (count, asStrings = false) => {
        const rows = [];
        for (let k = 0; k < count; k++) {
            rows.push(fetchNextLineTokens(asStrings));
        }
        return rows;
    };

    const fetchRows = (count, asStrings = false) => {
        const lines = [];
        for (let k = 0; k < count; k++) {
            if (lineCursor >= currentInputLines.length) break;
            const lineContent = currentInputLines[lineCursor++];
            lines.push(asStrings ? lineContent : parseInt(lineContent, 10));
        }
        return lines;
    };

    return {
        getToken: fetchNextToken,
        getLine: fetchNextLineTokens,
        getMatrix: fetchMatrix,
        getRows: fetchRows
    };
};

const dataProcessor = acquireData(require("fs").readFileSync("/dev/stdin","utf8"));

const extractDivisors = (value) => {
    return Array.from({ length: value / 2 }, (_, i) => i + 1)
                .filter(num => value % num === 0)
                .sort((a, b) => a - b);
};

const determinePatternRepetition = (inputString) => {
    const stringLength = inputString.length;
    if (stringLength === 0) return 1;
    if (stringLength === 1) return 1;

    const factors = extractDivisors(stringLength);

    for (const factor of factors) {
        const basePattern = inputString.substring(0, factor);
        const repeatCount = stringLength / factor;
        const reconstructedString = Array(repeatCount).fill(basePattern).join('');
        if (reconstructedString === inputString) {
            return repeatCount;
        }
    }
    return 1;
};

const findAllOccurrences = (text, pattern) => {
    const indices = [];
    if (pattern.length === 0) return Array.from({ length: text.length + 1 }, (_, i) => i);
    let offset = 0;
    while (true) {
        const index = text.indexOf(pattern, offset);
        if (index === -1) break;
        indices.push(index);
        offset = index + 1;
    }
    return indices;
};

const solveCircularStringRepetition = () => {
    let sourceText = dataProcessor.getToken(true);
    let targetPattern = dataProcessor.getToken(true);

    const patternRepetitionFactor = determinePatternRepetition(targetPattern);
    if (patternRepetitionFactor > 1) {
        targetPattern = targetPattern.substring(0, targetPattern.length / patternRepetitionFactor);
    }

    const basePatternLength = targetPattern.length;
    const sourceTextLength = sourceText.length;

    const isSourceComposedOfPattern = (sourceTextLength % basePatternLength === 0) &&
                                     (targetPattern.repeat(sourceTextLength / basePatternLength) === sourceText);
    if (isSourceComposedOfPattern) {
        return -1;
    }

    const doubledSource = sourceText + sourceText;
    const allOccurrences = findAllOccurrences(doubledSource, targetPattern);

    if (allOccurrences.length === 0) {
        return 0;
    }

    const { maxStreak } = allOccurrences.reduce((acc, currentIdx, i, arr) => {
        if (i === 0) {
            acc.currentStreak = 1;
        } else {
            const previousIdx = arr[i - 1];
            if (currentIdx === previousIdx + basePatternLength) {
                acc.currentStreak++;
            } else {
                acc.currentStreak = 1;
            }
        }
        acc.maxStreak = Math.max(acc.maxStreak, acc.currentStreak);
        return acc;
    }, { maxStreak: 0, currentStreak: 0 });

    return Math.floor(maxStreak / patternRepetitionFactor);
};

console.log(solveCircularStringRepetition());