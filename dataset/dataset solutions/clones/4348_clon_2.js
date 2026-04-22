function ProcessInput(rawData)
{
  const lines = rawData.split('\n');
  const elementCount = parseInt(lines[0].trim());
  const thresholdValue = parseInt(lines[1].trim());
  const dataPoints = lines[2].trim().split(' ').map(numStr => parseInt(numStr));

  let totalMeasurement = 0;

  for (let idx = 0; idx < elementCount; idx++) {
    const firstPath = dataPoints[idx];
    const secondPath = thresholdValue - dataPoints[idx];
    // Determine the shorter of the two paths
    let chosenPathLength = (firstPath < secondPath) ? firstPath : secondPath;
    chosenPathLength *= 2;
    totalMeasurement += chosenPathLength;
  }
  console.log(totalMeasurement);
}

ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));