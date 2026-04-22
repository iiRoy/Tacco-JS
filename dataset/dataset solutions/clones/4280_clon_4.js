const inputReader = require('readline');
let initialSequence = '';
let searchPattern = '';
let inputLineIndex = 0;

const inputInterface = inputReader.createInterface({
    input: process.stdin,
    output: process.stdout,
    crlfDelay: Infinity
});

inputInterface.on('line', (incomingData) => {
    if (inputLineIndex === 0) {
        initialSequence = incomingData;
    } else if (inputLineIndex === 1) {
        searchPattern = incomingData;
    }
    inputLineIndex++;
});

inputInterface.on('close', () => {
    performTransformation(initialSequence, searchPattern);
});

function performTransformation(mainSequence, queryPattern) {
    const mainSymbols = Array.from(mainSequence);
    const querySymbols = Array.from(queryPattern);
    const queryLength = querySymbols.length;
    const mainLength = mainSymbols.length;

    const isSegmentMatch = (startIndex) => {
        if (startIndex < 0 || startIndex + queryLength > mainLength) {
            return false;
        }
        return querySymbols.every((qChar, offset) => {
            const mChar = mainSymbols[startIndex + offset];
            return mChar === qChar || mChar === '?';
        });
    };

    const locateRightmost = (currentIndex) => {
        if (currentIndex < 0) {
            return -1;
        }
        if (isSegmentMatch(currentIndex)) {
            return currentIndex;
        }
        return locateRightmost(currentIndex - 1);
    };

    const targetMatchIndex = locateRightmost(mainLength - queryLength);

    if (targetMatchIndex === -1) {
        console.log("UNRESTORABLE");
    } else {
        const finalString = mainSymbols.reduce((accumulator, currentSymbol, currentIdx) => {
            if (currentIdx >= targetMatchIndex && currentIdx < targetMatchIndex + queryLength) {
                return accumulator + querySymbols[currentIdx - targetMatchIndex];
            } else if (currentSymbol === '?') {
                return accumulator + 'a';
            } else {
                return accumulator + currentSymbol;
            }
        }, '');

        console.log(finalString);
    }
}