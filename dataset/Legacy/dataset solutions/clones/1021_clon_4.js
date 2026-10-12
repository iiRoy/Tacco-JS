let inputAccumulator = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => {
  inputAccumulator += chunk;
});

process.stdin.on('end', () => {
  const allInputLines = inputAccumulator.trim().split('\n');
  
  const firstConfigurationLine = allInputLines[0].split(' ');
  const timeQuantum = Number(firstConfigurationLine[1]);

  const initialProcesses = [];
  for (let i = 1; i < allInputLines.length; i++) {
    const [processIdentifier, durationValue] = allInputLines[i].split(' ');
    initialProcesses.push({
      identifier: processIdentifier,
      remainingDuration: Number(durationValue),
    });
  }

  class RoundRobinScheduler {
    constructor(processesToSchedule, quantumSlice) {
      this.activeProcessQueue = [...processesToSchedule];
      this.quantumSlice = quantumSlice;
      this.cumulativeTime = 0;
    }

    executeScheduling() {
      while (this.activeProcessQueue.length > 0) {
        const currentProcess = this.activeProcessQueue.shift();
        const timeToAdvance = Math.min(currentProcess.remainingDuration, this.quantumSlice);
        
        this.cumulativeTime += timeToAdvance;
        currentProcess.remainingDuration -= timeToAdvance;

        if (currentProcess.remainingDuration > 0) {
          this.activeProcessQueue.push(currentProcess);
        } else {
          console.log(currentProcess.identifier, this.cumulativeTime);
        }
      }
    }
  }

  const schedulerInstance = new RoundRobinScheduler(initialProcesses, timeQuantum);
  schedulerInstance.executeScheduling();
});
