process.stdin.on("data", function(inputBuffer) {
    const fullInputString = inputBuffer.toString();
    const trimmedInput = fullInputString.trim();

    let lineSegments = [];
    let currentSegmentAccumulator = '';

    for (let i = 0; i < trimmedInput.length; i++) {
        const char = trimmedInput[i];
        if (char === '\n') {
            lineSegments.push(currentSegmentAccumulator);
            currentSegmentAccumulator = '';
        } else {
            currentSegmentAccumulator += char;
        }
    }
    lineSegments.push(currentSegmentAccumulator);

    let secondLineContent;
    if (lineSegments.length > 1) {
        secondLineContent = lineSegments[1];
    } else {
        secondLineContent = undefined;
    }

    let processedTokens;

    if (secondLineContent !== undefined) {
        let currentWordBuilder = '';
        let temporaryTokenList = [];

        for (let i = 0; i < secondLineContent.length; i++) {
            const char = secondLineContent[i];
            if (char === ' ') {
                temporaryTokenList.push(currentWordBuilder);
                currentWordBuilder = '';
            } else {
                currentWordBuilder += char;
            }
        }
        temporaryTokenList.push(currentWordBuilder);
        processedTokens = temporaryTokenList;
    } else {
        processedTokens = undefined;
    }

    processedTokens.sort();

    let finalOutputString = '';
    if (processedTokens !== undefined && processedTokens.length > 0) {
        for (let i = 0; i < processedTokens.length; i++) {
            finalOutputString += processedTokens[i];
            if (i < processedTokens.length - 1) {
                finalOutputString += ' ';
            }
        }
    }

    console.log(finalOutputString);
}).resume();
