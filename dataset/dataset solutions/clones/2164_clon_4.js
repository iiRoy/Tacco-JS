const processInputString = (textData) => {
    return String(textData).trim().split('\n')[0].split('').map(Number);
};

const determineMinimumTotal = (numericSequence) => {
    const sequenceLength = numericSequence.length;
    const memoizationTable = Array.from({ length: sequenceLength + 1 }, () => Array(2).fill(Number.MAX_SAFE_INTEGER));

    memoizationTable[sequenceLength][0] = 0; // No more digits, no incoming carry, cost is 0
    memoizationTable[sequenceLength][1] = 1; // No more digits, but an incoming carry of 1, cost is 1

    const calculateOptimalSum = (currentPosition, priorCarry) => {
        if (memoizationTable[currentPosition][priorCarry] !== Number.MAX_SAFE_INTEGER) {
            return memoizationTable[currentPosition][priorCarry];
        }

        const currentDigit = numericSequence[currentPosition];
        const effectiveDigitValue = currentDigit + priorCarry;

        let minimumSum = Number.MAX_SAFE_INTEGER;

        // Alternative 1: Do not add a carry to the left (more significant) position
        // Cost for current position is the remainder (effectiveValue % 10)
        // Carry to the right (less significant) position is the quotient (Math.floor(effectiveValue / 10))
        minimumSum = Math.min(
            minimumSum,
            (effectiveDigitValue % 10) + calculateOptimalSum(currentPosition + 1, Math.floor(effectiveDigitValue / 10))
        );

        // Alternative 2: Add a carry of 1 to the left (more significant) position
        // Cost for current position is (10 - remainder)
        // Carry to the right (less significant) position is (quotient + 1)
        minimumSum = Math.min(
            minimumSum,
            (10 - (effectiveDigitValue % 10)) + calculateOptimalSum(currentPosition + 1, Math.floor(effectiveDigitValue / 10) + 1)
        );
        
        return (memoizationTable[currentPosition][priorCarry] = minimumSum);
    };

    return calculateOptimalSum(0, 0); // Start from the first digit (index 0) with no initial carry
};

const executeProgram = (rawTextInput) => {
    const digitsArray = processInputString(rawTextInput);
    const finalCalculatedValue = determineMinimumTotal(digitsArray);
    console.log(finalCalculatedValue);
};

executeProgram(require("fs").readFileSync("/dev/stdin", "utf8"));