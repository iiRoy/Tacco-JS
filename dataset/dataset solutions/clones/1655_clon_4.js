const processFinancialData = (sourceData) => {
    const dataSegments = sourceData.split("\n");
  
    const totalPeriods = Number(dataSegments[0]);
    const marketValues = dataSegments[1].split(" ").map(Number);

    const terminalMetrics = marketValues.slice(1).reduce((accumulated, presentValue) => {
        const { currentHoldings, priorValue } = accumulated;

        const unitsToProcure = (presentValue > priorValue)
            ? Math.trunc(currentHoldings / priorValue)
            : 0;
        
        const revisedHoldings = currentHoldings + (presentValue - priorValue) * unitsToProcure;

        return {
            currentHoldings: revisedHoldings,
            priorValue: presentValue
        };
    }, { currentHoldings: 1000, priorValue: marketValues[0] });

	console.log('%d', terminalMetrics.currentHoldings);
};

processFinancialData(require("fs").readFileSync("/dev/stdin", "utf8"));
