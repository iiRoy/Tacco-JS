let rawDataBuffer = '';
let currentInputPointer = 0;

function readNextValue(dataType) {
    const value = rawDataBuffer[currentInputPointer++];
    if (dataType === 'string') {
        return value;
    } else {
        return Number(value);
    }
}

function outputResult(valueToPrint) {
    console.log(valueToPrint);
}

function checkScheduleFeasibility(tasksArray) {
    let accumulatedProcessingTime = 0;
    let overallFeasibility = true;

    for (let taskIndex = 0; taskIndex < tasksArray.length; ++taskIndex) {
        const currentTaskDetails = tasksArray[taskIndex];
        const taskDuration = currentTaskDetails[0];
        const taskDeadline = currentTaskDetails[1];

        accumulatedProcessingTime += taskDuration;

        overallFeasibility = overallFeasibility && (accumulatedProcessingTime <= taskDeadline);
    }
    return overallFeasibility;
}

function processInputAndSolve() {
    let numberOfTasks;

    while ((numberOfTasks = readNextValue())) {
        let taskInformation = new Array(numberOfTasks);

        for (let i = 0; i < numberOfTasks; ++i) {
            taskInformation[i] = [readNextValue(), readNextValue()];
        }

        const deadlineComparator = (taskA, taskB) => {
            const deadlineA = taskA[1];
            const deadlineB = taskB[1];
            return deadlineA - deadlineB;
        };

        taskInformation.sort(deadlineComparator);

        const finalOutcome = checkScheduleFeasibility(taskInformation);

        outputResult(finalOutcome ? "Yes" : "No");
    }
}

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', function(chunk) {
    rawDataBuffer += chunk;
});

process.stdin.on('end', function() {
    rawDataBuffer = rawDataBuffer.trim().split(/\s+/);
    processInputAndSolve();
});
