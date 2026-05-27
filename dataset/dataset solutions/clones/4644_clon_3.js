function isArithmeticProgression(valA, valB, valC) {
    const differenceBetweenFirstTwo = valB - valA;
    const differenceBetweenLastTwo = valC - valB;
    return differenceBetweenFirstTwo === differenceBetweenLastTwo;
}

function processInputData(rawInputString) {
    const stringComponents = rawInputString.split(" ");

    const firstNumericValue = Number(stringComponents[0]);
    const secondNumericValue = Number(stringComponents[1]);
    const thirdNumericValue = Number(stringComponents[2]);

    const checkResult = isArithmeticProgression(firstNumericValue, secondNumericValue, thirdNumericValue);

    let outputDecision;
    if (checkResult) {
        outputDecision = "YES";
    } else {
        outputDecision = "NO";
    }

    console.log(outputDecision);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8").trim());
