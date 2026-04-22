"use strict";

const processInputData = (rawTextContent) => {
    const parsedLines = rawTextContent.trim().split(/\s*\n\s*/);
    const initialParameters = parsedLines[0].split(/\s+/);
    
    const bladeCount = Number(initialParameters[0]);
    const monsterHealth = Number(initialParameters[1]);

    const weaponArsenal = parsedLines.slice(1, bladeCount + 1).map(line => {
        const weaponAttributes = line.split(/\s+/);
        return {
            strike: Number(weaponAttributes[0]),
            toss: Number(weaponAttributes[1])
        };
    });

    let overallTossDamage = 0;
    let maximumStrikeDamage = 0;

    overallTossDamage = weaponArsenal.reduce((currentSum, currentWeapon) => currentSum + currentWeapon.toss, 0);
    maximumStrikeDamage = Math.max(...weaponArsenal.map(weapon => weapon.strike));

    let finalActionCount;

    if (overallTossDamage >= monsterHealth) {
        finalActionCount = bladeCount;
    } else {
        const healthAfterAllTosses = monsterHealth - overallTossDamage;
        
        const necessaryStrikes = (healthAfterAllTosses > 0) ? 
                                 (Math.floor((healthAfterAllTosses - 1) / maximumStrikeDamage) + 1) : 0;
        
        if (bladeCount === 1) {
            finalActionCount = necessaryStrikes + 1;
        } else {
            finalActionCount = necessaryStrikes + (bladeCount - 1);
        }
    }
    
    console.log(finalActionCount);
};

(function() {
    const inputContent = require('fs').readFileSync('/dev/stdin', 'utf8');
    processInputData(inputContent);
})();