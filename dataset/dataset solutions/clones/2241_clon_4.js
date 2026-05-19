function retrieveInput() {
  return require("fs").readFileSync("/dev/stdin", "utf8").trim();
}

function displayOutput(content) {
  console.log(content);
}

function reportError(message) {
  console.error(message);
}

function parseSpaceSeparatedNumbers(textData) {
  return textData.split(" ").map(Number);
}

function processSequenceGeneration(rawInput) {
  const numericParameters = parseSpaceSeparatedNumbers(rawInput);

  const totalElements = numericParameters[0];
  const splitPoint = numericParameters[1];
  const fillValue = numericParameters[2];

  const generatedSequence = Array.from({ length: totalElements }, (_, currentIndex) =>
    currentIndex < splitPoint ? fillValue : 1
  );

  displayOutput(generatedSequence.join(" "));
}

processSequenceGeneration(retrieveInput());
