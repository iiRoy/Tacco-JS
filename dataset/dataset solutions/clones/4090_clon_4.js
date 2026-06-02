const { createInterface: establishInputChannel } = require('readline');

async function processGameOutcome() {
    const inputSource = establishInputChannel({
        input: process.stdin,
        output: process.stdout,
        terminal: false
    });

    let capturedInputLine = '';

    for await (const currentDataLine of inputSource) {
        capturedInputLine = currentDataLine;
    }

    const parsedNumericValues = capturedInputLine.split(' ').slice(1).map(Number);

    const [firstOperand, secondOperand] = parsedNumericValues;

    const winnerDesignations = ['Alice', 'Bolis'];

    const finalResult = (Number.isNaN(firstOperand) || Number.isNaN(secondOperand))
        ? winnerDesignations[1] // Corresponds to 'Bolis' if input is invalid (NaN)
        : winnerDesignations[(firstOperand & 1) ^ (secondOperand & 1)]; // Parity check for valid numbers

    console.log(finalResult);
}

processGameOutcome();
