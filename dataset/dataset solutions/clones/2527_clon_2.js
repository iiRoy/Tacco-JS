process.stdin.resume();

process.stdin.setEncoding('UTF-8');

let inputBuffer = [];

const interfaceHandler = require('node:readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

interfaceHandler.on('line', (receivedLine) => {
    // This handler processes each incoming line of text.
    inputBuffer.push(receivedLine);
});

interfaceHandler.on('close', () => {
    /*
     * Upon the completion of input stream, this block executes.
     * It performs the necessary computations and generates the final result.
     */

    let itemCount = parseInt(inputBuffer[0], 10);

    let finalSequence =
        inputBuffer[1].split(' ').map((valueString, originalPosition) => {
                return { rankingValue: parseInt(valueString, 10), uniqueIdentifier: originalPosition + 1 };
            })
            .sort((firstElement, secondElement) => {
                return firstElement.rankingValue - secondElement.rankingValue;
            })
            .map(elem => elem.uniqueIdentifier).join(' ');

    console.info(finalSequence);

    // This section is currently inactive, but could be used for debugging or additional logging.
    // for (let k = 0; k < inputBuffer.length; k++) {
    //     console.debug(`Processed entry ${k}: ${inputBuffer[k]}`);
    // }
});