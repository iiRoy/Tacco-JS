const ProcessSupplyDemand = (rawInputData) => {
    const parseInputData = (textualData) => {
        const lines = textualData.trim().split(/\s*\n\s*/);
        const countValue = parseInt(lines[0], 10);
        const primarySupplies = lines[1].split(/\s+/).map(Number);
        const secondaryDemands = lines[2].split(/\s+/).map(Number);
        return {
            initialCount: countValue,
            supplyQuantities: primarySupplies,
            demandAmounts: secondaryDemands
        };
    };

    const parsedData = parseInputData(rawInputData);

    const calculateFulfillment = (supplies, demands) => {
        const initialInventoryState = {
            totalFulfilled: 0,
            remainingSupplies: [...supplies]
        };

        const finalInventoryState = demands.reduce((currentState, currentDemand, demandIndex) => {
            const currentSupplyUnit = currentState.remainingSupplies[demandIndex];
            const nextSupplyUnit = currentState.remainingSupplies[demandIndex + 1];

            let fulfilledThisStep = 0;
            let updatedSupplies = [...currentState.remainingSupplies];

            const fromCurrent = Math.min(currentDemand, currentSupplyUnit);
            fulfilledThisStep += fromCurrent;
            const demandLeft = currentDemand - fromCurrent;

            if (demandLeft > 0 && nextSupplyUnit !== undefined) {
                const fromNext = Math.min(demandLeft, nextSupplyUnit);
                fulfilledThisStep += fromNext;
                updatedSupplies[demandIndex + 1] = nextSupplyUnit - fromNext;
            }

            return {
                totalFulfilled: currentState.totalFulfilled + fulfilledThisStep,
                remainingSupplies: updatedSupplies
            };
        }, initialInventoryState);

        return finalInventoryState.totalFulfilled;
    };

    const totalCollectedValue = calculateFulfillment(parsedData.supplyQuantities, parsedData.demandAmounts);

    console.log(totalCollectedValue);
};

ProcessSupplyDemand(require("fs").readFileSync("/dev/stdin", "utf8"));