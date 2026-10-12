let inputBuffer = '';
process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => {
  inputBuffer += chunk;
});

function parseTaskEntry(lineStr) {
  const parts = lineStr.split(' ');
  const taskIdentifier = parts[0];
  const taskDuration = parseInt(parts[1], 10);
  return [taskIdentifier, taskDuration];
}

function processRawInput(rawData) {
  const cleanedLines = rawData.trim().split('\n');
  
  const firstLineData = cleanedLines.shift();
  const timeSliceValue = parseInt(firstLineData.split(' ')[1], 10);

  const initialTaskList = cleanedLines.map(parseTaskEntry);

  return { timeSlice: timeSliceValue, initialTasks: initialTaskList };
}

process.stdin.on('end', () => {
  const { timeSlice, initialTasks } = processRawInput(inputBuffer);
  
  let processQueue = initialTasks;
  let elapsedTime = 0;

  const roundRobinQuantum = timeSlice;

  while (processQueue.length > 0) {
    const currentTask = processQueue.shift();
    const taskRemainingTime = currentTask[1];

    const durationInThisSlice = Math.min(taskRemainingTime, roundRobinQuantum);

    elapsedTime += durationInThisSlice;
    currentTask[1] -= durationInThisSlice;

    const hasRemainingWork = currentTask[1] > 0;

    if (hasRemainingWork) {
      processQueue.push(currentTask);
    } else {
      console.log(currentTask[0], elapsedTime);
    }
  }
});
