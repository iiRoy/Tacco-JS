function processInputData(inputString) {
    const lines = inputString.split("\n");
    const numEntries = Number(lines[0]);
    console.log(numEntries);

    const dataPairs = lines.slice(1, numEntries + 1).map(line => {
        const parts = line.split(" ");
        return [Number(parts[0]), Number(parts[1])];
    });

    const determineScaleFactor = (targetValue, currentValue) => {
        if (targetValue === 0) {
            return 1;
        }
        return Math.ceil(targetValue / currentValue);
    };

    const finalValues = dataPairs.reduce((accumulator, currentPair) => {
        const [previousX, previousY] = accumulator;
        const [currentX, currentY] = currentPair;

        const factorForX = determineScaleFactor(previousX, currentX);
        const factorForY = determineScaleFactor(previousY, currentY);

        const effectiveFactor = Math.max(factorForX, factorForY);

        return [currentX * effectiveFactor, currentY * effectiveFactor];
    }, [0, 0]);

    const [resultX, resultY] = finalValues;
    console.log(resultX + resultY + "\n");
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
