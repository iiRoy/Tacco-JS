'use strict';
(function(sourceData) {
    const extractDetails = (rawContent) => {
        const contentLines = rawContent.trim().split('\n');
        const agentQuantity = Number(contentLines.shift());
        const interactionPreferences = contentLines.map(line => line.split(/\s+/).map(Number));
        return { agentQuantity, interactionPreferences };
    };

    const { agentQuantity: entityCount, interactionPreferences: compatibilityMatrix } = extractDetails(sourceData);
    const primeModulus = 1000000007;

    const pairingMemo = new Map(); // Stores results for (currentEntityIndex, assignedMask)

    const computeArrangements = (currentEntityIndex, assignedMask) => {
        // Check if this state has been computed before
        if (pairingMemo.has(currentEntityIndex)) {
            const innerMap = pairingMemo.get(currentEntityIndex);
            if (innerMap.has(assignedMask)) {
                return innerMap.get(assignedMask);
            }
        }

        // Base case: If all entities have been assigned, this is one valid arrangement
        if (currentEntityIndex === entityCount) {
            return 1;
        }

        let arrangementsCount = 0;
        // Iterate through all possible partners for the current entity
        for (let prospectivePartnerIndex = 0; prospectivePartnerIndex < entityCount; prospectivePartnerIndex++) {
            // Check if current entity can pair with this partner
            // AND if this partner has not been assigned to a previous entity
            if (compatibilityMatrix[currentEntityIndex][prospectivePartnerIndex] === 1 &&
                ( (assignedMask >> prospectivePartnerIndex) & 1 ) === 0 ) {
                
                // Recursively find arrangements for the next entity
                // with the partner added to the assigned mask
                arrangementsCount = (arrangementsCount + computeArrangements(
                    currentEntityIndex + 1,
                    assignedMask | (1 << prospectivePartnerIndex)
                )) % primeModulus;
            }
        }

        // Store the computed result in the memoization cache
        if (!pairingMemo.has(currentEntityIndex)) {
            pairingMemo.set(currentEntityIndex, new Map());
        }
        pairingMemo.get(currentEntityIndex).set(assignedMask, arrangementsCount);

        return arrangementsCount;
    };

    // Start the computation from the first entity (index 0) with no partners assigned (mask 0)
    console.log(computeArrangements(0, 0));

})(require('fs').readFileSync('/dev/stdin','utf8'));