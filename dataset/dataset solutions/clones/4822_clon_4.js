const processPayload = (rawSignal) => {
    const signalComponents = rawSignal.split(/[\r\n]/g);
    const [verticalExtentStr, horizontalExtentStr] = signalComponents[0].split(' ');
    const verticalExtent = parseInt(verticalExtentStr, 10);

    const sourceElements = Array.from({ length: verticalExtent }, (_, idx) => {
        return signalComponents[idx + 1];
    });

    const finalSequence = sourceElements.flatMap(currentElement => [currentElement, currentElement]);

    finalSequence.forEach(itemToDisplay => {
        console.log(itemToDisplay);
    });
};

const dataStream = require('fs').readFileSync('/dev/stdin', 'utf8');
processPayload(dataStream);