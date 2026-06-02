function processInputData(rawData) {
    let inputLines = rawData.split("\n");
    let lineIndex = 0;

    while (true) {
        const currentLineContent = inputLines[lineIndex];
        if (currentLineContent === "0 0") {
            break;
        }

        let combinationCount = 0;

        const lineParts = currentLineContent.split(" ");
        const parsedNumbers = parseStringArrayToInts(lineParts);

        const N_limit = parsedNumbers[0];
        const X_target = parsedNumbers[1];

        for (let firstVal = 1; firstVal <= N_limit; firstVal++) {
            for (let secondVal = firstVal + 1; secondVal <= N_limit; secondVal++) {
                const thirdValCandidate = X_target - firstVal - secondVal;

                if (thirdValCandidate > secondVal && thirdValCandidate <= N_limit) {
                    combinationCount++;
                }
            }
        }
        console.log(combinationCount);
        lineIndex++;
    }
}

function parseStringArrayToInts(stringArray) {
    return stringArray.map(strVal => parseInt(strVal, 10));
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf-8"));
