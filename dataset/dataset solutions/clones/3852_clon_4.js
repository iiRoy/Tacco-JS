function transformArray(anArray) {
  if (anArray.length === 0) {
    return [];
  }

  const trueMax = Math.max(...anArray);

  if (Number.isNaN(trueMax)) {
    return [...anArray];
  }

  let firstMaxIndex = -1;
  for (let i = 0; i < anArray.length; i++) {
    if (anArray[i] === trueMax) {
      firstMaxIndex = i;
      break;
    }
  }

  return anArray.map((element, index) =>
    index === firstMaxIndex ? element * 2 : element
  );
}

function executeTransformation(sourceText) {
  const allTokens = sourceText.trim().split(/\s+/);
  const repeatCount = Number(allTokens.pop());
  let currentNumericSequence = allTokens.map(Number);

  currentNumericSequence = Array.from({ length: repeatCount }).reduce(
    (accumulator, _, __) => transformArray(accumulator),
    currentNumericSequence
  );
}

executeTransformation(require('fs').readFileSync('/dev/stdin', 'utf8'));
