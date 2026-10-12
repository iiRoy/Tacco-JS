const fileSystemModule = require('fs');
const rawInputData = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

const inputSegments = rawInputData.trim().split('\n');

const processedContentUnits = inputSegments
    .filter(currentLineSegment => currentLineSegment !== '0 0')
    .map(dimensionSpecification => {
        const [heightValue, widthValue] = dimensionSpecification.split(' ').map(Number);

        const rowPattern = '#'.repeat(widthValue);
        const blockSection = (rowPattern + '\n').repeat(heightValue);
        
        return blockSection;
    });

const finalRenderedOutput = processedContentUnits.map(unit => unit + '\n').join('');

console.log(finalRenderedOutput);
