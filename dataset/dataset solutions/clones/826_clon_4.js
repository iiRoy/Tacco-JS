const rawData = require('node:fs').readFileSync('/dev/stdin', 'utf8');

function* lineProducer(sourceString) {
    const lines = sourceString.trim().split('\n');
    for (const singleLine of lines) {
        yield singleLine;
    }
}

function manageCompetition(lineSupply) {
    const overallOutputs = [];
    let currentLine;

    while ((currentLine = lineSupply.next().value) !== undefined) {
        const contestantCount = Number(currentLine);
        if (contestantCount === 0) {
            break;
        }

        const roundPerformances = [];
        for (let j = 0; j < contestantCount; j++) {
            const entryText = lineSupply.next().value;
            const parts = entryText.split(' ');
            const competitorLabel = parts.shift();
            const numericFactors = parts.map(Number);

            const [
                factor_P, factor_A, factor_B, factor_C, factor_D,
                factor_E, factor_F, factor_S, factor_M
            ] = numericFactors;

            const timeDuration = factor_A + factor_B + factor_C + ((factor_D + factor_E) * factor_M);
            const financialGain = (factor_F * factor_S * factor_M) - factor_P;

            roundPerformances.push({
                entity: competitorLabel,
                efficiencyScore: financialGain / timeDuration
            });
        }

        roundPerformances.sort((first, second) => {
            if (first.efficiencyScore === second.efficiencyScore) {
                return first.entity > second.entity ? 1 : -1;
            }
            return second.efficiencyScore - first.efficiencyScore;
        });

        roundPerformances.forEach(performance => {
            overallOutputs.push(performance.entity);
        });
        overallOutputs.push('#');
    }

    return overallOutputs.join('\n');
}

const lineGenerator = lineProducer(rawData);
const finalReport = manageCompetition(lineGenerator);
console.log(finalReport);