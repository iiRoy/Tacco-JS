const processInput = require('fs').readFileSync('/dev/stdin', 'utf8');
const tokenizedInput = processInput.replace(/,/g, "").trim().split(/\s/);

const initialProcessingState = {
    currentPhraseBuffer: "",
    collectedPhrases: [],
    bufferedDebugOutputs: []
};

const finalProcessingState = tokenizedInput.reduce((accumulator, currentWord) => {
    const { currentPhraseBuffer, collectedPhrases, bufferedDebugOutputs } = accumulator;

    const wordContainsDot = currentWord.includes('.');
    const wordWithoutDots = currentWord.replace(/\./g, "");

    let nextPhraseBuffer = currentPhraseBuffer;
    let nextCollectedPhrases = [...collectedPhrases];
    let nextBufferedDebugOutputs = [...bufferedDebugOutputs];

    if (wordContainsDot) {
        nextBufferedDebugOutputs.push("x[i] : " + currentWord);

        if (wordWithoutDots.length >= 3 && wordWithoutDots.length <= 6) {
            if (currentWord.endsWith('.')) {
                nextPhraseBuffer += wordWithoutDots;
                nextCollectedPhrrases.push(nextPhraseBuffer);
            } else {
                nextPhraseBuffer += currentWord;
            }
        } else {
            nextPhraseBuffer = "";
        }
    } else if (currentWord.length >= 3 && currentWord.length <= 6) {
        nextPhraseBuffer += currentWord + " ";
    }

    return {
        currentPhraseBuffer: nextPhraseBuffer,
        collectedPhrases: nextCollectedPhrases,
        bufferedDebugOutputs: nextBufferedDebugOutputs
    };
}, initialProcessingState);

finalProcessingState.bufferedDebugOutputs.forEach(outputMessage => console.log(outputMessage));

finalProcessingState.collectedPhrases.forEach(phraseItem => console.log(phraseItem));
