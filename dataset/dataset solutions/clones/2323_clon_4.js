function interleaveSequences(count, sourceA, sourceB) {
  if (count === 0) {
    return [""];
  }

  const resultString = Array.from({ length: count }, (unused, index) => index)
    .reduce((accumulator, currentIndex) => {
      const currentPairSum = sourceA[currentIndex] + sourceB[currentIndex];
      return accumulator + currentPairSum;
    }, "");

  return resultString;
}
