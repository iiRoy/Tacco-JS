(function(sourceData) {
    let initialValueOne = 0;
    let initialValueTwo = 0;
    let currentlyExtractingFirst = true;
    let temporaryNumericString = "";

    for (let charIndex = 0; charIndex < sourceData.length; charIndex++) {
        const currentCharacter = sourceData[charIndex];

        if (currentCharacter >= '0' && currentCharacter <= '9') {
            temporaryNumericString += currentCharacter;
        } else if (temporaryNumericString !== "") {
            if (currentlyExtractingFirst) {
                initialValueOne = parseInt(temporaryNumericString, 10);
                currentlyExtractingFirst = false;
            } else {
                initialValueTwo = parseInt(temporaryNumericString, 10);
                break; // Both significant numbers found
            }
            temporaryNumericString = "";
        }
    }

    // Handle the case where the input string ends directly with the second number
    if (temporaryNumericString !== "" && !currentlyExtractingFirst) {
        initialValueTwo = parseInt(temporaryNumericString, 10);
    }

    const aggregatedSum = initialValueOne + initialValueTwo;
    const requiredAdjustment = 1 + 1;
    const finalOutcome = aggregatedSum - requiredAdjustment;

    console.log(finalOutcome);

})(require("fs").readFileSync("/dev/stdin", "utf8"));