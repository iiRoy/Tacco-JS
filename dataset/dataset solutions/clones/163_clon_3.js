const fileSystemModule = require('fs');

const standardInputFd = process.stdin.fd;
const totalInputSize = fileSystemModule.fstatSync(standardInputFd).size;
const inputBuffer = Buffer.alloc(totalInputSize);
const actualBytesRead = fileSystemModule.readSync(standardInputFd, inputBuffer, 0, totalInputSize, 0);
const rawInputString = inputBuffer.toString('utf8', 0, actualBytesRead);
const inputLines = rawInputString.split('\n');

processInputData();

function processInputData() {
  const affineMultipliers = new Int8Array([1, 3, 5, 7, 9, 11, 15, 17, 19, 21, 23, 25]);

  const generateAffineMap = (alphaVal, betaVal) => {
    const mappedChars = new Int8Array(26);
    for (let charIdx = 0; charIdx < 26; charIdx++) {
      mappedChars[charIdx] = (charIdx * alphaVal + betaVal) % 26 + 97;
    }
    return mappedChars;
  };

  const decryptSingleChar = (encodedCharCode, affineMap) => {
    for (let lookupIdx = 0; lookupIdx < 26; lookupIdx++) {
      if (encodedCharCode === affineMap[lookupIdx]) {
        return String.fromCharCode(lookupIdx + 97);
      }
    }
    return '';
  };

  const decryptFullLine = (encodedLine, affineMap) => {
    return encodedLine.replace(/[a-z]/g, (charToDecrypt) => {
      const charCode = charToDecrypt.charCodeAt(0);
      return decryptSingleChar(charCode, affineMap);
    });
  };

  const totalLinesToProcess = +inputLines[0];

  MAIN_LOOP: for (let lineIndex = 1; lineIndex <= totalLinesToProcess; lineIndex++) {
    const currentLine = inputLines[lineIndex];

    for (let factorIndex = 0; factorIndex < affineMultipliers.length; factorIndex++) {
      const affineAlpha = affineMultipliers[factorIndex];

      for (let affineBeta = 25; affineBeta >= 0; affineBeta--) {
        const currentAffineMap = generateAffineMap(affineAlpha, affineBeta);

        const decodedThChar = String.fromCharCode(currentAffineMap[19], currentAffineMap[7]);
        const decodedAtChar = String.fromCharCode(currentAffineMap[0], currentAffineMap[19]);
        const decodedIsChar = String.fromCharCode(currentAffineMap[8], currentAffineMap[18]);

        const searchPattern = decodedThChar + "(" + decodedAtChar + "|" + decodedIsChar + ")";
        const decryptionTriggerRegex = new RegExp(searchPattern);

        if (decryptionTriggerRegex.test(currentLine)) {
          const decryptedOutput = decryptFullLine(currentLine, currentAffineMap);
          console.log(decryptedOutput);
          continue MAIN_LOOP;
        }
      }
    }
  }
}
