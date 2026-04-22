const process = require('process');

const animalIdentifier = new Map([
    ['egg', 0],
    ['chicken', 1]
]);

const animalNames = new Map([
    [0, 'egg'],
    [1, 'chicken']
]);

const delimiterValue = 2; // Represents 'A'

let rawIncomingData = '';

process.stdin.on('data', (segment) => {
    rawIncomingData += segment.toString();
});

process.stdin.on('end', () => {
    // Custom trim implementation
    let processedInput = '';
    let startingPointer = 0;
    let endingPointer = rawIncomingData.length - 1;

    while (startingPointer < rawIncomingData.length && (rawIncomingData[startingPointer] === ' ' || rawIncomingData[startingPointer] === '\n' || rawIncomingData[startingPointer] === '\r')) {
        startingPointer++;
    }
    while (endingPointer >= 0 && (rawIncomingData[endingPointer] === ' ' || rawIncomingData[endingPointer] === '\n' || rawIncomingData[endingPointer] === '\r')) {
        endingPointer--;
    }

    if (startingPointer <= endingPointer) {
        processedInput = rawIncomingData.substring(startingPointer, endingPointer + 1);
    } else {
        processedInput = '';
    }

    // Custom split implementation to tokenize words
    const termList = [];
    let currentTermBuffer = '';
    for (const charUnit of processedInput) {
        if (charUnit === ' ' || charUnit === '\n' || charUnit === '\r') {
            if (currentTermBuffer.length > 0) {
                termList.push(currentTermBuffer);
            }
            currentTermBuffer = '';
        } else {
            currentTermBuffer += charUnit;
        }
    }
    if (currentTermBuffer.length > 0) {
        termList.push(currentTermBuffer);
    }

    // Convert words to numeric tokens (0 for egg, 1 for chicken)
    const numericTokens = termList.map(item => animalIdentifier.get(item));

    // Simulate first replacement pass (for 'EE' -> 'EAE')
    const interimTokens = [];
    for (let currentIdx = 0; currentIdx < numericTokens.length; currentIdx++) {
        interimTokens.push(numericTokens[currentIdx]);
        if (numericTokens[currentIdx] === 0 && (currentIdx + 1) < numericTokens.length && numericTokens[currentIdx + 1] === 0) {
            interimTokens.push(delimiterValue); // Insert delimiter for 'EE'
        }
    }

    // Simulate second replacement pass (for 'CC' -> 'CAC')
    const finalTokenSequence = [];
    for (let currentIdx = 0; currentIdx < interimTokens.length; currentIdx++) {
        finalTokenSequence.push(interimTokens[currentIdx]);
        if (interimTokens[currentIdx] === 1 && (currentIdx + 1) < interimTokens.length && interimTokens[currentIdx + 1] === 1) {
            finalTokenSequence.push(delimiterValue); // Insert delimiter for 'CC'
        }
    }

    // Simulate splitting by the delimiter
    const tokenGroups = [];
    let currentGroup = [];
    for (const value of finalTokenSequence) {
        if (value === delimiterValue) {
            if (currentGroup.length > 0) {
                tokenGroups.push(currentGroup);
            }
            currentGroup = [];
        } else {
            currentGroup.push(value);
        }
    }
    if (currentGroup.length > 0) {
        tokenGroups.push(currentGroup);
    }

    // Find the longest token group
    let maximalGroup = [];
    for (const group of tokenGroups) {
        if (group.length > maximalGroup.length) {
            maximalGroup = group;
        }
    }

    // Determine the output based on the last element of the longest group
    let outcomeAnimal = '';
    if (maximalGroup.length > 0) {
        const lastToken = maximalGroup[maximalGroup.length - 1];
        outcomeAnimal = animalNames.get(lastToken);
    } else {
        // Handle edge case where no tokens or groups are formed (e.g., empty input)
        // Original code would output "chicken" if ans is empty string, as ""slice(-1) is "" != "E"
        outcomeAnimal = "chicken";
    }

    console.log(outcomeAnimal);
});