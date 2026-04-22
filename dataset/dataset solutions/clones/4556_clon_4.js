'use strict';

process.stdin.resume();
process.stdin.setEncoding('utf-8');

const acquireDataStream = () => {
    return new Promise((resolveSource) => {
        let cumulativePayload = '';
        process.stdin.on('readable', () => {
            let chunk;
            while (null !== (chunk = process.stdin.read())) {
                cumulativePayload += chunk;
            }
        });
        process.stdin.on('end', () => {
            resolveSource(cumulativePayload);
        });
    });
};

function calculateProcessedValue(firstElement, secondElement, thirdElement) {
    const difference = thirdElement - secondElement;
    const adjustedFirst = firstElement - 2;
    const intermediateProduct = adjustedFirst * difference;
    const finalIntermediate = intermediateProduct + 1;

    if (finalIntermediate < 0) {
        return 0;
    } else {
        return finalIntermediate;
    }
}

(async () => {
    const rawInputContent = await acquireDataStream();
    const processedLines = rawInputContent.split('\n').filter(line => line.trim() !== '');

    let lineIterator = 0;
    const retrieveNextLine = () => processedLines[lineIterator++];

    const numericElements = retrieveNextLine().split(' ').map(str => parseInt(str, 10));

    const paramA = numericElements[0];
    const paramB = numericElements[1];
    const paramC = numericElements[2];

    const finalOutput = calculateProcessedValue(paramA, paramB, paramC);

    process.stdout.write(finalOutput.toString() + '\n');
})();