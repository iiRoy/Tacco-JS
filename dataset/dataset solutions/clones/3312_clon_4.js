const processInputData = (inputContent) => {
  const [firstSequenceLine, secondSequenceLine] = inputContent.split('\n');
  const sequenceAlpha = firstSequenceLine.split('');
  const sequenceBeta = secondSequenceLine.split('');

  const lengthAlpha = sequenceAlpha.length;
  const lengthBeta = sequenceBeta.length;

  const memoizationGrid = Array.from({ length: lengthAlpha + 1 }, () => Array(lengthBeta + 1).fill(-1));

  const calculateLCSLength = (currentAlphaIndex, currentBetaIndex) => {
    if (currentAlphaIndex === 0 || currentBetaIndex === 0) {
      return 0;
    }
    if (memoizationGrid[currentAlphaIndex][currentBetaIndex] !== -1) {
      return memoizationGrid[currentAlphaIndex][currentBetaIndex];
    }

    let computedLength;
    if (sequenceAlpha[currentAlphaIndex - 1] === sequenceBeta[currentBetaIndex - 1]) {
      computedLength = 1 + calculateLCSLength(currentAlphaIndex - 1, currentBetaIndex - 1);
    } else {
      computedLength = Math.max(
        calculateLCSLength(currentAlphaIndex - 1, currentBetaIndex),
        calculateLCSLength(currentAlphaIndex, currentBetaIndex - 1)
      );
    }

    memoizationGrid[currentAlphaIndex][currentBetaIndex] = computedLength;
    return computedLength;
  };

  calculateLCSLength(lengthAlpha, lengthBeta);

  const reconstructLCSPath = (currentAlphaIndex, currentBetaIndex) => {
    if (currentAlphaIndex === 0 || currentBetaIndex === 0) {
      return '';
    }

    if (sequenceAlpha[currentAlphaIndex - 1] === sequenceBeta[currentBetaIndex - 1]) {
      return reconstructLCSPath(currentAlphaIndex - 1, currentBetaIndex - 1) + sequenceAlpha[currentAlphaIndex - 1];
    } else {
      const lengthFromAlphaDecrement = memoizationGrid[currentAlphaIndex - 1][currentBetaIndex];
      const lengthFromBetaDecrement = memoizationGrid[currentAlphaIndex][currentBetaIndex - 1];

      if (lengthFromAlphaDecrement >= lengthFromBetaDecrement) {
        return reconstructLCSPath(currentAlphaIndex - 1, currentBetaIndex);
      } else {
        return reconstructLCSPath(currentAlphaIndex, currentBetaIndex - 1);
      }
    }
  };

  const finalCommonSubsequence = reconstructLCSPath(lengthAlpha, lengthBeta);
  console.log(finalCommonSubsequence);
};

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
