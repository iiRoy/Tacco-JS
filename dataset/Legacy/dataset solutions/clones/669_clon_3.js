let rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
let lineData = (rawData.trim()).split("\n");

function parseTaskEntry(taskLineString) {
    return taskLineString.split(" ").map(Number);
}

function compareTasksByDeadline(taskA, taskB) {
    const deadlineA = taskA[1];
    const deadlineB = taskB[1];
    return deadlineB - deadlineA;
}

const TASK_DURATION_INDEX = 0;
const TASK_DEADLINE_INDEX = 1;

while (true) {
    let numTasks = parseInt(lineData.shift(), 10);
    if (numTasks === 0) {
        break;
    }

    let tasks = [];
    let totalDuration = 0;

    for (let taskIdx = 0; taskIdx < numTasks; taskIdx++) {
        let currentTaskInfo = parseTaskEntry(lineData.shift());
        tasks.push(currentTaskInfo);
        totalDuration += currentTaskInfo[TASK_DURATION_INDEX];
    }

    tasks.sort(compareTasksByDeadline);

    let canComplete = "Yes";
    for (let taskIdx = 0; taskIdx < tasks.length; taskIdx++) {
        let currentTask = tasks[taskIdx];
        const taskDeadline = currentTask[TASK_DEADLINE_INDEX];
        const taskDuration = currentTask[TASK_DURATION_INDEX];

        if (totalDuration > taskDeadline) {
            canComplete = "No";
            break;
        }
        totalDuration -= taskDuration;
    }
    console.log(canComplete);
}
