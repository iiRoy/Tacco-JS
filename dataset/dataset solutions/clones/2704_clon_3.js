function processInputData(rawData) {
  const inputLines = rawData.split("\n");
  const numEntries = parseInt(inputLines[0]);

  const parseNumberArray = (lineString) => lineString.split(" ").map(Number);

  let monsterCounts = parseNumberArray(inputLines[1]);
  let heroPowers = parseNumberArray(inputLines[2]);
  
  let totalMonstersDefeated = 0;
  
  for (let currentIndex = 0; currentIndex < heroPowers.length; currentIndex++) {
    const currentTownMonsters = monsterCounts[currentIndex];
    let nextTownMonsters = monsterCounts[currentIndex + 1]; 
    const currentHeroPower = heroPowers[currentIndex];
    
    let defeatedInCurrentTown = Math.min(currentHeroPower, currentTownMonsters);
    totalMonstersDefeated += defeatedInCurrentTown;
    
    let remainingHeroPower = currentHeroPower - defeatedInCurrentTown;
    
    if (remainingHeroPower > 0) {
      let defeatedInNextTown = Math.min(remainingHeroPower, nextTownMonsters);
      totalMonstersDefeated += defeatedInNextTown;
      monsterCounts[currentIndex + 1] -= defeatedInNextTown;
    }
  }
  
  console.log(totalMonstersDefeated);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
