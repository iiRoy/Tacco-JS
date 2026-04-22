const ComputationalUnit = (() => {
    let globalTotalItems = 0;
    let memoizationCache = new Map();

    const determineExpectation = (zed, one, due, tre) => {
        if (one === 0 && due === 0 && tre === 0) {
            return 0;
        }

        const stateIdentifier = `${zed}-${one}-${due}`;
        if (memoizationCache.has(stateIdentifier)) {
            return memoizationCache.get(stateIdentifier);
        }

        let cumulativeExpectation = 0;

        if (one > 0) {
            cumulativeExpectation += determineExpectation(zed + 1, one - 1, due, tre) * one;
        }
        if (due > 0) {
            cumulativeExpectation += determineExpectation(zed, one + 1, due - 1, tre) * due;
        }
        if (tre > 0) {
            cumulativeExpectation += determineExpectation(zed, one, due + 1, tre - 1) * tre;
        }

        const currentActivePopulation = one + due + tre;
        const calculationDivisor = currentActivePopulation - zed;

        const calculatedResult = (currentActivePopulation + cumulativeExpectation) / calculationDivisor;

        memoizationCache.set(stateIdentifier, calculatedResult);
        return calculatedResult;
    };

    const commenceCalculations = (sourceData) => {
        const dataLines = sourceData.trim().split('\n');
        globalTotalItems = Number(dataLines[0].split(' ')[0]);
        const itemStates = dataLines[1].split(' ').map(Number);

        const initialItemBreakdown = {
            zed: 0,
            one: 0,
            due: 0,
            tre: 0
        };

        itemStates.forEach(val => {
            if (val === 1) initialItemBreakdown.one++;
            else if (val === 2) initialItemBreakdown.due++;
            else if (val === 3) initialItemBreakdown.tre++;
        });

        memoizationCache = new Map();

        return determineExpectation(
            initialItemBreakdown.zed,
            initialItemBreakdown.one,
            initialItemBreakdown.due,
            initialItemBreakdown.tre
        );
    };

    return {
        commenceCalculations: commenceCalculations
    };
})();

console.log(ComputationalUnit.commenceCalculations(require("fs").readFileSync("/dev/stdin", "utf8")));