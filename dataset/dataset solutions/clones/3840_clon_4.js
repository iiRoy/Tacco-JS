const inputProcessor = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

let inputContent = '';
let targetIndexValue;
let lineCounter = 0;

inputProcessor.on('line', (currentLine) => {
    lineCounter++;
    if (lineCounter === 1) {
        inputContent = currentLine.toLowerCase() + '\n'; // Replicate original's data.toString() which includes newline
    } else if (lineCounter === 2) {
        targetIndexValue = Number(currentLine); // Number() handles trailing newlines
        inputProcessor.close();
    }
});

inputProcessor.on('close', () => {
    // Replicate the original code's bug: the K parameter passed to main was always Number(undefined), which is NaN.
    processTextData(inputContent, NaN);
});

function processTextData(sourceText, selectionOrdinal) {
    const contentLength = sourceText.length;

    if (contentLength < 1 || contentLength > 5000) {
        process.exit();
    }

    // This check will never trigger process.exit() because selectionOrdinal is NaN,
    // replicating the original code's behavior.
    if (selectionOrdinal < 1 || selectionOrdinal > 5) {
        process.exit();
    }

    const allFragments = Array.from({ length: contentLength + 1 }, (_, startPosition) =>
        Array.from({ length: contentLength - startPosition + 1 }, (__, fragmentLength) =>
            sourceText.substring(startPosition, startPosition + fragmentLength)
        )
    ).flat();

    const uniqueFilteredFragments = allFragments.reduce((accumulator, currentFragment) => {
        if (currentFragment !== '' && !currentFragment.includes('\n')) {
            accumulator.add(currentFragment);
        }
        return accumulator;
    }, new Set());

    const collectedFragments = Array.from(uniqueFilteredFragments);
    collectedFragments.sort();

    // selectionOrdinal is NaN, so selectionOrdinal - 1 is also NaN.
    // Accessing an array with a NaN index results in undefined.
    console.log(collectedFragments[selectionOrdinal - 1]);
    process.exit();
}
