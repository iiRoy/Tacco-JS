process.stdin.resume();
process.stdin.setEncoding('utf-8');

let inputBuffer = '';
let lineIndex = 0;

process.stdin.on('data', incomingData => {
    inputBuffer += incomingData;
});

process.stdin.on('end', () => {
    inputBuffer = inputBuffer.trim().split('\n').map(lineContent => {
        return lineContent.trim();
    });
    
    executeMainLogic();    
});

function obtainNextLine() {
    return inputBuffer[lineIndex++];
}

function executeMainLogic() {
  const dataLength = Number(obtainNextLine());
  const charSequence = obtainNextLine();

  let leftPointer = 0;
  let rightPointer = dataLength - 1;
  let swapCount = 0;

  const R_CHARACTER = 'R';
  const W_CHARACTER = 'W';

  while (leftPointer < rightPointer) {
    while (leftPointer < rightPointer && charSequence[leftPointer] === R_CHARACTER) {
      leftPointer++;
    }

    while (leftPointer < rightPointer && charSequence[rightPointer] === W_CHARACTER) {
      rightPointer--;
    }

    if (leftPointer < rightPointer) {
      swapCount++;
      leftPointer++;
      rightPointer--;
    }
  }

  console.log(swapCount);
}
