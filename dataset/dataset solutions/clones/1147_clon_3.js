function calculateLevenshteinDistance(rawInputData) {
    const inputLines = rawInputData.split("\n");
    const strA = inputLines[0];
    const strB = inputLines[1];

    const lenA = strA.length;
    const lenB = strB.length;

    const getCharMismatchCost = (char1, char2) => {
        if (char1 === char2) {
            return 0;
        } else {
            return 1;
        }
    };

    const levenshteinMatrix = [];

    // Initialize the first column and create inner arrays
    for (let rowIndex = 0; rowIndex <= lenA; rowIndex++) {
        levenshteinMatrix[rowIndex] = new Array(lenB + 1);
        levenshteinMatrix[rowIndex][0] = rowIndex;
    }

    // Initialize the first row
    for (let colIndex = 0; colIndex <= lenB; colIndex++) {
        levenshteinMatrix[0][colIndex] = colIndex;
    }

    // Populate the rest of the matrix
    for (let rowIndex = 1; rowIndex <= lenA; rowIndex++) {
        for (let colIndex = 1; colIndex <= lenB; colIndex++) {
            const charA = strA[rowIndex - 1];
            const charB = strB[colIndex - 1];

            const currentMismatchPenalty = getCharMismatchCost(charA, charB);

            const costFromDeletion = levenshteinMatrix[rowIndex - 1][colIndex] + 1;
            const costFromInsertion = levenshteinMatrix[rowIndex][colIndex - 1] + 1;
            const costFromSubstitution = levenshteinMatrix[rowIndex - 1][colIndex - 1] + currentMismatchPenalty;

            levenshteinMatrix[rowIndex][colIndex] = Math.min(
                costFromDeletion,
                costFromInsertion,
                costFromSubstitution
            );
        }
    }

    console.log(levenshteinMatrix[lenA][lenB]);
}

calculateLevenshteinDistance(require("fs").readFileSync("/dev/stdin", "utf8"));
