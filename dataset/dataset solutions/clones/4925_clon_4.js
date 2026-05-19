const fileSystemModule = require("fs");

const processInputData = (inputContent) => {
    const contentLines = inputContent.split("\n");
    const primaryString = contentLines[0];

    const initialProcessingState = {
        calculatedScore: 0,
        currentDepth: 0
    };

    const operationDispatchMap = {
        'g': {
            'positiveDepth': (state) => ({
                calculatedScore: state.calculatedScore + 1,
                currentDepth: state.currentDepth - 1
            }),
            'nonPositiveDepth': (state) => ({
                calculatedScore: state.calculatedScore,
                currentDepth: state.currentDepth + 1
            })
        },
        'p': {
            'positiveDepth': (state) => ({
                calculatedScore: state.calculatedScore,
                currentDepth: state.currentDepth - 1
            }),
            'nonPositiveDepth': (state) => ({
                calculatedScore: state.calculatedScore - 1,
                currentDepth: state.currentDepth + 1
            })
        },
        'other': {
            'positiveDepth': (state) => ({
                calculatedScore: state.calculatedScore,
                currentDepth: state.currentDepth - 1
            }),
            'nonPositiveDepth': (state) => ({
                calculatedScore: state.calculatedScore,
                currentDepth: state.currentDepth + 1
            })
        }
    };

    const finalProcessingState = Array.from(primaryString).reduce((accumulator, characterSymbol) => {
        const depthConditionKey = accumulator.currentDepth > 0 ? 'positiveDepth' : 'nonPositiveDepth';
        const characterSpecificOperations = operationDispatchMap[characterSymbol] || operationDispatchMap['other'];
        const selectedOperation = characterSpecificOperations[depthConditionKey];
        return selectedOperation(accumulator);
    }, initialProcessingState);

    console.log(finalProcessingState.calculatedScore);
};

processInputData(fileSystemModule.readFileSync("/dev/stdin", "UTF-8"));
