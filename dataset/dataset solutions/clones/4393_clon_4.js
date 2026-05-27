function processInputData(rawData) {
    const lineSegments = rawData.split('\n')[0].split(' ');

    const primaryNumericValue = Number(lineSegments[0]);
    const secondaryNumericValue = Number(lineSegments[1]);
    const tertiaryNumericValue = Number(lineSegments[2]);

    const differenceOne = primaryNumericValue - secondaryNumericValue;
    const differenceTwo = primaryNumericValue - tertiaryNumericValue;

    const absoluteDifferenceOne = differenceOne < 0 ? -differenceOne : differenceOne;
    const absoluteDifferenceTwo = differenceTwo < 0 ? -differenceTwo : differenceTwo;

    const computedMaximum = absoluteDifferenceOne > absoluteDifferenceTwo ? absoluteDifferenceOne : absoluteDifferenceTwo;

    console.log(computedMaximum);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
