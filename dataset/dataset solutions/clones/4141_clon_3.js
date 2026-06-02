const parseDecimalInteger = (str) => parseInt(str, 10);

const splitBySpace = (str) => str.split(" ");

function Main(inputData) {
    const dataLines = inputData.split("\n");

    const headerParts = splitBySpace(dataLines[0]);
    const numItems = parseDecimalInteger(headerParts[0]);
    const targetHealth = parseDecimalInteger(headerParts[1]);

    const attackStrengths = [];
    const throwStrengths = [];
    const qualifyingThrows = [];
    
    let totalActionCount = 0;
    let accumulatedEffectiveDamage = 0;
    let damageFromSortedThrows = 0;

    for (let i = 1; i <= numItems; i++) {
        const currentItemData = splitBySpace(dataLines[i]);
        attackStrengths[i] = currentItemData[0];
        throwStrengths[i] = currentItemData[1];
    }

    let maxAttackStrength = "0"; 
    for (let i = 1; i <= numItems; i++) {
        if (maxAttackStrength < attackStrengths[i]) {
            maxAttackStrength = attackStrengths[i];
        }
    }

    for (let i = 1; i <= numItems; i++) {
        const currentThrowValueString = throwStrengths[i];
        if (maxAttackStrength < currentThrowValueString) {
            qualifyingThrows.push(parseDecimalInteger(currentThrowValueString));
        }
    }

    accumulatedEffectiveDamage = qualifyingThrows.reduce((sum, val) => sum + val, 0);

    if (accumulatedEffectiveDamage < targetHealth) {
        let remainingHealthNeeded = targetHealth - accumulatedEffectiveDamage;
        
        const numericMaxAttack = parseDecimalInteger(maxAttackStrength);

        const fullAttacksRequired = Math.floor(remainingHealthNeeded / numericMaxAttack);
        
        if (remainingHealthNeeded % numericMaxAttack > 0) {
            totalActionCount++;
        }
        
        totalActionCount += qualifyingThrows.length + fullAttacksRequired;
    } else {
        qualifyingThrows.sort((valA, valB) => valB - valA);

        totalActionCount = 0;
        for (let i = 0; i < qualifyingThrows.length; i++) {
            damageFromSortedThrows += qualifyingThrows[i];
            totalActionCount++;
            if (damageFromSortedThrows >= targetHealth) {
                break;
            }
        }
    }

    console.log(totalActionCount);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
