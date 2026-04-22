var lineProcessor = require('readline').createInterface({
    input:  process.stdin,
    output: process.stdout
});
var inputHandler;
var receivedLines = [];
lineProcessor.on('line', function(currentLine){
    receivedLines.push(currentLine);
});
lineProcessor.on('close', function(){
    inputHandler = setupInputProcessor(receivedLines);
    console.error("\n");
    var startTime = Date.now();
    solveProblem();
    var duration = Date.now() - startTime;
    reportError("elapsed time : " + (duration) + "ms");
    reportError("memory usage : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});

function replicateData(sourceObject){
    return JSON.parse(JSON.stringify(sourceObject));
}
function parseIntegerInput(){
    return transformData(retrieveNextLine(), 1);
}
function parseStringList(){
    return transformData(retrieveNextLine(), 2);
}
function parseIntegerList(){
    return transformData(retrieveNextLine(), 4);
}
function parseCharacterList(){
    return transformData(retrieveNextLine(), 6);
}
function retrieveNextLine(){
    return inputHandler.fetchNextItem();
}
function moreDataAvailable(){
    return inputHandler.canAdvance();
}

function setupInputProcessor(contentList){
    var dataProcessor = {
        sourceLines : contentList,
        lineIndex   : 0,
        totalLines  : contentList.length,
        canAdvance  : function(){
            return (this.lineIndex < this.totalLines);
        },
        fetchNextItem : function(){
            if (!this.canAdvance()){
                throw "InputError: No further input entries are present.";
            } else {
                var currentEntry = this.sourceLines[this.lineIndex++];
                return currentEntry;
            }
        }
    };
    return dataProcessor;
}
function printResult(messageContent){
    console.log(messageContent);
}
function reportError(errorDetails){
    console.error("debug output: " + require("util").inspect(errorDetails, false, null));
}

// This function performs various data type conversions based on a given format code.
//  1: Converts the input to an integer.
//  2: Splits the input string by spaces into an array of strings.
//  4: Splits the input string by spaces and converts each part to a number.
//  6: Splits the input string into an array of individual characters.
//  7: Splits the input string into characters and converts each to a number.
//  8: Joins an array of elements with spaces.
//  9: Joins an array of elements with newline characters.
//  0: Joins an array of elements without any separator.
//  Any other code or error: Returns the original input value.
function transformData(inputValue, formatCode){
    try {
        switch(formatCode){
            case 1: return parseInt(inputValue);
            case 2: return inputValue.split(" ");
            case 4: return inputValue.split(" ").map(Number);
            case 6: return inputValue.split("");
            case 7: return inputValue.split("").map(Number);
            case 8: return inputValue.join(" ");
            case 9: return inputValue.join("\n");
            case 0: return inputValue.join("");
            default: return inputValue;
        }
    } catch(err) {
        return inputValue;
    }
}

function solveProblem(){
    var configValues = parseIntegerList();
    var liquidFactorA = configValues[0] * 100;
    var liquidFactorB = configValues[1] * 100;
    var solidFactorA  = configValues[2];
    var solidFactorB  = configValues[3];
    var saturationLimit = configValues[4];
    var overallCapacity = configValues[5];

    var peakDensity = 0;
    var resultPair  = [0, 0];

    var liquidCombinations = new Set();
    var solidCombinations  = new Set();

    var maximumIterations = 3000;

    // Iterate through potential coefficients for creating various liquid and solid amounts.
    for (var countX = 0; countX <= maximumIterations; countX++) {
        for (var countY = 0; countY <= maximumIterations; countY++) {
            var solventQuantity = liquidFactorA * countX + liquidFactorB * countY;
            var soluteQuantity  = solidFactorA  * countX + solidFactorB  * countY;

            if (solventQuantity <= overallCapacity) {
                liquidCombinations.add(solventQuantity);
            }
            if (soluteQuantity <= overallCapacity) {
                solidCombinations.add(soluteQuantity);
            }
        }
    }
    
    var availableLiquids = Array.from(liquidCombinations);
    var availableSolids  = Array.from(solidCombinations);

    // Calculate concentrations for all valid liquid and solid combinations.
    for (var idxA = 0; idxA < availableLiquids.length; idxA++) {
        for (var idxB = 0; idxB < availableSolids.length; idxB++) {
            var currentLiquid = availableLiquids[idxA];
            var currentSolid  = availableSolids[idxB];
            
            // Check if the combined weight is within total capacity and if the solid dissolves.
            if (currentLiquid + currentSolid <= overallCapacity && isSoluble(currentLiquid, currentSolid, saturationLimit)) {
                var combinedWeight = currentLiquid + currentSolid;
                if (combinedWeight === 0) {
                    continue;
                }
                var mixDensity = currentSolid * 100 / combinedWeight;
                if (mixDensity > peakDensity) {
                    peakDensity = mixDensity;
                    resultPair[0] = combinedWeight;
                    resultPair[1] = currentSolid;
                }
            }
        }
    }
    
    printResult(transformData(resultPair, 8));
}

// Checks if the amount of solute can be fully dissolved in the solvent,
// given a specific saturation limit.
function isSoluble(solventQuantity, soluteQuantity, saturationLimit){
    var allowedSolidAmount = solventQuantity / 100 * saturationLimit;
    return allowedSolidAmount >= soluteQuantity;
}