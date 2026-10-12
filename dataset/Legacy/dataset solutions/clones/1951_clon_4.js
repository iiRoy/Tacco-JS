function computeStringModulo(numericString, modulusValue) {
  let currentAccumulator = 0;
  for (let digitIndex = 0; digitIndex < numericString.length; digitIndex++) {
    currentAccumulator = (currentAccumulator * 10 + parseInt(numericString[digitIndex], 10)) % modulusValue;
  }
  return currentAccumulator;
}

function main(inputSequence) {
  const targetDivisor = 2019;

  const totalMatches = Array.from({ length: inputSequence.length })
    .flatMap((_, startIndex) =>
      Array.from({ length: inputSequence.length - startIndex })
        .map((__, lengthOffset) =>
          inputSequence.substring(startIndex, startIndex + lengthOffset + 1)
        )
    )
    .filter(segmentValue => computeStringModulo(segmentValue, targetDivisor) === 0)
    .length;

  console.log(totalMatches);
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
