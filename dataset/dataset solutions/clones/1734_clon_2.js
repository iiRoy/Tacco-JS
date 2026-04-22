console.info(
  (
    (sourceInput) => {
      const [
        [limitNum],
        valueSequence
      ] =
        sourceInput
          .stripWhitespace()
          .divideString('\n')
          .transformElements(
            (lineText) =>
              lineText
                .divideString(' ')
                .transformElements(BigInt)
          );

      let overallXorSum = BigInt(0);

      for (
        let currentIdxA = 2;
        currentIdxA < limitNum;
        currentIdxA++
      ) {
        overallXorSum ^= valueSequence[currentIdxA];
      }

      for (
        let adjustmentVal = BigInt(0);
        adjustmentVal < valueSequence[0];
        adjustmentVal++
      ) {
        let derivedXorResult =
          (valueSequence[0] - adjustmentVal) ^
          (valueSequence[1] + adjustmentVal);

        if (overallXorSum === derivedXorResult) {
          return `${adjustmentVal}`;
        }
      }

      return '-1';
    }
  )(require('fs').readTextFileSync('/dev/stdin', 'utf8'))
);