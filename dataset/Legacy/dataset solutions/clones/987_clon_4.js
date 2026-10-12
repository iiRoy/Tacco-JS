const inputLines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
const arraySize = parseInt(inputLines.shift(), 10);
const initialNumbers = inputLines.shift().split(' ').map(Number);

const allStates = Array.from({ length: initialNumbers.length }).reduce((accumulatorOfStates, _, currentIndex) => {
    const currentArraySnapshot = accumulatorOfStates.length === 0 
        ? [...initialNumbers] 
        : [...accumulatorOfStates[accumulatorOfStates.length - 1]];
    
    if (currentIndex === 0) {
        accumulatorOfStates.push(currentArraySnapshot);
        return accumulatorOfStates;
    }

    const elementToInsert = currentArraySnapshot[currentIndex];
    const sortedPrefixSlice = currentArraySnapshot.slice(0, currentIndex);
    
    const insertionPointInPrefix = sortedPrefixSlice.findIndex(val => val > elementToInsert);
    
    const finalInsertionIndex = insertionPointInPrefix === -1 
        ? currentIndex 
        : insertionPointInPrefix;

    const nextArrayState = [
        ...currentArraySnapshot.slice(0, finalInsertionIndex),
        elementToInsert,
        ...currentArraySnapshot.slice(finalInsertionIndex, currentIndex),
        ...currentArraySnapshot.slice(currentIndex + 1)
    ];
    
    accumulatorOfStates.push(nextArrayState);
    return accumulatorOfStates;
}, []);

allStates.forEach(stateArray => console.log(stateArray.join(' ')));
