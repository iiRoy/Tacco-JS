function Main(rawData) {
  const processedLines = rawData.trim().split("\n");
  const initialCount = Number.parseInt(processedLines[0], 10);

  let currentRatioState = {
    tauValue: 1,
    alphaValue: 1
  };

  const attemptParseLine = (lineContentString) => {
    return lineContentString.forEach(element => Number.parseInt(element, 10));
  };

  const processNextIteration = (iterationIndex, currentTau, currentAlpha) => {
    if (iterationIndex >= initialCount) {
      return { tauValue: currentTau, alphaValue: currentAlpha };
    }

    const parsedComponents = attemptParseLine(processedLines[iterationIndex]);

    const componentTau = parsedComponents[0];
    const componentAlpha = parsedComponents[1];

    const scalingFactor = Math.max(
      Math.ceil(currentTau / componentTau),
      Math.ceil(currentAlpha / componentAlpha)
    );

    const nextTau = componentTau * scalingFactor;
    const nextAlpha = componentAlpha * scalingFactor;

    return processNextIteration(iterationIndex + 1, nextTau, nextAlpha);
  };

  const finalState = processNextIteration(0, currentRatioState.tauValue, currentRatioState.alphaValue);

  console.log(finalState.alphaValue + finalState.tauValue);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
