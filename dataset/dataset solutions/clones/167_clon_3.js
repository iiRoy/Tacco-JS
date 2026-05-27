const generatePermutations = () => {
    const resultPermutations = [];
    const currentPermutation = new Array(4);
    const usedIndices = new Array(4).fill(false);

    const backtrackPermutation = (kthPosition) => {
        if (kthPosition === 4) {
            resultPermutations.push([...currentPermutation]);
            return;
        }

        for (let i = 0; i < 4; i++) {
            if (!usedIndices[i]) {
                usedIndices[i] = true;
                currentPermutation[kthPosition] = i;
                backtrackPermutation(kthPosition + 1);
                usedIndices[i] = false;
            }
        }
    };

    backtrackPermutation(0);
    return resultPermutations;
};

const allPermutations = generatePermutations();

const evaluateAndStoreIfTen = (expressionString, currentSolution) => {
    if (currentSolution !== 0) {
        return currentSolution;
    }
    try {
        if (eval(expressionString) === 10) {
            return expressionString;
        }
    } catch (error) {
        // Errors during eval (e.g., division by zero) are implicitly ignored by original code.
        // We maintain this behavior.
    }
    return currentSolution;
};

const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
const inputLines = rawData.trim().split("\n");

const operators = ["+", "-", "*"];

while (true) {
    const currentInputLine = inputLines.shift();
    if (currentInputLine === "0 0 0 0") {
        break;
    }

    const numbersArray = currentInputLine.split(" ").map(Number);
    let resultExpression = 0;

    for (let opIdx1 = 0; opIdx1 < 3; opIdx1++) {
        for (let opIdx2 = 0; opIdx2 < 3; opIdx2++) {
            for (let opIdx3 = 0; opIdx3 < 3; opIdx3++) {

                for (const currentPermutation of allPermutations) {
                    if (resultExpression !== 0) {
                        break;
                    }

                    const numA = numbersArray[currentPermutation[0]];
                    const numB = numbersArray[currentPermutation[1]];
                    const numC = numbersArray[currentPermutation[2]];
                    const numD = numbersArray[currentPermutation[3]];

                    let candidateExpression = "";

                    // Form 1: a op1 b op2 c op3 d
                    candidateExpression = `${numA}${operators[opIdx1]}${numB}${operators[opIdx2]}${numC}${operators[opIdx3]}${numD}`;
                    resultExpression = evaluateAndStoreIfTen(candidateExpression, resultExpression);

                    // Form 2: (a op1 b op2 c) op3 d
                    if (resultExpression === 0) {
                        const innerPart1 = `${numA}${operators[opIdx1]}${numB}${operators[opIdx2]}${numC}`;
                        candidateExpression = `(${innerPart1})${operators[opIdx3]}${numD}`;
                        resultExpression = evaluateAndStoreIfTen(candidateExpression, resultExpression);
                    }

                    // Form 3: (a op1 b) op2 (c op3 d)
                    if (resultExpression === 0) {
                        const innerPart2 = `${numA}${operators[opIdx1]}${numB}`;
                        const innerPart3 = `${numC}${operators[opIdx3]}${numD}`;
                        candidateExpression = `(${innerPart2})${operators[opIdx2]}(${innerPart3})`;
                        resultExpression = evaluateAndStoreIfTen(candidateExpression, resultExpression);
                    }

                    // Form 4: ((a op1 b) op2 c) op3 d
                    if (resultExpression === 0) {
                        const innerPart4 = `(${numA}${operators[opIdx1]}${numB})${operators[opIdx2]}${numC}`;
                        candidateExpression = `(${innerPart4})${operators[opIdx3]}${numD}`;
                        resultExpression = evaluateAndStoreIfTen(candidateExpression, resultExpression);
                    }
                }
                if (resultExpression !== 0) {
                    break;
                }
            }
            if (resultExpression !== 0) {
                break;
            }
        }
        if (resultExpression !== 0) {
            break;
        }
    }

    if (resultExpression !== 0) {
        console.log(`(${resultExpression})`);
    } else {
        console.log(0);
    }
}
