const processInputAndDecide = (inputLine) => {
  const [distanceStr, timeStr, speedStr] = inputLine.trim().split(' ');

  const distanceValue = Number(distanceStr);
  const timeValue = Number(timeStr);
  const speedValue = Number(speedStr);

  const isFeasible = (timeValue === 0)
    ? (distanceValue === 0)
    : (distanceValue / timeValue) <= speedValue;

  return isFeasible ? 'YES' : 'NO';
};

const entryPoint = (sourceData) => {
  console.log(processInputAndDecide(sourceData));
};

entryPoint(require('fs').readFileSync('/dev/stdin', 'utf8'));
