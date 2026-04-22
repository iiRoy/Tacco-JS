var inputHandler = require('readline').createInterface({
  input: process.stdin, output: process.stdout
});
var dataStream;
var collectedLines = [];

inputHandler.on('line', function(text){
  collectedLines.push(text);
});

inputHandler.on('close', function(){
  dataStream = setupDataStream(collectedLines);
  console.error('\n↑Input ↓Output');
  calculateRequiredStrikes();
});

function setupDataStream(sourceLines){  
  return {
    sourceLines : sourceLines,
    currentPointer : 0,
    totalLines : sourceLines.length,
    hasMoreItems : function(){return (this.currentPointer < this.totalLines);},
    fetchNextSegment : function(){
      if(this.hasMoreItems()){
        return this.sourceLines[this.currentPointer++];
      } else {
        throw 'End of Input Stream Reached';
      }
    }
  };
}

function getNextItem(){ return dataStream.fetchNextSegment(); }

function getSingleNumber(){ return processData(getNextItem(), 1); }
function getStringArray(){ return processData(getNextItem(), 2); }
function getNumbersArray(){ return processData(getNextItem(), 4); }
function getCharacterArray(){ return processData(getNextItem(), 6); }

function printOutcome(result){ console.log(result); }

function processData(value, classifier){
  try{
    switch(classifier){
      case 1: return parseInt(value);
      case 2: return value.split(' ');
      case 4: return value.split(' ').map(Number);
      case 6: return value.split('');
      case 7: return value.split('').map(Number);
      case 8: return value.join(' ');
      case 9: return value.join('\n');
      case 0: return value.join('');
      default: return value;
    }
  }catch(e){
    return value;
  }
}

class FoeUnit {
  constructor(loc, resilience) {
    this.loc = loc;
    this.resilience = resilience;
  }

  isDefeated() {
    return this.resilience <= 0;
  }

  takeDamage(amount) {
    this.resilience = Math.max(0, this.resilience - amount);
  }
}

function applyImpactRecursively(squad, startIndex, totalFoes, damageAmount, zoneLimit) {
  if (startIndex >= totalFoes) {
    return;
  }

  const affectedFoe = squad[startIndex];

  if (affectedFoe.loc <= zoneLimit) {
    affectedFoe.takeDamage(damageAmount);
    applyImpactRecursively(squad, startIndex + 1, totalFoes, damageAmount, zoneLimit);
  }
}

function calculateRequiredStrikes(){
  const initialParameters = getNumbersArray();
  const enemyCount = initialParameters[0];
  const distanceReach = initialParameters[1];
  const damagePerHit = initialParameters[2];

  const foeSquad = [];
  for (let k = 0; k < enemyCount; k++) {
    const foeData = getNumbersArray();
    foeSquad.push(new FoeUnit(foeData[0], foeData[1]));
  }

  foeSquad.sort((f1, f2) => f1.loc - f2.loc);

  let totalStrikes = 0;
  let currentFoeIndex = 0;

  while (currentFoeIndex < enemyCount) {
    const currentFoe = foeSquad[currentFoeIndex];

    if (currentFoe.isDefeated()) {
      currentFoeIndex++;
      continue;
    }

    const strikesToSubdue = Math.ceil(currentFoe.resilience / damagePerHit);
    totalStrikes += strikesToSubdue;

    const effectiveDamage = strikesToSubdue * damagePerHit;
    const impactZoneEnd = currentFoe.loc + 2 * distanceReach;

    applyImpactRecursively(foeSquad, currentFoeIndex + 1, enemyCount, effectiveDamage, impactZoneEnd);

    currentFoeIndex++;
  }

  printOutcome(totalStrikes);
}