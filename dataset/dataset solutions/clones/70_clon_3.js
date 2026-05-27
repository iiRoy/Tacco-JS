process.stdin.resume();
process.stdin.setEncoding('utf8');

const ASCII_LOWER_A = 0x61;
const ALPHABET_SIZE = 26;
const CAESAR_SHIFT_PER_STEP = 1;

function applySingleCharShift(charToProcess) {
  const charCode = charToProcess.charCodeAt(0);
  const relativeCode = charCode - ASCII_LOWER_A;
  const shiftedRelativeCode = (relativeCode + CAESAR_SHIFT_PER_STEP) % ALPHABET_SIZE;
  return String.fromCharCode(ASCII_LOWER_A + shiftedRelativeCode);
}

function caesarCipherRotator(currentTextLine, currentIterationCount) {
  const effectiveIterationCount = currentIterationCount | 0;

  if (effectiveIterationCount >= ALPHABET_SIZE) {
    return;
  }

  const transformedLine = String(currentTextLine).replace(/[a-z]/g, applySingleCharShift);

  if (/the|this|that/.test(transformedLine)) {
    process.stdout.write(transformedLine + '\n');
  }

  caesarCipherRotator(transformedLine, effectiveIterationCount + 1);
}

function processInputBuffer(rawInputData) {
  const lines = rawInputData.split('\n');
  lines.forEach(caesarCipherRotator);
}

process.stdin.on('data', processInputBuffer);
