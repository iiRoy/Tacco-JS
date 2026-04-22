(() => {
    let accumulatedInput = '';

    process.stdin.on('data', (chunk) => {
        accumulatedInput += chunk.toString();
    });

    process.stdin.on('end', () => {
        processInputAndCompute(accumulatedInput);
    });

    const processInputAndCompute = (completeData) => {
        const numericValues = completeData.match(/\d+/g).map(Number);

        let dataPointer = 0;
        const arrayLength = numericValues[dataPointer++];
        const queryQuantity = numericValues[dataPointer++];

        const numberContainer = new Uint8Array(arrayLength).fill(1);

        const calculationModulus = 998244353;

        const reportCurrentValue = () => {
            const resultValue = Array.from(numberContainer).reduce((currentAccumulator, digitComponent) => {
                return (currentAccumulator * 10 + digitComponent) % calculationModulus;
            }, 0);
            console.log(resultValue);
        };

        for (let operationIndex = 0; operationIndex < queryQuantity; ++operationIndex) {
            const rangeStart = numericValues[dataPointer++] - 1;
            const rangeEnd = numericValues[dataPointer++] - 1;
            const replacementValue = numericValues[dataPointer++];

            numberContainer.fill(replacementValue, rangeStart, rangeEnd + 1);

            reportCurrentValue();
        }
    };
})();