process.stdin.resume();
process.stdin.setEncoding('utf8');

var inputLines = [];
var inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

inputReader.on('line', (currentLine) => {
  inputLines.push(currentLine);
});

inputReader.on('close', () => {
  const elementCount = Number(inputLines[0]);
  
  const parseNumberArray = (lineString) => {
    return lineString.split(' ').map(valStr => Number(valStr));
  };

  const targetPermP = parseNumberArray(inputLines[1]);
  const targetPermQ = parseNumberArray(inputLines[2]);
 
  let positionP = 0;
  let positionQ = 0;
  
  function generatePermutations(sourceElements, elementsToPick){
    let resultPerms = [];
    const totalSourceElements = sourceElements.length;

    if(elementsToPick < 0 || totalSourceElements < elementsToPick) {
        return [];
    }
    
    if(elementsToPick === 0) {
        return [[]];
    }

    if(elementsToPick === 1){
      for(let idx = 0; idx < totalSourceElements; idx ++){
        resultPerms.push([sourceElements[idx]]);
      }
    } else {
      for(let idx = 0; idx < totalSourceElements; idx ++){
        let remainingElements = [...sourceElements];
        const currentElement = remainingElements.splice(idx, 1)[0];

        let subPerms = generatePermutations(remainingElements, elementsToPick - 1);
        
        for(let subIdx = 0; subIdx < subPerms.length; subIdx ++){
          resultPerms.push([currentElement].concat(subPerms[subIdx]));
        }
      }
    }
    return resultPerms;
  }

  const sequentialArray = Array.from({ length: elementCount }, (_, k) => k + 1);

  const allGeneratedPermutations = generatePermutations(sequentialArray, elementCount);

  let currentPermIndex = 0;
  
  const stringifyArray = (arr) => JSON.stringify(arr);

  const stringifiedTargetP = stringifyArray(targetPermP);
  const stringifiedTargetQ = stringifyArray(targetPermQ);

  for (let permIdx = 0; permIdx < allGeneratedPermutations.length; permIdx++) {
    currentPermIndex++;
    const currentPermutation = allGeneratedPermutations[permIdx];

    const stringifiedCurrentPerm = stringifyArray(currentPermutation);

    if (stringifiedCurrentPerm === stringifiedTargetP) {
      positionP = currentPermIndex;
    }
    if (stringifiedCurrentPerm === stringifiedTargetQ) {
      positionQ = currentPermIndex;
    }
  }
  
  console.log(Math.abs(positionP - positionQ));
});
