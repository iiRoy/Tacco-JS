(function(rawData) {
  const processedInput = rawData.replace(/\n$/, '');
  let lines = processedInput.split('\n');

  const testCaseCount = Number(lines.shift());

  const calculateDistance = (x1Coord, y1Coord, x2Coord, y2Coord) => {
    const deltaX = x2Coord - x1Coord;
    const deltaY = y2Coord - y1Coord;
    return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  };

  for (let idx = 0; idx < testCaseCount; idx++) {
    const currentCaseParams = lines.shift().split(' ').map(Number);

    const circle1X = currentCaseParams.shift();
    const circle1Y = currentCaseParams.shift();
    const radius1 = currentCaseParams.shift();

    const circle2X = currentCaseParams.shift();
    const circle2Y = currentCaseParams.shift();
    const radius2 = currentCaseParams.shift();

    const distanceBetweenCenters = calculateDistance(circle1X, circle1Y, circle2X, circle2Y);

    const sumOfRadii = radius1 + radius2;
    const diffRadiiCase1 = radius2 - radius1;
    const diffRadiiCase2 = radius1 - radius2;

    if (distanceBetweenCenters <= sumOfRadii) {
      if (distanceBetweenCenters < diffRadiiCase1) {
        console.log(-2);
      } else if (distanceBetweenCenters < diffRadiiCase2) {
        console.log(2);
      } else {
        console.log(1);
      }
    } else {
      console.log(0);
    }
  }
})(require('fs').readFileSync('/dev/stdin', 'utf8'));
