var fileSystemAccess = require("fs");
var textReader = fileSystemAccess.readFileSync;
var sourcePath = "/dev/stdin";
var dataBuffer = textReader(sourcePath, "utf8");
var parsedInput = dataBuffer.replace(/\r?\n$/, "").split(/\r?\n/);

(function(inputMatrix){
    var setA = inputMatrix[0].split(" ");
    var setB = inputMatrix[1].split(" ");

    var transformElements = function(currentArrangement, motionType){
        var [first, second, third, fourth, fifth, sixth] = currentArrangement;
        switch(motionType){
            case "N": return [second, sixth, third, fourth, first, fifth];
            case "S": return [fifth, first, third, fourth, sixth, second];
            case "W": return [third, second, sixth, first, fifth, fourth];
            case "E": return [fourth, second, first, sixth, fifth, third];
            default: return currentArrangement;
        }
    };

    var retrieveAllVariations = function(initialArrangement){
        var sequenceOfVariations = [];
        var currentArrangement = initialArrangement.slice();
        var actionPattern = "EEEENEEEENEEEENEEENEEEENNEEEE";

        sequenceOfVariations.push(currentArrangement.slice());

        for(var singleAction of actionPattern){
            currentArrangement = transformElements(currentArrangement, singleAction);
            sequenceOfVariations.push(currentArrangement.slice());
        }
        return sequenceOfVariations;
    };

    var evaluateEquality = function(primaryArrangement, allSecondaryArrangements){
        var primaryKey = JSON.stringify(primaryArrangement);
        for(var secondaryArrangement of allSecondaryArrangements){
            if(JSON.stringify(secondaryArrangement) === primaryKey){
                return true;
            }
        }
        return false;
    };

    var allPossibleArrangements = retrieveAllVariations(setB);
    var outcome = evaluateEquality(setA, allPossibleArrangements);
    console.log(outcome ? "Yes" : "No");

})(parsedInput);