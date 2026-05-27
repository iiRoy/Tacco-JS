function processSequence(inputString) {
  const symbolList = inputString.split('');

  if (symbolList.length < 2) {
    console.log(0);
    return;
  }

  const finalOutcome = symbolList.slice(1).reduce((state, currentSymbol, index) => {
    const priorSymbol = symbolList[index];
    const { tally, isAltered } = state;

    const areSymbolsIdentical = (currentSymbol === priorSymbol);
    const shouldAlter = areSymbolsIdentical !== isAltered;

    return {
      tally: tally + (shouldAlter ? 1 : 0),
      isAltered: shouldAlter
    };
  }, { tally: 0, isAltered: false });

  console.log(finalOutcome.tally);
}

processSequence(require("fs").readFileSync("/dev/stdin","utf-8"));
