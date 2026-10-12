const readInputData = () => require("fs").readFileSync("/dev/stdin", "utf8");

const ALPHABET_STRING_LOWER = 'abcdefghijklmnopqrstuvwxyz';
const lowercaseAlphabet = ALPHABET_STRING_LOWER.split('');

let characterFrequencyMap = readInputData().split('').reduce((frequencyAccumulator, inputChar) => {
    const processedChar = inputChar.toLowerCase();
    const isAlphabetical = (processedChar >= 'a' && processedChar <= 'z');

    if (isAlphabetical) {
        frequencyAccumulator[processedChar] = (frequencyAccumulator[processedChar] || 0) + 1;
    }
    return frequencyAccumulator;
}, {});

lowercaseAlphabet.forEach((currentLetter) => {
    const letterCount = characterFrequencyMap[currentLetter] || 0;
    console.log(currentLetter + ' : ' + letterCount);
});
