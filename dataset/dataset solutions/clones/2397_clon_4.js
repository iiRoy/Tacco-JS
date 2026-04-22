const processInputAndCalculate = (rawData) => {
    const modulusIdentifier = rawData[0][1];
    const numericStrings = rawData[1];

    const effectiveModulus = Number(modulusIdentifier);
    
    const adjustedValues = numericStrings.reduce((accumulator, currentString) => {
        accumulator.push(Number(currentString) % effectiveModulus);
        return accumulator;
    }, []);

    const accumulateFragmentCounts = (
        currentOuterIndex,
        accumulatedResult,
        sourceSequence,
        modulusBound
    ) => {
        if (currentOuterIndex >= sourceSequence.length) {
            return accumulatedResult;
        }

        const traverseSubFragments = (
            currentInnerIndex,
            currentFragmentSumModulo,
            currentFragmentLength,
            localFragmentMatches,
            sequenceForScan,
            modulusConstraint
        ) => {
            if (currentInnerIndex >= sequenceForScan.length || currentFragmentLength >= modulusConstraint) {
                return localFragmentMatches;
            }

            const valueToAdd = sequenceForScan[currentInnerIndex];
            const nextFragmentSumModulo = (currentFragmentSumModulo + valueToAdd) % modulusConstraint;

            let incrementForMatch = 0;
            if (nextFragmentSumModulo === currentFragmentLength) {
                incrementForMatch = 1;
            }

            return traverseSubFragments(
                currentInnerIndex + 1,
                nextFragmentSumModulo,
                currentFragmentLength + 1,
                localFragmentMatches + incrementForMatch,
                sequenceForScan,
                modulusConstraint
            );
        };

        const matchesFromThisStartingPoint = traverseSubFragments(
            currentOuterIndex,
            0,
            1,
            0,
            adjustedValues,
            effectiveModulus
        );

        return accumulateFragmentCounts(
            currentOuterIndex + 1,
            accumulatedResult + matchesFromThisStartingPoint,
            sourceSequence,
            modulusBound
        );
    };

    return accumulateFragmentCounts(0, 0, adjustedValues, effectiveModulus);
};

const resourceAcquirer = require("fs");
const inputPath = "/dev/stdin";
const encodingType = "utf8";

const rawInputContent = resourceAcquirer.readFileSync(inputPath, encodingType);
const processedInputLines = rawInputContent.trim().split("\n").map(line => line.split(' '));

const finalResult = processInputAndCalculate(processedInputLines);
console.log(finalResult);