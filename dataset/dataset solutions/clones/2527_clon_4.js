process.stdin.resume();
process.stdin.setEncoding('utf8');

let inputDataLines = [];
let inputProcessor = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

inputProcessor.on('line', (currentLine) => {
    inputDataLines.push(currentLine);
});

inputProcessor.on('close', () => {
    // The first line's value (n) is read but not used in the original snippet's core logic.
    // let firstLineValue = Number(inputDataLines[0]);

    let secondLineContent = inputDataLines[1];
    let parsedNumbers = secondLineContent.split(" ").map(Number);

    // Create an array of 1-based original indices (positions).
    // This array will be sorted based on the values in 'parsedNumbers'.
    let originalPositions = Array.from({ length: parsedNumbers.length }, (_, currentIdx) => currentIdx + 1);

    // Sort the 'originalPositions' array.
    // The comparison function accesses the actual numeric values from 'parsedNumbers'
    // using the 0-based index derived from the 1-based position.
    originalPositions.sort((posA, posB) => {
        let valueAtPosA = parsedNumbers[posA - 1];
        let valueAtPosB = parsedNumbers[posB - 1];
        return valueAtPosA - valueAtPosB;
    });

    let finalResultString = originalPositions.join(" ");

    console.log(finalResultString);
});
