function* createNumberStream(sourceText) {
    const contentLines = sourceText.trim().split('\n');
    for (const lineEntry of contentLines) {
        yield Number(lineEntry);
    }
}

const rawInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const numericStream = createNumberStream(rawInputContent);

let currentBatchSize;
do {
    currentBatchSize = numericStream.next().value;
    if (currentBatchSize === 0) {
        break;
    }

    const batchValues = Array.from({ length: currentBatchSize }, () => numericStream.next().value);

    const resultantSequence = batchValues.reduce((accumulatedElements, currentElement, elementPosition) => {
        if (elementPosition % 2 === 0) {
            accumulatedElements.push(currentElement);
        } else {
            if (accumulatedElements.length > 0 && accumulatedElements[accumulatedElements.length - 1] === currentElement) {
                accumulatedElements.push(currentElement);
            } else {
                accumulatedElements.push(currentElement);
                let fillStartIndex = accumulatedElements.length - 2;
                while (fillStartIndex >= 0 && accumulatedElements[fillStartIndex] !== currentElement) {
                    fillStartIndex--;
                }
                for (let fillIndex = fillStartIndex + 1; fillIndex < accumulatedElements.length - 1; fillIndex++) {
                    accumulatedElements[fillIndex] = currentElement;
                }
            }
        }
        return accumulatedElements;
    }, []);

    const zeroOccurrences = resultantSequence.filter(val => val === 0).length;
    console.log(zeroOccurrences);

} while (true);
