'use strict';

function ProcessInputData(rawTextValue) {
  const numericSequence = Array.from(rawTextValue.trim(), Number);

  const positionMetrics = numericSequence.reduce((accumulator, currentValue, currentIndex) => {
    if (currentIndex % 2 === 0) {
      if (currentValue === 0) {
        accumulator.evenPositionZeroes++;
      } else {
        accumulator.evenPositionOnes++;
      }
    } else {
      if (currentValue === 0) {
        accumulator.oddPositionZeroes++;
      } else {
        accumulator.oddPositionOnes++;
      }
    }
    return accumulator;
  }, { evenPositionZeroes: 0, evenPositionOnes: 0, oddPositionZeroes: 0, oddPositionOnes: 0 });

  const { evenPositionZeroes, evenPositionOnes, oddPositionZeroes, oddPositionOnes } = positionMetrics;

  const transformationCostForPatternOneZero = evenPositionZeroes + oddPositionOnes;
  const transformationCostForPatternZeroOne = evenPositionOnes + oddPositionZeroes;

  const finalMinimumVariations = Math.min(transformationCostForPatternOneZero, transformationCostForPatternZeroOne);

  console.log(finalMinimumVariations);
}

ProcessInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));