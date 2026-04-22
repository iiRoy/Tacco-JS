const octetStreamData = require('fs').readFileSync('/dev/stdin');
const initialHexStrings = octetStreamData.toString('hex').split('0a');
const relevantHexLines = initialHexStrings.slice(1).filter(textSegment => textSegment.length > 0);

const modularInverses = new Map();
const affineCoefficients = [1, 3, 5, 7, 9, 11, 15, 17, 19, 21, 23, 25];
const charBaseValue = 97; // ASCII for 'a'
const alphabetRange = 26;

affineCoefficients.forEach(coefficient => {
    for (let inverseCandidate = 0; inverseCandidate < alphabetRange; inverseCandidate++) {
        if ((coefficient * inverseCandidate) % alphabetRange === 1) {
            modularInverses.set(coefficient, inverseCandidate);
            break;
        }
    }
});

const calculateCipherValue = (inputIndex, currentA, currentB) =>
    (currentA * inputIndex + currentB) % alphabetRange;

const calculatePlaintextValue = (cipherIndex, inverseA, currentB) => {
    let decryptedVal = inverseA * (cipherIndex - currentB);
    return (decryptedVal % alphabetRange + alphabetRange) % alphabetRange;
};

const hexToCharIndex = (hexValue) => parseInt(hexValue, 16) - charBaseValue;

const charIndexToHex = (indexValue) => (indexValue + charBaseValue).toString(16);

const knownWordA = [19, 7, 0, 19]; // "that" as character indices (0-25)
const knownWordB = [19, 7, 8, 18]; // "this" as character indices (0-25)

const processAllInputLines = (linesForProcessing) => {
    linesForProcessing.forEach(encryptedLineHex => {
        const encryptedWordsHex = encryptedLineHex.split('20').filter(wordPart => wordPart.length > 0);

        const determineEncryptionKey = () => {
            for (const currentA of affineCoefficients) {
                for (let currentB = 0; currentB < alphabetRange; currentB++) {
                    const encryptedKnownA = knownWordA.map(idx =>
                        charIndexToHex(calculateCipherValue(idx, currentA, currentB))
                    ).join('');
                    const encryptedKnownB = knownWordB.map(idx =>
                        charIndexToHex(calculateCipherValue(idx, currentA, currentB))
                    ).join('');

                    if (encryptedWordsHex.some(word =>
                        word === encryptedKnownA || word === encryptedKnownB
                    )) {
                        return { a: currentA, b: currentB };
                    }
                }
            }
            return null;
        };

        const foundKeyPair = determineEncryptionKey();

        if (foundKeyPair) {
            const decryptionInverseA = modularInverses.get(foundKeyPair.a);
            const resultantCharacters = [];

            for (let i = 0; i < encryptedLineHex.length; i += 2) {
                const hexByte = encryptedLineHex.substring(i, i + 2);
                if (hexByte.length !== 2) continue;

                const cipherCharacterIndex = hexToCharIndex(hexByte);
                const plaintextCharacterIndex = calculatePlaintextValue(cipherCharacterIndex, decryptionInverseA, foundKeyPair.b);
                resultantCharacters.push(String.fromCharCode(plaintextCharacterIndex + charBaseValue));
            }
            console.log(resultantCharacters.join(''));
        }
    });
};

processAllInputLines(relevantHexLines);