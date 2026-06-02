for (
  inputIdx = 0;
  currentInput = require("fs").readFileSync("/dev/stdin", "utf8").split(/\s/)[inputIdx++];
) {
  for (
    runningSum = +currentInput, loopIter = 10;
    --loopIter;
    loopIter % 2 ? currentInput *= 2 : currentInput /= 3
  ) {
    runningSum += currentInput;
  }
  console.log(runningSum.toFixed(8));
}
