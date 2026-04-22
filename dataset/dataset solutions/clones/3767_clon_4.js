function calculateValue(textEntry) {
    const numericData = textEntry.match(/\d+/g).map(Number);
    
    const parameterA = numericData[0];
    const parameterB = numericData[1];
    
    const difference = parameterB - parameterA;
    
    const recursiveSummation = (limit, currentSum = 0) => {
        if (limit <= 0) {
            return currentSum;
        }
        return recursiveSummation(limit - 1, currentSum + limit);
    };
    
    const accumulatedValue = recursiveSummation(difference);
    
    return accumulatedValue - parameterB;
}