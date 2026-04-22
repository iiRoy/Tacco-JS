var dataSource = '';
var dataIndex = 0;

function acquireNumericToken() {
    return +dataSource[dataIndex++];
}

function acquireTextToken() {
    return dataSource[dataIndex++];
}

function outputResult(data) {
    console.log(data);
}

function analyzeStringBalance(textSequence) {
    const initialAccumulation = { neededForPrefix: 0, currentAccumulatedOpen: 0 };

    const finalAccumulation = Array.from(textSequence).reduce((accumulator, character) => {
        if (character === '(') {
            return { ...accumulator, currentAccumulatedOpen: accumulator.currentAccumulatedOpen + 1 };
        } else { // character === ')'
            if (accumulator.currentAccumulatedOpen > 0) {
                return { ...accumulator, currentAccumulatedOpen: accumulator.currentAccumulatedOpen - 1 };
            } else {
                return { ...accumulator, neededForPrefix: accumulator.neededForPrefix + 1 };
            }
        }
    }, initialAccumulation);

    return finalAccumulation;
}

function compareBalanceRecords(recordA, recordB) {
    const netDeltaA = recordA.currentAccumulatedOpen - recordA.neededForPrefix;
    const netDeltaB = recordB.currentAccumulatedOpen - recordB.neededForPrefix;

    if (netDeltaA < 0 && netDeltaB < 0) {
        if (recordA.neededForPrefix === recordB.neededForPrefix) {
            return netDeltaB - netDeltaA;
        } else {
            return recordB.neededForPrefix - recordA.neededForPrefix;
        }
    }
    return netDeltaB - netDeltaA;
}

function findAndExtractFirstViable(recordsCollection, currentBalanceValue) {
    for (let i = 0; i < recordsCollection.length; i++) {
        const recordEntry = recordsCollection[i];
        if (recordEntry && currentBalanceValue >= recordEntry.neededForPrefix) {
            const newRecordsCollection = [...recordsCollection];
            newRecordsCollection.splice(i, 1);
            return { matchedRecordEntry: recordEntry, remainingCollection: newRecordsCollection };
        }
    }
    return { matchedRecordEntry: null, remainingCollection: recordsCollection };
}

function recursiveBalanceEvaluation(currentBalanceValue, recordsLeft, stepsTaken, totalSteps) {
    if (stepsTaken === totalSteps) {
        return currentBalanceValue === 0;
    }

    const { matchedRecordEntry, remainingCollection } = findAndExtractFirstViable(recordsLeft, currentBalanceValue);

    if (matchedRecordEntry) {
        const nextBalanceValue = currentBalanceValue + (matchedRecordEntry.currentAccumulatedOpen - matchedRecordEntry.neededForPrefix);
        return recursiveBalanceEvaluation(nextBalanceValue, remainingCollection, stepsTaken + 1, totalSteps);
    } else {
        return false;
    }
}

function executeSolution() {
    const sequenceCount = acquireNumericToken();
    const textSequences = [];
    for (let i = 0; i < sequenceCount; ++i) {
        textSequences.push(acquireTextToken());
    }

    const balanceRecords = textSequences.map(analyzeStringBalance);

    balanceRecords.sort(compareBalanceRecords);

    outputResult(balanceRecords);

    const finalOutcome = recursiveBalanceEvaluation(0, balanceRecords, 0, sequenceCount);

    outputResult(finalOutcome ? 'Yes' : 'No');
}

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', function(chunk) {
    dataSource += chunk;
});

process.stdin.on('end', function() {
    dataSource = dataSource.trim().split(/\s+/);
    executeSolution();
});