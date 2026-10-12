function Main(input) {
  const lines = input.split("\n");
  const [itemCount, totalDistance] = lines[0].split(" ").map(Number);

  const positions = new Array(itemCount);
  const values = new Array(itemCount);

  for (let k = 0; k < itemCount; k++) {
    const [pos, val] = lines[k + 1].split(" ").map(Number);
    positions[k] = pos;
    values[k] = val;
  }

  let currentAccumulatedValue = 0;
  const forwardOnlyProfits = new Array(itemCount);
  const forwardReturnProfits = new Array(itemCount);

  for (let k = 0; k < itemCount; k++) {
    currentAccumulatedValue += values[k];
    forwardOnlyProfits[k] = currentAccumulatedValue - positions[k];
    forwardReturnProfits[k] = currentAccumulatedValue - 2 * positions[k];
  }

  currentAccumulatedValue = 0;
  const backwardOnlyProfits = new Array(itemCount);
  const backwardReturnProfits = new Array(itemCount);

  for (let k = itemCount - 1; k >= 0; k--) {
    currentAccumulatedValue += values[k];
    backwardOnlyProfits[k] = currentAccumulatedValue - (totalDistance - positions[k]);
    backwardReturnProfits[k] = currentAccumulatedValue - 2 * (totalDistance - positions[k]);
  }

  const maxForwardOnlyPrefix = new Array(itemCount);
  maxForwardOnlyPrefix[0] = forwardOnlyProfits[0];
  for (let k = 1; k < itemCount; k++) {
    maxForwardOnlyPrefix[k] = Math.max(maxForwardOnlyPrefix[k - 1], forwardOnlyProfits[k]);
  }

  const maxBackwardOnlySuffix = new Array(itemCount);
  maxBackwardOnlySuffix[itemCount - 1] = backwardOnlyProfits[itemCount - 1];
  for (let k = itemCount - 2; k >= 0; k--) {
    maxBackwardOnlySuffix[k] = Math.max(maxBackwardOnlySuffix[k + 1], backwardOnlyProfits[k]);
  }

  let overallMaximumProfit = 0;

  for (let k = 0; k < itemCount; k++) {
    overallMaximumProfit = Math.max(overallMaximumProfit, forwardOnlyProfits[k]);
    overallMaximumProfit = Math.max(overallMaximumProfit, backwardOnlyProfits[k]);
  }

  for (let k = 0; k < itemCount - 1; k++) {
    overallMaximumProfit = Math.max(overallMaximumProfit, forwardReturnProfits[k] + maxBackwardOnlySuffix[k + 1]);
  }

  for (let k = 1; k < itemCount; k++) {
    overallMaximumProfit = Math.max(overallMaximumProfit, backwardReturnProfits[k] + maxForwardOnlyPrefix[k - 1]);
  }

  console.log('%s', overallMaximumProfit);
}
  
function debug(){
  var input = document.getElementById("input").value;
  Main(input);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
