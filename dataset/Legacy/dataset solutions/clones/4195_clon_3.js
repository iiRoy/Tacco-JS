process.stdin.resume();
process.stdin.setEncoding('utf8');

function parseLineOfInts(line) {
    return line.split(' ').map(val => parseInt(val, 10));
}

function createEmpty2DArray(rows, cols) {
    let arr = new Array(rows);
    for (let i = 0; i < rows; i++) {
        arr[i] = new Array(cols);
    }
    return arr;
}

function executeProfitCalculation(inputLines) {
    const NUM_DAYS = 10;
    const PROFIT_MATRIX_COLUMNS = NUM_DAYS + 1;

    let currentLineIndex = 0;
    const numberOfShops = parseInt(inputLines[currentLineIndex++], 10);

    const shopOpeningSchedules = createEmpty2DArray(numberOfShops, NUM_DAYS);
    for (let shopIndex = 0; shopIndex < numberOfShops; shopIndex++) {
        const dayScheduleValues = parseLineOfInts(inputLines[currentLineIndex++]);
        for (let dayIndex = 0; dayIndex < NUM_DAYS; dayIndex++) {
            shopOpeningSchedules[shopIndex][dayIndex] = dayScheduleValues[dayIndex];
        }
    }

    const shopProfitMatrix = createEmpty2DArray(numberOfShops, PROFIT_MATRIX_COLUMNS);
    for (let shopIndex = 0; shopIndex < numberOfShops; shopIndex++) {
        const profitValues = parseLineOfInts(inputLines[currentLineIndex++]);
        for (let concurrentCount = 0; concurrentCount < PROFIT_MATRIX_COLUMNS; concurrentCount++) {
            shopProfitMatrix[shopIndex][concurrentCount] = profitValues[concurrentCount];
        }
    }

    const dayOpenStates = new Array(NUM_DAYS).fill(false);

    const finalMaxProfit = determineOptimalProfit(0, dayOpenStates, shopOpeningSchedules, shopProfitMatrix);

    console.log(finalMaxProfit);

    return 0;
}

function determineOptimalProfit(currentDayIdx, dayOpenStates, shopOpeningSchedules, shopProfitMatrix) {
    const TOTAL_DAYS_COUNT = 10;
    const NUM_BUSINESSES = shopOpeningSchedules.length;

    if (currentDayIdx >= TOTAL_DAYS_COUNT) {
        const hasAnyDayBeenOpened = dayOpenStates.some(isOpen => isOpen);

        if (!hasAnyDayBeenOpened) {
            return Number.MIN_SAFE_INTEGER;
        }

        const businessConcurrentCounts = new Array(NUM_BUSINESSES).fill(0);
        for (let businessIdx = 0; businessIdx < NUM_BUSINESSES; businessIdx++) {
            for (let dayIdx = 0; dayIdx < TOTAL_DAYS_COUNT; dayIdx++) {
                if (dayOpenStates[dayIdx] && shopOpeningSchedules[businessIdx][dayIdx] === 1) {
                    businessConcurrentCounts[businessIdx]++;
                }
            }
        }

        let totalProfitForConfiguration = 0;
        for (let businessIdx = 0; businessIdx < NUM_BUSINESSES; businessIdx++) {
            totalProfitForConfiguration += shopProfitMatrix[businessIdx][businessConcurrentCounts[businessIdx]];
        }

        return totalProfitForConfiguration;
    }

    const profitIfCurrentDayIsClosed = determineOptimalProfit(currentDayIdx + 1, dayOpenStates, shopOpeningSchedules, shopProfitMatrix);

    dayOpenStates[currentDayIdx] = true;
    const profitIfCurrentDayIsOpen = determineOptimalProfit(currentDayIdx + 1, dayOpenStates, shopOpeningSchedules, shopProfitMatrix);
    dayOpenStates[currentDayIdx] = false;

    return Math.max(profitIfCurrentDayIsClosed, profitIfCurrentDayIsOpen);
}

let accumulatedInputBuffer = '';
process.stdin.on('data', (dataChunk) => {
    accumulatedInputBuffer += dataChunk;
});

process.stdin.on('end', () => {
    executeProfitCalculation(accumulatedInputBuffer.split(/\r?\n/));
});
