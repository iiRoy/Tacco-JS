// Boilerplate start ------------------------------------------
var inputReader = require('readline').createInterface({
  input: process.stdin, output: process.stdout
});
var inputHandler;
var inputLines = [];

inputReader.on('line', function(lineContent){
  inputLines.push(lineContent);
});

inputReader.on('close', function(){
  inputHandler = initializeInputProcessor(inputLines);
  console.error('\n↑入力 ↓出力');
  solveProblem();
});

function createDeepCopy(originalObject){
  return (originalObject instanceof Set) ? new Set(Array.from(originalObject)) : JSON.parse(JSON.stringify(originalObject));
}

function readNextInt(){ return convertInput(getNextToken(), 1); }
function readNextStrArray(){ return convertInput(getNextToken(), 2); }
function readNextIntArray(){ return convertInput(getNextToken(), 4); }
function readNextCharArray(){ return convertInput(getNextToken(), 6); }

function getNextToken(){ return inputHandler.getNext(); }
function hasMoreTokens(){ return inputHandler.hasMore(); }

class InputProcessor {
  constructor(lines) {
    this.dataLines = lines;
    this.currentIndex = 0;
    this.maxLines = lines.length;
  }

  hasMore() {
    return (this.currentIndex < this.maxLines);
  }

  getNext() {
    if (this.hasMore()) {
      return this.dataLines[this.currentIndex++];
    } else {
      throw 'ArrayIndexOutOfBoundsException ‚There is no more input';
    }
  }
}

function initializeInputProcessor(lines){  
  return new InputProcessor(lines);
}

function printResult(outputValue){ console.log(outputValue); }
function printDebug(debugMessage){ console.error('debug:' + require('util').inspect(debugMessage,false,null)); }

// Helper for input conversion types
const CONVERSION_TYPES = {
  PARSE_INT: 1,
  SPLIT_SPACE: 2,
  SPLIT_SPACE_AND_PARSE_INT: 4,
  SPLIT_CHAR: 6,
  SPLIT_CHAR_AND_PARSE_INT: 7,
  JOIN_SPACE: 8,
  JOIN_NEWLINE: 9,
  JOIN_NO_CHAR: 0
};

function convertInput(inputValue, conversionType){
  try {
    switch(conversionType){
      case CONVERSION_TYPES.PARSE_INT: return parseInt(inputValue);
      case CONVERSION_TYPES.SPLIT_SPACE: return inputValue.split(' ');
      case CONVERSION_TYPES.SPLIT_SPACE_AND_PARSE_INT: return inputValue.split(' ').map(Number);
      case CONVERSION_TYPES.SPLIT_CHAR: return inputValue.split('');
      case CONVERSION_TYPES.SPLIT_CHAR_AND_PARSE_INT: return inputValue.split('').map(Number);
      case CONVERSION_TYPES.JOIN_SPACE: return inputValue.join(' ');
      case CONVERSION_TYPES.JOIN_NEWLINE: return inputValue.join('\n');
      case CONVERSION_TYPES.JOIN_NO_CHAR: return inputValue.join('');
      default: return inputValue;
    }
  } catch(e) {
    return inputValue;
  }
}

// Boilerplate end ------------------------------------------

// Main logic start
function solveProblem(){
  const [numMonsters, bombRadius, bombDamage] = readNextIntArray();

  const monsterLocations = [];
  for(let i = 0; i < numMonsters; i++){
    monsterLocations.push(readNextIntArray());
  }

  // Define constants for array indices for clarity
  const MONSTER_POSITION_INDEX = 0;
  const MONSTER_HEALTH_INDEX = 1;

  // Sort monsters by their position
  monsterLocations.sort((monsterA, monsterB) => monsterA[MONSTER_POSITION_INDEX] - monsterB[MONSTER_POSITION_INDEX]);

  let totalBombsUsed = 0;

  // Helper function to calculate bombs needed for a monster
  const calculateBombsRequired = (currentHealth, damagePerBomb) => {
    if (currentHealth <= 0) { // Guard clause: no bombs needed if already defeated
      return 0;
    }
    return Math.ceil(currentHealth / damagePerBomb);
  };

  // Helper function to check if a target monster is within the blast range
  const isMonsterWithinBlastRange = (targetMonsterPosition, blastOriginPosition, effectiveRadius) => {
    const blastReach = blastOriginPosition + 2 * effectiveRadius;
    return targetMonsterPosition <= blastReach;
  };

  for(let currentMonsterIdx = 0; currentMonsterIdx < numMonsters; currentMonsterIdx++){
    let currentMonster = monsterLocations[currentMonsterIdx];
    let currentMonsterHealth = currentMonster[MONSTER_HEALTH_INDEX];

    // If the current monster is already defeated, move to the next
    if(currentMonsterHealth <= 0){
      continue;
    }

    let currentMonsterPosition = currentMonster[MONSTER_POSITION_INDEX];
    
    // Calculate how many bombs are needed to defeat the current monster
    let bombsToDeploy = calculateBombsRequired(currentMonsterHealth, bombDamage);
    totalBombsUsed += bombsToDeploy;

    // Calculate the total damage from these bombs
    const totalDamageFromBombs = bombsToDeploy * bombDamage;

    // Apply damage to subsequent monsters within the blast radius
    for(let targetMonsterIdx = currentMonsterIdx + 1; targetMonsterIdx < numMonsters; targetMonsterIdx++){
      let targetMonster = monsterLocations[targetMonsterIdx];
      let targetMonsterPosition = targetMonster[MONSTER_POSITION_INDEX];

      // Check if the target monster is within the blast range of the current bomb drop
      if(isMonsterWithinBlastRange(targetMonsterPosition, currentMonsterPosition, bombRadius)){
        // Reduce the target monster's health, ensuring it doesn't go below zero
        targetMonster[MONSTER_HEALTH_INDEX] = Math.max(0, targetMonster[MONSTER_HEALTH_INDEX] - totalDamageFromBombs);
      } else {
        // Monsters are sorted by position, so if this one is out of range, subsequent ones will be too
        break;
      }
    }
  }
  printResult(totalBombsUsed);
}
// Main logic end
