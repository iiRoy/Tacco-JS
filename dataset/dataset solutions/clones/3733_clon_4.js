function processInputData(sourceContent) {
    const newlinePosition = sourceContent.indexOf('\n');
    const firstSegment = sourceContent.substring(0, newlinePosition);

    const separatorPos = firstSegment.indexOf(' ');
    const firstValueString = firstSegment.substring(0, separatorPos);
    const secondValueString = firstSegment.substring(separatorPos + 1);

    const primaryFigure = Number(firstValueString);
    const secondaryFigure = Number(secondValueString);

    const adjustedPrimary = primaryFigure - 1;
    const adjustedSecondary = secondaryFigure - 1;

    function computeQuota(currentDividend, currentDivisor, accumulator = 0) {
        if (currentDivisor === 0) {
            return Infinity;
        }
        if (currentDividend <= 0) {
            return accumulator;
        }
        return computeQuota(currentDividend - currentDivisor, currentDivisor, accumulator + 1);
    }

    const finalQuota = computeQuota(adjustedPrimary, adjustedSecondary);

    console.log(finalQuota);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));