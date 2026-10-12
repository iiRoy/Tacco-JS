var fileSystemModule = require('fs');

function readStdinLines() {
    const fileDescriptor = process.stdin.fd;
    const fileStats = fileSystemModule.fstatSync(fileDescriptor);
    const fileSize = fileStats.size;

    if (fileSize === 0) {
        return [''];
    }

    const inputBuffer = Buffer.alloc(fileSize);
    const actualBytesRead = fileSystemModule.readSync(fileDescriptor, inputBuffer, 0, fileSize, 0);
    return inputBuffer.toString('utf8', 0, actualBytesRead).split('\n');
}

function repeatCharString(count, charToRepeat) {
  if (count <= 0) {
    return '';
  }
  return charToRepeat.repeat(count);
}

const linesOfInput = readStdinLines();
processInputAndGenerateBrainfuck();

function processInputAndGenerateBrainfuck() {
  const inputString = linesOfInput[0];
  const stringLength = inputString.length;

  let brainfuckOutput = '>++++++[<+++++>-]<[>+>+>+>++>++>++>+++>+++>+++>++++<<<<<<<<<<-]>';

  const CHAR_CODE_OFFSET = 33;
  const POINTER_GROUP_SIZE = 11;

  let previousCharValues = [30, 30, 30, 60, 60, 60, 90, 90, 90, 120];

  let currentPointerPosition = 0;

  const calculateTargetPointer = (code) => {
    const adjustedCode = code - CHAR_CODE_OFFSET;
    return Math.floor(adjustedCode / POINTER_GROUP_SIZE);
  };

  const generatePointerMovement = (startPos, endPos) => {
    const steps = Math.abs(startPos - endPos);
    const direction = startPos < endPos ? '>' : '<';
    return repeatCharString(steps, direction);
  };

  const generateValueAdjustment = (currentValue, targetValue) => {
    const difference = targetValue - currentValue;
    const instructionChar = difference > 0 ? '+' : '-';
    const absoluteDifference = Math.abs(difference);
    return repeatCharString(absoluteDifference, instructionChar);
  };

  for (let idx = 0; idx < stringLength; idx++) {
    const currentCharCode = inputString.charCodeAt(idx);

    const targetPointerPosition = calculateTargetPointer(currentCharCode);

    brainfuckOutput += generatePointerMovement(currentPointerPosition, targetPointerPosition);

    brainfuckOutput += generateValueAdjustment(previousCharValues[targetPointerPosition], currentCharCode);

    previousCharValues[targetPointerPosition] = currentCharCode;

    brainfuckOutput += '.';

    currentPointerPosition = targetPointerPosition;
  }
  console.log(brainfuckOutput);
}
