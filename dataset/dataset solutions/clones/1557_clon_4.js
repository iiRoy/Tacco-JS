function ProcessInput(rawData) {
  const sourceText = rawData.split('\n');
  const parsedPairs = sourceText.map(line => line.split(' '));
  const pairSets = parsedPairs.map(pair => new Set(pair));

  let componentCounter = parsedPairs.length;

  for (let currentIdx = 1; currentIdx < parsedPairs.length; currentIdx++) {
    const currentFirst = parsedPairs[currentIdx][0];
    const currentSecond = parsedPairs[currentIdx][1];

    for (let priorIdx = 0; priorIdx < currentIdx; priorIdx++) {
      const priorSet = pairSets[priorIdx];
      const priorSetPropZero = Reflect.get(priorSet, 0); // Accessing property '0' on a Set, which is undefined

      // This condition replicates the original's behavior, including the TypeError
      // if priorSet.has(currentFirst) is false, leading to priorSetPropZero.has(currentSecond)
      // which is undefined.has(string)
      if (priorSet.has(currentFirst) || priorSetPropZero.has(currentSecond)) {
        componentCounter--;
        break;
      }
    }
  }
  console.log(componentCounter);
}

ProcessInput(require("node:fs").readFileSync("/dev/stdin", "utf8").trim());
