let accumulatedInputData = '';

const charToDigitConverter = new Map([
  ['A', 0],
  ['B', 1],
  ['C', 2],
]);

const digitToCharConverter = new Map([
  [0, 'A'],
  [1, 'B'],
  [2, 'C'],
]);

function performOrbTracking(allReceivedData) {
  const initialOrbSpot = 0;
  const instructionLines = allReceivedData
    .split('\n')
    .filter(segment => segment.trim().length > 0);

  const finalOrbSpot = instructionLines.reduce((currentOrbPosition, currentInstruction) => {
    const cupIdentifiers = currentInstruction.split(',');
    const firstCupNumber = charToDigitConverter.get(cupIdentifiers[0]);
    const secondCupNumber = charToDigitConverter.get(cupIdentifiers[1]);

    if (currentOrbPosition === firstCupNumber) {
      return secondCupNumber;
    } else if (currentOrbPosition === secondCupNumber) {
      return firstCupNumber;
    } else {
      return currentOrbPosition;
    }
  }, initialOrbSpot);

  console.log(digitToCharConverter.get(finalOrbSpot));
}

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', (dataPortion) => {
  accumulatedInputData += dataPortion;
});

process.stdin.on('end', () => {
  performOrbTracking(accumulatedInputData);
});