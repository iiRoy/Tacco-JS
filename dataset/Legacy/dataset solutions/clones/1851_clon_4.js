function processInputData(inputLines) {
  const limitVal = Number(inputLines[0]);
  const sourceText = inputLines[1];

  let processedOutput;
  if (sourceText.length > limitVal) {
    let prefixChars = [];
    for (let charIndex = 0; charIndex < limitVal; charIndex++) {
      prefixChars.push(sourceText.charAt(charIndex));
    }
    processedOutput = prefixChars.join('') + '...';
  } else {
    processedOutput = sourceText;
  }

  console.log(processedOutput);
}


processInputData( require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n") );


function extractNumbersFromString(inputString) {
  const stringSegments = inputString.split(' ');
  const numericValues = [];
  let segmentCounter = 0;
  while (segmentCounter < stringSegments.length) {
    numericValues.push(parseInt(stringSegments[segmentCounter], 10));
    segmentCounter++;
  }
  return numericValues;
}
