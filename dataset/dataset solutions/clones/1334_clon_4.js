const obtainAllInput = () => new Promise(resolve => {
    let fullInputPayload = '';
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', incomingBlock => {
        fullInputPayload += incomingBlock;
    });
    process.stdin.on('end', () => {
        resolve(fullInputPayload);
    });
});

const stripWhitespace = (text) => {
    let start = 0;
    let end = text.length - 1;
    while (start <= end && (text[start] === ' ' || text[start] === '\n' || text[start] === '\r' || text[start] === '\t')) {
        start++;
    }
    while (end >= start && (text[end] === ' ' || text[end] === '\n' || text[end] === '\r' || text[end] === '\t')) {
        end--;
    }
    if (start > end) return '';
    let result = '';
    for (let i = start; i <= end; i++) {
        result += text[i];
    }
    return result;
};

const segmentIntoLines = (text) => {
    const lines = [];
    let currentLine = '';
    for (let i = 0; i < text.length; i++) {
        if (text[i] === '\n') {
            lines.push(currentLine);
            currentLine = '';
        } else {
            currentLine += text[i];
        }
    }
    lines.push(currentLine);
    return lines;
};

const segmentIntoWords = (text) => {
    const words = [];
    let currentWord = '';
    for (let i = 0; i < text.length; i++) {
        if (text[i] === ' ' || text[i] === '\n' || text[i] === '\r' || text[i] === '\t') {
            if (currentWord.length > 0) {
                words.push(currentWord);
                currentWord = '';
            }
        } else {
            currentWord += text[i];
        }
    }
    if (currentWord.length > 0) {
        words.push(currentWord);
    }
    return words;
};

const convertToInteger = (text) => {
    let num = 0;
    let sign = 1;
    let index = 0;
    
    let trimmed = stripWhitespace(text);
    if (trimmed.length === 0) return NaN;

    if (trimmed[0] === '-') {
        sign = -1;
        index = 1;
    } else if (trimmed[0] === '+') {
        index = 1;
    }

    let hasDigits = false;
    for (let i = index; i < trimmed.length; i++) {
        const charCode = trimmed.charCodeAt(i);
        if (charCode >= 48 && charCode <= 57) { // '0' to '9'
            num = num * 10 + (charCode - 48);
            hasDigits = true;
        } else {
            break;
        }
    }
    return hasDigits ? num * sign : NaN;
};

const displayOutput = (message) => {
    process.stdout.write(message + '\n');
};

const extractPart = (sourceText, beginningIndex, endingIndex) => {
    let resultFragment = '';
    for (let i = beginningIndex; i <= endingIndex; i++) {
        if (i >= 0 && i < sourceText.length) {
            resultFragment += sourceText[i];
        }
    }
    return resultFragment;
};

const flipSegment = (sourceText, beginningIndex, endingIndex) => {
    let preSection = '';
    for (let i = 0; i < beginningIndex; i++) {
        preSection += sourceText[i];
    }

    let segmentToInvert = '';
    for (let i = beginningIndex; i <= endingIndex; i++) {
        if (i >= 0 && i < sourceText.length) {
            segmentToInvert += sourceText[i];
        }
    }

    let invertedSegment = '';
    for (let i = segmentToInvert.length - 1; i >= 0; i--) {
        invertedSegment += segmentToInvert[i];
    }

    let postSection = '';
    for (let i = endingIndex + 1; i < sourceText.length; i++) {
        postSection += sourceText[i];
    }

    return preSection + invertedSegment + postSection;
};

const insertSection = (sourceText, beginningIndex, endingIndex, newPiece) => {
    let preSection = '';
    for (let i = 0; i < beginningIndex; i++) {
        preSection += sourceText[i];
    }

    let postSection = '';
    for (let i = endingIndex + 1; i < sourceText.length; i++) {
        postSection += sourceText[i];
    }

    return preSection + newPiece + postSection;
};

const operationManifest = {
    'print': (currentText, p1, p2) => {
        displayOutput(extractPart(currentText, p1, p2));
        return currentText;
    },
    'reverse': (currentText, p1, p2) => flipSegment(currentText, p1, p2),
    'replace': (currentText, p1, p2, p3) => insertSection(currentText, p1, p2, p3)
};

obtainAllInput().then(fullInputContent => {
    const cleansedInput = stripWhitespace(fullInputContent);
    const inputLines = segmentIntoLines(cleansedInput);

    let workingString = inputLines[0];
    const instructionUnits = inputLines.slice(2);

    const parsedOperations = [];
    for (const unit of instructionUnits) {
        const components = segmentIntoWords(unit);
        if (components.length === 0) continue; // Skip empty lines

        const actionKey = components[0];
        const parameters = components.slice(1);

        if (actionKey === 'print' || actionKey === 'reverse') {
            parsedOperations.push([actionKey, convertToInteger(parameters[0]), convertToInteger(parameters[1])]);
        } else if (actionKey === 'replace') {
            parsedOperations.push([actionKey, convertToInteger(parameters[0]), convertToInteger(parameters[1]), parameters[2]]);
        }
    }

    for (const operationData of parsedOperations) {
        const [key, ...params] = operationData;
        if (operationManifest[key]) {
            workingString = operationManifest[key](workingString, ...params);
        }
    }
});