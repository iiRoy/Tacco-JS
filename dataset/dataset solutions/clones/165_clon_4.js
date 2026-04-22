const fileProcessor = require('fs');

const extractPuzzleData = () => {
    const sourceContent = fileProcessor.readFileSync('/dev/stdin', 'utf8');
    return sourceContent.trim().split('\n');
};

const generateAllPermutations = (elements) => {
    if (elements.length <= 1) {
        return [elements];
    }
    const outcomes = [];
    elements.forEach((firstElement, idx) => {
        const remainingElements = elements.slice(0, idx).concat(elements.slice(idx + 1));
        const subOutcomes = generateAllPermutations(remainingElements);
        subOutcomes.forEach(subOutcome => outcomes.push([firstElement, ...subOutcome]));
    });
    return outcomes;
};

const arithmeticSymbols = ['+', '-', '*'];

const generateOperatorSequences = (desiredCount) => {
    if (desiredCount === 0) {
        return [[]];
    }
    const allSequences = [];
    const previousSequences = generateOperatorSequences(desiredCount - 1);
    arithmeticSymbols.forEach(symbol => {
        previousSequences.forEach(prevSeq => allSequences.push([symbol, ...prevSeq]));
    });
    return allSequences;
};

const interpretPostfix = (tokenStream) => {
    const valueStack = [];
    const textualStack = [];

    for (const item of tokenStream) {
        if (typeof item === 'number') {
            valueStack.push(item);
            textualStack.push(item.toString());
        } else { // Operator
            const rightValue = valueStack.pop();
            const leftValue = valueStack.pop();
            let computedValue;
            switch (item) {
                case '+': computedValue = leftValue + rightValue; break;
                case '-': computedValue = leftValue - rightValue; break;
                case '*': computedValue = leftValue * rightValue; break;
            }
            valueStack.push(computedValue);

            const rightText = textualStack.pop();
            const leftText = textualStack.pop();
            const formattedText = `(${leftText} ${item} ${rightText})`;
            textualStack.push(formattedText);
        }
    }
    return { finalEvaluation: valueStack.pop(), finalTextualRepresentation: textualStack.pop() };
};

const expressionStructures = [
    (numbers, ops) => [numbers[0], numbers[1], ops[0], numbers[2], ops[1], numbers[3], ops[2]], // ((N1 O1 N2) O2 N3) O3 N4
    (numbers, ops) => [numbers[0], numbers[1], numbers[2], ops[0], ops[1], numbers[3], ops[2]], // (N1 O2 (N2 O1 N3)) O3 N4
    (numbers, ops) => [numbers[0], numbers[1], ops[0], numbers[2], numbers[3], ops[1], ops[2]]  // (N1 O1 N2) O3 (N3 O2 N4)
];

const executePuzzleSolver = () => {
    const rawPuzzleLines = extractPuzzleData();
    let currentLinePosition = 0;

    const allOpSequences = generateOperatorSequences(3);
    // Mimic original behavior: skip the '---' operator sequence
    const filteredOpSequences = allOpSequences.filter(seq => !(seq[0] === '-' && seq[1] === '-' && seq[2] === '-'));

    while (true) {
        const currentPuzzle = rawPuzzleLines[currentLinePosition];
        if (currentPuzzle === '0 0 0 0') {
            break;
        }

        const numericInputs = currentPuzzle.split(' ').map(Number);
        let solutionDiscovered = false;
        const processedPermutationHashes = new Set(); // Avoid redundant checks for same permutation key

        const allNumberPermutations = generateAllPermutations(numericInputs);

        for (const numberPermutation of allNumberPermutations) {
            // Replicate original's `searched` array logic for permutation memoization
            const permutationHash = numberPermutation[0] * 1000 + numberPermutation[1] * 100 + numberPermutation[2] * 10 + numberPermutation[3];
            if (processedPermutationHashes.has(permutationHash)) {
                continue;
            }
            processedPermutationHashes.add(permutationHash);

            for (const operatorSequence of filteredOpSequences) {
                for (const formConstructor of expressionStructures) {
                    const postfixExpression = formConstructor(numberPermutation, operatorSequence);
                    const { finalEvaluation, finalTextualRepresentation } = interpretPostfix(postfixExpression);

                    if (finalEvaluation === 10) {
                        console.log(finalTextualRepresentation);
                        solutionDiscovered = true;
                        // Exit all loops for current puzzle
                        break;
                    }
                }
                if (solutionDiscovered) break;
            }
            if (solutionDiscovered) break;
        }

        if (!solutionDiscovered) {
            console.log(0);
        }
        currentLinePosition++;
    }
};

executePuzzleSolver();