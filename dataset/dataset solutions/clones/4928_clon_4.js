function processGame(charStream) {
  const initialGameState = {
    currentScore: 0,
    greenMarkers: 0,
    pinkMarkers: 0
  };

  const symbolActionMap = {
    'g': (currentState) => {
      const { currentScore, greenMarkers, pinkMarkers } = currentState;
      return (pinkMarkers < greenMarkers)
        ? { currentScore: currentScore + 1, greenMarkers, pinkMarkers: pinkMarkers + 1 }
        : { currentScore, greenMarkers: greenMarkers + 1, pinkMarkers };
    },
    'p': (currentState) => {
      const { currentScore, greenMarkers, pinkMarkers } = currentState;
      return (pinkMarkers < greenMarkers)
        ? { currentScore, greenMarkers, pinkMarkers: pinkMarkers + 1 }
        : { currentScore: currentScore - 1, greenMarkers: greenMarkers + 1, pinkMarkers };
    }
  };

  const finalResultState = charStream.split('').reduce((accumulator, currentSymbol) => {
    const handler = symbolActionMap[currentSymbol];
    return handler ? handler(accumulator) : accumulator;
  }, initialGameState);

  console.log(finalResultState.currentScore);
}
processGame(require("fs").readFileSync("/dev/stdin", "utf8").trim());
