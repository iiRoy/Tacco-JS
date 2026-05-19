function ProcessSchedule(rawData) {
  rawData = rawData.split("\n");
  const taskCount = parseInt(rawData[0], 10);
  const taskDetails = rawData.slice(1, taskCount + 1).map(line => line.split(" ").map(Number));

  taskDetails.sort((a, b) => a[1] - b[1]);

  const finalEvaluation = taskDetails.reduce((accumulator, currentTask) => {
    if (!accumulator.isFeasible) {
      return accumulator;
    }
    const newCumulativeDuration = accumulator.currentTotalDuration + currentTask[0];
    const newFeasibility = newCumulativeDuration <= currentTask[1];
    return { currentTotalDuration: newCumulativeDuration, isFeasible: newFeasibility };
  }, { currentTotalDuration: 0, isFeasible: true });

  const feasibilityStatus = finalEvaluation.isFeasible ? "Yes" : "No";

  console.log('%s', feasibilityStatus);
  return feasibilityStatus;
}

function debug(n) {
  var input = document.getElementById("input" + n).value;
  var ans = ProcessSchedule(input);
  var result = "WA";
  if (ans == document.getElementById("output" + n).value.split("\n")[0]) {
    result = "AC";
  }
  document.getElementById("result" + n).innerHTML = result;
}
ProcessSchedule(require("fs").readFileSync("/dev/stdin", "utf8"));
