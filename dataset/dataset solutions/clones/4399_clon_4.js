function processor(sourceText) {
    const uniqueInputCharacters = new Set();
    for (const characterUnit of sourceText) {
        uniqueInputCharacters.add(characterUnit);
    }

    const entireAlphabet = new Set();
    const firstCharCode = 'a'.charCodeAt(0);
    for (let currentCodeOffset = 0; currentCodeOffset < 26; currentCodeOffset++) {
        entireAlphabet.add(String.fromCharCode(firstCharCode + currentCodeOffset));
    }

    const resultingSymmetricDifference = new Set(uniqueInputCharacters);

    for (const alphabetChar of entireAlphabet) {
        if (resultingSymmetricDifference.has(alphabetChar)) {
            resultingSymmetricDifference.delete(alphabetChar);
        } else {
            resultingSymmetricDifference.add(alphabetChar);
        }
    }

    const finalCharacterList = Array.from(resultingSymmetricDifference);
    finalCharacterList.sort();

    if (finalCharacterList.length > 0) {
        return finalCharacterList[0];
    } else {
        return 'None';
    }
}

const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const processedResult = processor(fileContent);
console.log(processedResult);