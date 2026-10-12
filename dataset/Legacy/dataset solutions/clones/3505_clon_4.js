function processInput(rawInputText) {
    const cleanedInput = rawInputText.trim();
    const parsedNumber = Number.parseInt(cleanedInput, 10);

    if (Number.isNaN(parsedNumber)) {
        throw new Error("n");
    }

    let candidateMultiplier = Math.ceil(parsedNumber / 111);

    if (candidateMultiplier < 1) {
        candidateMultiplier = 1;
    }

    if (candidateMultiplier > 9) {
        throw new Error("Input value " + parsedNumber + " is too high; no valid multiple of 111 (111-999) found.");
    }

    const finalResult = candidateMultiplier * 111;

    return finalResult.toString() + "\n";
}

async function runMainProgram() {
    let accumulatedInputData = '';

    const stdinReadPromise = new Promise((resolve, reject) => {
        process.stdin.setEncoding('utf8');

        process.stdin.on('data', (chunk) => {
            accumulatedInputData += chunk;
        });

        process.stdin.on('end', () => {
            resolve(accumulatedInputData);
        });

        process.stdin.on('error', (err) => {
            reject(err);
        });
    });

    try {
        const completeInput = await stdinReadPromise;
        const outputString = processInput(completeInput);
        process.stdout.write(outputString);
    } catch (error) {
        console.error(error.message);
        process.exit(1);
    }
}

runMainProgram();
