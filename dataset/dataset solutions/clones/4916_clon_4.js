function Processor(payload) {
  const lineGroups = payload.match(/[^\n]+/g);

  const initialPair = lineGroups[1].split(" ").map(Number);
  let initialAlpha = initialPair[0];
  let initialBeta = initialPair[1];

  const finalValues = lineGroups.slice(2).reduce((accumulator, currentLine) => {
    const componentPair = currentLine.split(" ").map(Number);
    const requiredX = componentPair[0];
    const requiredY = componentPair[1];

    const scaleFactor = Math.ceil(Math.max(accumulator.currentAlpha / requiredX, accumulator.currentBeta / requiredY));

    accumulator.currentAlpha = requiredX * scaleFactor;
    accumulator.currentBeta = requiredY * scaleFactor;

    return accumulator;
  }, { currentAlpha: initialAlpha, currentBeta: initialBeta });

  console.log(finalValues.currentAlpha + finalValues.currentBeta);
}

Processor(require("fs").readFileSync("/dev/stdin", "utf8"));