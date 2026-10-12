(function(rawData) {
  const processCircleData = (c1x, c1y, r1, c2x, c2y, r2) => {
    const deltaX = c2x - c1x;
    const deltaY = c2y - c1y;
    const centerDistance = Math.hypot(deltaX, deltaY);

    const sumOfRadii = r1 + r2;
    const absoluteRadiusDifference = Math.abs(r1 - r2);

    if (centerDistance > sumOfRadii) {
      return 0;
    } else if (centerDistance < absoluteRadiusDifference) {
      return (r1 > r2) ? 2 : -2;
    } else {
      return 1;
    }
  };

  const inputLines = rawData.split('\n').filter(Boolean);
  const numberOfCases = Number(inputLines[0]);

  inputLines.slice(1, numberOfCases + 1)
    .map(lineContent => {
      const [c1x, c1y, r1, c2x, c2y, r2] = lineContent.split(' ').map(Number);
      return processCircleData(c1x, c1y, r1, c2x, c2y, r2);
    })
    .forEach(computedResult => console.log(computedResult));

})(require('fs').readFileSync('/dev/stdin', 'utf8'));
