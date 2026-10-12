function processData(rawData) {
    let lineSegments = rawData.split('\n');

    let countS = Number(lineSegments.shift());
    let dataS = lineSegments.shift().split(' ').map(Number);

    let countT = Number(lineSegments.shift());
    let dataT = lineSegments.shift().split(' ').map(Number);

    let foundMatches = 0;

    const checkArrayIndexValidity = (value, targetArray) => {
        const isNumeric = typeof value === 'number';
        const isInteger = Number.isInteger(value);
        const isNonNegative = value >= 0;
        const isWithinBounds = value < targetArray.length;
        return isNumeric && isInteger && isNonNegative && isWithinBounds;
    };

    for (const currentElement of dataT) {
        if (checkArrayIndexValidity(currentElement, dataS)) {
            foundMatches++;
        }
    }

    console.log(foundMatches);
}

processData(require('fs').readFileSync('/dev/stdin', 'utf8'));
