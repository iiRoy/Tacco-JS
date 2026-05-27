const inputData = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
const [targetHealthStr, spellCountStr] = inputData.shift().split(' ');
const targetHealth = Number(targetHealthStr);
const spellCount = Number(spellCountStr);
const availableSpells = inputData.map(line => line.split(' ').map(Number));

const maxSpellAttack = availableSpells.reduce((max, [attack, _]) => Math.max(max, attack), 0);
const maxDamageToTrack = targetHealth + 1 + maxSpellAttack;

const manaCosts = Array(maxDamageToTrack + 1).fill(Infinity);
manaCosts[0] = 0;

Array.from({ length: maxDamageToTrack + 1 }, (_, d) => d)
    .forEach(currentDamageLevel => {
        if (manaCosts[currentDamageLevel] === Infinity) {
            return;
        }

        availableSpells.forEach(([attackValue, manaCost]) => {
            const nextDamageLevel = currentDamageLevel + attackValue;

            if (nextDamageLevel <= maxDamageToTrack) {
                manaCosts[nextDamageLevel] = Math.min(
                    manaCosts[nextDamageLevel],
                    manaCosts[currentDamageLevel] + manaCost
                );
            }
        });
    });

const finalMinMana = Array.from({ length: maxDamageToTrack - targetHealth + 1 }, (_, i) => maxDamageToTrack - i)
    .reduce((currentOverallMin, damageIndex) => {
        const costForExact = manaCosts[damageIndex];

        if (costForExact !== Infinity) {
            currentOverallMin = Math.min(currentOverallMin, costForExact);
        }
        return currentOverallMin;
    }, Infinity);

console.log(finalMinMana);
