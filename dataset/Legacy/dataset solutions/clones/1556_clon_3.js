function processInputData(rawInputString) {
    const MOD_CONSTANT = BigInt(1000000007);

    const inputLines = rawInputString.split("\n");
    const numberStrings = inputLines[1].split(" ");
    const numericBigInts = numberStrings.map(BigInt);

    let runningTotalSum = numericBigInts.reduce((accumulator, currentElement) => accumulator + currentElement, BigInt(0));
    let pairwiseProductSum = BigInt(0);

    for (let i = 0; i < numericBigInts.length; i++) {
        const currentBigInt = numericBigInts[i];
        
        const sumOfElementsAfterCurrent = runningTotalSum - currentBigInt;
        
        pairwiseProductSum += currentBigInt * sumOfElementsAfterCurrent;
        
        runningTotalSum = sumOfElementsAfterCurrent; 
    }
    
    console.log(Number(pairwiseProductSum % MOD_CONSTANT));
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
