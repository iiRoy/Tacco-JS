const inputLines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');

// Parse the first line of input to get target health and number of spells
let firstLineParts = inputLines.shift().split(' ');
const targetHealth = Number(firstLineParts.shift()); // H in original
const numSpells = Number(firstLineParts.shift());   // N in original

// Array to store spell data: [damage, manaCost]
const spellData = []; // k in original

// Read spell details from subsequent input lines
for (let spellIndex = 0; spellIndex < numSpells; spellIndex++) {
    // Each line contains damage and mana cost for one spell
    spellData.push(inputLines.shift().split(' ').map(valStr => Number(valStr)));
}

// Dynamic programming array: minManaCost[h] stores the minimum mana to reach health 'h'
// Initialize with 0 mana for health 0. Other states are undefined (unreachable).
const minManaCost = [0]; // dp in original

// Iterate through possible health values from 0 up to targetHealth + 1
// We go slightly beyond H to ensure all potential states are considered for the final propagation.
for (let currentHealth = 0; currentHealth <= targetHealth + 1; currentHealth++) {
    // If the current health state is unreachable (no known mana cost), skip it
    if (minManaCost[currentHealth] === undefined) {
        continue;
    }

    // For each reachable current health state, try applying every available spell
    for (let spellIndex = 0; spellIndex < numSpells; spellIndex++) {
        const spellDamage = spellData[spellIndex][0];
        const spellMana = spellData[spellIndex][1];

        const nextHealth = currentHealth + spellDamage;
        const potentialNewMana = minManaCost[currentHealth] + spellMana;

        // If the next health state is currently unreachable, or if we found a cheaper way to reach it, update
        if (minManaCost[nextHealth] === undefined || minManaCost[nextHealth] > potentialNewMana) {
            minManaCost[nextHealth] = potentialNewMana;
        }
    }
}

// After calculating minimum mana costs for all reachable health points,
// we need to find the overall minimum mana to reach at least targetHealth.
// This means if reaching H+1 is cheaper than H, we should take H+1.
// We propagate the minimum cost backwards from the highest calculated health.
let overallMinMana = minManaCost[minManaCost.length - 1]; // min in original, initialized with the last known cost

// Iterate backwards from the highest health index down to targetHealth
for (let healthIdx = minManaCost.length - 1; healthIdx >= targetHealth; healthIdx--) {
    // If the current health state is unreachable or its cost is higher than the overall minimum found so far,
    // update its cost to the overall minimum.
    if (minManaCost[healthIdx] === undefined || minManaCost[healthIdx] >= overallMinMana) {
        minManaCost[healthIdx] = overallMinMana;
    } else {
        // Otherwise, this health state provides a new, lower overall minimum.
        overallMinMana = minManaCost[healthIdx];
    }
}

// Output the minimum mana cost required to reach at least the target health.
console.log(minManaCost[targetHealth]);
