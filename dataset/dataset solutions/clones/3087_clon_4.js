function processInputAndCalculate(inputString) {
    const inputLines = inputString.split("\n");
    const _initialLine = inputLines.shift();
    const charPattern = inputLines.shift().split("");
    const patternLength = charPattern.length;
    const transformationRules = inputLines.map(line => line.split(" "));

    let currentParticleDistribution = new Map();
    for (let i = 0; i < patternLength; i++) {
        currentParticleDistribution.set(i, 1);
    }

    const executeTransformation = (distribution, pattern, length, rule) => {
        const [triggerChar, moveDirection] = rule;
        const nextDistributionState = new Map();
        const mutableIntermediateDistribution = new Map(distribution);

        for (let pos = 0; pos < length; pos++) {
            const particleCount = mutableIntermediateDistribution.get(pos) || 0;

            if (particleCount === 0) {
                continue;
            }

            if (pattern[pos] !== triggerChar) {
                nextDistributionState.set(pos, (nextDistributionState.get(pos) || 0) + particleCount);
            } else {
                if (moveDirection === 'L') {
                    const targetPos = pos - 1;
                    if (targetPos >= 0) {
                        nextDistributionState.set(targetPos, (nextDistributionState.get(targetPos) || 0) + particleCount);
                    }
                } else {
                    const targetPos = pos + 1;
                    if (targetPos < length) {
                        mutableIntermediateDistribution.set(targetPos, (mutableIntermediateDistribution.get(targetPos) || 0) + particleCount);
                    }
                }
            }
        }
        return nextDistributionState;
    };

    for (const rule of transformationRules) {
        currentParticleDistribution = executeTransformation(currentParticleDistribution, charPattern, patternLength, rule);
    }

    let totalCount = 0;
    for (const count of currentParticleDistribution.values()) {
        totalCount += count;
    }

    console.log(totalCount);
}

processInputAndCalculate(require('fs').readFileSync('/dev/stdin', 'utf8'));
