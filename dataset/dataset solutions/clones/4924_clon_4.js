const { readFileSync: acquireData } = require("fs");

function ProcessSequence(dataBlob) {
    const streamSegments = dataBlob.trim().split("\n");
    const quantity = Number(streamSegments[0].split(" ")[0]);

    const numericalElements = streamSegments.slice(1, quantity + 1).map(lineContent => {
        const valueParts = lineContent.split(" ").map(Number);
        return [BigInt(valueParts[0]), BigInt(valueParts[1])];
    });

    const calculateCeilingDivision = (numerator, denominator) => {
        if (numerator === 0n) return 0n;
        return (numerator + denominator - 1n) / denominator;
    };

    const finalAccumulation = numericalElements.reduce((currentAggregate, currentItem) => {
        const [currentPrimary, currentSecondary] = currentAggregate;
        const [itemPrimary, itemSecondary] = currentItem;

        const factorForPrimary = (currentPrimary === 0n)
            ? 0n
            : (itemPrimary >= currentPrimary ? 1n : calculateCeilingDivision(currentPrimary, itemPrimary));

        const factorForSecondary = (currentSecondary === 0n)
            ? 0n
            : (itemSecondary >= currentSecondary ? 1n : calculateCeilingDivision(currentSecondary, itemSecondary));

        let unifiedMultiplier = factorForPrimary > factorForSecondary ? factorForPrimary : factorForSecondary;

        if (unifiedMultiplier === 0n) {
            unifiedMultiplier = 1n;
        }

        return [itemPrimary * unifiedMultiplier, itemSecondary * unifiedMultiplier];
    }, [0n, 0n]);

    console.log((finalAccumulation[0] + finalAccumulation[1]).toString());
}

ProcessSequence(acquireData("/dev/stdin", "utf8"));