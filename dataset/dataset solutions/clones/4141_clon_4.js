function ExecuteCombatSimulation(battleData) {
	const dataLines = battleData.split('\n');
	const [weaponQuantityStr, targetHealthStr] = dataLines[0].split(' ');

	const weaponQuantity = Number(weaponQuantityStr);
	const targetHealth = Number(targetHealthStr);

	const weaponDetails = dataLines.slice(1, weaponQuantity + 1).map(lineText => {
		const [swingPowerStr, throwPowerStr] = lineText.split(' ');
		return {
			swing: Number(swingPowerStr),
			throw: Number(throwPowerStr)
		};
	});

	const peakSwingPower = weaponDetails.reduce((maxVal, currentWeapon) => Math.max(maxVal, currentWeapon.swing), 0);

	const effectiveProjectiles = weaponDetails
		.filter(weapon => weapon.throw > peakSwingPower)
		.map(weapon => weapon.throw);

	const totalProjectileDamage = effectiveProjectiles.reduce((sum, val) => sum + val, 0);

	let actionCounter = 0;

	if (totalProjectileDamage < targetHealth) {
		actionCounter += effectiveProjectiles.length;

		const remainingHealth = targetHealth - totalProjectileDamage;
		const swingActionsRequired = Math.ceil(remainingHealth / peakSwingPower);

		actionCounter += swingActionsRequired;
	} else {
		const sortedEffectiveProjectiles = [...effectiveProjectiles].sort((val1, val2) => val2 - val1);

		let currentDamageAccumulated = 0;
		for (const projectileStrength of sortedEffectiveProjectiles) {
			if (currentDamageAccumulated >= targetHealth) {
				break;
			}
			currentDamageAccumulated += projectileStrength;
			actionCounter++;
		}
	}
	
	console.log(actionCounter);
}
ExecuteCombatSimulation(require("fs").readFileSync("/dev/stdin", "utf8"));