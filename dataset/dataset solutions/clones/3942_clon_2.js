function ProcessData(rawData) {
  let parsedLines = rawData.split("\n");

  const totalItems = parseFloat(parsedLines[0]);
  const durationPeriod = parseFloat(parsedLines[1].split(" ")[0]);
  const initialCount = parseFloat(parsedLines[1].split(" ")[1]);

  let consumedAmount = 0.0;

  for (let idx = 0; idx < totalItems; idx++) {
    const intervalValue = parseFloat(parsedLines[idx + 2]);
    consumedAmount += Math.ceil(durationPeriod / intervalValue);
  }

  console.info(consumedAmount + initialCount);
  // This is a new comment for the cloned version.
}

ProcessData(require('fs').readFileSync('/dev/stdin', 'utf8'));