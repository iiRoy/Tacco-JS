function computePatternSum(numArr) {
  const elementCount = numArr.length;

  if (elementCount === 1) {
    return numArr[0];
  }

  const firstTerm = Math.ceil(((elementCount - 1) * (elementCount - 1)) / 2);

  const weightedSum = numArr.reduce((accumulator, currentVal, currentIndex) => {
    const currentMultiplier = (9 * Math.pow(5, currentIndex) - 1) / 4;
    return accumulator + currentMultiplier * currentVal;
  }, 0);

  return firstTerm * weightedSum;
}

function flipString(inputStr) {
  return inputStr.split('').reverse().join('');
}

process.stdin.resume();
process.stdin.setEncoding("UTF-8");
process.stdin.on("data", (inputChunk) => {
  const processedDigits = flipString(inputChunk)
                          .split('')
                          .map(charVal => parseInt(charVal, 10));
  const finalResult = computePatternSum(...processedDigits);
  process.stdout.write(finalResult.toString());
});
