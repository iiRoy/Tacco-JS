function executeRoundRobin() {
    const rawInputData = input.split('\n');

    const configLineParts = rawInputData[0].split(' ').map(Number);
    const totalProcessesCount = configLineParts[0];
    const quantumTimeSlice = configLineParts[1];

    const parseProcessEntry = (processString) => {
        const parts = processString.split(' ');
        return [parts[0], Number(parts[1])];
    };

    const taskQueue = rawInputData.slice(1, totalProcessesCount + 1).map(parseProcessEntry);

    let cumulativeElapsedTime = 0;

    const recordProcessCompletion = (processName, finishTime) => {
        console.log(processName + ' ' + finishTime);
    };

    while (taskQueue.length > 0) {
        let currentTask = taskQueue.shift();

        const taskIdentifier = currentTask[0];
        let taskRemainingDuration = currentTask[1];

        const timeToProcessThisTurn = Math.min(taskRemainingDuration, quantumTimeSlice);

        cumulativeElapsedTime += timeToProcessThisTurn;

        taskRemainingDuration -= timeToProcessThisTurn;
        currentTask[1] = taskRemainingDuration;

        if (taskRemainingDuration <= 0) {
            recordProcessCompletion(taskIdentifier, cumulativeElapsedTime);
        } else {
            taskQueue.push(currentTask);
        }
    }
}

let input = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function (chunk) {
    input += chunk;
});
process.stdin.on('end', function () {
    executeRoundRobin();
});
