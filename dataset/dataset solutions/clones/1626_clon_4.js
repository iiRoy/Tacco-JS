(async () => {
    const obtainNumericValue = async () => {
        let collectedText = '';
        for await (const segment of process.stdin) {
            collectedText += segment;
        }
        return Number(collectedText);
    };

    const divisorValue = await obtainNumericValue();

    function* remainderGenerator(modulus) {
        let currentAccumulated = 0;
        let stepCounter = 0;
        
        while (true) {
            stepCounter++;
            currentAccumulated = (currentAccumulated * 10 + 7) % modulus;
            yield { remainder: currentAccumulated, length: stepCounter };
        }
    }

    const encounteredRemainders = new Set();
    let finalAnswer = -1;

    for (const currentStatus of remainderGenerator(divisorValue)) {
        if (currentStatus.remainder === 0) {
            finalAnswer = currentStatus.length;
            break;
        }

        if (encounteredRemainders.has(currentStatus.remainder)) {
            finalAnswer = -1;
            break;
        }

        encounteredRemainders.add(currentStatus.remainder);
    }

    process.stdout.write(String(finalAnswer) + '\n');
})();