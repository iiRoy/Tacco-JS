function processInputAndSolve(inputData) {
    const lines = inputData.split('\n');
    const numElements = Number(lines[0]);
    const inputString = lines[1];

    const charToId = { 'R': 0, 'G': 1, 'B': 2 };
    const idToChar = ['R', 'G', 'B'];

    const suffixOccurrences = Array(3).fill(0).map(() => Array(numElements + 1).fill(0));

    for (let currentIdx = numElements - 1; currentIdx >= 0; currentIdx--) {
        for (let charId = 0; charId < 3; charId++) {
            suffixOccurrences[charId][currentIdx] = suffixOccurrences[charId][currentIdx + 1];
        }
        const charIdOfCurrent = charToId[inputString[currentIdx]];
        suffixOccurrences[charIdOfCurrent][currentIdx]++;
    }

    let finalResult = 0;

    for (let idxA = 0; idxA < numElements; idxA++) {
        for (let idxB = idxA + 1; idxB < numElements; idxB++) {
            const charA = inputString[idxA];
            const charB = inputString[idxB];

            if (charA === charB) {
                continue;
            }

            let requiredChar = '';
            for (const c of idToChar) {
                if (c !== charA && c !== charB) {
                    requiredChar = c;
                    break;
                }
            }
            const requiredCharId = charToId[requiredChar];

            let currentCountForC = suffixOccurrences[requiredCharId][idxB + 1];

            const forbiddenIndex = 2 * idxB - idxA;

            if (forbiddenIndex < numElements && inputString[forbiddenIndex] === requiredChar) {
                currentCountForC--;
            }
            
            finalResult += currentCountForC;
        }
    }

    console.log(finalResult);
}

processInputAndSolve(require("fs").readFileSync("/dev/stdin", "utf8"));
