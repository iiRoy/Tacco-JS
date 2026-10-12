function getModInverse(a, m) {
    for (let x = 1; x < m; x++) {
        if (((a % m) * (x % m)) % m === 1) {
            return x;
        }
    }
    return -1;
}

const coprimeMultipliers = [1, 3, 5, 7, 9, 11, 15, 17, 19, 21, 23, 25];
const modularInverseMap = new Map();
coprimeMultipliers.forEach(val => {
    modularInverseMap.set(val, getModInverse(val, 26));
});

function generateEncryptedWordHex(alpha, beta, word) {
    return Array.from(word).map(char => {
        const charIndex = char.charCodeAt(0) - 97;
        const encryptedIndex = (charIndex * alpha + beta) % 26;
        const encryptedAscii = encryptedIndex + 97;
        return encryptedAscii.toString(16);
    }).join('');
}

const fs = require('fs');
const stdinFileDescriptor = process.stdin.fd;
const stdinStats = fs.fstatSync(stdinFileDescriptor);
const totalDataLength = stdinStats.size;
const inputBuffer = Buffer.alloc(totalDataLength);
const actualBytesRead = fs.readSync(stdinFileDescriptor, inputBuffer, 0, totalDataLength, 0);
const hexEncodedInputLines = inputBuffer.toString('hex', 0, actualBytesRead).split('0a');

const allKeyCombinations = [];
coprimeMultipliers.forEach(alphaVal => {
    for (let betaVal = 0; betaVal < 26; betaVal++) {
        allKeyCombinations.push({ alpha: alphaVal, beta: betaVal });
    }
});

hexEncodedInputLines.slice(1, -1).forEach(currentLineHex => {
    const hexWordsInCurrentLine = currentLineHex.split('20');

    const identifiedKey = allKeyCombinations.find(keyCandidate => {
        const encryptedThatHex = generateEncryptedWordHex(keyCandidate.alpha, keyCandidate.beta, "that");
        const encryptedThisHex = generateEncryptedWordHex(keyCandidate.alpha, keyCandidate.beta, "this");
        
        return hexWordsInCurrentLine.some(wordHex => wordHex === encryptedThatHex || wordHex === encryptedThisHex);
    });

    if (identifiedKey) {
        const finalAlpha = identifiedKey.alpha;
        const finalBeta = identifiedKey.beta;
        const alphaInverse = modularInverseMap.get(finalAlpha);

        const decryptedCharacters = [];
        for (let charIndex = 0; charIndex < currentLineHex.length; charIndex += 2) {
            const hexByte = currentLineHex.substring(charIndex, charIndex + 2);
            const asciiValue = parseInt(hexByte, 16);

            if (asciiValue >= 97 && asciiValue <= 122) {
                const encryptedCharIndex = asciiValue - 97;
                let decryptedCharIndex = (alphaInverse * (encryptedCharIndex - finalBeta + 26)) % 26;
                decryptedCharacters.push(String.fromCharCode(decryptedCharIndex + 97));
            } else {
                decryptedCharacters.push(String.fromCharCode(asciiValue));
            }
        }
        console.log(decryptedCharacters.join(''));
    }
});
