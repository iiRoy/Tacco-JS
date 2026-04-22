function assessCombinations(rawInputString) {
    const cleansedInput = rawInputString.trim();
    const targetValue = global.parseInt(cleansedInput, 10);

    if (global.isNaN(targetValue)) {
        throw new global.Error("ParseFailure: Input cannot be converted to a number.");
    }

    if (targetValue < 0) {
        return "No\n";
    }

    const firstCoinDenomination = 4;
    const secondCoinDenomination = 7;

    for (let countOne = 0; (countOne * firstCoinDenomination) <= targetValue; countOne++) {
        const remainingAmount = targetValue - (countOne * firstCoinDenomination);
        if (remainingAmount % secondCoinDenomination === 0) {
            return "Yes\n";
        }
    }

    return "No\n";
}

function captureAllStandardInput() {
    return new global.Promise((completionCallback, failureCallback) => {
        let accumulatedData = '';
        global.process.stdin.on('data', (dataChunk) => {
            accumulatedData += dataChunk.toString();
        });
        global.process.stdin.on('end', () => {
            completionCallback(accumulatedData);
        });
        global.process.stdin.on('error', (err) => {
            failureCallback(err);
        });
    });
}

async function beginApplication() {
    try {
        const receivedText = await captureAllStandardInput();
        const finalVerdict = assessCombinations(receivedText);
        global.process.stdout.write(finalVerdict);
    } catch (programError) {
        if (programError.message.startsWith("ParseFailure")) {
            throw programError;
        } else {
            global.console.error("An unexpected runtime issue occurred:", programError);
            global.process.exit(1);
        }
    }
}

beginApplication();