var fileSystem = require('fs');
var sourceText = fileSystem.readFileSync('/dev/stdin', 'utf8');

const searchTerms = ['the', 'this', 'that'];
const lowerAlpha = 'abcdefghijklmnopqrstuvwxyz';

const finalDecryption = Array.from({ length: 26 }, (_, shiftAmount) => shiftAmount)
    .find(currentShift => {
        let processedCharacters = [];

        for (let charIndex = 0; charIndex < sourceText.length; charIndex++) {
            const currentChar = sourceText[charIndex];
            const alphaIndex = lowerAlpha.indexOf(currentChar);

            if (alphaIndex !== -1) {
                const newAlphaIndex = (alphaIndex + currentShift) % 26;
                processedCharacters.push(lowerAlpha[newAlphaIndex]);
            } else {
                processedCharacters.push(currentChar);
            }
        }

        const candidateOutput = processedCharacters.join('');

        return searchTerms.some(term => candidateOutput.includes(term));
    });

console.log(finalDecryption);
