let streamReader = require('readline').createInterface({
  input: process.stdin, output: process.stdout
});
let dataBufferHandler;
let capturedLines = [];
streamReader.on('line', function(textLine){ capturedLines.push(textLine); });
streamReader.on('close', function(){
  dataBufferHandler = createProcessor(capturedLines);
  console.error('\n↑input ↓output');
  executeCoreLogic();
});

function createProcessor(contentLines){  
  let currentPointer = 0;
  let totalLines = contentLines.length;
  return {
    checkAvailability : () => (currentPointer < totalLines),
    fetchEntry : () => {
      if(currentPointer < totalLines){ return contentLines[currentPointer++]; }
      else{ throw 'DataStreamExhaustedException'; }
    }
  };
}

function retrieveInteger(){ return parseInt(dataBufferHandler.fetchEntry()); }
function retrieveIntegerSeries(){ return dataBufferHandler.fetchEntry().split(' ').map(Number); }
function presentResult(outcomeMessage){ console.log(outcomeMessage); }

function executeCoreLogic(){
  let maxDepth = retrieveInteger();
  let rawNumbers = retrieveIntegerSeries();

  // Divergent sorting implementation: Selection Sort instead of built-in sort
  let customSort = (arrayToSort) => {
      let workingCopy = [...arrayToSort];
      for (let i = 0; i < workingCopy.length - 1; i++) {
          let minIndex = i;
          for (let j = i + 1; j < workingCopy.length; j++) {
              if (workingCopy[j] < workingCopy[minIndex]) {
                  minIndex = j;
              }
          }
          if (minIndex !== i) {
              [workingCopy[i], workingCopy[minIndex]] = [workingCopy[minIndex], workingCopy[i]]; // Swap
          }
      }
      return workingCopy;
  };
  
  let orderedNumbers = customSort(rawNumbers);
  
  // Divergent element retrieval: Closure with reversed array and index instead of direct pop()
  let numberDispenser = (function(sourceArray) {
      let internalReversedArray = [...sourceArray].reverse(); // Reverse once
      let currentPosition = 0;
      return () => {
          if (currentPosition < internalReversedArray.length) {
              return internalReversedArray[currentPosition++];
          }
          return undefined; // Mimics pop() on empty array
      };
  })(orderedNumbers);

  let accumulatedValues = [];
  accumulatedValues.push(numberDispenser()); // Get the largest element, representing the tree's root

  let finalDecision = "YES";

  // Divergent loop structure: Recursive function instead of imperative for-loop
  function analyzeTreeLevels(currentLevel, currentTotalStructure) {
    if (currentLevel > maxDepth) {
      return true; // All specified levels processed without violation
    }

    let currentLevelElements = [];
    let elementsToCollect = Math.pow(2, currentLevel); // Equivalent to 1 << currentLevel

    // Collect elements for the current level
    for (let k = 0; k < elementsToCollect; k++) {
      currentLevelElements.push(numberDispenser());
    }

    // Perform comparisons as per original logic
    for (let j = 0; j < currentLevelElements.length; j++) {
      // Replicates the exact comparison behavior, including JavaScript's handling of `undefined`
      // `number <= undefined` is `false`
      // `undefined <= number` is `false`
      // `undefined <= undefined` is `false`
      // The condition only becomes true if both are numbers AND the inequality holds.
      if (currentTotalStructure[j] <= currentLevelElements[j]) {
        return false; // Condition violated
      }
    }
    
    // Prepare for the next recursive call: merge current elements
    let updatedTotalStructure = [...currentTotalStructure, ...currentLevelElements]; // Using spread syntax for merging
    return analyzeTreeLevels(currentLevel + 1, updatedTotalStructure);
  }

  // Initial call to the recursive analysis
  if (!analyzeTreeLevels(1, accumulatedValues)) {
    finalDecision = "NO";
  }

  presentResult(finalDecision);
}