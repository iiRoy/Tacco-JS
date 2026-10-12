const acquireData = () => require("node:fs").readFileSync("/dev/stdin", "utf8").trim();

const performCalculation = () => {
    const rawInputContent = acquireData();
    const primaryNumber = BigInt(rawInputContent);
    
    const scaleFactor = 1_000_000_000n;
    
    let outcomeSegments = [0, 0, scaleFactor.toString()];
    
    if (primaryNumber % scaleFactor === 0n) {
        outcomeSegments.push(0);
        outcomeSegments.push(0);
        outcomeSegments.push((primaryNumber / scaleFactor).toString());
    } else {
        outcomeSegments.push(1);
        const upperBoundDiv = (primaryNumber + scaleFactor - 1n) / scaleFactor;
        
        const deltaToNextMultiple = (upperBoundDiv * scaleFactor) - primaryNumber;
        
        outcomeSegments.push(deltaToNextMultiple.toString());
        outcomeSegments.push(upperBoundDiv.toString());
    }
    
    return outcomeSegments.join(" ");
};

console.log(performCalculation());