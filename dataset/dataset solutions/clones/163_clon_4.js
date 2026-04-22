const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const lines = fileContent.trim().split('\n');
const messageCount = parseInt(lines[0], 10);
const rawMessages = lines.slice(1);

function findGCD(numA, numB) {
    while (numB) {
        [numA, numB] = [numB, numA % numB];
    }
    return numA;
}

function findModInverse(numA, modM) {
    for (let currentX = 1; currentX < modM; currentX++) {
        if ((numA * currentX) % modM === 1) {
            return currentX;
        }
    }
    return -1;
}

const alphabetSize = 26;
const asciiOfA = 97;

const keyParameterPairs = [];
for (let currentFactor = 1; currentFactor < alphabetSize; currentFactor++) {
    if (findGCD(currentFactor, alphabetSize) === 1) {
        keyParameterPairs.push({
            factor: currentFactor,
            inverseFactor: findModInverse(currentFactor, alphabetSize)
        });
    }
}

const patternPartOne = [19, 7];
const patternPartTwoA = [0, 19];
const patternPartTwoB = [8, 18];

for (let messageIndex = 0; messageIndex < messageCount; messageIndex++) {
    const currentMessage = rawMessages[messageIndex];
    let keyLocated = false;

    for (const currentKeyPair of keyParameterPairs) {
        const factorA = currentKeyPair.factor;
        const inverseFactorA = currentKeyPair.inverseFactor;

        for (let shiftB = 0; shiftB < alphabetSize; shiftB++) {
            const encodeIndicesToString = (indices, a, b) => {
                return indices.map(idx => String.fromCharCode((idx * a + b) % alphabetSize + asciiOfA)).join('');
            };

            const encodedTh = encodeIndicesToString(patternPartOne, factorA, shiftB);
            const encodedAt = encodeIndicesToString(patternPartTwoA, factorA, shiftB);
            const encodedIs = encodeIndicesToString(patternPartTwoB, factorA, shiftB);

            const encodedThat = encodedTh + encodedAt;
            const encodedThis = encodedTh + encodedIs;

            if (currentMessage.includes(encodedThat) || currentMessage.includes(encodedThis)) {
                const decryptedChars = currentMessage.split('').map(encryptedChar => {
                    const charCode = encryptedChar.charCodeAt(0);
                    if (charCode >= asciiOfA && charCode < asciiOfA + alphabetSize) {
                        const encryptedIndex = charCode - asciiOfA;
                        const decryptedIndex = (inverseFactorA * (encryptedIndex - shiftB + alphabetSize)) % alphabetSize;
                        return String.fromCharCode(decryptedIndex + asciiOfA);
                    }
                    return encryptedChar;
                });
                console.log(decryptedChars.join(''));
                keyLocated = true;
                break;
            }
        }
        if (keyLocated) {
            break;
        }
    }
}