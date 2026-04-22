function atomRecognizer(pattern) {
  const patternLength = pattern.length;

  return function matchLiteral(inputSequence, currentOffset) {
    if (currentOffset < 0 || currentOffset > inputSequence.length) {
      return [false, null, currentOffset];
    }
    if (currentOffset + patternLength > inputSequence.length) {
      return [false, null, currentOffset];
    }

    for (let charIndex = 0; charIndex < patternLength; charIndex++) {
      if (inputSequence.charCodeAt(currentOffset + charIndex) !== pattern.charCodeAt(charIndex)) {
        return [false, null, currentOffset];
      }
    }

    return [true, pattern, currentOffset + patternLength];
  };
}