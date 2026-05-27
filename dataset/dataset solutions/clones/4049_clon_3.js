function processCoinCombinations(inputStringData) {
    const rawInputLines = inputStringData.split("\n");
    const coinLimitsAndTarget = rawInputLines.map(line => Number(line));

    const maxAllowed500Yen = coinLimitsAndTarget[0];
    const maxAllowed100Yen = coinLimitsAndTarget[1];
    const maxAllowed50Yen = coinLimitsAndTarget[2];
    const totalTargetAmount = coinLimitsAndTarget[3];

    let validCombinationCounter = 0;

    const theoreticalMax500Yen = Math.floor(totalTargetAmount / 500);
    const actualMax500YenLoopLimit = Math.min(maxAllowed500Yen, theoreticalMax500Yen);

    for (let current500YenCount = 0; current500YenCount <= actualMax500YenLoopLimit; current500YenCount++) {
        const amountAfter500s = totalTargetAmount - (current500YenCount * 500);

        if (amountAfter500s < 0) {
            continue;
        }

        const theoreticalMax100Yen = Math.floor(amountAfter500s / 100);
        const actualMax100YenLoopLimit = Math.min(maxAllowed100Yen, theoreticalMax100Yen);

        for (let current100YenCount = 0; current100YenCount <= actualMax100YenLoopLimit; current100YenCount++) {
            const amountAfter100s = amountAfter500s - (current100YenCount * 100);

            if (amountAfter100s < 0) {
                continue;
            }

            const isRemainderDivisibleBy50 = (amountAfter100s % 50 === 0);

            if (isRemainderDivisibleBy50) {
                const required50YenCount = amountAfter100s / 50;
                const is50YenCountWithinLimit = (required50YenCount <= maxAllowed50Yen);

                if (is50YenCountWithinLimit) {
                    validCombinationCounter++;
                }
            }
        }
    }

    console.log(validCombinationCounter);
}

processCoinCombinations(require('fs').readFileSync('/dev/stdin', 'utf8'));
