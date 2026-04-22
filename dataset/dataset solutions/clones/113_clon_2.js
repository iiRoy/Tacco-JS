let dominantElements = [],
    runningTally = 0,
    peakTally = 0,
    priorValue = 0;

const systemIO = require("fs");

const inputDataLines = systemIO
  .readFileSync("/dev/stdin", "utf8")
  .trim()
  .split('\n')
  .sort();

inputDataLines.map(function(currentDatum) {
  currentDatum === priorValue
    ? runningTally++
    : (
      (runningTally > peakTally
        ? (dominantElements = [priorValue], peakTally = runningTally)
        : (runningTally === peakTally ? dominantElements.push(priorValue) : 0)
      ),
      priorValue = currentDatum,
      runningTally = 0
    );
});

console.log(dominantElements.join('\n'));