function processInput(rawInput) {
  const lineSegments = rawInput.split('\n');
  const elementCount = parseInt(lineSegments[0], 10);
  const weightValues = lineSegments[1].split(' ').map((val) => parseInt(val, 10));

  const totalWeight = weightValues.reduce((accumulator, currentVal) => accumulator + currentVal, 0);

  const cumulativeSums = new Array(elementCount + 1).fill(0);
  for (let i = 0; i < elementCount; i++) {
    cumulativeSums[i + 1] = cumulativeSums[i] + weightValues[i];
  }

  const absoluteDifferences = [];

  for (let splitPoint = 1; splitPoint < elementCount; splitPoint++) {
    const leftPartitionSum = cumulativeSums[splitPoint];
    const rightPartitionSum = totalWeight - leftPartitionSum;
    absoluteDifferences.push(Math.abs(leftPartitionSum - rightPartitionSum));
  }

  console.log(Math.min(...absoluteDifferences));
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
