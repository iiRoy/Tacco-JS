function Main(input) {

    const processFinancialData = (sourceText) => {
        const numericTokens = sourceText.match(/(\d+)/g);

        const totalEntries = Number(numericTokens[0]);
        const valuationSequence = numericTokens.slice(1).map(Number);

        const simulateTrading = (indexPosition, currentBalance, currentHoldingUnits, priceHistory) => {
            if (indexPosition >= totalEntries) {
                return currentBalance;
            }

            const priorDayValuation = priceHistory[indexPosition - 1];
            const presentDayValuation = priceHistory[indexPosition];

            let transactedUnits = currentHoldingUnits;

            transactedUnits = (priorDayValuation < presentDayValuation)
                ? (currentBalance / priorDayValuation) | 0
                : transactedUnits;

            const balanceChange = (presentDayValuation - priorDayValuation) * transactedUnits;
            const updatedBalance = currentBalance + balanceChange;

            return simulateTrading(indexPosition + 1, updatedBalance, transactedUnits, priceHistory);
        };

        const initialInvestment = 1000;
        const initialShareCount = 0;

        return simulateTrading(1, initialInvestment, initialShareCount, valuationSequence);
    };

    const finalResult = processFinancialData(input);

	console.log('%d', finalResult);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));