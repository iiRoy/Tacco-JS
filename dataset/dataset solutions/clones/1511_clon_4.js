const calculateDivisorCount = (val) => {
    if (val === 1) return 1;

    const upperLimit = Math.floor(Math.sqrt(val));
    
    const divisorInfo = Array.from({ length: upperLimit }, (_, idx) => idx + 1)
        .reduce((accumulator, currentDivisor) => {
            if (val % currentDivisor === 0) {
                accumulator.count += 2;
                if (currentDivisor * currentDivisor === val) {
                    accumulator.isSquare = true;
                }
            }
            return accumulator;
        }, { count: 0, isSquare: false });

    return divisorInfo.isSquare ? divisorInfo.count - 1 : divisorInfo.count;
};

const processInput = (rawText) => {
    const numericValue = parseInt(rawText.trim(), 10);

    const finalSum = Array.from({ length: numericValue - 1 }, (_, index) => index + 1)
        .reduce((accumulator, currentNumber) => {
            return accumulator + calculateDivisorCount(currentNumber);
        }, 0);

    console.log(finalSum);
};
 
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
