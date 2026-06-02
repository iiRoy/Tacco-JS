const fileSystemModule = require('fs');

function* produceGeometricParameters(sourceNumericData) {
    let currentPosition = 0;
    while (currentPosition + 1 < sourceNumericData.length) {
        const dimensionBase = sourceNumericData[currentPosition];
        const dimensionHeight = sourceNumericData[currentPosition + 1];

        if (dimensionBase === 0 && dimensionHeight === 0) {
            break;
        }

        yield { baseValue: dimensionBase, heightValue: dimensionHeight };
        currentPosition += 2;
    }
}

const rawInputContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
const processedNumericValues = rawInputContent.trim().split('\n').map(Number);

for (const { baseValue, heightValue } of produceGeometricParameters(processedNumericValues)) {
    const calculatedArea = baseValue * Math.sqrt(4 * heightValue * heightValue + baseValue * baseValue) + baseValue * baseValue;
    console.log(calculatedArea.toFixed(5));
}
