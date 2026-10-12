const processInput = (rawText) => {
  const lineSegments = rawText.split('\n');
  const characterCountLimit = Number(lineSegments[0]);
  const targetString = lineSegments[1];

  const tally = [...targetString.slice(0, characterCountLimit)].reduce((accumulator, currentSymbol) => {
    if (currentSymbol === '.') {
      accumulator.dots++;
    } else if (currentSymbol === '#') {
      accumulator.octothorpes++;
    }
    return accumulator;
  }, { dots: 0, octothorpes: 0 });

  console.log(Math.min(tally.dots, tally.octothorpes));
};

processInput(require("fs").readFileSync("/dev/stdin", "UTF-8"));
