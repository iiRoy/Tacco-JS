function Main(input) {
  "use strict";
  const [numN, numK] = input.split("\n")[0].split(" ").map(Number);
  const charArray = input.split("\n")[1].split("");

  const initialRunState = {
    segmentLengths: [],
    zeroSegmentLengths: [],
    oneSegmentLengths: [],
    currentLengthTracker: 1,
    lastCharTracker: charArray[0]
  };

  const processedRuns = charArray.slice(1).reduce((accumulator, currentChar) => {
    if (currentChar !== accumulator.lastCharTracker) {
      accumulator.segmentLengths.push(accumulator.currentLengthTracker);
      if (currentChar === "1") {
        accumulator.oneSegmentLengths.push(accumulator.currentLengthTracker);
      } else {
        accumulator.zeroSegmentLengths.push(accumulator.currentLengthTracker);
      }
      accumulator.currentLengthTracker = 1;
    } else {
      accumulator.currentLengthTracker++;
    }
    accumulator.lastCharTracker = currentChar;
    return accumulator;
  }, initialRunState);

  const segmentLengths = processedRuns.segmentLengths;
  const zeroSegmentLengths = processedRuns.zeroSegmentLengths;

  if (numK >= zeroSegmentLengths.length) {
    console.log(numN);
    return;
  }

  const windowSizeLookup = { "1": numK * 2 + 1, "0": numK * 2 + 2 };
  const effectiveWindowSize = windowSizeLookup[charArray[0]];

  let currentWindowSum = 0;
  for (let idx = 0; idx < effectiveWindowSize && idx < segmentLengths.length; idx++) {
    currentWindowSum += segmentLengths[idx];
  }

  const allWindowSums = [currentWindowSum];

  for (let idx = effectiveWindowSize; idx < segmentLengths.length; idx++) {
    currentWindowSum -= segmentLengths[idx - effectiveWindowSize];
    currentWindowSum += segmentLengths[idx];
    allWindowSums.push(currentWindowSum);
  }

  console.log(Math.max(...allWindowSums));
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
