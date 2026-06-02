//Don't have to see. start------------------------------------------
const inputReader = require('readline').createInterface({
  input: process.stdin, output: process.stdout
});
let dataHandler;
const inputLines = [];

inputReader.on('line', function(line){inputLines.push(line);});
inputReader.on('close', function(){
  dataHandler = initializeInputHandler(inputLines);
  console.error('\n↑入力 ↓出力');
  processSolution();
});

function createDeepCopy(sourceObject){
  return (sourceObject instanceof Set) ? new Set(Array.from(sourceObject)) : JSON.parse(JSON.stringify(sourceObject));
}

function getNextInteger(){return applyConversion(fetchNextInput(),1);}
function getNextStringArray(){return applyConversion(fetchNextInput(),2);}
function getNextIntegerArray(){return applyConversion(fetchNextInput(),4);}
function getNextCharacterArray(){return applyConversion(fetchNextInput(),6);}

function fetchNextInput(){return dataHandler.fetchNext();}
function hasMoreInput(){return dataHandler.hasMore();}

class InputHandler {
  constructor(lines) {
    this.lines = lines;
    this.currentIndex = 0;
    this.maxLines = lines.length;
  }

  hasMore() {
    return (this.currentIndex < this.maxLines);
  }

  fetchNext() {
    if (this.hasMore()) {
      return this.lines[this.currentIndex++];
    } else {
      throw new Error('ArrayIndexOutOfBoundsException: No more input available.');
    }
  }
}

function initializeInputHandler(lines){
  return new InputHandler(lines);
}

function printOutput(message){console.log(message);}
function printDebugError(debugMessage){console.error('debug:' + require('util').inspect(debugMessage,false,null));}

const CONVERSION_STRATEGIES = new Map([
    [1, (val) => parseInt(val)],
    [2, (val) => val.split(' ')],
    [4, (val) => val.split(' ').map(Number)],
    [6, (val) => val.split('')],
    [7, (val) => val.split('').map(Number)],
    [8, (val) => val.join(' ')],
    [9, (val) => val.join('\n')],
    [0, (val) => val.join('')]
]);

function applyConversion(inputValue, conversionType){
  try{
    const strategy = CONVERSION_STRATEGIES.get(conversionType);
    if (strategy) {
      return strategy(inputValue);
    }
    return inputValue;
  }catch(e){
    return inputValue;
  }
}

//Don't have to see. end------------------------------------------

const SHEEP_STATE = "S";
const WOLF_STATE = "W";
const OBS_SAME = "o";
const OBS_DIFF = "x";
const NO_SOLUTION_INDICATOR = -1;

function determineNextAnimalState(currentObservation, currentAnimalType, prevAnimalType) {
  let nextAnimalType;
  if (currentObservation === OBS_SAME) { // 'o' - observes same type
    if (currentAnimalType === SHEEP_STATE) { // Current animal is Sheep
      nextAnimalType = prevAnimalType; // Next animal is same as previous
    } else { // Current animal is Wolf
      nextAnimalType = (prevAnimalType === SHEEP_STATE) ? WOLF_STATE : SHEEP_STATE; // Next animal is opposite of previous
    }
  } else { // 'x' - observes different type
    if (currentAnimalType === SHEEP_STATE) { // Current animal is Sheep
      nextAnimalType = (prevAnimalType === SHEEP_STATE) ? WOLF_STATE : SHEEP_STATE; // Next animal is opposite of previous
    } else { // Current animal is Wolf
      nextAnimalType = prevAnimalType; // Next animal is same as previous
    }
  }
  return nextAnimalType;
}

function processSolution(){
  const numAnimals = getNextInteger();
  const firstAnimalInitialState = SHEEP_STATE; // L is "S"
  const animalObservations = getNextCharacterArray();
  
  const animalStates = [firstAnimalInitialState]; // This is check[0]

  // Handle the determination of animalStates[1] (for the first animal's observation)
  const stateForAnimal1 = (animalObservations[0] === OBS_SAME) ? firstAnimalInitialState : WOLF_STATE;
  animalStates.push(stateForAnimal1); // This is check[1]

  // Loop to determine states for animalStates[2] through animalStates[numAnimals]
  for (let currentAnimalIndex = 1; currentAnimalIndex < numAnimals; currentAnimalIndex++) {
    const currentObservation = animalObservations[currentAnimalIndex];
    const currentAnimalPredictedState = animalStates[currentAnimalIndex];
    const previousAnimalPredictedState = animalStates[currentAnimalIndex - 1];
    
    const nextAnimalPredictedState = determineNextAnimalState(
      currentObservation,
      currentAnimalPredictedState,
      previousAnimalPredictedState
    );
    animalStates.push(nextAnimalPredictedState);
  }

  // Final check: The state of the N-th animal (animalStates[numAnimals]) must match the initial state
  if (animalStates[numAnimals] === firstAnimalInitialState) {
    animalStates.pop(); // Remove the N+1th element (which was check[N])
    printOutput(animalStates.join(""));
  } else {
    printOutput(NO_SOLUTION_INDICATOR);
  }
}
