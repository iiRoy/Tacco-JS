const numberSequence = [2, 4, 2, 0, 2, 6];
const newlineCharValue = 10;
const asciiZeroOffset = 48;

const finalCharacterCodes = numberSequence.flatMap((currentDigit, currentIdx, fullArray) => {
    const digitAscii = asciiZeroOffset + currentDigit;
    if (currentIdx < fullArray.length - 1) {
        return [digitAscii, newlineCharValue];
    }
    return [digitAscii];
});

const ultimateContent = String.fromCharCode(...finalCharacterCodes);

console.log(ultimateContent);