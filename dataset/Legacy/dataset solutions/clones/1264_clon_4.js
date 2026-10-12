const rectangleGenerator = (heightDimension, widthDimension) => {
    if (heightDimension <= 0 || widthDimension <= 0) {
        return '';
    }

    const borderRowContent = '#'.repeat(widthDimension);
    const internalRowContent = (widthDimension === 1)
        ? '#'
        : ('#' + '.'.repeat(Math.max(0, widthDimension - 2)) + '#');

    const lineProducer = (lineIndex) => {
        if (lineIndex === 0 || lineIndex === heightDimension - 1) {
            return borderRowContent;
        } else {
            return internalRowContent;
        }
    };

    return Array.from({ length: heightDimension }, (_, index) => lineProducer(index)).join('\n');
};

const dataStream = require('fs').readFileSync('/dev/stdin', 'UTF-8').split('\n');

const parsedDimensions = [];
for (const currentInputLine of dataStream) {
    const [hVal, wVal] = currentInputLine.split(' ').map(Number);
    if (hVal === 0 && wVal === 0) {
        break;
    }
    parsedDimensions.push({ h: hVal, w: wVal });
}

const constructedOutputs = parsedDimensions.reduce((accumulator, currentPair) => {
    accumulator.push(rectangleGenerator(currentPair.h, currentPair.w));
    return accumulator;
}, []);

console.log(constructedOutputs.join('\n'));
