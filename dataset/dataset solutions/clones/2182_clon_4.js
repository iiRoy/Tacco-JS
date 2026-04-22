(function() {
    const fileSystemModule = require('fs');
    const inputContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

    const dataLines = inputContent.trim().split("\n");
    const firstOperand = parseInt(dataLines[0], 10);
    const secondOperand = parseInt(dataLines[1], 10);

    const calculatedOutcome = processComputationalTask(firstOperand, secondOperand);
    console.log(calculatedOutcome);
})();

function processComputationalTask(paramA, paramB) {
    const lengthOfParamA = String(paramA).length;
    let cumulativeResult = 0;
    let outerLoopStopCondition = false;

    const powerNineLookup = [1, 9, 81, 729]; // Precomputed powers of 9 for exponents 0, 1, 2, 3

    Array.from({ length: 100 }, (_, loopCounter) => {
        if (outerLoopStopCondition) return;

        const currentBinaryString = loopCounter.toString(2);
        if (currentBinaryString.length > lengthOfParamA) {
            outerLoopStopCondition = true;
            return;
        }

        const countOfOnes = (currentBinaryString.match(/1/g) || []).length;
        if (countOfOnes !== paramB) {
            return;
        }

        if (currentBinaryString.length < lengthOfParamA) {
            cumulativeResult += powerNineLookup[countOfOnes];
        } else {
            let innerLoopStopCondition = false;
            Array.from({ length: 999 - 111 + 1 }, (_, innerCounter) => innerCounter + 111).forEach(replacementSourceValue => {
                if (innerLoopStopCondition) return;

                const constructedNumericValue = assembleFromPattern(currentBinaryString, replacementSourceValue);
                
                if (constructedNumericValue > paramA) {
                    innerLoopStopCondition = true;
                    return;
                }
                cumulativeResult++;
            });
        }
    });

    return cumulativeResult;
}

function assembleFromPattern(binaryRepresentationMask, sourceDigitsForOnes) {
    const reversedMaskArray = binaryRepresentationMask.split("").reverse();
    const reversedSourceDigitArray = String(sourceDigitsForOnes).split("").reverse();
    let outputDigitArray = [];
    let sourceIndex = 0;

    for (let charPos = 0; charPos < reversedMaskArray.length; charPos++) {
        if (reversedMaskArray[charPos] === '1') {
            if (sourceIndex >= reversedSourceDigitArray.length) {
                return NaN; 
            }
            outputDigitArray.push(reversedSourceDigitArray[sourceIndex]);
            sourceIndex++;
        } else {
            outputDigitArray.push('0');
        }
    }
    return Number(outputDigitArray.reverse().join(""));
}