class ComputationError extends Error {
    constructor(message) {
        super(message);
        this.name = "ComputationError";
    }
}

function performIntegerMultiplication(valueA, valueB) {
    return Math.imul(valueA, valueB);
}

function determineHighestWindowProduct(spanLength, numberSequence) {
    if (spanLength <= 0) {
        return 1;
    }

    if (!numberSequence || numberSequence.length < spanLength) {
        return -1;
    }

    let overallMaximumProduct = -Infinity;

    for (let startPosition = 0; startPosition <= numberSequence.length - spanLength; startPosition++) {
        let currentWindowProduct = 1;
        for (let windowIndex = 0; windowIndex < spanLength; windowIndex++) {
            currentWindowProduct = performIntegerMultiplication(currentWindowProduct, numberSequence[startPosition + windowIndex]);
        }
        overallMaximumProduct = Math.max(overallMaximumProduct, currentWindowProduct);
    }
    return overallMaximumProduct;
}

(function() {
    const rawInputData = require("fs").readFileSync("/dev/stdin", "utf8");
    const parsedTokens = rawInputData.split(/\s+/).filter(text => text.length > 0);

    let tokenReaderPosition = 0;
    const collectedResults = [];

    while (tokenReaderPosition < parsedTokens.length) {
        const elementCountStr = parsedTokens[tokenReaderPosition++];
        const windowLengthStr = parsedTokens[tokenReaderPosition++];

        const elementCountValue = parseInt(elementCountStr, 10);
        const windowLengthValue = parseInt(windowLengthStr, 10);

        if (isNaN(elementCountValue) || isNaN(windowLengthValue)) {
            throw new ComputationError("Input format error: Expected integers for element count and window length.");
        }

        if (elementCountValue === 0 && windowLengthValue === 0) {
            break;
        }

        if (tokenReaderPosition + elementCountValue > parsedTokens.length) {
            throw new ComputationError("Input data error: Insufficient numbers provided for the specified element count.");
        }

        const currentNumericSequence = [];
        for (let i = 0; i < elementCountValue; i++) {
            const numberText = parsedTokens[tokenReaderPosition++];
            const numberValue = parseInt(numberText, 10);
            if (isNaN(numberValue)) {
                throw new ComputationError("Input data error: Expected an integer within the number sequence.");
            }
            currentNumericSequence.push(numberValue);
        }

        const baselineMaxProduct = determineHighestWindowProduct(windowLengthValue, currentNumericSequence);

        let overallMaxProductAfterSwap = -Infinity;

        for (let i = 0; i < elementCountValue; i++) {
            for (let j = 0; j < elementCountValue; j++) {
                const originalValueAtI = currentNumericSequence[i];
                const originalValueAtJ = currentNumericSequence[j];

                currentNumericSequence[i] = originalValueAtJ;
                currentNumericSequence[j] = originalValueAtI;

                const productAfterCurrentSwap = determineHighestWindowProduct(windowLengthValue, currentNumericSequence);
                
                overallMaxProductAfterSwap = Math.max(overallMaxProductAfterSwap, productAfterCurrentSwap);

                currentNumericSequence[i] = originalValueAtI;
                currentNumericSequence[j] = originalValueAtJ;
            }
        }

        if (overallMaxProductAfterSwap < baselineMaxProduct) {
            collectedResults.push("NO GAME");
        } else {
            collectedResults.push(overallMaxProductAfterSwap - baselineMaxProduct);
        }
    }

    console.log(collectedResults.join("\n"));
})();