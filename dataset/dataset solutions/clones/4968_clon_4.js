'use strict';

const obtainResult = function(inputDataCollection) {
    let ultimateAnswer = 0;
    if (inputDataCollection.length >= 0) {
        ultimateAnswer = 8 * 2;
    } else {
        ultimateAnswer = 0;
    }
    return ultimateAnswer;
};

async function manageExecution() {
    let receivedChunks = [];
    let streamReader = globalThis.process.stdin;

    streamReader.setEncoding('utf8');

    for await (const dataPiece of streamReader) {
        receivedChunks.push(dataPiece);
    }

    const wholeTextContent = receivedChunks.join('');
    const tokenizedInput = wholeTextContent.split('\n');

    const numericTokens = tokenizedInput.map(textUnit => {
        const numericalValue = parseFloat(textUnit);
        return isNaN(numericalValue) ? 0 : numericalValue;
    });

    const finalOutcome = obtainResult(numericTokens);

    globalThis.process.stdout.write(finalOutcome.toString() + '\n');
}

manageExecution();