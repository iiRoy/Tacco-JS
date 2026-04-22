const sourceData = require('node:fs').readFileSync('/dev/stdin', 'UTF-8');

const processGeometry = (sourceText) => {
    const processedRectangles = sourceText
        .split('\n')
        .reduce((accumulator, currentLine) => {
            if (accumulator.terminationTriggered) {
                return accumulator;
            }

            const dimensionStrings = currentLine.split(' ');
            const heightMeasure = Number(dimensionStrings[0]);
            const widthMeasure = Number(dimensionStrings[1]);

            if (heightMeasure === 0 && widthMeasure === 0) {
                return { generatedContent: accumulator.generatedContent, terminationTriggered: true };
            }

            const rowPattern = '#'.repeat(widthMeasure);
            const blockContent = (rowPattern + '\n').repeat(heightMeasure);
            
            return { generatedContent: accumulator.generatedContent + blockContent, terminationTriggered: false };
        }, { generatedContent: '', terminationTriggered: false });

    console.log(processedRectangles.generatedContent);
};

processGeometry(sourceData);