'use strict';
(function(sourceData){
  const numericInputs = sourceData.trim().split(/\s+/).map(Number);
  const seriesLength = numericInputs[0];
  const initialValue = numericInputs[1];

  const valueSequence = Array.from({ length: seriesLength }, (_, idx) => initialValue + idx);

  const totalSummation = valueSequence.reduce((accumulator, current) => accumulator + current, 0);

  const elementToExclude = valueSequence.reduce((closestCandidate, currentElement) => {
    const absoluteClosest = Math.abs(closestCandidate);
    const absoluteCurrent = Math.abs(currentElement);

    if (absoluteCurrent < absoluteClosest) {
      return currentElement;
    }
    return closestCandidate;
  }, initialValue);

  console.log(totalSummation - elementToExclude);
})(require('fs').readFileSync('/dev/stdin','utf8'));
