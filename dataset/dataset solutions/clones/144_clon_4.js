const calculateCrossProduct = (componentX1, componentY1, componentX2, componentY2) => {
  return componentX1 * componentY2 - componentX2 * componentY1;
};

function determineConvexity(pointAx, pointAy, pointBx, pointBy, pointCx, pointCy, pointDx, pointDy) {
  const vectorAB_x = pointBx - pointAx;
  const vectorAB_y = pointBy - pointAy;

  const vectorBC_x = pointCx - pointBx;
  const vectorBC_y = pointCy - pointBy;

  const vectorCD_x = pointDx - pointCx;
  const vectorCD_y = pointDy - pointCy;

  const vectorDA_x = pointAx - pointDx;
  const vectorDA_y = pointAy - pointDy;

  const crossProduct1 = calculateCrossProduct(vectorAB_x, vectorAB_y, vectorBC_x, vectorBC_y);
  const crossProduct2 = calculateCrossProduct(vectorBC_x, vectorBC_y, vectorCD_x, vectorCD_y);
  const crossProduct3 = calculateCrossProduct(vectorCD_x, vectorCD_y, vectorDA_x, vectorDA_y);
  const crossProduct4 = calculateCrossProduct(vectorDA_x, vectorDA_y, vectorAB_x, vectorAB_y);

  const allPositiveTurns = crossProduct1 > 0 && crossProduct2 > 0 && crossProduct3 > 0 && crossProduct4 > 0;
  const allNegativeTurns = crossProduct1 < 0 && crossProduct2 < 0 && crossProduct3 < 0 && crossProduct4 < 0;

  if (allPositiveTurns || allNegativeTurns) {
    return 'YES';
  }
  return 'NO';
}

(function(inputContent) {
  const dataLines = inputContent.replace(/\n$/, '').split('\n');

  const processedResults = dataLines.map(currentLine => {
    const numericCoordinates = currentLine.split(',').map(Number);
    return determineConvexity(...numericCoordinates);
  });

  processedResults.forEach(outputValue => {
    console.log(outputValue);
  });

})(require('fs').readFileSync('/dev/stdin', 'utf8'));
