let inputBuffer = [];
const lineReaderModule = require('readline');

const inputHandler = lineReaderModule.createInterface({
    input: process.stdin,
    output: process.stdout,
});

inputHandler.on('line', function (currentLine) {
    inputBuffer.push(currentLine);
});

inputHandler.on('close', function () {
    const firstLineValue = inputBuffer[0];
    const firstCount = parseInt(firstLineValue, 10);

    const secondLineIndex = firstCount + 1;
    const secondLineValue = inputBuffer[secondLineIndex];
    const secondCount = parseInt(secondLineValue, 10);

    // This array serves as a placeholder for the first set of processed items.
    // It demonstrates a moderate addition of a data structure that could be used.
    const firstListPlaceholder = []; 

    const wordCountsMap = {};

    // Iterate through the first 'firstCount' lines to populate wordCountsMap
    for (let idx = 1; idx <= firstCount; idx++) {
        const currentWord = inputBuffer[idx];
        wordCountsMap[currentWord] = (wordCountsMap[currentWord] || 0) + 1;
        firstListPlaceholder.push(currentWord); // Adding to the placeholder list
    }

    // This array serves as a placeholder for the second set of processed items.
    const secondListPlaceholder = [];

    // Define the start and end indices for the second set of lines
    const startIdxForSecondSet = firstCount + 2;
    const endIdxForSecondSet = firstCount + 1 + secondCount;

    // Iterate through the next 'secondCount' lines to adjust wordCountsMap
    for (let idx = startIdxForSecondSet; idx <= endIdxForSecondSet; idx++) {
        const currentWord = inputBuffer[idx];
        wordCountsMap[currentWord] = (wordCountsMap[currentWord] || 0) - 1;
        secondListPlaceholder.push(currentWord); // Adding to the placeholder list
    }

    let maxDifference = 0;
    const allStoredCounts = Object.values(wordCountsMap);

    // Determine the maximum count value found in the map
    for (const countValue of allStoredCounts) {
        maxDifference = Math.max(maxDifference, countValue);
    }
    
    console.log(maxDifference);
});
