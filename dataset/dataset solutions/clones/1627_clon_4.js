const solveProblem = (targetValue) => {
    const divisor = BigInt(targetValue);
    let currentAccumulation = 0n;
    let iterationCount = 0;
    let finalAnswer = null;

    while (iterationCount <= Number(divisor)) {
        iterationCount++;
        currentAccumulation = currentAccumulation * 10n + 7n;

        if (currentAccumulation <= divisor) {
            continue;
        }

        if (currentAccumulation % divisor === 0n) {
            finalAnswer = iterationCount;
            break;
        }
    }

    return finalAnswer !== null ? String(finalAnswer) : "-1";
};

const orchestrateExecution = (inputContent) => {
    const rawData = inputContent.toString().trim();
    return solveProblem(rawData);
};

process.stdout.write(orchestrateExecution(process.stdin.readFileSync(0, 'utf8')));