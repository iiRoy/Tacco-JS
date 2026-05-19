const fileSystemModule = require('fs');

function transformAndFormat(sourceContent) {
    let initialBoundary = 0;
    let finalBoundary = sourceContent.length - 1;

    while (initialBoundary <= finalBoundary && /\s/.test(sourceContent[initialBoundary])) {
        initialBoundary++;
    }

    while (finalBoundary >= initialBoundary && /\s/.test(sourceContent[finalBoundary])) {
        finalBoundary--;
    }

    const intermediateString = (initialBoundary > finalBoundary) ? '' : sourceContent.substring(initialBoundary, finalBoundary + 1);

    return Array.from(intermediateString).reduce((resultAccumulator, currentSymbol) => {
        const symbolCode = currentSymbol.charCodeAt(0);
        if (symbolCode >= 97 && symbolCode <= 122) {
            return resultAccumulator + String.fromCharCode(symbolCode - 32);
        }
        return resultAccumulator + currentSymbol;
    }, '');
}

const retrievedData = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
const processedResult = transformAndFormat(retrievedData);
console.log(processedResult);
