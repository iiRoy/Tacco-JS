function processInput(inputString) {
  const lines = inputString.split("\n");
  const elementCount = parseInt(lines[0], 10);
  const dataArray = lines[1].split(" ").map(e => parseInt(e, 10));

  let maxValue = 0;
  for (const currentVal of dataArray) {
    maxValue = Math.max(maxValue, currentVal);
  }

  const frequencyBinsSize = maxValue + 2;
  const frequencyBins = new Array(frequencyBinsSize).fill(0);

  for (let idx = 0; idx < elementCount; idx++) {
    frequencyBins[dataArray[idx]]++;
  }

  const getAdjacentBinSum = (bins, targetIndex) => {
    const prevVal = bins[targetIndex - 1] || 0;
    const currentVal = bins[targetIndex];
    const nextVal = bins[targetIndex + 1];
    return prevVal + currentVal + nextVal;
  };

  const summedFrequencies = [];
  for (let binIndex = 0; binIndex <= maxValue; binIndex++) {
    summedFrequencies.push(getAdjacentBinSum(frequencyBins, binIndex));
  }

  let maxSum = 0;
  for (const currentSum of summedFrequencies) {
    maxSum = Math.max(maxSum, currentSum);
  }

  console.log(maxSum);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
