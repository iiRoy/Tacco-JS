const fileSystemModule = require('fs');

function processNumericalSeries(sourceContent) {
    const contentLines = sourceContent.split('\n');
    const quantity = Number(contentLines[0]);

    const numberStrings = contentLines[1].split(' ');
    const relevantNumberStrings = numberStrings.slice(0, quantity);

    const numericValues = relevantNumberStrings.map(val => Number(val));

    const calculateLeadingZerosOfBinary = (value) => {
        if (value === 0) {
            return Infinity; 
        }
        return Math.log2(value & -value);
    };

    const divisionCounts = numericValues.map(calculateLeadingZerosOfBinary);

    const minimumDivisions = divisionCounts.reduce((accumulator, currentVal) => Math.min(accumulator, currentVal), 100);

    console.log(minimumDivisions);
}

const rawDataSource = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
processNumericalSeries(rawDataSource);