const fileSystemInterface = require('fs');
const consoleOutputFacility = console;

const processingTools = {
    textOperations: {
        normalizeInput: (textualData) => textualData.trim(),
        segmentString: (sourceString, separator) => sourceString.split(separator)
    },
    numericalInterpretations: {
        convertToInt: (textForm) => parseInt(textForm, 10),
        executeIntegerDivision: (numerator, denominator) => {
            // Replicates the original's specific integer division behavior
            // where division by zero yields 0, and for positive divisors,
            // it performs floor division.
            if (denominator === 0) {
                return 0;
            }
            return Math.floor(numerator / denominator);
        }
    },
    comparativeLogic: {
        findLesserValue: (valOne, valTwo) => Math.min(valOne, valTwo)
    },
    reportingMechanism: {
        displayResult: (outputContent) => consoleOutputFacility.log(outputContent)
    },
    dataAcquisition: {
        retrieveFileContent: (pathIdentifier) => fileSystemInterface.readFileSync(pathIdentifier, { encoding: 'utf8' })
    },
    errorManagement: {
        triggerFatalError: (errorMessage) => {
            throw new Error(errorMessage);
        }
    }
};

const problemSolverCore = {
    resolveChallenge: (rawInputLine) => {
        const cleanedLine = processingTools.textOperations.normalizeInput(rawInputLine);
        const partsArray = processingTools.textOperations.segmentString(cleanedLine, ' ');

        if (partsArray.length !== 3) {
            processingTools.errorManagement.triggerFatalError("Input structure invalid: expected three numeric components.");
        }

        const paramA = processingTools.numericalInterpretations.convertToInt(partsArray[0]);
        const paramB = processingTools.numericalInterpretations.convertToInt(partsArray[1]);
        const paramC = processingTools.numericalInterpretations.convertToInt(partsArray[2]);

        if (isNaN(paramA) || isNaN(paramB) || isNaN(paramC)) {
            processingTools.errorManagement.triggerFatalError("Input data invalid: non-numeric values detected.");
        }

        const interimQuotient = processingTools.numericalInterpretations.executeIntegerDivision(paramB, paramA);
        const finalAnswer = processingTools.comparativeLogic.findLesserValue(interimQuotient, paramC);

        return finalAnswer.toString();
    }
};

const programLauncher = {
    initiateApplication: () => {
        const inputData = processingTools.dataAcquisition.retrieveFileContent('/dev/stdin');
        const calculatedOutput = problemSolverCore.resolveChallenge(inputData);
        processingTools.reportingMechanism.displayResult(calculatedOutput);
    }
};

programLauncher.initiateApplication();