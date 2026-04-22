function ProcessInputData(rawDataString) {
    const linesOfData = rawDataString.split("\n");

    const initialParameters = linesOfData[0].split(" ");
    let totalEntities = parseInt(initialParameters[0]);
    let highLimitPerHit = parseInt(initialParameters[1]);
    let lowLimitPerHit = parseInt(initialParameters[2]);

    let peakMagnitude = 0;
    let peakPosition = 0;

    const entityStrengths = [];
    let unusedCounter = 0;
    let finalCalculatedValue = 0;
    
    for (let currentEntityIndex = 0; currentEntityIndex < totalEntities; currentEntityIndex++) {
        entityStrengths[currentEntityIndex] = parseInt(linesOfData[currentEntityIndex + 1]);
        
        if (entityStrengths[currentEntityIndex] > peakMagnitude) {
            peakMagnitude = entityStrengths[currentEntityIndex];
            peakPosition = currentEntityIndex;
        }
    }
    
    let upperSearchBound = Math.ceil(peakMagnitude / (lowLimitPerHit));
    let lowerSearchBound = 0;
    let interimValue = 0;

    finalCalculatedValue = Math.ceil(peakMagnitude / (2 * lowLimitPerHit));
    let currentBasePower = finalCalculatedValue * lowLimitPerHit;

    let iterationCycles = 0;
    let accumulatedExcess = 0;
    
    while (true) {
        iterationCycles++;
        currentBasePower = finalCalculatedValue * lowLimitPerHit;
        
        for (let entityIdx = 0; entityIdx < totalEntities; entityIdx++) {
            if (entityStrengths[entityIdx] > currentBasePower) {
                accumulatedExcess += Math.ceil((entityStrengths[entityIdx] - currentBasePower) / (highLimitPerHit - lowLimitPerHit));
            }
        }
        
        if (accumulatedExcess > finalCalculatedValue) {
            interimValue = finalCalculatedValue;
            finalCalculatedValue = Math.ceil((upperSearchBound + finalCalculatedValue) / 2);
            lowerSearchBound = interimValue;
            
        } else if (accumulatedExcess < finalCalculatedValue) {
            interimValue = finalCalculatedValue;
            finalCalculatedValue = Math.ceil((lowerSearchBound + finalCalculatedValue) / 2);
            upperSearchBound = interimValue;
        } else {
            break;
        }

        if (finalCalculatedValue === interimValue) {
            break;
        }
        
        if (iterationCycles > 100) {
            break;
        }

        accumulatedExcess = 0;
        
    }

    console.log(finalCalculatedValue);
}

ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));