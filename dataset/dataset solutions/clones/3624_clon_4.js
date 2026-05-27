function crash(message) {
    throw new Error(message);
}

function solve(inputString) {
    const processedInput = inputString.trim();
    const numericalValue = parseInt(processedInput, 10);

    if (isNaN(numericalValue) || !Number.isInteger(numericalValue)) {
        crash("Invalid integer input: " + processedInput);
    }

    const desiredSum = numericalValue;

    if (desiredSum < 0) {
        return "No\n";
    }

    const unachievableSums = new Set([1, 2, 3, 5, 6, 9, 13, 17]);

    if (unachievableSums.has(desiredSum)) {
        return "No\n";
    }

    return "Yes\n";
}

async function main() {
    let collectedInput = '';
    process.stdin.setEncoding('utf8');

    for await (const dataChunk of process.stdin) {
        collectedInput += dataChunk;
    }

    try {
        const finalOutput = solve(collectedInput);
        process.stdout.write(finalOutput);
    } catch (programError) {
        process.stderr.write(programError.message + '\n');
        process.exit(1);
    }
}

main();
