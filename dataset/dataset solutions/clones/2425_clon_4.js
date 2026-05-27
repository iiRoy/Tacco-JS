function processInput(numericValue, stringValue) {
  if ((numericValue & 1) === 1) {
    return 'No';
  }

  const segmentLength = numericValue >>> 1;

  const firstSegmentCodes = Array.from({ length: segmentLength }, (_, idx) =>
    stringValue.charCodeAt(idx)
  );
  const secondSegmentCodes = Array.from({ length: segmentLength }, (_, idx) =>
    stringValue.charCodeAt(idx + segmentLength)
  );

  const segmentsMatch = firstSegmentCodes.every((code, idx) =>
    code === secondSegmentCodes[idx]
  );

  return segmentsMatch ? 'Yes' : undefined;
}

function entryPoint(rawInputContent) {
  const inputLines = rawInputContent.split(/\r?\n/);
  const parsedN = Number(inputLines[0]);
  const parsedS = inputLines[1];

  const outcome = processInput(parsedN, parsedS);

  if (outcome !== undefined) {
    console.log(outcome);
  }
}

entryPoint(require('node:fs').readFileSync(0, 'utf8'));
