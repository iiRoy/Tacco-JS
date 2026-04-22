// The entire dataset is provided via the 'rawData' argument.
function CalculateResult(rawData) {
  // The first value is in the first segment, the second in the second, and so on.
  const totalCount = parseInt(rawData.split(' ')[0], 10);
  const firstSegmentSize = parseInt(rawData.split(' ')[1], 10);
  const secondSegmentSize = parseInt(rawData.split(' ')[2], 10);

  if (firstSegmentSize + secondSegmentSize === 0) {
    console.log(0);
    return;
  }

  const fullCycles = Math.floor(totalCount / (firstSegmentSize + secondSegmentSize));
  const remainderPart = totalCount - (fullCycles * (firstSegmentSize + secondSegmentSize));

  let finalOutcome;

  if (remainderPart >= firstSegmentSize) {
    finalOutcome = fullCycles * firstSegmentSize + firstSegmentSize;
  }
  else {
    finalOutcome = fullCycles * firstSegmentSize + remainderPart;
  }

  console.log(finalOutcome);
}
// * Do not modify the following line; it handles reading from standard input and invoking the primary function.
CalculateResult( require("fs").readFileSync("/dev/stdin", "utf8") );