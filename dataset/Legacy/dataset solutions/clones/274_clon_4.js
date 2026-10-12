const fileSystem = require('fs');
const rawInputContent = fileSystem.readFileSync('/dev/stdin', 'utf8').trim();
const inputLinesArray = rawInputContent.split('\n');

const eraDefinitions = [
    { eraName: 'pre-meiji', upperLimit: new Date(1868, 8, 8), yearOffset: 0, isSpecialOutput: true },
    { eraName: 'meiji', upperLimit: new Date(1912, 6, 29), yearOffset: 1867, isSpecialOutput: false },
    { eraName: 'taisho', upperLimit: new Date(1926, 11, 24), yearOffset: 1911, isSpecialOutput: false },
    { eraName: 'showa', upperLimit: new Date(1989, 0, 7), yearOffset: 1925, isSpecialOutput: false },
    { eraName: 'heisei', upperLimit: new Date(9999, 0, 1), yearOffset: 1988, isSpecialOutput: false }
];

inputLinesArray.forEach(currentLineContent => {
    const dateComponents = currentLineContent.split(' ').map(Number);
    let gregorianYear = dateComponents[0];
    const gregorianMonth = dateComponents[1];
    const gregorianDay = dateComponents[2];

    const targetDateInstance = new Date(gregorianYear, gregorianMonth - 1, gregorianDay);

    const matchingEra = eraDefinitions.find(eraDef => targetDateInstance < eraDef.upperLimit);

    if (matchingEra.isSpecialOutput) {
        console.log('pre-meiji');
    } else {
        console.log(matchingEra.eraName, gregorianYear - matchingEra.yearOffset, gregorianMonth, gregorianDay);
    }
});
