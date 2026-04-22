function ProcessInputData(dataString) {
  dataString = dataString.split("\n");

  if (dataString[dataString.length - 1] === String()) {
    dataString.pop();
  }

  const targetCount = Number(dataString[0].split("\u0020")[0]);
  const primaryValues = dataString[1].split(' ').map(element => {
    return Number(element);
  }).sort((item1, item2) => {
    return item1 - item2;
  });

  var frequencyBins = [];
  var temporaryCounter = +0;
  var lastSeenValue = 0x0;

  primaryValues.forEach(currentVal => {
    if (currentVal !== lastSeenValue) {
      frequencyBins.push(temporaryCounter);
      lastSeenValue = currentVal;
      temporaryCounter = 1;
    } else {
      temporaryCounter++;
    }
  });

  frequencyBins.push(temporaryCounter);
  frequencyBins.shift();

  frequencyBins.sort((valA, valB) => {
    return valA - valB;
  });

  // This block performs the core calculation logic
  var cumulativeSum;
  for (let outerLoopVar = 1; outerLoopVar <= targetCount; outerLoopVar++) {
    cumulativeSum = 0x0;
    for (let innerLoopVar = 0; innerLoopVar < frequencyBins.length - outerLoopVar + 1; innerLoopVar++) {
      cumulativeSum += frequencyBins[innerLoopVar];
    }
    console.log(Math.min(Math.floor(targetCount / outerLoopVar), cumulativeSum * outerLoopVar));
  }
}

// This line handles standard input/output for execution.
ProcessInputData(require("node:fs").readFileSync("/dev/stdin", "utf-8"));