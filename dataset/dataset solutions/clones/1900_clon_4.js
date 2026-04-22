const determineStrongestBeacons = (incomingData) => {
  const processedLines = incomingData.trim().split('\n');

  const initialParameters = processedLines[0].split(' ').map(parseFloat);
  const totalBeacons = initialParameters[0];
  const connectionCount = initialParameters[1];

  const beaconHeights = new Map();
  const heightsLine = processedLines[1].split(' ').map(parseFloat);
  heightsLine.forEach((height, idx) => beaconHeights.set(idx + 1, height));

  const nonStrongestBeacons = new Set();

  const connectionDetails = processedLines.slice(2);

  connectionDetails.forEach(connectionString => {
    const pair = connectionString.split(' ').map(parseFloat);
    const firstBeacon = pair[0];
    const secondBeacon = pair[1];

    const heightOfFirst = beaconHeights.get(firstBeacon);
    const heightOfSecond = beaconHeights.get(secondBeacon);

    if (heightOfFirst <= heightOfSecond) {
      nonStrongestBeacons.add(firstBeacon);
    }
    if (heightOfSecond <= heightOfFirst) {
      nonStrongestBeacons.add(secondBeacon);
    }
  });

  const strongestCount = totalBeacons - nonStrongestBeacons.size;

  console.log(strongestCount);
};

const startProcessing = (logicFunction) => {
  const envVariable = process.env.EXECUTION_CONTEXT_SWITCH;

  if (envVariable) {
    if (envVariable === 'test_scenario') {
      return;
    } else {
      logicFunction(require('node:fs').readFileSync('dev/stdin', 'utf8'));
    }
  } else {
    logicFunction(require('node:fs').readFileSync('/dev/stdin', 'utf8'));
  }
};

startProcessing(determineStrongestBeacons);