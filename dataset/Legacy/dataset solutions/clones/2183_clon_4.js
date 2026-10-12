const calculateProduct = (limit) => {
    if (limit < 0) return 0;
    if (limit <= 1) return 1;
    let currentProduct = 1;
    for (let j = 2; j <= limit; j++) {
        currentProduct *= j;
    }
    return currentProduct;
};

const retrieveCombinations = (totalItems, selectedItems) => {
    if (selectedItems < 0 || selectedItems > totalItems) return 0;
    if (selectedItems === 0 || selectedItems === totalItems) return 1;
    // The original code uses direct factorial division, so we replicate that.
    return calculateProduct(totalItems) / (calculateProduct(selectedItems) * calculateProduct(totalItems - selectedItems));
};

const processPatternIteratively = (inputNumberString, targetNonZeroCount) => {
    const totalLength = inputNumberString.length;
    // dpTable[currentDigitIndex][currentNonZeroCount][isPrefixExact]
    // currentDigitIndex: 0 to totalLength
    // currentNonZeroCount: 0 to targetNonZeroCount
    // isPrefixExact: 0 (false), 1 (true)
    const dpTable = Array.from({ length: totalLength + 1 }, () =>
        Array.from({ length: targetNonZeroCount + 1 }, () => Array(2).fill(0))
    );

    // Base case: When all digits have been processed (currentDigitIndex >= totalLength),
    // the original function returns 1, regardless of the non-zero count.
    // We replicate this behavior.
    for (let nzCount = 0; nzCount <= targetNonZeroCount; nzCount++) {
        dpTable[totalLength][nzCount][0] = 1; // For isPrefixExact = false
        dpTable[totalLength][nzCount][1] = 1; // For isPrefixExact = true
    }

    // Iterate from the last digit position down to the first
    for (let currentDigitIndex = totalLength - 1; currentDigitIndex >= 0; currentDigitIndex--) {
        // Iterate for the current non-zero digit count, from target down to 0
        for (let currentNonZeroCount = targetNonZeroCount; currentNonZeroCount >= 0; currentNonZeroCount--) {
            const digitAtCurrentPos = parseInt(inputNumberString[currentDigitIndex]);

            // --- Calculate for isPrefixExact = true (dpTable[currentDigitIndex][currentNonZeroCount][1]) ---
            let resultExactPrefix = 0;
            if (digitAtCurrentPos !== 0) {
                let valueComponent1 = 0;
                // Original condition: n-i != k-xnum  =>  totalLength - currentDigitIndex != targetNonZeroCount - currentNonZeroCount
                if (totalLength - currentDigitIndex !== targetNonZeroCount - currentNonZeroCount) {
                    // Original condition: k-xnum > 0 => targetNonZeroCount - currentNonZeroCount > 0
                    if (targetNonZeroCount - currentNonZeroCount > 0) {
                        // Original: pNum = factorial(keta-i-1)/(factorial(k-xnum)*factorial(keta-i-1-k+xnum));
                        // This is C(totalLength - currentDigitIndex - 1, targetNonZeroCount - currentNonZeroCount)
                        const combinationsFactor = retrieveCombinations(
                            totalLength - currentDigitIndex - 1,
                            targetNonZeroCount - currentNonZeroCount
                        );
                        // Original: num1 = (k-xnum)*9*pNum;
                        valueComponent1 = (targetNonZeroCount - currentNonZeroCount) * 9 * combinationsFactor;
                    } else { // targetNonZeroCount - currentNonZeroCount <= 0
                        valueComponent1 = 1; // Original num1=1
                    }
                }
                // else if (totalLength - currentDigitIndex === targetNonZeroCount - currentNonZeroCount), valueComponent1 remains 0.

                let valueComponent2 = 0;
                // Original condition: k-xnum > 0 => targetNonZeroCount - currentNonZeroCount > 0
                if (targetNonZeroCount - currentNonZeroCount > 0) {
                    // Original: if(n[i]>1){ num2=(n[i]-1)*getPattern(n,k,keta,i+1,xnum+1,false); }
                    // This part was immediately overwritten in the original, so its contribution is effectively zero.
                    // We only need to replicate the final assignment to num2.
                    // Original: num2=getPattern(n,k,keta,i+1,xnum+1,true);
                    // Corresponds to dpTable[currentDigitIndex + 1][currentNonZeroCount + 1][1]
                    if (currentNonZeroCount + 1 <= targetNonZeroCount) { // Ensure index is within bounds
                        valueComponent2 = dpTable[currentDigitIndex + 1][currentNonZeroCount + 1][1];
                    }
                }
                // else if (targetNonZeroCount - currentNonZeroCount <= 0), valueComponent2 remains 0.

                resultExactPrefix = valueComponent1 + valueComponent2;
            } else { // digitAtCurrentPos === 0
                // Original: num=getPattern(n,k,keta,i+1,xnum,true);
                // Corresponds to dpTable[currentDigitIndex + 1][currentNonZeroCount][1]
                resultExactPrefix = dpTable[currentDigitIndex + 1][currentNonZeroCount][1];
            }
            dpTable[currentDigitIndex][currentNonZeroCount][1] = resultExactPrefix;

            // --- Calculate for isPrefixExact = false (dpTable[currentDigitIndex][currentNonZeroCount][0]) ---
            let resultLoosePrefix = 0;
            // Original: const pNum=factorial(keta-i)/(factorial(k-xnum)*factorial(keta-i-k+xnum));
            // This is C(totalLength - currentDigitIndex, targetNonZeroCount - currentNonZeroCount)
            const combinationsLoose = retrieveCombinations(
                totalLength - currentDigitIndex,
                targetNonZeroCount - currentNonZeroCount
            );
            // Original: num=(k-xnum)*9*pNum;
            resultLoosePrefix = (targetNonZeroCount - currentNonZeroCount) * 9 * combinationsLoose;
            dpTable[currentDigitIndex][currentNonZeroCount][0] = resultLoosePrefix;
        }
    }

    // The final answer corresponds to the initial call:
    // getPattern(n, k, keta, 0, 0, true)
    // which maps to dpTable[0][0][1]
    return dpTable[0][0][1];
};

function EntryPoint(inputData) {
    const inputLines = inputData.split("\n");
    const numberString = inputLines[0];
    const targetKValue = parseInt(inputLines[1]);
    
    const finalResult = processPatternIteratively(numberString, targetKValue);
    console.log(finalResult);
}
EntryPoint(require('fs').readFileSync('/dev/stdin','utf8'));
