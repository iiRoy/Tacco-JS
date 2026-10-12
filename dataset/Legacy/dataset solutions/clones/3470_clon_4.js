function processInput(rawContent) {
  const lineSegments = rawContent.split("\n");
  const numericParameters = lineSegments[0].split(' ').map(Number);
  const initialValueX = numericParameters[0];
  const initialValueY = numericParameters[1];
  const totalIterations = numericParameters[2];

  const computeFinalState = (remainingSteps, currentX, currentY, activePhase) => {
    if (remainingSteps === 0) {
      return [currentX, currentY];
    }

    const phaseOperations = {
      'primary': (val1, val2) => {
        const adjustedVal1 = (val1 % 2 !== 0) ? val1 - 1 : val1;
        const transferQuantity = adjustedVal1 / 2;
        return [val1 - transferQuantity, val2 + transferQuantity, 'secondary'];
      },
      'secondary': (val1, val2) => {
        const adjustedVal2 = (val2 % 2 !== 0) ? val2 - 1 : val2;
        const transferQuantity = adjustedVal2 / 2;
        return [val1 + transferQuantity, val2 - transferQuantity, 'primary'];
      }
    };

    const [nextX, nextY, nextPhase] = phaseOperations[activePhase](currentX, currentY);
    return computeFinalState(remainingSteps - 1, nextX, nextY, nextPhase);
  };

  const [resultX, resultY] = computeFinalState(totalIterations, initialValueX, initialValueY, 'primary');

  console.log(resultX + ' ' + resultY);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
