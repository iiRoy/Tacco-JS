const acquireInputData = () => {
    if (typeof process !== 'undefined' && process.stdin && typeof require === 'function') {
        try {
            const filesystem = require('fs');
            return filesystem.readFileSync('/dev/stdin', 'utf8');
        } catch (error) {
            return "3\n0 0 10\n1 0 1\n0 1 1";
        }
    }
    return "3\n0 0 10\n1 0 1\n0 1 1";
};

const extractNumericalData = (sourceText) => {
    const dataTokens = sourceText.split(/\s+/).filter(Boolean);
    let currentPosition = 0;
    return () => {
        if (currentPosition < dataTokens.length) {
            return Number(dataTokens[currentPosition++]);
        }
        throw new Error("Insufficient input data encountered.");
    };
};

const siteRoleIdentifiers = Object.freeze({
    UNASSIGNED_FOR_MONITORING: 0,
    X_AXIS_GUARDIAN: 1,
    Y_AXIS_GUARDIAN: 2
});

const runProtectionAnalysis = (inputPayload) => {
    const obtainNextDatum = extractNumericalData(inputPayload);
    const totalLocations = obtainNextDatum();
    const geographicPoints = [];
    for (let i = 0; i < totalLocations; ++i) {
        geographicPoints.push({
            horizontal: obtainNextDatum(),
            vertical: obtainNextDatum(),
            influence: obtainNextDatum()
        });
    }

    const minimumExpendituresPerGuardianCount = Array(totalLocations + 1).fill(Infinity);

    const totalConfigurations = Math.pow(3, totalLocations);

    for (let configIndex = 0; configIndex < totalConfigurations; ++configIndex) {
        const currentAssignmentPlan = [];
        let temporaryIndex = configIndex;
        let activeGuardians = 0;

        for (let locIdx = 0; locIdx < totalLocations; ++locIdx) {
            const roleCode = temporaryIndex % 3;
            currentAssignmentPlan.push(roleCode);
            if (roleCode === siteRoleIdentifiers.X_AXIS_GUARDIAN || roleCode === siteRoleIdentifiers.Y_AXIS_GUARDIAN) {
                activeGuardians++;
            }
            temporaryIndex = Math.floor(temporaryIndex / 3);
        }

        const citiesRequiringProtection = geographicPoints.filter((_city, index) => currentAssignmentPlan[index] === siteRoleIdentifiers.UNASSIGNED_FOR_MONITORING);
        const horizontalProtectors = geographicPoints.filter((_city, index) => currentAssignmentPlan[index] === siteRoleIdentifiers.X_AXIS_GUARDIAN);
        const verticalProtectors = geographicPoints.filter((_city, index) => currentAssignmentPlan[index] === siteRoleIdentifiers.Y_AXIS_GUARDIAN);

        const currentPlanTotalCost = citiesRequiringProtection.reduce((acc, targetCity) => {
            let minimalProtectionExpenditure = Math.min(
                Math.abs(targetCity.horizontal),
                Math.abs(targetCity.vertical)
            ) * targetCity.influence;

            const potentialXProtectionCosts = horizontalProtectors.map(hProt => 
                Math.abs(targetCity.horizontal - hProt.horizontal) * targetCity.influence
            );
            if (potentialXProtectionCosts.length > 0) {
                minimalProtectionExpenditure = Math.min(minimalProtectionExpenditure, ...potentialXProtectionCosts);
            }

            const potentialYProtectionCosts = verticalProtectors.map(vProt => 
                Math.abs(targetCity.vertical - vProt.vertical) * targetCity.influence
            );
            if (potentialYProtectionCosts.length > 0) {
                minimalProtectionExpenditure = Math.min(minimalProtectionExpenditure, ...potentialYProtectionCosts);
            }
            
            return acc + minimalProtectionExpenditure;
        }, 0);

        minimumExpendituresPerGuardianCount[activeGuardians] = Math.min(
            minimumExpendituresPerGuardianCount[activeGuardians],
            currentPlanTotalCost
        );
    }

    return minimumExpendituresPerGuardianCount.join("\n");
};

console.log(runProtectionAnalysis(acquireInputData()));