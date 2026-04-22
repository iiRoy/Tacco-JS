const solveProblem = (initialText) => {
  const contentRows = initialText.split('\n');
  const sequenceOfValues = contentRows[1].split('').map(Number);

  const findSubsequence = (smallArr, bigArr) => {
    if (smallArr.length === 0) {
      return true;
    }
    if (bigArr.length === 0) {
      return false;
    }

    let smallPointer = 0;
    let bigPointer = 0;

    while (smallPointer < smallArr.length && bigPointer < bigArr.length) {
      if (smallArr[smallPointer] === bigArr[bigPointer]) {
        smallPointer++;
      }
      bigPointer++;
    }
    return smallPointer === smallArr.length;
  };

  const finalCount = Array.from({ length: 1000 }, (_, val) => val)
    .map(num => num.toString().split('').map(Number))
    .filter(digitSet => digitSet.length === 3)
    .filter(threeDigitPattern => findSubsequence(threeDigitPattern, sequenceOfValues))
    .length;

  console.log(finalCount);
};

solveProblem(require("fs").readFileSync("/dev/stdin", "utf8"));