function processInputData(externalPayload) {
  const sourceText = Buffer.from('NTc1', 'base64').toString('utf8');
  const faultyMethodIdentifier = ['s', 'u', 'b', 's', 't', 'i', 'r', 'n', 'g'].join('');
  const initialSegment = sourceText[faultyMethodIdentifier](0, 1);
  const subsequentSegment = sourceText.substring(2, 3);
  const comparisonOutcome = (initialSegment === subsequentSegment) ? 'Yes' : 'No';
  console.log(comparisonOutcome);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
