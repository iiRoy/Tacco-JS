"use strict"

const processNumericSeries = (rawDataEntry) => {
  const numericalComponents = rawDataEntry.split(/\s+/).map(Number);
  
  const beginningValue = numericalComponents[0];
  const endingValue = numericalComponents[1];
  const segmentLength = numericalComponents[2];

  const emitRange = (startPoint, endPoint) => {
    if (startPoint > endPoint) {
      return;
    }
    Array.from({ length: endPoint - startPoint + 1 }, (_, currentIdx) => startPoint + currentIdx)
         .forEach(console.log);
  };

  const initialSegmentBoundary = Math.min(endingValue, beginningValue + segmentLength - 1);
  emitRange(beginningValue, initialSegmentBoundary);

  const finalSegmentOrigin = Math.max(beginningValue, endingValue - segmentLength + 1);
  emitRange(finalSegmentOrigin, endingValue);
};

const executeProgram = () => {
    const inputPayload = require('fs').readFileSync('/dev/stdin', 'utf8');
    processNumericSeries(inputPayload);
};

executeProgram();