function processInputData(rawData) {
  const parsedLines = rawData.trim().split('\n');
  const stringLength = Number(parsedLines[0]);
  const charSequence = parsedLines[1].split('');

  if (stringLength === 0) {
    console.log(-1);
    return;
  }

  const uniqueBlockStarters = charSequence.slice(1).reduce((accumulator, currentCharacter) => {
    if (currentCharacter !== accumulator[accumulator.length - 1]) {
      accumulator.push(currentCharacter);
    }
    return accumulator;
  }, [charSequence[0]]);

  console.log(uniqueBlockStarters.length);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
