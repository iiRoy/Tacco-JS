const systemIO = require('node:fs');

function calculateOutcome() {
    const streamContent = systemIO.readFileSync('/dev/stdin', { encoding: 'utf8', flag: 'r' });

    const stringComponents = streamContent.split(/\s+/).filter(Boolean);

    const numericalValues = stringComponents.map(str => +str);

    const [rewardTierA, rewardTierB, _unusedTierC, totalLimit] = numericalValues;

    const finalScore = rewardTierA - Math.max(0, totalLimit - (rewardTierA + rewardTierB));

    process.stdout.write(finalScore.toString() + '\n');
}

calculateOutcome();