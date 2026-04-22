var jobQuantity;
var operations = [];

function processAllCases() {
    while (true) {
        jobQuantity = acquireDatum();
        if (jobQuantity === 0) {
            break;
        }
        
        operations = Array.from({ length: jobQuantity }, () => [acquireDatum(), acquireDatum()]);

        operations.sort((firstTask, secondTask) => firstTask[1] - secondTask[1]);

        const outcome = operations.reduce((currentStatus, currentTask) => {
            if (!currentStatus.isFeasible) {
                return currentStatus;
            }
            const projectedCompletionTime = currentStatus.totalSpentTime + currentTask[0];
            if (projectedCompletionTime > currentTask[1]) {
                return { totalSpentTime: projectedCompletionTime, isFeasible: false };
            }
            return { totalSpentTime: projectedCompletionTime, isFeasible: true };
        }, { totalSpentTime: 0, isFeasible: true });

        emitResponse(outcome.isFeasible ? "Yes" : "No");
    }
}
 
process.stdin.resume();
process.stdin.setEncoding('utf8');
 
var sourceData = '';
var dataPosition = 0;
 
function acquireDatum(kind) {
    if (kind === 'text') {
        return sourceData[dataPosition++];
    } else {
        return +sourceData[dataPosition++];
    }
}
 
function emitResponse(value) {
    console.log(value);
}
 
process.stdin.on('data', function(chunk) {
    sourceData += chunk;
});
process.stdin.on('end', function() {
    sourceData = sourceData.trim().split(/\s+/);
    processAllCases();
});