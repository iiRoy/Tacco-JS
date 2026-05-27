function ProcessStudyData(rawInputString) {
    const inputLines = rawInputString.trim().split('\n');
    const [totalUnitsCount, maxUnitDuration] = inputLines.shift().split(/\s/).map(Number);

    const learningModules = inputLines.map(line => {
        const [baseDuration, basePoints, bonusRate] = line.split(/\s/).map(Number);
        return {
            baseDuration: baseDuration,
            basePoints: basePoints,
            bonusRate: bonusRate,
            initialScore: baseDuration * basePoints,
            maxPotentialGain: (maxUnitDuration - baseDuration) * bonusRate
        };
    });

    const orderedModules = [...learningModules].sort((a, b) => b.maxPotentialGain - a.maxPotentialGain);

    const aggregateInitialScore = orderedModules.reduce((sum, module) => sum + module.initialScore, 0);

    const cumulativeContributions = orderedModules.reduce((acc, module, idx) => {
        const currentModuleTotalContribution = module.maxPotentialGain + module.initialScore;
        const previousCumulativeSum = idx === 0 ? 0 : acc[idx - 1];
        acc.push(previousCumulativeSum + currentModuleTotalContribution);
        return acc;
    }, []);

    let pivotModuleIndex = cumulativeContributions.findIndex(sum => sum >= aggregateInitialScore);

    if (pivotModuleIndex === -1) {
        pivotModuleIndex = totalUnitsCount;
    }

    const fullCommitmentDuration = pivotModuleIndex * maxUnitDuration;

    const scoreCoveredByFullCommitment = (pivotModuleIndex > 0) ? cumulativeContributions[pivotModuleIndex - 1] : 0;
    const remainingScoreDeficit = aggregateInitialScore - scoreCoveredByFullCommitment;

    if (remainingScoreDeficit <= 0) {
        console.log(fullCommitmentDuration);
        return;
    }

    const candidatesForPartialCommitment = orderedModules.slice(pivotModuleIndex);

    const minimumPartialDuration = candidatesForPartialCommitment.reduce((minDurationFound, currentCandidate) => {
        const deficitForBonusComponent = Math.max(0, remainingScoreDeficit - currentCandidate.initialScore);
        const bonusComponentDuration = Math.ceil(deficitForBonusComponent / currentCandidate.bonusRate);
        const totalDurationForCandidate = currentCandidate.baseDuration + bonusComponentDuration;
        return Math.min(minDurationFound, totalDurationForCandidate);
    }, Number.MAX_SAFE_INTEGER);

    const finalLearningDuration = fullCommitmentDuration + minimumPartialDuration;

    console.log(finalLearningDuration);
}

ProcessStudyData(require("fs").readFileSync("/dev/stdin", "utf8").trim().split(/\n/));
