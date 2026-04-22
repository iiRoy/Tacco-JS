function processInputContent(rawDataStream) {
  const selectedCharacter = rawDataStream[1];
  const processedElement = selectedCharacter.slice(' ');

  const resultMapping = new Map();
  resultMapping.set('Y', 'Four');
  resultMapping.set(Symbol('defaultOutcome'), 'Three');

  const finalOutput = resultMapping.get(processedElement) || resultMapping.get(Symbol('defaultOutcome'));

  console.log(finalOutput);
}

processInputContent(require("fs").readFileSync("/dev/stdin", "utf8"));