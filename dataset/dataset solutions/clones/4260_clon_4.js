const lineReaderModule = require('readline');

const processedInput = [];

const interfaceInstance = lineReaderModule.createInterface({
    input: process.stdin,
    output: process.stdout,
});

interfaceInstance.on('line', (currentLine) => {
    processedInput.push(currentLine);
});

interfaceInstance.on('close', () => {
    const quantity = Number(processedInput[0]);
    
    const collectionOne = processedInput[1].split(" ").map(itemString => Number(itemString));
    const collectionTwo = processedInput[2].split(" ").map(itemString => Number(itemString));
    const collectionThree = processedInput[3].split(" ").map(itemString => Number(itemString));

    collectionOne.sort((valA, valB) => valA - valB);
    collectionTwo.sort((valA, valB) => valA - valB);
    collectionThree.sort((valA, valB) => valA - valB);

    let totalTriplets = 0;

    let pointerA = 0;
    let pointerC = 0;

    for (let middleIndex = 0; middleIndex < quantity; ++middleIndex) {
        const currentBValue = collectionTwo[middleIndex];

        // Advance pointerA to find the count of elements in collectionOne strictly less than currentBValue
        while (pointerA < quantity && collectionOne[pointerA] < currentBValue) {
            pointerA++;
        }
        const countLower = pointerA;

        // Advance pointerC to find the count of elements in collectionThree strictly greater than currentBValue
        while (pointerC < quantity && collectionThree[pointerC] <= currentBValue) {
            pointerC++;
        }
        const countHigher = quantity - pointerC;
        
        totalTriplets += countLower * countHigher;
    }

    console.log(totalTriplets);
});