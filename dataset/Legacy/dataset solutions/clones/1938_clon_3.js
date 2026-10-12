function processInputData(rawInputString) {
  const inputSegments = rawInputString.split(" ");

  const safetyThresholdValue = Number(inputSegments[0]);
  const currentWeightValue = Number(inputSegments[1]);

  function determineAndOutputStatus(threshold, weight) {
    const isWeightAboveThreshold = weight > threshold;
    if (isWeightAboveThreshold) {
      console.log("safe");
    } else {
      console.log("unsafe");
    }
  }

  determineAndOutputStatus(safetyThresholdValue, currentWeightValue);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
