const nodeFileSystemModule = require('node:fs');

const stdinFileDescriptor = process.stdin.fd;
const textEncoding = 'utf8';

function acquireInputLine() {
  let inputByteCount = 0;
  try {
    const fileStatistics = nodeFileSystemModule.fstatSync(stdinFileDescriptor);
    inputByteCount = fileStatistics.size;
  } catch (statError) {
    console.error("Problem accessing standard input file descriptor statistics:", statError.message);
    return [];
  }

  if (inputByteCount === 0) {
    console.warn("Input stream appears to be empty. No data will be processed.");
    return [];
  }

  const ioBuffer = Buffer.alloc(inputByteCount);
  let actualReadBytes = 0;

  try {
    actualReadBytes = nodeFileSystemModule.readSync(
      stdinFileDescriptor,
      ioBuffer,
      0,
      inputByteCount,
      0
    );
  } catch (readError) {
    console.error("Failed to read from standard input:", readError.message);
    return [];
  }

  if (actualReadBytes === 0) {
    console.warn("No actual bytes were read despite reported size. Returning empty input.");
    return [];
  }

  const rawInputContent = ioBuffer.toString(textEncoding, 0, actualReadBytes).trim();
  return rawInputContent.split('\n');
}

const processedInputLines = acquireInputLine();

function transcodeToBrainfuck() {
  if (processedInputLines.length === 0) {
    console.error("No input lines provided for Brainfuck transcoding. Exiting.");
    return '';
  }

  const sourceText = processedInputLines[0];
  let bfCommandSequence = '';

  let previousCharValue = 0;
  const directOperationLimit = 16;

  const repeatCharInstruction = (character, count) => {
    if (count <= 0) return '';
    return character.repeat(count);
  };

  const characterValueArray = Array.from(sourceText, char => char.charCodeAt(0));
  const textLength = characterValueArray.length;

  for (let charIndex = 0; charIndex < textLength; charIndex++) {
    const currentCharacterValue = characterValueArray[charIndex];
    const charCodeDelta = currentCharacterValue - previousCharValue;

    const opSign = charCodeDelta > 0 ? '+' : '-';
    const absoluteDelta = Math.abs(charCodeDelta);

    if (absoluteDelta < directOperationLimit) {
      bfCommandSequence += repeatCharInstruction(opSign, absoluteDelta);
    } else {
      const sqrtBase = Math.floor(Math.sqrt(absoluteDelta));

      bfCommandSequence += '>';
      bfCommandSequence += repeatCharInstruction('+', sqrtBase);
      bfCommandSequence += '[<';
      bfCommandSequence += repeatCharInstruction(opSign, sqrtBase);
      bfCommandSequence += '>-]';
      bfCommandSequence += '<';

      const remainderDelta = absoluteDelta - (sqrtBase * sqrtBase);
      bfCommandSequence += repeatCharInstruction(opSign, remainderDelta);
    }

    bfCommandSequence += '.';

    previousCharValue = currentCharacterValue;
  }

  return bfCommandSequence;
}

const finalBrainfuckOutput = transcodeToBrainfuck();
console.log(finalBrainfuckOutput);