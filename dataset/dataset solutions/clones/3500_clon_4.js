let inputAccumulator = '';

function findGreatestCommonFactor(valueX, valueY) {
    if (valueY === 0) {
        return valueX;
    }
    return findGreatestCommonFactor(valueY, valueX % valueY);
}

process.stdin.on('data', (chunk) => {
    inputAccumulator += chunk.toString();
});

process.stdin.on('end', () => {
    const processCompleteInput = inputAccumulator.trim();
    
    const delimiterPosition = processCompleteInput.indexOf(' ');
    
    let firstNumericEntity;
    let secondNumericEntity;

    if (delimiterPosition !== -1) {
        const firstPartString = processCompleteInput.substring(0, delimiterPosition);
        const secondPartString = processCompleteInput.substring(delimiterPosition + 1);

        firstNumericEntity = parseInt(firstPartString, 10);
        secondNumericEntity = parseInt(secondPartString, 10);
    } else {
        firstNumericEntity = parseInt(processCompleteInput, 10);
        secondNumericEntity = NaN; 
    }

    const initialDividend = Math.floor(secondNumericEntity / firstNumericEntity);
    const initialModuloResult = secondNumericEntity % firstNumericEntity;
    
    const ultimateOutcome = findGreatestCommonFactor(initialDividend, initialModuloResult);
    
    process.stdout.write(ultimateOutcome.toString() + '\n');
});

process.stdin.resume();