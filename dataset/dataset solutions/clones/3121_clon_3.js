var inputLines = [];
var primeModulus = Math.pow(10, 9) + 7;
var cumulativeProduct = 1;

var ioModule = require('readline');

var inputReader = ioModule.createInterface({
    input: process.stdin,
    output: process.stdout,
});

inputReader.on('line', function (currentInputLine) {
    inputLines.push(currentInputLine);
});

inputReader.on('close', function () {
    const sequenceLength = Number(inputLines[0]);
    const characterSequence = inputLines[1].split("");

    characterSequence.sort((charA, charB) => charA.charCodeAt(0) - charB.charCodeAt(0));

    const charFrequenciesMap = new Map();
    for (const charItem of characterSequence) {
        const currentFreq = charFrequenciesMap.get(charItem) || 0;
        charFrequenciesMap.set(charItem, currentFreq + 1);
    }

    const frequencyCounts = Array.from(charFrequenciesMap.values());

    let currentProductValue = 1;
    for (const countValue of frequencyCounts) {
        const incrementedCount = countValue + 1;
        currentProductValue *= incrementedCount;
    }

    console.log(currentProductValue - 1);
});
