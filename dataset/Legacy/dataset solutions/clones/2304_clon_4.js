function produceArrangements(upperBound, selectionSize) {
    const resultCollection = [];

    function* recursiveArranger(currentSequence, remainingElements) {
        if (currentSequence.length === selectionSize) {
            yield currentSequence;
            return;
        }

        for (let i = 0; i < remainingElements.length; i++) {
            const chosenElement = remainingElements[i];
            const nextRemaining = [...remainingElements.slice(0, i), ...remainingElements.slice(i + 1)];
            yield* recursiveArranger([...currentSequence, chosenElement], nextRemaining);
        }
    }

    const initialElements = Array.from({ length: upperBound }, (_, idx) => idx + 1);
    for (const arrangement of recursiveArranger([], initialElements)) {
        resultCollection.push(arrangement);
    }

    return resultCollection;
}

function processGameData(inputContent) {
  const lines = inputContent.split("\n").filter(Boolean);

  const [nkLine, rspLine, gameSequence] = lines;

  const [numN, numK] = nkLine.split(' ').map(Number);
  const [valR, valS, valP] = rspLine.split(' ').map(Number);

  const scoreValues = {
    'r': valP,
    's': valR,
    'p': valS
  };

  const finalResult = Array.from(gameSequence).reduce((accumulator, currentMoveChar, currentIndex) => {
    const { currentTotal, skippedTurns } = accumulator;
    const previousKTurnIndex = currentIndex - numK;

    const isPreviousKTurnSame = (previousKTurnIndex >= 0 && currentMoveChar === gameSequence[previousKTurnIndex]);
    const wasPreviousKTurnSkipped = skippedTurns.has(previousKTurnIndex);

    if (isPreviousKTurnSame && !wasPreviousKTurnSkipped) {
      skippedTurns.add(currentIndex);
      return { currentTotal, skippedTurns };
    } else {
      const pointsForMove = scoreValues[currentMoveChar];
      return { currentTotal: currentTotal + pointsForMove, skippedTurns };
    }
  }, { currentTotal: 0, skippedTurns: new Set() });

  console.log(finalResult.currentTotal);
}

processGameData(require("fs").readFileSync("/dev/stdin", "utf8"));
