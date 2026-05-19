function processJwellOperations(rawData) {
  const lineSegments = rawData.split("\n");
  lineSegments.pop();
  const configValues = lineSegments[0].split(" ");
  const initialJwellCount = parseInt(configValues[0]);
  const totalOperations = parseInt(configValues[1]);
  const startingJwells = lineSegments[1].split(" ").map(str => parseInt(str));

  let peakValue = 0;

  const operationHandlers = {
    0: (currentConfig) => {
      if (currentConfig[0].length === 0) return [];
      const nextSource = currentConfig[0].slice();
      const nextDestination = currentConfig[1].slice();
      nextDestination.push(nextSource.shift());
      return [[nextSource, nextDestination]];
    },
    1: (currentConfig) => {
      if (currentConfig[0].length === 0) return [];
      const nextSource = currentConfig[0].slice();
      const nextDestination = currentConfig[1].slice();
      nextDestination.push(nextSource.pop());
      return [[nextSource, nextDestination]];
    },
    2: (currentConfig) => {
      if (currentConfig[1].length === 0) return [];
      const generatedConfigs = [];
      for (let itemIndex = 0; itemIndex < currentConfig[1].length; itemIndex++) {
        const nextSource = currentConfig[0].slice();
        const nextDestination = currentConfig[1].slice();
        nextSource.unshift(nextDestination.splice(itemIndex, 1)[0]);
        generatedConfigs.push([nextSource, nextDestination]);
      }
      return generatedConfigs;
    },
    3: (currentConfig) => {
      if (currentConfig[1].length === 0) return [];
      const generatedConfigs = [];
      for (let itemIndex = 0; itemIndex < currentConfig[1].length; itemIndex++) {
        const nextSource = currentConfig[0].slice();
        const nextDestination = currentConfig[1].slice();
        nextSource.push(nextDestination.splice(itemIndex, 1)[0]);
        generatedConfigs.push([nextSource, nextDestination]);
      }
      return generatedConfigs;
    }
  };

  const processingQueue = [];

  processingQueue.push([[startingJwells.slice(), []], 0]);

  while (processingQueue.length > 0) {
    const [currentConfig, currentOperationStep] = processingQueue.shift();

    if (currentOperationStep === totalOperations) {
      continue;
    }

    for (let opType = 0; opType < 4; opType++) {
      const nextConfigurations = operationHandlers[opType](currentConfig);

      for (const nextConfig of nextConfigurations) {
        const currentSumOfDestination = nextConfig[1].reduce((accumulator, value) => accumulator + value, 0);
        if (currentSumOfDestination > peakValue) {
          peakValue = currentSumOfDestination;
        }

        processingQueue.push([nextConfig, currentOperationStep + 1]);
      }
    }
  }

  console.log(peakValue);
}

processJwellOperations(require("fs").readFileSync("/dev/stdin", "utf8"));
