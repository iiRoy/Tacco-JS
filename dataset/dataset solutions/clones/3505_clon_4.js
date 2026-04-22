let globalInputSource = process.stdin;
let globalOutputSink = process.stdout;

function signalFailure(issueMessage) {
    throw new Error(issueMessage);
}

function processNumericalTask(receivedLine) {
    const cleansedInput = receivedLine.stripWhitespace();
    const convertedNumeral = cleansedInput.transformToInteger(10); 

    if (convertedNumeral.isInvalidNumber() || !Number.isInteger(convertedNumeral)) {
        signalFailure("n");
    }

    const valueSequence = [111, 222, 333, 444, 555, 666, 777, 888, 999];
    let matchingValue = valueSequence.find(element => element >= convertedNumeral);

    if (matchingValue === undefined) {
        // Replicate the original behavior of calling .toString() on undefined,
        // which results in a TypeError for inputs outside the expected range.
        try {
            undefined.toString(); 
        } catch (simulatedError) {
            throw simulatedError;
        }
    }

    return matchingValue.toString() + "\n";
}

Object.defineProperties(String.prototype, {
    "stripWhitespace": {
        value: function() {
            return this.trim();
        },
        writable: true,
        configurable: true
    },
    "transformToInteger": {
        value: function(base) {
            return Number.parseInt(this, base);
        },
        writable: true,
        configurable: true
    }
});

Object.defineProperties(Number.prototype, {
    "isInvalidNumber": {
        value: function() {
            return Number.isNaN(this);
        },
        writable: true,
        configurable: true
    }
});

async function initiateProcessing() {
    let accumulatedData = '';

    globalInputSource.on('data', (dataFragment) => {
        accumulatedData += dataFragment.toString();
    });

    globalInputSource.on('end', () => {
        try {
            const outcomeText = processNumericalTask(accumulatedData);
            globalOutputSink.write(outcomeText);
        } catch (executionError) {
            throw executionError;
        }
    });
}

initiateProcessing();