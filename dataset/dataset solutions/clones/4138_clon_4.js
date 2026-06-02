const processInputData = (sourceText) => {
    const [firstLineContent] = sourceText.split(/\r?\n/);
    const [baseString, targetString] = firstLineContent.split(/\s+/);

    const baseQuantity = Number(baseString);
    const targetQuantity = Number(targetString);

    let finalResult;
    const computedRatio = targetQuantity / baseQuantity;

    if (Number.isNaN(computedRatio)) {
        // Corresponds to 0/0, Math.log2(NaN) is NaN
        finalResult = NaN;
    } else if (computedRatio === Infinity) {
        // Corresponds to X/0 where X > 0, Math.log2(Infinity) is Infinity
        finalResult = Infinity;
    } else if (computedRatio === -Infinity) {
        // Corresponds to X/0 where X < 0, Math.log2(negative) is NaN
        finalResult = NaN;
    } else if (computedRatio === 0) {
        // Corresponds to 0/X where X != 0, Math.log2(0) is -Infinity
        finalResult = -Infinity;
    } else {
        // For finite, non-zero computedRatio, calculate floor(log2(computedRatio)) + 1
        let currentExponent = 0;
        let currentPower = 1; // Represents 2^currentExponent

        if (computedRatio >= 1) {
            // Find the largest integer k such that 2^k <= computedRatio
            // This loop finds k >= 0
            while (currentPower * 2 <= computedRatio) {
                currentPower *= 2;
                currentExponent++;
            }
        } else { // computedRatio is positive and less than 1
            // Find the largest integer k such that 2^k <= computedRatio
            // This loop finds k < 0
            while (currentPower > computedRatio) {
                currentPower /= 2;
                currentExponent--;
            }
        }
        finalResult = currentExponent + 1;
    }

    console.log(finalResult);
};

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
