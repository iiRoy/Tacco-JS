"use strict";

const ProcessInput = rawData => {
  const RADIX_DECIMAL = 10;

  const trimmedData = rawData.trim();
  let processedLines = trimmedData.split("\n");

  const numTracks = processedLines.shift();
  const finalTrackTitle = processedLines.pop();

  let isSleepingPhase = false;
  let cumulativeSleepDuration = 0;

  const extractTrackDetails = (lineStr) => {
    const parts = lineStr.split(" ");
    return {
      name: parts[0],
      duration: parseInt(parts[1], RADIX_DECIMAL)
    };
  };

  for (let idx = 0; idx < processedLines.length; idx++) {
    const currentLine = processedLines[idx];
    const trackDetails = extractTrackDetails(currentLine);

    if (!isSleepingPhase) {
      if (trackDetails.name === finalTrackTitle) {
        isSleepingPhase = true;
      }
    } else {
      cumulativeSleepDuration += trackDetails.duration;
    }
  }

  console.log(cumulativeSleepDuration);
};

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
