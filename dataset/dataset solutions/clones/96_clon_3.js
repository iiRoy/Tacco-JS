(function(rawData) {
  const squareValue = (val) => val * val;

  const calculateEuclideanDistance = (x1, y1, x2, y2) => Math.sqrt(squareValue(x2 - x1) + squareValue(y2 - y1));

  const inputLines = rawData.replace(/\n$/, '').split('\n');
  const totalTestCases = Number(inputLines.shift());

  for (let currentCaseIndex = 0; currentCaseIndex < totalTestCases; currentCaseIndex++) {
    const caseArguments = inputLines.shift().split(' ').map(Number);

    const circleAX = caseArguments[0];
    const circleAY = caseArguments[1];
    const circleARadius = caseArguments[2];
    const circleBX = caseArguments[3];
    const circleBY = caseArguments[4];
    const circleBRadius = caseArguments[5];

    const centerDistance = calculateEuclideanDistance(circleAX, circleAY, circleBX, circleBY);

    const sumOfRadii = circleARadius + circleBRadius;
    const distPlusRadiusB = centerDistance + circleBRadius;
    const distPlusRadiusA = centerDistance + circleARadius;

    if (circleARadius >= distPlusRadiusB) {
      console.log(2);
    } else if (circleBRadius >= distPlusRadiusA) {
      console.log(-2);
    } else if (centerDistance <= sumOfRadii) {
      console.log(1);
    } else {
      console.log(0);
    }
  }
})(require('fs').readFileSync('/dev/stdin', 'utf8'));
