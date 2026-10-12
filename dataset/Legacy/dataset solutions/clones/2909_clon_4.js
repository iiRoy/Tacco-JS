function processInputData(rawData) {
  const allLines = rawData.split('\n').filter(Boolean);

  const systemParameters = allLines[0].split(' ').map(Number);
  const totalSwitches = systemParameters[0];
  const totalLamps = systemParameters[1];

  const targetParities = allLines[allLines.length - 1].split(' ').map(Number);

  const lampConfigurations = allLines.slice(1, allLines.length - 1).map(line => line.split(' ').map(Number));

  const calculateLampParity = (configArray, currentSwitchState) => {
    const connectedSwitchIndices = configArray.slice(1);
    
    const activeConnections = connectedSwitchIndices.filter(switchIndex => {
      return (currentSwitchState >> switchIndex) & 1;
    }).length;

    return activeConnections % 2;
  };

  let successfulCombinations = 0;

  Array.from({ length: 1 << totalSwitches }, (_, switchStateIndex) => switchStateIndex)
    .forEach(currentSwitchState => {
      const computedParities = lampConfigurations.map(config =>
        calculateLampParity(config, currentSwitchState)
      );

      const areParitiesIdentical = computedParities.every((parityValue, index) =>
        parityValue === targetParities[index]
      );

      if (areParitiesIdentical) {
        successfulCombinations++;
      }
    });

  console.log(successfulCombinations);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
