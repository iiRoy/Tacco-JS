var fileSystem = require('fs');
var dataLength = fileSystem.fstatSync(process.stdin.fd).size;
var inputBuffer = Buffer.alloc(dataLength);
var readBytesCount = fileSystem.readSync(process.stdin.fd, inputBuffer, 0, dataLength, 0);
var hexInputLines = inputBuffer.toString('hex', 0, readBytesCount).split('0a');

const ALPHABET_SIZE = 26;
const ASCII_A_CODE = 97;
const INITIAL_TABLE_SIZE = 123;
const HEX_RADIX = 16;
const SPACE_HEX_DELIMITER = '20';
const THAT_WORD_INDICES = [19, 7, 0, 19];
const THIS_WORD_INDICES = [19, 7, 8, 18];

function initializeIdentityTable(tableSize) {
    const table = new Int8Array(tableSize);
    for (let i = tableSize; i--;) {
        table[i] = i;
    }
    return table;
}

function generateAffineCharMap(alpha, beta) {
    const map = new Int8Array(ALPHABET_SIZE);
    for (let charIdx = ALPHABET_SIZE; charIdx--;) {
        map[charIdx] = (charIdx * alpha + beta) % ALPHABET_SIZE + ASCII_A_CODE;
    }
    return map;
}

function getHexRepresentation(charIndices, charMap) {
    let hexString = '';
    for (const index of charIndices) {
        hexString += charMap[index].toString(HEX_RADIX);
    }
    return hexString;
}

function containsKeyword(hexWords, charMap) {
    const thatHex = getHexRepresentation(THAT_WORD_INDICES, charMap);
    const thisHex = getHexRepresentation(THIS_WORD_INDICES, charMap);

    for (let i = hexWords.length; i--;) {
        const currentWordHex = hexWords[i];
        if (currentWordHex === thatHex || currentWordHex === thisHex) {
            return true;
        }
    }
    return false;
}

function createDecryptionTableForAttempt(baseIdentityTable, charMap) {
    const specificTable = new Int8Array(baseIdentityTable);
    for (let charIdx = ALPHABET_SIZE; charIdx--;) {
        const fromCode = charMap[charIdx];
        specificTable[fromCode] = charIdx + ASCII_A_CODE;
    }
    return specificTable;
}

function decryptHexLine(hexLine, decryptionTable) {
    let decryptedOutput = "";
    for (let charPairIdx = 0; charPairIdx < hexLine.length; charPairIdx += 2) {
        const hexChar = hexLine.substring(charPairIdx, charPairIdx + 2);
        const asciiCode = parseInt(hexChar, HEX_RADIX);
        decryptedOutput += String.fromCharCode(decryptionTable[asciiCode]);
    }
    return decryptedOutput;
}

function processCipher(){
  const coprimeFactors = new Int8Array([1, 3, 5, 7, 9, 11, 15, 17, 19, 21, 23, 25]);
  const factorCount = coprimeFactors.length;

  const baseIdentityDecryptionTable = initializeIdentityTable(INITIAL_TABLE_SIZE);

  for(let lineIndex = 1; lineIndex < hexInputLines.length - 1; lineIndex++){
    const currentLineHex = hexInputLines[lineIndex];
    const hexWords = currentLineHex.split(SPACE_HEX_DELIMITER);
  
    let lineDecrypted = false;

    for(let factorIdx = 0; factorIdx < factorCount; factorIdx++){
      const currentFactor = coprimeFactors[factorIdx];
      for(let shiftValue = ALPHABET_SIZE; shiftValue--;){
        const currentAffineCharMap = generateAffineCharMap(currentFactor, shiftValue);

        if(containsKeyword(hexWords, currentAffineCharMap)){
          const finalDecryptionTable = createDecryptionTableForAttempt(baseIdentityDecryptionTable, currentAffineCharMap);
          
          const decryptedOutput = decryptHexLine(currentLineHex, finalDecryptionTable);
          console.log(decryptedOutput);
          
          lineDecrypted = true;
          break;
        }
      }
      if (lineDecrypted) {
        break;
      }
    }
  }
}

processCipher();
