function processInputData(sourceText) {
  const parsedElements = sourceText.split('\n').map(Number);
  const loopCount = parsedElements[0];
  const constantAdder = parsedElements[1];

  const initialMagnitude = 1;

  const finalMagnitude = performComputation(loopCount, initialMagnitude, constantAdder);

  console.log(finalMagnitude);
}

function performComputation(remainingIterations, currentMagnitude, constantAdder) {
  if (remainingIterations === 0) {
    return currentMagnitude;
  }

  let nextMagnitude;
  if (currentMagnitude <= constantAdder) {
    nextMagnitude = currentMagnitude << 1;
  } else {
    nextMagnitude = currentMagnitude + constantAdder;
  }

  return performComputation(remainingIterations - 1, nextMagnitude, constantAdder);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));