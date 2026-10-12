const fileSystemModule = require('fs');

const inputLength = fileSystemModule.fstatSync(process.stdin.fd).size;
const inputBuffer = Buffer.alloc(inputLength);
const readBytesCount = fileSystemModule.readSync(process.stdin.fd, inputBuffer, 0, inputLength, 0);
const rawInputString = inputBuffer.toString('utf8', 0, readBytesCount);
const inputLines = rawInputString.split('\n');

function parseAndSortNumbers(lineContent) {
    const numberStrings = lineContent.split(' ');
    const parsedNumbers = numberStrings.map(Number).sort((a, b) => a - b);
    return parsedNumbers;
}

function checkPythagoreanTriple(sideA, sideB, hypotenuseCandidate) {
    const sumOfSquaresOfSides = Math.pow(sideA, 2) + Math.pow(sideB, 2);
    const squareOfHypotenuse = Math.pow(hypotenuseCandidate, 2);
    return squareOfHypotenuse === sumOfSquaresOfSides;
}

function processInputData() {
    const totalTestCases = Number(inputLines[0]);

    for (let currentLineIndex = 1; currentLineIndex <= totalTestCases; currentLineIndex++) {
        const currentLineData = inputLines[currentLineIndex];
        const sortedNumbers = parseAndSortNumbers(currentLineData);

        const shortestSide = sortedNumbers[0];
        const middleSide = sortedNumbers[1];
        const longestSide = sortedNumbers[2];

        const isTriple = checkPythagoreanTriple(shortestSide, middleSide, longestSide);

        console.log(isTriple ? 'YES' : 'NO');
    }
}

processInputData();
