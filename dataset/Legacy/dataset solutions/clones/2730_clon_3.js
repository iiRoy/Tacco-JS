function processInputData(rawData) {
    const inputLines = rawData.split('\n');
    const parameterString = inputLines[0];

    const stringParts = parameterString.split(' ');

    const totalItemsCount = parseInt(stringParts[0], 10);
    const coverageUnitRadius = parseInt(stringParts[1], 10);

    const singleUnitEffectiveRange = (coverageUnitRadius * 2) + 1;

    const neededUnitsCalculation = totalItemsCount / singleUnitEffectiveRange;
    const finalRequiredUnits = Math.ceil(neededUnitsCalculation);

    console.log(finalRequiredUnits);
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
