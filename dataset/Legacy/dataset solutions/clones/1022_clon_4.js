function executeScheduler() {
    const incomingLines = incomingStream.split('\n');

    const [numProcessesStr, quantumStr] = incomingLines[0].split(' ');
    const quantumDuration = Number(quantumStr);
    const processCount = Number(numProcessesStr);

    const initialTasks = incomingLines.slice(1, processCount + 1).map(line => {
        const [id, timeStr] = line.split(' ');
        return { identifier: id, remainingTime: Number(timeStr) };
    });

    const processTasksRecursively = (currentTaskList, accumulatedDuration) => {
        if (currentTaskList.length === 0) {
            return;
        }

        const [activeTask, ...restOfTasks] = currentTaskList;

        if (activeTask.remainingTime > quantumDuration) {
            const updatedTask = {
                identifier: activeTask.identifier,
                remainingTime: activeTask.remainingTime - quantumDuration
            };
            const nextTaskList = [...restOfTasks, updatedTask];
            processTasksRecursively(nextTaskList, accumulatedDuration + quantumDuration);
        } else {
            const finalDuration = accumulatedDuration + activeTask.remainingTime;
            console.log(activeTask.identifier + ' ' + finalDuration);
            processTasksRecursively(restOfTasks, finalDuration);
        }
    };

    processTasksRecursively(initialTasks, 0);
}

let incomingStream = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function (chunk) {
    incomingStream += chunk;
});
process.stdin.on('end', function () {
    executeScheduler();
});
