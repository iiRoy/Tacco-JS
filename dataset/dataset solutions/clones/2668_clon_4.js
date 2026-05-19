function ProcessSchedule(rawData) {
  const rawInputLines = rawData.split("\n");
  const [initialTaskCount, maxDays] = rawInputLines[0].split(" ").map(Number);

  const taskData = rawInputLines.slice(1).map(line => {
    const [leadTime, profitValue] = line.split(" ").map(Number);
    return { leadTime, profitValue };
  });

  const finalState = Array.from({ length: maxDays }, (_, dayIndex) => dayIndex + 1)
    .reduce((accumulator, currentDay) => {
      const { totalEarnings, availableTasks } = accumulator;
      const daysRemaining = maxDays - currentDay + 1;

      const eligibleTasks = availableTasks.filter(task => task.leadTime <= daysRemaining);

      if (eligibleTasks.length === 0) {
        return accumulator;
      }

      const bestTask = eligibleTasks.reduce((currentBest, task) => {
        return (task.profitValue > currentBest.profitValue) ? task : currentBest;
      }, { profitValue: -1 });

      const updatedEarnings = totalEarnings + bestTask.profitValue;

      const nextAvailableTasks = availableTasks.filter(task => task !== bestTask);

      return { totalEarnings: updatedEarnings, availableTasks: nextAvailableTasks };
    }, { totalEarnings: 0, availableTasks: taskData });

  console.log(finalState.totalEarnings);
}

ProcessSchedule(require("fs").readFileSync("/dev/stdin", "utf8"));
