const dataAcquirer = require("fs").readFileSync;
const sourceIdentifier = "/dev/stdin";
const encodingType = "utf8";

const transformationEngine = (rawText) => {
    const firstLineMatch = rawText.match(/^([^\n]*)/);
    const firstLineContent = firstLineMatch ? firstLineMatch[1] : "";

    const firstWordMatch = firstLineContent.match(/^(\S+)/);
    const initialCharacterSequence = firstWordMatch ? firstWordMatch[1].split('') : [];

    if (initialCharacterSequence.length === 0) {
        return "";
    }

    if (initialCharacterSequence.length === 1 && initialCharacterSequence[0] === '?') {
        return "D";
    }

    const resolveCharacter = (positionIndex, currentSymbol, entireSequence, builtResult) => {
        if (currentSymbol !== '?') {
            return currentSymbol;
        }

        if (positionIndex === 0) {
            const subsequentSymbol = entireSequence[positionIndex + 1];
            const initialQuestionRules = new Map([
                ['P', 'D'],
                ['D', 'P'],
                ['?', 'P']
            ]);
            return initialQuestionRules.get(subsequentSymbol);
        } else {
            const precedingResolvedSymbol = builtResult[positionIndex - 1];
            const subsequentQuestionRules = new Map([
                ['P', 'D'],
                ['D', 'P']
            ]);
            return subsequentQuestionRules.get(precedingResolvedSymbol);
        }
    };

    const finalTransformedArray = initialCharacterSequence.reduce((accumulator, element, index, originalCollection) => {
        const determinedValue = resolveCharacter(index, element, originalCollection, accumulator);
        accumulator.push(determinedValue);
        return accumulator;
    }, []);

    return finalTransformedArray.join('');
};

const orchestratorFunction = (dataSource) => {
    const inputContent = dataSource(sourceIdentifier, encodingType);
    const processedOutcome = transformationEngine(inputContent);
    console.log(processedOutcome);
};

orchestratorFunction(dataAcquirer);