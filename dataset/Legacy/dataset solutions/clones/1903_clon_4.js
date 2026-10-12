const dataStream = require("fs").readFileSync("/dev/stdin", "utf8");
const dataLines = dataStream.split('\n');
const targetValue = parseInt(dataLines[0], 10);

const calculatePowerOfFive = (numberValue) => numberValue ** 5;

const powerBaseMapping = new Map();
const upperBaseLimit = 5000; // Sufficiently large to cover X up to 10^9

for (let currentBase = 0; currentBase <= upperBaseLimit; ++currentBase) {
    const computedPower = calculatePowerOfFive(currentBase);
    powerBaseMapping.set(computedPower, currentBase);
}

const findPairAndPrint = () => {
    for (let primaryBase = 0; primaryBase <= upperBaseLimit; ++primaryBase) {
        const primaryPower = calculatePowerOfFive(primaryBase);

        // Check for primaryPower - secondaryPower = targetValue
        const requiredSecondaryPowerForDifference = primaryPower - targetValue;
        if (requiredSecondaryPowerForDifference >= 0 && powerBaseMapping.has(requiredSecondaryPowerForDifference)) {
            const secondaryBase = powerBaseMapping.get(requiredSecondaryPowerForDifference);
            process.stdout.write(`${primaryBase} ${secondaryBase}\n`);
            return;
        }

        // Check for primaryPower + secondaryPower = targetValue
        const requiredSecondaryPowerForSum = targetValue - primaryPower;
        if (requiredSecondaryPowerForSum >= 0 && powerBaseMapping.has(requiredSecondaryPowerForSum)) {
             const secondaryBase = powerBaseMapping.get(requiredSecondaryPowerForSum);
             process.stdout.write(`${primaryBase} ${-secondaryBase}\n`);
             return;
        }
    }
};

findPairAndPrint();