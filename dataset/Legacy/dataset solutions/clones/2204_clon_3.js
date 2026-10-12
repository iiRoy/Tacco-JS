const inputLines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');

const firstLineParts = inputLines.shift().split(' ');
const targetHealth = Number(firstLineParts[0]);
const numSpells = Number(firstLineParts[1]);

const spellData = [];
let maxSpellDamage = 0;
for (let spellIdx = 0; spellIdx < numSpells; spellIdx++) {
    const spellInfo = inputLines.shift().split(' ').map(s => Number(s));
    spellData.push(spellInfo);
    if (spellInfo[0] > maxSpellDamage) {
        maxSpellDamage = spellInfo[0];
    }
}

const maxPossibleDamageIndex = targetHealth + 1 + maxSpellDamage;

const minCostForDamage = new Array(maxPossibleDamageIndex + 1).fill(Infinity);
minCostForDamage[0] = 0;

for (let currentDamage = 0; currentDamage <= maxPossibleDamageIndex; currentDamage++) {
    if (minCostForDamage[currentDamage] === Infinity) {
        continue;
    }

    for (let spellIdx = 0; spellIdx < numSpells; spellIdx++) {
        const [damageDealtBySpell, spellCost] = spellData[spellIdx];
        const nextDamageLevel = currentDamage + damageDealtBySpell;
        const newAccumulatedCost = minCostForDamage[currentDamage] + spellCost;

        if (nextDamageLevel <= maxPossibleDamageIndex) {
            if (newAccumulatedCost < minCostForDamage[nextDamageLevel]) {
                minCostForDamage[nextDamageLevel] = newAccumulatedCost;
            }
        }
    }
}

let currentMinimumOverallCost = minCostForDamage[maxPossibleDamageIndex];

for (let damageLevel = maxPossibleDamageIndex; damageLevel >= targetHealth; damageLevel--) {
    if (minCostForDamage[damageLevel] !== Infinity && minCostForDamage[damageLevel] < currentMinimumOverallCost) {
        currentMinimumOverallCost = minCostForDamage[damageLevel];
    }
    minCostForDamage[damageLevel] = currentMinimumOverallCost;
}

console.log(minCostForDamage[targetHealth]);
