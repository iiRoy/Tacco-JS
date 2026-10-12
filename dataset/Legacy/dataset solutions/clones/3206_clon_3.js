function convertToReversedDigitArray(numericValue) {
    return (numericValue + "").split("").reverse();
}

function processAndFormatDigits(digitArrayForProcessing) {
    let carryPropagatorIndex = 0;

    // Propagate carries and handle remainders
    // The loop condition replicates the original's behavior,
    // which means it terminates if digitArrayForProcessing[carryPropagatorIndex] is undefined or NaN.
    while (digitArrayForProcessing[carryPropagatorIndex] || digitArrayForProcessing[carryPropagatorIndex] === 0) {
        const currentDigitValue = digitArrayForProcessing[carryPropagatorIndex];
        const carryAmount = Math.floor(currentDigitValue / 10);
        const remainderDigit = currentDigitValue % 10;

        digitArrayForProcessing[carryPropagatorIndex] = remainderDigit;

        // Replicate original's implicit NaN behavior if next element is undefined.
        // If digitArrayForProcessing[carryPropagatorIndex + 1] is undefined,
        // `undefined + carryAmount` will result in NaN, matching the original bug.
        digitArrayForProcessing[carryPropagatorIndex + 1] = digitArrayForProcessing[carryPropagatorIndex + 1] + carryAmount;
        
        carryPropagatorIndex++;
    }

    // Convert all digits to strings
    let finalFormattedDigits = digitArrayForProcessing.map(d => d.toString());

    // Reverse the array to get the correct order
    finalFormattedDigits = finalFormattedDigits.reverse();

    // Remove leading zeros, but ensure "0" remains for a zero result
    while (finalFormattedDigits.length > 1 && (isNaN(finalFormattedDigits[0]) || finalFormattedDigits[0] === "0")) {
        finalFormattedDigits.shift();
    }

    return finalFormattedDigits.join("");
}

function times(firstOperand, secondOperand) {
    const firstDigitsReversed = convertToReversedDigitArray(firstOperand);
    const secondDigitsReversed = convertToReversedDigitArray(secondOperand);
    const lenFirst = firstDigitsReversed.length;
    const lenSecond = secondDigitsReversed.length;

    // Initialize intermediateDigits array with zeros to handle carries correctly,
    // matching the original 'times' function's explicit zero initialization.
    const intermediateDigits = Array(lenFirst + lenSecond).fill(0);

    for (let idx = 0; idx < lenFirst; idx++) {
        for (let innerIdx = 0; innerIdx < lenSecond; innerIdx++) {
            intermediateDigits[idx + innerIdx] += parseInt(firstDigitsReversed[idx]) * parseInt(secondDigitsReversed[innerIdx]);
        }
    }
    
    return processAndFormatDigits(intermediateDigits);
}

function adds(firstOperand, secondOperand) {
    const firstDigitsReversed = convertToReversedDigitArray(firstOperand);
    const secondDigitsReversed = convertToReversedDigitArray(secondOperand);
    const lenFirst = firstDigitsReversed.length;
    const lenSecond = secondDigitsReversed.length;

    const intermediateDigits = []; // Not pre-filled to replicate original's NaN bug for different lengths

    // The original code's `if(num1str[i]===undefined)num1str[i]=0;` lines are effectively no-ops.
    // `parseInt(undefined)` results in `NaN`, replicating the original bug where `NaN`s can be introduced.
    for (let idx = 0; idx < Math.max(lenFirst, lenSecond); idx++) {
        intermediateDigits[idx] = parseInt(firstDigitsReversed[idx]) + parseInt(secondDigitsReversed[idx]);
    }

    return processAndFormatDigits(intermediateDigits);
}

function subtracts(firstOperand, secondOperand) {
    const firstDigitsReversed = convertToReversedDigitArray(firstOperand);
    const secondDigitsReversed = convertToReversedDigitArray(secondOperand);
    const lenFirst = firstDigitsReversed.length;
    const lenSecond = secondDigitsReversed.length;

    const intermediateDigits = []; // Not pre-filled to replicate original's NaN bug for different lengths

    // The original code's `if(num1str[i]===undefined)num1str[i]=0;` lines are effectively no-ops.
    // `parseInt(undefined)` results in `NaN`, replicating the original bug where `NaN`s can be introduced.
    for (let idx = 0; idx < Math.max(lenFirst, lenSecond); idx++) {
        intermediateDigits[idx] = parseInt(firstDigitsReversed[idx]) - parseInt(secondDigitsReversed[idx]);
    }

    let carryPropagatorIndex = 0;
    // This carry propagation logic is specific to subtraction and differs from addition/multiplication.
    // It also replicates the original's behavior regarding NaN propagation.
    while (intermediateDigits[carryPropagatorIndex] || intermediateDigits[carryPropagatorIndex] === 0) {
        if (intermediateDigits[carryPropagatorIndex] < 0) {
            // Replicate original's implicit NaN behavior if next element is undefined.
            // If intermediateDigits[carryPropagatorIndex + 1] is undefined,
            // `undefined - 1` will result in NaN, matching the original bug.
            intermediateDigits[carryPropagatorIndex + 1] = intermediateDigits[carryPropagatorIndex + 1] - 1;
            intermediateDigits[carryPropagatorIndex] += 10;
        }
        carryPropagatorIndex++;
    }

    let finalResultDigits = intermediateDigits.reverse();
    while (finalResultDigits.length > 1 && (isNaN(finalResultDigits[0]) || finalResultDigits[0] === "0")) {
        finalResultDigits.splice(0, 1);
    }
    return finalResultDigits.join("");
}

function Main(inputContent) {
    const inputParts = inputContent.trim().split(' ');
    const inputKValue = parseInt(inputParts[0]);
    const inputAValue = parseInt(inputParts[1]);
    const inputBValue = parseInt(inputParts[2]);

    const diffValue = inputBValue - inputAValue;
    const effectiveKMinusA = inputKValue - inputAValue;

    let calculatedBiscuitCount = "0"; // Initialize as string to match adds/times return type

    if (effectiveKMinusA < 2 || diffValue < 3) {
        calculatedBiscuitCount = adds(inputKValue, 1);
    } else if (effectiveKMinusA % 2 === 0) {
        const halfEffectiveKMinusA = effectiveKMinusA / 2;
        const productTerm = times(halfEffectiveKMinusA, diffValue);
        const sumWithA = adds(productTerm, inputAValue);
        calculatedBiscuitCount = adds(sumWithA, 1);
    } else {
        const halfPlusOneEffectiveKMinusA = (effectiveKMinusA + 1) / 2;
        const productTerm = times(halfPlusOneEffectiveKMinusA, diffValue);
        calculatedBiscuitCount = adds(productTerm, inputAValue);
    }

    console.log(calculatedBiscuitCount);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
