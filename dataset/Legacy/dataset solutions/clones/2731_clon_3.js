function processInputData(rawDataString) {
  const inputParts = rawDataString.split(' ');

  const [totalCountStr, detectionRadiusStr] = inputParts;

  const totalCount = Number(totalCountStr);
  const detectionRadius = Number(detectionRadiusStr);

  const effectiveCoverageSpan = detectionRadius + detectionRadius + 1;

  const calculatedRawDevices = totalCount / effectiveCoverageSpan;

  const minimumDevicesRequired = Math.ceil(calculatedRawDevices);

  console.log(minimumDevicesRequired);
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
