const orchestrateTravelEstimates = (journeyBlueprintText) => {
    const blueprintLines = journeyBlueprintText.split('\n').filter(Boolean);
    const segmentSpecifications = blueprintLines.slice(1).map(line => line.split(/\s/).map(Number));

    const determineNextDispatch = (momentOfArrival, initialDispatch, dispatchInterval) => {
        if (momentOfArrival < initialDispatch) {
            return initialDispatch;
        }
        
        // Handling dispatchInterval = 0 to match original JavaScript engine's `X % 0` behavior
        // Original: `0 % 0` is 0. `X % 0` for X > 0 is NaN.
        if (dispatchInterval === 0) {
            return momentOfArrival === 0 ? 0 : NaN;
        }

        // Replicates the original logic: if arrival >= initialDispatch, then find the next multiple of dispatchInterval
        // that is >= momentOfArrival. This ignores 'initialDispatch' for the interval calculation
        // once momentOfArrival >= initialDispatch.
        // Example: arrival=10, initialDispatch=5, interval=3.
        // Original: 10 % 3 = 1 != 0. 10 + (3 - 1) = 12.
        // Math.ceil(10/3)*3 = 4*3 = 12. Matches.
        return Math.ceil(momentOfArrival / dispatchInterval) * dispatchInterval;
    };

    const allJourneyOutcomes = segmentSpecifications.map((_, startingPointIndex) => {
        const finalArrivalMoment = segmentSpecifications
            .slice(startingPointIndex)
            .reduce((currentPassageTime, currentSegmentSpecs) => {
                const segmentDuration = currentSegmentSpecs[0];
                const segmentStartDispatch = currentSegmentSpecs[1];
                const segmentFrequency = currentSegmentSpecs[2];

                const departureFromCurrentStop = determineNextDispatch(
                    currentPassageTime,
                    segmentStartDispatch,
                    segmentFrequency
                );

                return departureFromCurrentStop + segmentDuration;
            }, 0);

        return finalArrivalMoment;
    });

    return allJourneyOutcomes.join('\n') + '\n0';
};

const rawInputSource = require("fs").readFileSync("/dev/stdin", "utf8");
const computedResult = orchestrateTravelEstimates(rawInputSource);
console.log(computedResult);