'use strict'
function processInput(rawData) {
    const lines = rawData.split("\n");
    const taskCount = parseInt(lines[0], 10);

    const tasks = [];
    for (let idx = 1; idx <= taskCount; idx++) {
        const taskData = lines[idx].split(" ");
        const duration = parseInt(taskData[0], 10);
        const deadline = parseInt(taskData[1], 10);
        tasks.push({ duration: duration, deadline: deadline });
    }

    tasks.sort((taskA, taskB) => taskA.deadline - taskB.deadline);

    let currentTime = 0;
    let canMeetAllDeadlines = true;

    for (const currentTask of tasks) {
        currentTime += currentTask.duration;

        if (currentTime > currentTask.deadline) {
            canMeetAllDeadlines = false;
            break;
        }
    }

    if (canMeetAllDeadlines) {
        console.log('Yes');
    } else {
        console.log('No');
    }
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
