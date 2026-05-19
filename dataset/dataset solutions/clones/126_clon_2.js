let segmentCounter = 0;
let currentDataPiece;
let outputAccumulator;

for (
  segmentCounter = 0;
  (currentDataPiece = require("fs").readFileSync("/dev/stdin", "utf8").split(/\s/)[segmentCounter++]);
  console.log(outputAccumulator.trim())
) {
  outputAccumulator = '';
  for (
    let bitIndex = 0;
    10 - bitIndex;
    bitIndex++
  ) {
    const bitValue = 1 << bitIndex;
    (bitValue & currentDataPiece) ? (outputAccumulator += bitValue + ' ') : 0;
  }
}
