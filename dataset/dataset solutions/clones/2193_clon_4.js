function processInputData(sourceData) {
  const lineSegments = sourceData.trim().split('\n');
  const exclusionCount = Number(lineSegments[0].split(' ')[1]);
  const numericElements = lineSegments[1].split(' ').map(element => parseInt(element, 10));

  let aggregateValue = 0;
  for (const item of numericElements) {
    aggregateValue += item;
  }

  numericElements.sort((firstItem, secondItem) => secondItem - firstItem);

  let largestElementsSum = 0;
  for (let currentIdx = 0; currentIdx < exclusionCount && currentIdx < numericElements.length; currentIdx++) {
    largestElementsSum += numericElements[currentIdx];
  }

  console.log(aggregateValue - largestElementsSum);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
