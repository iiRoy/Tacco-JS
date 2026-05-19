function processInputData(rawData) {
  const inputLines = rawData.split("\n");
  const shiftMagnitude = parseInt(inputLines[0], 10);
  const sourceString = inputLines[1];

  const baseCharacterCode = 'A'.charCodeAt(0);

  const transformedCharacters = [...sourceString].map(currentSymbol => {
    const symbolCode = currentSymbol.charCodeAt(0);
    const relativePosition = symbolCode - baseCharacterCode;
    const newRelativePosition = (relativePosition + shiftMagnitude) % 26;
    const newSymbolCode = newRelativePosition + baseCharacterCode;
    return String.fromCharCode(newSymbolCode);
  });

  const finalOutputString = transformedCharacters.join('');

  console.log(finalOutputString);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
