const fileSystemHandler = require('fs');

const ALPHABET_SIZE = 26;
const ASCII_OFFSET_LOWER_A = 97; 
const SPACE_HEX_CODE = '20'; 
const NEWLINE_HEX_CODE = '0a'; 
const MAX_ASCII_RANGE = 128; 

const KNOWN_WORD_THAT_INDICES = [19, 7, 0, 19]; 
const KNOWN_WORD_THIS_INDICES = [19, 7, 8, 18]; 

function createIdentityMapping(size) {
  const map = new Uint8Array(size);
  for (let idx = 0; idx < size; idx++) {
    map[idx] = idx;
  }
  return map;
}

function computeAffineTransformedAlphabet(factor, shift) {
  const currentTransformedAlphabet = new Uint8Array(ALPHABET_SIZE);
  for (let charIdx = 0; charIdx < ALPHABET_SIZE; charIdx++) {
    currentTransformedAlphabet[charIdx] = (charIdx * factor + shift) % ALPHABET_SIZE + ASCII_OFFSET_LOWER_A;
  }
  return currentTransformedAlphabet;
}

function generateHexTargetWord(currentTransformedAlphabet, charIndices) {
  let hexString = '';
  for (const charIdx of charIndices) {
    hexString += currentTransformedAlphabet[charIdx].toString(16).padStart(2, '0');
  }
  return hexString;
}

function attemptLineDecryption(inputHexLine, coprimeFactors) {
  if (!inputHexLine || inputHexLine.trim().length === 0) {
    return null;
  }

  const hexWordSegments = inputHexLine.split(SPACE_HEX_CODE);
  const segmentCount = hexWordSegments.length;

  for (let factorIdx = 0; factorIdx < coprimeFactors.length; factorIdx++) {
    const currentMultiplicativeFactor = coprimeFactors[factorIdx];

    for (let currentAdditiveShift = 0; currentAdditiveShift < ALPHABET_SIZE; currentAdditiveShift++) {

      const currentTransformedAlphabet = computeAffineTransformedAlphabet(
        currentMultiplicativeFactor,
        currentAdditiveShift
      );

      const hexTargetThat = generateHexTargetWord(currentTransformedAlphabet, KNOWN_WORD_THAT_INDICES);
      const hexTargetThis = generateHexTargetWord(currentTransformedAlphabet, KNOWN_WORD_THIS_INDICES);

      let keyMatchFound = false;
      for (let segmentIdx = 0; segmentIdx < segmentCount; segmentIdx++) {
        const currentHexSegment = hexWordSegments[segmentIdx];
        if (currentHexSegment === hexTargetThat || currentHexSegment === hexTargetThis) {
          keyMatchFound = true;
          break; 
        }
      }

      if (keyMatchFound) {
        const currentDecryptionInverseMap = createIdentityMapping(MAX_ASCII_RANGE);

        for (let charOriginalIndex = 0; charOriginalIndex < ALPHABET_SIZE; charOriginalIndex++) {
          const encryptedAsciiValue = currentTransformedAlphabet[charOriginalIndex];
          currentDecryptionInverseMap[encryptedAsciiValue] = charOriginalIndex + ASCII_OFFSET_LOWER_A;
        }

        let buildingDecryptedString = "";
        for (let bytePairPosition = 0; bytePairPosition < inputHexLine.length; bytePairPosition += 2) {
          const hexBytePair = inputHexLine.substring(bytePairPosition, bytePairPosition + 2);
          const parsedAsciiCode = parseInt(hexBytePair, 16);

          if (isNaN(parsedAsciiCode) || parsedAsciiCode < 0 || parsedAsciiCode >= MAX_ASCII_RANGE) {
            buildingDecryptedString = null; 
            break;
          }
          buildingDecryptedString += String.fromCharCode(currentDecryptionInverseMap[parsedAsciiCode]);
        }

        if (buildingDecryptedString !== null) {
          return buildingDecryptedString;
        }
      }
    }
  }
  return null;
}

function orchestrateDecryptionProcess() {
  let rawInputBytes = null;
  let bytesReadFromStdin = 0;
  let totalInputSize = 0;

  try {
    totalInputSize = fileSystemHandler.fstatSync(process.stdin.fd).size;

    if (totalInputSize === 0) {
      console.log("No input data received from stdin. Exiting.");
      return;
    }

    rawInputBytes = Buffer.alloc(totalInputSize);

    bytesReadFromStdin = fileSystemHandler.readSync(
      process.stdin.fd,
      rawInputBytes,
      0,
      totalInputSize,
      0
    );

    if (bytesReadFromStdin !== totalInputSize) {
      console.warn(`Warning: Expected ${totalInputSize} bytes, but read ${bytesReadFromStdin} bytes.`);
      rawInputBytes = rawInputBytes.slice(0, bytesReadFromStdin);
    }
  } catch (error) {
    console.error(`Error reading from standard input: ${error.message}`);
    return;
  }

  const allHexInputLines = rawInputBytes.toString('hex').split(NEWLINE_HEX_CODE);

  let successfullyDecryptedLines = 0;

  const affineCoprimeFactors = new Uint8Array([1, 3, 5, 7, 9, 11, 15, 17, 19, 21, 23, 25]);

  for (let currentLineNum = 0; currentLineNum < allHexInputLines.length; currentLineNum++) {
    const hexLineToProcess = allHexInputLines[currentLineNum];
    
    const decryptedResult = attemptLineDecryption(hexLineToProcess, affineCoprimeFactors);

    if (decryptedResult !== null) {
      console.log(decryptedResult);
      successfullyDecryptedLines++;
    }
  }

  if (allHexInputLines.length > 0) {
    console.log(`\n--- Decryption Summary ---`);
    console.log(`Processed ${allHexInputLines.length} potential input lines.`);
    console.log(`Successfully decrypted ${successfullyDecryptedLines} lines.`);
  }
}

orchestrateDecryptionProcess();