async function mainExecution() {
    let accumulatedInput = '';

    const inputReader = new Promise((resolve, reject) => {
        process.stdin.setEncoding('utf8');

        process.stdin.on('data', (chunk) => {
            accumulatedInput += chunk;
        });

        process.stdin.on('end', () => {
            resolve(accumulatedInput);
        });

        process.stdin.on('error', (err) => {
            reject(err);
        });
    });

    try {
        const rawInput = await inputReader;
        const processedOutput = transformAndCalculate(rawInput);
        process.stdout.write(processedOutput);
    } catch (error) {
        console.error(error.message);
        process.exit(1);
    }
}

function transformAndCalculate(fullInputString) {
    const cleanedInput = fullInputString.trim();
    const inputLines = cleanedInput.split('\n');

    if (inputLines.length !== 2) {
        throw new Error("Input format error: Expected exactly two lines.");
    }

    const firstLineValue = parseInt(inputLines[0], 10);
    if (isNaN(firstLineValue)) {
        throw new Error("Input format error: First line is not a valid integer.");
    }

    const numberStrings = inputLines[1].split(' ');
    const parsedNumbers = [];
    for (let i = 0; i < numberStrings.length; i++) {
        const currentNumStr = numberStrings[i];
        const num = parseInt(currentNumStr, 10);
        if (isNaN(num)) {
            throw new Error(`Input format error: "${currentNumStr}" in second line is not a valid integer.`);
        }
        parsedNumbers.push(num);
    }

    const finalResult = countDivisionsByTwo(parsedNumbers);
    return finalResult.toString() + '\n';
}

function countDivisionsByTwo(integerArray) {
    let totalDivisionsCount = 0;
    for (let i = 0; i < integerArray.length; i++) {
        let currentVal = integerArray[i];
        let divisionsForCurrentNumber = 0;
        while ((currentVal & 1) === 0) {
            divisionsForCurrentNumber++;
            currentVal = Math.floor(currentVal / 2);
        }
        totalDivisionsCount += divisionsForCurrentNumber;
    }
    return totalDivisionsCount;
}

mainExecution();
