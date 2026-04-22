(function() {
    const fsModule = require("fs");
    const inputBuffer = fsModule.readFileSync("/dev/stdin");
    const processedText = inputBuffer.toString("utf8");

    const extractNumerics = (sourceString) => {
        const patternMatch = sourceString.match(/(\d+)\s(\d+)/);
        if (patternMatch && patternMatch.length >= 3) {
            return {
                first: Number(patternMatch[1]),
                second: Number(patternMatch[2])
            };
        }
        return { first: 0, second: 0 };
    };

    const deriveOutcome = (numA, numB) => {
        const outcomeDecider = {
            true: 0,
            false: numA - numB
        };
        return outcomeDecider[numB === 1];
    };

    const { first: quantityA, second: quantityB } = extractNumerics(processedText);
    const finalComputation = deriveOutcome(quantityA, quantityB);

    process.stdout.write(String(finalComputation) + '\n');
})();