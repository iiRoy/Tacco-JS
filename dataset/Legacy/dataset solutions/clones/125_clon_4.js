const processInputValues = () => {
    const inputSegments = require("fs").readFileSync("/dev/stdin", "utf8").split(/\s/);

    const deriveBitwiseComponents = (sourceValue) => {
        const numericalRepresentation = Number(sourceValue);

        const bitPositions = Array.from({ length: 9 }, (_, index) => index);

        const activePowers = bitPositions.reduce((accumulator, currentBitIndex) => {
            const currentPowerOfTwo = 1 << currentBitIndex;
            if ((numericalRepresentation & currentPowerOfTwo) !== 0) {
                accumulator.push(currentPowerOfTwo);
            }
            return accumulator;
        }, []);

        return activePowers.join(' ');
    };

    inputSegments.forEach(segment => {
        const outputString = deriveBitwiseComponents(segment);
        console.log(outputString);
    });
};

processInputValues();
