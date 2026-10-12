let inputLinesArray = String(require("fs").readFileSync(0)).split('\n');

let paramN = Number(inputLinesArray[0]);
let finalResult = 0;

let charSequence = inputLinesArray[1];

for (let maskValue = (1 << paramN) - 1; maskValue >= 0; --maskValue) {
    let constructedString = "";
    for (let bitPosition = paramN - 1; bitPosition >= 0; --bitPosition) {
        if ((maskValue & (1 << bitPosition)) !== 0) {
            constructedString = charSequence[bitPosition] + constructedString;
        } else {
            constructedString = constructedString + charSequence[bitPosition];
        }
    }
    inputLinesArray[constructedString] = -~inputLinesArray[constructedString];
}

for (let maskValue = (1 << paramN) - 1; maskValue >= 0; --maskValue) {
    let constructedString = "";
    for (let bitPosition = paramN - 1; bitPosition >= 0; --bitPosition) {
        let effectiveCharIndex = (2 * paramN) + (~bitPosition);
        if ((maskValue & (1 << bitPosition)) !== 0) {
            constructedString = charSequence[effectiveCharIndex] + constructedString;
        } else {
            constructedString = constructedString + charSequence[effectiveCharIndex];
        }
    }
    finalResult += ~~inputLinesArray[constructedString];
}

console.log(finalResult);
