const fileSystem = require('fs');

const createRectangularPattern = (dimensionA, dimensionB) => {
    if (dimensionA <= 0 || dimensionB <= 0) {
        return [];
    }

    const solidLine = '#'.repeat(dimensionB);
    const interiorLine = (dimensionB > 1 ? '#' : '') + (dimensionB > 2 ? '.'.repeat(dimensionB - 2) : '') + (dimensionB > 1 ? '#' : '');

    const effectiveMiddleLine = (dimensionB <= 2) ? solidLine : interiorLine;

    return Array.from({ length: dimensionA }, (_, rowPosition) => {
        if (rowPosition === 0 || rowPosition === dimensionA - 1) {
            return solidLine;
        } else {
            return effectiveMiddleLine;
        }
    });
};

const rawData = fileSystem.readFileSync('/dev/stdin', 'UTF-8');

const finalRenderedOutput = rawData
    .split('\n')
    .filter(lineContent => lineContent.trim() !== '')
    .reduce((accumulatedLines, currentEntry, entryIndex, allEntries) => {
        const [firstDimension, secondDimension] = currentEntry.split(' ').map(numericText => parseInt(numericText, 10));

        if (firstDimension === 0 && secondDimension === 0) {
            allEntries.splice(entryIndex); // Halt further processing by truncating the array
            return accumulatedLines;
        }

        const currentShapeLines = createRectangularPattern(firstDimension, secondDimension);
        
        accumulatedLines.push(...currentShapeLines);
        
        const subsequentValidEntryExists = allEntries.slice(entryIndex + 1).some(futureEntry => {
            const [nextFirstDim, nextSecondDim] = futureEntry.split(' ').map(val => parseInt(val, 10));
            return !(nextFirstDim === 0 && nextSecondDim === 0);
        });

        if (subsequentValidEntryExists) {
             accumulatedLines.push(''); // Add an empty string to represent a newline separator
        }

        return accumulatedLines;
    }, [])
    .join('\n');

console.log(finalRenderedOutput);