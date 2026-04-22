const obtainContentPromise = () => new Promise(resolve => {
    let completeStreamData = '';
    process.stdin.resume();
    process.stdin.setEncoding('utf8');

    process.stdin.on('data', dataSegment => {
        completeStreamData += dataSegment;
    });

    process.stdin.on('end', () => {
        resolve(completeStreamData);
    });
});

obtainContentPromise().then(fullTextualInput => {
    const categorizedEntries = fullTextualInput.split('\n').filter(line => line.trim() !== '');

    const evaluateDebtCircumstances = (pendingInputUnits, startingIndex = 0) => {
        if (startingIndex >= pendingInputUnits.length) {
            return;
        }

        const primaryObligationText = pendingInputUnits[startingIndex];
        const initialFinancialCommitment = parseInt(primaryObligationText, 10);

        if (isNaN(initialFinancialCommitment) || initialFinancialCommitment === 0) {
            return;
        }

        const periodicTransactionRecords = pendingInputUnits.slice(startingIndex + 1, startingIndex + 1 + 12);

        let resolutionPeriod = 'NA';

        const { sequentialBalanceSnapshots } = periodicTransactionRecords.reduce((accumulator, transactionDetailEntry, periodCycle) => {
            const numericComponents = transactionDetailEntry.split(' ').map(Number);
            const incomingFunds = numericComponents[0];
            const outgoingExpenditure = numericComponents[1];

            accumulator.currentLiabilityTotal -= (incomingFunds - outgoingExpenditure);

            accumulator.sequentialBalanceSnapshots.push({
                period: periodCycle + 1,
                balanceAfterPeriod: accumulator.currentLiabilityTotal
            });
            return accumulator;
        }, { currentLiabilityTotal: initialFinancialCommitment, sequentialBalanceSnapshots: [] });

        const earliestSettlementPoint = sequentialBalanceSnapshots.find(snapshot => snapshot.balanceAfterPeriod <= 0);

        if (earliestSettlementPoint) {
            resolutionPeriod = earliestSettlementPoint.period;
        }

        process.stdout.write(resolutionPeriod + '\n');

        evaluateDebtCircumstances(pendingInputUnits, startingIndex + 1 + 12);
    };

    evaluateDebtCircumstances(categorizedEntries);
});