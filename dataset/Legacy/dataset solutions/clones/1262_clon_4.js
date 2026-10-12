const fileSystemModule = require('fs');
const sourceData = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

const processInputToOutput = (rawData) => {
    const linesOfInput = rawData.split('\n');

    const finalOutputState = linesOfInput.reduce((accumulator, currentLine) => {
        if (accumulator.terminated) {
            return accumulator;
        }

        const numericDimensions = currentLine.split(' ').map(Number);
        const heightValue = numericDimensions[0];
        const widthValue = numericDimensions[1];

        if (heightValue === 0 && widthValue === 0) {
            return { ...accumulator, terminated: true };
        }

        const constructedRectangle = Array.from({ length: heightValue }, (_, rowIdentifier) => {
            const isBorderRow = (rowIdentifier === 0 || rowIdentifier === heightValue - 1);

            return Array.from({ length: widthValue }, (_, colIdentifier) => {
                if (isBorderRow) {
                    return '#';
                } else {
                    const isBorderColumn = (colIdentifier === 0 || colIdentifier === widthValue - 1);
                    return isBorderColumn ? '#' : '.';
                }
            }).join('');
        }).join('\n');

        accumulator.output.push(constructedRectangle);
        return accumulator;
    }, { output: [], terminated: false });

    return finalOutputState.output;
};

processInputToOutput(sourceData).forEach(resultBlock => console.log(resultBlock));
