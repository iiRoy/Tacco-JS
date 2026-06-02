function createInputProcessor(rawInput, valueParser = Number) {
    let currentLines = rawInput.split("\n");
    let currentLineIndex = 0;
    let currentTokenIndex = 0;

    const grabValue = () => {
        let activeLine = currentLines[currentLineIndex];
        if (activeLine === undefined) {
            return undefined;
        }

        let tokensOnLine = activeLine.trim().split(" ");
        let value = tokensOnLine[currentTokenIndex];
        currentTokenIndex++;

        if (currentTokenIndex === tokensOnLine.length) {
            currentTokenIndex = 0;
            currentLineIndex++;
        }
        return valueParser(value);
    };

    const grabLine = () => {
        let activeLine = currentLines[currentLineIndex];
        if (activeLine === undefined) {
            return [];
        }

        currentTokenIndex = 0;
        currentLineIndex++;
        return activeLine.split(" ").map(valueParser);
    };

    return { grabValue, grabLine };
}

function processInputData(inputStringData) {
    const inputReader = createInputProcessor(inputStringData);

    const limitN = inputReader.grabValue();
    const targetM = inputReader.grabValue();

    const potentialFactors = Array.from({ length: Math.floor(Math.sqrt(targetM)) }, (_, idx) => idx + 1);

    const allFactorsAndComplements = potentialFactors
        .filter(num => targetM % num === 0)
        .flatMap(factor => [factor, targetM / factor]);

    const uniqueSortedDivisors = Array.from(new Set(allFactorsAndComplements)).sort((a, b) => a - b);

    const qualifyingDivisors = uniqueSortedDivisors.filter(d => targetM / d >= limitN);

    const finalMaxDivisor = qualifyingDivisors.length > 0 ? qualifyingDivisors[qualifyingDivisors.length - 1] : 1;

    console.log(finalMaxDivisor);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
