'use strict';
process.stdin.resume();
process.stdin.setEncoding('utf-8');

let inputString = '';
let currentLine = 0;

process.stdin.on('data', inputStdin => {
    inputString += inputStdin;
});

process.stdin.on('end', () => {
    inputString = inputString.split('\n');
    executeMainLogic();
});

function retrieveLine() {
    return inputString[currentLine++];
}

function executeMainLogic() {
    const sequenceLength = parseInt(retrieveLine());
    const characterSequence = retrieveLine();

    if (characterSequence.length === 1) {
        console.log('No');
        return;
    }

    let firstSegmentCharacters = [];
    let secondSegmentCharacters = [];

    const splitPoint = Math.floor(sequenceLength / 2);

    for (let charPosition = 0; charPosition < splitPoint; charPosition++) {
        firstSegmentCharacters.push(characterSequence[charPosition]);
    }

    for (let charPosition = splitPoint; charPosition < sequenceLength; charPosition++) {
        secondSegmentCharacters.push(characterSequence[charPosition]);
    }

    const firstPart = firstSegmentCharacters.join('');
    const secondPart = secondSegmentCharacters.join('');

    console.log(firstPart === secondPart ? 'Yes' : 'No');
}
