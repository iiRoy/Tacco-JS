function calculateGrowthYears(inputString) {
    const targetAmount = parseInt(inputString, 10);
    
    const INITIAL_BALANCE_VALUE = 100;
    const ANNUAL_GROWTH_FACTOR = 1.01;

    let currentBalance = INITIAL_BALANCE_VALUE;
    let yearsElapsed = 0;

    const computeNextBalance = (balance, factor) => {
        return Math.floor(balance * factor);
    };

    while (currentBalance < targetAmount) {
        currentBalance = computeNextBalance(currentBalance, ANNUAL_GROWTH_FACTOR);
        yearsElapsed++;
    }
    console.log(yearsElapsed);
}
calculateGrowthYears(require("fs").readFileSync("/dev/stdin", "utf8"));
