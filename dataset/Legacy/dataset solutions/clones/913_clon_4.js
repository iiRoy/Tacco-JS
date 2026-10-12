const fileSystem = require('fs');
const inputData = fileSystem.readFileSync('/dev/stdin', 'utf8');
const sourceLines = inputData.trim().split("\n");

const isVowel = (character) => /[aiueo]/.test(character);

const generateTransformedKey = (originalWord) => {
    if (originalWord.length === 0) return "";
    const characters = Array.from(originalWord);
    const initialProcessingState = {
        resultantString: characters[0],
        previousCharWasVowel: isVowel(characters[0])
    };

    const finalProcessingState = characters.slice(1).reduce((currentAccumulation, currentChar) => {
        if (currentAccumulation.previousCharWasVowel) {
            currentAccumulation.resultantString += currentChar;
        }
        currentAccumulation.previousCharWasVowel = isVowel(currentChar);
        return currentAccumulation;
    }, initialProcessingState);

    return finalProcessingState.resultantString;
};

let linePointer = 0;
while (linePointer < sourceLines.length) {
    const currentBlockSize = Number(sourceLines[linePointer++]);
    if (currentBlockSize === 0) break;

    const currentWordBlock = sourceLines.slice(linePointer, linePointer + currentBlockSize);
    linePointer += currentBlockSize;

    const transformedKeys = currentWordBlock.map(generateTransformedKey);
    const distinctTransformedKeys = new Set(transformedKeys);
    
    const maximumKeyLength = transformedKeys.length > 0
        ? Math.max(...transformedKeys.map(k => k.length))
        : 0;

    const possibleLengths = Array.from({ length: maximumKeyLength }, (_, idx) => idx + 1);

    const resultLength = possibleLengths.find(len => {
        const truncatedKeySet = new Set();
        for (const key of distinctTransformedKeys) {
            truncatedKeySet.add(key.slice(0, len));
        }
        return truncatedKeySet.size === currentBlockSize;
    });

    if (resultLength !== undefined) {
        console.log(resultLength);
    } else {
        console.log(-1);
    }
}
