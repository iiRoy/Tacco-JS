var findValueInSortedArray = function(targetVal, arraySize, dataArr) {
  var lowIdx = 0;
  var highIdx = arraySize;

  while (lowIdx < highIdx) {
    var sumIndices = lowIdx + highIdx;
    var middleIdx = Math.floor(sumIndices / 2);
    if (dataArr[middleIdx] === targetVal) {
      return true;
    } else if (targetVal < dataArr[middleIdx]) {
      highIdx = middleIdx;
    } else {
      lowIdx = middleIdx + 1;
    }
  }
  return false;
};

(function(inputContent) {
  var trimmedInput = inputContent.trim();
  var inputLines = trimmedInput.split('\n');

  var sourceLine = inputLines[1];
  var targetLine = inputLines[3];

  var sourceNumbers = sourceLine.split(" ").map(Number);
  var targetNumbers = targetLine.split(" ").map(Number);

  var matchCount = 0;
  targetNumbers.forEach(function(currentTarget) {
    if (findValueInSortedArray(currentTarget, sourceNumbers.length, sourceNumbers)) {
      matchCount++;
    }
  });
  console.log(matchCount);
})(require('fs').readFileSync('/dev/stdin', 'utf8'));
