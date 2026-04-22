const systemIO = require('fs');

const obtainTextContent = (sourcePath, dataEncoding) => systemIO.readFileSync(sourcePath, dataEncoding);

const parseSourceData = (rawDataString) => {
    const contentLines = rawDataString.trim().split('\n');

    const [
        firstEntry,
        secondEntry,
        thirdEntry,
        ...restOfEntries
    ] = contentLines;

    const ignoredQuantity = parseInt(firstEntry, 10);
    const [ initialSequenceValue, incrementalStep ] = secondEntry.split(' ').map(Number);
    const operationTotal = parseInt(thirdEntry, 10);

    const operationRecords = restOfEntries.slice(0, operationTotal).map(lineDetail => {
        const [ actionType, subjectKey, objectKey ] = lineDetail.split(' ');
        return { actionType, subjectKey, objectKey };
    });
    const finalKeyToFind = restOfEntries[operationTotal];

    return {
        initialSkipValue: ignoredQuantity,
        sequenceStart: initialSequenceValue,
        sequenceIncrement: incrementalStep,
        procedureList: operationRecords,
        ultimateKey: finalKeyToFind
    };
};

const resolveCurrentDesignation = (identifierToQuery, designationRegister) => {
    return designationRegister.has(identifierToQuery) ? designationRegister.get(identifierToQuery) : identifierToQuery;
};

const applySingleDirectionAssignment = (currentRegister, sourceIdentifier, targetIdentifier) => {
    const effectiveTarget = resolveCurrentDesignation(targetIdentifier, currentRegister);
    const nextRegisterState = new Map(currentRegister);
    nextRegisterState.set(sourceIdentifier, effectiveTarget);
    return nextRegisterState;
};

const performBidirectionalSwap = (currentRegister, firstIdentifier, secondIdentifier) => {
    const currentDesignationFirst = resolveCurrentDesignation(firstIdentifier, currentRegister);
    const currentDesignationSecond = resolveCurrentDesignation(secondIdentifier, currentRegister);

    const nextRegisterState = new Map(currentRegister);
    nextRegisterState.set(firstIdentifier, currentDesignationSecond);
    nextRegisterState.set(secondIdentifier, currentDesignationFirst);
    return nextRegisterState;
};

const determineFinalOutcome = (processedInformation) => {
    const { sequenceStart, sequenceIncrement, procedureList, ultimateKey } = processedInformation;

    const finalDesignationRegister = procedureList.reduce((currentRegisterState, currentProcedure) => {
        const { actionType, subjectKey, objectKey } = currentProcedure;
        if (actionType === "1") {
            return performBidirectionalSwap(currentRegisterState, subjectKey, objectKey);
        } else {
            return applySingleDirectionAssignment(currentRegisterState, subjectKey, objectKey);
        }
    }, new Map());

    const resolvedUltimateKey = resolveCurrentDesignation(ultimateKey, finalDesignationRegister);

    const numericUltimateKey = parseInt(resolvedUltimateKey, 10);

    return sequenceStart + ((numericUltimateKey - 1) * sequenceIncrement);
};

const rawApplicationData = obtainTextContent('/dev/stdin', 'utf8');
const structuredApplicationData = parseSourceData(rawApplicationData);
const finalCalculatedValue = determineFinalOutcome(structuredApplicationData);

console.log(finalCalculatedValue);