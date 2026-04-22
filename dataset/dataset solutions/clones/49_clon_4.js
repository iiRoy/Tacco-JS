((sourceData) => {
  const extractNumericList = (textSegment) => textSegment.split(' ').map(Number);

  const determineVector = (terminus, origin) => [
    terminus[0] - origin[0],
    terminus[1] - origin[1],
  ];

  const calculateCrossProduct = (vecOne, vecTwo) =>
    vecOne[0] * vecTwo[1] - vecOne[1] * vecTwo[0];

  const evaluatePointInTriangle = (coordinateSequence) => {
    const pointAlpha = [coordinateSequence[0], coordinateSequence[1]];
    const pointBeta = [coordinateSequence[2], coordinateSequence[3]];
    const pointGamma = [coordinateSequence[4], coordinateSequence[5]];
    const queryPoint = [coordinateSequence[6], coordinateSequence[7]];

    const edgeAB = determineVector(pointBeta, pointAlpha);
    const pointToBeta = determineVector(queryPoint, pointBeta);

    const edgeBC = determineVector(pointGamma, pointBeta);
    const pointToGamma = determineVector(queryPoint, pointGamma);

    const edgeCA = determineVector(pointAlpha, pointGamma);
    const pointToAlpha = determineVector(queryPoint, pointAlpha);

    const orientOne = calculateCrossProduct(edgeAB, pointToBeta);
    const orientTwo = calculateCrossProduct(edgeBC, pointToGamma);
    const orientThree = calculateCrossProduct(edgeCA, pointToAlpha);

    const allArePositive = orientOne > 0 && orientTwo > 0 && orientThree > 0;
    const allAreNegative = orientOne < 0 && orientTwo < 0 && orientThree < 0;

    return (allArePositive || allAreNegative) ? 'YES' : 'NO';
  };

  sourceData
    .trim()
    .split('\n')
    .filter(Boolean)
    .map(extractNumericList)
    .map(evaluatePointInTriangle)
    .forEach(outcome => console.log(outcome));

})(require('fs').readFileSync('/dev/stdin', 'utf8'));