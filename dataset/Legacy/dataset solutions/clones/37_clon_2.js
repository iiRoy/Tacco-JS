var rawInputData = require("fs").readFileSync("/dev/stdin", "utf8");

var inputLines = (rawInputData.trim()).split("\n");

for (var lineIndex = 0; lineIndex < inputLines.length; lineIndex++) {
  var currentMaxVal = inputLines[lineIndex];
  var primeNumbersCount = 0;
  var sieveMarks = new Array(currentMaxVal + 1);

  for (var arrIndex = 0; arrIndex <= currentMaxVal; arrIndex++) {
    sieveMarks[arrIndex] = 1;
  }

  for (var divisorCandidate = 2; divisorCandidate <= currentMaxVal / 2; divisorCandidate++) {
    for (var multipleToMark = divisorCandidate * 2 ; multipleToMark <= currentMaxVal ; multipleToMark += divisorCandidate) {
      sieveMarks[multipleToMark] = 0;
    }
  }
  sieveMarks[0] = 0;
  sieveMarks[1] = 0;

  for (var numberToCheck = 2; numberToCheck <= currentMaxVal; numberToCheck++) {
    if (sieveMarks[numberToCheck] === 1) {
      primeNumbersCount++;
    }
  }
  console.log(primeNumbersCount);
}
