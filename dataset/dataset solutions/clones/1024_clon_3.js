const rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');

const parseNumericValue = (str) => Number(str);

const inputLines = rawInputData.trim().split('\n');

const [processesStr, quantumStr] = inputLines[0].split(' ');
const totalProcesses = parseNumericValue(processesStr);
const timeQuantum = parseNumericValue(quantumStr);

class ScheduledTask {
  constructor(taskIdentifier, initialTime) {
    this.taskIdentifier = taskIdentifier;
    this.remainingExecutionTime = initialTime;
  }

  isCompleted() {
    return this.remainingExecutionTime <= 0;
  }

  deductTime(amount) {
    this.remainingExecutionTime -= amount;
  }
}

const taskExecutionQueue = [];
const taskDataLines = inputLines.slice(1);

taskDataLines.forEach(line => {
  const [taskName, taskTimeStr] = line.split(' ');
  const initialTaskTime = parseNumericValue(taskTimeStr);
  const newTask = new ScheduledTask(taskName, initialTaskTime);
  taskExecutionQueue.push(newTask);
});

let accumulatedTime = 0;

while (taskExecutionQueue.length > 0) {
  const currentScheduledTask = taskExecutionQueue.pop();

  const timeSliceDuration = Math.min(currentScheduledTask.remainingExecutionTime, timeQuantum);

  accumulatedTime += timeSliceDuration;

  currentScheduledTask.deductTime(timeSliceDuration);

  if (!currentScheduledTask.isCompleted()) {
    taskExecutionQueue.unshift(currentScheduledTask);
  } else {
    console.log(currentScheduledTask.taskIdentifier + ' ' + accumulatedTime);
  }
}
