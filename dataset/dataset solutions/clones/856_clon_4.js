const fileSystem = require('fs');

const obtainInput = () => {
    return fileSystem.readFileSync('/dev/stdin', 'utf8');
};

const processInitialData = (rawData) => {
    const contentLines = rawData.trim().split('\n');
    const iterationCount = Number(contentLines.shift());
    return { iterationCount, contentLines };
};

const constructCombinedString = (count, sourceLines) => {
    return sourceLines.slice(0, count)
        .map(lineSegment => {
            const parts = lineSegment.split(' ');
            const characterUnit = parts[0];
            const repetitionFactor = Number(parts[1]);
            return characterUnit.repeat(repetitionFactor);
        })
        .join('');
};

const recursivelyCleanString = (currentValue) => {
    const nextValue = currentValue.replace(/\(\)/g, '');
    if (nextValue === currentValue) {
        return currentValue;
    }
    return recursivelyCleanString(nextValue);
};

const mainExecution = () => {
    const rawData = obtainInput();
    const { iterationCount, contentLines } = processInitialData(rawData);
    const initialCombinedString = constructCombinedString(iterationCount, contentLines);
    const finalResultString = recursivelyCleanString(initialCombinedString);

    if (finalResultString === '') {
        console.log('YES');
    } else {
        console.log('NO');
    }
};

mainExecution();
