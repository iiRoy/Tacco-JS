const fileSystemAccess = require('fs');
const terminalLogger = console;

function computeOptimalDifference(inputDataStream) {
    const cleanedEntry = inputDataStream.trim();
    let smallestAbsoluteDeviation = Number.MAX_SAFE_INTEGER;
    
    const targetNumericalValue = 753;
    const segmentSize = 3;
    
    for (let currentPosition = 0; currentPosition <= cleanedEntry.length - segmentSize; ++currentPosition) {
        const textPortion = cleanedEntry.substring(currentPosition, currentPosition + segmentSize);
        
        const convertedNumber = parseInt(textPortion, 10);
        
        if (!isNaN(convertedNumber)) {
            const currentDeviation = Math.abs(convertedNumber - targetNumericalValue);
            
            smallestAbsoluteDeviation = Math.min(smallestAbsoluteDeviation, currentDeviation);
        }
    }
    
    return String(smallestAbsoluteDeviation);
}

function initiateProcessing() {
    const standardInputContent = fileSystemAccess.readFileSync('/dev/stdin', 'utf8');
    
    const finalResultString = computeOptimalDifference(standardInputContent);
    
    terminalLogger.log(finalResultString);
}

initiateProcessing();