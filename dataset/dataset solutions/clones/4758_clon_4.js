process.stdin.resume();
process.stdin.setEncoding('utf8');

const operationMap = Object.freeze({
    'I': 1,
    'D': -1,
    '': -1 // Handles cases where the character sequence is shorter than the operation count
});

process.stdin.on('data', function (dataPacket) {
    const textLines = dataPacket.toString().split('\n');
    
    const totalOperations = parseInt(textLines[0], 10);
    const instructionString = textLines[1];

    const processingFunction = (currentAccumulator, indexValue) => {
        const currentInstructionChar = instructionString.charAt(indexValue);
        const effect = operationMap[currentInstructionChar];
        
        currentAccumulator.currentElevation += effect;
        currentAccumulator.highestElevation = Math.max(currentAccumulator.highestElevation, currentAccumulator.currentElevation);
        
        return currentAccumulator;
    };

    const initialLevelState = {
        currentElevation: 0,
        highestElevation: 0
    };

    const finalLevelMetrics = Array.from({ length: totalOperations }, (_, idx) => idx)
        .reduce(processingFunction, initialLevelState);

    console.log(finalLevelMetrics.highestElevation);
});