function processInputData(inputContent) {
  const lines = inputContent.split("\n");

  const parseConfigLine = (lineString) => {
    const parts = lineString.split(' ');
    return {
      totalElements: Number(parts[0]),
      operationCount: Number(parts[1])
    };
  };

  const configuration = parseConfigLine(lines[0]);
  const maxElementId = configuration.totalElements;
  const numberOfOperations = configuration.operationCount;

  const elementPresenceTracker = new Array(maxElementId + 1).fill(false);

  for (let opIteration = 0; opIteration < numberOfOperations; opIteration++) {
    const currentLineIndex = 1 + (opIteration * 2);
    const itemIdentifiers = lines[currentLineIndex].split(' ');

    itemIdentifiers.forEach(idString => {
      const elementId = Number(idString);
      if (elementId >= 1 && elementId <= maxElementId) {
        elementPresenceTracker[elementId] = true;
      }
    });
  }

  const finalMissingCount = elementPresenceTracker.slice(1).reduce((currentCount, isPresentValue) => {
    return isPresentValue ? currentCount : currentCount + 1;
  }, 0);

  console.log(finalMissingCount);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
