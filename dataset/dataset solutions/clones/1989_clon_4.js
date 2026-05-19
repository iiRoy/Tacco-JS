function processInputData(rawInputContent) {
    const parsedLines = rawInputContent.split("\n");
    const limitValue = Number(parsedLines[0]);
    const characterString = parsedLines[1];

    let finalTally = 0;

    const areCharsUnique = (c1, c2, c3) => new Set([c1, c2, c3]).size === 3;

    function generateAndEvaluateTriplets(currentSelection, startIndex) {
        if (currentSelection.length === 3) {
            const [posA, posB, posC] = currentSelection;

            const charA = characterString[posA - 1];
            const charB = characterString[posB - 1];
            const charC = characterString[posC - 1];

            const distinctCondition = areCharsUnique(charA, charB, charC);
            const nonArithmeticCondition = (posB - posA !== posC - posB);

            if (distinctCondition && nonArithmeticCondition) {
                console.log(posA, posB, posC);
                finalTally++;
            }
            return;
        }

        for (let currentNum = startIndex; currentNum <= limitValue; currentNum++) {
            currentSelection.push(currentNum);
            generateAndEvaluateTriplets(currentSelection, currentNum + 1);
            currentSelection.pop();
        }
    }

    generateAndEvaluateTriplets([], 1);

    console.log(finalTally);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
