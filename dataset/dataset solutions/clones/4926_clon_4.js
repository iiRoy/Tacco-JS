const initialCondition = { currentPoints: 0, activeReservations: 0 };

const transitionMap = new Map();

transitionMap.set('g_reserved', (prev) => ({
  currentPoints: prev.currentPoints + 1,
  activeReservations: prev.activeReservations - 1,
}));

transitionMap.set('g_unreserved', (prev) => prev);

transitionMap.set('p', (prev) => ({
  currentPoints: prev.currentPoints - 1,
  activeReservations: prev.activeReservations + 1,
}));

const applyEffect = (currentAccumulator, nextCharacter) => {
  let key;
  if (nextCharacter === 'g') {
    key = currentAccumulator.activeReservations > 0 ? 'g_reserved' : 'g_unreserved';
  } else if (nextCharacter === 'p') {
    key = 'p';
  } else {
    return currentAccumulator;
  }
  
  const effectFunction = transitionMap.get(key);
  return effectFunction ? effectFunction(currentAccumulator) : currentAccumulator;
};

const externalFileReader = require('node:fs');
const rawTextFromInput = externalFileReader.readFileSync('/dev/stdin', 'utf8');
const processedTextLine = rawTextFromInput.split('\n')[0];

const finalScoreState = [...processedTextLine].reduce(applyEffect, initialCondition);

console.log(finalScoreState.currentPoints);