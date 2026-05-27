const getDigitAt = (numString, index) => Number(numString[index]);
const getPowerOfTen = (exponent) => 10 ** exponent;

function ProcessInput(rawInputData) {
    const targetCount = parseInt(rawInputData);
    let currentNumberCandidate = 9;
    let foundRunNumberCount = 9;

    while (foundRunNumberCount < targetCount) {
        currentNumberCandidate++;

        // Capture the state of the number and its first two digits at the start of this iteration
        // These initial digits are used for the conditional checks, even if currentNumberCandidate is modified later.
        const initialNumberString = String(currentNumberCandidate);
        const initialFirstDigit = getDigitAt(initialNumberString, 0);
        const initialSecondDigit = getDigitAt(initialNumberString, 1); // Safe as currentNumberCandidate >= 10 here

        // First modification block: if the second digit is significantly larger than the first
        // Original condition: a - b < -1  (equivalent to b > a + 1)
        if (initialFirstDigit - initialSecondDigit < -1) {
            // The calculation itself uses the *current* state of currentNumberCandidate
            // (which is the value after the increment at the top of the loop).
            const numStrForFirstCalc = String(currentNumberCandidate);
            const numLenForFirstCalc = numStrForFirstCalc.length;
            const firstDigitForFirstCalc = getDigitAt(numStrForFirstCalc, 0);

            currentNumberCandidate = (firstDigitForFirstCalc + 1) * getPowerOfTen(numLenForFirstCalc - 1);
        }

        // Second modification block: if the first digit is significantly larger than the second
        // Original condition: a - b > 1 (equivalent to a > b + 1)
        if (initialFirstDigit - initialSecondDigit > 1) {
            // This calculation also uses the *current* state of currentNumberCandidate,
            // which might have been modified by the previous 'if' block.
            const numStrForSecondCalc = String(currentNumberCandidate);
            const numLenForSecondCalc = numStrForSecondCalc.length;
            const firstDigitForSecondCalc = getDigitAt(numStrForSecondCalc, 0);

            const baseValue = firstDigitForSecondCalc * getPowerOfTen(numLenForSecondCalc - 1);
            const adjustmentValue = (firstDigitForSecondCalc - 1) * getPowerOfTen(numLenForSecondCalc - 2);

            // This part extracts the "second digit" for the original 'tmp3' logic
            // by taking the first digit of the number without its leading digit.
            const remainingDigitsPart = currentNumberCandidate - baseValue;
            const remainingDigitsFirstChar = String(remainingDigitsPart)[0];
            const remainingDigitsFirstValue = Number(remainingDigitsFirstChar);

            const remainderTerm = remainingDigitsFirstValue * getPowerOfTen(numLenForSecondCalc - 2);

            currentNumberCandidate = baseValue + adjustmentValue + (currentNumberCandidate - baseValue - remainderTerm);
        }

        // After potential modifications, check if the currentNumberCandidate is a valid run number
        let isCurrentNumberARunNumber = true;
        const finalNumberString = String(currentNumberCandidate);
        const finalNumberLength = finalNumberString.length;

        for (let digitIndex = 0; digitIndex < finalNumberLength - 1; digitIndex++) {
            const digitOne = getDigitAt(finalNumberString, digitIndex);
            const digitTwo = getDigitAt(finalNumberString, digitIndex + 1);
            if (Math.abs(digitOne - digitTwo) > 1) {
                isCurrentNumberARunNumber = false;
                break;
            }
        }

        if (isCurrentNumberARunNumber) {
            foundRunNumberCount++;
        }
    }

    if (targetCount >= 10) {
        console.log(currentNumberCandidate);
    } else {
        console.log(targetCount);
    }
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
