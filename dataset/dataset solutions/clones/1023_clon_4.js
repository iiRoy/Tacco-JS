"use strict";
process.stdin.resume();
process.stdin.setEncoding('utf8');

let collectedInput = '';

process.stdin.on('data', (inputChunk) => {
    collectedInput += inputChunk;
});

process.stdin.on('end', () => {
    performScheduling(collectedInput);
});

function performScheduling(rawInputData) {
    const dataLines = rawInputData.split(/\r?\n/);

    const [taskCountString, quantumValueString] = dataLines[0].split(' ');
    const initialTaskCount = Number(taskCountString);
    const timeQuantum = Number(quantumValueString);

    let taskQueue = [];

    for (let currentLineIndex = 1; currentLineIndex <= initialTaskCount; currentLineIndex++) {
        const [taskLabel, initialDurationString] = dataLines[currentLineIndex].split(' ');
        taskQueue.push({ label: taskLabel, remainingTime: Number(initialDurationString) });
    }

    const manageProcessQueue = (activeProcessList, totalElapsedTime) => {
        if (activeProcessList.length === 0) {
            return;
        }

        const currentProcess = activeProcessList[0];
        const subsequentProcesses = activeProcessList.slice(1);

        let timeSpentInThisIteration;

        if (currentProcess.remainingTime > timeQuantum) {
            currentProcess.remainingTime -= timeQuantum;
            timeSpentInThisIteration = timeQuantum;
            subsequentProcesses.push(currentProcess);
        } else {
            timeSpentInThisIteration = currentProcess.remainingTime;
            const finishTimestamp = totalElapsedTime + timeSpentInThisIteration;
            console.log(`${currentProcess.label} ${finishTimestamp}`);
        }

        manageProcessQueue(subsequentProcesses, totalElapsedTime + timeSpentInThisIteration);
    };

    manageProcessQueue(taskQueue, 0);
}