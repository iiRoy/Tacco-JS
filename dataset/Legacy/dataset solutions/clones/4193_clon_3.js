process.stdin.resume();
process.stdin.setEncoding('utf8');

let inputAccumulator = '';
process.stdin.on('data', function(chunk) {
    inputAccumulator += chunk;
});

process.stdin.on('end', function() {
    processApplicationData(inputAccumulator.split(/\r?\n/));
});

function parseLineOfInts(lineString, expectedCount = 10) {
    const lineParts = lineString.split(' ');
    const parsedNumbers = new Array(expectedCount);
    for (let i = 0; i < expectedCount; i++) {
        parsedNumbers[i] = parseInt(lineParts[i], 10);
    }
    return parsedNumbers;
}

function calculateStoreProfitForCombination(currentStoreIndex, dayCombinationMask, storeScheduleMatrix, profitLookupTable) {
    let matchingOpenHours = 0;
    const totalTimeSlots = 10;

    for (let bitPosition = 0; bitPosition < totalTimeSlots; bitPosition++) {
        const isDayOpenInCombination = ((dayCombinationMask >> bitPosition) & 1) === 1;
        const isStoreOpenOnThisDay = storeScheduleMatrix[currentStoreIndex][bitPosition] > 0;

        if (isDayOpenInCombination && isStoreOpenOnThisDay) {
            matchingOpenHours++;
        }
    }
    return profitLookupTable[currentStoreIndex][matchingOpenHours];
}

function processApplicationData(dataLines) {

    const storeCount = parseInt(dataLines[0], 10);

    const storeScheduleMatrix = new Array(storeCount);
    const scheduleDataStartIndex = 1;

    for (let storeIndex = 0; storeIndex < storeCount; storeIndex++) {
        const currentScheduleLine = dataLines[scheduleDataStartIndex + storeIndex];
        storeScheduleMatrix[storeIndex] = parseLineOfInts(currentScheduleLine);
    }

    const profitLookupTable = new Array(storeCount);
    const profitDataStartIndex = scheduleDataStartIndex + storeCount;

    for (let storeIndex = 0; storeIndex < storeCount; storeIndex++) {
        const currentProfitLine = dataLines[profitDataStartIndex + storeIndex];
        profitLookupTable[storeIndex] = parseLineOfInts(currentProfitLine);
    }

    let overallMaxProfit = Number.MIN_SAFE_INTEGER;
    const maxDayCombinations = 1 << 10; // Represents 2^10 = 1024 possible day combinations

    for (let dayCombinationMask = 1; dayCombinationMask < maxDayCombinations; dayCombinationMask++) {
        let totalProfitForCombination = 0;

        for (let currentStoreIndex = 0; currentStoreIndex < storeCount; currentStoreIndex++) {
            totalProfitForCombination += calculateStoreProfitForCombination(
                currentStoreIndex,
                dayCombinationMask,
                storeScheduleMatrix,
                profitLookupTable
            );
        }

        overallMaxProfit = Math.max(overallMaxProfit, totalProfitForCombination);
    }

    console.log(overallMaxProfit);

    return 0;
}
