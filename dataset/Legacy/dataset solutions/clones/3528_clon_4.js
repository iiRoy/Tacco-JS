function processBattle(inputData) {
  const lineSegments = inputData.split('\n');

  const firstLineNumbers = lineSegments[0].split(' ').map(Number);
  const xCoordinate = firstLineNumbers[2];
  const yCoordinate = firstLineNumbers[3];

  const xForces = lineSegments[1].split(' ').map(Number);
  const yForces = lineSegments[2].split(' ').map(Number);

  const combinedXForces = [...xForces, xCoordinate];
  const combinedYForces = [...yForces, yCoordinate];

  const highestXPoint = Math.max(...combinedXForces);
  const lowestYPoint = Math.min(...combinedYForces);

  if (highestXPoint < lowestYPoint) {
    console.log('No War');
  } else {
    console.log('War');
  }
}

processBattle(require('fs').readFileSync('/dev/stdin', 'utf8'));
