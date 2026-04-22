'use strict';
((streamData) => {
    const dataLines = streamData.toString().trim().split('\n');
    const pizzaCapacity = Number(dataLines[0]);
    const initialPizzaStates = dataLines[1].split(/\s+/).map(Number);

    const initialCounts = {
        singleHit: 0,
        doubleHit: 0,
        tripleHit: 0
    };

    for (const state of initialPizzaStates) {
        if (state === 1) initialCounts.singleHit++;
        else if (state === 2) initialCounts.doubleHit++;
        else if (state === 3) initialCounts.tripleHit++;
    }

    const memoizedOutcomes = new Map();

    const calculateMeanOps = (c1, c2, c3) => {
        if (c1 < 0 || c2 < 0 || c3 < 0) {
            return 0; // Invalid state, probability of reaching is 0
        }
        if (c1 === 0 && c2 === 0 && c3 === 0) {
            return 0; // Base case: No pizzas left, 0 additional operations
        }

        const stateIdentifier = `${c1}-${c2}-${c3}`;
        if (memoizedOutcomes.has(stateIdentifier)) {
            return memoizedOutcomes.get(stateIdentifier);
        }

        let currentMean = 0;
        const totalActivePizzas = c1 + c2 + c3;

        // If no active pizzas but not (0,0,0), something is wrong, or it's an unreachable state
        if (totalActivePizzas === 0) {
            return 0;
        }

        // The core expected value formula:
        // E(c1, c2, c3) = N/S + (c1/S)*E(c1-1, c2, c3) + (c2/S)*E(c1+1, c2-1, c3) + (c3/S)*E(c1, c2+1, c3-1)
        currentMean += pizzaCapacity / totalActivePizzas;

        if (c1 > 0) {
            currentMean += (c1 / totalActivePizzas) * calculateMeanOps(c1 - 1, c2, c3);
        }
        if (c2 > 0) {
            currentMean += (c2 / totalActivePizzas) * calculateMeanOps(c1 + 1, c2 - 1, c3);
        }
        if (c3 > 0) {
            currentMean += (c3 / totalActivePizzas) * calculateMeanOps(c1, c2 + 1, c3 - 1);
        }

        memoizedOutcomes.set(stateIdentifier, currentMean);
        return currentMean;
    };

    const finalResult = calculateMeanOps(
        initialCounts.singleHit,
        initialCounts.doubleHit,
        initialCounts.tripleHit
    );

    console.log(finalResult);

})(require('fs').readFileSync('/dev/stdin', 'utf8'));