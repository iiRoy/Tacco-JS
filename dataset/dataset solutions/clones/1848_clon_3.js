const digitToSoundMapping = new Map([
    ['2', 'hon'],
    ['4', 'hon'],
    ['5', 'hon'],
    ['7', 'hon'],
    ['9', 'hon'],
    ['3', 'bon'],
    ['0', 'pon'],
    ['1', 'pon'],
    ['6', 'pon'],
    ['8', 'pon']
]);

function processInputString(inputContent) {
    const trailingDigit = inputContent.slice(-1);
    const determinedSound = digitToSoundMapping.get(trailingDigit);

    if (determinedSound !== undefined) {
        console.log(determinedSound);
        return;
    }
}

const fetchStandardInput = () => require('fs').readFileSync('/dev/stdin', 'utf8');

processInputString(fetchStandardInput());
