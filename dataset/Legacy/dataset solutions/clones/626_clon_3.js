var fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');

var contentLines = fileContent.split('\n');
var originalSize = parseInt(contentLines[0], 10);

var baseSequence = [];
for (let i = 0; i < originalSize; i++) {
  baseSequence.push(parseInt(contentLines[i + 1], 10));
}

var cyclicData = baseSequence.concat(baseSequence, baseSequence);

const addNumbers = (accumulator, currentValue) => accumulator + currentValue;

const calculateArraySum = (arr) => arr.reduce(addNumbers, 0);

var overallMaxSum = 0;
var currentMinPartitionSum = 0;
var currentSegmentASum = 0;

for (let lenA = 1; lenA < originalSize - 2; lenA++) {
  for (let startIdx = 0; startIdx < originalSize; startIdx++) {
    const segmentA = cyclicData.slice(startIdx, startIdx + lenA);
    currentSegmentASum = calculateArraySum(segmentA);

    const segmentB = cyclicData.slice(startIdx + lenA, startIdx + originalSize);

    for (let splitPoint = 1; splitPoint < segmentB.length; splitPoint++) {
      const segmentB_Part1 = segmentB.slice(0, splitPoint);
      const segmentB_Part2 = segmentB.slice(splitPoint, segmentB.length);

      const sumB_Part1 = calculateArraySum(segmentB_Part1);
      const sumB_Part2 = calculateArraySum(segmentB_Part2);

      currentMinPartitionSum = Math.min(sumB_Part1, sumB_Part2);

      if (currentSegmentASum <= currentMinPartitionSum) {
        overallMaxSum = Math.max(overallMaxSum, currentSegmentASum);
      }
    }
  }
}

console.log(overallMaxSum);
