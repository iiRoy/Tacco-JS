function processInputData(rawData) {
  var lines = rawData.split('\n');

  var elementCount = parseInt(lines[0], 10);

  var firstLineTokens = lines[1].split(' ');
  var secondLineTokens = lines[2].split(' ');

  var dataMatrix = [];
  dataMatrix[0] = firstLineTokens.map(Number);
  dataMatrix[1] = secondLineTokens.map(Number);

  var prefixSumsRow0 = new Array(elementCount + 1).fill(0);
  for (var k = 0; k < elementCount; k++) {
    prefixSumsRow0[k + 1] = prefixSumsRow0[k] + dataMatrix[0][k];
  }

  var suffixSumsRow1 = new Array(elementCount + 1).fill(0);
  for (var k = elementCount - 1; k >= 0; k--) {
    suffixSumsRow1[k] = suffixSumsRow1[k + 1] + dataMatrix[1][k];
  }

  var maximumSum = 0;

  for (var splitOffset = 0; splitOffset < elementCount; splitOffset++) {
    var currentIterationSum = 0;

    var pivotIndex = elementCount - 1 - splitOffset;

    currentIterationSum = prefixSumsRow0[pivotIndex + 1] + suffixSumsRow1[pivotIndex];

    if (currentIterationSum > maximumSum) {
      maximumSum = currentIterationSum;
    }
  }
  console.log('%d', maximumSum);
}
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
