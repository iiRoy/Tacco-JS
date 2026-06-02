process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(inputData){
    const RADIX_DECIMAL = 10;
    let lastDiffChangeIndex;
    let currentNumberIndex;
    
    const inputLines = inputData.trim().split("\n");
    
    for(let lineIterator = 0; lineIterator < inputLines.length; ++lineIterator){
        let dataCount;
        let differenceChangeCount;
        let numberStringsArray;
        let previousValue, currentValue;
        let differenceMap;
        
        const nStringValue = inputLines[lineIterator];
        dataCount = parseInt(nStringValue, RADIX_DECIMAL);
        lineIterator++;
        
        if( dataCount === 0 ) {
            break;
        }
        
        differenceMap = new Array(dataCount + 1);
        
        const currentDataLine = inputLines[lineIterator];
        numberStringsArray = currentDataLine.trim().split(" ");
        
        currentValue = parseInt(numberStringsArray[1], RADIX_DECIMAL);
        previousValue = parseInt(numberStringsArray[0], RADIX_DECIMAL);
        differenceMap[1] = currentValue - previousValue;
        
        lastDiffChangeIndex = 0;
        differenceChangeCount = 0;
        previousValue = currentValue;
        
        const totalElementsInDataset = numberStringsArray.length;
        for(currentNumberIndex = 2; currentNumberIndex < totalElementsInDataset; ++currentNumberIndex){
            currentValue = parseInt(numberStringsArray[currentNumberIndex], RADIX_DECIMAL);
            
            const calculatedDifference = currentValue - previousValue;
            differenceMap[currentNumberIndex] = calculatedDifference;
            
            const priorDifference = differenceMap[currentNumberIndex - 1];
            
            if( calculatedDifference !== priorDifference ){
                lastDiffChangeIndex = currentNumberIndex;
                differenceChangeCount++;
            }
            previousValue = currentValue;
            
            const isSecondConditionTriggered = (differenceChangeCount === 1 && (currentNumberIndex - lastDiffChangeIndex) > 1);
            
            if( differenceChangeCount === 3 ){
                console.log(numberStringsArray[lastDiffChangeIndex - 2]);
                return;
            }
            else if( isSecondConditionTriggered ){
                console.log(numberStringsArray[lastDiffChangeIndex - 2]);
                return;
            }
        }
        
        console.log(numberStringsArray[lastDiffChangeIndex]);
    }
            
});
