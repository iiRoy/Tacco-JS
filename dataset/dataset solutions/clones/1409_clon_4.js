const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

const problemStatements = rawData.trim().split('\n').map(lineData => {
    const numericComponents = lineData.split(' ').map(Number);
    return { dimensionX: numericComponents[0], dimensionY: numericComponents[1] };
}).filter(pairDimensions => pairDimensions.dimensionX !== 0 || pairDimensions.dimensionY !== 0);

const constructVisual = (heightValue, widthValue) => {
    const visualCharacters = ['#', '.'];

    return Array.from({ length: heightValue }, (_, rowIndex) => {
        return Array.from({ length: widthValue }, (_, colIndex) => {
            return visualCharacters[(rowIndex + colIndex) % 2];
        }).join('');
    }).join('\n');
};

if (problemStatements.length > 0) {
    const compiledOutputs = problemStatements.map(currentDimensions => {
        return constructVisual(currentDimensions.dimensionX, currentDimensions.dimensionY);
    });
    process.stdout.write(compiledOutputs.join('\n\n') + '\n');
}