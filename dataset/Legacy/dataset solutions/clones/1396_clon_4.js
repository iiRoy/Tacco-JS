function processInput(rawData) {
    const spacePosition = rawData.indexOf(' ');
    const firstValueString = rawData.substring(0, spacePosition);
    const secondValueString = rawData.substring(spacePosition + 1);

    const dividend = Number(firstValueString);
    const divisor = Number(secondValueString);

    const truncatedQuotient = Math.trunc(dividend / divisor);
    const remainderValue = dividend % divisor;
    const preciseQuotient = dividend / divisor;

    const formattedPreciseQuotient = preciseQuotient.toFixed(6);

    console.log(`${truncatedQuotient} ${remainderValue} ${formattedPreciseQuotient}`);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
