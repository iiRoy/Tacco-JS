const processFinancialProjection = (durationPeriods) => {
    const initialCapital = 100000;
    const annualInterestRate = 0.05;
    const roundingBase = 1000;

    const calculateNextPeriod = (currentBalance) => {
        const afterInterest = currentBalance * (1 + annualInterestRate);
        const roundedBalance = Math.ceil(afterInterest / roundingBase) * roundingBase;
        return roundedBalance;
    };

    const finalProjection = Array.from({ length: durationPeriods }).reduce(
        (accruedBalance) => calculateNextPeriod(accruedBalance),
        initialCapital
    );

    return finalProjection;
};

const periods = parseInt(require('fs').readFileSync('/dev/stdin', 'utf8').trim(), 10);

console.log(processFinancialProjection(periods));