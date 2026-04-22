const acquireContent = () => {
    const dataBuffer = process.stdin.readFileSync(0, 'utf8');
    return dataBuffer.trim();
};

const purifyContent = (sourceText) => {
    let currentPosition = 0;
    let accumulatedChars = [];
    const sourceLength = sourceText.length;

    while (currentPosition < sourceLength) {
        if (sourceText.substring(currentPosition, currentPosition + 2) === 'gg') {
            currentPosition += 2;
        } else if (sourceText.substring(currentPosition, currentPosition + 6) === 'hicken') {
            currentPosition += 6;
        } else {
            accumulatedChars.push(sourceText[currentPosition]);
            currentPosition++;
        }
    }
    return accumulatedChars.join('');
};

const reformatContent = (incomingText) => {
    let hasChanged = false;
    let outputChars = [];
    let currentIdx = 0;

    while (currentIdx < incomingText.length) {
        if (incomingText.substring(currentIdx, currentIdx + 2) === 'ee') {
            outputChars.push('e', 'X', 'e');
            currentIdx += 2;
            hasChanged = true;
        } else if (incomingText.substring(currentIdx, currentIdx + 2) === 'cc') {
            outputChars.push('c', 'X', 'c');
            currentIdx += 2;
            hasChanged = true;
        } else {
            outputChars.push(incomingText[currentIdx]);
            currentIdx++;
        }
    }
    let interimString = outputChars.join('');
    if (hasChanged) {
        return reformatContent(interimString);
    } else {
        return interimString;
    }
};

const analyzeSegments = (processedData) => {
    let maxSegmentLength = 0;
    let finalCharOfMaxSegment = '';
    let currentSegmentAccumulator = 0;
    let lastCharOfCurrentSegment = '';

    for (let charIndex = 0; charIndex < processedData.length; charIndex++) {
        const currentChar = processedData[charIndex];
        if (currentChar === 'X') {
            if (currentSegmentAccumulator > maxSegmentLength) {
                maxSegmentLength = currentSegmentAccumulator;
                finalCharOfMaxSegment = lastCharOfCurrentSegment;
            }
            currentSegmentAccumulator = 0;
            lastCharOfCurrentSegment = '';
        } else {
            currentSegmentAccumulator++;
            lastCharOfCurrentSegment = currentChar;
        }
    }

    if (currentSegmentAccumulator > maxSegmentLength) {
        finalCharOfMaxSegment = lastCharOfCurrentSegment;
    }
    return finalCharOfMaxSegment;
};

const initialContent = acquireContent();
const sanitizedContent = purifyContent(initialContent);
const modifiedContent = reformatContent(sanitizedContent);
const ultimateCharacter = analyzeSegments(modifiedContent);

if (ultimateCharacter === 'e') {
    process.stdout.write("egg");
} else {
    process.stdout.write("chicken");
}