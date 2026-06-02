function main(inputLines) {
    const [initialParameters, ...monsterDataLines] = inputLines;
    const [numMonsters, bombRange, bombDamage] = initialParameters.split(" ").map(Number);

    const targets = monsterDataLines.slice(0, numMonsters).map(line => line.split(" ").map(Number));

    targets.sort((a, b) => a[0] - b[0]);

    let totalBombsDeployed = 0;
    const activeBombEffects = []; // Stores [effect_end_x_coordinate, damage_amount_from_this_bomb_wave]
    let currentCumulativeDamage = 0;

    for (let i = 0; i < numMonsters; i++) {
        let [targetX, targetHealth] = targets[i];

        while (activeBombEffects.length > 0 && activeBombEffects[0][0] < targetX) {
            const [_, expiredDamage] = activeBombEffects.shift();
            currentCumulativeDamage -= expiredDamage;
        }

        targetHealth -= currentCumulativeDamage;

        if (targetHealth > 0) {
            const bombsToDrop = Math.ceil(targetHealth / bombDamage);
            totalBombsDeployed += bombsToDrop;

            const newBombWaveDamage = bombsToDrop * bombDamage;
            const bombEffectEndCoordinate = targetX + 2 * bombRange + 1;

            activeBombEffects.push([bombEffectEndCoordinate, newBombWaveDamage]);
            currentCumulativeDamage += newBombWaveDamage;
        }
    }

    console.log(totalBombsDeployed);
}

main(require('fs').readFileSync('/dev/stdin', 'utf8').split("\n"));
