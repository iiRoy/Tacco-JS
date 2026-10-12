function calculatePairs(rawInputString) {
    const inputLineArray = rawInputString.split("\n");
    const firstLineValues = inputLineArray[0].split(" ");

    const parseInteger = (strValue) => parseInt(strValue, 10);

    const upperLimit = parseInteger(firstLineValues[0]);
    const requiredRemainder = parseInteger(firstLineValues[1]);

    const effectiveMinRemainder = requiredRemainder || 1;

    let validPairCount = 0;

    const checkPairCondition = (valA, valB, minRemThreshold) => {
        const isLessThan = valA < valB;
        const remainderCondition = valA % valB >= minRemThreshold;
        return isLessThan || remainderCondition;
    };

    for (let firstNum = effectiveMinRemainder; firstNum <= upperLimit; firstNum++) {
        for (let secondNum = effectiveMinRemainder; secondNum <= upperLimit; secondNum++) {
            if (checkPairCondition(firstNum, secondNum, effectiveMinRemainder)) {
                validPairCount++;
            }
        }
    }
    console.log(validPairCount);
}

calculatePairs(require("fs").readFileSync("/dev/stdin", "utf8"));
