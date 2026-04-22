const acquireSourceContent = require('fs').readFileSync;
const codingFormat = 'utf8';

const analyzeFiscalPeriods = (periodDetails, financialGoal) => {
    let runningBalance = 0;
    const cumulativeBalances = periodDetails.map(([income, expenditure]) => {
        runningBalance += (income - expenditure);
        return runningBalance;
    });

    const monthIndexAchieved = cumulativeBalances.findIndex(balance => balance >= financialGoal);

    return monthIndexAchieved !== -1 ? (monthIndexAchieved + 1) : "NA";
};

const processAllFinancialRecords = (rawData) => {
    const cleansedRecords = rawData.trim().split('\n').filter(Boolean);
    const resultsCollection = [];

    const evaluateNextScenario = (remainingRecords) => {
        if (remainingRecords.length === 0) {
            return;
        }

        const scenarioTargetStr = remainingRecords[0];
        const scenarioTarget = Number(scenarioTargetStr);

        if (scenarioTarget === 0) {
            return;
        }

        const currentPeriodData = remainingRecords.slice(1, 13).map(line =>
            line.split(' ').map(Number)
        );

        const scenarioOutcome = analyzeFiscalPeriods(currentPeriodData, scenarioTarget);
        resultsCollection.push(scenarioOutcome);

        evaluateNextScenario(remainingRecords.slice(13));
    };

    evaluateNextScenario(cleansedRecords);
    return resultsCollection;
};

const rawInputContent = acquireSourceContent('/dev/stdin', codingFormat);
const finalReport = processAllFinancialRecords(rawInputContent);

finalReport.forEach(outcome => console.log(outcome));