function processInput(rawLines) {
    const parameters = rawLines[0].split(" ").map(Number);
    const numEntities = parameters[0];
    const radiusReach = parameters[1];
    const powerUnit = parameters[2];

    const entityData = [];
    for (let entityIdx = 1; entityIdx <= numEntities; entityIdx++) {
        const parts = rawLines[entityIdx].split(" ").map(Number);
        entityData.push({ coord: parts[0], health: parts[1] });
    }

    entityData.sort((a, b) => a.coord - b.coord);

    let totalStrikes = 0;
    let cumulativeDamage = 0;
    
    const activeBlastEffects = []; 

    for (let entityIdx = 0; entityIdx < numEntities; entityIdx++) {
        const currentEntity = entityData[entityIdx];

        while (activeBlastEffects.length > 0 && activeBlastEffects[0].terminationCoord <= currentEntity.coord) {
            const expiredEffect = activeBlastEffects.shift();
            cumulativeDamage -= expiredEffect.appliedPower;
        }

        const effectiveHealth = currentEntity.health - cumulativeDamage;

        if (effectiveHealth > 0) {
            const necessaryStrikes = Math.ceil(effectiveHealth / powerUnit);
            totalStrikes += necessaryStrikes;

            const damageFromThisStrike = necessaryStrikes * powerUnit;
            cumulativeDamage += damageFromThisStrike;

            const terminationCoord = currentEntity.coord + (radiusReach * 2) + 2;
            
            activeBlastEffects.push({ terminationCoord: terminationCoord, appliedPower: damageFromThisStrike });
        }
    }

    process.stdout.write(String(totalStrikes) + "\n");
}

processInput(require('node:fs').readFileSync('/dev/stdin', 'utf8').split("\n"));