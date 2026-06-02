function createInputProcessor(sourceText) {
    const tokenList = sourceText.match(/\S+/g) || [];
    let currentTokenIndex = 0;

    const retrieveNextToken = () => {
        if (currentTokenIndex < tokenList.length) {
            return tokenList[currentTokenIndex++];
        }
        return null;
    };

    const retrieveNextInteger = () => {
        const tokenValue = retrieveNextToken();
        return tokenValue !== null ? parseInt(tokenValue, 10) : null;
    };

    const retrieveNextDecimal = () => {
        const tokenValue = retrieveNextToken();
        return tokenValue !== null ? parseFloat(tokenValue) : null;
    };
    
    const retrieveNextByte = () => {
        const tokenValue = retrieveNextToken();
        return tokenValue !== null ? new Int8Array(tokenValue.length) : null;
    };

    return {
        getNextToken: retrieveNextToken,
        getNextInt: retrieveNextInteger,
        getNextDecimal: retrieveNextDecimal,
        getNextByte: retrieveNextByte,
    };
}

function* sequenceGenerator(currentSequence, lastElementValue, elementsRemaining, maximumValue) {
    if (elementsRemaining === 0) {
        yield currentSequence;
        return;
    }

    for (let nextElementValue = lastElementValue; nextElementValue <= maximumValue; nextElementValue++) {
        yield* sequenceGenerator([...currentSequence, nextElementValue], nextElementValue, elementsRemaining - 1, maximumValue);
    }
}

function processChallenge(inputReader) {
    const seqLength = inputReader.getNextInt();
    const maxValue = inputReader.getNextInt();
    const queryCount = inputReader.getNextInt();
    
    const scoreRules = [];
    for (let i = 0; i < queryCount; i++) {
        scoreRules.push({
            startIdx: inputReader.getNextInt(),
            endIdx: inputReader.getNextInt(),
            diffVal: inputReader.getNextInt(),
            scoreVal: inputReader.getNextInt(),
        });
    }
    
    let overallMaxScore = 0;
    
    for (let firstElement = 1; firstElement <= maxValue; firstElement++) {
        for (const currentSequence of sequenceGenerator([firstElement], firstElement, seqLength - 1, maxValue)) {
            let currentSequenceScore = 0;
            for (const rule of scoreRules) {
                const valA = currentSequence[rule.startIdx - 1];
                const valB = currentSequence[rule.endIdx - 1];
                if (rule.diffVal === (valB - valA)) {
                    currentSequenceScore += rule.scoreVal;
                }
            }
            if (currentSequenceScore > overallMaxScore) {
                overallMaxScore = currentSequenceScore;
            }
        }
    }
    
    console.log(overallMaxScore);
}

processChallenge(createInputProcessor(require("fs").readFileSync("/dev/stdin", "utf8")));
