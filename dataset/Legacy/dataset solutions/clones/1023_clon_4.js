"use strict";
process.stdin.resume();
process.stdin.setEncoding('utf8');
let inputBuffer = '';
process.stdin.on('data', function(chunk) { inputBuffer += chunk; });
process.stdin.on('end', function() { executeSimulation(inputBuffer.split(/\r?\n/)); });

function executeSimulation(lines){
    const [initialProcessCountStr, timeQuantumStr] = lines[0].split(' ');
    const initialProcessCount = Number(initialProcessCountStr);
    const timeQuantum = Number(timeQuantumStr);

    let taskQueue = [];
    for (let i = 0; i < initialProcessCount; i++) {
        const [taskIdentifier, taskDurationStr] = lines[i + 1].split(' ');
        taskQueue.push({
            identifier: taskIdentifier,
            duration: Number(taskDurationStr)
        });
    }

    let accumulatedTime = 0;

    while (taskQueue.length > 0) {
        let currentTask = taskQueue.shift();
        
        currentTask.duration -= timeQuantum;
        accumulatedTime += timeQuantum;

        if (currentTask.duration > 0) {
            taskQueue.push(currentTask);
        } else {
            accumulatedTime += currentTask.duration;
            console.log(`${currentTask.identifier} ${accumulatedTime}`);
        }
    }
}
