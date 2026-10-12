const fileSystemModule = require('fs');
const rawInputContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
const inputLinesArray = rawInputContent.split('\n');

const totalInputEntries = inputLinesArray.length;

for (let currentLineIndex = 0; currentLineIndex < totalInputEntries; currentLineIndex++) {
    const lineDataString = inputLinesArray[currentLineIndex];
    const stringComponents = lineDataString.split(' ');
    const numericalComponents = stringComponents.map(component => parseInt(component, 10));

    const firstNumericValue = numericalComponents[0];
    const secondNumericValue = numericalComponents[1];

    const isZeroPair = !(firstNumericValue || secondNumericValue);
    if (isZeroPair) {
        break;
    }

    const temporaryArrayForSorting = [...numericalComponents];
    const sortedValues = temporaryArrayForSorting.sort((val1, val2) => val1 - val2);

    console.log(sortedValues.join(' '));
}
