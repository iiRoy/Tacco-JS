function Main(sourceData) {
    const lines = sourceData.split("\n");
    const initialSequence = lines[0];

    const checkUniformity = (sequence) => new Set(sequence.split('')).size === 1;

    if (checkUniformity(initialSequence)) {
        console.log(0);
        return;
    }

    const evolveSequence = (currentSequence, targetSymbol) => {
        return Array.from({ length: currentSequence.length - 1 }, (_, position) => {
            const symbolA = currentSequence.charAt(position);
            const symbolB = currentSequence.charAt(position + 1);
            return (symbolA === targetSymbol || symbolB === targetSymbol) ? targetSymbol : symbolA;
        }).join('');
    };

    const determineEvolutionSteps = (currentSequence, targetSymbol, currentIteration = 0) => {
        if (checkUniformity(currentSequence)) {
            return currentIteration;
        }
        const nextSequence = evolveSequence(currentSequence, targetSymbol);
        return determineEvolutionSteps(nextSequence, targetSymbol, currentIteration + 1);
    };

    const allPossibleSymbols = Array.from({ length: 26 }, (_, index) => String.fromCharCode('a'.charCodeAt(0) + index));

    const minimumEvolutionCount = allPossibleSymbols.reduce((currentMin, chosenSymbol) => {
        const stepsForSymbol = determineEvolutionSteps(initialSequence, chosenSymbol);
        return (currentMin === -1 || stepsForSymbol < currentMin) ? stepsForSymbol : currentMin;
    }, -1);

    console.log(minimumEvolutionCount);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
