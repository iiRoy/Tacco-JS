'use strict';

function processSolution(rawData) {
    const dataLines = rawData.split('\n');
    const params = dataLines.shift().split(' ').map(Number);

    const waterUnitA = params[0];
    const waterUnitB = params[1];
    const sugarUnitC = params[2];
    const sugarUnitD = params[3];
    const maxSolubilityE = params[4];
    const maxTotalWeightF = params[5];

    const availableWaterAmounts = new Set();
    for (let i = 0; ; i++) {
        const termA = 100 * waterUnitA * i;
        if (termA > maxTotalWeightF) break;
        for (let j = 0; ; j++) {
            const termB = 100 * waterUnitB * j;
            const currentWaterMass = termA + termB;
            if (currentWaterMass > maxTotalWeightF) break;
            availableWaterAmounts.add(currentWaterMass);
        }
    }

    const availableSugarAmounts = new Set();
    for (let i = 0; ; i++) {
        const termC = sugarUnitC * i;
        if (termC > maxTotalWeightF) break;
        for (let j = 0; ; j++) {
            const termD = sugarUnitD * j;
            const currentSugarMass = termC + termD;
            if (currentSugarMass > maxTotalWeightF) break;
            availableSugarAmounts.add(currentSugarMass);
        }
    }

    const maxAllowedSugarRatio = maxSolubilityE / (100 + maxSolubilityE);

    const feasibleMixtures = Array.from(availableWaterAmounts).flatMap(solventMass => {
        return Array.from(availableSugarAmounts)
            .map(soluteMass => [solventMass, soluteMass])
            .filter(([w, s]) => {
                const totalMass = w + s;
                if (totalMass === 0) return false;
                const currentRatio = s / totalMass;
                return totalMass <= maxTotalWeightF && currentRatio <= maxAllowedSugarRatio;
            });
    });

    const bestMixture = feasibleMixtures.reduce((currentBest, candidate) => {
        const [bestWater, bestSugar] = currentBest;
        const [candidateWater, candidateSugar] = candidate;

        const bestTotalMass = bestWater + bestSugar;
        const candidateTotalMass = candidateWater + candidateSugar;

        const bestDensity = bestTotalMass === 0 ? -1 : (100 * bestSugar) / bestTotalMass;
        const candidateDensity = candidateTotalMass === 0 ? -1 : (100 * candidateSugar) / candidateTotalMass;

        return candidateDensity > bestDensity ? candidate : currentBest;
    }, [maxTotalWeightF, 0]);

    console.log((bestMixture[0] + bestMixture[1]) + ' ' + bestMixture[1]);
}

processSolution(require('fs').readFileSync('/dev/stdin', 'utf8'));
