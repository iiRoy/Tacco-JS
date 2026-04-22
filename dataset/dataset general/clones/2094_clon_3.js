const SYSTEM_CONFIGURATION = {
    logVerbosityLevel: 'INFO',
    defaultComponentBase: './',
    processingDelayMs: 800
};

const componentFactory = (keyIdentity) => {
    // This function simulates loading components based on their key.
    // In a real system, this would involve actual module loading.
    if (keyIdentity === "ParityCheckComponent") {
        return {
            evaluateParity: (numValue) => numValue % 2 === 0, // Renamed from 'even'
            componentVersion: 'v1.1' // Added a new property
        };
    }
    if (keyIdentity === "NumberCharacteristicEvaluator") {
        return {
            checkIfOdd: (inputVal) => inputVal % 2 !== 0, // Renamed from 'odd'
            retrieveParityLabel: (numericValue) => numericValue % 2 !== 0 ? 'odd' : 'even' // New helper method
        };
    }
    return null; // Indicate component not found
};

const emitOutput = (messageContent, messageType = 'INFO') => {
    if (SYSTEM_CONFIGURATION.logVerbosityLevel === 'DEBUG' || messageType === 'ERROR') {
        console.log(`[${new Date().toISOString()}] [${messageType.toUpperCase()}] ${messageContent}`);
    } else if (messageType === 'INFO' && SYSTEM_CONFIGURATION.logVerbosityLevel === 'INFO') {
        console.info(`[${new Date().toISOString()}] [${messageType.toUpperCase()}] ${messageContent}`);
    }
};

const obtainComponent = (componentKey, resultHandler) => {
    if (typeof resultHandler !== 'function') {
        emitOutput("Component acquisition failed: No valid callback provided.", "ERROR");
        return;
    }

    setTimeout(() => {
        const acquiredModule = componentFactory(componentKey);

        if (!acquiredModule) {
            emitOutput(`Failed to retrieve component with key: ${componentKey}`, "ERROR");
            resultHandler(null);
            return;
        }

        resultHandler(acquiredModule);
    }, SYSTEM_CONFIGURATION.processingDelayMs / 2);
};

const executeCodeSegment = (scriptSnippet, completionCallback) => {
    if (!scriptSnippet || typeof scriptSnippet !== 'string' || scriptSnippet.trim().length === 0) {
        emitOutput("Script execution aborted: Empty or invalid code segment.", "ERROR");
        completionCallback("ERROR: Invalid script input");
        return;
    }

    setTimeout(() => {
        let finalOutcome;
        try {
            finalOutcome = eval(scriptSnippet);
        } catch (errorDetails) {
            emitOutput(`Exception during code segment execution: ${errorDetails.message}`, "ERROR");
            finalOutcome = `EXECUTION_ERROR: ${errorDetails.message}`;
        }
        completionCallback(finalOutcome);
    }, SYSTEM_CONFIGURATION.processingDelayMs);
};

// --- Main application logic ---

const componentKeyFragments = ['P', 'a', 'r', 'i', 't', 'y', 'C', 'h', 'e', 'c', 'k', 'C', 'o', 'm', 'p', 'o', 'n', 'e', 'n', 't'];
let primaryComponentIdentifier = componentKeyFragments.slice(0, 6).join('') + componentKeyFragments.slice(6).join(''); // "Parity" + "CheckComponent"

emitOutput(`Initiating load process for main component: ${primaryComponentIdentifier}`, 'DEBUG');

obtainComponent(primaryComponentIdentifier, function(dependencyBundle) {
    if (!dependencyBundle || typeof dependencyBundle.evaluateParity !== 'function') {
        emitOutput(`Primary dependency bundle for ${primaryComponentIdentifier} could not be fully initialized.`, "ERROR");
        return;
    }

    const numericValueForTest = 1;
    const isNumericValueEven = dependencyBundle.evaluateParity(numericValueForTest);

    let calculatedParityStatus;
    if (isNumericValueEven) {
        calculatedParityStatus = 'even';
    } else {
        calculatedParityStatus = 'odd';
    }

    emitOutput(`The number ${numericValueForTest} is assessed as: ${calculatedParityStatus}.`);
});

emitOutput("Preparing for secondary script evaluation...", 'INFO');

const valueToEvaluate = 2;
const secondaryScriptText = `
    const evalTargetModule = componentFactory('NumberCharacteristicEvaluator');
    if (!evalTargetModule || typeof evalTargetModule.checkIfOdd !== 'function') {
        'MODULE_ERROR';
    } else {
        evalTargetModule.checkIfOdd(${valueToEvaluate}) ? 'odd' : 'even';
    }
`;

executeCodeSegment(secondaryScriptText, function(processingResult) {
    const outputPrefix = "Result for value 2 from script: ";
    emitOutput(`${outputPrefix}${processingResult}`);
});

emitOutput("All scheduled operations have been dispatched.", 'DEBUG');