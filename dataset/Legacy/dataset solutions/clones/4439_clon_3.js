function processInput(rawData) {
    const NEWLINE_DELIMITER = "\n";
    const SPACE_DELIMITER = " ";
    const DIVISOR_FOUR = 4;
    const DIVISOR_TWO = 2;
    const REMAINDER_ONE = 1;
    const ZERO_VALUE = 0;
    const ONE_VALUE = 1;

    const lines = rawData.split(NEWLINE_DELIMITER);
    const arraySize = Number(lines[ZERO_VALUE]);
    const stringElements = lines[ONE_VALUE].split(SPACE_DELIMITER);

    const numericElements = stringElements.map(str => Number(str));

    const halfSize = arraySize / DIVISOR_TWO;
    let quadrupleCount = ZERO_VALUE;
    let oddNumberCount = ZERO_VALUE;

    const totalElements = numericElements.length;

    for (let idx = ZERO_VALUE; idx < totalElements; idx++) {
        const currentElement = numericElements[idx];
        if (currentElement % DIVISOR_FOUR === ZERO_VALUE) {
            quadrupleCount++;
        } else if (currentElement % DIVISOR_TWO === REMAINDER_ONE) {
            oddNumberCount++;
        }
    }

    let finalResult = "";

    const isHalfSizeLessThanOddCount = halfSize < oddNumberCount;
    const isOddCountMinusOneLessThanOrEqualToQuadrupleCount = oddNumberCount - ONE_VALUE <= quadrupleCount;
    const isOddCountLessThanOrEqualToQuadrupleCount = oddNumberCount <= quadrupleCount;

    if (isHalfSizeLessThanOddCount) {
        if (isOddCountMinusOneLessThanOrEqualToQuadrupleCount) {
            finalResult = "Yes";
        } else {
            finalResult = "No";
        }
    } else {
        if (isOddCountLessThanOrEqualToQuadrupleCount) {
            finalResult = "Yes";
        } else {
            finalResult = "no";
        }
    }
    console.log(finalResult);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
