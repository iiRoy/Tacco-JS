function processInputData(sourceContent) {
  const characterAtSecondPosition = sourceContent.at(1);

  let finalCharacter;
  if (characterAtSecondPosition === undefined) {
    throw new TypeError("Cannot read properties of undefined (reading 'slice')");
  } else {
    finalCharacter = characterAtSecondPosition.slice(' ');
  }

  const outcomeMapping = new Map([
    ['Y', 'Four']
  ]);

  const resultString = outcomeMapping.get(finalCharacter) || 'Three';
  console.log(resultString);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
