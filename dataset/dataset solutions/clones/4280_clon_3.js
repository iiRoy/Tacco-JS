let inputDataLines = [];

const ioHandler = require('readline');

const interfaceInstance = ioHandler.createInterface({
    input: process.stdin,
    output: process.stdout
});

interfaceInstance.on('line', (currentLineContent) => {
    inputDataLines.push(currentLineContent);
});

interfaceInstance.on('close', () => {
    const outputMessage = (messageContent) => {
        console.log(messageContent);
    };

    if (inputDataLines.length < 2) {
        outputMessage("INVALID INPUT: Expected at least two lines for source and pattern.");
        return;
    }

    const sourceStringChars = inputDataLines[0].split('');
    const targetPatternChars = inputDataLines[1].split('');

    const sourceLength = sourceStringChars.length;
    const patternLength = targetPatternChars.length;

    let foundStartIndex = -1;

    if (patternLength > sourceLength) {
        outputMessage("UNRESTORABLE");
        return;
    }

    for (let outerLoopIndex = sourceLength - 1; outerLoopIndex >= patternLength - 1; outerLoopIndex--) {
        const currentMatchStart = outerLoopIndex - patternLength + 1;
        
        const currentSubstringCandidate = sourceStringChars.slice(currentMatchStart, outerLoopIndex + 1);

        let isCurrentCandidateAMatch = true;

        for (let innerLoopIndex = 0; innerLoopIndex < patternLength; innerLoopIndex++) {
            const patternChar = targetPatternChars[innerLoopIndex];
            const candidateChar = currentSubstringCandidate[innerLoopIndex];

            if (patternChar !== candidateChar && candidateChar !== '?') {
                isCurrentCandidateAMatch = false;
                break;
            }
        }

        if (isCurrentCandidateAMatch) {
            foundStartIndex = currentMatchStart;
            break;
        }
    }

    if (foundStartIndex === -1) {
        outputMessage("UNRESTORABLE");
    } else {
        let restoredCharacters = [];

        for (let charIndex = 0; charIndex < sourceLength; charIndex++) {
            if (charIndex >= foundStartIndex && charIndex < foundStartIndex + patternLength) {
                restoredCharacters.push(targetPatternChars[charIndex - foundStartIndex]);
            } else {
                if (sourceStringChars[charIndex] === '?') {
                    restoredCharacters.push('a');
                } else {
                    restoredCharacters.push(sourceStringChars[charIndex]);
                }
            }
        }
        outputMessage(restoredCharacters.join(''));
    }
});