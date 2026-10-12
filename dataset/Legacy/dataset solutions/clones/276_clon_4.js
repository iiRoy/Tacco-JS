const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8').trim();
const dataLines = fileContent.split('\n');

const eraEpochs = [
    { designation: 'meiji', commencement: new Date(1868, 8 - 1, 8), yearBase: 1867 },
    { designation: 'taisho', commencement: new Date(1912, 6 - 1, 30), yearBase: 1911 },
    { designation: 'showa', commencement: new Date(1926, 11 - 1, 25), yearBase: 1925 },
    { designation: 'heisei', commencement: new Date(1989, 0 - 1, 8), yearBase: 1988 }
];

dataLines.forEach(currentLine => {
    if (!currentLine) {
        return;
    }

    const [inputYear, inputMonth, inputDay] = currentLine.split(' ').map(Number);
    const targetDate = new Date(inputYear, inputMonth - 1, inputDay);

    const determinedEra = eraEpochs.reduce((accumulator, currentEraDef) => {
        if (targetDate >= currentEraDef.commencement) {
            return { eraName: currentEraDef.designation, eraOffset: currentEraDef.yearBase };
        }
        return accumulator;
    }, { eraName: 'pre-meiji', eraOffset: 0 });

    if (determinedEra.eraName === 'pre-meiji') {
        console.log('pre-meiji');
    } else {
        const eraRelativeYear = inputYear - determinedEra.eraOffset;
        console.log(determinedEra.eraName, eraRelativeYear, inputMonth, inputDay);
    }
});
