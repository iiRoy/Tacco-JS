function processInput(sourceData) {
  const inputString = sourceData;
  const outputCharacter = 'x';
  const requiredLength = inputString.length;

  const generatedSequence = Array(requiredLength + 1).join(outputCharacter);

  console.log(generatedSequence);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
