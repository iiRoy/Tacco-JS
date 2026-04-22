"use strict";

const processInputData = (rawInputText) => {
  // Begin processing the incoming text data.
  let processedLines = rawInputText.trim().split('\n');

  const boundarySize = parseInt(processedLines[0].split(' ')[0]);
  const markerCount = parseInt(processedLines[0].split(' ')[1]);
  const markerPositions = processedLines[1].split(' ').map(coordStr => parseInt(coordStr));

  let segmentLengths = [];

  // Determine the lengths of segments between consecutive markers in a circular arrangement.
  for (let currentIdx = 0; currentIdx < markerCount; currentIdx++) {
    let currentSegment;

    if (currentIdx === markerCount - 1) {
      // For the last marker, calculate distance back to the first marker.
      currentSegment = (boundarySize - markerPositions[currentIdx]) + markerPositions[0];
    }
    else {
      // Calculate distance between current marker and the next one.
      currentSegment = markerPositions[currentIdx + 1] - markerPositions[currentIdx];
    }

    segmentLengths.push(currentSegment);
  }

  const totalSpan = segmentLengths.reduce((accumulator, segmentVal) => accumulator + segmentVal);
  let minimumPath = totalSpan - Math.max(...segmentLengths);

  console.log(minimumPath);
};

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));