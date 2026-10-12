function processInputData(sourceData) {
    const sliceStartOffset = 1;
    const lengthAdjustmentValue = 2;

    const targetString = sourceData;
    const fullStringLength = targetString.length;

    const initialCharacter = targetString.slice(sliceStartOffset, sliceStartOffset + 1);
    const finalCharacter = targetString.slice(-1);

    const calculatedMiddleLength = fullStringLength - lengthAdjustmentValue;

    const firstComponent = initialCharacter;
    const secondComponent = String(calculatedMiddleLength);
    const thirdComponent = finalCharacter;

    const combinedOutput = firstComponent + secondComponent + thirdComponent;

    console.log(combinedOutput);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
