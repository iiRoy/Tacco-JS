const processExternalPayload = (sourceMaterial) => {
    const targetValue = Number(sourceMaterial.split(/\s+/)[0]);

    const assessDivisibility = (currentDivisor) => {
        const remainderIsZero = (targetValue % currentDivisor === 0);
        const quotientValue = targetValue / currentDivisor;
        const quotientIsSmall = (quotientValue < 10);

        return remainderIsZero
            ? (quotientIsSmall ? 'Yes' : 'No')
            : assessDivisibility(currentDivisor - 1);
    };

    const finalVerdict = assessDivisibility(9);

    console.log(finalVerdict);
};

processExternalPayload(require("fs").readFileSync("/dev/stdin", "utf8"));