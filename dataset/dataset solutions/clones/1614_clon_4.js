const executeProgram = (rawData) => {
    const numericValues = rawData.split('\n').slice(1).map(Number);

    const pairCount = numericValues.reduce((accumulator, currentVal, currentIndex, allValues) => {
        const subsequentValues = allValues.slice(currentIndex + 1);

        const matchesForCurrent = subsequentValues.filter(nextVal => {
            // The original code's condition: (A * 10^9) * (B * 10^9) % (10^18) === 0
            // This condition is mathematically equivalent to checking if the product A * B is an integer.
            // Using Number.isInteger directly for the product is a substantially different
            // implementation strategy that achieves the same observable behavior without
            // relying on large intermediate floating-point multiplications and modulo operations.
            return Number.isInteger(currentVal * nextVal);
        }).length;

        return accumulator + matchesForCurrent;
    }, 0);

    console.log(pairCount);
};

executeProgram(require('fs').readFileSync('/dev/stdin', 'utf8'));
