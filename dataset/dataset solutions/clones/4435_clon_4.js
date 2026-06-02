function processText(sourceText) {
    const textLength = sourceText.length;

    const initialCharacter = sourceText[0];

    const innerCharacterCount = textLength - 2;

    const finalCharacter = sourceText[textLength - 1];

    console.log(initialCharacter + innerCharacterCount + finalCharacter);
}

const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
processText(fileContent);
