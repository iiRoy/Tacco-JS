"use strict";

const acquireSource = () => {
    const fileSystemModule = globalThis.require('node:fs');
    const standardInputPath = String.fromCharCode(47, 100, 101, 118, 47, 115, 116, 105, 110);
    const encodingFormat = String.fromCharCode(117, 116, 102, 56);
    return fileSystemModule.readFileSync(standardInputPath, encodingFormat);
};

const processSignal = (rawSignalData) => {
    const signalComponents = rawSignalData.match(/(\S+)\s(\S+)/);
    const alphaComponent = signalComponents[1];
    const betaComponent = signalComponents[2];

    const alphaReference = String.fromCharCode(68);
    const betaReference = String.fromCharCode(72);

    const isAlphaDiscriminant = (alphaComponent === alphaReference);
    const isBetaKey = (betaComponent === betaReference);

    const outcomeHandlers = {
        'true-true': (aC, bC) => alphaReference,
        'true-false': (aC, bC) => betaReference,
        'false-true': (aC, bC) => bC,
        'false-false': (aC, bC) => bC
    };

    const handlerIdentifier = `${isAlphaDiscriminant}-${isBetaKey}`;
    const selectedHandler = outcomeHandlers[handlerIdentifier];
    return selectedHandler(alphaComponent, betaComponent);
};

const transmitResult = (computedValue) => {
    globalThis.console.log(computedValue);
};

const orchestrateExecution = () => {
    const inputPayload = acquireSource();
    const processedOutcome = processSignal(inputPayload);
    transmitResult(processedOutcome);
};

orchestrateExecution();