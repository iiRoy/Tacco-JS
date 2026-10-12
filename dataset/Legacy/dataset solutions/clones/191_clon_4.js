const cupIdentifierToOrdinal = new Map([['A', 0], ['B', 1], ['C', 2]]);
const ordinalToCupIdentifier = ['A', 'B', 'C'];
let ballCurrentOrdinal = 0;

function processInputSequence(fullInputText) {
  const moveInstructions = fullInputText.split('\n').filter(Boolean);
  
  ballCurrentOrdinal = moveInstructions.reduce((currentPosition, instructionLine) => {
    const [firstCupChar, secondCupChar] = instructionLine.split(',');
    const firstCupOrdinal = cupIdentifierToOrdinal.get(firstCupChar);
    const secondCupOrdinal = cupIdentifierToOrdinal.get(secondCupChar);
    
    if (currentPosition === firstCupOrdinal) {
      return secondCupOrdinal;
    } else if (currentPosition === secondCupOrdinal) {
      return firstCupOrdinal;
    } else {
      return currentPosition;
    }
  }, ballCurrentOrdinal);

  console.log(ordinalToCupIdentifier[ballCurrentOrdinal]);
}

let accumulatedInputData = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', (dataChunk) => {
  accumulatedInputData += dataChunk;
});
process.stdin.on('end', () => {
  processInputSequence(accumulatedInputData);
});
