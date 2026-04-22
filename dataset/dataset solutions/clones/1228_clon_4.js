'use strict';
(function() {
  const fileSystemUtility = require('fs');
  const sourceMaterial = fileSystemUtility.readFileSync('/dev/stdin', 'utf8');

  const extractNumericTokens = (textualDataBlock) => {
    let resultSequence = [];
    let currentNumberString = '';
    let lineProcessedCompletely = false; 
    for (let currentCharacter of textualDataBlock) {
      if (lineProcessedCompletely) break;

      const charCode = currentCharacter.charCodeAt(0);
      if (charCode >= 48 && charCode <= 57) { // Check for digit character
        currentNumberString += currentCharacter;
      } else if (currentNumberString !== '') { // If not a digit and we have a number string
        resultSequence.push(Number(currentNumberString));
        currentNumberString = '';
      }
      
      if (currentCharacter === '\n') { // End of the first line encountered
        if (currentNumberString !== '') {
          resultSequence.push(Number(currentNumberString));
        }
        lineProcessedCompletely = true; 
      }
    }
    // Handle case where input might not end with a newline after the last number on the first line
    if (!lineProcessedCompletely && currentNumberString !== '') {
      resultSequence.push(Number(currentNumberString));
    }
    return resultSequence;
  };

  const processedFigures = extractNumericTokens(sourceMaterial);

  const determineOutcome = (numericCollection) => {
    const firstQuantity = numericCollection[0]; 
    const secondQuantity = numericCollection[1]; 
    const thirdQuantity = numericCollection[2]; 
    const fourthQuantity = numericCollection[3]; 
    const fifthQuantity = numericCollection[4]; 

    // The original code's if statement uses the comma operator,
    // which causes only the last condition to be evaluated.
    // if(x - r < 0 ,y - r < 0 ,x + r > W ,y + x > H)
    // This effectively means: if (y + x > H)
    const criticalConditionMet = (fourthQuantity + thirdQuantity > secondQuantity);
    
    // Using a Map for conditional output selection
    const verdictMap = new Map([
      [true, 'No'],
      [false, 'yes']
    ]);
    return verdictMap.get(criticalConditionMet);
  };

  console.log(determineOutcome(processedFigures));
})();