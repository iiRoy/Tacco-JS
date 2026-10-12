const processData = (rawData) => {
  const lines = rawData.trim().split('\n');

  const firstLineParts = lines[0].split(' ').map(Number);
  const numElements = firstLineParts[0];
  const numPairs = firstLineParts[1];

  const heightValues = lines[1].split(' ').map(Number);
  const heights = heightValues;
  heights.unshift(0);

  const isStrongest = Array(numElements + 1).fill(true);
  isStrongest[0] = false;

  const pairStrings = lines.slice(2);

  for (let k = 0; k < pairStrings.length; k++) {
    const currentPairStr = pairStrings[k];
    const indices = currentPairStr.split(' ').map(Number);
    const firstIdx = indices[0];
    const secondIdx = indices[1];

    if (heights[firstIdx] >= heights[secondIdx]) {
      isStrongest[secondIdx] = false;
    }
    if (heights[firstIdx] <= heights[secondIdx]) {
      isStrongest[firstIdx] = false;
    }
  }

  const strongestCount = isStrongest.slice(1).filter(status => status === true).length;

  return console.log(strongestCount);
};

process.env.MYTEST
  ? (process.env.MYTEST === 'test' ? test() : processData(require('fs').readFileSync('dev/stdin', 'utf8')))
  : processData(require('fs').readFileSync('/dev/stdin', 'utf8'));
