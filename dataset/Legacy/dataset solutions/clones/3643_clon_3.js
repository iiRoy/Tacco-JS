function getPaddedBinaryString(number, length) {
    return number.toString(2).padStart(length, '0');
}

function parseProblemData(rawData) {
    const inputLines = rawData.split("\n");
    const [problemCountStr, targetScoreStr] = inputLines[0].split(" ");

    const problemCount = parseInt(problemCountStr, 10);
    const targetScore = parseInt(targetScoreStr, 10);

    const problemQuantities = new Array(problemCount);
    const bonusScores = new Array(problemCount);
    const fullProblemTypeScores = new Array(problemCount);

    for (let i = 0; i < problemCount; i++) {
        const [quantityStr, bonusStr] = inputLines[i + 1].split(" ");
        problemQuantities[i] = parseInt(quantityStr, 10);
        bonusScores[i] = parseInt(bonusStr, 10);
        fullProblemTypeScores[i] = (100 * (i + 1) * problemQuantities[i]) + bonusScores[i];
    }
    return { problemCount, targetScore, problemQuantities, bonusScores, fullProblemTypeScores };
}

function processInput(rawData) {
    const { problemCount, targetScore, problemQuantities, bonusScores, fullProblemTypeScores } = parseProblemData(rawData);

    const INITIAL_MIN_PROBLEMS_SOLVED = 10000000000;
    let minProblemsSolved = INITIAL_MIN_PROBLEMS_SOLVED;

    const totalCombinations = Math.pow(2, problemCount);

    for (let combinationIterator = 0; combinationIterator < totalCombinations; combinationIterator++) {
        let currentScoreAccumulator = 0;
        let currentProblemElementsAccumulator = 0;

        const solvedProblemsBitmask = totalCombinations - 1 - combinationIterator;
        const solvedProblemsBinaryMask = getPaddedBinaryString(solvedProblemsBitmask, problemCount);

        for (let problemTypeIndex = 0; problemTypeIndex < problemCount; problemTypeIndex++) {
            if (solvedProblemsBinaryMask[problemTypeIndex] === '1') {
                currentScoreAccumulator += fullProblemTypeScores[problemTypeIndex];
                currentProblemElementsAccumulator += problemQuantities[problemTypeIndex];
            }
        }

        let firstUnsolvedProblemTypeIndex = -1;
        for (let i = 0; i < problemCount; i++) {
            if (solvedProblemsBinaryMask[i] === '0') {
                firstUnsolvedProblemTypeIndex = i;
                break;
            }
        }

        if (firstUnsolvedProblemTypeIndex !== -1) {
            const scorePerPartialProblem = 100 * (problemCount - firstUnsolvedProblemTypeIndex);

            for (let partialSolveIteration = 0; partialSolveIteration < problemQuantities[firstUnsolvedProblemTypeIndex]; partialSolveIteration++) {
                if (currentScoreAccumulator >= targetScore) {
                    break;
                }
                currentScoreAccumulator += scorePerPartialProblem;
                currentProblemElementsAccumulator += 1;
            }
        }

        if (currentScoreAccumulator >= targetScore) {
            minProblemsSolved = Math.min(minProblemsSolved, currentProblemElementsAccumulator);
        }
    }
    console.log(minProblemsSolved);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
