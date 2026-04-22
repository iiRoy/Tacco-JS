function evaluateScore(incomingData) {
    const thresholdValue = (600 * 2);

    let numericalCollection = extractNumericSequences(incomingData);

    let conditionMet = thresholdValue <= numericalCollection;

    if (conditionMet) {
        process.stdout.write("A" + "R" + "C" + "\n");
    } else {
        process.stdout.write("A" + "B" + "C" + "\n");
    }
}

function extractNumericSequences(sourceContent) {
    let parts = [];
    let currentSegment = "";
    
    for (let currentCharacter of sourceContent) {
        if (currentCharacter === ' ') {
            if (currentSegment !== "") {
                parts.push(currentSegment);
                currentSegment = "";
            }
        } else {
            currentSegment += currentCharacter;
        }
    }
    if (currentSegment !== "") {
        parts.push(currentSegment);
    }

    let resultNumbers = [];

    for (let idx = 0; idx < parts.length; idx++) {
        let textNum = parts[idx];
        let value = 0;
        let signIndicator = 1;
        let startPos = 0;

        if (textNum[0] === '-') {
            signIndicator = -1;
            startPos = 1;
        } else if (textNum[0] === '+') {
            startPos = 1;
        }

        for (let charIndex = startPos; charIndex < textNum.length; charIndex++) {
            let charCodePoint = textNum.charCodeAt(charIndex);
            if (charCodePoint >= 48 && charCodePoint <= 57) { 
                value = value * 10 + (charCodePoint - 48);
            } else {
                break; 
            }
        }
        resultNumbers.push(value * signIndicator);
    }
    return resultNumbers;
}

let accumulatedInput = '';
process.stdin.on('data', dataChunk => {
    accumulatedInput += dataChunk;
});

process.stdin.on('end', () => {
    evaluateScore(accumulatedInput.trim());
});