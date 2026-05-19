const checkShallowEquivalence = (firstObjectReference, secondObjectReference) => {
    const firstObjectPropertyNames = Object.getOwnPropertyNames(firstObjectReference);
    const secondObjectPropertyNames = Object.getOwnPropertyNames(secondObjectReference);

    if (firstObjectPropertyNames.length !== secondObjectPropertyNames.length) {
        return false;
    }

    return firstObjectPropertyNames.every(currentPropertyName =>
        Object.prototype.hasOwnProperty.call(secondObjectReference, currentPropertyName) &&
        firstObjectReference[currentPropertyName] === secondObjectReference[currentPropertyName]
    );
};

const obtainInteger = (inputStringValue) => {
    return Number(inputStringValue);
};

const processInputAndDisplay = (receivedInput) => {
    const convertedNumericValue = obtainInteger(receivedInput);
    const decisionMap = new Map([
        [true, "ABC"],
        [false, "ABD"]
    ]);
    const comparisonResultKey = convertedNumericValue <= 999;
    console.log(decisionMap.get(comparisonResultKey));
};

processInputAndDisplay(require("fs").readFileSync("/dev/stdin", "utf8"));
