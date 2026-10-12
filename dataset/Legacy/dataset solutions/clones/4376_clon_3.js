const processInputData = (rawDataString) => {
    const trimmedInputContent = rawDataString.trim();
    const stringComponentArray = trimmedInputContent.split(' ');

    const DECIMAL_RADIX_VALUE = 10; // Define radix as a constant

    const numericValueArray = stringComponentArray.map(currentStringElement => {
        return parseInt(currentStringElement, DECIMAL_RADIX_VALUE);
    });

    const firstNumericTerm = numericValueArray[0];
    const secondNumericTerm = numericValueArray[1];

    const computedDifference = firstNumericTerm - secondNumericTerm;

    console.log(computedDifference);
};

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
