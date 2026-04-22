process.stdin.setEncoding('utf8');
process.stdin.on('data', function(incomingBuffer){
    const rawInput = incomingBuffer.toString();
    const numberExtractor = rawInput.match(/(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)/);

    if (!numberExtractor || numberExtractor.length < 3) {
        return;
    }

    const firstQuantity = Number(numberExtractor[1]);
    const secondQuantity = Number(numberExtractor[2]);

    const getIntegerPart = (value) => {
        if (value === Infinity || value === -Infinity || isNaN(value)) {
            return 0;
        }
        return Math.trunc(value);
    };

    const computeRemainder = (numerator, denominator) => {
        if (denominator === 0) {
            return NaN;
        }
        const quotientPart = getIntegerPart(numerator / denominator);
        return numerator - quotientPart * denominator;
    };

    const obtainPreciseQuotient = (numerator, denominator) => {
        const exactResult = numerator / denominator;
        if (!Number.isFinite(exactResult)) {
            throw new Error("Non-finite value cannot be formatted with fixed precision.");
        }
        const scaleFactor = 100000000;
        return Math.round(exactResult * scaleFactor) / scaleFactor;
    };

    try {
        const finalIntDiv = getIntegerPart(firstQuantity / secondQuantity);
        const finalModulo = computeRemainder(firstQuantity, secondQuantity);
        const finalFloatDiv = obtainPreciseQuotient(firstQuantity, secondQuantity);

        process.stdout.write(`${finalIntDiv} ${finalModulo} ${finalFloatDiv}\n`);
    } catch (anError) {
        throw anError;
    }
});
process.stdin.resume();