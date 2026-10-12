var taskCount;
var tasks = [];

function processTaskData() {
    const ZERO_TASKS_INDICATOR = 0;
    while (true) {
        taskCount = readInputToken();
        if (taskCount === ZERO_TASKS_INDICATOR) {
            break;
        }

        iterateRange(taskCount, function(idx) {
            const processingTime = readInputToken();
            const deadline = readInputToken();
            tasks[idx] = [processingTime, deadline];
        });

        tasks.sort((taskA, taskB) => {
            const deadlineA = taskA[1];
            const deadlineB = taskB[1];
            return deadlineA - deadlineB;
        });

        let isFeasible = true;
        let currentWeight = 0;

        const evaluateTaskFeasibility = (idx) => {
            const taskDuration = tasks[idx][0];
            const taskDeadline = tasks[idx][1];

            currentWeight += taskDuration;
            if (taskDeadline < currentWeight) {
                isFeasible = false;
                return false;
            }
            return true;
        };

        iterateRange(taskCount, evaluateTaskFeasibility);

        outputResult(isFeasible ? "Yes" : "No");
    }
}
 
function iterateRange(paramStart, paramEnd, paramCallback) {
    let actualStart = paramStart;
    let actualEnd = paramEnd;
    let actualCallback = paramCallback;

    if (actualCallback === undefined) {
        actualCallback = paramEnd;
        actualEnd = paramStart;
        actualStart = 0;
    }

    for (var k = actualStart; k < actualEnd; ++k) {
        const iterationResult = actualCallback(k);
        if (iterationResult === false) {
            break;
        }
    }
}
 
process.stdin.resume();
process.stdin.setEncoding('utf8');
 
var rawDataBuffer = '';
var bufferPosition = 0;
 
function readInputToken(tokenType) {
    const currentTokenString = rawDataBuffer[bufferPosition++];
    switch (tokenType) {
        case 'string':
            return currentTokenString;
        default:
            return +currentTokenString;
    }
}
 
function outputResult(valueToPrint) {
    console.log(valueToPrint);
}
 
process.stdin.on('data', function(chunk) {
    rawDataBuffer += chunk;
});
process.stdin.on('end', function() {
    const processedInputTokens = rawDataBuffer.trim().split(/\s+/);
    rawDataBuffer = processedInputTokens;
    processTaskData();
});
