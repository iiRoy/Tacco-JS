process.stdin.resume();
process.stdin.setEncoding('utf8');

var globalInputBuffer = '';

process.stdin.on('data', function(chunkOfData) {
    globalInputBuffer += chunkOfData;
});

process.stdin.on('end', function() {
    ProcessData(globalInputBuffer.split(/\r?\n/));
});

function ProcessData(dataLines) {

    var numStores = parseInt(dataLines[0], 10);

    var storeOperatingHours = new Array(numStores);
    for (var storeIdx = 0; storeIdx < numStores; storeIdx++) {
        storeOperatingHours[storeIdx] = new Array(10);
        var lineParts = dataLines[1 + storeIdx].split(' ');
        for (var hourIdx = 0; hourIdx < 10; hourIdx++) {
            storeOperatingHours[storeIdx][hourIdx] = parseInt(lineParts[hourIdx], 10);
        }
    }

    var profitMatrix = new Array(numStores);
    for (var storeIdx = 0; storeIdx < numStores; storeIdx++) {
        profitMatrix[storeIdx] = new Array(10);
        var lineParts = dataLines[1 + numStores + storeIdx].split(' ');
        for (var hourIdx = 0; hourIdx < 10; hourIdx++) {
            profitMatrix[storeIdx][hourIdx] = parseInt(lineParts[hourIdx], 10);
        }
    }

    var currentlyOpenHours = new Array(10);
    currentlyOpenHours.fill(false);

    var finalResult = 0;
    finalResult = calculateMaxProfit(0, currentlyOpenHours, storeOperatingHours, profitMatrix);

    console.log(finalResult);

    return 0;
}

function calculateMaxProfit(currentHourIndex, openHoursState, storeAvailability, profitTable) {

    if (currentHourIndex >= 10) {

        var noHoursSelected = true;
        for (var checkIdx = 0; checkIdx < openHoursState.length; checkIdx++) {
            if (openHoursState[checkIdx]) {
                noHoursSelected = false;
                break;
            }
        }

        if (noHoursSelected) {
            return Number.MIN_SAFE_INTEGER;
        }

        var commonOpenHoursCount = new Array(storeAvailability.length);
        commonOpenHoursCount.fill(0);
        for (var storeIterator = 0; storeIterator < storeAvailability.length; storeIterator++) {
            for (var hourIterator = 0; hourIterator < 10; hourIterator++) {
                if (openHoursState[hourIterator] && storeAvailability[storeIterator][hourIterator] === 1) {
                    commonOpenHoursCount[storeIterator]++;
                }
            }
        }

        var currentProfitSum = 0;
        for (var profitIterator = 0; profitIterator < profitTable.length; profitIterator++) {
            currentProfitSum += profitTable[profitIterator][commonOpenHoursCount[profitIterator]];
        }

        return currentProfitSum;
    }

    var profitIfHourClosed = 0;
    var profitIfHourOpen = 0;

    profitIfHourClosed = calculateMaxProfit(currentHourIndex + 1, openHoursState, storeAvailability, profitTable);
    openHoursState[currentHourIndex] = true;
    profitIfHourOpen = calculateMaxProfit(currentHourIndex + 1, openHoursState, storeAvailability, profitTable);
    openHoursState[currentHourIndex] = false;

    if (profitIfHourClosed > profitIfHourOpen) {
        return profitIfHourClosed;
    }
    else {
        return profitIfHourOpen;
    }
}
