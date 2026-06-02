function processInput(inputString) {
  const characterSequence = inputString.split('');

  const segmentChangeCount = characterSequence.reduce((accumulator, currentSymbol, position, fullSequence) => {
    return accumulator + (position > 0 && currentSymbol !== fullSequence[position - 1] ? 1 : 0);
  }, 0);

  console.log(segmentChangeCount);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8").trim());
