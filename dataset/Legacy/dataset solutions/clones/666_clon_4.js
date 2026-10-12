const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const parsedNumbers = fileContent.trim().split('\n').map(Number);

function* numberSequenceGenerator(dataArray) {
    let indexPosition = 0;
    while (true) {
        if (indexPosition < dataArray.length) {
            yield dataArray[indexPosition++];
        } else {
            yield undefined;
        }
    }
}

const numberSource = numberSequenceGenerator(parsedNumbers);

function executeProcessingLoop(sourceIterator) {
    while (true) {
        const blockIdentifierValue = sourceIterator.next().value;

        if (blockIdentifierValue === undefined) {
            break;
        }

        let elementCountDivisor = blockIdentifierValue / 4;

        if (elementCountDivisor === 0) {
            break;
        }

        let currentBlockTotal = 0;
        while (elementCountDivisor !== 0) {
            const nextDataElement = sourceIterator.next().value;
            currentBlockTotal += nextDataElement;
            elementCountDivisor--;
        }
        console.log(currentBlockTotal);
    }
}

executeProcessingLoop(numberSource);
