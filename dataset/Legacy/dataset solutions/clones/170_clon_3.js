const fileSystemModule = require('fs');

function readStandardInput() {
    const standardInputFileDescriptor = process.stdin.fd;
    const totalInputLength = fileSystemModule.fstatSync(standardInputFileDescriptor).size;
    const rawInputBuffer = Buffer.alloc(totalInputLength);
    const actualBytesReadCount = fileSystemModule.readSync(standardInputFileDescriptor, rawInputBuffer, 0, totalInputLength, 0);
    return rawInputBuffer.toString('utf8', 0, actualBytesReadCount).split('\n');
}

executeKnapsackSolver();
  
function executeKnapsackSolver(){
    const inputLinesArray = readStandardInput();
    let currentLinePointer = 0;
    let currentCaseIdentifier = 1;

    while(true){
        const knapsackCapacity = Number(inputLinesArray[currentLinePointer++]);
        if(knapsackCapacity === 0){
            break;
        }
          
        const numberOfItems = Number(inputLinesArray[currentLinePointer++]);
        const dpTable = new Int16Array(knapsackCapacity + 1);

        for(let itemProcessingIndex = numberOfItems; itemProcessingIndex--;){
            const itemDetailsString = inputLinesArray[currentLinePointer++];
            const itemDataParts = itemDetailsString.split(",");
            const itemValue = Number(itemDataParts[0]);
            const itemWeight = Number(itemDataParts[1]);
      
            for(let currentCapacity = knapsackCapacity; currentCapacity - itemWeight >= 0; currentCapacity--){
                const valueIfIncluded = dpTable[currentCapacity - itemWeight] + itemValue;
                dpTable[currentCapacity] = Math.max(valueIfIncluded, dpTable[currentCapacity]);
            }
        }
      
        let finalOptimalWeight = 1001;
        let finalOptimalValue = 0;

        for(let weightIndex = 0; weightIndex <= knapsackCapacity; weightIndex++){
            const currentDpValue = dpTable[weightIndex];
            if(currentDpValue > finalOptimalValue){
                finalOptimalValue = currentDpValue;
                finalOptimalWeight = weightIndex;
            }
        }
          
        console.log("Case " + currentCaseIdentifier++ + ":\n" + finalOptimalValue + "\n" + finalOptimalWeight);
    }
}
