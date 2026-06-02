const fileSystem = require('fs');
const rawData = fileSystem.readFileSync('/dev/stdin', 'utf8');
const charArray = [...rawData];

let outputBuffer = '';

let charCounts = {};
const firstCharCode = 'a'.charCodeAt(0);
const lastCharCode = 'z'.charCodeAt(0);
for (let codeVal = firstCharCode; codeVal <= lastCharCode; codeVal++) {
    charCounts[String.fromCharCode(codeVal)] = 0;
}

const isAlphabeticCharacter = (inputChar) => {
    const charCodeValue = inputChar.charCodeAt(0);
    const isUpper = (charCodeValue >= 65 && charCodeValue <= 90);
    const isLower = (charCodeValue >= 97 && charCodeValue <= 122);
    return isUpper || isLower;
};

for (const currentCharacter of charArray) {
    if (!isAlphabeticCharacter(currentCharacter)) {
        continue;
    }
    const lowercasedChar = currentCharacter.toLowerCase();
    if (charCounts.hasOwnProperty(lowercasedChar)) {
        charCounts[lowercasedChar]++;
    }
}

Object.keys(charCounts).forEach(charKey => {
    outputBuffer += `${charKey} : ${charCounts[charKey]}\n`;
});

console.log(outputBuffer.trim());
