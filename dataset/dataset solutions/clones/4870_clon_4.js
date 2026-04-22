function fetchNumericalData(textualInput) {
    let extractedValues = [];
    let currentNumberAccumulator = "";
    for (let index = 0; index < textualInput.length; index++) {
        const character = textualInput[index];
        if (character >= '0' && character <= '9') {
            currentNumberAccumulator += character;
        } else if (currentNumberAccumulator.length > 0) {
            extractedValues.push(Number(currentNumberAccumulator));
            currentNumberAccumulator = "";
        }
    }
    if (currentNumberAccumulator.length > 0) {
        extractedValues.push(Number(currentNumberAccumulator));
    }
    return extractedValues;
}

function determineRelation(sourceText) {
    const numericalComponents = fetchNumericalData(sourceText);

    const valX = numericalComponents[0];
    const valY = numericalComponents[1];
    const valZ = numericalComponents[2];

    const lowestComponent = Math.min(valX, valY, valZ);
    const highestComponent = Math.max(valX, valY, valZ);
    const middleComponent = valX + valY + valZ - lowestComponent - highestComponent;

    let finalVerdict;
    if (lowestComponent + middleComponent === highestComponent) {
        finalVerdict = "Yes";
    } else {
        finalVerdict = "No";
    }
    console.log(finalVerdict);
}

determineRelation(require("fs").readFileSync("/dev/stdin", "utf8"));