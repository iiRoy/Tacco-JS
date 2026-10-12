async function obtainInputData() {
    return new Promise((resolve) => {
        let entireInput = '';
        process.stdin.on('data', (piece) => {
            entireInput += piece.toString();
        });
        process.stdin.on('end', () => {
            resolve(entireInput);
        });
    });
}

function decipherSequence(sequenceString, orderNumber) {
    const sequenceUnits = sequenceString.split('');
    let primaryUnit = '1';
    let thresholdExtent = 1;

    for (let currentPos = 0; currentPos < sequenceUnits.length; currentPos++) {
        if (sequenceUnits[currentPos] !== '1') {
            primaryUnit = sequenceUnits[currentPos];
            thresholdExtent = currentPos + 1;
            break;
        }
    }

    const thresholdBigNum = BigInt(thresholdExtent);
    const sequenceLengthBigNum = BigInt(sequenceUnits.length);

    if (orderNumber <= thresholdBigNum) {
        return primaryUnit;
    } else {
        if (orderNumber <= sequenceLengthBigNum) {
            return sequenceUnits[Number(orderNumber) - 1];
        } else {
            return primaryUnit;
        }
    }
}

async function executeProcessing() {
    const rawData = await obtainInputData();
    const dataLines = rawData.trim().split('\n');

    if (dataLines.length < 2) {
        throw new Error("Input must contain at least two lines.");
    }

    const initialString = dataLines[0];
    const numericalOrder = BigInt(dataLines[1]);

    const finalResult = decipherSequence(initialString, numericalOrder);
    process.stdout.write(finalResult + '\n');
}

executeProcessing();