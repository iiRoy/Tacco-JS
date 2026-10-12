'use strict';
(function(inputData) {
  const rawDataString = inputData.toString();

  const blockRegex = /[A-Za-z]+\n([1-9][0-9]*\n)+/g;

  const rotateString = (sourceString, shiftAmount) => {
    const stringLength = sourceString.length;
    const effectiveShift = shiftAmount % stringLength;
    return sourceString.slice(effectiveShift) + sourceString.slice(0, effectiveShift);
  };

  const processSingleBlock = (currentBlockArray) => {
    const initialString = currentBlockArray[0];
    const numRotationsToApply = Number(currentBlockArray[1]);

    const rotationAmountStrings = currentBlockArray.slice(-numRotationsToApply);

    const rotationAmounts = rotationAmountStrings.map(Number);

    const finalRotatedString = rotationAmounts.reduce((currentAccumulatedString, singleRotationAmount) => {
      console.log(singleRotationAmount);
      return rotateString(currentAccumulatedString, singleRotationAmount);
    }, initialString);

    return finalRotatedString;
  };

  const matchedBlocks = rawDataString.match(blockRegex);

  const parsedBlocks = matchedBlocks.map(blockElement => {
    return blockElement.trim().split('\n');
  });

  const processedResults = parsedBlocks.map(processSingleBlock);

  const finalOutputString = processedResults.join('\n');

  console.log(finalOutputString);

}(require('fs').readFileSync('/dev/stdin', 'utf8')));
