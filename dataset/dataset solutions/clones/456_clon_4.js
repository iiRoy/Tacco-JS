const displayResult = console.log;

function evaluatePeriod(initialBalance, periodData, currentPeriodIdx, triggerPeriod) {
    if (currentPeriodIdx === 12) {
        if (triggerPeriod !== null) {
            displayResult(triggerPeriod);
        } else {
            displayResult('NA');
        }
        return;
    }

    const [outflow, inflow] = periodData[currentPeriodIdx].split(' ').map(Number);
    const netChange = outflow - inflow;
    const updatedBalance = initialBalance - netChange;

    let nextTriggerPeriod = triggerPeriod;
    if (nextTriggerPeriod === null && updatedBalance <= 0) {
        nextTriggerPeriod = currentPeriodIdx + 1;
    }

    evaluatePeriod(updatedBalance, periodData, currentPeriodIdx + 1, nextTriggerPeriod);
}

function manageScenarios(allLines, currentLineCursor) {
    const initialCapacityStr = allLines[currentLineCursor];
    const initialCapacity = Number(initialCapacityStr);

    if (initialCapacity === 0) {
        return;
    }

    const twelveMonthDetails = allLines.slice(currentLineCursor + 1, currentLineCursor + 1 + 12);

    evaluatePeriod(initialCapacity, twelveMonthDetails, 0, null);

    manageScenarios(allLines, currentLineCursor + 1 + 12);
}

function initiateProcessing() {
    manageScenarios(globalData, 0);
}

var globalData = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(chunk) {
    globalData += chunk;
});
process.stdin.on('end', function() {
    globalData = globalData.split('\n');
    initiateProcessing();
});