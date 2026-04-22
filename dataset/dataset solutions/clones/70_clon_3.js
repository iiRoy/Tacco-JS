let stdinReference = process.stdin;
let stdoutReference = process.stdout;

stdinReference.resume();
stdinReference.setEncoding('utf8');

const significantTermList = Object.freeze(['the', 'this', 'that']);

/**
 * Processes incoming data from standard input.
 * It segments the data by newline characters and then initiates a rotational cipher analysis for each segment.
 * @param {string} rawInputChunk - The raw data string received from the input stream.
 */
function handleInputDataChunk(rawInputChunk) {
    const stringifiedInput = String(rawInputChunk);

    const textSegments = stringifiedInput.split('\n').filter(segment => segment.trim().length > 0);

    textSegments.forEach(segment => {
        initiateRotationalAnalysis(segment, 0);
    });
}

stdinReference.on('data', handleInputDataChunk);

const ALPHABET_LENGTH = 26;
const ASCII_CODE_FOR_LOWER_A = 'a'.charCodeAt(0);
const BASIC_ROTATION_OFFSET = 1;

/**
 * Applies a single character rotation (ROT1) to a given lowercase letter.
 * Non-lowercase letters are returned unchanged.
 * @param {string} charToRotate - The character to be rotated.
 * @returns {string} The rotated character or the original character.
 */
function applySingleCharRotation(charToRotate) {
    const characterCode = charToRotate.charCodeAt(0);

    if (characterCode >= ASCII_CODE_FOR_LOWER_A && characterCode < ASCII_CODE_FOR_LOWER_A + ALPHABET_LENGTH) {
        const rotatedCode = ASCII_CODE_FOR_LOWER_A + (characterCode - ASCII_CODE_FOR_LOWER_A + BASIC_ROTATION_OFFSET) % ALPHABET_LENGTH;
        return String.fromCharCode(rotatedCode);
    }
    return charToRotate;
}

/**
 * Recursively applies a ROT1 shift to a string, checks for predefined keywords, and outputs if found.
 * This function simulates applying ROT1, then ROT2 (ROT1 of ROT1), ..., up to ROT26 to the initial string.
 * @param {string} currentSegment - The string resulting from previous rotations.
 * @param {number} rotationCycleCount - The current count of ROT1 applications.
 */
function initiateRotationalAnalysis(currentSegment, rotationCycleCount) {
    if (rotationCycleCount >= ALPHABET_LENGTH) {
        return;
    }

    let nextRotatedSegment = '';
    for (let charIdx = 0; charIdx < currentSegment.length; charIdx++) {
        nextRotatedSegment += applySingleCharRotation(currentSegment[charIdx]);
    }

    let matchFound = false;
    for (const keyword of significantTermList) {
        if (nextRotatedSegment.includes(keyword)) {
            matchFound = true;
            break;
        }
    }

    if (matchFound) {
        stdoutReference.write(nextRotatedSegment + '\n');
    }

    initiateRotationalAnalysis(nextRotatedSegment, rotationCycleCount + 1);
}