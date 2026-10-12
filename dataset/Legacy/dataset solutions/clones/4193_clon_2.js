process.stdin.resume();
process.stdin.setEncoding('utf8');

var globalBuffer = '';

process.stdin.on('data', function(dataSegment) {
    globalBuffer += dataSegment;
});

process.stdin.on('end', function() {
    ProcessData(globalBuffer.split(/\r?\n/));
});

function ProcessData(linesOfText) {

    var numEntries = parseInt(linesOfText[0], 10);

    // Array to store opening hours for each shop
    var openingHours = new Array(numEntries);
    for (var shopIdx = 0; shopIdx < numEntries; shopIdx++) {
        openingHours[shopIdx] = new Array(10);
        var lineParts = linesOfText[1 + shopIdx].split(' ');
        for (var dayIdx = 0; dayIdx < 10; dayIdx++) {
            openingHours[shopIdx][dayIdx] = parseInt(lineParts[dayIdx], 10);
        }
    }

    // Array to store profit values based on overlapping open days
    var profitMatrix = new Array(numEntries);
    for (var shopIdx = 0; shopIdx < numEntries; shopIdx++) {
        profitMatrix[shopIdx] = new Array(10);
        var lineParts = linesOfText[1 + numEntries + shopIdx].split(' ');
        for (var dayIdx = 0; dayIdx < 10; dayIdx++) {
            profitMatrix[shopIdx][dayIdx] = parseInt(lineParts[dayIdx], 10);
        }
    }

    var maxProfit = Number.MIN_SAFE_INTEGER;

    // Iterate through all possible combinations of open days (1 to 2^10 - 1)
    for (var bitmask = 1; bitmask < 1024; bitmask++) {
        var currentTotalProfit = 0;

        // Calculate profit for each shop based on the current day combination
        for (var shopIdx = 0; shopIdx < numEntries; shopIdx++) {
            var openDaysCount = 0;

            // Check how many selected days this shop is open
            for (var dayBit = 0; dayBit < 10; dayBit++) {
                if (((bitmask >> dayBit) & 1) === 1 && openingHours[shopIdx][dayBit] > 0) {
                    openDaysCount++;
                }
            }
            currentTotalProfit += profitMatrix[shopIdx][openDaysCount];
        }

        // Update the maximum profit if the current combination yields a higher value
        if (maxProfit < currentTotalProfit) {
            maxProfit = currentTotalProfit;
        }
    }

    console.log(maxProfit);

    return 0;
}
