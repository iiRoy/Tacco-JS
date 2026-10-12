const processInputData = (dataString) => {
  const [firstLine, secondLine, thirdLine] = dataString.split('\n');
  const regionCount = Number(firstLine);
  const cityCapacities = secondLine.split(' ').map(Number);
  const monsterCounts = thirdLine.split(' ').map(Number);

  const resolveRegionBattle = (currentCityPower, nextCityPower, regionMonsters) => {
    let totalDefeatedInRegion = 0;
    let nextCityPowerUsed = 0;

    if (regionMonsters <= currentCityPower) {
      totalDefeatedInRegion = regionMonsters;
    } else if (nextCityPower !== undefined) {
      const monstersRemainingAfterCurrent = regionMonsters - currentCityPower;
      const defeatedByNextCity = Math.min(monstersRemainingAfterCurrent, nextCityPower);
      totalDefeatedInRegion = currentCityPower + defeatedByNextCity;
      nextCityPowerUsed = defeatedByNextCity;
    }

    return { defeated: totalDefeatedInRegion, consumedNext: nextCityPowerUsed };
  };

  const finalResult = monsterCounts.reduce((acc, currentMonsterGroup, index) => {
    const currentCityCapacity = acc.capacities[index];
    const nextCityCapacity = acc.capacities[index + 1];

    const battleOutcome = resolveRegionBattle(currentCityCapacity, nextCityCapacity, currentMonsterGroup);

    acc.totalDefeated += battleOutcome.defeated;

    if (index + 1 < acc.capacities.length && battleOutcome.consumedNext > 0) {
      acc.capacities[index + 1] -= battleOutcome.consumedNext;
    }

    return acc;
  }, { totalDefeated: 0, capacities: cityCapacities });

  console.log(finalResult.totalDefeated);
};

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
