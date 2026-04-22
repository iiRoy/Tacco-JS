function verifyPowerOfTwo(numericTest) {
    return numericTest > 0 && (numericTest & (numericTest - 1)) === 0;
}

function determineNextPowerOfTwo(workingValue) {
    if (workingValue <= 0) return 1;

    workingValue--;
    workingValue |= workingValue >> 1;
    workingValue |= workingValue >> 2;
    workingValue |= workingValue >> 4;
    workingValue |= workingValue >> 8;
    workingValue |= workingValue >> 16;
    workingValue++;
    return workingValue;
}

function calculateOutcome(streamContent) {
    const initialQuantity = Number(streamContent);
    
    if (initialQuantity === 0) {
        console.log(1);
        return;
    }

    let finalResult;
    if (verifyPowerOfTwo(initialQuantity)) {
        finalResult = (initialQuantity * 2) - 1;
    } else {
        finalResult = determineNextPowerOfTwo(initialQuantity) - 1;
    }
    
    console.log(finalResult);
}

calculateOutcome(require("fs").readFileSync("/dev/stdin", "utf8"));