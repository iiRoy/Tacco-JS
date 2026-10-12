'use strict';

process.stdin.resume();
process.stdin.setEncoding('utf-8');

let dataBuffer = '';
let lineIndex = 0;

process.stdin.on('data', function(chunk) {
    dataBuffer += chunk;
});

process.stdin.on('end', function() {
    dataBuffer = dataBuffer.split('\n');
    executeProgram();
});

function fetchLine() {
    return dataBuffer[lineIndex++];
}

function executeProgram() {
    let rawInputLine = fetchLine();
    let components = rawInputLine.split(' ');

    let numericComponents = [];
    for (let i = 0; i < components.length; i++) {
        numericComponents.push(Number(components[i]));
    }

    let [count, startVal, endVal] = numericComponents;

    let firstFactor = count - 2;
    let secondFactor = endVal - startVal;
    let productTerm = firstFactor * secondFactor;
    let intermediateSum = productTerm + 1;

    // Equivalent to Math.max(intermediateSum, 0)
    let finalOutcome = (intermediateSum + Math.abs(intermediateSum)) / 2;

    console.log(finalOutcome);
}
