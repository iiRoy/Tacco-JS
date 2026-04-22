function computeOutput(sourceMaterial) {
  let lineBoundary = -1;
  for (let charIndex = 0; charIndex < sourceMaterial.length; ++charIndex) {
    if (sourceMaterial.charCodeAt(charIndex) === 10) {
      lineBoundary = charIndex;
      break;
    }
  }

  let initialSegmentChars = [];
  let limit = (lineBoundary !== -1) ? lineBoundary : sourceMaterial.length;
  for (let charIndex = 0; charIndex < limit; ++charIndex) {
    initialSegmentChars.push(sourceMaterial.charCodeAt(charIndex));
  }

  let leftPointer = 0;
  while (leftPointer < initialSegmentChars.length && initialSegmentChars[leftPointer] === 32) {
    leftPointer++;
  }

  let rightPointer = initialSegmentChars.length - 1;
  while (rightPointer >= leftPointer && initialSegmentChars[rightPointer] === 32) {
    rightPointer--;
  }

  let processedLineChars = [];
  if (leftPointer <= rightPointer) {
    for (let charIndex = leftPointer; charIndex <= rightPointer; ++charIndex) {
      processedLineChars.push(initialSegmentChars[charIndex]);
    }
  }

  let wordUnits = [];
  let currentUnitChars = [];
  let isCurrentlyInSpace = true;

  for (let charCode of processedLineChars) {
    if (charCode === 32) {
      if (!isCurrentlyInSpace) {
        wordUnits.push(currentUnitChars.map(c => String.fromCharCode(c)).join(''));
        currentUnitChars = [];
      }
      isCurrentlyInSpace = true;
    } else {
      isCurrentlyInSpace = false;
      currentUnitChars.push(charCode);
    }
  }
  if (currentUnitChars.length > 0 || isCurrentlyInSpace) {
    wordUnits.push(currentUnitChars.map(c => String.fromCharCode(c)).join(''));
  }
  
  if (processedLineChars.length === 0 && wordUnits.length === 0) {
    wordUnits.push("");
  }

  let relevantWord = wordUnits[1];

  let startingCharOfRelevantWord;
  if (relevantWord === undefined) {
    startingCharOfRelevantWord = relevantWord[0]; 
  } else if (relevantWord.length === 0) {
    startingCharOfRelevantWord = undefined;
  } else {
    startingCharOfRelevantWord = relevantWord.charAt(0);
  }

  let finalOutputComponents = [];
  finalOutputComponents.push('A');
  finalOutputComponents.push(String(startingCharOfRelevantWord));
  finalOutputComponents.push('C');

  console.log(finalOutputComponents.join(''));
}

computeOutput(require("fs").readFileSync("/dev/stdin", "utf8"));