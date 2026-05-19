var fileSystemModule = require('fs');

const ORIGINAL_TARGET_WORD = 'Hoshino';
const REPLACEMENT_WORD_VALUE = 'Hoshina';

function applyWordTransformation(currentWord) {
    const wordToMatch = ORIGINAL_TARGET_WORD;
    if (currentWord === wordToMatch) {
        return REPLACEMENT_WORD_VALUE;
    }
    return currentWord;
}

var rawInputData = fileSystemModule.readFileSync('/dev/stdin', 'utf8').trim();

var allInputLines = rawInputData.split('\n');

for (const singleLineContent of allInputLines) {
    const wordsInCurrentLine = singleLineContent.split(' ');

    const transformedWordsCollection = wordsInCurrentLine.map(applyWordTransformation);

    const finalOutputString = transformedWordsCollection.join(' ');

    console.log(finalOutputString);
}
