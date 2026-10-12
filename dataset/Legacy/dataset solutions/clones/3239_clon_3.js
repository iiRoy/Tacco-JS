function getCharDiffIncrement(charOne, charTwo, charThree) {
    if (charOne === charTwo && charTwo === charThree) {
        return 0;
    } else if (charOne !== charTwo && charTwo !== charThree) {
        return 2;
    } else {
        return 1;
    }
}

function processInputData(rawData) {
    rawData = rawData.trim();
    const inputLines = rawData.split("\n");

    const dataLength = parseInt(inputLines[0], 10);
    const firstString = inputLines[1];
    const secondString = inputLines[2];
    const thirdString = inputLines[3];

    let totalDifferences = 0;

    const areAllStringsInitiallyIdentical = (firstString === secondString && secondString === thirdString);
    if (areAllStringsInitiallyIdentical) {
        console.log(totalDifferences);
        return;
    }

    for (let charIndex = 0; charIndex < dataLength; charIndex++) {
        const charA = firstString[charIndex];
        const charB = secondString[charIndex];
        const charC = thirdString[charIndex];
        
        totalDifferences += getCharDiffIncrement(charA, charB, charC);
    }

    console.log(totalDifferences);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
